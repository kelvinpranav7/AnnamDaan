import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { donationService } from "@/services/donationService";
import { statsService } from "@/services/statsService";
import { qrService } from "@/services/qrService";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { Html5Qrcode } from "html5-qrcode";

const KG_PER_MEAL = 0.25;
const CO2_PER_MEAL = 1.9;

export default function DonorDashboard() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  const [verifyingDonation, setVerifyingDonation] = useState<any | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [verifyingStatus, setVerifyingStatus] = useState(false);

  useEffect(() => {
    if (!verifyingDonation) {
      qrScannerRef.current = null;
      return;
    }

    let html5QrCode: Html5Qrcode | null = null;
    const timer = setTimeout(() => {
      const element = document.getElementById("donor-qr-reader");
      if (element) {
        try {
          html5QrCode = new Html5Qrcode("donor-qr-reader");
          qrScannerRef.current = html5QrCode;
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            async (decodedText: string) => {
              if (html5QrCode) {
                try {
                  await html5QrCode.stop();
                } catch (e) {
                  console.error("Error stopping scanner", e);
                }
              }
              await handleVerifyToken(decodedText);
            },
            () => {
              // Silent failure on frame scan failure
            }
          ).catch((err: any) => {
            console.warn("Failed to start scanner with environment camera, retrying with user camera...", err);
            if (html5QrCode) {
              html5QrCode.start(
                { facingMode: "user" },
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                },
                async (decodedText: string) => {
                  if (html5QrCode) {
                    try {
                      await html5QrCode.stop();
                    } catch (e) {
                      console.error("Error stopping scanner", e);
                    }
                  }
                  await handleVerifyToken(decodedText);
                },
                () => {
                  // Silent failure on frame scan failure
                }
              ).catch((err2: any) => {
                console.error("Failed to start scanner with user camera:", err2);
              });
            }
          });
        } catch (e) {
          console.error("Initialization error:", e);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((e: any) => console.error("Failed to stop scanner on unmount", e));
      }
    };
  }, [verifyingDonation]);

  async function handleVerifyToken(token: string) {
    if (!verifyingDonation) return;
    setVerifyingStatus(true);
    try {
      const res = await qrService.verify(token);
      if (res.ok) {
        if (res.payload?.donationId !== verifyingDonation.id) {
          toast.error("This QR code is for a different donation!");
          setVerifyingStatus(false);
          return;
        }
        qc.invalidateQueries({ queryKey: ["donations"] });
        qc.invalidateQueries({ queryKey: ["stats"] });
        toast.success("Handoff verified successfully! Donation completed.");
        setVerifyingDonation(null);
        setManualToken("");
      } else {
        toast.error(res.reason || "QR Code Verification Failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.reason || err?.response?.data?.error || "Verification failed");
    } finally {
      setVerifyingStatus(false);
    }
  }

  function handleManualVerify() {
    if (!manualToken.trim()) {
      toast.error("Please enter a token");
      return;
    }
    handleVerifyToken(manualToken.trim());
  }

  async function handleCloseScanner() {
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
      } catch (e) {
        console.error("Error stopping scanner on close:", e);
      }
    }
    setVerifyingDonation(null);
    setManualToken("");
  }

  const { data: donations = [] } = useQuery({
    queryKey: ["donations", "mine"],
    queryFn: donationService.list,
    refetchInterval: 3000,
  });
  const { data: impact } = useQuery({
    queryKey: ["stats", "impact"],
    queryFn: () => statsService.impact(),
    refetchInterval: 3000,
  });

  const [hiddenHistory, setHiddenHistory] = useState<string[]>([]);

  useEffect(() => {
    if (user?.uid) {
      try {
        const stored = localStorage.getItem(`ad_hidden_history_${user.uid}`);
        setHiddenHistory(stored ? JSON.parse(stored) : []);
      } catch (e) {
        console.error(e);
      }
    }
  }, [user?.uid]);

  function handleHideHistoryItem(id: string) {
    if (!window.confirm("Remove this item from your recent history view?")) return;
    const newHidden = [...hiddenHistory, id];
    setHiddenHistory(newHidden);
    if (user?.uid) {
      try {
        localStorage.setItem(`ad_hidden_history_${user.uid}`, JSON.stringify(newHidden));
        toast.success("Item removed from history");
      } catch (e) {
        console.error(e);
      }
    }
  }

  function handleClearHistory() {
    if (!window.confirm("Clear all items from your recent history view?")) return;
    const currentIds = history.map((h: any) => h.id);
    const newHidden = [...new Set([...hiddenHistory, ...currentIds])];
    setHiddenHistory(newHidden);
    if (user?.uid) {
      try {
        localStorage.setItem(`ad_hidden_history_${user.uid}`, JSON.stringify(newHidden));
        toast.success("Recent history cleared");
      } catch (e) {
        console.error(e);
      }
    }
  }

  async function handleDelete(id: string, foodType: string) {
    if (!window.confirm(`Delete "${foodType}"? This can't be undone.`)) return;
    try {
      await donationService.remove(id);
      qc.invalidateQueries({ queryKey: ["donations"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Donation deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete");
    }
  }

  async function handleUpdateStatus(id: string, status: "live" | "picked_up") {
    try {
      await donationService.updateStatus(id, status);
      qc.invalidateQueries({ queryKey: ["donations"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(status === "picked_up" ? "Donation marked as completed!" : "Donation marked as not completed.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update status.");
    }
  }

  const served = donations.filter((d) => d.status === "picked_up" && d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer");
  const meals = served.reduce((s, d) => s + (d.quantityMeals || 0), 0);
  const kg = Math.round(meals * KG_PER_MEAL);
  const co2 = Math.round(meals * CO2_PER_MEAL);

  const totalLivesTouched = impact?.mealsServed ?? 0;

  const active = donations.filter(
    (d) => (d.status === "live" || d.status === "accepted") && d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer"
  );
  const history = donations
    .filter((d) => d.status === "picked_up" && d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer" && !hiddenHistory.includes(d.id))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl">
      {/* Hero / Welcome Section */}
      <section className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">
            Welcome back, {user?.name || "Donor"}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {meals > 0
              ? `Your surplus has nourished over ${meals.toLocaleString()} lives. Truly sacred work.`
              : "List your first surplus food to start saving lives."}
          </p>
        </div>
        <Link
          to="/app/donor/new"
          className="bg-primary text-on-primary px-lg py-md rounded-xl font-headline-md text-headline-md flex items-center gap-sm shadow-md hover:brightness-110 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Post New Food
        </Link>
      </section>



      {/* Content Grid: Active Postings & Donation History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Active Postings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-headline-lg text-headline-lg">
              Active Postings
            </h2>
            <Link
              to="/app/donor/tracking"
              className="text-primary font-label-sm hover:underline"
            >
              View All
            </Link>
          </div>

          {active.length === 0 ? (
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl text-center text-on-surface-variant custom-card-shadow">
              No active postings — your live and accepted donations will appear
              here.
            </div>
          ) : (
            <div className="space-y-md">
              {active.slice(0, 4).map((d) => {
                const inTransit = d.status === "accepted";
                const expiry = new Date(d.pickupBy).getTime() - Date.now();
                const hoursLeft = Math.max(
                  0,
                  Math.round(expiry / (60 * 60 * 1000))
                );
                return (
                  <div
                    key={d.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col md:flex-row custom-card-shadow card-premium-hover"
                  >
                    <div
                      className="w-full md:w-48 h-48 md:h-auto bg-cover bg-center bg-surface-container"
                      style={{
                        backgroundImage: d.images?.[0]
                          ? `url('${d.images[0]}')`
                          : undefined,
                      }}
                    />
                    <div className="p-md flex-1">
                      <div className="flex justify-between items-start mb-sm">
                        <div>
                          <h3 className="font-headline-md text-headline-md mb-xs">
                            {d.foodType}
                          </h3>
                          <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                            <span className="material-symbols-outlined text-[16px]">
                              location_on
                            </span>
                            {d.location?.address || "—"}
                          </p>
                        </div>
                        <span
                          className={
                            inTransit
                              ? "bg-tertiary-container text-on-tertiary-container px-sm py-xs rounded-full font-label-sm"
                              : "bg-surface-container-high text-on-surface-variant px-sm py-xs rounded-full font-label-sm"
                          }
                        >
                          {inTransit ? "In Transit" : "Awaiting Pickup"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-md mt-md">
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            Quantity
                          </p>
                          <p className="font-body-md text-body-md font-bold">
                            {d.quantityMeals} people
                          </p>
                        </div>
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface-variant">
                            {inTransit ? "Pickup ETA" : "Expiry"}
                          </p>
                          <p
                            className={`font-body-md text-body-md font-bold ${
                              hoursLeft <= 4 && !inTransit ? "text-error" : ""
                            }`}
                          >
                            {hoursLeft} hours left
                          </p>
                        </div>
                      </div>
                      <div className="mt-md pt-md border-t border-outline-variant flex items-center justify-between gap-sm flex-wrap">
                        <p className="text-on-surface-variant font-label-sm italic">
                          {inTransit
                            ? "NGO is arranging pickup."
                            : "Nearby NGOs have been notified."}
                        </p>
                        <div className="flex items-center gap-md">
                          {inTransit && (
                            <>
                              <button
                                type="button"
                                onClick={() => setVerifyingDonation(d)}
                                className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-label-sm flex items-center gap-xs hover:bg-primary/95 transition-colors shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  qr_code_scanner
                                </span>
                                Scan NGO QR to Verify
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(d.id, "live")}
                                className="border border-outline text-on-surface hover:bg-surface-variant/30 px-3 py-1.5 rounded-lg font-label-sm flex items-center gap-xs transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  cancel
                                </span>
                                Donation Not Completed
                              </button>
                            </>
                          )}
                          {!inTransit && (
                            <>
                              <Link
                                to={`/app/donor/new?edit=${d.id}`}
                                className="text-primary font-label-sm flex items-center gap-xs hover:underline"
                                title="Edit this donation"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  edit
                                </span>
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(d.id, d.foodType)}
                                className="text-error font-label-sm flex items-center gap-xs hover:underline"
                                title="Delete this donation"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                                Delete
                              </button>
                            </>
                          )}
                          <Link
                            to="/app/donor/tracking"
                            className="text-primary font-label-sm flex items-center gap-xs"
                          >
                            Track
                            <span className="material-symbols-outlined">
                              arrow_forward
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donation History Sidebar */}
        <div className="lg:col-span-1">
          <h2 className="font-headline-lg text-headline-lg mb-md">
            Recent History
          </h2>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md custom-card-shadow">
            {history.length === 0 ? (
              <p className="text-on-surface-variant text-center py-md font-body-md">
                No completed pickups yet.
              </p>
            ) : (
              <div className="space-y-md">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="border-b last:border-b-0 pb-md last:pb-0 flex flex-col gap-xs"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface truncate max-w-[150px]">
                        {h.foodType}
                      </h4>
                      <div className="flex items-center gap-sm">
                        <span className="bg-success-container text-on-success-container px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            check_circle
                          </span>
                          Completed
                        </span>
                        <button
                          onClick={() => handleHideHistoryItem(h.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-0.5"
                          title="Hide from history"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Quantity: <span className="font-bold text-on-surface">{h.quantityMeals} people</span>
                    </p>
                    {h.location?.address && (
                      <p className="text-xs text-on-surface-variant flex items-center gap-xs mt-xs">
                        <span className="material-symbols-outlined text-[16px]">
                          location_on
                        </span>
                        <span className="truncate">{h.location.address}</span>
                      </p>
                    )}
                    {h.createdAt && (
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-xs">
                        Completed {formatDistanceToNow(new Date(h.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="w-full mt-lg py-sm text-primary font-bold border-2 border-primary rounded-lg hover:bg-primary-fixed transition-colors flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                Clear Recent History
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Handoff Verification Modal */}
      {verifyingDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant w-full max-w-lg rounded-2xl shadow-modal overflow-hidden p-6 relative flex flex-col gap-md">
            <button
              onClick={handleCloseScanner}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <div className="text-center">
              <span className="material-symbols-outlined text-[48px] text-primary mb-sm">
                qr_code_scanner
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                Verify Handoff QR Code
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
                Scan the secure pickup QR code presented by the NGO to verify their authorization and complete handoff for:
              </p>
              <p className="font-body-md text-body-md font-bold text-primary mt-xs">
                {verifyingDonation.foodType} ({verifyingDonation.quantityMeals} people)
              </p>
            </div>

            {/* Scanner Container */}
            <div className="w-full flex flex-col items-center justify-center bg-surface-container-low p-base rounded-xl border border-outline-variant">
              <div id="donor-qr-reader" className="w-full max-w-[320px] overflow-hidden rounded-lg bg-black" />
            </div>

            {/* Fallback Paste Input */}
            <div className="flex flex-col gap-sm border-t border-outline-variant pt-md">
              <label htmlFor="token-input" className="font-label-sm text-label-sm text-on-surface-variant">
                Or paste handoff token manually:
              </label>
              <div className="flex gap-sm">
                <input
                  id="token-input"
                  type="text"
                  placeholder="Enter secure token here..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="flex-1 px-md py-sm bg-surface border border-outline-variant rounded-lg font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={verifyingStatus}
                  className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {verifyingStatus ? "Verifying..." : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

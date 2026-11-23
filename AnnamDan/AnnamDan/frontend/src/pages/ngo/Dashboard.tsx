import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { donationService } from "@/services/donationService";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function NgoDashboard() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: donations = [], isLoading } = useQuery({
    queryKey: ["donations", "ngo"],
    queryFn: donationService.list,
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

  const received = donations.filter(
    (d) => d.status === "picked_up" && d.assignedNgoId === user?.uid && !hiddenHistory.includes(d.id)
  );

  const inTransit = donations.filter(
    (d) => d.status === "accepted" && d.assignedNgoId === user?.uid
  );

  const history = [...received]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

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

  async function handleUpdateStatus(id: string, status: "live" | "picked_up") {
    if (status === "live" && !window.confirm("Are you sure you want to cancel this pickup?")) return;
    try {
      await donationService.updateStatus(id, status);
      qc.invalidateQueries({ queryKey: ["donations"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(status === "picked_up" ? "Donation marked as completed!" : "Donation pickup cancelled.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update status.");
    }
  }

  const scope = user?.pincode
    ? `${user?.district || "Your district"} · ${user.pincode}`
    : user?.district || null;

  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl">
      {/* Dashboard Header */}
      <div className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">
            NGO Control Center
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Manage surplus food distribution and claim history.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Left Column: Active Rescues */}
        <div className="lg:col-span-8 space-y-lg">
          <section>
            <h2 className="font-headline-lg text-headline-lg mb-md">
              Active Rescues
            </h2>

            {isLoading ? (
              <div className="text-on-surface-variant font-body-md">Loading active rescues...</div>
            ) : inTransit.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center text-on-surface-variant custom-card-shadow font-body-md">
                No active claimed donations right now. Browse the public feed to claim surplus food.
              </div>
            ) : (
              <div className="space-y-md">
                {inTransit.map((d) => (
                  <div
                    key={d.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-wrap md:flex-nowrap items-center justify-between gap-md custom-card-shadow card-premium-hover"
                  >
                    <div className="flex items-center gap-md">
                      <div className="bg-primary-container text-on-primary h-12 w-12 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">
                          local_shipping
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md font-bold">
                          {d.foodType}
                        </h3>
                        <p className="text-on-surface-variant font-body-md mt-xs">
                          {d.quantityMeals} people · claimed from{" "}
                          <span className="font-bold text-on-surface">{d.donorName}</span>
                        </p>
                        <p className="text-on-surface-variant font-label-sm mt-xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {d.location?.address || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(d.id, "live")}
                        className="border border-outline text-on-surface hover:bg-surface-variant/30 px-3 py-2.5 rounded-lg font-label-sm flex items-center gap-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          cancel
                        </span>
                        Cancel Pickup
                      </button>
                      <Link
                        to="/app/ngo/scan"
                        className="bg-primary text-on-primary px-lg py-2.5 rounded-lg font-label-sm hover:opacity-95 transition-all shadow-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                        Verify Pickup
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recent History */}
        <div className="lg:col-span-4 space-y-lg">
          <section>
            <h2 className="font-headline-lg text-headline-lg mb-md">
              Recent History
            </h2>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md custom-card-shadow">
              {isLoading ? (
                <div className="text-on-surface-variant text-center py-md font-body-md">Loading history...</div>
              ) : history.length === 0 ? (
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
                          <span className="bg-secondary-container text-on-secondary px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
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
                        {h.quantityMeals} people · from {h.donorName}
                      </p>
                      {h.createdAt && (
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-xs">
                          Completed {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true })}
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
          </section>
        </div>
      </div>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { donationService } from "@/services/donationService";
import { qrService } from "@/services/qrService";
import { GeoMap } from "@/components/maps/GeoMap";

interface IssuedToken {
  token: string;
  issuedAt: number;
  expiresAt: number;
  donationId: string;
}

function useCountdown(expiresAt?: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const seconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { seconds, label: `${mm}:${ss}` };
}

export default function Scanner() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const { data: donations = [] } = useQuery({
    queryKey: ["donations", "ngo"],
    queryFn: donationService.list,
    refetchInterval: 3000,
  });

  // Active accepted donations for this NGO
  const accepted = useMemo(
    () =>
      donations.filter(
        (d) =>
          d.status === "accepted" &&
          (d.assignedNgoId === user?.uid || !d.assignedNgoId)
      ),
    [donations, user?.uid]
  );

  const [selectedId, setSelectedId] = useState<string>("");
  useEffect(() => {
    if (!selectedId && accepted[0]) setSelectedId(accepted[0].id);
  }, [accepted, selectedId]);

  const selected = useMemo(
    () => accepted.find((d) => d.id === selectedId) || accepted[0],
    [accepted, selectedId]
  );

  const [issued, setIssued] = useState<IssuedToken | null>(null);
  const [issuing, setIssuing] = useState(false);
  const countdown = useCountdown(issued?.expiresAt);

  // Reset issued token if user switches donation
  useEffect(() => {
    setIssued(null);
  }, [selectedId]);

  async function issueToken() {
    if (!selected || !user) return;
    if (!selected.location?.lat || !selected.location?.lng) {
      toast.error("This donation is missing location coordinates");
      return;
    }
    setIssuing(true);
    try {
      const { token } = await qrService.issue({
        donationId: selected.id,
        ngoId: user.uid,
        lat: selected.location.lat,
        lng: selected.location.lng,
      });
      setIssued({
        token,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000, // 30 min — matches backend
        donationId: selected.id,
      });
      toast.success("QR token issued · valid for 30 min");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to issue token");
    } finally {
      setIssuing(false);
    }
  }

  async function markPickedUp() {
    if (!selected) return;
    try {
      await donationService.updateStatus(selected.id, "picked_up");
      qc.invalidateQueries({ queryKey: ["donations"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Donation marked as picked up");
      setIssued(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update status");
    }
  }

  // No accepted donations → empty state
  if (accepted.length === 0) {
    return (
      <main className="px-gutter py-xl max-w-container-max mx-auto min-h-screen">
        <div className="mb-lg text-center md:text-left">
          <h1 className="font-display-lg text-display-lg text-primary mb-xs">
            Pickup Verification
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Secure QR-based handoff for accepted donations.
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl text-center impact-card-shadow">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">
            qr_code_2
          </span>
          <p className="font-headline-md text-headline-md text-on-surface mt-md">
            No accepted donations yet
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Accept a donation from the Food feed first, then come back here to issue
            the pickup QR.
          </p>
          <a
            href="/app/food"
            className="inline-block mt-lg bg-primary text-on-primary px-lg py-md rounded-xl font-headline-md text-headline-md"
          >
            View Food Feed
          </a>
        </div>
      </main>
    );
  }

  const lat = selected?.location?.lat ?? 0;
  const lng = selected?.location?.lng ?? 0;

  return (
    <main className="px-gutter py-xl max-w-container-max mx-auto min-h-screen">
      <div className="mb-lg text-center md:text-left">
        <h1 className="font-display-lg text-display-lg text-primary mb-xs">
          Pickup Verification
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Secure handoff for Batch {selected?.id || "—"}. Show the QR to the
          donor at pickup so they can release the food to you.
        </p>
      </div>

      {/* Batch selector if more than one accepted donation */}
      {accepted.length > 1 && (
        <div className="mb-md">
          <label
            htmlFor="batch"
            className="font-label-sm text-label-sm text-on-surface-variant block mb-xs"
          >
            Active batch
          </label>
          <select
            id="batch"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full max-w-sm px-md py-md bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none"
          >
            {accepted.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id} — {d.foodType} · {d.quantityMeals} meals
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md items-start">
        {/* Left Column — Identity + Map */}
        <div className="lg:col-span-4 space-y-md">
          {/* Status card */}
          <div className="bg-surface-container-low border border-outline-variant p-md rounded-xl">
            <div className="flex items-center gap-sm mb-md">
              <div className="bg-tertiary-container text-on-tertiary-container p-sm rounded-lg">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Current Status
                </p>
                <p className="font-headline-md text-headline-md text-tertiary">
                  {issued
                    ? "Token Issued"
                    : selected?.status === "accepted"
                    ? "Awaiting Pickup"
                    : "—"}
                </p>
              </div>
            </div>
            <div className="space-y-sm">
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/30">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Issued at
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-bold">
                  {issued
                    ? new Date(issued.issuedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-outline-variant/30">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Pickup Location
                </span>
                <span className="font-label-sm text-label-sm text-on-surface font-bold text-right max-w-[60%] truncate">
                  {selected?.location?.address || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-sm">
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Geofence
                </span>
                <span className="flex items-center gap-xs font-label-sm text-label-sm text-on-primary-fixed-variant">
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  250m radius
                </span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative h-[300px] w-full rounded-xl overflow-hidden border border-outline-variant">
            <GeoMap
              height="100%"
              zoom={15}
              markers={
                lat && lng
                  ? [
                      {
                        id: selected!.id,
                        lat,
                        lng,
                        title: selected!.donorName,
                        subtitle: selected!.location?.address || "",
                      },
                    ]
                  : []
              }
            />
            <div className="absolute bottom-md left-md right-md bg-black/60 backdrop-blur-md text-white p-md rounded-lg pointer-events-none">
              <p className="font-label-sm text-label-sm opacity-80">
                Pickup Coordinates
              </p>
              <p className="font-body-md text-body-md font-bold italic tracking-wide">
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — QR + Action */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md h-full">
            {/* QR Display */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <div className="mb-md">
                <h3 className="font-headline-md text-headline-md text-primary mb-xs">
                  Your Secure QR
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Show this code to the donor
                </p>
              </div>

              <div className="p-md bg-white border-4 border-primary/10 rounded-2xl mb-md">
                <div className="w-48 h-48 flex items-center justify-center relative">
                  {issued ? (
                    <QRCodeSVG
                      value={issued.token}
                      size={192}
                      level="H"
                      bgColor="#ffffff"
                      fgColor="#760009"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-surface-container flex items-center justify-center text-on-surface-variant text-center px-md">
                      <span className="text-sm">
                        Press "Generate Token" to issue a QR
                      </span>
                    </div>
                  )}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                </div>
              </div>

              <div className="space-y-sm w-full">
                <button
                  type="button"
                  onClick={issueToken}
                  disabled={issuing || !selected}
                  className="w-full flex items-center justify-center gap-sm bg-primary text-on-primary hover:bg-primary-container transition-colors py-md rounded-lg font-label-sm text-label-sm disabled:opacity-60"
                >
                  <span className="material-symbols-outlined">
                    {issued ? "refresh" : "qr_code_2"}
                  </span>
                  {issuing
                    ? "Generating…"
                    : issued
                    ? "Regenerate Token"
                    : "Generate Token"}
                </button>
                {issued && countdown && (
                  <p className="text-[12px] text-on-surface-variant italic">
                    {countdown.seconds > 0
                      ? `Expires in ${countdown.label} minutes`
                      : "Expired — regenerate"}
                  </p>
                )}
                {issued && (
                  <div className="w-full mt-sm flex flex-col gap-xs text-left bg-surface-container-low p-sm rounded-lg border border-outline-variant">
                    <span className="font-label-sm text-on-surface-variant">Manual Security Token:</span>
                    <div className="flex gap-xs">
                      <input
                        type="text"
                        readOnly
                        value={issued.token}
                        className="flex-1 text-xs px-xs py-1.5 bg-surface border border-outline rounded font-mono truncate"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(issued.token);
                          toast.success("Token copied to clipboard");
                        }}
                        className="bg-secondary text-on-secondary px-sm py-1.5 rounded text-xs hover:opacity-90 font-label-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-inverse-surface text-surface border border-outline p-md rounded-xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
              <div className="relative z-10 w-full flex flex-col h-full items-center justify-center text-center">
                <span className="material-symbols-outlined text-[64px] text-primary-fixed opacity-80 mb-md">
                  verified
                </span>
                <h3 className="font-headline-md text-headline-md text-primary-fixed mb-xs">
                  Automated Verification
                </h3>
                <p className="font-body-md text-body-md text-secondary-fixed max-w-[200px] mx-auto mb-lg">
                  Once the donor scans this code, the pickup is instantly confirmed.
                </p>
                <Link
                  to="/app/ngo"
                  className="bg-surface/10 hover:bg-surface/20 border border-surface/20 text-surface px-lg py-md rounded-xl font-label-sm flex items-center justify-center gap-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_back
                  </span>
                  Back to Dashboard
                </Link>
              </div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Log */}
      <div className="mt-xl">
        <div className="mb-md">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">
            Transparency Log
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Immutable record of this handoff chain
          </p>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container">
                <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Node
                </th>
                <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Identity
                </th>
                <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Action
                </th>
                <th className="px-md py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              <tr>
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">
                      store
                    </span>
                    <span className="font-body-md text-body-md font-bold">
                      Origin (Donor)
                    </span>
                  </div>
                </td>
                <td className="px-md py-md font-body-md text-body-md">
                  {selected?.donorName || "—"}
                </td>
                <td className="px-md py-md font-body-md text-body-md">
                  Surplus Registered
                </td>
                <td className="px-md py-md">
                  <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full text-[12px] font-bold">
                    COMMITTED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">
                      corporate_fare
                    </span>
                    <span className="font-body-md text-body-md font-bold">
                      Recipient (NGO)
                    </span>
                  </div>
                </td>
                <td className="px-md py-md font-body-md text-body-md">
                  {user?.name || "Your NGO"}
                </td>
                <td className="px-md py-md font-body-md text-body-md">
                  Donation Accepted
                </td>
                <td className="px-md py-md">
                  <span className="bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full text-[12px] font-bold">
                    COMMITTED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">
                      qr_code_2
                    </span>
                    <span className="font-body-md text-body-md font-bold">
                      Handoff Token
                    </span>
                  </div>
                </td>
                <td className="px-md py-md font-body-md text-body-md">
                  HMAC-SHA256, geofenced 250 m
                </td>
                <td className="px-md py-md font-body-md text-body-md">
                  {issued ? "Token issued · awaiting scan" : "Not yet issued"}
                </td>
                <td className="px-md py-md">
                  {issued ? (
                    <span className="bg-primary text-on-primary px-sm py-xs rounded-full text-[12px] font-bold">
                      ENCRYPTED
                    </span>
                  ) : (
                    <div className="flex items-center gap-xs">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-[12px] font-bold text-primary">
                        PENDING
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

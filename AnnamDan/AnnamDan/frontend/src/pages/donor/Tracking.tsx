import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { donationService } from "@/services/donationService";
import { GeoMap } from "@/components/maps/GeoMap";
import { geoapifyService, type RouteResult } from "@/services/geoapifyService";
import type { Donation } from "@/types";
import { useAuthStore } from "@/store/authStore";

type StepKey =
  | "posted"
  | "assigned"
  | "picked_up";

const STEPS: { key: StepKey; label: string; icon: string }[] = [
  { key: "posted", label: "Surplus Posted", icon: "post_add" },
  { key: "assigned", label: "NGO Assigned", icon: "corporate_fare" },
  { key: "picked_up", label: "Picked Up", icon: "inventory_2" },
];

function stepIndexFor(d: Donation): number {
  switch (d.status) {
    case "live":
      return 0; // Surplus Posted
    case "accepted":
      return 1; // NGO Assigned
    case "picked_up":
      return 2; // Picked Up
    case "expired":
      return 0;
    default:
      return 0;
  }
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Tracking() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { data: rawDonations = [], isLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: donationService.list,
    refetchInterval: 3000,
  });

  const donations = rawDonations.filter((d) => {
    if (user?.role === "volunteer") {
      // Volunteers track community food posts
      return d.source === "community" || d.donorType === "individual" || d.donorType === "volunteer";
    }
    // Donors track institutional food posts
    return d.source !== "community" && d.donorType !== "individual" && d.donorType !== "volunteer";
  });

  // Active donation is the one in transit (accepted) or most recent live.
  const active =
    donations.find((d) => d.status === "accepted") ||
    donations.find((d) => d.status === "live") ||
    donations[0];

  const [route, setRoute] = useState<RouteResult | null>(null);
  useEffect(() => {
    if (!active?.location?.lat) return;
    // Without a known NGO destination, we just center on the pickup.
    setRoute(null);
  }, [active?.id]);

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

  if (isLoading) {
    return (
      <main className="max-w-container-max mx-auto px-gutter py-lg">
        <div className="text-on-surface-variant font-body-md">Loading…</div>
      </main>
    );
  }

  if (!active) {
    return (
      <main className="max-w-container-max mx-auto px-gutter py-lg">
        <div className="mb-md">
          <button
            onClick={() => navigate(`/app/${user?.role || "donor"}`)}
            className="text-primary font-bold flex items-center gap-xs hover:underline mb-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Dashboard
          </button>
        </div>
        <div className="mb-xl">
          <h1 className="font-display-lg text-display-lg text-primary mb-xs">
            Track Your Impact
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Real-time journey of surplus reaching sacred smiles.
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-xl text-center impact-card-shadow">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">
            inventory_2
          </span>
          <p className="font-headline-md text-headline-md text-on-surface mt-md">
            No active donations
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Post surplus food to begin tracking its sacred journey.
          </p>
          <a
            href={user?.role === "volunteer" ? "/app/volunteer/new" : "/app/donor/new"}
            className="inline-block mt-lg bg-primary text-on-primary px-lg py-md rounded-xl font-headline-md text-headline-md"
          >
            Post New Food
          </a>
        </div>
      </main>
    );
  }

  const currentStep = stepIndexFor(active);
  const progress = currentStep === 0 ? 0 : (currentStep / (STEPS.length - 1)) * 100;
  const pickupBy = active.pickupBy ? new Date(active.pickupBy) : null;

  return (
    <main className="max-w-container-max mx-auto px-gutter py-lg">
      <div className="mb-md">
        <button
          onClick={() => navigate(`/app/${user?.role || "donor"}`)}
          className="text-primary font-bold flex items-center gap-xs hover:underline mb-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </button>
      </div>

      <div className="mb-xl text-center md:text-left">
        <h1 className="font-display-lg text-display-lg text-primary mb-xs">
          Track Your Impact
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Real-time journey of surplus reaching sacred smiles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">
        {/* Live Progress Tracker — full width */}
        <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-md impact-card-shadow">
          <div className="flex flex-col md:flex-row justify-between items-center mb-lg gap-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Batch {active.id}
              </h2>
              <span className="text-primary font-label-sm text-label-sm bg-primary-fixed px-sm py-xs rounded-full inline-block mt-1">
                {active.status === "accepted"
                  ? "LIVE TRACKING"
                  : active.status === "live"
                  ? "AWAITING PICKUP"
                  : active.status === "picked_up"
                  ? "COMPLETED"
                  : "EXPIRED"}
              </span>
            </div>
            <div className="text-right">
              <p className="font-label-sm text-label-sm text-secondary uppercase">
                {active.status === "picked_up"
                  ? "Delivered"
                  : "Estimated Delivery"}
              </p>
              <p className="font-headline-md text-headline-md text-tertiary-container">
                {pickupBy
                  ? `${formatTime(pickupBy.toISOString())} ${
                      pickupBy.toDateString() === new Date().toDateString()
                        ? "Today"
                        : pickupBy.toLocaleDateString()
                    }`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-surface-container-highest -translate-y-1/2 z-0" />
            <div
              className="hidden md:block absolute top-1/2 left-0 h-1 -translate-y-1/2 z-0"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #760009 0%, #991b1b 100%)",
              }}
            />

            {STEPS.map((s, i) => {
              const done = i < currentStep;
              const current = i === currentStep;
              return (
                <div
                  key={s.key}
                  className="relative z-10 flex flex-row md:flex-col items-center gap-sm bg-surface-container-lowest md:px-0"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      done
                        ? "bg-primary text-on-primary"
                        : current
                        ? "border-4 border-primary-container bg-primary text-on-primary animate-pulse"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <div className="text-left md:text-center">
                    <p
                      className={`font-label-sm text-label-sm ${
                        done || current
                          ? "text-primary"
                          : "text-on-surface-variant"
                      } ${current ? "font-bold" : ""}`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[12px] text-secondary">
                      {done
                        ? "Done"
                        : current
                        ? "In progress"
                        : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-8 h-[500px] rounded-xl overflow-hidden shadow-sm border border-outline-variant relative">
          <GeoMap
            height="100%"
            markers={
              active.location?.lat && active.location?.lng
                ? [
                    {
                      id: active.id,
                      lat: active.location.lat,
                      lng: active.location.lng,
                      title: active.donorName,
                      subtitle: `${active.quantityMeals} meals · ${active.foodType}`,
                    },
                  ]
                : []
            }
            route={route?.coordinates}
            zoom={14}
          />
        </div>

        {/* Side info */}
        <div className="lg:col-span-4 flex flex-col gap-md">
          {/* Delivery details */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md impact-card-shadow">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase mb-md">
              Delivery Details
            </h3>
            <div className="space-y-md">
              <div className="flex items-start gap-md">
                <span className="material-symbols-outlined text-primary mt-1">
                  restaurant
                </span>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface font-bold">
                    {active.donorName}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {active.foodType} · {active.quantityMeals} servings
                  </p>
                  {active.location?.address && (
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                        location_on
                      </span>
                      {active.location.address}
                    </p>
                  )}
                </div>
              </div>
              <div className="h-px bg-outline-variant" />
              <div className="flex items-start gap-md">
                <span className="material-symbols-outlined text-primary mt-1">
                  volunteer_activism
                </span>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface font-bold">
                    {active.assignedNgoId
                      ? "NGO assigned"
                      : "Awaiting NGO claim"}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {active.assignedNgoId
                      ? "Pickup will be delivered to their community kitchen."
                      : "Nearby NGOs have been notified."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md impact-card-shadow flex-grow">
            <h3 className="font-label-sm text-label-sm text-secondary uppercase mb-md">
              Timeline
            </h3>
            <div className="relative space-y-lg before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
              {STEPS.slice(0, currentStep + 1)
                .reverse()
                .map((s, i) => {
                  const isLatest = i === 0;
                  return (
                    <div key={s.key} className="relative pl-lg">
                      <div
                        className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white ${
                          isLatest ? "bg-primary" : "bg-primary-fixed"
                        }`}
                      />
                      <p className="font-label-sm text-label-sm text-on-surface font-bold">
                        {s.label}
                      </p>
                      <p className="text-[12px] text-on-surface-variant">
                        {s.key === "posted"
                          ? `Surplus listed and matched to platform`
                          : s.key === "assigned"
                          ? `NGO accepted; pickup being arranged`
                          : `Batch picked up from donor`}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {active.status !== "picked_up" && (
            <button
              type="button"
              onClick={() => handleDelete(active.id, active.foodType)}
              className="text-error font-label-sm text-label-sm py-md flex items-center justify-center gap-xs hover:underline"
            >
              <span className="material-symbols-outlined text-[18px]">
                delete
              </span>
              Cancel & delete this donation
            </button>
          )}
        </div>
      </div>

      {/* Impact CTA */}
      <div className="mt-xl bg-primary text-on-primary rounded-xl p-lg flex flex-col md:flex-row items-center justify-between gap-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="font-headline-lg text-headline-lg mb-xs">
            Your surplus, their sacred smile.
          </h3>
          <p className="font-body-lg text-body-lg opacity-90 max-w-xl">
            This delivery will provide nutritious meals for {active.quantityMeals}{" "}
            people today. Thank you for being the bridge.
          </p>
        </div>
        <div className="relative z-10 flex gap-md">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(
                `Annam Daan · just rescued ${active.quantityMeals} meals from ${active.donorName}.`
              );
              toast.success("Impact copied to clipboard");
            }}
            className="bg-white text-primary font-label-sm text-label-sm px-lg py-md rounded-full hover:bg-surface-container-lowest transition-colors shadow-lg"
          >
            Share Impact
          </button>
          <a
            href={user?.role === "volunteer" ? "/app/volunteer/new" : "/app/donor/new"}
            className="border border-white text-white font-label-sm text-label-sm px-lg py-md rounded-full hover:bg-white/10 transition-colors"
          >
            Donate More
          </a>
        </div>
      </div>

      {/* Other donations grid */}
      {donations.length > 1 && (
        <section className="mt-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">
            All donations · {donations.length}
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-md">
            {donations.map((d) => (
              <article
                key={d.id}
                className={`rounded-xl border border-outline-variant bg-surface-container-lowest impact-card-shadow overflow-hidden ${
                  d.id === active.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="h-32 bg-surface-container">
                  {d.images?.[0] && (
                    <img
                      src={d.images[0]}
                      alt={d.foodType}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {d.id}
                    </span>
                    <span
                      className={`font-label-sm text-label-sm px-sm py-xs rounded-full ${
                        d.status === "live"
                          ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                          : d.status === "accepted"
                          ? "bg-primary-fixed text-primary"
                          : d.status === "picked_up"
                          ? "bg-surface-container-high text-on-surface-variant"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md font-bold line-clamp-1">
                    {d.foodType}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {d.quantityMeals} meals · {formatTime(d.createdAt)}
                  </p>
                  {d.status !== "picked_up" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.foodType)}
                      className="mt-md text-error font-label-sm text-label-sm flex items-center gap-xs hover:underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

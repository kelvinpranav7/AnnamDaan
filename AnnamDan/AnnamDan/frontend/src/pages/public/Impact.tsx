import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/statsService";
import { donationService } from "@/services/donationService";
import { formatDistanceToNow } from "date-fns";
import { GeoMap } from "@/components/maps/GeoMap";

const GOAL_MEALS = 1_500_000;

export default function Impact() {
  const { data: impact } = useQuery({
    queryKey: ["stats", "impact"],
    queryFn: () => statsService.impact(),
  });
  const { data: live = [] } = useQuery({
    queryKey: ["donations", "public"],
    queryFn: () => donationService.listPublic(),
  });

  const meals = impact?.mealsServed ?? 0;
  const goalPercent = Math.min(100, Math.round((meals / GOAL_MEALS) * 100));
  const activeVolunteers = impact?.activeDonors ?? 0;
  const wastePreventedTons = Math.round((meals * 0.25) / 10) / 100; // meals*0.25kg → tons

  const recentLive = live
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <main className="max-w-container-max mx-auto px-gutter py-xl">
      {/* Impact Header */}
      <section className="mb-xl">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-xs">
          Impact Dashboard
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Visualizing the sacred journey of turning surplus into smiles across
          our communities.
        </p>
      </section>

      {/* Bento Grid: Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md mb-xl">
        {/* Primary Impact Metric */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant p-lg rounded-xl impact-card-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-lg">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
                Global Rescue Effort
              </span>
              <h2 className="font-headline-lg text-headline-lg mt-xs">
                Total Meals Served
              </h2>
            </div>
            <div className="bg-tertiary-fixed text-on-tertiary-fixed px-sm py-xs rounded-full flex items-center gap-xs font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[18px]">
                trending_up
              </span>
              Live count
            </div>
          </div>
          <div className="flex items-baseline gap-md">
            <span className="text-[64px] font-bold text-primary tracking-tight">
              {meals.toLocaleString()}
            </span>
            <span className="font-headline-md text-headline-md text-on-surface-variant">
              Meals Distributed
            </span>
          </div>
          <div className="mt-lg">
            <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-sm font-label-sm text-label-sm text-on-surface-variant">
              <span>Goal: {(GOAL_MEALS / 1_000_000).toFixed(1)}M Meals</span>
              <span>{goalPercent}% Achieved</span>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="md:col-span-4 flex flex-col gap-md">
          <div className="bg-primary-container p-lg rounded-xl flex flex-col justify-center h-full">
            <span className="material-symbols-outlined text-on-primary mb-md text-[32px]">
              groups
            </span>
            <div className="text-on-primary text-[40px] font-bold leading-none">
              {activeVolunteers.toLocaleString()}
            </div>
            <div className="text-on-primary/80 font-body-md text-body-md">
              Active Donors
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl impact-card-shadow flex flex-col justify-center h-full">
            <span className="material-symbols-outlined text-primary mb-md text-[32px]">
              eco
            </span>
            <div className="text-on-surface text-[40px] font-bold leading-none">
              {wastePreventedTons} Tons
            </div>
            <div className="text-on-surface-variant font-body-md text-body-md">
              Food Waste Prevented
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
        {/* Real-time Activity Feed */}
        <div className="lg:col-span-1 flex flex-col gap-md">
          <div className="flex items-center justify-between mb-xs">
            <h3 className="font-headline-md text-headline-md">Live Activity</h3>
            <span className="flex items-center gap-xs font-label-sm text-label-sm text-primary">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Live
            </span>
          </div>

          {recentLive.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl impact-card-shadow text-center text-on-surface-variant font-body-md">
              No live donations right now.
            </div>
          ) : (
            recentLive.map((d) => (
              <div
                key={d.id}
                className="bg-surface-container-lowest border border-outline-variant p-md rounded-xl impact-card-shadow transition-transform hover:-translate-y-1"
              >
                <div className="flex gap-md">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">
                      {formatDistanceToNow(new Date(d.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                    <p className="font-body-md text-body-md text-on-surface mt-xs font-semibold">
                      {d.donorName} donated {d.quantityMeals} meals
                    </p>
                    <p className="text-on-surface-variant font-label-sm text-[12px] mt-1">
                      {d.foodType}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          <button className="w-full py-md border-2 border-primary text-primary font-label-sm text-label-sm rounded-xl hover:bg-primary/5 transition-colors">
            View Full History
          </button>
        </div>

        {/* Network panel */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl impact-card-shadow overflow-hidden flex flex-col h-full">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-white">
              <div>
                <h3 className="font-headline-md text-headline-md">
                  Rescue Network
                </h3>
                <p className="text-on-surface-variant font-body-md text-body-md">
                  Active operations across your region
                </p>
              </div>
              <div className="flex gap-xs">
                <button className="p-sm rounded-lg border border-outline-variant hover:bg-surface transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button className="p-sm rounded-lg border border-outline-variant hover:bg-surface transition-colors">
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              </div>
            </div>
            <div className="relative flex-grow min-h-[400px] bg-surface-container overflow-hidden">
              <GeoMap
                height="100%"
                markers={live.map((d) => ({
                  id: d.id,
                  lat: d.location?.lat ?? 0,
                  lng: d.location?.lng ?? 0,
                  title: d.donorName,
                  subtitle: `${d.quantityMeals} meals · ${d.foodType}`,
                }))}
                zoom={live.length ? 11 : 4}
              />
              <div className="absolute top-md right-md bg-white p-md rounded-lg shadow-lg border border-outline-variant z-[1000]">
                <div className="flex items-center gap-md mb-sm">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="font-label-sm text-label-sm">
                    High Rescue Zone
                  </span>
                </div>
                <div className="flex items-center gap-md">
                  <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim" />
                  <span className="font-label-sm text-label-sm">
                    Expanding Network
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

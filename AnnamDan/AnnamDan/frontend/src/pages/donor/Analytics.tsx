import { KpiCard } from "@/components/dashboard/KpiCard";
import { DonationsChart } from "@/components/dashboard/DonationsChart";
import { FoodTypeDonut } from "@/components/dashboard/FoodTypeDonut";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/statsService";
import { donationService } from "@/services/donationService";
import { Leaf, Truck, Utensils } from "lucide-react";

const KG_PER_MEAL = 0.25;

export default function Analytics() {
  const { data: donations } = useQuery({
    queryKey: ["donations", "mine"],
    queryFn: () => donationService.list(),
  });
  const { data: responseTimes, isLoading: rtLoading } = useQuery({
    queryKey: ["stats", "response-times"],
    queryFn: () => statsService.responseTimes(),
  });

  const served = (donations ?? []).filter((d) => d.status === "picked_up");
  const mealsYtd = served.reduce((s, d) => s + (d.quantityMeals || 0), 0);
  const kgRescued = Math.round(mealsYtd * KG_PER_MEAL);

  const rt = responseTimes ?? [];
  const rtEmpty = !rtLoading && rt.every((p) => p.minutes === 0);
  const avgPickup = rt.length
    ? Math.round(rt.reduce((s, p) => s + p.minutes, 0) / Math.max(rt.filter((p) => p.minutes > 0).length, 1))
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground">
          Deep-dive into your rescue performance.
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Meals served" value={mealsYtd} icon={Utensils} tone="brand" />
        <KpiCard label="CO₂ avoided" value={Math.round(mealsYtd * 1.9)} icon={Leaf} suffix=" kg" tone="success" />
        <KpiCard label="Kg rescued" value={kgRescued} icon={Leaf} suffix=" kg" tone="success" />
        <KpiCard label="Avg pickup" value={avgPickup} icon={Truck} suffix=" min" tone="muted" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DonationsChart />
        </div>
        <FoodTypeDonut />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-card">
        <div className="font-display text-xl font-semibold">
          Pickup response · by hour
        </div>
        <div className="h-72 mt-4 relative">
          {rtEmpty && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground z-10 pointer-events-none">
              No pickup data yet
            </div>
          )}
          <ResponsiveContainer>
            <BarChart data={rt}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
              <XAxis dataKey="hour" fontSize={12} stroke="#888" />
              <YAxis fontSize={12} stroke="#888" />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Bar dataKey="minutes" fill="#8B0000" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

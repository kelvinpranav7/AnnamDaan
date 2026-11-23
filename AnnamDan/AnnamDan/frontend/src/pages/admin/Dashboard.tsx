import { KpiCard } from "@/components/dashboard/KpiCard";
import { DonationsChart } from "@/components/dashboard/DonationsChart";
import { FoodTypeDonut } from "@/components/dashboard/FoodTypeDonut";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  Utensils,
  ShieldCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/statsService";

export default function AdminDashboard() {
  const { data: impact } = useQuery({
    queryKey: ["stats", "impact"],
    queryFn: () => statsService.impact(),
    refetchInterval: 3000,
  });
  const { data: trend } = useQuery({
    queryKey: ["stats", "trend"],
    queryFn: () => statsService.trend(),
    refetchInterval: 3000,
  });

  const today = trend?.[trend.length - 1];
  const mealsToday = today?.meals ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Command center
          </h2>
          <p className="text-sm text-muted-foreground">
            Realtime platform health · AI signal · fraud monitoring.
          </p>
        </div>
        <Badge variant="success">All systems nominal</Badge>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Meals served · today"
          value={mealsToday}
          icon={Utensils}
          tone="brand"
        />
        <KpiCard
          label="Active donors"
          value={impact?.activeDonors ?? 0}
          icon={Building2}
          tone="warning"
        />
        <KpiCard
          label="Verified NGOs"
          value={impact?.activeNgos ?? 0}
          icon={ShieldCheck}
          tone="success"
        />
        <KpiCard
          label="Meals served · total"
          value={impact?.mealsServed ?? 0}
          icon={Users}
          tone="muted"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DonationsChart />
        </div>
        <FoodTypeDonut />
      </div>
    </div>
  );
}

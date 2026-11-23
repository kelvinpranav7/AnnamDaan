import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/statsService";

export function DonationsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "trend"],
    queryFn: () => statsService.trend(),
  });

  const series = data ?? [];
  const empty =
    !isLoading &&
    series.every((p) => p.donations === 0 && p.meals === 0);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Past 7 days</div>
          <div className="font-display text-xl font-semibold">
            Donations & meals
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Legend color="#8B0000" label="Donations" />
          <Legend color="#E57373" label="Meals" />
        </div>
      </div>
      <div className="h-72 mt-4 relative">
        {empty && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground z-10 pointer-events-none">
            No donations in the last 7 days
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="ad-donations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B0000" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8B0000" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ad-meals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E57373" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#E57373" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis dataKey="day" fontSize={12} stroke="#888" />
            <YAxis fontSize={12} stroke="#888" />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #eee",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
              }}
            />
            <Area
              type="monotone"
              dataKey="donations"
              stroke="#8B0000"
              strokeWidth={2.5}
              fill="url(#ad-donations)"
            />
            <Area
              type="monotone"
              dataKey="meals"
              stroke="#E57373"
              strokeWidth={2.5}
              fill="url(#ad-meals)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

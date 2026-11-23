import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/statsService";

const COLORS = ["#8B0000", "#A11212", "#C62828", "#E57373", "#FFCDD2", "#FFE0E0"];

export function FoodTypeDonut() {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "food-types"],
    queryFn: () => statsService.foodTypes(),
  });

  const slices = data ?? [];
  const empty = !isLoading && slices.length === 0;

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-card h-full">
      <div className="text-sm text-muted-foreground">Composition</div>
      <div className="font-display text-xl font-semibold">By food type</div>
      <div className="h-56 mt-2 flex items-center justify-center">
        {empty ? (
          <div className="text-sm text-muted-foreground">No donations yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {slices.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #eee",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <ul className="space-y-1.5 text-xs">
        {slices.map((f, i) => (
          <li key={f.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              {f.name}
            </span>
            <span className="font-medium">{f.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

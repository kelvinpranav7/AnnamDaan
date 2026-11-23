import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  suffix,
  prefix,
  tone = "brand",
  className,
}: {
  label: string;
  value: number;
  delta?: number;
  hint?: string;
  icon?: any;
  suffix?: string;
  prefix?: string;
  tone?: "brand" | "success" | "warning" | "muted";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: "from-brand-50 to-white text-brand-700",
    success: "from-emerald-50 to-white text-emerald-700",
    warning: "from-amber-50 to-white text-amber-700",
    muted: "from-secondary to-white text-foreground/70",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 shadow-card relative overflow-hidden",
        tones[tone],
        className
      )}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <div className="h-9 w-9 rounded-xl bg-white grid place-items-center shadow-sm">
            <Icon className="h-4 w-4" />
          </div>
        )}
        {typeof delta === "number" && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              delta >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {delta >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      {hint && (
        <div className="mt-2 text-xs text-muted-foreground/80">{hint}</div>
      )}
    </motion.div>
  );
}

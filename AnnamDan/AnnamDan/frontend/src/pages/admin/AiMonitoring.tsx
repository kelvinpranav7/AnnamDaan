import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Sparkles, ShieldCheck, Activity, Cpu } from "lucide-react";

export default function AiMonitoring() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            AI monitoring
          </h2>
          <p className="text-sm text-muted-foreground">
            OCR + CNN model health, latency, drift signals.
          </p>
        </div>
        <Badge variant="muted">Awaiting telemetry</Badge>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="OCR accuracy" value={0} suffix="%" icon={ShieldCheck} tone="success" />
        <KpiCard label="CNN accuracy" value={0} suffix="%" icon={Sparkles} tone="brand" />
        <KpiCard label="Avg OCR latency" value={0} suffix=" ms" icon={Activity} tone="muted" />
        <KpiCard label="Avg CNN latency" value={0} suffix=" ms" icon={Cpu} tone="warning" />
      </div>

      <div className="rounded-2xl border bg-white p-12 shadow-card text-center text-sm text-muted-foreground">
        No inference telemetry yet — AI service metrics will appear here once
        the OCR/CNN service starts serving requests.
      </div>
    </div>
  );
}

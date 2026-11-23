import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "white";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-9 w-9 shrink-0 rounded-xl bg-brand-gradient shadow-soft grid place-items-center">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
          <path
            d="M4 15c0-4 3.5-7 8-7s8 3 8 7H4z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          <circle cx="12" cy="6" r="2.2" fill="currentColor" />
          <path
            d="M3.5 17h17"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-white" />
      </div>
      <div className="leading-tight">
        <div
          className={cn(
            "font-display font-bold text-[17px] tracking-tight",
            variant === "white" ? "text-white" : "text-foreground"
          )}
        >
          Annam Daan
        </div>
        <div
          className={cn(
            "text-[10px] uppercase tracking-[0.16em] font-medium",
            variant === "white"
              ? "text-white/70"
              : "text-brand-700/70"
          )}
        >
          Surplus to Sacred Smiles
        </div>
      </div>
    </div>
  );
}

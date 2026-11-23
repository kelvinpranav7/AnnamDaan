import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PackagePlus,
  ListChecks,
  BarChart3,
  MapPin,
  QrCode,
  HeartHandshake,
  Users,
  ShieldCheck,
  Truck,
  Bell,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/store/authStore";

const NAV: Record<UserRole | "public", { to: string; label: string; icon: any }[]> = {
  donor: [
    { to: "/app/donor", label: "Overview", icon: LayoutDashboard },
    { to: "/app/donor/new", label: "Add donation", icon: PackagePlus },
    { to: "/app/donor/tracking", label: "Tracking", icon: ListChecks },
    { to: "/app/donor/analytics", label: "Analytics", icon: BarChart3 },
  ],
  ngo: [
    { to: "/app/ngo", label: "Overview", icon: LayoutDashboard },
    { to: "/app/ngo/needs", label: "Publish needs", icon: HeartHandshake },
    { to: "/app/ngo/scan", label: "QR pickup", icon: QrCode },
  ],
  volunteer: [
    { to: "/app/volunteer", label: "Assignments", icon: LayoutDashboard },
    { to: "/app/volunteer/route", label: "Live route", icon: Truck },
  ],
  public: [
    { to: "/app/public", label: "Feed", icon: LayoutDashboard },
    { to: "/app/public/needs", label: "Trust needs", icon: HeartHandshake },
  ],
  admin: [
    { to: "/app/admin", label: "Command center", icon: LayoutDashboard },
    { to: "/app/admin/users", label: "Users", icon: Users },
    { to: "/app/admin/ai", label: "AI monitoring", icon: Sparkles },
    { to: "/app/admin/verify", label: "Verifications", icon: ShieldCheck },
  ],
};

export function AppSidebar({ role }: { role: UserRole }) {
  const loc = useLocation();
  const items = NAV[role] ?? [];

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border/70 bg-white/70 backdrop-blur-xl">
      <div className="px-6 pt-6 pb-4">
        <Logo />
      </div>

      <div className="px-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground px-3 pb-2">
          Workspace
        </div>
        <nav className="space-y-1">
          {items.map((it) => {
            const active =
              loc.pathname === it.to ||
              (it.to !== `/app/${role}` && loc.pathname.startsWith(it.to));
            return (
              <NavLink key={it.to} to={it.to} end>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-gradient"
                    />
                  )}
                  <it.icon className="h-[18px] w-[18px]" />
                  {it.label}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-2xl bg-brand-gradient p-4 text-white relative overflow-hidden shadow-soft">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
          <Sparkles className="h-5 w-5 mb-3" />
          <div className="text-sm font-semibold mb-1">AI Safety v2</div>
          <p className="text-xs text-white/85 leading-relaxed">
            Every donation is screened in real time for freshness and shelf
            life.
          </p>
          <button className="mt-3 text-xs font-medium underline-offset-2 hover:underline">
            Learn more →
          </button>
        </div>
        <div className="flex items-center justify-between px-2 pt-4 text-xs text-muted-foreground">
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <HelpCircle className="h-3.5 w-3.5" /> Help
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <Bell className="h-3.5 w-3.5" /> Alerts
          </button>
        </div>
      </div>
    </aside>
  );
}

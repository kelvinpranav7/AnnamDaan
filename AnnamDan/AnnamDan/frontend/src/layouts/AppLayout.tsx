import { Navigate, Outlet, useLocation } from "react-router-dom";
import { StitchTopNav } from "@/components/layout/StitchTopNav";
import { StitchFooter } from "@/components/layout/StitchFooter";
import { useAuthStore, type UserRole } from "@/store/authStore";

export default function AppLayout({ role }: { role?: UserRole }) {
  const { user } = useAuthStore();
  const loc = useLocation();

  if (!user) {
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(loc.pathname)}`}
        replace
      />
    );
  }
  if (role && user.role !== role && user.role !== "admin") {
    return <Navigate to={`/app/${user.role}`} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <StitchTopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <StitchFooter />
    </div>
  );
}

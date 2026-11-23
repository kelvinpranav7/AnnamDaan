import { Outlet } from "react-router-dom";
import { StitchTopNav } from "@/components/layout/StitchTopNav";
import { StitchFooter } from "@/components/layout/StitchFooter";

export default function PublicLayout() {
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

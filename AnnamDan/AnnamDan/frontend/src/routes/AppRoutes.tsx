import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "@/layouts/PublicLayout";
import AppLayout from "@/layouts/AppLayout";

const About = lazy(() => import("@/pages/public/About"));
const Impact = lazy(() => import("@/pages/public/Impact"));
const HowItWorks = lazy(() => import("@/pages/public/HowItWorks"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const Forgot = lazy(() => import("@/pages/auth/Forgot"));
const Otp = lazy(() => import("@/pages/auth/Otp"));

const DonorDashboard = lazy(() => import("@/pages/donor/Dashboard"));
const NewDonation = lazy(() => import("@/pages/donor/NewDonation"));
const Tracking = lazy(() => import("@/pages/donor/Tracking"));
const DonorAnalytics = lazy(() => import("@/pages/donor/Analytics"));

const NgoDashboard = lazy(() => import("@/pages/ngo/Dashboard"));
const Needs = lazy(() => import("@/pages/ngo/Needs"));
const Scanner = lazy(() => import("@/pages/ngo/Scanner"));

const VolunteerDashboard = lazy(() => import("@/pages/volunteer/Dashboard"));
const VolunteerNewDonation = lazy(
  () => import("@/pages/volunteer/NewDonation")
);

const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AiMonitoring = lazy(() => import("@/pages/admin/AiMonitoring"));
const Verifications = lazy(() => import("@/pages/admin/Verifications"));

const FoodFeed = lazy(() => import("@/pages/Food"));

function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex items-center gap-3 text-on-surface-variant">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<Impact />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/otp" element={<Otp />} />

        {/* App */}
        <Route path="/app/donor" element={<AppLayout role="donor" />}>
          <Route index element={<DonorDashboard />} />
          <Route path="new" element={<NewDonation />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="analytics" element={<DonorAnalytics />} />
        </Route>

        <Route path="/app/ngo" element={<AppLayout role="ngo" />}>
          <Route index element={<NgoDashboard />} />
          <Route path="needs" element={<Needs />} />
          <Route path="scan" element={<Scanner />} />
        </Route>

        <Route path="/app/volunteer" element={<AppLayout role="volunteer" />}>
          <Route index element={<VolunteerDashboard />} />
          <Route path="new" element={<VolunteerNewDonation />} />
          <Route path="tracking" element={<Tracking />} />
        </Route>

        <Route path="/app/food" element={<AppLayout />}>
          <Route index element={<FoodFeed />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

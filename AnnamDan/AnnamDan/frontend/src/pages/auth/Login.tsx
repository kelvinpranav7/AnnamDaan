import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { api } from "@/api/client";
import { StitchTopNav } from "@/components/layout/StitchTopNav";
import { StitchFooter } from "@/components/layout/StitchFooter";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(data: Form) {
    const role = (params.get("role") as UserRole) || "donor";
    try {
      const { data: res } = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
        role,
      });
      setToken(res.token);
      setUser({
        uid: res.user.uid,
        name: res.user.name || data.email.split("@")[0],
        email: res.user.email,
        role: res.user.role,
        verified: !!res.user.verified,
        district: res.user.district,
        pincode: res.user.pincode,
      });
      toast.success("Welcome back to Annam Daan");
      const from = params.get("from");
      nav(from || `/app/${res.user.role}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <StitchTopNav />

      <main className="flex-grow flex items-center justify-center pt-xl pb-xl px-gutter">
        <div className="w-full max-w-[480px] bg-white rounded-[32px] p-xl shadow-[0px_12px_40px_rgba(153,27,27,0.04)] border border-outline-variant/30 flex flex-col items-center">
          {/* Brand Identity Anchor */}
          <div className="text-center mb-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-2">
              Welcome Back
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your surplus creates a sacred smile today.
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-md"
            noValidate
          >
            <div className="space-y-xs">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant ml-1"
                htmlFor="email"
              >
                Email <span className="text-error font-bold">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline-variant"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-error font-label-sm text-label-sm ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-xs">
              <label
                className="font-label-sm text-label-sm text-on-surface-variant ml-1"
                htmlFor="password"
              >
                Password <span className="text-error font-bold">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md placeholder:text-outline-variant"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-error font-label-sm text-label-sm ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer"
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant group-hover:text-on-surface">
                  Keep me logged in
                </span>
              </label>
              <Link
                to="/forgot"
                className="font-label-sm text-label-sm text-primary hover:underline transition-all"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-container text-on-primary py-4 rounded-xl font-headline-md text-headline-md shadow-lg hover:shadow-xl transition-all active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Bottom Action Cluster */}
          <div className="mt-xl text-center space-y-md w-full">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px bg-outline-variant flex-grow" />
              <span className="font-label-sm text-label-sm text-outline-variant">
                OR CONTINUE WITH
              </span>
              <div className="h-px bg-outline-variant flex-grow" />
            </div>
            <div className="grid grid-cols-2 gap-md w-full">
              <button
                type="button"
                onClick={() => toast("Google OAuth via Firebase — coming soon")}
                className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-xl hover:bg-surface transition-colors font-label-sm text-label-sm"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#FFC107"
                    d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.1z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2c-.4.4 6.7-4.9 6.7-14.8 0-1.3-.1-2.4-.4-3.5z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => nav("/login?role=ngo")}
                className="flex items-center justify-center gap-2 py-3 border border-outline-variant rounded-xl hover:bg-surface transition-colors font-label-sm text-label-sm"
              >
                <span
                  className="material-symbols-outlined text-[20px] ms-fill"
                >
                  favorite
                </span>
                NGO ID
              </button>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant pt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}

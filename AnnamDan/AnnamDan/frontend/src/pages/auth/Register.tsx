import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore, type UserRole } from "@/store/authStore";
import { api } from "@/api/client";
import { StitchTopNav } from "@/components/layout/StitchTopNav";
import { StitchFooter } from "@/components/layout/StitchFooter";
import { geoapifyService } from "@/services/geoapifyService";

const schema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().min(1, "Email Address is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required").min(10, "Enter a valid phone"),
  password: z.string().min(6, "At least 6 characters"),
  district: z.string().trim().min(2, "District required"),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, "Enter a valid pincode"),
});
type Form = z.infer<typeof schema>;

type StitchRole = "volunteer" | "donor" | "ngo";

const ROLE_TO_USERROLE: Record<StitchRole, UserRole> = {
  volunteer: "volunteer",
  donor: "donor",
  ngo: "ngo",
};

const ROLES: { id: StitchRole; label: string; icon: string; desc: string }[] = [
  {
    id: "donor",
    label: "Donor",
    icon: "volunteer_activism",
    desc: "Hotels, halls, caterers",
  },
  {
    id: "volunteer",
    label: "Volunteer",
    icon: "person",
    desc: "Donate small amounts from home",
  },
  {
    id: "ngo",
    label: "NGO",
    icon: "corporate_fare",
    desc: "Receive & redistribute",
  },
];

export default function Register() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const paramRole = params.get("role");
  const initialRole: StitchRole = ROLES.some((r) => r.id === paramRole)
    ? (paramRole as StitchRole)
    : "donor";
  const [role, setRole] = useState<StitchRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [pinLookup, setPinLookup] = useState<"idle" | "loading" | "ok" | "fail">(
    "idle"
  );
  const pinDebounce = useRef<number | undefined>(undefined);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function handlePincodeChange(raw: string) {
    const cleaned = raw.replace(/\D/g, "").slice(0, 8);
    setValue("pincode", cleaned, { shouldValidate: cleaned.length >= 4 });
    window.clearTimeout(pinDebounce.current);
    if (!/^\d{6}$/.test(cleaned)) {
      setPinLookup("idle");
      return;
    }
    setPinLookup("loading");
    pinDebounce.current = window.setTimeout(async () => {
      try {
        const r = await geoapifyService.lookupPincode(cleaned);
        if (r?.district) {
          setValue("district", r.district, { shouldValidate: true });
          setPinLookup("ok");
        } else {
          setPinLookup("fail");
        }
      } catch {
        setPinLookup("fail");
      }
    }, 350);
  }

  async function onSubmit(data: Form) {
    if (!agreed) {
      toast.error("Please accept the Terms & Conditions to continue");
      return;
    }
    const userRole = ROLE_TO_USERROLE[role];
    try {
      const { data: res } = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: userRole,
        district: data.district,
        pincode: data.pincode,
      });
      setToken(res.token);
      setUser({
        uid: res.user.uid,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        role: res.user.role,
        verified: !!res.user.verified,
        district: res.user.district,
        pincode: res.user.pincode,
      });
      toast.success("Account created · welcome to Annam Daan");
      nav(`/app/${userRole}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Registration failed");
    }
  }

  return (
    <div className="bg-background text-on-surface antialiased">
      <StitchTopNav />

      <main className="min-h-screen lg:flex">
        {/* Left Side: Inspiring Visuals & Branding */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-xl overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Community Service"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOt6fu0A1AZ4mqpbaKZHAsy2ACmJM5f00IU-F6ahP3j1IU8O3ZrkqRxTOqR4mcBRVKWU9xeQwxbOjKEuNea1ZDttlwW_SU212bZLldSSEJnRwRTiUMT9WLT5Ki7zoEjGn4R6kJD1ONR_-SEo_H1DHEjRWC7qDXvR6Pbve6Mr4A4aGeP9pvc4FpYmS5Up19qpdMLch33SxM0gSnwceXF2s6_voZ4rzhgDnt4KT7NUAPhiYO8yd_-hsSZG-Zb1GH23Hbg0cl06pnABw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(118, 0, 9, 0.9) 0%, rgba(65, 0, 2, 0.7) 100%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h1 className="font-display-lg text-display-lg text-white max-w-lg mb-md leading-tight">
                Turn Surplus into Sacred Smiles.
              </h1>
              <p className="font-body-lg text-body-lg text-white/90 max-w-md leading-relaxed">
                Join our premium network of donors and volunteers dedicated to
                eradicating food waste and ensuring no one goes hungry.
                Dignified service starts with you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-md w-full max-w-md">
              <div className="p-md bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <span className="material-symbols-outlined text-white mb-base text-3xl">
                  volunteer_activism
                </span>
                <p className="font-headline-md text-white">50k+</p>
                <p className="font-label-sm text-white/80">Meals Served</p>
              </div>
              <div className="p-md bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <span className="material-symbols-outlined text-white mb-base text-3xl">
                  groups
                </span>
                <p className="font-headline-md text-white">12k</p>
                <p className="font-label-sm text-white/80">Volunteers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="flex-1 flex items-center justify-center p-gutter lg:p-xl bg-background">
          <div className="w-full max-w-[520px] bg-white p-lg lg:p-xl rounded-[40px] shadow-[0px_24px_80px_rgba(118,0,9,0.08)] border border-outline-variant/10">
            <div className="mb-lg">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
                Create Account
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Step into a world of purposeful giving.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-md"
              noValidate
            >
              {/* Role selector */}
              <div className="space-y-sm mb-lg">
                <label className="font-label-sm text-label-sm text-on-surface-variant font-bold tracking-wide uppercase">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map((r) => {
                    const selected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`flex flex-col items-center justify-center py-4 px-2 border-2 rounded-2xl transition-all ${
                          selected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-outline-variant/30 hover:border-primary/50"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined mb-2 ${
                            selected ? "text-primary" : "text-on-surface-variant"
                          }`}
                        >
                          {r.icon}
                        </span>
                        <span
                          className={`font-label-sm text-label-sm font-bold ${
                            selected ? "text-primary" : "text-on-surface-variant"
                          }`}
                        >
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-md">
                <div className="space-y-xs">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant ml-1"
                    htmlFor="full_name"
                  >
                    Full Name <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                      person
                    </span>
                    <input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md outline-none"
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-error font-label-sm text-label-sm ml-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-xs">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant ml-1"
                    htmlFor="email"
                  >
                    Email Address <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                      mail
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md outline-none"
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
                    htmlFor="phone"
                  >
                    Phone <span className="text-error font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                      call
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="98xxxxxxxx"
                      className="w-full pl-12 pr-4 py-4 bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md outline-none"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-error font-label-sm text-label-sm ml-1">
                      {errors.phone.message}
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
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                      lock
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md outline-none"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-error font-label-sm text-label-sm ml-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Location — used to match NGOs with nearby donations */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label
                      className="font-label-sm text-label-sm text-on-surface-variant ml-1"
                      htmlFor="district"
                    >
                      District <span className="text-error font-bold">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                        location_city
                      </span>
                      <input
                        id="district"
                        type="text"
                        placeholder="Chennai"
                        className="w-full pl-12 pr-4 py-4 bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md outline-none"
                        {...register("district")}
                      />
                    </div>
                    {errors.district && (
                      <p className="text-error font-label-sm text-label-sm ml-1">
                        {errors.district.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-xs">
                    <label
                      className="font-label-sm text-label-sm text-on-surface-variant ml-1"
                      htmlFor="pincode"
                    >
                      Pincode <span className="text-error font-bold">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40">
                        pin_drop
                      </span>
                      <input
                        id="pincode"
                        type="text"
                        inputMode="numeric"
                        placeholder="600001"
                        className="w-full pl-12 pr-4 py-4 bg-surface-bright border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md outline-none"
                        {...register("pincode")}
                      />
                    </div>
                    {errors.pincode && (
                      <p className="text-error font-label-sm text-label-sm ml-1">
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant px-1">
                  {role === "ngo"
                    ? "Donations posted in this district/pincode will appear in your dashboard."
                    : "Helps nearby NGOs find your donation faster."}
                </p>
              </div>

              <div className="flex items-start gap-sm pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-primary border-outline-variant rounded-lg focus:ring-primary/30"
                />
                <label
                  className="font-label-sm text-label-sm text-on-surface-variant leading-snug"
                  htmlFor="terms"
                >
                  I agree to the{" "}
                  <a className="text-primary hover:underline font-bold" href="#">
                    Terms and Conditions
                  </a>{" "}
                  and the privacy policy of Annam Daan.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary py-4 rounded-2xl font-headline-md text-headline-md shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.99] mt-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating account…" : "Create Account"}
              </button>

              <div className="pt-lg text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-bold hover:underline transition-all"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
}

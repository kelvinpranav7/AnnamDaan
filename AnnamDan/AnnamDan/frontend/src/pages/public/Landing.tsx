import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MapPinned,
  QrCode,
  Activity,
  Heart,
  CheckCircle2,
  BadgeCheck,
  Leaf,
  Utensils,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/statsService";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export default function Landing() {
  const { data: impact } = useQuery({
    queryKey: ["stats", "impact"],
    queryFn: () => statsService.impact(),
  });
  const m = impact ?? {
    mealsServed: 0,
    kgRescued: 0,
    activeNgos: 0,
    cities: 0,
  };

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-radial" />
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 lg:pt-28 lg:pb-40">
          <motion.div {...fadeUp} className="flex justify-center mb-6">
            <Badge variant="default" className="px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered food rescue
            </Badge>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            From <span className="text-gradient">surplus</span> to
            <br className="hidden md:block" /> sacred{" "}
            <span className="text-gradient">smiles.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-6 max-w-2xl mx-auto text-center text-lg text-muted-foreground leading-relaxed"
          >
            Annam Daan connects hotels, wedding halls, caterers, NGOs and
            volunteers in real time — so no plate of safe, prepared food ever
            goes to waste.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <Button asChild size="xl">
              <Link to="/register">
                Donate surplus food <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/register?role=ngo">I'm an NGO / Trust</Link>
            </Button>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="h-4 w-4 text-brand-700" /> FSSAI verified
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-700" /> AI safety
              screening
            </div>
            <div className="flex items-center gap-1.5">
              <MapPinned className="h-4 w-4 text-brand-700" /> Real-time
              matching
            </div>
            <div className="flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-brand-700" /> Encrypted QR pickup
            </div>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mt-20 relative"
          >
            <div className="absolute inset-x-10 -top-6 h-24 bg-brand-gradient blur-3xl opacity-30 rounded-full" />
            <HeroPreview />
          </motion.div>
        </div>
      </section>

      {/* ===== METRICS ===== */}
      <section className="mx-auto max-w-6xl px-6 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: "Meals served", value: m.mealsServed, suffix: "", icon: Utensils },
            { label: "Kg rescued", value: m.kgRescued, suffix: "", icon: Leaf },
            { label: "Active NGOs", value: m.activeNgos, suffix: "", icon: Heart },
            { label: "Cities live", value: m.cities, suffix: "", icon: MapPinned },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <m.icon className="h-5 w-5 text-brand-700" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Live
                </span>
              </div>
              <div className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-tight">
                <AnimatedCounter value={m.value} suffix={m.suffix} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="mx-auto max-w-6xl px-6 mt-32">
        <motion.div {...fadeUp} className="max-w-2xl">
          <Badge variant="default" className="mb-3">
            Platform
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Built for every link in the chain.
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            A single, secure platform for donors, NGOs, volunteers and the
            public — orchestrated by AI in real time.
          </p>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl border bg-white p-6 shadow-card hover:shadow-glow transition-all overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-50 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity" />
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-brand-gradient grid place-items-center text-white shadow-soft">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold text-lg">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
                <ul className="mt-4 space-y-2">
                  {f.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2 text-xs text-foreground/70"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-700 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="mx-auto max-w-6xl px-6 mt-32">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
          <Badge variant="default" className="mb-3">
            How it works
          </Badge>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Surplus, rescued in minutes.
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            Four orchestrated steps. Zero spoilage. Maximum dignity.
          </p>
        </motion.div>

        <div className="mt-14 relative">
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-brand-200 to-transparent" />
          <div className="space-y-12 md:space-y-20">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  i % 2 === 1 ? "md:[&>:first-child]:order-2" : ""
                }`}
              >
                <div className="rounded-2xl border bg-white p-6 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-gradient text-white text-sm font-bold">
                      {i + 1}
                    </span>
                    <h3 className="font-semibold text-xl">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                <StepIllustration index={i} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI TECH ===== */}
      <section id="ai" className="mt-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient" />
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light"
             style={{
               backgroundImage:
                 "radial-gradient(600px 300px at 80% 0%, rgba(255,255,255,0.4), transparent)",
             }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-white">
          <motion.div {...fadeUp} className="max-w-2xl">
            <Badge variant="solid" className="mb-3 bg-white/15 text-white border-0">
              <Sparkles className="h-3 w-3" /> AI Engine
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              The world's first food-rescue AI engine.
            </h2>
            <p className="mt-4 text-white/85 text-lg leading-relaxed">
              Two custom models work in concert to make every rescue safe,
              traceable and fast — from license verification to last-mile
              dispatch.
            </p>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <motion.div
              {...fadeUp}
              className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">OCR · FSSAI Validator</h3>
                <Badge variant="solid" className="bg-white text-brand-700">
                  Tesseract + CV
                </Badge>
              </div>
              <p className="mt-3 text-white/80 text-sm leading-relaxed">
                Auto-extracts license numbers, validates authenticity and
                flags forged documents — reducing onboarding from days to
                seconds.
              </p>
              <div className="mt-5 rounded-xl bg-black/30 p-4 font-mono text-xs">
                <div className="text-white/60">→ POST /ocr/extract</div>
                <div className="mt-1">
                  {"{ "}license: <span className="text-white">"FSSAI-10018011001234"</span>,{" "}
                  valid: <span className="text-emerald-300">true</span>,{" "}
                  confidence: <span className="text-emerald-300">0.987</span>{" "}
                  {"}"}
                </div>
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">CNN · Food Safety</h3>
                <Badge variant="solid" className="bg-white text-brand-700">
                  TensorFlow
                </Badge>
              </div>
              <p className="mt-3 text-white/80 text-sm leading-relaxed">
                Classifies every uploaded image as Fresh, Slightly stale or
                Unsafe — with shelf-life prediction and confidence scoring.
              </p>
              <div className="mt-5 space-y-2">
                {[
                  { label: "Fresh", v: 92, color: "bg-emerald-400" },
                  { label: "Slightly stale", v: 6, color: "bg-amber-400" },
                  { label: "Unsafe", v: 2, color: "bg-red-400" },
                ].map((b) => (
                  <div key={b.label} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span>{b.label}</span>
                      <span className="opacity-80">{b.v}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                      <div
                        className={`h-full ${b.color}`}
                        style={{ width: `${b.v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-5xl px-6 mt-32 mb-12">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl bg-brand-gradient p-10 md:p-16 text-white text-center shadow-glow"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Every plate has a destination.
            </h2>
            <p className="mt-4 text-white/85 max-w-xl mx-auto">
              Join 1,240+ donors and 286 NGOs already rescuing food across
              India. Onboarding takes 90 seconds.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="xl" variant="glass" className="text-brand-700">
                <Link to="/register">
                  Start now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="ghost" className="text-white hover:bg-white/10">
                <Link to="/contact">Talk to our team</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}

/* ============ Sub-components ============ */

function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="rounded-3xl border bg-white/80 backdrop-blur-xl shadow-glow overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-muted-foreground">
              app.annamdaan.org / dashboard
            </span>
          </div>
          <Badge variant="success">
            <Activity className="h-3 w-3" /> Live · 12 nearby
          </Badge>
        </div>
        <div className="grid grid-cols-12 gap-4 p-5">
          <div className="col-span-12 md:col-span-8 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Donations today", v: "147" },
                { l: "Meals served", v: "2,418" },
                { l: "Avg response", v: "8m 42s" },
              ].map((k) => (
                <div key={k.l} className="rounded-xl border bg-white p-3.5">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {k.l}
                  </div>
                  <div className="font-display text-2xl font-semibold mt-1">
                    {k.v}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-white to-brand-50/40 p-4 h-44 relative overflow-hidden">
              <div className="text-sm font-medium">Donations · Last 7 days</div>
              <svg viewBox="0 0 320 110" className="absolute inset-x-0 bottom-0">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C62828" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#C62828" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 C40,60 60,90 100,70 C140,50 160,40 200,55 C240,70 270,30 320,40 L320,110 L0,110 Z"
                  fill="url(#g1)"
                />
                <path
                  d="M0,80 C40,60 60,90 100,70 C140,50 160,40 200,55 C240,70 270,30 320,40"
                  fill="none"
                  stroke="#8B0000"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <div className="col-span-12 md:col-span-4 space-y-3">
            <div className="rounded-xl border p-3.5 bg-white">
              <div className="text-xs font-medium mb-2">Live feed preview</div>
              <div className="text-xs text-muted-foreground">
                Donations near you appear in real time once you sign in.
              </div>
            </div>
            <div className="rounded-xl border p-3.5 bg-brand-gradient text-white">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <div className="text-xs font-medium">NGO pickup tracking</div>
              </div>
              <div className="mt-2 text-[11px] text-white/85">
                When an NGO accepts, they arrange pickup with their own staff.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIllustration({ index }: { index: number }) {
  const colors = ["from-brand-500", "from-amber-500", "from-emerald-500", "from-violet-500"];
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${colors[index]} to-white p-6 h-52 relative overflow-hidden`}
    >
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative h-full grid place-items-center">
        {index === 0 && <Utensils className="h-16 w-16 text-white drop-shadow-lg" />}
        {index === 1 && <Sparkles className="h-16 w-16 text-white drop-shadow-lg" />}
        {index === 2 && <Truck className="h-16 w-16 text-white drop-shadow-lg" />}
        {index === 3 && <Heart className="h-16 w-16 text-white drop-shadow-lg" />}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI safety screening",
    desc: "Every batch is classified for freshness and shelf-life — instantly.",
    bullets: ["CNN food safety model", "Shelf-life prediction", "Anomaly detection"],
  },
  {
    icon: MapPinned,
    title: "Real-time matching",
    desc: "Geo-aware engine routes donations to the nearest verified NGO.",
    bullets: ["Distance + priority scoring", "Auto reassignment", "Live status"],
  },
  {
    icon: QrCode,
    title: "Encrypted QR pickup",
    desc: "Tamper-proof handoffs with GPS + time + party validation.",
    bullets: ["Signed tokens", "Geofenced verification", "Expiry windows"],
  },
  {
    icon: ShieldCheck,
    title: "FSSAI compliance",
    desc: "OCR-validated donor onboarding and chain-of-custody records.",
    bullets: ["License OCR", "Audit log", "Fraud signals"],
  },
  {
    icon: Activity,
    title: "Investor-grade analytics",
    desc: "Beautiful dashboards for donors, NGOs and admins.",
    bullets: ["Meals · Kg · CO₂", "Response times", "Heatmaps"],
  },
  {
    icon: Heart,
    title: "Human-centered UX",
    desc: "An experience designed to feel warm, swift and dignified.",
    bullets: ["Mobile first", "Multilingual ready", "Accessible"],
  },
];

const STEPS = [
  {
    title: "Donors list surplus",
    desc: "Hotels, wedding halls and caterers upload safe surplus food with photos and pickup windows. AI verifies safety and FSSAI license.",
  },
  {
    title: "AI matches the right NGO",
    desc: "Our matching engine ranks nearby NGOs by distance, capacity, urgency and reliability — and pings them in real time.",
  },
  {
    title: "Volunteer dispatched",
    desc: "Volunteers are auto-assigned with optimized routes and live GPS. An encrypted QR locks the pickup to the right party.",
  },
  {
    title: "Sacred smiles, delivered",
    desc: "Food reaches the community. The impact — meals, kilograms, CO₂ avoided — is recorded for everyone to see.",
  },
];


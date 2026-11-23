import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";

export function AuthShell({
  children,
  side,
}: {
  children: React.ReactNode;
  side?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col p-8 md:p-12">
        <Link to="/">
          <Logo />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 grid place-items-center"
        >
          <div className="w-full max-w-md">{children}</div>
        </motion.div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Annam Daan
        </div>
      </div>
      <div className="hidden lg:block relative overflow-hidden bg-brand-gradient">
        <div className="absolute inset-0 opacity-30 mix-blend-soft-light"
             style={{ backgroundImage: "radial-gradient(600px 300px at 80% 0%, rgba(255,255,255,0.5), transparent)" }} />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative h-full p-12 flex flex-col justify-between text-white">
          <div />
          {side ?? <DefaultSide />}
          <div className="text-xs text-white/70">
            Trusted by 1,240+ donors and 286 NGOs across India.
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultSide() {
  return (
    <div className="max-w-md">
      <div className="font-display text-4xl font-bold leading-tight">
        Surplus, rescued in minutes — <br /> by humans, guided by AI.
      </div>
      <p className="mt-4 text-white/85 leading-relaxed">
        Sign in to access live donations, AI safety screening, encrypted QR
        handoffs and real-time analytics.
      </p>
    </div>
  );
}

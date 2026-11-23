import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { Github, Instagram, Twitter, Linkedin } from "lucide-react";

const COLS = [
  {
    title: "Platform",
    items: [
      { label: "For Donors", to: "/register?role=donor" },
      { label: "For NGOs", to: "/register?role=ngo" },
      { label: "For Volunteers", to: "/register?role=volunteer" },
      { label: "Public Contributions", to: "/register?role=public" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/about" },
      { label: "Impact", to: "/impact" },
      { label: "Press", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "API & Docs", to: "/about" },
      { label: "AI Technology", to: "/about#ai" },
      { label: "Safety Standards", to: "/about" },
      { label: "Status", to: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/70 bg-gradient-to-b from-white to-brand-50/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-5">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              An AI-powered food rescue ecosystem turning surplus into smiles —
              one safe, swift, sacred meal at a time.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Linkedin, Github].map((I, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white hover:bg-brand-50 hover:border-brand-200 transition-colors"
                >
                  <I className="h-4 w-4 text-brand-700" />
                </a>
              ))}
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold mb-4">{c.title}</div>
              <ul className="space-y-2.5">
                {c.items.map((i) => (
                  <li key={i.label}>
                    <Link
                      to={i.to}
                      className="text-sm text-muted-foreground hover:text-brand-700 transition-colors"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6 border-t border-border/60 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} Annam Daan — Surplus to Sacred Smiles.
            All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/about" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              FSSAI compliance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

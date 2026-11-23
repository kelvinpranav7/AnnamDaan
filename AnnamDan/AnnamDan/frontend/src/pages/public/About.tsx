import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/statsService";

export default function About() {
  const { data: impact } = useQuery({
    queryKey: ["stats", "impact"],
    queryFn: () => statsService.impact(),
  });

  const meals = impact?.mealsServed ?? 0;
  const partners = (impact?.activeDonors ?? 0) + (impact?.activeNgos ?? 0);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
    return `${n}`;
  };

  return (
    <main>
      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center text-center px-gutter text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(118, 0, 9, 0.85), rgba(118, 0, 9, 0.6)), url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-3xl space-y-md">
          <span
            className="px-sm py-xs rounded-full font-label-sm text-label-sm uppercase tracking-wider"
            style={{ backgroundColor: "#ffdbca", color: "#763300" }}
          >
            Our Vision
          </span>
          <h1 className="font-display-lg text-display-lg">
            Turning Surplus into Sacred Smiles
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 max-w-2xl mx-auto">
            We believe that every grain of food is a blessing. Annam Daan
            bridges the gap between abundance and hunger, ensuring that no meal
            goes to waste while every human receives nourishment with honor.
          </p>
          <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
            <Link
              to="/register?role=donor"
              className="bg-white text-primary px-lg py-md rounded-xl font-label-sm text-label-sm font-bold impact-card-shadow hover:bg-surface-container transition-all"
            >
              Start Giving
            </Link>
            <a
              href="#our-story"
              className="border-2 border-white text-white px-lg py-md rounded-xl font-label-sm text-label-sm font-bold hover:bg-white/10 transition-all"
            >
              Read Our Story
            </a>
          </div>
        </div>
      </section>

      {/* Core Values Bento Grid */}
      <section className="max-w-container-max mx-auto px-gutter py-xl">
        <div className="text-center mb-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">
            Rooted in Purpose
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
            Our actions are guided by three non-negotiable principles that
            transform simple logistics into sacred service.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
          {/* Dignity */}
          <div className="md:col-span-4 bg-white p-lg rounded-xl impact-card-shadow border border-outline-variant flex flex-col items-start gap-md">
            <div className="bg-primary-fixed p-md rounded-full text-primary">
              <span className="material-symbols-outlined text-4xl">
                volunteer_activism
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md">Dignity</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              We provide more than just food; we provide respect. Every
              distribution point is designed to feel like a premium hospitality
              experience, never a handout.
            </p>
          </div>

          {/* Transparency */}
          <div className="md:col-span-8 bg-surface-container-low p-lg rounded-xl border border-outline-variant flex flex-col md:flex-row items-center gap-lg">
            <div className="flex-1 space-y-md">
              <div className="bg-tertiary-fixed p-md rounded-full text-tertiary w-fit">
                <span className="material-symbols-outlined text-4xl">
                  analytics
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md">
                Radical Transparency
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Track every gram and every cent. Our real-time impact dashboard
                ensures donors see exactly where their contributions are
                creating smiles.
              </p>
              <Link
                to="/impact"
                className="inline-flex items-center text-primary font-bold hover:underline"
              >
                View Impact Report{" "}
                <span className="material-symbols-outlined ml-base">
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="flex-1 w-full h-48 bg-white rounded-lg border border-outline-variant overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Transparency dashboard"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyO-G0bPL_lhR7qPaVcdBAWT8Wqrq3NNycdixLZf3A-HPujaSWD4mzSma1SsvlJgFukQKQQx40th1pcDm3l-9nkW2es1HKBprJLyucQZCzi_A3Y6O8fzp0wJzX-aQLxWKFSjXzNllvf44SIGGQvqB_mJhv47VwUcx9B5YFB7FzBGrHM-3Wl8bqgp43J--llJOC-sVDaGr3rTaYUMy2yUJMFzF-8IY1dBTOyIRgvtrxkAL5Fy4w_-a6zZyXB-bILOgcwY2mRg6XGqHT"
              />
            </div>
          </div>

          {/* Impact */}
          <div className="md:col-span-12 bg-primary text-white p-lg rounded-xl flex flex-col md:flex-row justify-between items-center gap-lg">
            <div className="max-w-xl">
              <h3 className="font-headline-lg text-headline-lg text-white mb-md">
                Lasting Impact
              </h3>
              <p className="font-body-lg text-body-lg text-white/80">
                We don't just solve today's hunger; we build resilient systems.
                By optimizing food chains, we reduce carbon footprints while
                filling plates.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-xl">
              <div className="text-center">
                <div className="text-display-lg font-bold">
                  {formatNumber(meals)}
                </div>
                <div className="font-label-sm text-label-sm text-white/70 uppercase">
                  Meals Served
                </div>
              </div>
              <div className="text-center">
                <div className="text-display-lg font-bold">
                  {formatNumber(partners)}
                </div>
                <div className="font-label-sm text-label-sm text-white/70 uppercase">
                  Partners
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="our-story" className="bg-surface-container-high py-xl">
        <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
          <div className="order-2 md:order-1 relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-surface-container">
              <img
                className="w-full h-full object-cover"
                alt="Sharing a meal"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF7PO_jdmTkkSXdgrEJ-Lk2mjEsLbNR6Bc8JyEYsJYuXQojJ9l7-czNhSJ4pn7icZjKyKE0A1dUL6QHpiqBerq4HyriPQhh2dL0WAkjK2AVfVhZyKztPOK-hPtqJ94zGATwfQt_AhGIpzs0GJrtJwmH0E7LC6oElisguz5yAdw8ekas40GiLCivLKT_lbE3FsB8nlL_VKKhF8lu0nQdiNEBYsKB3nq0KGjY1k9rIX9em2U4v6gcjXBxLt9DtAxiPfGw7SfVmln-lL8"
              />
            </div>
            <div className="absolute -bottom-base -right-base bg-white p-md rounded-xl impact-card-shadow border border-outline-variant max-w-[200px]">
              <p className="font-body-md text-body-md text-primary font-bold italic">
                "It started with one surplus tray and a single smile."
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-md">
            <h2 className="font-headline-lg text-headline-lg text-primary">
              From Excess to Essence
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface">
              Founded in 2018, Annam Daan began with a simple observation: the
              staggering amount of untouched food at weddings and corporate
              events. We realized that the obstacle wasn't a lack of food, but
              a lack of bridge.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              We built that bridge with technology and heart. What started as a
              local volunteer group has evolved into a sophisticated logistics
              network that treats every donation with the same care as a
              five-star delivery service.
            </p>
            <div className="pt-base">
              {[
                "Cold-chain certified logistics",
                "Real-time GPS tracking of donations",
                "24/7 Quality assurance protocols",
              ].map((bullet) => (
                <div
                  key={bullet}
                  className="flex items-center gap-md mb-base last:mb-0"
                >
                  <span className="material-symbols-outlined text-primary ms-fill">
                    check_circle
                  </span>
                  <span className="font-body-md text-body-md">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-xl bg-white">
        <div className="max-w-4xl mx-auto px-gutter text-center space-y-lg">
          <h2 className="font-display-lg text-display-lg text-primary">
            The movement needs you.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Whether you are a restaurant with surplus, a corporation looking
            for impact, or an individual with time to give—there is a place for
            you at our table.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
            <Link
              to="/register?role=donor"
              className="w-full sm:w-auto bg-primary text-white px-xl py-md rounded-xl font-headline-md text-headline-md hover:scale-[1.02] transition-transform shadow-lg text-center"
            >
              Become a Donor
            </Link>
            <Link
              to="/register?role=volunteer"
              className="w-full sm:w-auto border-2 border-primary text-primary px-xl py-md rounded-xl font-headline-md text-headline-md hover:bg-primary/5 transition-colors text-center"
            >
              Volunteer Today
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

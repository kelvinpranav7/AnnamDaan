import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-xl lg:py-[120px] bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-gutter relative z-10 flex flex-col items-center text-center">
          <span className="inline-block px-md py-xs rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm mb-md">
            Seamless Food Rescue
          </span>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-md max-w-[800px]">
            Turning surplus into sacred smiles, one step at a time.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px] mb-lg">
            Annam Daan bridges the gap between abundance and need through a
            sophisticated digital infrastructure designed for dignity.
          </p>
          <div className="flex gap-md">
            <Link
              to="/register?role=donor"
              className="bg-primary text-on-primary px-lg py-sm rounded-xl font-headline-md text-headline-md transition-transform active:scale-[0.98]"
            >
              Start Donating
            </Link>
            <Link
              to="/register?role=ngo"
              className="border-2 border-primary text-primary px-lg py-sm rounded-xl font-headline-md text-headline-md transition-colors hover:bg-primary-fixed"
            >
              Partner as NGO
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -left-20 -top-20 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-3xl" />
      </section>

      {/* Donor Journey */}
      <section className="py-xl max-w-container-max mx-auto px-gutter">
        <div className="mb-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface border-l-4 border-primary pl-md">
            For Donors
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
            Quick, transparent, and impactful surplus reporting.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {/* Step 1 */}
          <div className="group bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center font-headline-md text-headline-md mb-md transition-transform group-hover:-translate-y-1 group-hover:scale-110">
              1
            </div>
            <h3 className="font-headline-md text-headline-md mb-sm text-on-surface">
              Post Surplus
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Upload photos and details of the surplus food. Our system
              categorizes it instantly by type and shelf-life.
            </p>
            <div className="mt-lg h-32 w-full rounded-lg overflow-hidden grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <img
                className="w-full h-full object-cover"
                alt="Posting surplus"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoU7AFEc61CpGGp9MbIqefl-3Lwyd9R10rEpXXcW8O851SXKDVw_q7N9ajFlLxseplHQyWDapcJfSUWgWirewzs4ixhjEwIKhg-DKVzg-fq8PrcNa4xcfd4nOsNvw33HuoJzUR8uB2jZmg5IuslMAcGkeMrAw6N70X9oO4wvLdzLKHd-H_lT0M33yaLY5kU1ZPWf3IDwxnyf69d6xpshpazw2dwZPGwfp2o7djaAcSMHR_BqFH7asNzMp9B_PZ0mrWTWpFdOSvDO3F"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="group bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center font-headline-md text-headline-md mb-md transition-transform group-hover:-translate-y-1 group-hover:scale-110">
              2
            </div>
            <h3 className="font-headline-md text-headline-md mb-sm text-on-surface">
              Smart Match
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Our AI matches your donation with nearby verified NGOs based on
              their current capacity and population needs.
            </p>
            <div className="mt-lg flex items-center justify-center h-32 bg-surface-container rounded-lg">
              <span
                className="material-symbols-outlined text-primary text-[48px] ms-fill"
              >
                hub
              </span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="group bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center font-headline-md text-headline-md mb-md transition-transform group-hover:-translate-y-1 group-hover:scale-110">
              3
            </div>
            <h3 className="font-headline-md text-headline-md mb-sm text-on-surface">
              Fast Pickup
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Verified volunteers or NGO transport arrives for a seamless
              handover. All verified through the app.
            </p>
            <div className="mt-lg h-32 w-full rounded-lg overflow-hidden grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <img
                className="w-full h-full object-cover"
                alt="Delivery van"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUu3x_CEzn_mvuh2OgfKyaF85wxqUeDv3CAFfG-Em2nHKzQjUPa-ty9rVqqBmFHGevQ-olpefUX7C_AhZjIuQ8bF0ogBV4SqDeo3FhgVQjNrS1vdcVvnX2qrWa_J1JBxNiR0sDPNcKVco13tcn0SZbnSyu38xMx_hAWChrXZ-Qg6PcGg2dptA2Hg0E9atItuJFxHOavLhRfoFySzhWO8mAU6GQgXKVpZ3HcJhxb1vUOzHVzEaaD9UvC7JXMM2-6hcb3SfxvwXmoqMI"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Trust Section */}
      <section className="bg-inverse-surface py-xl text-on-primary">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
            <div>
              <h2 className="font-headline-lg text-headline-lg mb-md text-primary-fixed">
                Technology at the Core of Trust
              </h2>
              <div className="space-y-lg">
                <div className="flex gap-md">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container">
                      security
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md mb-xs">
                      AI Food Safety Check
                    </h4>
                    <p className="text-surface-variant font-body-md text-body-md">
                      Our computer vision algorithms analyze uploaded images to
                      detect spoilage signs, ensuring only safe, nutritious
                      food reaches the community.
                    </p>
                  </div>
                </div>
                <div className="flex gap-md">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary-container">
                      qr_code_2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-headline-md mb-xs">
                      Secure QR Verification
                    </h4>
                    <p className="text-surface-variant font-body-md text-body-md">
                      Every handover requires a dual-key QR scan, creating an
                      immutable log of custody from the donor's hand to the
                      NGO's kitchen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div
                className="p-md rounded-[32px] overflow-hidden shadow-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                }}
              >
                <img
                  className="w-full h-auto rounded-2xl"
                  alt="Dashboard"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkOvZIcOrCfVkhSJTP_SrDuZ2Pb5Y7TLzqa42IncxYnPErwzk7dseMKjFVOP5O51I8-RIKpkkwVwFX7SxJ_eX_pEv7TZWTO_6qVUcA_s5Q-y-X9yDOvQVlwTqRFl_83e1ApumLqOBdvix-GQvTj254BzrffaH1wdWCxZi4nxQU2dgZsbN7L_n7owdAboUMtVGgTYdQwUCcPa-tVzp0CxSqSRIytIhHIoO7w9Rb-2wAWKN0XR7yDOkSs8nMHTSivO_3QEHIrazBCw2p"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-tertiary p-md rounded-xl shadow-lg animate-bounce hidden lg:block">
                <p className="font-label-sm text-label-sm text-on-tertiary">
                  99.9% Safe Rescue Rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NGO Journey */}
      <section className="py-xl max-w-container-max mx-auto px-gutter">
        <div className="text-right mb-lg">
          <h2 className="font-headline-lg text-headline-lg text-on-surface border-r-4 border-primary pr-md inline-block">
            For NGOs
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
            Empowering grassroots organizations with data-driven logistics.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {[
            {
              n: 1,
              title: "Claim Donation",
              body: "Receive alerts for matched food nearby. Review nutritional content and quantity before claiming the batch.",
            },
            {
              n: 2,
              title: "Real-time Tracking",
              body: "Monitor volunteer pickup progress in real-time. Coordinate arrival times to ensure kitchen readiness.",
            },
            {
              n: 3,
              title: "Impact Distribution",
              body: "Serve high-quality meals and log the impact. Donors receive an immediate notification of their contribution's success.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="group bg-surface-container p-lg rounded-xl transition-all hover:bg-surface-container-high"
            >
              <div className="w-12 h-12 bg-on-surface text-surface rounded-full flex items-center justify-center font-headline-md text-headline-md mb-md transition-transform group-hover:-translate-y-1 group-hover:scale-110">
                {s.n}
              </div>
              <h3 className="font-headline-md text-headline-md mb-sm text-on-surface">
                {s.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact CTA */}
      <section className="py-xl px-gutter max-w-container-max mx-auto">
        <div className="bg-primary-container text-on-primary p-xl rounded-[40px] text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-display-lg text-display-lg mb-md text-white">
              Ready to make a difference?
            </h2>
            <p className="font-body-lg text-body-lg mb-xl max-w-[600px] mx-auto text-white/90">
              Join thousands of businesses and NGOs transforming surplus into
              community health.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-md">
              <Link
                to="/register?role=donor"
                className="bg-white text-primary font-headline-md text-headline-md px-lg py-sm rounded-xl shadow-lg hover:bg-surface-container transition-colors"
              >
                I want to Donate
              </Link>
              <Link
                to="/register?role=volunteer"
                className="bg-primary-fixed text-primary font-headline-md text-headline-md px-lg py-sm rounded-xl shadow-lg hover:opacity-90 transition-opacity"
              >
                I want to Volunteer
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24" />
        </div>
      </section>
    </main>
  );
}

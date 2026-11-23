export function StitchFooter() {
  return (
    <footer className="bg-surface-container-highest dark:bg-inverse-surface mt-xl">
      <div className="w-full flex flex-col md:flex-row justify-between items-center px-gutter py-lg max-w-container-max mx-auto">
        <div className="mb-md md:mb-0">
          <div className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
            Annam Daan
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant mt-xs">
            © {new Date().getFullYear()} Annam Daan. Surplus to Sacred Smiles.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-lg">
          <a
            className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Contact Us
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors"
            href="#"
          >
            Impact Reports
          </a>
        </div>
      </div>
    </footer>
  );
}

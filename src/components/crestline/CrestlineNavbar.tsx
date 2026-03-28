import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { MontelibanoHouseLogo } from "@/components/crestline/MontelibanoHouseLogo";
import { LogoutExpandButton } from "@/components/crestline/LogoutExpandButton";
import { NightModeSwitch } from "@/components/crestline/NightModeSwitch";
import { ContactPropertiesRippleButton } from "@/components/crestline/ContactPropertiesRippleButton";

const coreLinks = [
  { label: "Home", to: "/crestline" },
  { label: "Properties", to: "/crestline/properties" },
];

const adminLinks = [
  { label: "Inquiries", to: "/crestline/admin/inquiries" },
  { label: "Reviews", to: "/crestline/admin/reviews" },
  { label: "Listings Admin", to: "/crestline/admin/listings" },
];

const tailLinks = [
  { label: "About", to: "/crestline/about" },
  { label: "Contact", to: "/crestline/contact" },
];

export function CrestlineNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, checking: adminChecking } = useIsAdmin();
  const authReady = !authLoading;
  const isAdminRoute = location.pathname.startsWith("/crestline/admin");
  const showAdminLinks = authReady && user && (isAdmin === true || (adminChecking && isAdminRoute));

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const activeClass = useMemo(() => {
    return "text-crestline-gold after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-crestline-gold after:opacity-100 after:transition-opacity after:duration-300";
  }, []);

  const inactiveAfterClass = useMemo(() => {
    return "text-slate-600 hover:text-slate-900 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-crestline-gold after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300";
  }, []);

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "border-b border-crestline-gold/10 backdrop-blur-xl",
        "transition-colors duration-300",
        scrolled ? "bg-crestline-bg/95" : "bg-crestline-bg/80",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 min-w-0 h-20 w-full">
          <Link to="/crestline" className="flex items-center gap-2.5 shrink-0">
            <MontelibanoHouseLogo className="h-7 w-7 text-crestline-gold" />
            <span className="font-serif text-2xl font-bold text-slate-900 tracking-wide leading-none">
              RealEstate
            </span>
          </Link>

          {/* Reserve space for viewport-pinned logout/login only */}
          <div className="hidden md:flex flex-1 min-w-0 items-center justify-end ml-8 lg:ml-12 md:pr-[min(9rem,24vw)]">
            {/* Nav links: core → admin (if applicable) → About → Contact → Schedule Viewing */}
            <div className="flex items-center gap-8 min-w-0">
              {coreLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? "page" : undefined}
                  className={[
                    "relative whitespace-nowrap shrink-0",
                    "text-[16px] font-medium tracking-wide leading-6",
                    "transition-colors transition-transform duration-200 hover:-translate-y-[1px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    location.pathname === link.to ? activeClass : inactiveAfterClass,
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}

              {showAdminLinks && adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname.startsWith(link.to) ? "page" : undefined}
                  className={[
                    "relative whitespace-nowrap shrink-0",
                    "text-[16px] font-medium tracking-wide leading-6",
                    "transition-colors transition-transform duration-200 hover:-translate-y-[1px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    location.pathname.startsWith(link.to) ? activeClass : inactiveAfterClass,
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}

              {tailLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? "page" : undefined}
                  className={[
                    "relative whitespace-nowrap shrink-0",
                    "text-[16px] font-medium tracking-wide leading-6",
                    "transition-colors transition-transform duration-200 hover:-translate-y-[1px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    location.pathname === link.to ? activeClass : inactiveAfterClass,
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center gap-3 shrink-0 pl-1 border-l border-crestline-gold/15">
                <NightModeSwitch id="crestline-night-mode" />
              </div>

              <ContactPropertiesRippleButton
                to="/crestline/contact"
                className="shrink-0 rounded-xl px-6 py-2 text-sm font-semibold min-h-9 focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg"
              >
                Schedule Viewing
              </ContactPropertiesRippleButton>
            </div>
          </div>

          <button
            className="md:hidden text-slate-900"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Viewport-right: logout / login only (~1cm from edge) */}
      <div className="pointer-events-none absolute right-[1cm] top-1/2 z-10 hidden -translate-y-1/2 md:flex md:items-center">
        <div className="pointer-events-auto flex items-center">
          {!authReady ? (
            <Button
              variant="outline"
              disabled
              className="border-slate-300 text-slate-500 rounded-xl font-semibold text-sm px-4 h-9 transition-colors duration-200"
            >
              Account
            </Button>
          ) : user ? (
            <LogoutExpandButton />
          ) : (
            <Link to="/login">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl font-semibold text-sm px-4 h-9 transition-colors duration-200"
              >
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop overlay for premium “drawer” feel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-slate-900/50 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              className="md:hidden fixed top-0 left-0 right-0 z-50 bg-crestline-bg/95 backdrop-blur-xl border-b border-crestline-gold/10 max-h-[min(85vh,640px)] overflow-y-auto"
            >
              <div className="px-4 pt-5 pb-6 space-y-5">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Night mode</span>
                  <NightModeSwitch id="crestline-night-mode-mobile" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-crestline-muted/95">Menu</div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 text-slate-900"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {coreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={[
                      "block text-[16px] font-medium tracking-wide leading-6 px-2 py-2.5 rounded-xl",
                    "transition-colors transition-transform duration-200 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      location.pathname === link.to
                        ? "text-crestline-gold"
                        : "text-slate-600 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                ))}

                {showAdminLinks && adminLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={[
                      "block text-[16px] font-medium tracking-wide leading-6 px-2 py-2.5 rounded-xl",
                    "transition-colors transition-transform duration-200 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                      location.pathname.startsWith(link.to)
                        ? "text-crestline-gold"
                        : "text-slate-600 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                ))}

                {tailLinks.map((link) => (
                  <div key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={[
                        "block text-[16px] font-medium tracking-wide leading-6 px-2 py-2.5 rounded-xl",
                        "transition-colors transition-transform duration-200 hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        location.pathname === link.to
                          ? "text-crestline-gold"
                          : "text-slate-600 hover:text-slate-900",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                    {link.to === "/crestline/contact" && (
                      <ContactPropertiesRippleButton
                        to="/crestline/contact"
                        onClick={() => setOpen(false)}
                        className="mt-2 block w-full rounded-xl py-3 text-center text-sm font-semibold min-h-11 focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg"
                      >
                        Schedule Viewing
                      </ContactPropertiesRippleButton>
                    )}
                  </div>
                ))}

                {!authReady ? (
                  <Button
                    disabled
                    className="w-full bg-slate-50 border-slate-200 text-slate-500 font-semibold text-sm rounded-xl mt-2 h-11 transition-colors duration-200"
                  >
                    Account
                  </Button>
                ) : user ? (
                  <div className="flex justify-center pt-2">
                    <LogoutExpandButton onNavigate={() => setOpen(false)} />
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 font-semibold text-sm rounded-xl mt-2 h-11 transition-colors duration-200">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

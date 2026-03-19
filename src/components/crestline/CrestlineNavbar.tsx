import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { MontelibanoHouseLogo } from "@/components/crestline/MontelibanoHouseLogo";

const coreLinks = [
  { label: "Home", to: "/crestline" },
  { label: "Properties", to: "/crestline/properties" },
];

const adminLinks = [
  { label: "Inquiries", to: "/crestline/admin/inquiries" },
  { label: "Listings Admin", to: "/crestline/admin/listings" },
];

const tailLinks = [
  { label: "About", to: "/crestline/about" },
  { label: "Contact", to: "/crestline/contact" },
];

export function CrestlineNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

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
    return "text-white/70 hover:text-white after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-crestline-gold after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300";
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
        <div className="flex items-center justify-between h-20 w-full">
          <Link to="/crestline" className="flex items-center gap-2.5 shrink-0">
            <MontelibanoHouseLogo className="h-7 w-7 text-crestline-gold" />
            <span className="font-serif text-xl font-bold text-white tracking-wide">
              RealEstate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 ml-12 lg:ml-16 flex-1 justify-end">
            {/* Nav links: core → admin (if applicable) → About → Contact */}
            <div className="flex items-center gap-5">
              {coreLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname === link.to ? "page" : undefined}
                  className={[
                    "relative",
                    "text-sm font-medium tracking-wide",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    location.pathname === link.to ? activeClass : inactiveAfterClass,
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}

              {!adminLoading && user && isAdmin && adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={location.pathname.startsWith(link.to) ? "page" : undefined}
                  className={[
                    "relative",
                    "text-sm font-medium tracking-wide",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
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
                    "relative",
                    "text-sm font-medium tracking-wide",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    location.pathname === link.to ? activeClass : inactiveAfterClass,
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Action buttons */}
            <Link to="/crestline/contact">
              <Button className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 font-semibold text-sm px-6 rounded-none h-9 transition-colors duration-200">
                Schedule Viewing
              </Button>
            </Link>

            {user ? (
              <Link to="/logout">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 rounded-none font-semibold text-sm px-4 h-9 transition-colors duration-200"
                >
                  Log out
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 rounded-none font-semibold text-sm px-4 h-9 transition-colors duration-200"
                >
                  Broker Login
                </Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              role="dialog"
              aria-modal="true"
              className="md:hidden fixed top-0 left-0 right-0 z-50 bg-crestline-bg/95 backdrop-blur-xl border-b border-crestline-gold/10 max-h-[100vh] overflow-y-auto"
            >
              <div className="px-4 py-6 space-y-4">
                {coreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={[
                      "block text-sm font-medium tracking-wide",
                      "transition-colors duration-200",
                      location.pathname === link.to
                        ? "text-crestline-gold"
                        : "text-white/70 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                ))}

                {!adminLoading && user && isAdmin && adminLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={[
                      "block text-sm font-medium tracking-wide",
                      "transition-colors duration-200",
                      location.pathname.startsWith(link.to)
                        ? "text-crestline-gold"
                        : "text-white/70 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                ))}

                {tailLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={[
                      "block text-sm font-medium tracking-wide",
                      "transition-colors duration-200",
                      location.pathname === link.to
                        ? "text-crestline-gold"
                        : "text-white/70 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                ))}

                <Link to="/crestline/contact" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 font-semibold text-sm rounded-none mt-2 h-11 transition-colors duration-200">
                    Schedule Viewing
                  </Button>
                </Link>

                {user ? (
                  <Link to="/logout" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 font-semibold text-sm rounded-none mt-2 h-11 transition-colors duration-200">
                      Log out
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 font-semibold text-sm rounded-none mt-2 h-11 transition-colors duration-200">
                      Broker Login
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

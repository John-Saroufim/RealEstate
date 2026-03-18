import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", to: "/crestline" },
  { label: "Properties", to: "/crestline/properties" },
  { label: "About", to: "/crestline/about" },
  { label: "Contact", to: "/crestline/contact" },
];

export function CrestlineNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-crestline-bg/80 backdrop-blur-xl border-b border-crestline-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/crestline" className="flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-crestline-gold" />
            <span className="font-serif text-xl font-bold text-white tracking-wide">
              CrestLine <span className="text-crestline-gold">Estates</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  location.pathname === link.to
                    ? "text-crestline-gold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/crestline/contact">
              <Button className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 font-semibold text-sm px-6 rounded-none">
                Schedule Viewing
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-crestline-bg/95 backdrop-blur-xl border-t border-crestline-gold/10"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`block text-sm font-medium tracking-wide ${
                    location.pathname === link.to
                      ? "text-crestline-gold"
                      : "text-white/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/crestline/contact" onClick={() => setOpen(false)}>
                <Button className="w-full bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 font-semibold text-sm rounded-none mt-2">
                  Schedule Viewing
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

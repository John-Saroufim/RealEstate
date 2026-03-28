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

const coreLinks = [
  { label: "Home", to: "/crestline" },
  { label: "Properties", to: "/crestline/properties" },
];

const adminLinks = [
  { label: "Inquiries", to: "/crestline/admin/inquiries" },
  { label: "Reviews", to: "/crestline/admin/reviews" },
  { label: "Listings", to: "/crestline/admin/listings" },
];

const tailLinks = [
  { label: "About", to: "/crestline/about", linkAccent: "gold" as const },
  { label: "Contact", to: "/crestline/contact", linkAccent: "blue" as const },
];

/** Default nav labels (logged-in non-admin) */
const NAV_TEXT_DEFAULT = "text-[15px] font-medium tracking-wide leading-6";
/** Guests: noticeably larger primary nav */
const NAV_TEXT_GUEST = "text-lg md:text-xl font-medium tracking-wide leading-7";
/** Admins: modest bump for Home / Properties / About / Contact (+ admin links) */
const NAV_TEXT_ADMIN = "text-[16px] md:text-[17px] font-medium tracking-wide leading-6";
const navLinkMotion = "transition-colors transition-transform duration-200 hover:-translate-y-[1px]";

/** Desktop: spacing between Home / Properties / About / Contact (+ admin links when shown) */
const DESKTOP_NAV_LINK_GAP = "gap-8 md:gap-10 lg:gap-12";

/** Desktop: same distance logo→Home as Contact→night mode (single flex gap token) */
const HEADER_SECTION_GAP = "md:gap-5 lg:gap-6";

export function CrestlineNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, checking: adminChecking } = useIsAdmin();
  const authReady = !authLoading;
  const isAdminRoute = location.pathname.startsWith("/crestline/admin");
  const showAdminLinks = authReady && user && (isAdmin === true || (adminChecking && isAdminRoute));

  const navLinkSizeClass = useMemo(() => {
    if (!authReady) return NAV_TEXT_DEFAULT;
    if (!user) return NAV_TEXT_GUEST;
    if (showAdminLinks) return NAV_TEXT_ADMIN;
    return NAV_TEXT_DEFAULT;
  }, [authReady, user, showAdminLinks]);

  const navLinkClassMobile = useMemo(
    () => `block ${navLinkSizeClass} px-2 py-2.5 rounded-xl ${navLinkMotion}`,
    [navLinkSizeClass],
  );

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

  const activeClassGold = useMemo(() => {
    return "text-crestline-gold after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-crestline-gold after:opacity-100 after:transition-opacity after:duration-300";
  }, []);

  const inactiveAfterClassGold = useMemo(() => {
    return "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-crestline-gold after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300";
  }, []);

  const activeClassBlue = useMemo(() => {
    return "text-blue-700 dark:text-blue-400 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-blue-600 after:opacity-100 after:transition-opacity after:duration-300";
  }, []);

  const inactiveAfterClassBlue = useMemo(() => {
    return "text-slate-600 hover:text-blue-800 dark:text-slate-400 dark:hover:text-blue-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:bg-blue-600 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300";
  }, []);

  const desktopLinkList = (
    <>
      {coreLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          aria-current={location.pathname === link.to ? "page" : undefined}
          className={[
            "relative whitespace-nowrap shrink-0",
            navLinkSizeClass,
            navLinkMotion,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
            location.pathname === link.to ? activeClassGold : inactiveAfterClassGold,
          ].join(" ")}
        >
          {link.label}
        </Link>
      ))}

      {showAdminLinks &&
        adminLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            aria-current={location.pathname.startsWith(link.to) ? "page" : undefined}
            className={[
              "relative whitespace-nowrap shrink-0",
              navLinkSizeClass,
              navLinkMotion,
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
              location.pathname.startsWith(link.to) ? activeClassGold : inactiveAfterClassGold,
            ].join(" ")}
          >
            {link.label}
          </Link>
        ))}

      {tailLinks.map((link) => {
        const active = location.pathname === link.to;
        const gold = link.linkAccent === "gold";
        const tailActive = gold ? activeClassGold : activeClassBlue;
        const tailInactive = gold ? inactiveAfterClassGold : inactiveAfterClassBlue;
        return (
          <Link
            key={link.to}
            to={link.to}
            aria-current={active ? "page" : undefined}
            className={[
              "relative whitespace-nowrap shrink-0",
              navLinkSizeClass,
              navLinkMotion,
              gold
                ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg"
                : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
              active ? tailActive : tailInactive,
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "border-b border-crestline-gold/10 backdrop-blur-xl",
        "pt-[env(safe-area-inset-top,0px)]",
        "transition-colors duration-300",
        scrolled ? "bg-crestline-bg/95" : "bg-crestline-bg/80",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
        <div
          className={[
            "flex items-center min-w-0 h-20 w-full",
            "gap-2 sm:gap-3",
            HEADER_SECTION_GAP,
          ].join(" ")}
        >
          <Link
            to="/crestline"
            className="crestline-brand-logo shrink-0 text-slate-900 dark:text-slate-100"
          >
            <MontelibanoHouseLogo className="crestline-brand-logo__icon h-7 w-7 md:h-8 md:w-8 text-crestline-gold" />
            <span className="crestline-brand-logo__text font-sans text-xl font-bold tracking-wide leading-none md:text-2xl">
              RealEstate
            </span>
          </Link>

          {/*
            Desktop: primary links stay right-aligned (before night mode). HEADER_SECTION_GAP: logo→links, Contact→night.
          */}
          <div
            className={["hidden md:flex flex-1 min-w-0 items-center", HEADER_SECTION_GAP].join(" ")}
          >
            <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex justify-end">
              <div className={["flex w-max min-w-0 items-center shrink-0", DESKTOP_NAV_LINK_GAP].join(" ")}>
                {desktopLinkList}
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              <NightModeSwitch id="crestline-night-mode" />
            </div>

            <div className="flex shrink-0 items-center border-l border-crestline-gold/15 pl-3 lg:pl-4">
              {!authReady ? (
                <Button
                  variant="outline"
                  disabled
                  className="border-slate-300 text-slate-500 rounded-xl font-semibold text-[15px] px-4 h-10 min-h-10 transition-colors duration-200"
                >
                  Account
                </Button>
              ) : user ? (
                <LogoutExpandButton />
              ) : (
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl font-semibold text-[15px] px-4 h-10 min-h-10 transition-colors duration-200"
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <button
            className="md:hidden ml-auto shrink-0 text-slate-900"
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
              className="md:hidden fixed left-0 right-0 top-0 z-50 max-h-[min(85dvh,640px)] overflow-y-auto border-b border-crestline-gold/10 bg-crestline-bg/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl"
            >
              <div className="space-y-6 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-5">
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
                      navLinkClassMobile,
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
                      location.pathname === link.to
                        ? "text-crestline-gold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
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
                      navLinkClassMobile,
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
                      location.pathname.startsWith(link.to)
                        ? "text-crestline-gold"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                ))}

                {tailLinks.map((link) => {
                  const active = location.pathname === link.to;
                  const gold = link.linkAccent === "gold";
                  const activeText = gold ? "text-crestline-gold" : "text-blue-700 dark:text-blue-400";
                  const inactiveText =
                    "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100";
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={[
                        navLinkClassMobile,
                        gold
                          ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg"
                          : "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
                        active ? activeText : inactiveText,
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-600/40">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Night mode</span>
                  <NightModeSwitch id="crestline-night-mode-mobile" />
                </div>

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

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";

const SESSION_KEY = "re_session_entry_flash_v1";
const DURATION_MS = 2000;
const DURATION_REDUCED_MS = 1000;

/**
 * Full-screen entry splash — Uiverse morph-stroke loader (mobinkakei) + RealEstate wordmark.
 * Runs once per tab session on first load, and after login via location.state.reSplash.
 */
export function EntrySplashHost() {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const duration = reducedMotion ? DURATION_REDUCED_MS : DURATION_MS;

  useEffect(() => {
    const st = location.state as { reSplash?: boolean } | null;
    if (!st?.reSplash) return;

    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(true);
    const id = window.setTimeout(() => {
      setShow(false);
      navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        { replace: true, state: {} },
      );
    }, duration);
    return () => {
      window.clearTimeout(id);
      // If another navigation clears `reSplash` before the timer fires, this cleanup runs
      // without a new effect starting — hide the overlay or it stays stuck (Login double-nav).
      setShow(false);
    };
  }, [location.state, location.pathname, location.search, location.hash, navigate, duration]);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const st = location.state as { reSplash?: boolean } | null;
    if (st?.reSplash) return;

    setShow(true);
    const id = window.setTimeout(() => {
      setShow(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, duration);
    return () => {
      window.clearTimeout(id);
      setShow(false);
    };
  }, [duration, location.state]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-dvh w-full max-w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto overscroll-none bg-background px-4 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className={`flex flex-col items-center gap-8 ${reducedMotion ? "re-entry-splash--reduced" : ""}`}
      >
        <div className="re-entry-loader" aria-hidden>
          <svg viewBox="0 0 80 80">
            <rect x="8" y="8" width="64" height="64" rx="8" ry="8" />
          </svg>
        </div>
        <p className="text-center font-sans text-2xl font-bold tracking-tight text-foreground">
          <span className="text-primary">Real</span>
          <span className="text-foreground/90">Estate</span>
        </p>
      </div>
    </div>
  );
}

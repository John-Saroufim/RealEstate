import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReducedMotion } from "framer-motion";

const SESSION_KEY = "re_session_entry_flash_v1";
const DURATION_MS = 2200;
const DURATION_REDUCED_MS = 1000;

/**
 * Full-screen flash with Uiverse (SelfMadeSystem) ring animation — blue/white “RealEstate”.
 * Runs once per tab session on first load (no login state), and after login via location.state.reSplash.
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
    return () => window.clearTimeout(id);
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
    return () => window.clearTimeout(id);
  }, [duration, location.state]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className={`re-splash-loader flex flex-col items-center gap-6 ${reducedMotion ? "re-splash-reduced" : ""}`}>
        <svg className="re-splash-svg h-24 w-24" viewBox="0 0 120 120" aria-hidden>
          <circle
            className="re-splash-dash"
            cx="60"
            cy="60"
            r="52"
            pathLength="360"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            className="re-splash-spin"
            cx="60"
            cy="60"
            r="34"
            pathLength="360"
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-center font-serif text-2xl font-bold tracking-tight text-foreground">
          <span className="text-primary">Real</span>
          <span className="text-foreground/90">Estate</span>
        </p>
      </div>
    </div>
  );
}

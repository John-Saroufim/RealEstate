import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

type ScrollToTopProps = {
  /**
   * If true, uses smooth scrolling. If false, jumps instantly.
   * Defaults to false for maximum reliability across navigations.
   */
  smooth?: boolean;
};

export function ScrollToTop({ smooth = false }: ScrollToTopProps) {
  const location = useLocation();

  useLayoutEffect(() => {
    // Ensure we scroll after route renders (prevents “flash” at previous scroll position).
    // `requestAnimationFrame` makes it feel consistent across browsers.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: smooth ? "smooth" : "auto" });
    });
  }, [location.pathname, location.hash, smooth]);

  return null;
}


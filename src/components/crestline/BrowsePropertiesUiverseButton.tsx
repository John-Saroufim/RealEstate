import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Triple-chevron SVG for Uiverse Li-Deheng–style CTA (polygons animate on hover). */
function BrowseChevronSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 20" aria-hidden>
      <polygon points="2,10 8,3 8,17" />
      <polygon points="10,10 16,3 16,17" />
      <polygon points="18,10 24,3 24,17" />
    </svg>
  );
}

type Props = {
  className?: string;
  /** Hero: run search + navigate */
  onClick?: () => void;
  /** Larger type on hero */
  size?: "default" | "lg";
};

/**
 * “Browse Properties” CTA styled after Uiverse.io (Li-Deheng).
 * Use `onClick` for hero; omit for a plain link to `/crestline/properties`.
 */
export function BrowsePropertiesUiverseButton({ className, onClick, size = "default" }: Props) {
  const inner = (
    <>
      <span>Browse Properties</span>
      <BrowseChevronSvg />
    </>
  );

  const sizeClass = size === "lg" ? "browse-properties-uiverse-btn--lg" : "";

  if (onClick) {
    return (
      <button
        type="button"
        className={cn("browse-properties-uiverse-btn", sizeClass, className)}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link to="/crestline/properties" className={cn("browse-properties-uiverse-btn", sizeClass, className)}>
      {inner}
    </Link>
  );
}

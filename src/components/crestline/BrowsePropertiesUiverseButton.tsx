import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Triple-chevron SVG for Uiverse Li-Deheng–style CTA (polygons animate on hover). Right-pointing, left-to-right in DOM for nth-child. */
function BrowseChevronSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 20" aria-hidden>
      <polygon points="10,10 4,3 4,17" />
      <polygon points="18,10 12,3 12,17" />
      <polygon points="26,10 20,3 20,17" />
    </svg>
  );
}

type Props = {
  className?: string;
  /** Hero: run search + navigate */
  onClick?: () => void;
};

/**
 * “Browse Properties” CTA styled after Uiverse.io (Li-Deheng).
 * Use `onClick` for hero; omit for a plain link to `/crestline/properties`.
 */
export function BrowsePropertiesUiverseButton({ className, onClick }: Props) {
  const inner = (
    <>
      <span>Browse Properties</span>
      <BrowseChevronSvg />
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={cn("browse-properties-uiverse-btn", className)} onClick={onClick}>
        {inner}
      </button>
    );
  }

  return (
    <Link to="/crestline/properties" className={cn("browse-properties-uiverse-btn", className)}>
      {inner}
    </Link>
  );
}

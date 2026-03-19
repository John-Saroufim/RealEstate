import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bed, Bath, MapPin, Ruler } from "lucide-react";

import { Button } from "@/components/ui/button";

type PropertyCardProps = {
  to: string;
  imageUrl?: string | null;
  title?: string | null;
  price?: string | number | null;
  location?: string | null;
  status?: string | null;
  type?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
};

export function PropertyCard({
  to,
  imageUrl,
  title,
  price,
  location,
  status,
  type,
  beds,
  baths,
  sqft,
}: PropertyCardProps) {
  const navigate = useNavigate();

  const priceLabel = useMemo(() => {
    if (price === null || price === undefined) return "Price on request";
    if (typeof price === "number") {
      return price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });
    }
    const trimmed = String(price).trim();
    return trimmed.length ? trimmed : "Price on request";
  }, [price]);

  const statusLabel = status ?? "For Sale";

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={title ? `View property: ${title}` : "View property"}
      onClick={() => navigate(to)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(to);
        }
      }}
      className="group h-full cursor-pointer select-none flex flex-col bg-crestline-surface border border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:border-crestline-gold/25 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-white/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title ?? "Property"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-crestline-muted">
            No image
          </div>
        )}

        {/* Hover overlay: subtle fade so the card feels “premium” */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="absolute top-4 left-4 bg-crestline-bg/80 backdrop-blur-sm text-crestline-gold text-xs font-semibold px-3 py-1.5 tracking-wider uppercase">
          {statusLabel}
        </div>

        {type ? (
          <div className="absolute top-4 right-4 bg-crestline-bg/80 backdrop-blur-sm text-white text-xs px-3 py-1.5">
            {type}
          </div>
        ) : null}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-crestline-gold font-serif text-xl sm:text-2xl font-bold leading-tight">
          {priceLabel}
        </p>
        {title ? (
          <h3 className="mt-2 font-serif text-lg sm:text-xl font-bold text-white leading-snug">
            {title}
          </h3>
        ) : null}

        {location ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-crestline-muted">
            <MapPin className="h-4 w-4 text-crestline-gold" />
            <span className="leading-relaxed">{location}</span>
          </div>
        ) : null}

        {/* Details row */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-crestline-muted border-t border-white/5 pt-4">
          {beds != null ? (
            <span className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-crestline-gold" /> {beds} Beds
            </span>
          ) : null}
          {baths != null ? (
            <span className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-crestline-gold" /> {baths} Baths
            </span>
          ) : null}
          {sqft != null ? (
            <span className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-crestline-gold" /> {sqft.toLocaleString()} sqft
            </span>
          ) : null}
        </div>

        {/* CTA pinned to the bottom for consistent card height */}
        <div className="mt-auto pt-5">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(to);
            }}
            className="w-full bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none h-11 transition-colors duration-200"
          >
            View Property
          </Button>
        </div>
      </div>
    </div>
  );
}


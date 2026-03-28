import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bed, Bath, MapPin, Ruler, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  to: string;
  /** When set, detail page can return here (path + query) via router state. */
  locationState?: { from: string };
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
  locationState,
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

  const goToProperty = () => navigate(to, locationState ? { state: locationState } : undefined);

  const propertyId = useMemo(() => {
    const parts = to.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? to;
  }, [to]);

  const favoritesKey = "crestline_favorites_v1";
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(favoritesKey);
      const ids = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(ids)) setIsFavorite(ids.includes(propertyId));
    } catch {
      // Ignore storage issues (still allow UI to work).
    }
  }, [propertyId]);

  const toggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsFavorite((prev) => {
      const next = !prev;
      if (typeof window === "undefined") return next;
      try {
        const raw = window.localStorage.getItem(favoritesKey);
        const ids = raw ? (JSON.parse(raw) as unknown) : [];
        const current = Array.isArray(ids) ? ids : [];
        const nextIds = next ? Array.from(new Set([...current, propertyId])) : current.filter((id) => id !== propertyId);
        window.localStorage.setItem(favoritesKey, JSON.stringify(nextIds));
      } catch {
        // Ignore storage issues.
      }
      return next;
    });
  };

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
      onClick={goToProperty}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToProperty();
        }
      }}
      className="group h-full cursor-pointer select-none flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-crestline-gold/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title ?? "Property"}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-crestline-muted">
            No image
          </div>
        )}

        {/* Always-on gradient overlay for premium legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/25 to-transparent pointer-events-none" />

        {/* Hover lift overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-crestline-gold/15 to-sky-200/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="absolute top-4 left-4 bg-slate-950/60 backdrop-blur-sm text-sky-100 text-xs font-semibold px-3 py-1.5 tracking-wider uppercase border border-white/10">
          {statusLabel}
        </div>

        {type ? (
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-slate-50 text-xs px-3 py-1.5 border border-white/15">
            {type}
          </div>
        ) : null}

        {/* Favorite — Uiverse dotted “like” control */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          className={cn("property-fav-like-wrapper absolute bottom-4 right-4 z-10 max-w-[min(100%,11rem)]", isFavorite && "property-fav-like-wrapper--favorited")}
        >
          <span className="property-fav-like-inner">
            <Heart className="property-fav-like-icon property-fav-like-icon-inactive text-white" fill="none" stroke="currentColor" strokeWidth={2} />
            <Heart className="property-fav-like-icon property-fav-like-icon-active text-[#f52121]" fill="currentColor" stroke="none" strokeWidth={0} />
            <span className="property-fav-like-text">Favorite</span>
          </span>
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="font-display text-2xl font-bold leading-tight tracking-tight text-crestline-gold">
          {priceLabel}
        </p>
        {title ? (
          <h3 className="mt-2 text-xl font-bold leading-snug text-slate-900">
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
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-crestline-muted border-t border-slate-200 pt-4">
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
              goToProperty();
            }}
            className="w-full bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl h-11 transition-colors duration-200"
          >
            View Property
          </Button>
        </div>
      </div>
    </div>
  );
}


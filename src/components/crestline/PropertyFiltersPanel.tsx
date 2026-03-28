import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Search, SlidersHorizontal, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const statusOptions = ["All", "For Sale", "For Rent", "Sold", "Featured"] as const;
const propertySortOptions = [
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Low to high" },
  { id: "price_desc", label: "High to low" },
] as const;

function FilterSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-crestline-muted/95 mb-3 sm:mb-3.5">
      {children}
    </p>
  );
}

function filterChipClass(active: boolean) {
  return cn(
    "inline-flex min-h-[42px] items-center justify-center rounded-lg border px-4 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
    active
      ? "border-crestline-gold/90 bg-crestline-gold text-crestline-on-gold shadow-[0_0_0_1px_rgba(30,64,175,0.22),0_10px_28px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_0_0_1px_rgba(96,165,250,0.12),0_10px_28px_-12px_rgba(0,0,0,0.4)]"
      : "border-slate-200 bg-white text-slate-800 hover:border-crestline-gold/35 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-crestline-gold/40 dark:hover:bg-slate-700/85 dark:hover:text-slate-50",
  );
}

const filterFieldClass =
  "h-12 rounded-lg border border-slate-200 bg-white text-[15px] text-slate-900 shadow-sm shadow-slate-900/5 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none";

const searchInputClass =
  "h-14 rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-[15px] text-slate-900 shadow-sm shadow-slate-900/5 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none";

const divider = (
  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-600/60" aria-hidden />
);

/** Strip non-digits, parse for URL state (commas ignored). */
function parsePriceInputDigits(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, Number.MAX_SAFE_INTEGER);
}

/** Display price filter with thousands separators (en-US). */
function formatPriceInputDisplay(n: number | null): string {
  if (n == null || n < 0) return "";
  return n.toLocaleString("en-US");
}

function PriceFilterInput({
  value,
  onValueChange,
  placeholder,
  id,
  "aria-label": ariaLabel,
}: {
  value: number | null;
  onValueChange: (n: number | null) => void;
  placeholder: string;
  id?: string;
  "aria-label"?: string;
}) {
  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      aria-label={ariaLabel}
      value={formatPriceInputDisplay(value)}
      onChange={(e) => {
        onValueChange(parsePriceInputDigits(e.target.value));
      }}
      className={cn(filterFieldClass, "w-full tabular-nums tracking-tight")}
      placeholder={placeholder}
    />
  );
}

type FieldsProps = {
  selectedType: string;
  selectedStatus: string;
  sort: string;
  availableTypes: string[];
  priceMin: number | null;
  priceMax: number | null;
  bedsMin: number;
  bathsMin: number;
  setParam: (key: string, value: string | number | null | undefined) => void;
};

/** Shared filter controls — used in desktop panel and mobile dialog */
export function PropertyFiltersFields({
  selectedType,
  selectedStatus,
  sort,
  availableTypes,
  priceMin,
  priceMax,
  bedsMin,
  bathsMin,
  setParam,
}: FieldsProps) {
  const minPriceFieldId = useId();
  const maxPriceFieldId = useId();
  const typeOptions = ["All", ...availableTypes];

  return (
    <div className="space-y-10">
      <div>
        <FilterSectionLabel>Property type</FilterSectionLabel>
        <div className="flex flex-wrap gap-2.5">
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setParam("type", t === "All" ? null : t)}
              className={filterChipClass(selectedType === t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {divider}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:gap-10 xl:gap-12">
        <div>
          <FilterSectionLabel>Price range (USD)</FilterSectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-[12px] font-medium text-slate-900/55 dark:text-slate-400"
                htmlFor={minPriceFieldId}
              >
                Minimum
              </label>
              <PriceFilterInput
                id={minPriceFieldId}
                aria-label="Minimum price in USD"
                value={priceMin}
                onValueChange={(n) => setParam("min_price", n)}
                placeholder="No minimum"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-[12px] font-medium text-slate-900/55 dark:text-slate-400"
                htmlFor={maxPriceFieldId}
              >
                Maximum
              </label>
              <PriceFilterInput
                id={maxPriceFieldId}
                aria-label="Maximum price in USD"
                value={priceMax}
                onValueChange={(n) => setParam("max_price", n)}
                placeholder="No maximum"
              />
            </div>
          </div>
        </div>

        <div>
          <FilterSectionLabel>Beds & baths</FilterSectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[12px] font-medium text-slate-900/55 dark:text-slate-400">Beds (min)</label>
              <Input
                type="number"
                min={0}
                value={bedsMin || ""}
                onChange={(e) => setParam("beds", e.target.value === "" ? null : Number(e.target.value))}
                className={cn(filterFieldClass, "w-full")}
                placeholder="Any"
              />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium text-slate-900/55 dark:text-slate-400">Baths (min)</label>
              <Input
                type="number"
                min={0}
                value={bathsMin || ""}
                onChange={(e) => setParam("baths", e.target.value === "" ? null : Number(e.target.value))}
                className={cn(filterFieldClass, "w-full")}
                placeholder="Any"
              />
            </div>
          </div>
        </div>
      </div>

      {divider}

      <div>
        <FilterSectionLabel>Listing status</FilterSectionLabel>
        <div className="flex flex-wrap gap-2.5">
          {statusOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setParam("status", s === "All" ? null : s)}
              className={filterChipClass(selectedStatus === s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {divider}

      <div>
        <FilterSectionLabel>Sort by</FilterSectionLabel>
        <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-100/90 p-1.5 shadow-inner shadow-slate-900/5 sm:flex-row sm:gap-0 dark:border-slate-600/80 dark:bg-slate-900/75 dark:shadow-inner dark:shadow-black/40">
          {propertySortOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setParam("sort", s.id === "newest" ? null : s.id)}
              className={cn(
                "min-h-[48px] flex-1 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                sort === s.id
                  ? "bg-crestline-gold text-crestline-on-gold shadow-[0_4px_16px_-4px_rgba(15,23,42,0.15)] dark:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.45)]"
                  : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/95 dark:hover:text-slate-50",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type PropertyFiltersPanelProps = {
  qParam: string;
  selectedType: string;
  selectedStatus: string;
  sort: string;
  availableTypes: string[];
  locationSuggestions?: string[];
  nameSuggestions?: string[];
  favoritesOnly: boolean;
  favoritesCount: number;
  onToggleFavoritesOnly: () => void;
  /** Hide “Favorites” toggle (e.g. admin listings). Default true. */
  showFavoritesToggle?: boolean;
  priceMin: number | null;
  priceMax: number | null;
  bedsMin: number;
  bathsMin: number;
  setParam: (key: string, value: string | number | null | undefined) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  onOpenMobileFilters: () => void;
};

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function PropertyFiltersPanel({
  qParam,
  selectedType,
  selectedStatus,
  sort,
  availableTypes,
  locationSuggestions,
  nameSuggestions,
  favoritesOnly,
  favoritesCount,
  onToggleFavoritesOnly,
  showFavoritesToggle = true,
  priceMin,
  priceMax,
  bedsMin,
  bathsMin,
  setParam,
  clearFilters,
  hasActiveFilters,
  onOpenMobileFilters,
}: PropertyFiltersPanelProps) {
  const [draftQ, setDraftQ] = useState(qParam);
  const searchDatalistId = "crestline-properties-search-suggestions";

  const combinedSearchSuggestions = useMemo(() => {
    const locs = locationSuggestions ?? [];
    const names = nameSuggestions ?? [];
    // Keep it simple: union + stable ordering. Cap DOM <option> count — huge datalists freeze mobile (filter dialog tap).
    const merged = Array.from(new Set([...names, ...locs]))
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !/^\s*demo\s*listing/i.test(s));
    return merged.slice(0, 120);
  }, [locationSuggestions, nameSuggestions]);

  useEffect(() => {
    setDraftQ(qParam);
  }, [qParam]);

  // Debounce search typing so we don't spam Supabase queries.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setParam("q", draftQ);
    }, 350);
    return () => window.clearTimeout(t);
    // Intentionally only depend on draftQ; setParam is stable from parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftQ]);

  const activePills = useMemo(() => {
    const pills: { id: string; label: string; onRemove: () => void }[] = [];
    const q = qParam.trim();
    if (q) {
      const short = q.length > 28 ? `${q.slice(0, 28)}…` : q;
      pills.push({
        id: "q",
        label: `Search: “${short}”`,
        onRemove: () => setParam("q", null),
      });
    }
    if (selectedType !== "All") {
      pills.push({
        id: "type",
        label: `Type: ${selectedType}`,
        onRemove: () => setParam("type", null),
      });
    }
    if (selectedStatus !== "All") {
      pills.push({
        id: "status",
        label: `Status: ${selectedStatus}`,
        onRemove: () => setParam("status", null),
      });
    }
    if (priceMin != null && priceMin > 0) {
      pills.push({
        id: "min_price",
        label: `Min ${formatUsd(priceMin)}`,
        onRemove: () => setParam("min_price", null),
      });
    }
    if (priceMax != null && priceMax > 0) {
      pills.push({
        id: "max_price",
        label: `Max ${formatUsd(priceMax)}`,
        onRemove: () => setParam("max_price", null),
      });
    }
    if (bedsMin > 0) {
      pills.push({
        id: "beds",
        label: `${bedsMin}+ beds`,
        onRemove: () => setParam("beds", null),
      });
    }
    if (bathsMin > 0) {
      pills.push({
        id: "baths",
        label: `${bathsMin}+ baths`,
        onRemove: () => setParam("baths", null),
      });
    }
    if (sort !== "newest") {
      const label = propertySortOptions.find((s) => s.id === sort)?.label ?? sort;
      pills.push({
        id: "sort",
        label: `Sort: ${label}`,
        onRemove: () => setParam("sort", null),
      });
    }
    return pills;
  }, [qParam, selectedType, selectedStatus, priceMin, priceMax, bedsMin, bathsMin, sort, setParam]);

  const fieldsProps: FieldsProps = {
    selectedType,
    selectedStatus,
    sort,
    availableTypes,
    priceMin,
    priceMax,
    bedsMin,
    bathsMin,
    setParam,
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200",
        "bg-gradient-to-b from-white to-slate-50",
        "shadow-[0_24px_48px_-28px_rgba(15,23,42,0.12)]",
        "dark:border-slate-700/85 dark:bg-gradient-to-b dark:from-crestline-surface dark:to-crestline-bg",
        "dark:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crestline-gold/25 to-transparent"
        aria-hidden
      />
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 mb-8 lg:mb-10">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl lg:text-[1.75rem]">
              Find Your Ideal Property
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-crestline-muted sm:text-[15px]">
              Refine listings by type, price, size, and status
            </p>
          </div>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="shrink-0 gap-2 self-start rounded-lg border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-crestline-gold/35 hover:bg-crestline-gold/10 hover:text-crestline-gold dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-crestline-gold/40 dark:hover:bg-crestline-gold/15 dark:hover:text-crestline-gold"
            >
              <X className="h-4 w-4 opacity-80" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="mb-8 lg:mb-10">
          <FilterSectionLabel>Search</FilterSectionLabel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-crestline-muted/90" />
              <Input
                placeholder="Search by name or location…"
                value={draftQ}
                onChange={(e) => setDraftQ(e.target.value)}
                list={combinedSearchSuggestions.length > 0 ? searchDatalistId : undefined}
                className={cn(searchInputClass, "w-full")}
                onBlur={() => setParam("q", draftQ)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onOpenMobileFilters}
              className="h-14 shrink-0 gap-2 rounded-xl border-slate-200 bg-white px-6 text-sm font-medium text-slate-900 shadow-sm transition-all hover:border-crestline-gold/35 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:shadow-none dark:hover:bg-slate-800 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              All filters
            </Button>
          </div>

          {/* Favorites toggle (public properties only; hidden on admin). */}
          {showFavoritesToggle ? (
            <div className="mt-4 flex items-center justify-start gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onToggleFavoritesOnly}
                className={[
                  "h-12 rounded-xl border border-slate-200 bg-white px-4 font-medium text-slate-900 shadow-sm transition-all duration-200",
                  "hover:border-crestline-gold/35 hover:bg-slate-50 hover:text-slate-900",
                  "dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:shadow-none dark:hover:bg-slate-800",
                  favoritesOnly ? "border-crestline-gold/40 bg-crestline-gold/10 text-crestline-gold" : "",
                ].join(" ")}
              >
                <Heart
                  className={favoritesOnly ? "h-4 w-4 fill-current" : "h-4 w-4"}
                  strokeWidth={favoritesOnly ? 0 : 2}
                />
                <span className="ml-2">Favorites</span>
                <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {favoritesCount}
                </span>
              </Button>
            </div>
          ) : null}
        </div>

        {combinedSearchSuggestions.length > 0 ? (
          <datalist id={searchDatalistId}>
            {combinedSearchSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        ) : null}

        <div className="hidden lg:block">
          <PropertyFiltersFields {...fieldsProps} />
        </div>

        {activePills.length > 0 && (
          <div className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-700/80 lg:mt-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-crestline-muted/90">
              Active filters
            </p>
            <div className="flex flex-wrap gap-2">
              {activePills.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={p.onRemove}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-2 text-xs font-medium text-slate-700 transition-colors hover:border-crestline-gold/35 hover:bg-crestline-gold/10 hover:text-crestline-gold dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-crestline-gold/40 dark:hover:bg-crestline-gold/15"
                >
                  <span>{p.label}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-crestline-gold/20 group-hover:text-crestline-gold dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-crestline-gold/25">
                    <X className="h-3 w-3" aria-hidden />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

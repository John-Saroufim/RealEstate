import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const statusOptions = ["All", "For Sale", "For Rent", "Sold", "Featured"] as const;
const propertySortOptions = [
  { id: "newest", label: "Newest" },
  { id: "price_asc", label: "Low to high" },
  { id: "price_desc", label: "High to low" },
] as const;

function FilterSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-crestline-muted/95 sm:mb-2.5">
      {children}
    </p>
  );
}

function filterChipClass(active: boolean) {
  return cn(
    "inline-flex min-h-[36px] items-center justify-center rounded-lg border px-3 py-1.5 text-[13px] font-medium tracking-wide transition-all duration-200 ease-out sm:min-h-[38px] sm:px-3.5 sm:py-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-crestline-bg",
    active
      ? "border-crestline-gold/90 bg-crestline-gold text-crestline-on-gold shadow-[0_0_0_1px_rgba(30,64,175,0.22),0_10px_28px_-12px_rgba(15,23,42,0.12)] dark:shadow-[0_0_0_1px_rgba(96,165,250,0.12),0_10px_28px_-12px_rgba(0,0,0,0.4)]"
      : "border-slate-200 bg-white text-slate-800 hover:border-crestline-gold/35 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-crestline-gold/40 dark:hover:bg-slate-700/85 dark:hover:text-slate-50",
  );
}

const filterFieldClass =
  "h-11 rounded-lg border border-slate-200 bg-white text-[15px] text-slate-900 shadow-sm shadow-slate-900/5 placeholder:text-slate-400 dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none";

const searchInputClass =
  "h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[15px] text-slate-900 shadow-sm shadow-slate-900/5 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none";

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
    <div className="space-y-6 sm:space-y-7">
      <div>
        <FilterSectionLabel>Property type</FilterSectionLabel>
        <div className="flex flex-wrap gap-2">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:gap-8">
        <div>
          <FilterSectionLabel>Price range (USD)</FilterSectionLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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
        <div className="flex flex-wrap gap-2">
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
        <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-100/90 p-1 shadow-inner shadow-slate-900/5 sm:flex-row sm:gap-0 dark:border-slate-600/80 dark:bg-slate-900/75 dark:shadow-inner dark:shadow-black/40">
          {propertySortOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setParam("sort", s.id === "newest" ? null : s.id)}
              className={cn(
                "min-h-[40px] flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sm:min-h-[42px] sm:px-4 sm:py-2.5",
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
}: PropertyFiltersPanelProps) {
  const [draftQ, setDraftQ] = useState(qParam);
  /** Open by default when URL already has filters (e.g. shared link). */
  const [filtersOpen, setFiltersOpen] = useState(hasActiveFilters);
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

  const activeFilterCount = activePills.length;

  return (
    <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-slate-200",
          "bg-gradient-to-b from-white to-slate-50",
          "shadow-[0_12px_32px_-20px_rgba(15,23,42,0.14)]",
          "dark:border-slate-700/85 dark:bg-gradient-to-b dark:from-crestline-surface dark:to-crestline-bg",
          "dark:shadow-[0_12px_32px_-20px_rgba(0,0,0,0.35)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crestline-gold/25 to-transparent"
          aria-hidden
        />
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg">
              Filters
            </h2>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 shrink-0 gap-1.5 px-2 text-xs font-medium text-crestline-muted hover:text-crestline-gold"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crestline-muted/90" />
              <Input
                placeholder="Search by name or location…"
                value={draftQ}
                onChange={(e) => setDraftQ(e.target.value)}
                list={combinedSearchSuggestions.length > 0 ? searchDatalistId : undefined}
                className={cn(searchInputClass, "w-full")}
                onBlur={() => setParam("q", draftQ)}
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  aria-expanded={filtersOpen}
                  className="h-11 min-w-0 flex-1 gap-2 rounded-xl border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:border-crestline-gold/35 hover:bg-slate-50 sm:flex-initial sm:px-4 dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:shadow-none dark:hover:bg-slate-800"
                >
                  <SlidersHorizontal className="h-4 w-4 shrink-0 opacity-90" />
                  <span>Filters</span>
                  {activeFilterCount > 0 ? (
                    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-crestline-gold/15 px-1.5 py-0.5 text-[11px] font-semibold text-crestline-gold">
                      {activeFilterCount}
                    </span>
                  ) : null}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 opacity-70 transition-transform duration-200",
                      filtersOpen && "rotate-180",
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              {showFavoritesToggle ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onToggleFavoritesOnly}
                  className={cn(
                    "h-11 shrink-0 gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm transition-all duration-200",
                    "hover:border-crestline-gold/35 hover:bg-slate-50",
                    "dark:border-slate-600 dark:bg-slate-900/55 dark:text-slate-100 dark:shadow-none dark:hover:bg-slate-800",
                    favoritesOnly && "border-crestline-gold/40 bg-crestline-gold/10 text-crestline-gold",
                  )}
                >
                  <Heart
                    className={favoritesOnly ? "h-4 w-4 fill-current" : "h-4 w-4"}
                    strokeWidth={favoritesOnly ? 0 : 2}
                  />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {favoritesCount}
                  </span>
                </Button>
              ) : null}
            </div>
          </div>

          {combinedSearchSuggestions.length > 0 ? (
            <datalist id={searchDatalistId}>
              {combinedSearchSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          ) : null}

          {activePills.length > 0 ? (
            <div className="mt-3 border-t border-slate-200/90 pt-3 dark:border-slate-700/70">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-crestline-muted/90">Active</p>
              <div className="flex flex-wrap gap-1.5">
                {activePills.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={p.onRemove}
                    className="group inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1.5 text-[11px] font-medium text-slate-700 transition-colors hover:border-crestline-gold/35 hover:bg-crestline-gold/10 hover:text-crestline-gold dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-crestline-gold/40 dark:hover:bg-crestline-gold/15"
                  >
                    <span className="truncate">{p.label}</span>
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-crestline-gold/20 group-hover:text-crestline-gold dark:bg-slate-700 dark:text-slate-400">
                      <X className="h-2.5 w-2.5" aria-hidden />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <CollapsibleContent className="data-[state=closed]:hidden border-t border-slate-200/90 pt-4 dark:border-slate-700/70">
            <PropertyFiltersFields {...fieldsProps} />
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}

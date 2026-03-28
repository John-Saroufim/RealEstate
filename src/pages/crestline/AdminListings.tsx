import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MapPin, Bed, Bath, Ruler, Plus, Pencil, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AdminStatsOverview } from "@/components/crestline/admin/AdminStatsOverview";
import { MotionSection } from "@/components/MotionSection";
import { PropertyFiltersPanel, PropertyFiltersFields } from "@/components/crestline/PropertyFiltersPanel";

type Listing = {
  id: string;
  title: string;
  price: number;
  location: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  type: string | null;
  status: string | null;
  description: string | null;
  image_url: string | null;
};

const LISTING_STATUSES = ["For Sale", "For Rent", "Sold", "Featured"] as const;

function isDemoListingTitle(title: string | null | undefined): boolean {
  const s = String(title ?? "").trim();
  return /^\s*demo\s*listing/i.test(s);
}

function listingStatusOptions(current: string | null): string[] {
  const base = [...LISTING_STATUSES];
  const s = current?.trim();
  if (s && !(LISTING_STATUSES as readonly string[]).includes(s)) {
    return [s, ...base];
  }
  return base;
}

function listingStatusValue(status: string | null): string {
  return status?.trim() || "For Sale";
}

function parsePriceParam(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export default function AdminListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const qParam = searchParams.get("q") ?? "";
  const selectedType = searchParams.get("type") ?? "All";
  const selectedStatus = searchParams.get("status") ?? "All";
  const sort = searchParams.get("sort") ?? "newest";

  const priceMin = parsePriceParam(searchParams.get("min_price"));
  const priceMax = parsePriceParam(searchParams.get("max_price"));

  const bedsMin = (() => {
    const raw = searchParams.get("beds");
    const n = raw ? Number(raw) : 0;
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, n);
  })();

  const bathsMin = (() => {
    const raw = searchParams.get("baths");
    const n = raw ? Number(raw) : 0;
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, n);
  })();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const fallbackTypes = ["Villa", "Penthouse", "Estate", "Townhouse"];
  const [availableTypes, setAvailableTypes] = useState<string[]>(fallbackTypes);
  const [typesLoading, setTypesLoading] = useState(true);

  const hasActiveFilters =
    Boolean(qParam.trim()) ||
    selectedType !== "All" ||
    selectedStatus !== "All" ||
    priceMin != null ||
    priceMax != null ||
    bedsMin > 0 ||
    bathsMin > 0 ||
    sort !== "newest";

  const setParam = (key: string, value: string | number | null | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === "" || value === "All" || value === 0) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const availableTypesForUI = useMemo(() => {
    if (selectedType === "All") return availableTypes;
    if (!selectedType) return availableTypes;
    if (availableTypes.includes(selectedType)) return availableTypes;
    return [...availableTypes, selectedType];
  }, [availableTypes, selectedType]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setListings([]);
      setError(null);

      const q = qParam.trim().replace(/\s+/g, " ");

      let query = supabase.from("listings").select("*");

      if (q) {
        if (q.includes(",")) {
          query = query.ilike("location", `%${q}%`);
        } else {
          query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%`);
        }
      }

      if (selectedType !== "All") query = query.eq("type", selectedType);
      if (selectedStatus !== "All") query = query.eq("status", selectedStatus);
      if (bedsMin > 0) query = query.gte("beds", bedsMin);
      if (bathsMin > 0) query = query.gte("baths", bathsMin);

      let minP = priceMin;
      let maxP = priceMax;
      if (minP != null && maxP != null && minP > maxP) {
        [minP, maxP] = [maxP, minP];
      }
      if (minP != null && minP > 0) query = query.gte("price", minP);
      if (maxP != null && maxP > 0) query = query.lte("price", maxP);

      if (sort === "price_asc") query = query.order("price", { ascending: true });
      else if (sort === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      query = query.limit(1000);

      const { data, error: qErr } = await query;

      if (qErr) {
        setError("Failed to load listings.");
      } else {
        let next = (data ?? []) as Listing[];
        next = next.filter((p) => !isDemoListingTitle(p.title));
        setListings(next);
      }
      setLoading(false);
    };

    load();
  }, [qParam, selectedType, selectedStatus, priceMin, priceMax, bedsMin, bathsMin, sort]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setTypesLoading(true);
        const { data, error: tErr } = await supabase.from("listings").select("type").limit(5000);
        if (tErr) throw tErr;
        const uniq = Array.from(
          new Set(
            (data ?? [])
              .map((r) => (r as { type?: string }).type)
              .filter((t): t is string => typeof t === "string" && t.trim().length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b));
        if (uniq.length > 0) setAvailableTypes(uniq);
      } catch {
        // keep fallback
      } finally {
        setTypesLoading(false);
      }
    };
    loadTypes();
  }, []);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data, error: lErr } = await supabase.from("listings").select("location").limit(8000);
        if (lErr) throw lErr;
        const uniq = Array.from(
          new Set(
            (data ?? [])
              .map((r) => (r as { location?: string }).location)
              .filter((loc): loc is string => typeof loc === "string" && loc.trim().length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b));
        if (uniq.length > 0) setLocationSuggestions(uniq);
      } catch {
        // keep empty
      }
    };
    loadLocations();
  }, []);

  useEffect(() => {
    const loadNames = async () => {
      try {
        const { data, error: nErr } = await supabase.from("listings").select("title").limit(8000);
        if (nErr) throw nErr;
        const uniq = Array.from(
          new Set(
            (data ?? [])
              .map((r) => (r as { title?: string }).title)
              .filter((t): t is string => typeof t === "string" && t.trim().length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b));
        const filtered = uniq.filter((t) => !isDemoListingTitle(t));
        if (filtered.length > 0) setNameSuggestions(filtered);
      } catch {
        // keep empty
      }
    };
    loadNames();
  }, []);

  const formatPrice = (price: number | null) =>
    price != null ? price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—";

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    const { error: delErr } = await supabase.from("listings").delete().eq("id", id);
    if (delErr) {
      setError("Failed to delete listing.");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    setStatsRefreshKey((v) => v + 1);
  };

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatusId(id);
    setError(null);
    const { error: upErr } = await supabase.from("listings").update({ status }).eq("id", id);
    setUpdatingStatusId(null);
    if (upErr) {
      setError("Failed to update listing status.");
      return;
    }
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    setStatsRefreshKey((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />

      <section className="pt-32 pb-6 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <p className="text-crestline-gold text-xs font-semibold tracking-[0.15em] uppercase mb-2">Admin</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Manage Listings</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/crestline/admin/listings/new")}
                className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Listing
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/crestline/admin/agents")}
                className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-2"
              >
                Manage Agents
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <AdminStatsOverview keys={["listings"]} refreshKey={statsRefreshKey} />
          </div>
        </div>
      </section>

      <MotionSection className="border-b border-slate-200/80 bg-crestline-bg py-10 md:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <PropertyFiltersPanel
              qParam={qParam}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
              sort={sort}
              availableTypes={typesLoading ? fallbackTypes : availableTypesForUI}
              locationSuggestions={locationSuggestions}
              nameSuggestions={nameSuggestions}
              priceMin={priceMin}
              priceMax={priceMax}
              bedsMin={bedsMin}
              bathsMin={bathsMin}
              setParam={setParam}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              onOpenMobileFilters={() => setMobileFiltersOpen(true)}
              favoritesOnly={false}
              onToggleFavoritesOnly={() => {}}
              favoritesCount={0}
              showFavoritesToggle={false}
            />
          </div>

          <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <DialogContent className="max-h-[min(90vh,880px)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-crestline-surface p-0 text-slate-900 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.18)] dark:border-slate-700/85 dark:bg-gradient-to-b dark:from-crestline-surface dark:to-crestline-bg dark:text-slate-100 dark:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.45)] sm:max-w-xl">
              <DialogHeader className="border-b border-slate-200/80 px-6 py-5 dark:border-slate-700/80 sm:px-8">
                <DialogTitle className="font-serif text-2xl tracking-tight text-slate-900 dark:text-slate-100">Refine results</DialogTitle>
                <p className="text-sm text-crestline-muted">Adjust filters — updates apply instantly</p>
              </DialogHeader>
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <PropertyFiltersFields
                  selectedType={selectedType}
                  selectedStatus={selectedStatus}
                  sort={sort}
                  availableTypes={typesLoading ? fallbackTypes : availableTypesForUI}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  bedsMin={bedsMin}
                  bathsMin={bathsMin}
                  setParam={setParam}
                />
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50 px-6 py-5 dark:border-slate-700/80 dark:bg-crestline-bg/90 sm:flex-row sm:justify-end sm:px-8">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
                <Button
                  type="button"
                  className="rounded-lg bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </MotionSection>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <LoadingSpinner label="Loading listings..." />}
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {!loading && listings.length === 0 && !error && !hasActiveFilters && (
            <div className="border border-slate-200 p-10 text-center bg-crestline-surface">
              <div className="mx-auto h-12 w-12 border border-crestline-gold/20 bg-crestline-bg/50 flex items-center justify-center mb-4">
                <Pencil className="h-6 w-6 text-crestline-gold" />
              </div>
              <p className="font-serif text-xl font-bold text-slate-900 mb-2">No listings yet</p>
              <p className="text-sm text-crestline-muted mb-6">Add your first property to start managing galleries, agents, and inquiry submissions.</p>
              <Button
                onClick={() => navigate("/crestline/admin/listings/new")}
                className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl"
              >
                Create your first listing
              </Button>
            </div>
          )}

          {!loading && listings.length === 0 && !error && hasActiveFilters && (
            <div className="border border-slate-200 p-10 text-center bg-crestline-surface">
              <p className="font-serif text-xl font-bold text-slate-900 mb-2">No listings match your filters</p>
              <p className="text-sm text-crestline-muted mb-6">Try clearing or adjusting search, type, price, or status.</p>
              <Button variant="outline" className="rounded-xl border-slate-300" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((p) => (
                <div key={p.id} className="group bg-crestline-surface border border-slate-200 overflow-hidden">
                  <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-crestline-muted text-xs">
                        No image
                      </div>
                    )}
                    <Select
                      value={listingStatusValue(p.status)}
                      onValueChange={(v) => handleStatusChange(p.id, v)}
                      disabled={updatingStatusId === p.id}
                    >
                      <SelectTrigger
                        className={cn(
                          "absolute left-4 top-4 z-20 h-auto min-h-0 w-[max-content] min-w-[158px] justify-between gap-2 rounded-md border border-slate-200",
                          "bg-crestline-bg/90 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-crestline-gold backdrop-blur-sm shadow-sm",
                          "ring-offset-crestline-bg focus:ring-crestline-gold/40 data-[state=open]:ring-2 data-[state=open]:ring-crestline-gold/30",
                          updatingStatusId === p.id && "opacity-60",
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label="Listing status"
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent
                        className="border border-slate-200 bg-crestline-bg text-slate-900"
                        position="popper"
                      >
                        {listingStatusOptions(p.status).map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="cursor-pointer text-sm focus:bg-crestline-gold/15 focus:text-slate-900"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {p.type && (
                      <div className="absolute top-4 right-4 bg-crestline-bg/80 backdrop-blur-sm text-slate-900 text-xs px-3 py-1.5">
                        {p.type}
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-crestline-gold font-serif text-lg font-bold mb-1">
                        {formatPrice(p.price ?? null)}
                      </p>
                      <h2 className="font-serif text-base font-semibold text-slate-900">{p.title}</h2>
                    </div>
                    {p.location && (
                      <div className="flex items-center gap-1.5 text-xs text-crestline-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {p.location}
                      </div>
                    )}
                    <div className="flex items-center flex-wrap gap-3 text-xs text-crestline-muted border-t border-slate-200 pt-3">
                      {p.beds != null && (
                        <span className="flex items-center gap-1.5">
                          <Bed className="h-3.5 w-3.5" /> {p.beds} Beds
                        </span>
                      )}
                      {p.baths != null && (
                        <span className="flex items-center gap-1.5">
                          <Bath className="h-3.5 w-3.5" /> {p.baths} Baths
                        </span>
                      )}
                      {p.sqft != null && (
                        <span className="flex items-center gap-1.5">
                          <Ruler className="h-3.5 w-3.5" /> {p.sqft.toLocaleString()} sqft
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl h-9 px-3 text-xs flex items-center gap-1.5"
                        onClick={() => navigate(`/crestline/admin/listings/${p.id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-xl h-9 px-3 text-xs flex items-center gap-1.5"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                    <div className="pt-1">
                      <Link
                        to="/crestline/properties"
                        className="text-[11px] text-crestline-muted hover:text-crestline-gold"
                      >
                        View on public listings
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { PropertyFiltersPanel, PropertyFiltersFields } from "@/components/crestline/PropertyFiltersPanel";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/crestline/PropertyCard";

type Listing = {
  id: string;
  title: string;
  price: number | null;
  location: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  type: string | null;
  status: string | null;
  description: string | null;
  image_url: string | null;
};

function parsePriceParam(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export default function CrestlineProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
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

  const [properties, setProperties] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const load = async () => {
      const shouldShowSkeleton = properties.length === 0;
      setLoading(shouldShowSkeleton);
      setError(null);

      const q = qParam.trim();

      let query = supabase.from("listings").select("*");

      if (q) {
        query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%`);
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

      query = query.limit(200);

      const { data, error } = await query;

      if (error) {
        setError("Failed to load properties.");
      } else {
        setProperties((data ?? []) as Listing[]);
      }
      setLoading(false);
    };

    load();
  }, [qParam, selectedType, selectedStatus, priceMin, priceMax, bedsMin, bathsMin, sort]);

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-crestline-surface border-b border-crestline-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Our Portfolio</p>
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-slate-900">Exclusive Properties</h1>
          </div>
          <p className="text-crestline-muted max-w-xl">Browse our curated collection of exceptional residences across the most prestigious addresses.</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="border-b border-slate-200/80 bg-crestline-bg py-10 md:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <PropertyFiltersPanel
              qParam={qParam}
              selectedType={selectedType}
              selectedStatus={selectedStatus}
              sort={sort}
              priceMin={priceMin}
              priceMax={priceMax}
              bedsMin={bedsMin}
              bathsMin={bathsMin}
              setParam={setParam}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            />
          </div>

          <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <DialogContent className="max-h-[min(90vh,880px)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-crestline-surface p-0 text-slate-900 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.18)] sm:max-w-xl">
              <DialogHeader className="border-b border-slate-200/80 px-6 py-5 sm:px-8">
                <DialogTitle className="font-serif text-2xl tracking-tight text-slate-900">Refine results</DialogTitle>
                <p className="text-sm text-crestline-muted">Adjust filters — updates apply instantly</p>
              </DialogHeader>
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <PropertyFiltersFields
                  selectedType={selectedType}
                  selectedStatus={selectedStatus}
                  sort={sort}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  bedsMin={bedsMin}
                  bathsMin={bathsMin}
                  setParam={setParam}
                />
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100"
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
      </section>

      {/* Grid */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <p className="mb-10 text-sm font-medium tracking-wide text-crestline-muted lg:mb-12">Loading residences…</p>
          )}
          {error && <p className="mb-10 text-sm text-red-400/95 lg:mb-12">{error}</p>}
          {!loading && !error && (
            <div className="mb-10 border-b border-slate-200/80 pb-8 lg:mb-12 lg:pb-10">
              <p className="font-serif text-3xl text-slate-900 sm:text-4xl">
                <span className="tabular-nums text-crestline-gold">{properties.length}</span>
                <span className="text-slate-800">
                  {" "}
                  {properties.length === 1 ? "residence" : "residences"}
                </span>
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-crestline-muted">
                Matching your search and filters
              </p>
            </div>
          )}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-crestline-surface border border-slate-200 overflow-hidden"
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <div className="w-full h-full bg-slate-50 animate-pulse" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-50 animate-pulse w-2/3" />
                    <div className="h-4 bg-slate-50 animate-pulse w-5/6" />
                    <div className="h-3 bg-slate-50 animate-pulse w-3/5" />
                    <div className="h-20 bg-slate-50 animate-pulse" />
                    <div className="h-10 bg-slate-50 animate-pulse w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !error && properties.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {properties.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-full"
                >
                  <PropertyCard
                    to={`/crestline/properties/${p.id}`}
                    locationState={{ from: `${location.pathname}${location.search}` }}
                    imageUrl={p.image_url}
                    title={p.title}
                    price={p.price}
                    location={p.location}
                    status={p.status}
                    type={p.type}
                    beds={p.beds}
                    baths={p.baths}
                    sqft={p.sqft}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-slate-200">
              <Search className="h-10 w-10 text-crestline-muted mx-auto mb-4" />
              <p className="text-slate-900 font-serif text-lg mb-2">No properties found</p>
              <p className="text-sm text-crestline-muted mb-6">Try adjusting your filters or search terms.</p>
              <Button onClick={clearFilters} className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-none">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}

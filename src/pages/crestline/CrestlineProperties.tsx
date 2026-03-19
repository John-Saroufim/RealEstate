import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Search, SlidersHorizontal, X, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { supabase } from "@/integrations/supabase/client";

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

const types = ["All", "Villa", "Penthouse", "Estate", "Townhouse"];
const priceRanges = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under $3M", min: 0, max: 3000000 },
  { label: "$3M – $5M", min: 3000000, max: 5000000 },
  { label: "$5M – $8M", min: 5000000, max: 8000000 },
  { label: "$8M+", min: 8000000, max: Infinity },
];

export default function CrestlineProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const qParam = searchParams.get("q") ?? "";
  const selectedType = searchParams.get("type") ?? "All";
  const selectedStatus = searchParams.get("status") ?? "All";
  const sort = searchParams.get("sort") ?? "newest";

  const selectedPrice = (() => {
    const raw = searchParams.get("price");
    const n = raw ? Number(raw) : 0;
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(priceRanges.length - 1, n));
  })();

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
    selectedPrice !== 0 ||
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
      const range = priceRanges[selectedPrice];

      let query = supabase.from("listings").select("*");

      if (q) {
        query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%`);
      }

      if (selectedType !== "All") query = query.eq("type", selectedType);
      if (selectedStatus !== "All") query = query.eq("status", selectedStatus);
      if (bedsMin > 0) query = query.gte("beds", bedsMin);
      if (bathsMin > 0) query = query.gte("baths", bathsMin);

      if (range) {
        if (range.min > 0) query = query.gte("price", range.min);
        if (Number.isFinite(range.max)) query = query.lt("price", range.max);
      }

      if (sort === "price_asc") query = query.order("price", { ascending: true });
      else if (sort === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      query = query.limit(200);

      const { data, error } = await query;

      if (error) {
        console.error(error);
        setError("Failed to load properties.");
      } else {
        setProperties((data ?? []) as Listing[]);
      }
      setLoading(false);
    };

    load();
  }, [qParam, selectedType, selectedStatus, selectedPrice, bedsMin, bathsMin, sort]);

  const statusOptions = ["All", "For Sale", "For Rent", "Sold", "Featured"] as const;
  const sortOptions = [
    { id: "newest", label: "Newest" },
    { id: "price_asc", label: "Price: Low to High" },
    { id: "price_desc", label: "Price: High to Low" },
  ] as const;

  const filterPanel = (
    <>
      <div>
        <p className="text-xs text-crestline-muted mb-2 uppercase tracking-wider">Property Type</p>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setParam("type", t === "All" ? null : t)}
              className={`px-4 py-2 text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                selectedType === t
                  ? "bg-crestline-gold text-crestline-bg border-crestline-gold"
                  : "border-white/10 text-white/70 hover:border-crestline-gold/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-crestline-muted mb-2 uppercase tracking-wider">Price Range</p>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setParam("price", i === 0 ? null : i)}
              className={`px-4 py-2 text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                selectedPrice === i
                  ? "bg-crestline-gold text-crestline-bg border-crestline-gold"
                  : "border-white/10 text-white/70 hover:border-crestline-gold/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-crestline-muted mb-2 uppercase tracking-wider">Beds & Baths</p>
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[140px]">
            <label className="block text-[11px] text-crestline-muted mb-1">Beds min</label>
            <Input
              type="number"
              min={0}
              value={bedsMin || ""}
              onChange={(e) => setParam("beds", e.target.value === "" ? null : Number(e.target.value))}
              className="bg-crestline-bg border-white/10 text-white placeholder:text-white/20 rounded-none h-10 focus-visible:ring-crestline-gold/50"
              placeholder="Any"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[11px] text-crestline-muted mb-1">Baths min</label>
            <Input
              type="number"
              min={0}
              value={bathsMin || ""}
              onChange={(e) => setParam("baths", e.target.value === "" ? null : Number(e.target.value))}
              className="bg-crestline-bg border-white/10 text-white placeholder:text-white/20 rounded-none h-10 focus-visible:ring-crestline-gold/50"
              placeholder="Any"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs text-crestline-muted mb-2 uppercase tracking-wider">Listing Status</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setParam("status", s === "All" ? null : s)}
              className={`px-4 py-2 text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                selectedStatus === s
                  ? "bg-crestline-gold text-crestline-bg border-crestline-gold"
                  : "border-white/10 text-white/70 hover:border-crestline-gold/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-crestline-muted mb-2 uppercase tracking-wider">Sort</p>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setParam("sort", s.id === "newest" ? null : s.id)}
              className={`px-4 py-2 text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                sort === s.id
                  ? "bg-crestline-gold text-crestline-bg border-crestline-gold"
                  : "border-white/10 text-white/70 hover:border-crestline-gold/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-crestline-bg text-white font-sans">
      <CrestlineNavbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-crestline-surface border-b border-crestline-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Our Portfolio</p>
          <div className="flex flex-col gap-4">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">Exclusive Properties</h1>
          </div>
          <p className="text-crestline-muted max-w-xl">Browse our curated collection of exceptional residences across the most prestigious addresses.</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-crestline-muted" />
              <Input
                placeholder="Search by name or location..."
                value={qParam}
                onChange={(e) => setParam("q", e.target.value)}
                className="pl-10 bg-crestline-surface border-white/10 text-white placeholder:text-crestline-muted rounded-none focus-visible:ring-crestline-gold/50 h-12"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(true)}
              className="border-white/10 text-white hover:bg-white/5 rounded-none h-12 px-6 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-crestline-gold hover:bg-crestline-gold/10 rounded-none h-12"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>

          <div className="hidden lg:block mt-6">{filterPanel}</div>

          <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <DialogContent className="bg-crestline-bg border border-white/10 text-white p-6 max-w-3xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-white">Filters</DialogTitle>
              </DialogHeader>
              <div className="mt-4">{filterPanel}</div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 rounded-none"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
                <Button
                  className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <p className="text-sm text-crestline-muted mb-8">Loading properties...</p>}
          {error && <p className="text-sm text-red-400 mb-8">{error}</p>}
          {!loading && !error && (
            <p className="text-sm text-crestline-muted mb-8">
              {properties.length} {properties.length === 1 ? "property" : "properties"} found
            </p>
          )}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-crestline-surface border border-white/5 overflow-hidden"
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <div className="w-full h-full bg-white/5 animate-pulse" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/5 animate-pulse w-2/3" />
                    <div className="h-4 bg-white/5 animate-pulse w-5/6" />
                    <div className="h-3 bg-white/5 animate-pulse w-3/5" />
                    <div className="h-20 bg-white/5 animate-pulse" />
                    <div className="h-10 bg-white/5 animate-pulse w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : !error && properties.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-crestline-surface border border-white/5 overflow-hidden hover:border-crestline-gold/20 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transform-gpu"
                >
                  <Link to={`/crestline/properties/${p.id}`} className="block">
                    <div className="relative overflow-hidden aspect-[4/3]">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-in-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-crestline-muted text-xs">
                        No image
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-crestline-bg/80 backdrop-blur-sm text-crestline-gold text-xs font-semibold px-3 py-1.5 tracking-wider uppercase">
                      {p.status ?? "For Sale"}
                    </div>
                    <div className="absolute top-4 right-4 bg-crestline-bg/80 backdrop-blur-sm text-white text-xs px-3 py-1.5">
                      {p.type ?? "Property"}
                    </div>
                    </div>
                    <div className="p-6">
                      <p className="text-crestline-gold font-serif text-xl font-bold mb-1">
                        {p.price != null
                          ? p.price.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })
                          : "Price on request"}
                      </p>
                      <h3 className="font-serif text-lg font-semibold text-white mb-2">{p.title}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-crestline-muted mb-4">
                        <MapPin className="h-3.5 w-3.5" />
                        {p.location ?? "Location available on request"}
                      </div>
                    {/* Keep cards visually consistent even when description is missing */}
                      <p className="text-xs text-crestline-muted leading-relaxed mb-4 min-h-[3.2rem]">
                        {p.description ?? ""}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-crestline-muted border-t border-white/5 pt-4">
                        {p.beds != null && (
                          <span className="flex items-center gap-1.5">
                            <Bed className="h-4 w-4" /> {p.beds} Beds
                          </span>
                        )}
                        {p.baths != null && (
                          <span className="flex items-center gap-1.5">
                            <Bath className="h-4 w-4" /> {p.baths} Baths
                          </span>
                        )}
                        {p.sqft != null && (
                          <span className="flex items-center gap-1.5">
                            <Ruler className="h-4 w-4" /> {p.sqft.toLocaleString()} sqft
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-white/5">
              <Search className="h-10 w-10 text-crestline-muted mx-auto mb-4" />
              <p className="text-white font-serif text-lg mb-2">No properties found</p>
              <p className="text-sm text-crestline-muted mb-6">Try adjusting your filters or search terms.</p>
              <Button onClick={clearFilters} className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none">
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

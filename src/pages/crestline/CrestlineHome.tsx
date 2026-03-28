import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Shield, TrendingUp, Users, ChevronRight, ArrowRight, Phone, CheckCircle2, HelpCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { BrowsePropertiesUiverseButton } from "@/components/crestline/BrowsePropertiesUiverseButton";
import { ContactPropertiesRippleButton } from "@/components/crestline/ContactPropertiesRippleButton";
import heroImg from "@/assets/crestline-hero.jpg";
import prop1 from "@/assets/crestline-prop1.jpg";
import prop2 from "@/assets/crestline-prop2.jpg";
import prop3 from "@/assets/crestline-prop3.jpg";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/crestline/PropertyCard";
import { ReviewStars } from "@/components/crestline/ReviewStars";
import { MotionSection } from "@/components/MotionSection";

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function clampNumber(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parsePriceInputNumber(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return null;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function formatPriceNumber(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  }),
};

type Listing = {
  id: string;
  title: string;
  price: number | null;
  location: string | null;
  beds: number | null;
  baths: number | null;
  image_url: string | null;
};

type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  status: string;
  created_at: string | null;
};

const staticFeatured = [
  { id: "static-1", img: prop1, title: "The Skyline Penthouse", price: "$4,000,000", location: "Upper East Side, New York", beds: 4, baths: 3 },
  { id: "static-2", img: prop2, title: "Mediterranean Villa", price: "$6,800,000", location: "Palm Beach, Florida", beds: 6, baths: 5 },
  { id: "static-3", img: prop3, title: "Sky Terrace Residence", price: "$3,900,000", location: "Manhattan, New York", beds: 3, baths: 3 },
];

const whyUs = [
  { icon: Shield, title: "Trusted Expertise", desc: "Over 15 years of experience navigating the luxury real estate market with unparalleled knowledge." },
  { icon: TrendingUp, title: "Market Intelligence", desc: "Data-driven insights and off-market access that give our clients a decisive advantage." },
  { icon: Users, title: "White-Glove Service", desc: "Dedicated advisors providing personalized, discreet, and detail-oriented support at every step." },
  { icon: Building2, title: "Exclusive Portfolio", desc: "Access to the most coveted properties, many available exclusively through our private network." },
];

const services = [
  { title: "Buying", desc: "Find your dream property with personalized search, private viewings, and expert negotiation." },
  { title: "Selling", desc: "Strategic marketing, premium staging, and global exposure to maximize your property's value." },
  { title: "Investing", desc: "Identify high-yield opportunities with comprehensive market analysis and portfolio advisory." },
];

const faqs = [
  { q: "What areas do you specialize in?", a: "We specialize in luxury properties across New York, Miami, Palm Beach, the Hamptons, and select international markets including London and Dubai." },
  { q: "Do you handle off-market properties?", a: "Yes. A significant portion of our transactions involve off-market or pre-market properties available exclusively through our private network." },
  { q: "What is your typical price range?", a: "Our portfolio typically ranges from $1.5 million to $50 million+, spanning penthouses, estates, waterfront properties, and investment-grade assets." },
  { q: "How does the buying process work?", a: "We begin with a detailed consultation to understand your requirements, followed by curated property selections, private viewings, negotiation, and full transaction management." },
  { q: "Do you offer property management?", a: "Yes. For clients who invest or own multiple properties, we provide comprehensive property management, including tenant placement, maintenance, and financial reporting." },
];

const stats = [
  { value: "$2.4B+", label: "In Properties Sold" },
  { value: "850+", label: "Transactions Closed" },
  { value: "15+", label: "Years of Excellence" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function CrestlineHome() {
  const location = useLocation();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Listing[] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // Hero search state
  type PriceStats = { min: number; max: number; avg: number; step: number };
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [priceStatsLoading, setPriceStatsLoading] = useState(true);
  const [heroPriceMin, setHeroPriceMin] = useState<number | null>(null);
  const [heroPriceMax, setHeroPriceMax] = useState<number | null>(null);
  const [heroPriceMinInput, setHeroPriceMinInput] = useState("");
  const [heroPriceMaxInput, setHeroPriceMaxInput] = useState("");

  const [heroLocation, setHeroLocation] = useState("");
  const [heroType, setHeroType] = useState<string>("All");
  const [heroTypesLoading, setHeroTypesLoading] = useState(true);
  const [heroTypes, setHeroTypes] = useState<string[]>(["Villa", "Penthouse", "Estate", "Townhouse"]);
  const [heroLocationsLoading, setHeroLocationsLoading] = useState(true);
  const [heroLocations, setHeroLocations] = useState<string[]>([]);

  useEffect(() => {
    // Populate hero "type" dropdown from actual listing types.
    const loadTypes = async () => {
      try {
        setHeroTypesLoading(true);
        const { data, error: tErr } = await supabase.from("listings").select("type").limit(5000);
        if (tErr) throw tErr;
        const uniq = Array.from(
          new Set(
            (data ?? [])
              .map((r) => (r as any).type)
              .filter((t): t is string => typeof t === "string" && t.trim().length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b));
        if (uniq.length > 0) setHeroTypes(uniq);
      } catch {
        // Keep existing fallback types.
      } finally {
        setHeroTypesLoading(false);
      }
    };

    loadTypes();
  }, []);

  useEffect(() => {
    // Populate hero location autocomplete from actual listing locations.
    const loadLocations = async () => {
      try {
        setHeroLocationsLoading(true);
        const { data, error } = await supabase.from("listings").select("location").limit(8000);
        if (error) throw error;

        const uniq = Array.from(
          new Set(
            (data ?? [])
              .map((r) => (r as any).location)
              .filter((loc): loc is string => typeof loc === "string" && loc.trim().length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b));

        setHeroLocations(uniq);
      } catch {
        // If anything fails, keep it empty and let users type manually.
      } finally {
        setHeroLocationsLoading(false);
      }
    };

    loadLocations();
  }, []);

  useEffect(() => {
    const loadPriceStats = async () => {
      try {
        setPriceStatsLoading(true);

        const { data, error } = await supabase.from("listings").select("price").limit(5000);
        if (error) throw error;

        const prices = (data ?? [])
          .map((r) => (r as any).price)
          .filter((p): p is number => typeof p === "number" && Number.isFinite(p) && p >= 0);

        if (prices.length === 0) {
          // Fallback: keep the UI functional even if prices are unexpectedly missing.
          const fallbackAvg = 2_500_000;
          const fallback = { min: 0, max: 10_000_000, avg: fallbackAvg, step: Math.max(1, Math.round(fallbackAvg * 0.02)) };
          setPriceStats(fallback);
          setHeroPriceMin(fallback.min);
          setHeroPriceMax(fallback.max);
          setHeroPriceMinInput(formatPriceNumber(fallback.min));
          setHeroPriceMaxInput(formatPriceNumber(fallback.max));
          return;
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((acc, n) => acc + n, 0) / prices.length;

        // Coarse step kept for stats; hero slider uses a finer step (computed at render) for smooth dragging.
        const step = Math.max(1, Math.round(avg * 0.02));

        const stats: PriceStats = { min, max, avg, step };
        setPriceStats(stats);
        setHeroPriceMin(min);
        setHeroPriceMax(max);
        setHeroPriceMinInput(formatPriceNumber(min));
        setHeroPriceMaxInput(formatPriceNumber(max));
      } catch {
        // Fallback if the query fails.
        const fallbackAvg = 2_500_000;
        const fallback = { min: 0, max: 10_000_000, avg: fallbackAvg, step: Math.max(1, Math.round(fallbackAvg * 0.02)) };
        setPriceStats(fallback);
        setHeroPriceMin(fallback.min);
        setHeroPriceMax(fallback.max);
        setHeroPriceMinInput(formatPriceNumber(fallback.min));
        setHeroPriceMaxInput(formatPriceNumber(fallback.max));
      } finally {
        setPriceStatsLoading(false);
      }
    };

    loadPriceStats();
  }, []);

  /** Finer step than DB-derived stats so the hero range slider moves smoothly (~thousands of steps on wide spans). */
  const heroSliderStep = useMemo(() => {
    if (!priceStats || priceStats.max <= priceStats.min) return 1;
    const span = priceStats.max - priceStats.min;
    const step = Math.max(1, Math.floor(span / 4000));
    return Math.min(step, 250_000);
  }, [priceStats]);

  const handleBrowseProperties = () => {
    const params = new URLSearchParams();

    const q = heroLocation.trim();
    if (q) params.set("q", q);

    if (heroType && heroType !== "All") params.set("type", heroType);

    if (priceStats && heroPriceMin != null && heroPriceMax != null) {
      let minP = Math.round(heroPriceMin);
      let maxP = Math.round(heroPriceMax);
      if (minP > maxP) [minP, maxP] = [maxP, minP];

      // Only apply filters if user has moved away from the full available range.
      if (minP > priceStats.min) params.set("min_price", String(minP));
      if (maxP < priceStats.max) params.set("max_price", String(maxP));
    }

    const queryString = params.toString();
    navigate(queryString ? `/crestline/properties?${queryString}` : "/crestline/properties");
  };

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        return;
      }

      setFeatured((data ?? []) as Listing[]);
    };

    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        const { data, error } = await (supabase as any)
          .from("reviews")
          .select("id,name,rating,message,status,created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;
        setReviews((data ?? []) as Review[]);
      } catch {
        setReviewsError("Failed to load reviews.");
      } finally {
        setReviewsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-hidden bg-crestline-bg font-sans text-slate-900">
      <CrestlineNavbar />

      {/* Hero — pt clears fixed nav (h-20) + notch safe-area; dvh avoids iOS 100vh jump */}
      <section className="relative flex min-h-[calc(80dvh+6rem)] items-start overflow-x-hidden overflow-y-hidden pt-[max(6rem,calc(5rem+env(safe-area-inset-top,0px)+1rem))] pb-12 md:items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Luxury real estate" className="w-full h-full object-cover" />
          {/* Premium dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/60 to-slate-950/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-slate-950/5" />
        </div>

        <div className="relative w-full min-w-0 max-w-full">
          <div className="mx-auto flex min-h-[80dvh] max-w-7xl items-start justify-center px-4 sm:px-6 lg:px-8 md:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full text-white"
            >
              <div className="max-w-3xl mx-auto text-center">
                <p className="text-sky-200 text-sm font-semibold tracking-[0.2em] uppercase mb-5">
                  RealEstate | Luxury Brokerage
                </p>
                <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-6 text-white">
                  Find Your Dream Home
                </h1>
                <p className="text-lg text-white/80 mb-8 leading-relaxed">
                  Discover exceptional properties with curated access, discreet guidance, and concierge-level support from experienced brokers.
                </p>

                {/* Search Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleBrowseProperties();
                  }}
                  className="bg-white/5 backdrop-blur rounded-xl border border-white/10 px-5 py-5 sm:px-6 sm:py-6"
                >
                  {/* Location + Type on one row; Price Range full width below so the slider never collides with Type */}
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start min-w-0">
                      <div className="text-left min-w-0">
                        <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60 pointer-events-none z-10" />
                          <Input
                            value={heroLocation}
                            onChange={(e) => setHeroLocation(e.target.value)}
                            placeholder="e.g. Palm Beach, NY"
                            list="crestline-hero-locations"
                            className="bg-transparent border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 pl-10 w-full"
                          />
                        </div>
                      </div>

                      <div className="text-left min-w-0">
                        <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                          Type
                        </label>
                        <select
                          value={heroType}
                          onChange={(e) => setHeroType(e.target.value)}
                          disabled={heroTypesLoading}
                          className="w-full min-w-0 h-12 appearance-none bg-black/25 border border-white/20 text-white rounded-xl px-3 pr-9 text-sm leading-normal focus:outline-none focus:ring-2 focus:ring-sky-200/50 disabled:opacity-60"
                          style={{
                            backgroundImage:
                              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.65)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.65rem center",
                          }}
                        >
                          <option value="All" className="bg-slate-900">
                            All Types
                          </option>
                          {heroTypes.map((t) => (
                            <option key={t} value={t} className="bg-slate-900">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="w-full max-w-full min-w-0 flex flex-col items-center">
                      <label className="block text-xs text-white/70 uppercase tracking-wider mb-2 text-center w-full">
                        Price Range
                      </label>
                      {priceStats ? (
                        <div className="flex flex-col gap-3 w-full items-center min-w-0">
                          {/* Single width for inputs + slider so the track matches the price box */}
                          <div className="flex w-full max-w-[min(100%,20rem)] sm:max-w-[22rem] flex-col gap-3 mx-auto min-w-0">
                          <div className="flex w-full flex-row flex-wrap items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-white/20 bg-black/10 px-2 py-2.5 sm:flex-nowrap sm:gap-3 sm:px-4">
                            <div className="uiverse-input-wrap uiverse-input-wrap--fit shrink-0">
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={heroPriceMinInput}
                                onChange={(e) => {
                                  const nextRaw = e.target.value;
                                  const parsed = parsePriceInputNumber(nextRaw);
                                  if (parsed == null) {
                                    setHeroPriceMinInput("");
                                    return;
                                  }
                                  const upperBound = heroPriceMax ?? priceStats.max;
                                  const next = clampNumber(parsed, priceStats.min, upperBound);
                                  setHeroPriceMin(next);
                                  setHeroPriceMinInput(formatPriceNumber(next));
                                }}
                                onBlur={() => {
                                  const parsed = parsePriceInputNumber(heroPriceMinInput);
                                  const upperBound = heroPriceMax ?? priceStats.max;
                                  const next = parsed == null ? priceStats.min : clampNumber(parsed, priceStats.min, upperBound);
                                  setHeroPriceMin(next);
                                  setHeroPriceMinInput(formatPriceNumber(next));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                }}
                                className="h-10 w-[7.25rem] sm:w-32 rounded-md border border-white/20 bg-black/20 px-2.5 text-xs tabular-nums text-white text-center"
                                aria-label="Minimum price"
                              />
                            </div>
                            <span className="text-white/50 text-sm font-medium shrink-0 select-none pb-0.5" aria-hidden>
                              —
                            </span>
                            <div className="uiverse-input-wrap uiverse-input-wrap--fit shrink-0">
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={heroPriceMaxInput}
                                onChange={(e) => {
                                  const nextRaw = e.target.value;
                                  const parsed = parsePriceInputNumber(nextRaw);
                                  if (parsed == null) {
                                    setHeroPriceMaxInput("");
                                    return;
                                  }
                                  const lowerBound = heroPriceMin ?? priceStats.min;
                                  const next = clampNumber(parsed, lowerBound, priceStats.max);
                                  setHeroPriceMax(next);
                                  setHeroPriceMaxInput(formatPriceNumber(next));
                                }}
                                onBlur={() => {
                                  const parsed = parsePriceInputNumber(heroPriceMaxInput);
                                  const lowerBound = heroPriceMin ?? priceStats.min;
                                  const next = parsed == null ? priceStats.max : clampNumber(parsed, lowerBound, priceStats.max);
                                  setHeroPriceMax(next);
                                  setHeroPriceMaxInput(formatPriceNumber(next));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                }}
                                className="h-10 w-[7.25rem] sm:w-32 rounded-md border border-white/20 bg-black/20 px-2.5 text-xs tabular-nums text-white text-center"
                                aria-label="Maximum price"
                              />
                            </div>
                          </div>
                          <div className="w-full min-w-0 px-0.5 pt-0.5">
                            <Slider
                              min={priceStats.min}
                              max={priceStats.max}
                              step={heroSliderStep}
                              disabled={priceStatsLoading || priceStats.min === priceStats.max}
                              value={[heroPriceMin ?? priceStats.min, heroPriceMax ?? priceStats.max]}
                              onValueChange={(v) => {
                                const [minV, maxV] = v;
                                setHeroPriceMin(minV);
                                setHeroPriceMax(maxV);
                                setHeroPriceMinInput(formatPriceNumber(minV));
                                setHeroPriceMaxInput(formatPriceNumber(maxV));
                              }}
                              className="w-full"
                              aria-label="Price range (min to max)"
                            />
                          </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-12 bg-transparent border border-white/20 text-white/60 rounded-xl px-3 flex items-center">
                          Loading price range…
                        </div>
                      )}
                    </div>
                  </div>
                </form>

                <datalist id="crestline-hero-locations">
                  {heroLocationsLoading ? null : heroLocations.map((loc) => <option key={loc} value={loc} />)}
                </datalist>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-7">
                  <BrowsePropertiesUiverseButton
                    onClick={handleBrowseProperties}
                    className="w-full justify-center sm:w-auto h-auto min-h-0 !text-base font-semibold !py-3 !px-8"
                  />

                  <ContactPropertiesRippleButton
                    to="/crestline/contact"
                    variant="hero"
                    className="w-full sm:w-auto rounded-xl px-8 py-3 text-base font-semibold focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900/80"
                  >
                    Contact Us
                  </ContactPropertiesRippleButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <MotionSection className="py-16 border-y border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
                <div className="font-sans text-3xl sm:text-4xl font-bold text-crestline-gold">{s.value}</div>
                <div className="text-sm text-crestline-muted mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Featured Properties */}
      <MotionSection className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Curated Selection</p>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Featured Properties</h2>
            <p className="text-crestline-muted max-w-xl mx-auto">Handpicked residences that represent the finest in luxury living across our most sought-after markets.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {(featured && featured.length > 0 ? featured : null) ? (
              (featured ?? []).map((p, i) => (
                <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <div className="h-full">
                    <PropertyCard
                      to={`/crestline/properties/${p.id}`}
                      locationState={{ from: `${location.pathname}${location.search}` }}
                      imageUrl={p.image_url ?? prop1}
                      title={p.title}
                      price={p.price}
                      location={p.location}
                      status="Featured"
                      beds={p.beds}
                      baths={p.baths}
                    />
                  </div>
                </motion.div>
              ))
            ) : (
              staticFeatured.map((p, i) => (
              <motion.div key={p.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="h-full">
                  <PropertyCard
                    to={`/crestline/properties/${p.id}`}
                    locationState={{ from: `${location.pathname}${location.search}` }}
                    imageUrl={p.img}
                    title={p.title}
                    price={p.price}
                    location={p.location}
                    status="Featured"
                    beds={p.beds}
                    baths={p.baths}
                  />
                </div>
              </motion.div>
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Link to="/crestline/properties">
              <Button variant="outline" className="border-crestline-gold/30 text-crestline-gold hover:bg-crestline-gold/10 font-semibold rounded-xl px-8 py-3 h-auto">
                View All Properties <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </MotionSection>

      {/* Why Choose Us */}
      <MotionSection className="py-20 sm:py-28 bg-crestline-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">The RealEstate Difference</p>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Clients Choose Us</h2>
            <p className="text-crestline-muted max-w-xl mx-auto">A commitment to excellence that transforms every transaction into an exceptional experience.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div key={item.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-crestline-bg/50 border border-slate-200 p-8 hover:border-crestline-gold/20 transition-all duration-300 group transform-gpu shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <div className="h-12 w-12 border border-crestline-gold/20 flex items-center justify-center mb-5 group-hover:bg-crestline-gold/10 transition-colors">
                  <item.icon className="h-5 w-5 text-crestline-gold" />
                </div>
                <h3 className="font-sans font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-crestline-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Services */}
      <MotionSection className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Our Services</p>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Comprehensive Real Estate Solutions</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div key={s.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="border border-slate-200 p-10 hover:border-crestline-gold/20 transition-all duration-300 text-center transform-gpu shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <h3 className="font-sans text-2xl font-bold text-crestline-gold mb-4">{s.title}</h3>
                <p className="text-sm text-crestline-muted leading-relaxed mb-6">{s.desc}</p>
                <Link to="/crestline/contact">
                  <Button variant="outline" className="border-crestline-gold/30 text-crestline-gold hover:bg-crestline-gold/10 rounded-xl text-sm px-6">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* Testimonials */}
      <MotionSection className="py-20 sm:py-28 bg-crestline-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Client Reviews</p>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
          </motion.div>
          {reviewsLoading ? (
            <div className="flex gap-6 overflow-x-auto md:grid md:grid-cols-3 md:gap-8 md:overflow-visible pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="min-w-[280px] md:min-w-0 md:col-span-1 bg-crestline-bg/50 border border-slate-200 p-8 shadow-sm"
                >
                  <div className="h-4 bg-slate-100 w-24 animate-pulse mb-4" />
                  <div className="h-4 bg-slate-100 w-11/12 animate-pulse mb-3" />
                  <div className="h-4 bg-slate-100 w-9/12 animate-pulse mb-3" />
                  <div className="h-4 bg-slate-100 w-6/12 animate-pulse mb-8" />
                  <div className="h-4 bg-slate-100 w-32 animate-pulse" />
                </div>
              ))}
            </div>
          ) : reviewsError ? (
            <p className="text-sm text-red-400 text-center">{reviewsError}</p>
          ) : reviews.length === 0 ? (
            <div className="border border-slate-200 p-10 text-center bg-crestline-bg/30">
              <p className="font-sans text-xl font-bold text-slate-900 mb-2">No approved reviews yet</p>
              <p className="text-sm text-crestline-muted">Check back soon—new reviews are added after admin approval.</p>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto md:grid md:grid-cols-3 md:gap-8 md:overflow-visible pb-2">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="min-w-[280px] md:min-w-0 md:col-span-1 bg-crestline-bg/50 border border-slate-200 p-8 transform-gpu shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-start mb-4">
                    <ReviewStars rating={Number(r.rating)} sizeClassName="h-4 w-4" />
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                    "{(r.message ?? "").length > 140 ? `${r.message.slice(0, 137)}...` : r.message}"
                  </p>

                  <div>
                    <p className="font-sans font-semibold text-slate-900">{r.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </MotionSection>

      {/* FAQ */}
      <MotionSection className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">FAQ</p>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group border border-slate-200 hover:border-crestline-gold/20 transition-colors">
                <summary className="flex items-center gap-3 cursor-pointer p-6 text-slate-900 font-sans font-semibold text-sm list-none [&::-webkit-details-marker]:hidden">
                  <HelpCircle className="h-4 w-4 text-crestline-gold shrink-0" />
                  <span className="flex-1">{faq.q}</span>
                  <ChevronRight className="h-4 w-4 text-crestline-muted transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6 pl-[3.25rem] text-sm text-crestline-muted leading-relaxed overflow-hidden max-h-0 opacity-0 transition-all duration-300 ease-in-out group-open:max-h-[600px] group-open:opacity-100">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* CTA */}
      <MotionSection className="py-20 sm:py-28 bg-crestline-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Begin Your Journey</p>
            <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Ready to Find Your
              <br />
              <span className="text-crestline-gold">Dream Property?</span>
            </h2>
            <p className="text-crestline-muted max-w-lg mx-auto mb-10 leading-relaxed">
              Connect with our team of luxury real estate advisors for a private consultation tailored to your goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <ContactPropertiesRippleButton
                to="/crestline/contact"
                className="rounded-xl px-10 py-3 text-base font-semibold focus-visible:ring-2 focus-visible:ring-crestline-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-crestline-surface"
              >
                <Phone className="h-4 w-4 shrink-0" />
                Contact Us
              </ContactPropertiesRippleButton>
              <BrowsePropertiesUiverseButton className="justify-center h-auto min-h-0 !text-base font-semibold !py-3 !px-8" />
            </div>
          </motion.div>
        </div>
      </MotionSection>

      <CrestlineFooter />
    </div>
  );
}

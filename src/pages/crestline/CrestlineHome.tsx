import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Shield, TrendingUp, Users, ChevronRight, ArrowRight, Phone, CheckCircle2, HelpCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import heroImg from "@/assets/crestline-hero.jpg";
import prop1 from "@/assets/crestline-prop1.jpg";
import prop2 from "@/assets/crestline-prop2.jpg";
import prop3 from "@/assets/crestline-prop3.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/crestline/PropertyCard";
import { ReviewStars } from "@/components/crestline/ReviewStars";
import { MotionSection } from "@/components/MotionSection";

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
  const priceRanges = [
    { id: "any", label: "Any" },
    { id: "under_2", label: "Under $2M", min: null as number | null, max: 2000000 },
    { id: "2_5", label: "$2M – $5M", min: 2000000, max: 5000000 },
    { id: "5_10", label: "$5M – $10M", min: 5000000, max: 10000000 },
    { id: "10_plus", label: "$10M+", min: 10000000, max: null as number | null },
  ];

  const [heroLocation, setHeroLocation] = useState("");
  const [heroType, setHeroType] = useState<string>("All");
  const [heroPriceRange, setHeroPriceRange] = useState(priceRanges[0].id);
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

  const handleBrowseProperties = () => {
    const params = new URLSearchParams();

    const q = heroLocation.trim();
    if (q) params.set("q", q);

    if (heroType && heroType !== "All") params.set("type", heroType);

    const selectedPrice = priceRanges.find((p) => p.id === heroPriceRange) ?? priceRanges[0];
    if (selectedPrice.id !== "any") {
      if (selectedPrice.min != null) params.set("min_price", String(selectedPrice.min));
      if (selectedPrice.max != null) params.set("max_price", String(selectedPrice.max));
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
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />

      {/* Hero */}
      <section className="relative min-h-[calc(80vh+5rem)] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Luxury real estate" className="w-full h-full object-cover" />
          {/* Premium dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/60 to-slate-950/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-slate-950/5" />
        </div>

        <div className="relative w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
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
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] mb-6 text-white">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-left">
                      <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        <Input
                          value={heroLocation}
                          onChange={(e) => setHeroLocation(e.target.value)}
                          placeholder="e.g. Palm Beach, NY"
                          list="crestline-hero-locations"
                          className="bg-transparent border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 pl-10 focus-visible:ring-sky-200/50"
                        />
                      </div>
                    </div>

                    <div className="text-left">
                      <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                        Price
                      </label>
                      <select
                        value={heroPriceRange}
                        onChange={(e) => setHeroPriceRange(e.target.value)}
                        className="w-full h-12 bg-transparent border border-white/20 text-white rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-sky-200/50"
                      >
                        {priceRanges.map((p) => (
                          <option key={p.id} value={p.id} className="bg-slate-900">
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-left">
                      <label className="block text-xs text-white/70 uppercase tracking-wider mb-2">
                        Type
                      </label>
                      <select
                        value={heroType}
                        onChange={(e) => setHeroType(e.target.value)}
                        disabled={heroTypesLoading}
                        className="w-full h-12 bg-transparent border border-white/20 text-white rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-sky-200/50 disabled:opacity-60"
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
                </form>

                <datalist id="crestline-hero-locations">
                  {heroLocationsLoading ? null : heroLocations.map((loc) => <option key={loc} value={loc} />)}
                </datalist>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-7">
                  <Button
                    type="button"
                    onClick={handleBrowseProperties}
                    className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 font-semibold rounded-xl px-8 py-3 h-auto text-base w-full sm:w-auto"
                  >
                    Browse Properties
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>

                  <Link to="/crestline/contact">
                    <Button
                      variant="outline"
                      className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold rounded-xl px-8 py-3 h-auto text-base w-full sm:w-auto"
                    >
                      Contact Us
                    </Button>
                  </Link>
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
                <div className="font-serif text-3xl sm:text-4xl font-bold text-crestline-gold">{s.value}</div>
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
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Featured Properties</h2>
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
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Clients Choose Us</h2>
            <p className="text-crestline-muted max-w-xl mx-auto">A commitment to excellence that transforms every transaction into an exceptional experience.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div key={item.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-crestline-bg/50 border border-slate-200 p-8 hover:border-crestline-gold/20 transition-all duration-300 group transform-gpu shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <div className="h-12 w-12 border border-crestline-gold/20 flex items-center justify-center mb-5 group-hover:bg-crestline-gold/10 transition-colors">
                  <item.icon className="h-5 w-5 text-crestline-gold" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
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
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Comprehensive Real Estate Solutions</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div key={s.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="border border-slate-200 p-10 hover:border-crestline-gold/20 transition-all duration-300 text-center transform-gpu shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <h3 className="font-serif text-2xl font-bold text-crestline-gold mb-4">{s.title}</h3>
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
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
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
              <p className="font-serif text-xl font-bold text-slate-900 mb-2">No approved reviews yet</p>
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
                    <p className="font-serif font-semibold text-slate-900">{r.name}</p>
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
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="group border border-slate-200 hover:border-crestline-gold/20 transition-colors">
                <summary className="flex items-center gap-3 cursor-pointer p-6 text-slate-900 font-serif font-semibold text-sm list-none [&::-webkit-details-marker]:hidden">
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
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Ready to Find Your
              <br />
              <span className="text-crestline-gold">Dream Property?</span>
            </h2>
            <p className="text-crestline-muted max-w-lg mx-auto mb-10 leading-relaxed">
              Connect with our team of luxury real estate advisors for a private consultation tailored to your goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/crestline/contact">
                <Button className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 font-semibold text-base px-10 py-3 rounded-xl h-auto">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
              <Link to="/crestline/properties">
                <Button variant="outline" className="border-crestline-gold/30 text-crestline-gold hover:bg-crestline-gold/10 font-semibold text-base px-10 py-3 rounded-xl h-auto">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </MotionSection>

      <CrestlineFooter />
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Shield, TrendingUp, Users, ChevronRight, ArrowRight, Phone, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [featured, setFeatured] = useState<Listing[] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

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
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Luxury villa" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/35" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-24 lg:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-white"
          >
            <p className="text-sky-200 text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              Luxury Real Estate Redefined
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 text-white">
              Discover
              <br />
              <span className="text-sky-200">Extraordinary</span>
              <br />
              Living.
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-lg leading-relaxed">
              RealEstate curates the world's most exceptional properties for discerning buyers, investors, and families seeking uncompromising quality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/crestline/properties">
                <Button className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 font-semibold text-base px-8 py-3 rounded-none h-auto">
                  View Properties
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/crestline/contact">
                <Button
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white font-semibold text-base px-8 py-3 rounded-none h-auto"
                >
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-crestline-gold/10 bg-crestline-surface">
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
      </section>

      {/* Featured Properties */}
      <section className="py-20 sm:py-28">
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
              <Button variant="outline" className="border-crestline-gold/30 text-crestline-gold hover:bg-crestline-gold/10 font-semibold rounded-none px-8 py-3 h-auto">
                View All Properties <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 sm:py-28 bg-crestline-surface">
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
      </section>

      {/* Services */}
      <section className="py-20 sm:py-28">
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
                  <Button variant="outline" className="border-crestline-gold/30 text-crestline-gold hover:bg-crestline-gold/10 rounded-none text-sm px-6">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 bg-crestline-surface">
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
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
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
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-crestline-surface">
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
                <Button className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 font-semibold text-base px-10 py-3 rounded-none h-auto">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </Link>
              <Link to="/crestline/properties">
                <Button variant="outline" className="border-crestline-gold/30 text-crestline-gold hover:bg-crestline-gold/10 font-semibold text-base px-10 py-3 rounded-none h-auto">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}

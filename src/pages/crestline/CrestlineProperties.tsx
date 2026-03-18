import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Search, SlidersHorizontal, X, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import prop1 from "@/assets/crestline-prop1.jpg";
import prop2 from "@/assets/crestline-prop2.jpg";
import prop3 from "@/assets/crestline-prop3.jpg";
import prop4 from "@/assets/crestline-prop4.jpg";
import prop5 from "@/assets/crestline-prop5.jpg";
import prop6 from "@/assets/crestline-prop6.jpg";

const allProperties = [
  { id: 1, img: prop1, title: "The Skyline Penthouse", price: 4250000, priceLabel: "$4,250,000", location: "Upper East Side, New York", beds: 4, baths: 3, sqft: "4,200", type: "Penthouse", status: "For Sale", desc: "Floor-to-ceiling windows with panoramic city views, marble finishes, and private rooftop terrace." },
  { id: 2, img: prop2, title: "Mediterranean Villa", price: 6800000, priceLabel: "$6,800,000", location: "Palm Beach, Florida", beds: 6, baths: 5, sqft: "7,800", type: "Villa", status: "For Sale", desc: "Oceanfront estate with pool, guest house, and classic Mediterranean architecture." },
  { id: 3, img: prop3, title: "Sky Terrace Residence", price: 3900000, priceLabel: "$3,900,000", location: "Manhattan, New York", beds: 3, baths: 3, sqft: "3,100", type: "Penthouse", status: "For Sale", desc: "Ultra-modern penthouse with wraparound terrace and 360-degree skyline views." },
  { id: 4, img: prop4, title: "The Heritage Estate", price: 8500000, priceLabel: "$8,500,000", location: "Greenwich, Connecticut", beds: 7, baths: 6, sqft: "12,000", type: "Estate", status: "For Sale", desc: "Grand stone estate on 5 acres with manicured gardens, pool house, and guest quarters." },
  { id: 5, img: prop5, title: "Parkview Townhouse", price: 2200000, priceLabel: "$2,200,000", location: "Brooklyn Heights, New York", beds: 4, baths: 3, sqft: "3,600", type: "Townhouse", status: "For Sale", desc: "Beautifully restored brownstone with private garden, modern kitchen, and historic character." },
  { id: 6, img: prop6, title: "Hillside Modern Villa", price: 5600000, priceLabel: "$5,600,000", location: "Beverly Hills, California", beds: 5, baths: 4, sqft: "6,200", type: "Villa", status: "For Sale", desc: "Contemporary glass villa with infinity pool, home cinema, and breathtaking canyon views." },
];

const types = ["All", "Villa", "Penthouse", "Estate", "Townhouse"];
const priceRanges = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under $3M", min: 0, max: 3000000 },
  { label: "$3M – $5M", min: 3000000, max: 5000000 },
  { label: "$5M – $8M", min: 5000000, max: 8000000 },
  { label: "$8M+", min: 8000000, max: Infinity },
];

export default function CrestlineProperties() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = allProperties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || p.type === selectedType;
    const range = priceRanges[selectedPrice];
    const matchesPrice = p.price >= range.min && p.price < range.max;
    return matchesSearch && matchesType && matchesPrice;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedPrice(0);
  };

  const hasActiveFilters = searchQuery || selectedType !== "All" || selectedPrice !== 0;

  return (
    <div className="min-h-screen bg-crestline-bg text-white font-sans">
      <CrestlineNavbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-crestline-surface border-b border-crestline-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-3">Our Portfolio</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">Exclusive Properties</h1>
          <p className="text-crestline-muted max-w-xl">Browse our curated collection of exceptional residences across the most prestigious addresses.</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-crestline-muted" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-crestline-surface border-white/10 text-white placeholder:text-crestline-muted rounded-none focus-visible:ring-crestline-gold/50 h-12"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-white/10 text-white hover:bg-white/5 rounded-none h-12 px-6"
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

          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 flex flex-col sm:flex-row gap-6">
              <div>
                <p className="text-xs text-crestline-muted mb-2 uppercase tracking-wider">Property Type</p>
                <div className="flex flex-wrap gap-2">
                  {types.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`px-4 py-2 text-xs font-medium border transition-colors ${
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
                      onClick={() => setSelectedPrice(i)}
                      className={`px-4 py-2 text-xs font-medium border transition-colors ${
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
            </motion.div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-crestline-muted mb-8">{filtered.length} {filtered.length === 1 ? "property" : "properties"} found</p>
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-crestline-surface border border-white/5 overflow-hidden hover:border-crestline-gold/20 transition-all duration-500"
                >
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-crestline-bg/80 backdrop-blur-sm text-crestline-gold text-xs font-semibold px-3 py-1.5 tracking-wider uppercase">
                      {p.status}
                    </div>
                    <div className="absolute top-4 right-4 bg-crestline-bg/80 backdrop-blur-sm text-white text-xs px-3 py-1.5">
                      {p.type}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-crestline-gold font-serif text-xl font-bold mb-1">{p.priceLabel}</p>
                    <h3 className="font-serif text-lg font-semibold text-white mb-2">{p.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-crestline-muted mb-3">
                      <MapPin className="h-3.5 w-3.5" />
                      {p.location}
                    </div>
                    <p className="text-xs text-crestline-muted leading-relaxed mb-4">{p.desc}</p>
                    <div className="flex items-center gap-4 text-sm text-crestline-muted border-t border-white/5 pt-4">
                      <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" /> {p.beds} Beds</span>
                      <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" /> {p.baths} Baths</span>
                      <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4" /> {p.sqft} sqft</span>
                    </div>
                    <Link to="/crestline/contact">
                      <Button className="w-full mt-5 bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none font-semibold text-sm">
                        Inquire Now
                      </Button>
                    </Link>
                  </div>
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

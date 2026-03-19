import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Bed,
  Bath,
  Ruler,
  MapPin,
  Building2,
  CheckCircle2,
  Phone,
  Shield,
  Loader2,
  Package2,
  Users,
  Waves,
} from "lucide-react";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/crestline/PropertyCard";

type Property = {
  id: string;
  title: string | null;
  price: number | null;
  location: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  type: string | null;
  status: string | null;
  description: string | null;
  image_url: string | null;
  agent_id?: string | null;
  address?: string | null;
  city?: string | null;
  year_built?: number | null;
  parking?: string | null;
  furnished?: string | null;
  lot_size?: string | null;
  hoa?: string | null;
  amenities?: unknown;
  facts?: unknown;
};

type Agent = {
  id: string;
  full_name: string | null;
  title: string | null;
  phone: string | null;
  bio: string | null;
  profile_image_url: string | null;
  specialties: unknown;
  city: string | null;
};

type GalleryImage = {
  id: string;
  url: string;
  alt: string;
};

function formatPrice(price: number | null | undefined) {
  if (price == null) return "Price on request";
  return price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function coerceAmenities(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export default function CrestlinePropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const reducedMotion = useReducedMotion();

  const [property, setProperty] = useState<Property | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [related, setRelated] = useState<Property[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [inquiry, setInquiry] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const propertyTitle = property?.title ?? "";
  const prefillMessage = useMemo(() => (propertyTitle ? `I am interested in ${propertyTitle}. Please share availability and next steps.` : ""), [propertyTitle]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setProperty(null);
    setGallery([]);
    setAgent(null);
    setRelated([]);
    setActiveImageIndex(0);
    setSubmitted(false);

    const load = async () => {
      try {
        const { data, error } = await (supabase as any).from("listings").select("*").eq("id", id).single();
        if (error) throw error;
        if (!data) {
          setError("Property not found.");
          setLoading(false);
          return;
        }

        const loaded: Property = data as Property;
        setProperty(loaded);

        // Gallery images: prefer listing_images if it exists; fallback to `image_url`.
        let images: GalleryImage[] = [];
        const { data: imgData, error: imgErr } = await (supabase as any)
          .from("listing_images")
          .select("id, image_url, image_path")
          .eq("listing_id", id)
          .order("sort_order", { ascending: true });

        if (!imgErr && Array.isArray(imgData) && imgData.length > 0) {
          images = (imgData as any[]).map((img) => {
            const url = img.image_url ?? img.image_path ?? "";
            return { id: String(img.id), url, alt: loaded.title ?? "Property image" };
          });
        } else if (loaded.image_url) {
          images = [{ id: "primary", url: loaded.image_url, alt: loaded.title ?? "Property image" }];
        }

        if (images.length === 0 && loaded.image_url) {
          images = [{ id: "primary", url: loaded.image_url, alt: loaded.title ?? "Property image" }];
        }

        setGallery(images);

        // Optional agent fetch (only if agent_id exists + agents table exists).
        if (loaded.agent_id) {
          const { data: agentData, error: agentErr } = await (supabase as any).from("agents").select("*").eq("id", loaded.agent_id).single();
          if (!agentErr && agentData) setAgent(agentData as Agent);
        }

        // Related properties: same type + status (best-effort), excluding this listing.
        const relQuery = (supabase as any)
          .from("listings")
          .select("*")
          .neq("id", id);

        if (loaded.type) relQuery.eq("type", loaded.type);
        if (loaded.status) relQuery.eq("status", loaded.status);

        const { data: relData, error: relErr } = await relQuery
          .order("created_at", { ascending: false })
          .limit(3);

        if (!relErr && Array.isArray(relData)) {
          setRelated(relData as Property[]);
        }
      } catch (e: any) {
        setError("Failed to load property.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    // Pre-fill message once when property arrives (but don't overwrite user edits).
    if (!propertyTitle) return;
    setInquiry((prev) => {
      if (prev.message.trim().length > 0) return prev;
      return { ...prev, message: prefillMessage };
    });
  }, [propertyTitle, prefillMessage]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!inquiry.full_name.trim()) e.full_name = "Full name is required";
    if (!inquiry.email.trim()) e.email = "Email is required";
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(inquiry.email)) e.email = "Enter a valid email";
    if (!inquiry.message.trim()) e.message = "Message is required";
    if (inquiry.message.trim().length < 10) e.message = "Message should be at least 10 characters";
    if (inquiry.message.trim().length > 2000) e.message = "Message must be under 2000 characters";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!property) return;
    if (!validate()) return;

    setSubmitting(true);
    setFieldErrors({});

    try {
      const payload = {
        full_name: inquiry.full_name.trim(),
        email: inquiry.email.trim(),
        phone: inquiry.phone.trim() || null,
        message: inquiry.message.trim(),

        property_id: property.id,
        property_title_snapshot: property.title,
        agent_id: property.agent_id ?? agent?.id ?? null,

        inquiry_type: "property_inquiry",
        status: "new",
        read: false,
        archived: false,
      };

      const { error } = await (supabase as any).from("inquiries").insert(payload);
      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Inquiry sent",
        description: "Thank you. Our team will reach out shortly regarding this property.",
      });

      setInquiry({ full_name: "", email: "", phone: "", message: prefillMessage });
    } catch (e: any) {
      toast({
        title: "Could not send inquiry",
        description: e?.message ?? "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const status = property?.status ?? "";
  const statusBadge = status || "For Sale";

  const images = gallery;
  const activeImage = images[Math.min(activeImageIndex, Math.max(0, images.length - 1))];

  return (
    <div className="min-h-screen bg-crestline-bg text-white font-sans">
      <CrestlineNavbar />

      <div className="pt-32">
        {loading ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
                <div className="w-full aspect-[16/10] bg-white/5 animate-pulse" />
              </div>
              <div className="lg:col-span-2">
                <div className="h-6 w-2/3 bg-white/5 animate-pulse mb-4" />
                <div className="h-10 w-full bg-white/5 animate-pulse mb-4" />
                <div className="h-20 w-full bg-white/5 animate-pulse mb-4" />
                <div className="h-40 w-full bg-white/5 animate-pulse" />
              </div>
            </div>
          </section>
        ) : error || !property ? (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="border border-white/10 p-8 text-center">
              <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">Property</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">Not Found</h1>
              <p className="text-crestline-muted mb-6">{error ?? "This property does not exist."}</p>
              <Button
                onClick={() => navigate("/crestline/properties")}
                className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none"
              >
                Back to Properties
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="grid lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3">
                  {/* Gallery + Title */}
                  <div className="relative border border-white/5 bg-crestline-surface overflow-hidden">
                    <div className="relative">
                      <AnimatePresence mode="wait">
                        {activeImage ? (
                          <motion.img
                            key={activeImage.id}
                            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                            src={activeImage.url}
                            alt={activeImage.alt}
                            loading="eager"
                            decoding="async"
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] object-cover"
                          />
                        ) : (
                          <div className="w-full h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] bg-white/5" />
                        )}
                      </AnimatePresence>

                      <div className="absolute top-5 left-5 bg-crestline-bg/80 backdrop-blur-sm text-crestline-gold text-xs font-semibold px-3 py-1.5 tracking-wider uppercase">
                        {statusBadge}
                      </div>
                    </div>

                    {images.length > 1 && (
                      <div className="px-5 pb-5 pt-4">
                        <div className="flex gap-3 overflow-x-auto">
                          {images.map((img, idx) => (
                            <button
                              key={img.id}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              aria-label={`View image ${idx + 1}`}
                              className={[
                                "relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 border transition-all duration-200",
                                idx === activeImageIndex ? "border-crestline-gold" : "border-white/10 hover:border-crestline-gold/30",
                              ].join(" ")}
                            >
                              <img
                                src={img.url}
                                alt={img.alt}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
                      {property.title}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                      <p className="text-crestline-gold font-serif text-2xl sm:text-3xl font-bold">
                        {formatPrice(property.price)}
                      </p>
                        {(property.address ?? property.location) && (
                        <div className="flex items-center gap-2 text-sm text-crestline-muted">
                          <MapPin className="h-4 w-4 text-crestline-gold" />
                            <span>{property.address ?? property.location}</span>
                        </div>
                      )}
                    </div>

                    {property.description && (
                      <div className="border border-white/5 bg-crestline-surface p-6">
                        <p className="text-sm text-crestline-muted uppercase tracking-wider font-semibold mb-4">
                          Property Description
                        </p>
                        <div className="text-sm sm:text-base text-white/85 leading-relaxed whitespace-pre-line">
                          {property.description}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amenities + Key facts */}
                  <div className="mt-10 grid md:grid-cols-2 gap-8">
                    <div className="border border-white/5 bg-crestline-surface p-6">
                      <p className="text-sm text-crestline-muted uppercase tracking-wider font-semibold mb-4">
                        Key Details
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {property.beds != null && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <Bed className="h-4 w-4 text-crestline-gold" /> {property.beds} Beds
                          </div>
                        )}
                        {property.baths != null && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <Bath className="h-4 w-4 text-crestline-gold" /> {property.baths} Baths
                          </div>
                        )}
                        {property.sqft != null && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <Ruler className="h-4 w-4 text-crestline-gold" /> {property.sqft.toLocaleString()} sqft
                          </div>
                        )}
                        {property.type && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <Building2 className="h-4 w-4 text-crestline-gold" /> {property.type}
                          </div>
                        )}
                        {property.year_built != null && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <CheckCircle2 className="h-4 w-4 text-crestline-gold" /> Built {property.year_built}
                          </div>
                        )}
                        {property.lot_size && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <Package2 className="h-4 w-4 text-crestline-gold" /> Lot {property.lot_size}
                          </div>
                        )}
                        {property.parking && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <Waves className="h-4 w-4 text-crestline-gold" /> {property.parking}
                          </div>
                        )}
                        {property.hoa && (
                          <div className="flex items-center gap-2 text-sm text-white/85">
                            <Users className="h-4 w-4 text-crestline-gold" /> {property.hoa}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border border-white/5 bg-crestline-surface p-6">
                      <p className="text-sm text-crestline-muted uppercase tracking-wider font-semibold mb-4">
                        Amenities
                      </p>
                      {coerceAmenities(property.amenities).length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {coerceAmenities(property.amenities).slice(0, 12).map((a) => (
                            <span
                              key={a}
                              className="px-3 py-1 text-xs border border-white/10 bg-crestline-bg/40 text-white/80"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-crestline-muted">No amenities listed yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Related */}
                  <div className="mt-12">
                    <p className="text-crestline-gold text-sm font-semibold tracking-[0.15em] uppercase mb-4">
                      Related Properties
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-6">Explore More Options</h2>
                    {related.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {related.map((p) => (
                          <div key={p.id} className="h-full">
                            <PropertyCard
                              to={`/crestline/properties/${p.id}`}
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-crestline-muted">No related properties found yet.</p>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Agent card */}
                    {agent ? (
                      <div className="border border-white/5 bg-crestline-surface p-6">
                        <p className="text-sm text-crestline-muted uppercase tracking-wider font-semibold mb-4">
                          Your Advisor
                        </p>
                        <div className="flex items-start gap-4">
                          {agent.profile_image_url ? (
                            <img
                              src={agent.profile_image_url}
                              alt={agent.full_name ?? "Advisor"}
                              className="w-16 h-16 rounded-none border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 border border-white/10 bg-white/5" />
                          )}
                          <div className="flex-1">
                            <div className="font-serif text-lg font-bold text-white">{agent.full_name ?? "Agent"}</div>
                            {agent.title && <div className="text-xs text-crestline-gold uppercase tracking-wider mt-1">{agent.title}</div>}
                            {agent.phone && (
                              <div className="flex items-center gap-2 text-sm text-crestline-muted mt-3">
                                <Phone className="h-4 w-4 text-crestline-gold" />
                                {agent.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        {agent.bio && (
                          <p className="text-sm text-crestline-muted leading-relaxed mt-4">{agent.bio}</p>
                        )}
                      </div>
                    ) : (
                      <div className="border border-white/5 bg-crestline-surface p-6">
                        <p className="text-sm text-crestline-muted uppercase tracking-wider font-semibold mb-4">
                          Private Consultation
                        </p>
                        <p className="text-sm text-crestline-muted leading-relaxed">
                          Share your details and our team will coordinate a private showing or next steps for this listing.
                        </p>
                      </div>
                    )}

                    {/* Inquiry form */}
                    <div className="border border-white/5 bg-crestline-surface p-6">
                      <p className="text-sm text-crestline-muted uppercase tracking-wider font-semibold mb-4">
                        Inquire About This Property
                      </p>

                      {submitted ? (
                        <div className="space-y-3">
                          <CheckCircle2 className="h-10 w-10 text-crestline-gold" />
                          <p className="font-serif text-2xl font-bold text-white">Inquiry Received</p>
                          <p className="text-sm text-crestline-muted leading-relaxed">
                            Thanks for reaching out. We will contact you shortly regarding this property.
                          </p>
                          <Button
                            onClick={() => navigate("/crestline/properties")}
                            className="w-full bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none"
                          >
                            Back to Properties
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                              Full Name *
                            </label>
                            <Input
                              value={inquiry.full_name}
                              onChange={(e) => setInquiry((p) => ({ ...p, full_name: e.target.value }))}
                              className="bg-crestline-bg border-white/10 text-white placeholder:text-white/20 rounded-none h-12 focus-visible:ring-crestline-gold/50"
                              placeholder="John Smith"
                            />
                            {fieldErrors.full_name && (
                              <p className="text-xs text-red-400 mt-1">{fieldErrors.full_name}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                              Email *
                            </label>
                            <Input
                              type="email"
                              value={inquiry.email}
                              onChange={(e) => setInquiry((p) => ({ ...p, email: e.target.value }))}
                              className="bg-crestline-bg border-white/10 text-white placeholder:text-white/20 rounded-none h-12 focus-visible:ring-crestline-gold/50"
                              placeholder="john@example.com"
                            />
                            {fieldErrors.email && (
                              <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                              Phone
                            </label>
                            <Input
                              value={inquiry.phone}
                              onChange={(e) => setInquiry((p) => ({ ...p, phone: e.target.value }))}
                              className="bg-crestline-bg border-white/10 text-white placeholder:text-white/20 rounded-none h-12 focus-visible:ring-crestline-gold/50"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                              Message *
                            </label>
                            <Textarea
                              value={inquiry.message}
                              onChange={(e) => setInquiry((p) => ({ ...p, message: e.target.value }))}
                              rows={5}
                              className="bg-crestline-bg border-white/10 text-white placeholder:text-white/20 rounded-none focus-visible:ring-crestline-gold/50 resize-none"
                            />
                            {fieldErrors.message && (
                              <p className="text-xs text-red-400 mt-1">{fieldErrors.message}</p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none h-12 font-semibold text-sm"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              <>Submit Inquiry</>
                            )}
                          </Button>
                        </form>
                      )}

                      <div className="mt-4 text-xs text-crestline-muted flex items-center gap-2">
                        <Shield className="h-4 w-4 text-crestline-gold" />
                        Your information is handled privately.
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </section>
          </>
        )}
      </div>

      <CrestlineFooter />
    </div>
  );
}


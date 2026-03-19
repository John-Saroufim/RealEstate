import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Ruler, Plus, Pencil, Trash2 } from "lucide-react";

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

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Failed to load listings.");
      } else {
        setListings(data as Listing[]);
      }
      setLoading(false);
    };

    load();
  }, []);

  const formatPrice = (price: number | null) =>
    price != null ? price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—";

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Failed to delete listing.");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-white font-sans">
      <CrestlineNavbar />

      <section className="pt-32 pb-8 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-crestline-gold text-xs font-semibold tracking-[0.15em] uppercase mb-2">Admin</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Manage Listings</h1>
          </div>
          <Button
            onClick={() => navigate("/crestline/admin/listings/new")}
            className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/crestline/admin/agents")}
            className="border-white/20 text-white hover:bg-white/5 rounded-none flex items-center gap-2"
          >
            Manage Agents
          </Button>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <p className="text-crestline-muted">Loading listings...</p>}
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {!loading && listings.length === 0 && !error && (
            <div className="border border-white/5 p-8 text-center">
              <p className="text-sm text-crestline-muted mb-4">No listings yet.</p>
              <Button
                onClick={() => navigate("/crestline/admin/listings/new")}
                className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none"
              >
                Create your first listing
              </Button>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((p) => (
                <div key={p.id} className="group bg-crestline-surface border border-white/5 overflow-hidden">
                  <div className="relative overflow-hidden aspect-[4/3] bg-black/40">
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
                    {p.status && (
                      <div className="absolute top-4 left-4 bg-crestline-bg/80 backdrop-blur-sm text-crestline-gold text-xs font-semibold px-3 py-1.5 tracking-wider uppercase">
                        {p.status}
                      </div>
                    )}
                    {p.type && (
                      <div className="absolute top-4 right-4 bg-crestline-bg/80 backdrop-blur-sm text-white text-xs px-3 py-1.5">
                        {p.type}
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-crestline-gold font-serif text-lg font-bold mb-1">
                        {formatPrice(p.price ?? null)}
                      </p>
                      <h2 className="font-serif text-base font-semibold text-white">{p.title}</h2>
                    </div>
                    {p.location && (
                      <div className="flex items-center gap-1.5 text-xs text-crestline-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        {p.location}
                      </div>
                    )}
                    <div className="flex items-center flex-wrap gap-3 text-xs text-crestline-muted border-t border-white/5 pt-3">
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
                        className="border-white/20 text-white hover:bg-white/5 rounded-none h-9 px-3 text-xs flex items-center gap-1.5"
                        onClick={() => navigate(`/crestline/admin/listings/${p.id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-none h-9 px-3 text-xs flex items-center gap-1.5"
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


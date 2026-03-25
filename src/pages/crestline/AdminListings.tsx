import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import { MapPin, Bed, Bath, Ruler, Plus, Pencil, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AdminStatsOverview } from "@/components/crestline/admin/AdminStatsOverview";

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

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
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
      setError("Failed to delete listing.");
      return;
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
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
                className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-none flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Listing
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/crestline/admin/agents")}
                className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-none flex items-center gap-2"
              >
                Manage Agents
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <AdminStatsOverview keys={["listings"]} />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <LoadingSpinner label="Loading listings..." />}
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {!loading && listings.length === 0 && !error && (
            <div className="border border-slate-200 p-10 text-center bg-crestline-surface">
              <div className="mx-auto h-12 w-12 border border-crestline-gold/20 bg-crestline-bg/50 flex items-center justify-center mb-4">
                <Pencil className="h-6 w-6 text-crestline-gold" />
              </div>
              <p className="font-serif text-xl font-bold text-slate-900 mb-2">No listings yet</p>
              <p className="text-sm text-crestline-muted mb-6">Add your first property to start managing galleries, agents, and inquiry submissions.</p>
              <Button
                onClick={() => navigate("/crestline/admin/listings/new")}
                className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-none"
              >
                Create your first listing
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
                        className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-none h-9 px-3 text-xs flex items-center gap-1.5"
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


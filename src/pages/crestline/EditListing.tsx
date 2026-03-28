import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const LISTING_STATUSES = ["For Sale", "For Rent", "Sold", "Featured"] as const;

function listingStatusOptions(current: string | null): string[] {
  const base = [...LISTING_STATUSES];
  const s = current?.trim();
  if (s && !(LISTING_STATUSES as readonly string[]).includes(s)) {
    return [s, ...base];
  }
  return base;
}

type ListingForm = {
  title: string;
  price: string;
  location: string;
  beds: string;
  baths: string;
  sqft: string;
  type: string;
  status: string;
  description: string;
  image_url: string;
  agent_id: string;
};

type SelectedMedia = {
  id: string;
  file: File;
  previewUrl: string;
  kind: "image" | "video";
};

const emptyForm: ListingForm = {
  title: "",
  price: "",
  location: "",
  beds: "",
  baths: "",
  sqft: "",
  type: "",
  status: "For Sale",
  description: "",
  image_url: "",
  agent_id: "",
};

export default function EditListing() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const selectedMediaRef = useRef<SelectedMedia[]>([]);
  const [agents, setAgents] = useState<Array<{ id: string; full_name: string | null; title: string | null }>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isEditing) return;

    const load = async () => {
      setInitialLoading(true);
      const { data, error } = await (supabase as any).from("listings").select("*").eq("id", id).single();
      if (error) {
        setError("Failed to load listing.");
      } else if (data) {
        setForm({
          title: data.title ?? "",
          price: data.price != null ? String(data.price) : "",
          location: data.location ?? "",
          beds: data.beds != null ? String(data.beds) : "",
          baths: data.baths != null ? String(data.baths) : "",
          sqft: data.sqft != null ? String(data.sqft) : "",
          type: data.type ?? "",
          status: data.status ?? "For Sale",
          description: data.description ?? "",
          image_url: data.image_url ?? "",
          agent_id: (data.agent_id ?? "") as string,
        });
      }
      setInitialLoading(false);
    };

    load();
  }, [id, isEditing]);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("agents")
          .select("id, full_name, title")
          .order("full_name", { ascending: true });

        if (error) throw error;
        setAgents((data ?? []) as any);
      } catch (e) {
        // If the agents table is not set up yet, keep the dropdown empty.
        setAgents([]);
      }
    };

    loadAgents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    selectedMediaRef.current = selectedMedia;
  }, [selectedMedia]);

  useEffect(() => {
    return () => {
      // Cleanup generated object URLs to avoid memory leaks.
      selectedMediaRef.current.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    };
  }, []);

  const handleAddMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
    if (!kind) {
      setError("Only image or video files are allowed.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setSelectedMedia((prev) => [...prev, { id, file, previewUrl, kind }]);
    setError(null);
    e.target.value = "";
  };

  const handleRemoveMedia = (id: string) => {
    setSelectedMedia((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  };

  const clearCurrentCoverImage = () => {
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const uploadedMedia = selectedMedia.length
        ? await Promise.all(
            selectedMedia.map(async (media, idx) => {
              const file = media.file;
              const ext = file.name.split(".").pop() || "jpg";
              const fileName = `${Date.now()}-${idx}-${Math.random().toString(36).slice(2)}.${ext}`;
              const filePath = `listings/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from("listing-images")
                .upload(filePath, file, { upsert: false });

              if (uploadError) {
                throw new Error("Failed to upload media.");
              }

              const { data } = supabase.storage.from("listing-images").getPublicUrl(filePath);
              return { publicUrl: data.publicUrl, filePath, kind: media.kind };
            }),
          )
        : [];

      const uploadedCoverImage = uploadedMedia.find((m) => m.kind === "image")?.publicUrl ?? null;
      const mainImageUrl = uploadedCoverImage ?? (form.image_url ? form.image_url : null);

      const payload = {
        title: form.title.trim() || "Untitled",
        price: form.price ? Number(form.price) : null,
        location: form.location || null,
        beds: form.beds ? Number(form.beds) : null,
        baths: form.baths ? Number(form.baths) : null,
        sqft: form.sqft ? Number(form.sqft) : null,
        type: form.type || null,
        status: form.status || null,
        description: form.description || null,
        image_url: mainImageUrl || null,
        agent_id: form.agent_id || null,
      };

      if (isEditing) {
        const { error } = await (supabase as any).from("listings").update(payload).eq("id", id);
        if (error) throw error;

        // Best-effort gallery support: replace listing_images when new media are uploaded.
        if (uploadedMedia.length > 0) {
          const imageRows = uploadedMedia.map((img, sort_order) => ({
            listing_id: id,
            image_url: img.publicUrl,
            image_path: img.filePath,
            sort_order,
          }));

          try {
            await (supabase as any).from("listing_images").delete().eq("listing_id", id);
          } catch (e) {
            // ignore if listing_images isn't set up yet
          }

          try {
            await (supabase as any).from("listing_images").insert(imageRows);
          } catch (e) {
            // ignore if listing_images isn't set up yet
          }
        }
      } else {
        const { data: inserted, error } = await (supabase as any).from("listings").insert(payload).select("id").single();
        if (error) throw error;

        if (uploadedMedia.length > 0 && inserted?.id) {
          const imageRows = uploadedMedia.map((img, sort_order) => ({
            listing_id: inserted.id,
            image_url: img.publicUrl,
            image_path: img.filePath,
            sort_order,
          }));

          try {
            await (supabase as any).from("listing_images").insert(imageRows);
          } catch (e) {
            // ignore if listing_images isn't set up yet
          }
        }
      }

      toast({
        title: "Saved",
        description: isEditing ? "Listing updated." : "Listing created.",
      });
      setSelectedMedia((prev) => {
        prev.forEach((m) => URL.revokeObjectURL(m.previewUrl));
        return [];
      });
      navigate("/crestline/admin/listings");
    } catch (err: any) {
      const message = err?.message || "Failed to save listing.";
      setError(message);
      toast({
        title: "Save failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />

      <section className="pt-32 pb-8 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-crestline-gold text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              Admin
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              {isEditing ? "Edit Listing" : "New Listing"}
            </h1>
          </div>
          <Button
            variant="outline"
            className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl text-sm"
            onClick={() => navigate("/crestline/admin/listings")}
          >
            Back
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {initialLoading ? (
            <LoadingSpinner label="Loading listing..." />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-crestline-surface p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.3)] sm:p-8"
            >
              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}

              <div className="rounded-xl border border-slate-200 bg-white/90 p-4 sm:p-5">
                <h2 className="mb-4 font-serif text-lg font-semibold text-slate-900">Property Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Title
                  </label>
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Price (USD)
                  </label>
                  <Input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Location
                  </label>
                  <Input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Type (e.g. Villa, Penthouse)
                  </label>
                  <Input
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Beds
                  </label>
                  <Input
                    name="beds"
                    type="number"
                    min="0"
                    value={form.beds}
                    onChange={handleChange}
                    className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Baths
                  </label>
                  <Input
                    name="baths"
                    type="number"
                    min="0"
                    value={form.baths}
                    onChange={handleChange}
                    className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Square Feet
                  </label>
                  <Input
                    name="sqft"
                    type="number"
                    min="0"
                    value={form.sqft}
                    onChange={handleChange}
                    className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((prev) => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-900 rounded-xl h-10 shadow-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900 rounded-xl">
                      {listingStatusOptions(form.status).map((s) => (
                        <SelectItem key={s} value={s} className="cursor-pointer">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Assigned Agent
                  </label>
                  <select
                    value={form.agent_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, agent_id: e.target.value }))}
                    className="bg-white border-slate-200 text-slate-900 rounded-xl h-10 px-3 shadow-sm focus-visible:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name ?? "Agent"}
                        {a.title ? ` (${a.title})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/90 p-4 sm:p-5">
                <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="bg-white border-slate-200 text-slate-900 rounded-xl resize-none shadow-sm"
                />
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 bg-white/90 p-4 sm:p-5">
                <label className="block text-xs text-crestline-muted uppercase tracking-wider">
                  Property Media
                </label>
                {form.image_url && (
                  <div className="mb-2">
                    <p className="text-[11px] text-crestline-muted mb-1">Current cover image:</p>
                    <div className="relative w-full max-w-sm">
                      <img
                        src={form.image_url}
                        alt={form.title}
                        className="w-full border border-slate-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={clearCurrentCoverImage}
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900"
                        aria-label="Remove current cover image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleAddMedia}
                  className="bg-white border-slate-200 text-slate-900 rounded-xl shadow-sm file:bg-crestline-gold file:text-crestline-on-gold file:border-0 file:px-3 file:py-1.5 file:text-xs"
                />
                {selectedMedia.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedMedia.map((m) => (
                      <div key={m.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {m.kind === "video" ? (
                          <video src={m.previewUrl} className="h-40 w-full object-cover" controls />
                        ) : (
                          <img src={m.previewUrl} alt={m.file.name} className="h-40 w-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(m.id)}
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900"
                          aria-label="Remove selected media"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="px-3 py-2 text-[11px] text-crestline-muted">
                          {m.kind === "video" ? "Video" : "Image"} - {m.file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                <p className="text-[11px] text-crestline-muted">
                  Add one image or video at a time. Each selected item appears below and can be removed with the X before saving.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl"
                  onClick={() => navigate("/crestline/admin/listings")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl"
                >
                  {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Listing"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}


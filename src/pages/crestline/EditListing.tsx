import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
  const [files, setFiles] = useState<File[]>([]);
  const [agents, setAgents] = useState<Array<{ id: string; full_name: string | null; title: string | null }>>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isEditing) return;

    const load = async () => {
      setInitialLoading(true);
      const { data, error } = await (supabase as any).from("listings").select("*").eq("id", id).single();
      if (error) {
        console.error(error);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const uploadedImages = files.length
        ? await Promise.all(
            files.map(async (file, idx) => {
              const ext = file.name.split(".").pop() || "jpg";
              const fileName = `${Date.now()}-${idx}-${Math.random().toString(36).slice(2)}.${ext}`;
              const filePath = `listings/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from("listing-images")
                .upload(filePath, file, { upsert: false });

              if (uploadError) {
                console.error(uploadError);
                throw new Error("Failed to upload image.");
              }

              const { data } = supabase.storage.from("listing-images").getPublicUrl(filePath);
              return { publicUrl: data.publicUrl, filePath };
            }),
          )
        : [];

      const mainImageUrl = uploadedImages[0]?.publicUrl ?? (form.image_url ? form.image_url : null);

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

        // Best-effort gallery support: replace listing_images when new images are uploaded.
        if (uploadedImages.length > 0) {
          const imageRows = uploadedImages.map((img, sort_order) => ({
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

        if (uploadedImages.length > 0 && inserted?.id) {
          const imageRows = uploadedImages.map((img, sort_order) => ({
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
      navigate("/crestline/admin/listings");
    } catch (err: any) {
      console.error(err);
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
    <div className="min-h-screen bg-crestline-bg text-white font-sans">
      <CrestlineNavbar />

      <section className="pt-32 pb-8 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-crestline-gold text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              Admin
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              {isEditing ? "Edit Listing" : "New Listing"}
            </h1>
          </div>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/5 rounded-none text-sm"
            onClick={() => navigate("/crestline/admin/listings")}
          >
            Back
          </Button>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {initialLoading ? (
            <p className="text-crestline-muted">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-400 text-sm">{error}</p>}

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
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
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
                    step="1000"
                    value={form.price}
                    onChange={handleChange}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
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
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
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
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
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
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
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
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
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
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <Input
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                    Assigned Agent
                  </label>
                  <select
                    value={form.agent_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, agent_id: e.target.value }))}
                    className="bg-crestline-surface border-white/10 text-white rounded-none h-10 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crestline-gold/50"
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

              <div>
                <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="bg-crestline-surface border-white/10 text-white rounded-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-crestline-muted uppercase tracking-wider">
                  Property Image
                </label>
                {form.image_url && (
                  <div className="mb-2">
                    <p className="text-[11px] text-crestline-muted mb-1">Current image:</p>
                    <img
                      src={form.image_url}
                      alt={form.title}
                      className="w-full max-w-sm border border-white/10"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                  className="bg-crestline-surface border-white/10 text-white rounded-none file:bg-crestline-gold file:text-crestline-bg file:border-0 file:px-3 file:py-1.5 file:text-xs"
                />
                <p className="text-[11px] text-crestline-muted">
                  Upload one or more images. When you save, your listing gallery will be replaced with the new images you select.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/5 rounded-none"
                  onClick={() => navigate("/crestline/admin/listings")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none"
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


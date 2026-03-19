import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Upload } from "lucide-react";

type Agent = {
  id: string;
  full_name: string | null;
  slug: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  specialties: string[] | null;
  city: string | null;
  years_experience: number | null;
  profile_image_url: string | null;
  is_active: boolean | null;
};

type AgentForm = {
  full_name: string;
  slug: string;
  title: string;
  phone: string;
  email: string;
  bio: string;
  specialtiesCsv: string;
  city: string;
  years_experience: string;
  is_active: boolean;
};

const emptyForm: AgentForm = {
  full_name: "",
  slug: "",
  title: "",
  phone: "",
  email: "",
  bio: "",
  specialtiesCsv: "",
  city: "",
  years_experience: "",
  is_active: true,
};

function toSlug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditAgent() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [agents, setAgents] = useState<Agent | null>(null);
  const [form, setForm] = useState<AgentForm>(emptyForm);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isEditing || !id) return;
      setInitialLoading(true);
      setError(null);
      try {
        const { data, error: qErr } = await (supabase as any).from("agents").select("*").eq("id", id).single();
        if (qErr) throw qErr;
        if (!data) {
          setError("Agent not found.");
          return;
        }
        const loaded = data as Agent;
        setAgents(loaded);
        setForm({
          full_name: loaded.full_name ?? "",
          slug: loaded.slug ?? "",
          title: loaded.title ?? "",
          phone: loaded.phone ?? "",
          email: loaded.email ?? "",
          bio: loaded.bio ?? "",
          specialtiesCsv: Array.isArray(loaded.specialties) ? loaded.specialties.join(", ") : "",
          city: loaded.city ?? "",
          years_experience: loaded.years_experience != null ? String(loaded.years_experience) : "",
          is_active: Boolean(loaded.is_active),
        });
      } catch (e: any) {
        setError(e?.message ?? "Failed to load agent.");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  useEffect(() => {
    // Auto-generate slug from name only if user hasn't typed one.
    if (form.slug.trim().length > 0) return;
    if (!form.full_name.trim()) return;
    setForm((prev) => ({ ...prev, slug: toSlug(prev.full_name) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.full_name]);

  const validate = () => {
    const e: string[] = [];
    if (!form.full_name.trim()) e.push("Full name is required.");
    if (!form.title.trim()) e.push("Title is required.");
    if (form.phone.trim() && form.phone.trim().length < 7) e.push("Phone looks too short.");
    if (form.years_experience && !Number.isFinite(Number(form.years_experience))) e.push("Years of experience must be a number.");
    return e;
  };

  const canSave = useMemo(() => {
    return form.full_name.trim().length > 0 && form.title.trim().length > 0 && !submitting;
  }, [form.full_name, form.title, submitting]);

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const problems = validate();
    if (problems.length > 0) {
      setError(problems.join(" "));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `agents/${fileName}`;

        const { error: upErr } = await supabase.storage.from("agent-images").upload(filePath, file, { upsert: false });
        if (upErr) throw upErr;

        const { data } = supabase.storage.from("agent-images").getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      } else if (isEditing) {
        imageUrl = agents?.profile_image_url ?? null;
      }

      const specialties = form.specialtiesCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        full_name: form.full_name || null,
        slug: (form.slug ? toSlug(form.slug) : toSlug(form.full_name)) || null,
        title: form.title || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        bio: form.bio.trim() || null,
        specialties,
        city: form.city.trim() || null,
        years_experience: form.years_experience ? Number(form.years_experience) : null,
        profile_image_url: imageUrl,
        is_active: form.is_active,
      };

      if (isEditing && id) {
        const { error: upErr, data: updated } = await (supabase as any)
          .from("agents")
          .update(payload)
          .eq("id", id)
          .select("*")
          .single();
        if (upErr) throw upErr;
        if (!updated) throw new Error("Agent update completed but no row was returned.");
      } else {
        const { error: insErr, data: inserted } = await (supabase as any).from("agents").insert(payload).select("*").single();
        if (insErr) throw insErr;
        if (!inserted) throw new Error("Agent creation completed but no row was returned.");
      }

      toast({
        title: "Saved",
        description: "Agent information updated.",
      });
      navigate("/crestline/admin/agents");
    } catch (e: any) {
      const message = e?.message || e?.error?.message || e?.toString?.() || "Failed to save agent.";
      setError(message);
      toast({
        title: "Save failed",
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-white font-sans">
      <CrestlineNavbar />

      <section className="pt-32 pb-8 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-crestline-gold text-xs font-semibold tracking-[0.15em] uppercase mb-2">Admin</p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">{isEditing ? "Edit Agent" : "New Agent"}</h1>
          </div>
          <Button
            variant="outline"
            className="border-white/30 text-white hover:bg-white/5 rounded-none text-sm"
            onClick={() => navigate("/crestline/admin/agents")}
          >
            Back
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {initialLoading ? (
            <LoadingSpinner label="Loading agent..." />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Full Name *</label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Phone</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Email</label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Bio</label>
                  <Textarea
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={4}
                    className="bg-crestline-surface border-white/10 text-white rounded-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">City / Market</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Years of Experience</label>
                  <Input
                    value={form.years_experience}
                    onChange={(e) => setForm((p) => ({ ...p, years_experience: e.target.value }))}
                    type="number"
                    min={0}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-crestline-muted uppercase tracking-wider mb-2">Specialties (comma-separated)</label>
                  <Input
                    value={form.specialtiesCsv}
                    onChange={(e) => setForm((p) => ({ ...p, specialtiesCsv: e.target.value }))}
                    className="bg-crestline-surface border-white/10 text-white rounded-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border border-white/5 bg-crestline-surface p-4">
                <div>
                  <p className="text-sm font-semibold text-white">Agent Status</p>
                  <p className="text-xs text-crestline-muted">Inactive agents won’t be shown publicly.</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                  />
                  <Badge className="bg-crestline-gold text-crestline-bg" variant="secondary">
                    {form.is_active ? "Active" : "Inactive"}
                  </Badge>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-crestline-muted uppercase tracking-wider">Profile Photo</label>
                {isEditing && agents?.profile_image_url ? (
                  <div className="mb-2">
                    <p className="text-[11px] text-crestline-muted mb-1">Current photo:</p>
                    <img
                      src={agents.profile_image_url}
                      alt={agents.full_name ?? "Agent"}
                      className="w-full max-w-sm border border-white/10"
                    />
                  </div>
                ) : null}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="bg-crestline-surface border-white/10 text-white rounded-none file:bg-crestline-gold file:text-crestline-bg file:border-0 file:px-3 file:py-1.5 file:text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/5 rounded-none"
                  onClick={() => navigate("/crestline/admin/agents")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSave}
                  className="bg-crestline-gold text-crestline-bg hover:bg-crestline-gold/90 rounded-none"
                >
                  {submitting ? "Saving..." : isEditing ? "Save Agent" : "Create Agent"}
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


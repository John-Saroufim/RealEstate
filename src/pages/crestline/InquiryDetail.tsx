import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Phone, Mail, User, Building2, Eye, EyeOff, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type Inquiry = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  message: string;
  property_id: string | null;
  property_title_snapshot: string | null;
  agent_id: string | null;
  inquiry_type: string | null;
  status: string | null;
  read: boolean | null;
  archived: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type Agent = {
  id: string;
  full_name: string | null;
  title: string | null;
  phone: string | null;
  bio: string | null;
  profile_image_url: string | null;
};

const statusOptions = ["new", "in_review", "contacted", "closed"] as const;

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

export default function InquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);

  const statusLabel = (s: string | null | undefined) => {
    if (!s) return "new";
    switch (s) {
      case "new":
        return "New";
      case "in_review":
        return "In Review";
      case "contacted":
        return "Contacted";
      case "closed":
        return "Closed";
      default:
        return s;
    }
  };

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      setInquiry(null);
      setAgent(null);

      try {
        const { data, error: qErr } = await (supabase as any)
          .from("inquiries")
          .select("*")
          .eq("id", id)
          .single();

        if (qErr) throw qErr;
        if (!data) {
          setError("Inquiry not found.");
          return;
        }

        const loaded = data as Inquiry;
        setInquiry(loaded);

        if (loaded.agent_id) {
          // Best-effort: agents table may not exist yet (Stage 7).
          const { data: aData, error: aErr } = await (supabase as any).from("agents").select("*").eq("id", loaded.agent_id).single();
          if (!aErr && aData) setAgent(aData as Agent);
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to load inquiry.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const dirtyStatus = useMemo(() => inquiry?.status ?? "new", [inquiry]);
  const dirtyArchived = useMemo(() => Boolean(inquiry?.archived), [inquiry]);
  const dirtyRead = useMemo(() => Boolean(inquiry?.read), [inquiry]);

  const handleUpdate = async (patch: Partial<Pick<Inquiry, "status" | "read" | "archived">>) => {
    if (!inquiry) return;
    try {
      const { error: upErr } = await (supabase as any).from("inquiries").update(patch).eq("id", inquiry.id);
      if (upErr) throw upErr;
      setInquiry((prev) => (prev ? { ...prev, ...patch } : prev));
      toast({ title: "Saved", description: "Inquiry updated." });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Please try again." });
    }
  };

  const handleDelete = async () => {
    if (!inquiry) return;
    if (!confirm("Delete this inquiry? This cannot be undone.")) return;
    try {
      const { error: delErr } = await (supabase as any).from("inquiries").delete().eq("id", inquiry.id);
      if (delErr) throw delErr;
      navigate("/crestline/admin/inquiries");
      toast({ title: "Deleted", description: "Inquiry removed." });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? "Please try again." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
        <CrestlineNavbar />
        <section className="pt-32 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <LoadingSpinner label="Loading inquiry..." />
          </div>
        </section>
        <CrestlineFooter />
      </div>
    );
  }

  if (error || !inquiry) {
    return (
      <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
        <CrestlineNavbar />
        <section className="pt-32 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border border-slate-200 bg-crestline-surface p-8 text-center">
              <p className="text-crestline-muted mb-4">{error ?? "Inquiry not found."}</p>
              <Button onClick={() => navigate("/crestline/admin/inquiries")} className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl">
                Back to Inbox
              </Button>
            </div>
          </div>
        </section>
        <CrestlineFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />
      <section className="pt-32 pb-8 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-crestline-gold text-xs font-semibold tracking-[0.15em] uppercase mb-2">Admin</p>
            <h1 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900">Inquiry Detail</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/crestline/admin/inquiries")}
            className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-crestline-surface border border-slate-200 rounded-xl">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-crestline-gold" />
                    <div>
                      <div className="font-sans text-xl font-bold text-slate-900">{inquiry.full_name}</div>
                      <div className="text-xs text-crestline-muted">{formatWhen(inquiry.created_at)}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {inquiry.email ? (
                      <div className="flex items-center gap-2 text-sm text-crestline-muted">
                        <Mail className="h-4 w-4 text-crestline-gold" />
                        {inquiry.email}
                      </div>
                    ) : null}
                    {inquiry.phone ? (
                      <div className="flex items-center gap-2 text-sm text-crestline-muted">
                        <Phone className="h-4 w-4 text-crestline-gold" />
                        {inquiry.phone}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="border border-slate-200 bg-background/20 p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-crestline-gold" />
                    <div className="flex-1">
                      <div className="text-xs text-crestline-muted uppercase tracking-wider">Property</div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {inquiry.property_title_snapshot ?? "—"}
                      </div>
                      {inquiry.property_id ? (
                        <Button
                          variant="link"
                          onClick={() => navigate(`/crestline/properties/${inquiry.property_id}`)}
                          className="p-0 h-auto text-crestline-gold hover:text-crestline-gold/90 font-semibold"
                        >
                          View listing
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 bg-background/20 p-4">
                  <div className="text-xs text-crestline-muted uppercase tracking-wider">Message</div>
                  <div className="text-sm text-slate-700 whitespace-pre-line mt-2">{inquiry.message}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-crestline-surface border border-slate-200 rounded-xl">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-crestline-muted uppercase tracking-wider mb-2">Actions</div>

                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl"
                      onClick={() => handleUpdate({ read: !dirtyRead })}
                    >
                      {dirtyRead ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {dirtyRead ? "Mark unread" : "Mark read"}
                    </Button>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-crestline-muted uppercase tracking-wider">Status</label>
                      <select
                        value={dirtyStatus}
                        onChange={(e) => handleUpdate({ status: e.target.value })}
                        className="h-11 bg-crestline-bg border border-slate-200 text-slate-900 rounded-xl px-3 focus-visible:outline-none"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="bg-crestline-bg">
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center justify-between gap-3 border border-slate-200 bg-background/20 p-3">
                      <span className="text-sm text-crestline-muted">Archived</span>
                      <input
                        type="checkbox"
                        checked={dirtyArchived}
                        onChange={(e) => handleUpdate({ archived: e.target.checked })}
                        aria-label="Archive inquiry"
                      />
                    </label>

                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-crestline-muted uppercase tracking-wider mb-2">Agent</div>
                  {agent ? (
                    <div className="border border-slate-200 bg-background/20 p-4">
                      <div className="font-sans text-lg font-bold text-slate-900">{agent.full_name ?? "Agent"}</div>
                      {agent.title ? <div className="text-xs text-crestline-gold uppercase tracking-wider mt-1">{agent.title}</div> : null}
                      {agent.phone ? (
                        <div className="flex items-center gap-2 text-sm text-crestline-muted mt-3">
                          <Phone className="h-4 w-4 text-crestline-gold" />
                          {agent.phone}
                        </div>
                      ) : null}
                      {agent.bio ? <div className="text-sm text-crestline-muted leading-relaxed mt-3">{agent.bio}</div> : null}
                    </div>
                  ) : (
                    <div className="text-sm text-crestline-muted border border-slate-200 bg-background/20 p-4">
                      No agent linked yet.
                    </div>
                  )}
                </div>

                <div className="text-xs text-crestline-muted">
                  Updated {formatWhen(inquiry.updated_at)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}


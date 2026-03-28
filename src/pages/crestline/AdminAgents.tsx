import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { Building2, Phone, User, Trash2, Pencil } from "lucide-react";
import { AdminStatsOverview } from "@/components/crestline/admin/AdminStatsOverview";

type Agent = {
  id: string;
  full_name: string | null;
  slug: string | null;
  title: string | null;
  phone: string | null;
  email: string | null;
  bio: string | null;
  profile_image_url: string | null;
  specialties: unknown;
  city: string | null;
  years_experience: number | null;
  is_active: boolean | null;
};

export default function AdminAgents() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let q = supabase
          .from("agents")
          .select("*")
          .order("full_name", { ascending: true })
          .limit(200);

        const trimmed = query.trim();
        if (trimmed) {
          q = q.or(`full_name.ilike.%${trimmed}%,title.ilike.%${trimmed}%,city.ilike.%${trimmed}%`);
        }

        const { data, error: supErr } = await (q as any);
        if (supErr) throw supErr;
        setAgents((data ?? []) as Agent[]);
      } catch (e: any) {
        setError("Failed to load agents.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [query]);

  const handleToggleActive = async (agentId: string, nextActive: boolean) => {
    try {
      const { error: upErr } = await (supabase as any).from("agents").update({ is_active: nextActive }).eq("id", agentId);
      if (upErr) throw upErr;
      setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, is_active: nextActive } : a)));
      toast({ title: nextActive ? "Agent activated" : "Agent deactivated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Please try again." });
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    try {
      const { error: delErr } = await (supabase as any).from("agents").delete().eq("id", agentId);
      if (delErr) throw delErr;
      setAgents((prev) => prev.filter((a) => a.id !== agentId));
      toast({ title: "Agent deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? "Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-crestline-bg text-slate-900 font-sans">
      <CrestlineNavbar />

      <section className="pt-32 pb-6 border-b border-crestline-gold/10 bg-crestline-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <p className="text-crestline-gold text-xs font-semibold tracking-[0.15em] uppercase mb-2">Admin</p>
              <h1 className="font-sans text-3xl sm:text-4xl font-bold text-slate-900">Manage Agents</h1>
            </div>
            <Button
              onClick={() => navigate("/crestline/admin/agents/new")}
              className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl"
            >
              New Agent
            </Button>
          </div>
          <div className="mt-6">
            <AdminStatsOverview keys={["agents"]} />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents..."
              className="bg-crestline-bg border-slate-200 text-slate-900 rounded-xl h-12 lg:w-96"
            />
            <div className="text-xs text-crestline-muted">{agents.length} agents</div>
          </div>

          {loading && <LoadingSpinner label="Loading agents..." />}
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {!loading && !error && agents.length === 0 && (
            <div className="border border-slate-200 p-10 text-center bg-crestline-surface">
              <div className="mx-auto h-12 w-12 border border-crestline-gold/20 bg-crestline-bg/50 flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-crestline-gold" />
              </div>
              <p className="font-sans text-xl font-bold text-slate-900 mb-2">No agents yet</p>
              <p className="text-sm text-crestline-muted mb-6">Create your first agent profile to start assigning advisors to listings.</p>
              <Button
                onClick={() => navigate("/crestline/admin/agents/new")}
                className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl"
              >
                Create your first agent
              </Button>
            </div>
          )}

          {!loading && !error && agents.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((a) => (
                <Card key={a.id} className="bg-crestline-surface border border-slate-200 rounded-xl overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      {a.profile_image_url ? (
                        <img src={a.profile_image_url} alt={a.full_name ?? "Agent"} className="h-16 w-16 object-cover border border-slate-200" />
                      ) : (
                        <div className="h-16 w-16 bg-slate-50 border border-slate-200" />
                      )}
                      <div className="flex-1">
                        <div className="font-sans text-xl font-bold text-slate-900 leading-tight">{a.full_name ?? "Agent"}</div>
                        {a.title ? <div className="text-xs text-crestline-gold uppercase tracking-wider mt-1">{a.title}</div> : null}
                        {a.city ? <div className="text-sm text-crestline-muted mt-2">{a.city}</div> : null}
                        <div className="mt-3 flex flex-wrap gap-2 items-center">
                          <Badge className={a.is_active ? "bg-crestline-gold text-crestline-on-gold" : "bg-slate-50 text-slate-900"} variant="secondary">
                            {a.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {a.phone ? (
                      <div className="flex items-center gap-2 text-sm text-crestline-muted">
                        <Phone className="h-4 w-4 text-crestline-gold" />
                        {a.phone}
                      </div>
                    ) : null}

                    <div className="flex justify-between gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl h-9 px-3 text-xs flex items-center gap-1.5"
                        onClick={() => navigate(`/crestline/admin/agents/${a.id}`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl h-9 px-3 text-xs"
                          onClick={() => handleToggleActive(a.id, !a.is_active)}
                        >
                          {a.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-500/30 text-red-300 hover:bg-red-500/10 rounded-xl h-9 px-3 text-xs"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}


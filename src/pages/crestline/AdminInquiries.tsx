import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Mail, Phone, Circle, Search, Check, EyeOff, Eye, Trash2 } from "lucide-react";
import { AdminStatsOverview } from "@/components/crestline/admin/AdminStatsOverview";

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

const statusOptions = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "in_review", label: "In Review" },
  { id: "contacted", label: "Contacted" },
  { id: "closed", label: "Closed" },
] as const;

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "—";
  }
}

export default function AdminInquiries() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["id"]>("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const unreadCount = useMemo(() => inquiries.filter((i) => !i.read && !i.archived).length, [inquiries]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from("inquiries")
          .select("*")
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .limit(200);

        if (statusFilter !== "all") query = query.eq("status", statusFilter);

        const q = search.trim();
        if (q) {
          query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,message.ilike.%${q}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        setInquiries((data ?? []) as Inquiry[]);
      } catch (e: any) {
        setError("Failed to load inquiries.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [statusFilter, search]);

  const handleToggleRead = async (inquiryId: string, nextRead: boolean) => {
    try {
      const { error } = await supabase.from("inquiries").update({ read: nextRead }).eq("id", inquiryId);
      if (error) throw error;
      setInquiries((prev) => prev.map((i) => (i.id === inquiryId ? { ...i, read: nextRead } : i)));
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e?.message ?? "Please try again.",
      });
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
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Inquiries</h1>
            </div>
            <div className="text-xs text-crestline-muted flex items-center gap-2">
              <Circle className="h-2.5 w-2.5 text-crestline-gold" />
              {unreadCount} unread
            </div>
          </div>

          <div className="mt-6">
            <AdminStatsOverview keys={["inquiries"]} />
          </div>
        </div>
      </section>

      <section className="pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-crestline-surface border border-slate-200 rounded-xl">
            <CardContent className="px-6 pt-5 pb-3 sm:pt-6 sm:pb-3.5">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatusFilter(s.id)}
                      className={`px-4 py-2 text-xs font-semibold border transition-colors rounded-xl ${
                        statusFilter === s.id
                          ? "bg-crestline-gold text-crestline-on-gold border-crestline-gold"
                          : "border-slate-200 text-slate-600 hover:border-crestline-gold/30"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="w-full lg:w-96">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search inquiries..."
                    className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-xl h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {loading && <LoadingSpinner label="Loading inquiries..." />}
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {!loading && !error && inquiries.length === 0 && (
            <div className="border border-slate-200 p-8 text-center">
              <p className="text-sm text-crestline-muted mb-4">No inquiries yet.</p>
              <p className="text-xs text-crestline-muted">New leads will show up here automatically.</p>
            </div>
          )}

          {!loading && !error && inquiries.length > 0 && (
            <div className="grid gap-4 -mt-1.5 lg:-mt-2">
              {/* Desktop list */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-[1.5fr_0.8fr_1fr_0.8fr] gap-4 px-4 pb-2 text-xs text-crestline-muted border-b border-slate-200">
                  <div>Sender</div>
                  <div>Status</div>
                  <div>Property</div>
                  <div>Date</div>
                </div>
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="grid grid-cols-[1.5fr_0.8fr_1fr_0.8fr] gap-4 px-4 py-4 border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/crestline/admin/inquiries/${inq.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(`/crestline/admin/inquiries/${inq.id}`);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-2.5 w-2.5 mt-2 rounded-full ${inq.read ? "bg-slate-300" : "bg-crestline-gold"}`} />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{inq.full_name}</div>
                        <div className="text-xs text-crestline-muted flex items-center gap-2 mt-1">
                          {inq.email ? <span>{inq.email}</span> : null}
                          {inq.phone ? <span>{inq.phone}</span> : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold border border-slate-200 bg-crestline-surface">
                        {inq.status ?? "new"}
                      </span>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-slate-300 h-8 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRead(inq.id, !inq.read);
                          }}
                        >
                          {inq.read ? "Mark unread" : "Mark read"}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-slate-700">{inq.property_title_snapshot ?? "—"}</div>
                    <div className="text-xs text-crestline-muted">{formatWhen(inq.created_at)}</div>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden grid gap-4">
                {inquiries.map((inq) => (
                  <Card key={inq.id} className="border border-slate-200 bg-crestline-surface rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{inq.full_name}</div>
                          <div className="text-xs text-crestline-muted mt-1">
                            {inq.property_title_snapshot ?? "—"}
                          </div>
                        </div>
                        <div className="text-xs text-crestline-muted text-right">
                          {formatWhen(inq.created_at)}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold border border-slate-200 bg-crestline-bg">
                          {inq.status ?? "new"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-300 h-8 px-2"
                            onClick={() => handleToggleRead(inq.id, !inq.read)}
                          >
                            {inq.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">Toggle read</span>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl"
                            onClick={() => navigate(`/crestline/admin/inquiries/${inq.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}


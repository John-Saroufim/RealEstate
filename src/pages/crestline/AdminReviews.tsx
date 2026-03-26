import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Circle, Search, Check, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { CrestlineNavbar } from "@/components/crestline/CrestlineNavbar";
import { CrestlineFooter } from "@/components/crestline/CrestlineFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { AdminStatsOverview } from "@/components/crestline/admin/AdminStatsOverview";
import { ReviewStars } from "@/components/crestline/ReviewStars";

type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string | null;
  updated_at?: string | null;
};

const statusOptions = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
] as const;

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "—";
  }
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case "pending":
      // Light-theme readable badge for "pending" reviews
      return "bg-blue-50 border-blue-200 text-blue-900";
    case "approved":
      return "bg-emerald-50 border-emerald-200 text-emerald-900";
    case "rejected":
      return "bg-red-50 border-red-200 text-red-800";
    default:
      return "bg-slate-50 border-slate-200 text-slate-700";
  }
}

function excerpt(text: string, maxChars: number) {
  const t = (text ?? "").trim();
  if (!t) return "—";
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(0, maxChars - 3))}...`;
}

export default function AdminReviews() {
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["id"]>("pending");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const pendingCount = useMemo(() => reviews.filter((r) => r.status === "pending").length, [reviews]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(300);

        if (statusFilter !== "all") query = query.eq("status", statusFilter);

        const q = search.trim();
        if (q) {
          query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,message.ilike.%${q}%`);
        }

        const { data, error: qErr } = await query;
        if (qErr) throw qErr;
        setReviews((data ?? []) as Review[]);
      } catch {
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [statusFilter, search]);

  const updateStatus = async (id: string, nextStatus: "approved" | "rejected") => {
    try {
      const { error: upErr } = await (supabase as any).from("reviews").update({ status: nextStatus }).eq("id", id);
      if (upErr) throw upErr;

      let replacedOldest = false;
      let demotedIds: string[] = [];

      if (nextStatus === "approved") {
        // Keep a strict cap of 6 approved reviews for the Home page feed.
        // New approvals take priority; oldest approved entries are demoted.
        const { data: approvedRows, error: approvedErr } = await (supabase as any)
          .from("reviews")
          .select("id,created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(100);

        if (approvedErr) throw approvedErr;

        const approved = Array.isArray(approvedRows) ? approvedRows : [];
        const overflow = approved.slice(6);
        demotedIds = overflow.map((r: any) => String(r.id));

        if (demotedIds.length > 0) {
          const { error: demoteErr } = await (supabase as any)
            .from("reviews")
            .update({ status: "rejected" })
            .in("id", demotedIds);
          if (demoteErr) throw demoteErr;
          replacedOldest = true;
        }
      }

      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === id) return { ...r, status: nextStatus };
          if (demotedIds.includes(r.id)) return { ...r, status: "rejected" };
          return r;
        }),
      );

      toast({
        title: "Updated",
        description:
          nextStatus === "approved" && replacedOldest
            ? "Review approved. Oldest approved review was replaced."
            : `Review set to ${nextStatus}.`,
      });
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Please try again." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    try {
      const { error: delErr } = await (supabase as any).from("reviews").delete().eq("id", id);
      if (delErr) throw delErr;
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Deleted", description: "Review removed." });
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
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">Reviews</h1>
            </div>
            <div className="text-xs text-crestline-muted flex items-center gap-2">
              <Circle className="h-2.5 w-2.5 text-crestline-gold" />
              {pendingCount} pending shown
            </div>
          </div>

          <div className="mt-6">
            <AdminStatsOverview keys={["reviews"]} />
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-crestline-surface border border-slate-200 rounded-xl">
            <CardContent className="p-6">
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
                  <div className="relative">
                    <Search className="h-4 w-4 text-crestline-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search reviews..."
                      className="bg-crestline-bg border-slate-200 text-slate-900 placeholder:text-crestline-muted rounded-xl h-12 pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading && <LoadingSpinner label="Loading reviews..." />}
          {error ? <p className="text-red-400 text-sm mt-4">{error}</p> : null}

          {!loading && !error && reviews.length === 0 ? (
            <div className="border border-slate-200 p-10 text-center bg-crestline-surface mt-6">
              <p className="font-serif text-xl font-bold text-slate-900 mb-2">No reviews match your filters.</p>
              <p className="text-sm text-crestline-muted mb-6">Reviews will appear here as soon as they are submitted.</p>
              <Button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("pending");
                }}
                className="bg-crestline-gold text-crestline-on-gold hover:bg-crestline-gold/90 rounded-xl"
              >
                Clear & Show Pending
              </Button>
            </div>
          ) : null}

          {!loading && !error && reviews.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block mt-6">
                <div className="grid grid-cols-[1.4fr_0.6fr_2fr_0.7fr_1fr_0.8fr] gap-4 px-4 pb-3 text-xs text-crestline-muted border-b border-slate-200">
                  <div>Sender</div>
                  <div>Rating</div>
                  <div>Message</div>
                  <div>Status</div>
                  <div>Date</div>
                  <div>Actions</div>
                </div>

                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[1.4fr_0.6fr_2fr_0.7fr_1fr_0.8fr] gap-4 px-4 py-4 border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                      <div className="text-xs text-crestline-muted mt-1 break-words">{r.email}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ReviewStars rating={Number(r.rating)} sizeClassName="h-4 w-4" />
                      <span className="text-xs text-crestline-muted">{r.rating}/5</span>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs text-slate-700 leading-relaxed max-h-28 overflow-hidden">
                        {excerpt(r.message, 180)}
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-xl ${statusBadgeClasses(
                          String(r.status),
                        )}`}
                      >
                        {r.status}
                      </span>
                    </div>

                    <div className="text-xs text-crestline-muted">{formatWhen(r.created_at)}</div>

                    <div className="flex flex-col gap-2 items-start">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-9 px-3 border border-emerald-600/45 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
                        onClick={() => updateStatus(r.id, "approved")}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-9 px-3 border border-red-600/45 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900"
                        onClick={() => updateStatus(r.id, "rejected")}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl h-9 px-3 border border-red-600/35 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden mt-6 grid gap-4">
                {reviews.map((r) => (
                    <Card key={r.id} className="border border-slate-200 bg-crestline-surface rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{r.name}</div>
                          <div className="text-xs text-crestline-muted mt-1 break-words">{r.email}</div>
                        </div>
                        <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-xl ${statusBadgeClasses(
                            String(r.status),
                          )}`}
                        >
                          {r.status}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <ReviewStars rating={Number(r.rating)} sizeClassName="h-4 w-4" />
                          <span className="text-xs text-crestline-muted">{r.rating}/5</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                        {excerpt(r.message, 200)}
                      </div>

                      <div className="mt-3 text-xs text-crestline-muted">{formatWhen(r.created_at)}</div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl h-9 px-3 border border-emerald-600/45 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 flex items-center"
                          onClick={() => updateStatus(r.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl h-9 px-3 border border-red-600/45 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900 flex items-center"
                          onClick={() => updateStatus(r.id, "rejected")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl h-9 px-3 border border-red-600/35 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900 flex items-center"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <CrestlineFooter />
    </div>
  );
}


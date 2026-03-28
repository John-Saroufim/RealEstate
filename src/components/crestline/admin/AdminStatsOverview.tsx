import { useEffect, useState } from "react";
import { Building2, Inbox, Users, Star } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

export type AdminStatKey = "listings" | "inquiries" | "agents" | "reviews";

type Stats = {
  listings: number;
  inquiries: number;
  agents: number;
  reviews: number;
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number | null;
}) {
  return (
    <Card className="bg-crestline-surface border border-slate-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl border border-crestline-gold/20 bg-slate-100 flex items-center justify-center">
          <Icon className="h-5 w-5 text-crestline-gold" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-crestline-muted uppercase tracking-[0.15em] font-semibold">{label}</div>
          <div className="mt-2 font-sans text-3xl font-bold text-slate-900 leading-none">
            {value === null ? "—" : value.toLocaleString("en-US")}
          </div>
        </div>
      </div>
    </Card>
  );
}

const defaultKeys: AdminStatKey[] = ["listings", "inquiries", "agents"];

export function AdminStatsOverview({ keys = defaultKeys, refreshKey }: { keys?: AdminStatKey[]; refreshKey?: number }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [listingsRes, demoListingsRes, inquiriesRes, agentsRes, reviewsRes] = await Promise.all([
          supabase.from("listings").select("*", { count: "exact", head: true }),
          // Exclude demo titles so admin counts match the public properties experience.
          // Uses a coarse ilike filter because PostgREST doesn't support regex.
          supabase.from("listings").select("*", { count: "exact", head: true }).ilike("title", "demo%listing%"),
          supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("archived", false),
          supabase.from("agents").select("*", { count: "exact", head: true }),
          supabase.from("reviews").select("*", { count: "exact", head: true }),
        ]);

        const listingsTotal = listingsRes.count ?? 0;
        const demoListings = demoListingsRes.count ?? 0;
        const listings = Math.max(0, listingsTotal - demoListings);
        const inquiries = inquiriesRes.count ?? 0;
        const agents = agentsRes.count ?? 0;
        const reviews = reviewsRes.count ?? 0;

        if (!alive) return;
        setStats({ listings, inquiries, agents, reviews });
      } catch (e) {
        // Keep the dashboard functional even if counts fail.
        if (!alive) return;
        setStats({ listings: 0, inquiries: 0, agents: 0, reviews: 0 });
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  const safeKeys = (keys ?? defaultKeys).filter(Boolean);
  if (safeKeys.length === 0) return null;

  const colsClass = safeKeys.length === 1 ? "md:grid-cols-1" : safeKeys.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  const statValue = (key: AdminStatKey) => {
    if (!stats) return loading ? null : 0;
    switch (key) {
      case "listings":
        return loading ? null : stats.listings;
      case "inquiries":
        return loading ? null : stats.inquiries;
      case "agents":
        return loading ? null : stats.agents;
      case "reviews":
        return loading ? null : stats.reviews;
      default:
        return loading ? null : 0;
    }
  };

  const renderStat = (key: AdminStatKey) => {
    switch (key) {
      case "listings":
        return <Stat key={key} icon={Building2} label="Total Listings" value={statValue(key)} />;
      case "inquiries":
        return <Stat key={key} icon={Inbox} label="Total Inquiries" value={statValue(key)} />;
      case "agents":
        return <Stat key={key} icon={Users} label="Total Agents" value={statValue(key)} />;
      case "reviews":
        return <Stat key={key} icon={Star} label="Total Reviews" value={statValue(key)} />;
    }
  };

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4`}>
      {safeKeys.map((k) => renderStat(k))}
    </div>
  );
}


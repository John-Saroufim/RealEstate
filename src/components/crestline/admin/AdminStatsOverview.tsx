import { useEffect, useState } from "react";
import { Building2, Inbox, Users } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

type Stats = {
  listings: number;
  inquiries: number;
  agents: number;
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
    <Card className="bg-crestline-surface border border-white/5 rounded-none p-6">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-none border border-crestline-gold/20 bg-crestline-bg/50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-crestline-gold" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-crestline-muted uppercase tracking-[0.15em] font-semibold">{label}</div>
          <div className="mt-2 font-serif text-3xl font-bold text-white leading-none">
            {value === null ? "—" : value.toLocaleString("en-US")}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function AdminStatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [listingsRes, inquiriesRes, agentsRes] = await Promise.all([
          supabase.from("listings").select("*", { count: "exact", head: true }),
          supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("archived", false),
          supabase.from("agents").select("*", { count: "exact", head: true }),
        ]);

        const listings = listingsRes.count ?? 0;
        const inquiries = inquiriesRes.count ?? 0;
        const agents = agentsRes.count ?? 0;

        if (!alive) return;
        setStats({ listings, inquiries, agents });
      } catch (e) {
        // Keep the dashboard functional even if counts fail.
        if (!alive) return;
        setStats({ listings: 0, inquiries: 0, agents: 0 });
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Stat icon={Building2} label="Total Listings" value={loading ? null : stats?.listings ?? 0} />
      <Stat icon={Inbox} label="Total Inquiries" value={loading ? null : stats?.inquiries ?? 0} />
      <Stat icon={Users} label="Total Agents" value={loading ? null : stats?.agents ?? 0} />
    </div>
  );
}


import { supabase } from "@/integrations/supabase/client";

const DEMO_TITLE = /^\s*demo\s*listing/i;

export function isDemoListingTitle(title: string | null | undefined): boolean {
  return DEMO_TITLE.test(String(title ?? "").trim());
}

/** One round-trip for filter chips + search datalist (replaces three separate listing queries). */
export async function loadListingFilterMetadata() {
  const { data, error } = await supabase.from("listings").select("type,location,title").limit(4000);

  if (error) throw error;

  const types = new Set<string>();
  const locations = new Set<string>();
  const names = new Set<string>();

  for (const row of data ?? []) {
    const r = row as { type?: string | null; location?: string | null; title?: string | null };
    if (typeof r.type === "string" && r.type.trim()) types.add(r.type.trim());
    if (typeof r.location === "string" && r.location.trim()) locations.add(r.location.trim());
    if (typeof r.title === "string" && r.title.trim() && !isDemoListingTitle(r.title)) {
      names.add(r.title.trim());
    }
  }

  return {
    types: [...types].sort((a, b) => a.localeCompare(b)),
    locations: [...locations].sort((a, b) => a.localeCompare(b)),
    names: [...names].sort((a, b) => a.localeCompare(b)),
  };
}

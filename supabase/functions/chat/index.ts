// Supabase Edge Function: AI chat for the RealEstate site.
//
// Setup:
// 1. Add one provider key in Supabase Dashboard → Edge Functions → Secrets:
//    - GROQ_API_KEY=gsk_... (free-tier friendly), or
//    - OPENAI_API_KEY=sk-...
// 2. Deploy: supabase functions deploy chat --no-verify-jwt
// 3. Optional: switch models below to your preferred provider model.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a polished, knowledgeable AI assistant for RealEstate, a luxury real estate brokerage.
You help visitors with general questions about buying, selling, investing, neighborhoods, and the homebuying process.
You are not a licensed attorney or financial advisor—give practical guidance and suggest speaking with a professional when appropriate.
Keep answers clear, warm, and concise unless the user asks for detail.
If listing data is provided in the context, use it as the source of truth for counts and examples.
Never invent listing totals or claim exact numbers unless they are present in the provided context.`;

type ChatMessage = { role: "user" | "assistant"; content: string };
type ListingSummary = {
  id?: string;
  title?: string;
  price?: number | string | null;
  location?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  status?: string | null;
  type?: string | null;
  agent_id?: string | null;
};

type AgentSummary = {
  id?: string;
  full_name?: string | null;
  title?: string | null;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseTotalFromContentRange(headerValue: string | null) {
  if (!headerValue) return null;
  // content-range format: "0-0/123"
  const parts = headerValue.split("/");
  if (parts.length !== 2) return null;
  const n = Number(parts[1]);
  return Number.isFinite(n) ? n : null;
}

async function fetchCount(table: string, select = "id", filters = "") {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return null;

  const url =
    `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=1` +
    (filters ? `&${filters}` : "");

  const res = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "count=exact",
    },
  });

  if (!res.ok) return null;
  return parseTotalFromContentRange(res.headers.get("content-range"));
}

async function loadInventoryContext() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const baseHeaders = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };

  const totalListings = await fetchCount("listings");

  // Fetch a larger snapshot of listings so the assistant can answer “from anywhere”.
  // We keep descriptions out to avoid blowing up the prompt size.
  const limitForContext = 200;
  const rowsRes = await fetch(
    `${supabaseUrl}/rest/v1/listings?select=id,title,price,location,beds,baths,sqft,status,type,agent_id&order=created_at.desc&limit=${limitForContext}`,
    { headers: baseHeaders },
  );

  const rows = (await rowsRes.json().catch(() => [])) as ListingSummary[];

  const agentsRes = await fetch(
    `${supabaseUrl}/rest/v1/agents?select=id,full_name,title,is_active&limit=200`,
    { headers: baseHeaders },
  );
  const agents = (await agentsRes.json().catch(() => [])) as AgentSummary[];

  const agentNameById = Object.fromEntries(
    agents
      .map((a) => [a.id, [a.full_name ?? "", a.title ? `(${a.title})` : ""].filter(Boolean).join(" ")] as const)
      .filter(([k]) => Boolean(k)),
  ) as Record<string, string>;

  // Counts only (no need to expose inquiry/review personal content).
  const activeInquiries = await fetchCount("inquiries", "id", "archived=eq.false");
  const unreadInquiries = await fetchCount("inquiries", "id", "archived=eq.false&read=eq.false");
  const approvedReviews = await fetchCount("reviews", "id", "status=eq.approved");
  const pendingReviews = await fetchCount("reviews", "id", "status=eq.pending");

  return {
    totalListings: totalListings ?? rows.length,
    inventoryListings: rows,
    activeInquiries: activeInquiries ?? 0,
    unreadInquiries: unreadInquiries ?? 0,
    approvedReviews: approvedReviews ?? 0,
    pendingReviews: pendingReviews ?? 0,
    agentNameById,
    contextLimit: limitForContext,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const groqKey = Deno.env.get("GROQ_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const provider = groqKey ? "groq" : openaiKey ? "openai" : null;

  if (!provider) {
    return json({ error: "AI is not configured (missing GROQ_API_KEY or OPENAI_API_KEY on the server)." }, 503);
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const cleaned: ChatMessage[] = raw
    .filter(
      (m): m is ChatMessage =>
        m != null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 4000),
    }))
    .slice(-24);

  if (cleaned.length === 0) {
    return json({ error: "No messages provided." }, 400);
  }

  let dynamicContext = "";
  try {
    const inventoryContext = await loadInventoryContext();
    if (inventoryContext) {
      const listingsLines = inventoryContext.inventoryListings
        .map((l, i) => {
          const title = l.title ?? "Untitled";
          const location = l.location ? ` in ${l.location}` : "";
          const status = l.status ? ` [${l.status}]` : "";
          const type = l.type ? ` (${l.type})` : "";
          const numericPrice = l.price == null ? null : Number(l.price);
          const price =
            numericPrice != null && Number.isFinite(numericPrice) ? ` - $${numericPrice.toLocaleString()}` : "";
          const beds = l.beds ?? null;
          const baths = l.baths ?? null;
          const bedsBaths = beds != null && baths != null ? ` - ${beds} bd / ${baths} ba` : "";
          const sqft = l.sqft != null ? ` - ${l.sqft} sqft` : "";
          const agentName = l.agent_id ? inventoryContext.agentNameById[l.agent_id] : "";
          const agent = agentName ? ` - Agent: ${agentName}` : "";

          return `${i + 1}. ${title}${type}${location}${price}${status}${bedsBaths}${sqft}${agent}`;
        })
        .join("\n");

      dynamicContext =
        `Live website inventory context (from Supabase):\n` +
        `- Total listings: ${inventoryContext.totalListings}\n` +
        `- Inquiries (archived=false): ${inventoryContext.activeInquiries}\n` +
        `- Unread inquiries (archived=false, read=false): ${inventoryContext.unreadInquiries}\n` +
        `- Reviews: approved=${inventoryContext.approvedReviews}, pending=${inventoryContext.pendingReviews}\n` +
        `- Listings snapshot for QA (up to ${inventoryContext.contextLimit} rows):\n` +
        `${listingsLines || "- none"}\n` +
        `When users ask “how many”, always use the Total listings number above. When they ask about specific listings, answer using the snapshot titles/prices/types.`;
    }
  } catch {
    // Do not fail chat if inventory context cannot be loaded.
    dynamicContext = "";
  }

  const endpoint =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
  const model = provider === "groq" ? "llama-3.1-8b-instant" : "gpt-4o-mini";
  const apiKey = provider === "groq" ? groqKey! : openaiKey!;

  const openaiRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...(dynamicContext ? [{ role: "system", content: dynamicContext }] : []),
        ...cleaned,
      ],
    }),
  });

  const data = await openaiRes.json().catch(() => ({}));

  if (!openaiRes.ok) {
    const msg =
      (data as { error?: { message?: string } })?.error?.message ??
      `OpenAI request failed (${openaiRes.status})`;
    return json({ error: msg }, 502);
  }

  const reply =
    (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content?.trim() ?? "";

  if (!reply) {
    return json({ error: "Empty model response." }, 502);
  }

  return json({ reply });
});

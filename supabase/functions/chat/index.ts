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
  price?: number | string;
  location?: string;
  status?: string;
  type?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function loadListingsContext() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const baseHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
  };

  const countRes = await fetch(`${supabaseUrl}/rest/v1/listings?select=id&limit=1`, {
    headers: {
      ...baseHeaders,
      Prefer: "count=exact",
    },
  });

  if (!countRes.ok) {
    throw new Error(`Failed to query listings count (${countRes.status})`);
  }

  const contentRange = countRes.headers.get("content-range");
  const total = contentRange ? Number(contentRange.split("/")[1]) : null;

  const rowsRes = await fetch(
    `${supabaseUrl}/rest/v1/listings?select=id,title,price,location,status,type&limit=8`,
    { headers: baseHeaders },
  );

  if (!rowsRes.ok) {
    throw new Error(`Failed to query listings rows (${rowsRes.status})`);
  }

  const rows = (await rowsRes.json().catch(() => [])) as ListingSummary[];

  return {
    totalListings: Number.isFinite(total) ? total : rows.length,
    sampleListings: rows,
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
    const listingsContext = await loadListingsContext();
    if (listingsContext) {
      const sampleLines = listingsContext.sampleListings
        .map((l, i) => {
          const title = l.title ?? "Untitled";
          const location = l.location ? ` in ${l.location}` : "";
          const status = l.status ? ` [${l.status}]` : "";
          const numericPrice = l.price == null ? null : Number(l.price);
          const price = Number.isFinite(numericPrice) ? ` - $${numericPrice.toLocaleString()}` : "";
          return `${i + 1}. ${title}${location}${price}${status}`;
        })
        .join("\n");

      dynamicContext =
        `Live website inventory context (from Supabase):\n` +
        `- Total listings: ${listingsContext.totalListings}\n` +
        (sampleLines ? `- Sample listings:\n${sampleLines}\n` : "- Sample listings: none\n") +
        `Use this data when users ask about inventory, counts, pricing, or examples.`;
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

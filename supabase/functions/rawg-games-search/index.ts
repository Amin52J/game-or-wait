type GameSearchHit = { name: string; image: string | null };

const RAWG_GAMES = "https://api.rawg.io/api/games";
const MAX_RESULTS = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type RawgGamesPayload = {
  results?: Array<{ name?: string; background_image?: string | null }>;
};

function parseHits(data: unknown): GameSearchHit[] {
  if (!data || typeof data !== "object") return [];
  const results = (data as RawgGamesPayload).results;
  if (!Array.isArray(results)) return [];
  const seen = new Set<string>();
  const hits: GameSearchHit[] = [];
  for (const item of results) {
    const name = typeof item?.name === "string" ? item.name.trim() : "";
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const raw = item.background_image;
    const image =
      typeof raw === "string" && raw.startsWith("http") ? raw.trim() : null;
    hits.push({ name, image });
    if (hits.length >= MAX_RESULTS) break;
  }
  return hits;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const key = Deno.env.get("RAWG_API_KEY")?.trim();
  if (!key) {
    return jsonResponse({ games: [] as GameSearchHit[], unavailable: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const q =
    body &&
    typeof body === "object" &&
    typeof (body as { q?: unknown }).q === "string"
      ? (body as { q: string }).q.trim()
      : "";

  if (q.length < 3) {
    return jsonResponse({ games: [] });
  }
  if (q.length > 120) {
    return jsonResponse({ error: "Query too long" }, 400);
  }

  const url = new URL(RAWG_GAMES);
  url.searchParams.set("search", q);
  url.searchParams.set("page_size", String(MAX_RESULTS));
  url.searchParams.set("key", key);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    console.error("RAWG search fetch failed:", e);
    return jsonResponse({ error: "Search failed" }, 502);
  }

  if (!res.ok) {
    console.error("RAWG search:", res.status, await res.text());
    return jsonResponse({ error: "Search failed" }, 502);
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return jsonResponse({ error: "Invalid response" }, 502);
  }

  return jsonResponse({ games: parseHits(data) });
});

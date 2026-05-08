/**
 * Crawlers + Cloudflare Pages use this endpoint to fetch Open Graph data for `/showcase?id=…`.
 * Deploy: `supabase functions deploy showcase-meta`
 *
 * Env: SUPABASE_URL, SUPABASE_ANON_KEY, STEAMGRIDDB_API_KEY (same as `sgdb-cover`).
 * Disable JWT verification for GET in the Supabase dashboard for this function, or call with anon `Authorization`.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE_ORIGIN = "https://gameorwait.com";
const FALLBACK_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

const SGDB_BASE = "https://www.steamgriddb.com/api/v2";

interface SearchHit {
  id: number;
  name: string;
}

interface GridItem {
  id: number;
  url: string;
  thumb?: string;
  width: number;
  height: number;
}

interface GameRow {
  name: string;
  score: number | null;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function possessiveHeading(ownerDisplayName: string | null | undefined): string {
  const name = ownerDisplayName?.trim() ?? "";
  if (!name) return "Library showcase";
  const endsWithS = /s$/i.test(name);
  return endsWithS ? `${name}' library` : `${name}'s library`;
}

function shareDescription(gameCount: number): string {
  if (gameCount <= 0) return "Read-only library showcase on GameOrWait.";
  const g = `${gameCount} game${gameCount === 1 ? "" : "s"}`;
  return `${g} · Read-only library showcase sorted by taste score on GameOrWait.`;
}

function sortShowcaseGames(rows: GameRow[]): GameRow[] {
  const stable = [...rows];
  stable.sort((a, b) => {
    if (a.score != null && b.score != null && a.score !== b.score)
      return b.score - a.score;
    if (a.score != null && b.score == null) return -1;
    if (a.score == null && b.score != null) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  return stable;
}

async function findGameId(name: string, apiKey: string): Promise<number | null> {
  const url = `${SGDB_BASE}/search/autocomplete/${encodeURIComponent(name)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`SteamGridDB search failed (${res.status})`);
  const data = (await res.json()) as { success: boolean; data: SearchHit[] };
  if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
    return null;
  }
  return data.data[0].id;
}

async function findCoverUrl(gameId: number, apiKey: string): Promise<string | null> {
  const params = new URLSearchParams({
    dimensions: "600x900,660x930,512x512",
    types: "static",
    nsfw: "false",
    humor: "false",
  });
  const url = `${SGDB_BASE}/grids/game/${gameId}?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`SteamGridDB grids fetch failed (${res.status})`);
  const data = (await res.json()) as { success: boolean; data: GridItem[] };
  if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
    return null;
  }
  const portraitFirst = [...data.data].sort((a, b) => {
    const aPortrait = a.height >= a.width ? 0 : 1;
    const bPortrait = b.height >= b.width ? 0 : 1;
    return aPortrait - bPortrait;
  });
  return portraitFirst[0].url;
}

async function resolveCoverUrls(
  names: string[],
  apiKey: string,
): Promise<string[]> {
  const out: string[] = [];
  for (const raw of names.slice(0, 5)) {
    const name = raw.trim();
    if (!name) continue;
    try {
      const gameId = await findGameId(name, apiKey);
      if (!gameId) continue;
      const img = await findCoverUrl(gameId, apiKey);
      if (img) out.push(img);
    } catch {
      /* ignore single-game failures */
    }
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const url = new URL(req.url);
    const publicId = url.searchParams.get("public_id")?.trim() ?? "";
    if (!UUID_RE.test(publicId)) {
      return jsonResponse({ error: "Invalid public_id" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const sgdbKey = Deno.env.get("STEAMGRIDDB_API_KEY");
    if (!supabaseUrl || !anonKey) {
      return jsonResponse({ error: "Supabase configuration missing" }, 500);
    }

    const restUrl =
      `${supabaseUrl}/rest/v1/library_showcases?public_id=eq.${encodeURIComponent(publicId)}&select=games,owner_display_name`;
    const restRes = await fetch(restUrl, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    if (!restRes.ok) {
      console.error("showcase-meta REST error:", restRes.status, await restRes.text());
      return jsonResponse({ error: "Lookup failed" }, 502);
    }

    const rows = (await restRes.json()) as Array<{
      games: unknown;
      owner_display_name: string | null;
    }>;
    const row = rows[0];
    if (!row) {
      return jsonResponse({
        title: `Library showcase · GameOrWait`,
        description:
          "This showcase link may be invalid. GameOrWait — personalized game recommendations.",
        canonicalUrl: `${SITE_ORIGIN}/showcase?id=${encodeURIComponent(publicId)}`,
        images: [FALLBACK_OG_IMAGE],
      });
    }

    const rawGames = row.games;
    const gameRows: GameRow[] = Array.isArray(rawGames)
      ? rawGames.filter(
          (g): g is GameRow =>
            g != null &&
            typeof g === "object" &&
            typeof (g as GameRow).name === "string",
        )
      : [];

    const sorted = sortShowcaseGames(gameRows);
    const heading = possessiveHeading(row.owner_display_name);
    const title = `${heading} · GameOrWait`;
    const description = shareDescription(sorted.length);
    const canonicalUrl = `${SITE_ORIGIN}/showcase?id=${encodeURIComponent(publicId)}`;

    let images: string[] = [];
    if (sgdbKey && sorted.length > 0) {
      images = await resolveCoverUrls(
        sorted.map((g) => g.name),
        sgdbKey,
      );
    }
    if (images.length === 0) {
      images = [FALLBACK_OG_IMAGE];
    }

    return jsonResponse({
      title,
      description,
      canonicalUrl,
      images,
      heading,
    });
  } catch (err) {
    console.error("showcase-meta error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Internal server error" },
      500,
    );
  }
});

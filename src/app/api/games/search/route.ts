import { NextResponse } from "next/server";
import type { GameSearchHit } from "@/shared/types";

const RAWG_GAMES = "https://api.rawg.io/api/games";
const MAX_RESULTS = 5;

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

/** POST avoids static prerender of GET routes when using `output: "export"` (see analytics/track). */
export async function POST(req: Request) {
  const key = process.env.RAWG_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ games: [] as GameSearchHit[], unavailable: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const q =
    body &&
    typeof body === "object" &&
    typeof (body as { q?: unknown }).q === "string"
      ? (body as { q: string }).q.trim()
      : "";

  if (q.length < 3) {
    return NextResponse.json({ games: [] });
  }
  if (q.length > 120) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
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
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }

  if (!res.ok) {
    console.error("RAWG search:", res.status, await res.text());
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "Invalid response" }, { status: 502 });
  }

  return NextResponse.json({ games: parseHits(data) });
}

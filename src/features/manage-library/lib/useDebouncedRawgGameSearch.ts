import { useEffect, useRef, useState } from "react";
import type { GameSearchHit } from "@/shared/types";
import { getSupabase } from "@/shared/api/supabase";

export const RAWG_GAME_SEARCH_DEBOUNCE_MS = 280;
export const RAWG_GAME_SEARCH_MIN_QUERY_LEN = 3;

function parseGamesResponse(data: unknown): GameSearchHit[] {
  if (!data || typeof data !== "object") return [];
  const games = (data as { games?: unknown }).games;
  if (!Array.isArray(games)) return [];
  const out: GameSearchHit[] = [];
  for (const row of games) {
    if (!row || typeof row !== "object") continue;
    const name = (row as { name?: unknown }).name;
    const image = (row as { image?: unknown }).image;
    if (typeof name !== "string" || !name.trim()) continue;
    out.push({
      name: name.trim(),
      image: typeof image === "string" && image.startsWith("http") ? image : null,
    });
  }
  return out;
}

async function fetchSuggestions(
  q: string,
  signal: AbortSignal,
): Promise<GameSearchHit[]> {
  if (process.env.NODE_ENV !== "production") {
    const res = await fetch("/api/games/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q }),
      signal,
    });
    const data: unknown = await res.json();
    return res.ok ? parseGamesResponse(data) : [];
  }

  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke("rawg-games-search", {
    body: { q },
  });
  if (error) return [];
  return parseGamesResponse(data);
}

export function useDebouncedRawgGameSearch(query: string) {
  const [suggestions, setSuggestions] = useState<GameSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const reqSessionRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    abortRef.current?.abort();
    const session = ++reqSessionRef.current;

    if (q.length < RAWG_GAME_SEARCH_MIN_QUERY_LEN) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (session !== reqSessionRef.current) return;
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setSuggestions([]);
      try {
        const hits = await fetchSuggestions(q, ac.signal);
        if (session !== reqSessionRef.current || ac.signal.aborted) return;
        setSuggestions(hits);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setSuggestions([]);
      } finally {
        if (!ac.signal.aborted && session === reqSessionRef.current) setLoading(false);
      }
    }, RAWG_GAME_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query]);

  return { suggestions, loading };
}

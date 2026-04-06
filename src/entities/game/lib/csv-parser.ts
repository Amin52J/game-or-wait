import Papa from "papaparse";
import type { Game } from "@/shared/types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function parseCSV(raw: string): Game[] {
  const result = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows = result.data as Record<string, string>[];
  if (!rows.length) return [];

  const headers = Object.keys(rows[0]).map((h) => h.toLowerCase());
  const nameCol = headers.find((h) =>
    ["name", "game", "title", "game name", "game_name"].includes(h),
  );
  const scoreCol = headers.find((h) =>
    ["user score", "score", "rating", "user_score", "my score", "my_score"].includes(h),
  );
  const sortCol = headers.find((h) =>
    ["sorting name", "sorting_name", "sort name", "sort_name"].includes(h),
  );

  if (!nameCol) {
    const firstCol = headers[0];
    if (!firstCol) return [];
    return parseWithColumns(rows, firstCol, headers[2] || null, headers[1] || null);
  }

  return parseWithColumns(rows, nameCol, scoreCol || null, sortCol || null);
}

function parseWithColumns(
  rows: Record<string, string>[],
  nameCol: string,
  scoreCol: string | null,
  sortCol: string | null,
): Game[] {
  const origHeaders = Object.keys(rows[0]);
  const nameKey = origHeaders.find((h) => h.toLowerCase() === nameCol) || nameCol;
  const scoreKey = scoreCol
    ? origHeaders.find((h) => h.toLowerCase() === scoreCol) || scoreCol
    : null;
  const sortKey = sortCol ? origHeaders.find((h) => h.toLowerCase() === sortCol) || sortCol : null;

  const seen = new Map<string, Game>();

  for (const row of rows) {
    const name = row[nameKey]?.trim();
    if (!name) continue;

    const rawScore = scoreKey ? row[scoreKey]?.trim() : "";
    const score = rawScore ? parseInt(rawScore, 10) : null;
    const sortingName = sortKey ? row[sortKey]?.trim() || undefined : undefined;

    const existing = seen.get(name);
    if (existing) {
      if (score !== null && (existing.score === null || score > existing.score)) {
        existing.score = score;
      }
      continue;
    }

    seen.set(name, {
      id: generateId(),
      name,
      sortingName,
      score: isNaN(score as number) ? null : score,
    });
  }

  return Array.from(seen.values());
}

export function parseJSON(raw: string): Game[] {
  const data = JSON.parse(raw);
  const arr = Array.isArray(data) ? data : data.games || data.library || [];
  return arr
    .map((item: Record<string, unknown>) => ({
      id: generateId(),
      name: String(item.name || item.title || item.game || ""),
      sortingName: item.sortingName ? String(item.sortingName) : undefined,
      score:
        item.score !== undefined && item.score !== null && item.score !== ""
          ? Number(item.score)
          : item.rating !== undefined && item.rating !== null && item.rating !== ""
            ? Number(item.rating)
            : null,
    }))
    .filter((g: Game) => g.name);
}

export function parsePlainText(raw: string): Game[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line) => {
    const match = line.match(/^(.+?)[\s,\-:|]+(\d{1,3})\s*$/);
    if (match) {
      return {
        id: generateId(),
        name: match[1].trim(),
        score: parseInt(match[2], 10),
      };
    }
    return { id: generateId(), name: line, score: null };
  });
}

export function parseAnyFormat(raw: string): Game[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return parseJSON(trimmed);
    } catch {
      /* fall through */
    }
  }
  if (
    trimmed.includes(",") &&
    (trimmed.toLowerCase().includes("name") ||
      trimmed.toLowerCase().includes("score") ||
      trimmed.toLowerCase().includes("game"))
  ) {
    const result = parseCSV(trimmed);
    if (result.length > 0) return result;
  }
  if (trimmed.includes(",")) {
    const result = parseCSV(trimmed);
    if (result.length > 0) return result;
  }
  return parsePlainText(trimmed);
}

export function gamesToCSV(games: Game[]): string {
  const rows = games.map((g) => ({
    Name: g.name,
    "Sorting Name": g.sortingName || "",
    "User Score": g.score !== null ? String(g.score) : "",
  }));
  return Papa.unparse(rows);
}

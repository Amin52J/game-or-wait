import type { Game } from "@/shared/types";
import type { LibraryShowcaseGameRow } from "@/shared/api/db";

export function sortShowcaseGamesToGames(rows: LibraryShowcaseGameRow[]): Game[] {
  const stable = [...rows];
  stable.sort((a, b) => {
    if (a.score != null && b.score != null && a.score !== b.score) return b.score - a.score;
    if (a.score != null && b.score == null) return -1;
    if (a.score == null && b.score != null) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  return stable.map((g, i) => ({
    id: `showcase-${i}`,
    name: g.name,
    score: g.score,
    sortingName: undefined,
  }));
}

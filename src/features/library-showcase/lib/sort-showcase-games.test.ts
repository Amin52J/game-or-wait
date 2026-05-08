import { describe, expect, it } from "vitest";
import { sortShowcaseGamesToGames } from "./sort-showcase-games";

describe("sortShowcaseGamesToGames", () => {
  it("sorts by score descending, then name, with null scores last", () => {
    const out = sortShowcaseGamesToGames([
      { name: "B", score: 5 },
      { name: "A", score: 10 },
      { name: "C", score: null },
    ]);
    expect(out.map((g) => [g.name, g.score])).toEqual([
      ["A", 10],
      ["B", 5],
      ["C", null],
    ]);
  });
});

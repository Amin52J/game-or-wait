import { describe, it, expect } from "vitest";
import {
  mergeGameLists,
  computeScoreBuckets,
  defaultSetupAnswers,
  defaultAiConfig,
  generateId,
  STEPS,
  CURRENCIES,
} from "./SetupWizard.utils";
import type { Game } from "@/shared/types";

function makeGame(name: string, score: number | null, id?: string): Game {
  return { id: id ?? "g-" + name.toLowerCase().replace(/\s/g, "-"), name, score };
}

describe("mergeGameLists", () => {
  it("combines two disjoint lists", () => {
    const a = [makeGame("Game A", 80)];
    const b = [makeGame("Game B", 70)];
    const merged = mergeGameLists(a, b);
    expect(merged).toHaveLength(2);
  });

  it("deduplicates by name (case-insensitive)", () => {
    const a = [makeGame("Game A", 80, "id1")];
    const b = [makeGame("game a", 70, "id2")];
    const merged = mergeGameLists(a, b);
    expect(merged).toHaveLength(1);
  });

  it("default (bPriority=false): a wins unless b has higher score", () => {
    const a = [makeGame("Game A", 80, "id1")];
    const b = [makeGame("Game A", 70, "id2")];
    const merged = mergeGameLists(a, b, false);
    expect(merged[0].score).toBe(80);
    expect(merged[0].id).toBe("id1");
  });

  it("default: b wins if it has a strictly higher score", () => {
    const a = [makeGame("Game A", 70, "id1")];
    const b = [makeGame("Game A", 90, "id2")];
    const merged = mergeGameLists(a, b, false);
    expect(merged[0].score).toBe(90);
    expect(merged[0].id).toBe("id1");
  });

  it("bPriority: b overwrites a", () => {
    const a = [makeGame("Game A", 80, "id1")];
    const b = [makeGame("Game A", 50, "id2")];
    const merged = mergeGameLists(a, b, true);
    expect(merged[0].score).toBe(50);
    expect(merged[0].id).toBe("id1");
  });

  it("bPriority: keeps a if a has score and b doesn't", () => {
    const a = [makeGame("Game A", 80, "id1")];
    const b = [makeGame("Game A", null, "id2")];
    const merged = mergeGameLists(a, b, true);
    expect(merged[0].score).toBe(80);
    expect(merged[0].id).toBe("id1");
  });

  it("handles empty lists", () => {
    expect(mergeGameLists([], [])).toEqual([]);
    expect(mergeGameLists([makeGame("A", 80)], [])).toHaveLength(1);
    expect(mergeGameLists([], [makeGame("B", 70)])).toHaveLength(1);
  });

  it("handles names with leading/trailing whitespace", () => {
    const a = [makeGame("  Game A  ", 80, "id1")];
    const b = [makeGame("Game A", 70, "id2")];
    const merged = mergeGameLists(a, b);
    expect(merged).toHaveLength(1);
  });
});

describe("computeScoreBuckets", () => {
  it("returns all zeros for empty list", () => {
    const buckets = computeScoreBuckets([]);
    expect(buckets.b0_25).toBe(0);
    expect(buckets.b26_50).toBe(0);
    expect(buckets.b51_75).toBe(0);
    expect(buckets.b76_100).toBe(0);
    expect(buckets.unscored).toBe(0);
  });

  it("counts unscored games", () => {
    const games = [makeGame("A", null), makeGame("B", null)];
    const buckets = computeScoreBuckets(games);
    expect(buckets.unscored).toBe(2);
  });

  it("distributes scores into correct buckets", () => {
    const games = [
      makeGame("A", 10),
      makeGame("B", 25),
      makeGame("C", 30),
      makeGame("D", 50),
      makeGame("E", 60),
      makeGame("F", 75),
      makeGame("G", 80),
      makeGame("H", 100),
      makeGame("I", null),
    ];
    const buckets = computeScoreBuckets(games);
    expect(buckets.b0_25).toBe(2);
    expect(buckets.b26_50).toBe(2);
    expect(buckets.b51_75).toBe(2);
    expect(buckets.b76_100).toBe(2);
    expect(buckets.unscored).toBe(1);
  });

  it("handles edge values correctly", () => {
    const games = [
      makeGame("A", 0),
      makeGame("B", 25),
      makeGame("C", 26),
      makeGame("D", 50),
      makeGame("E", 51),
      makeGame("F", 75),
      makeGame("G", 76),
      makeGame("H", 100),
    ];
    const buckets = computeScoreBuckets(games);
    expect(buckets.b0_25).toBe(2);
    expect(buckets.b26_50).toBe(2);
    expect(buckets.b51_75).toBe(2);
    expect(buckets.b76_100).toBe(2);
  });
});

describe("defaultSetupAnswers", () => {
  it("returns valid default answers", () => {
    const answers = defaultSetupAnswers();
    expect(answers.playStyle).toBe("singleplayer");
    expect(answers.storyImportance).toBe(3);
    expect(answers.gameplayImportance).toBe(3);
    expect(answers.dealbreakers).toEqual([]);
    expect(answers.customDealbreakers).toEqual([]);
    expect(answers.currency).toBe("EUR");
    expect(answers.additionalNotes).toBe("");
  });

  it("returns a new object each time (not a shared reference)", () => {
    const a = defaultSetupAnswers();
    const b = defaultSetupAnswers();
    expect(a).not.toBe(b);
    a.dealbreakers.push("grind");
    expect(b.dealbreakers).toEqual([]);
  });
});

describe("defaultAiConfig", () => {
  it("returns anthropic as default provider", () => {
    const config = defaultAiConfig();
    expect(config.type).toBe("anthropic");
    expect(config.apiKey).toBe("");
    expect(config.model.length).toBeGreaterThan(0);
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("returns unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("STEPS constant", () => {
  it("has 4 steps", () => {
    expect(STEPS).toHaveLength(4);
    expect(STEPS[0].label).toBe("AI Provider");
    expect(STEPS[3].label).toBe("Review");
  });
});

describe("CURRENCIES constant", () => {
  it("contains common currencies", () => {
    const codes = CURRENCIES.map((c) => c.code);
    expect(codes).toContain("EUR");
    expect(codes).toContain("USD");
    expect(codes).toContain("GBP");
    expect(codes).toContain("JPY");
  });

  it("has matching code in label", () => {
    for (const c of CURRENCIES) {
      expect(c.label).toContain(c.code);
    }
  });
});

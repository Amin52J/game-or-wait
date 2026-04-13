import { describe, it, expect } from "vitest";
import { PAGE_SIZE, SCORE_RANGES } from "./GameLibrary.utils";

describe("PAGE_SIZE", () => {
  it("is a positive number", () => {
    expect(PAGE_SIZE).toBeGreaterThan(0);
    expect(PAGE_SIZE).toBe(50);
  });
});

describe("SCORE_RANGES", () => {
  it("has 6 ranges including unscored", () => {
    expect(SCORE_RANGES).toHaveLength(6);
  });

  it("covers 0-100 range in the scored entries", () => {
    const scored = SCORE_RANGES.filter((r) => r.key !== "unscored");
    expect(scored[0].min).toBe(90);
    expect(scored[0].max).toBe(100);
    expect(scored[scored.length - 1].min).toBe(0);
    expect(scored[scored.length - 1].max).toBe(24);
  });

  it("has no gaps in scored ranges", () => {
    const scored = SCORE_RANGES.filter((r) => r.key !== "unscored");
    for (let i = 1; i < scored.length; i++) {
      expect(scored[i].max).toBe(scored[i - 1].min - 1);
    }
  });

  it("has an unscored entry", () => {
    const unscored = SCORE_RANGES.find((r) => r.key === "unscored");
    expect(unscored).toBeDefined();
    expect(unscored!.min).toBe(-1);
    expect(unscored!.max).toBe(-1);
  });

  it("every range has a label", () => {
    for (const range of SCORE_RANGES) {
      expect(range.label.length).toBeGreaterThan(0);
    }
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  formatDate,
  formatDateShort,
  formatPrice,
  matchesScoreFilter,
  matchesRiskFilter,
  SCORE_FILTERS,
  RISK_FILTERS,
} from "./HistoryPage.utils";

describe("formatPrice", () => {
  it("formats with currency code", () => {
    expect(formatPrice(59.99, "USD")).toContain("59");
  });

  it("defaults to USD", () => {
    expect(formatPrice(30, undefined)).toContain("30");
  });

  it("falls back for invalid currency", () => {
    const result = formatPrice(30, "INVALID");
    expect(result).toContain("30");
  });
});

describe("formatDate", () => {
  it("returns a non-empty string for a valid timestamp", () => {
    const result = formatDate(Date.now());
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles zero timestamp", () => {
    const result = formatDate(0);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatDateShort", () => {
  it("returns a non-empty string for a valid timestamp", () => {
    const result = formatDateShort(Date.now());
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("matchesScoreFilter", () => {
  it("returns true when no filters are active", () => {
    expect(matchesScoreFilter(85, new Set())).toBe(true);
    expect(matchesScoreFilter(null, new Set())).toBe(true);
  });

  it("returns false for null score when filters are active", () => {
    expect(matchesScoreFilter(null, new Set(["excellent"]))).toBe(false);
  });

  it("matches excellent (80+)", () => {
    expect(matchesScoreFilter(85, new Set(["excellent"]))).toBe(true);
    expect(matchesScoreFilter(100, new Set(["excellent"]))).toBe(true);
    expect(matchesScoreFilter(79, new Set(["excellent"]))).toBe(false);
  });

  it("matches good (60-79)", () => {
    expect(matchesScoreFilter(70, new Set(["good"]))).toBe(true);
    expect(matchesScoreFilter(60, new Set(["good"]))).toBe(true);
    expect(matchesScoreFilter(79, new Set(["good"]))).toBe(true);
    expect(matchesScoreFilter(59, new Set(["good"]))).toBe(false);
  });

  it("matches mixed (40-59)", () => {
    expect(matchesScoreFilter(50, new Set(["mixed"]))).toBe(true);
    expect(matchesScoreFilter(40, new Set(["mixed"]))).toBe(true);
    expect(matchesScoreFilter(39, new Set(["mixed"]))).toBe(false);
  });

  it("matches low (< 40)", () => {
    expect(matchesScoreFilter(30, new Set(["low"]))).toBe(true);
    expect(matchesScoreFilter(0, new Set(["low"]))).toBe(true);
    expect(matchesScoreFilter(40, new Set(["low"]))).toBe(false);
  });

  it("matches multiple filters with OR logic", () => {
    expect(matchesScoreFilter(85, new Set(["excellent", "good"]))).toBe(true);
    expect(matchesScoreFilter(70, new Set(["excellent", "good"]))).toBe(true);
    expect(matchesScoreFilter(50, new Set(["excellent", "good"]))).toBe(false);
  });
});

describe("matchesRiskFilter", () => {
  it("returns true when no filters are active", () => {
    expect(matchesRiskFilter("high", new Set())).toBe(true);
    expect(matchesRiskFilter("none", new Set())).toBe(true);
  });

  it("matches specific risk levels", () => {
    expect(matchesRiskFilter("high", new Set(["high"]))).toBe(true);
    expect(matchesRiskFilter("medium", new Set(["medium"]))).toBe(true);
    expect(matchesRiskFilter("none", new Set(["none"]))).toBe(true);
  });

  it("returns false for non-matching risk", () => {
    expect(matchesRiskFilter("high", new Set(["none"]))).toBe(false);
    expect(matchesRiskFilter("none", new Set(["high", "medium"]))).toBe(false);
  });
});

describe("SCORE_FILTERS constant", () => {
  it("has 4 filter entries covering the full 0-100 range", () => {
    expect(SCORE_FILTERS).toHaveLength(4);
    expect(SCORE_FILTERS[0].min).toBe(80);
    expect(SCORE_FILTERS[0].max).toBe(100);
    expect(SCORE_FILTERS[3].min).toBe(0);
    expect(SCORE_FILTERS[3].max).toBe(39);
  });
});

describe("RISK_FILTERS constant", () => {
  it("has 3 risk levels", () => {
    expect(RISK_FILTERS).toHaveLength(3);
    const keys = RISK_FILTERS.map((f) => f.key);
    expect(keys).toContain("none");
    expect(keys).toContain("medium");
    expect(keys).toContain("high");
  });
});

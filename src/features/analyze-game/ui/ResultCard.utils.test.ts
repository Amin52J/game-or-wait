import { describe, it, expect } from "vitest";
import {
  riskAccent,
  riskColor,
  confidenceColor,
  scoreColor,
  priceColor,
  formatCurrencyValue,
  formatPrice,
  displaySortKey,
  DISPLAY_ORDER,
  FALLBACK_THEME,
} from "./ResultCard.utils";

const theme = FALLBACK_THEME;

describe("riskAccent", () => {
  it("maps risk levels to accent strings", () => {
    expect(riskAccent("high")).toBe("risk-high");
    expect(riskAccent("medium")).toBe("risk-medium");
    expect(riskAccent("none")).toBe("risk-none");
    expect(riskAccent("unknown")).toBe("default");
  });
});

describe("riskColor", () => {
  it("returns error color for high risk", () => {
    expect(riskColor("high", theme)).toBe(theme.colors.error);
  });

  it("returns warning color for medium risk", () => {
    expect(riskColor("medium", theme)).toBe(theme.colors.warning);
  });

  it("returns success color for no risk", () => {
    expect(riskColor("none", theme)).toBe(theme.colors.success);
  });

  it("returns secondary text for unknown risk", () => {
    expect(riskColor("unknown", theme)).toBe(theme.colors.textSecondary);
  });
});

describe("confidenceColor", () => {
  it("returns success for High and Very High", () => {
    expect(confidenceColor("High", theme)).toBe(theme.colors.success);
    expect(confidenceColor("Very High", theme)).toBe(theme.colors.success);
    expect(confidenceColor("high", theme)).toBe(theme.colors.success);
  });

  it("returns warning for Medium", () => {
    expect(confidenceColor("Medium", theme)).toBe(theme.colors.warning);
    expect(confidenceColor("medium", theme)).toBe(theme.colors.warning);
  });

  it("returns error for Low and Very Low", () => {
    expect(confidenceColor("Low", theme)).toBe(theme.colors.error);
    expect(confidenceColor("Very Low", theme)).toBe(theme.colors.error);
  });
});

describe("scoreColor", () => {
  it("returns success for scores >= 80", () => {
    expect(scoreColor(80, theme)).toBe(theme.colors.success);
    expect(scoreColor(100, theme)).toBe(theme.colors.success);
  });

  it("returns accent for scores 60-79", () => {
    expect(scoreColor(60, theme)).toBe(theme.colors.accent);
    expect(scoreColor(79, theme)).toBe(theme.colors.accent);
  });

  it("returns warning for scores 40-59", () => {
    expect(scoreColor(40, theme)).toBe(theme.colors.warning);
    expect(scoreColor(59, theme)).toBe(theme.colors.warning);
  });

  it("returns error for scores < 40", () => {
    expect(scoreColor(39, theme)).toBe(theme.colors.error);
    expect(scoreColor(0, theme)).toBe(theme.colors.error);
  });
});

describe("priceColor", () => {
  it("returns error for don't buy", () => {
    expect(priceColor("Don't buy", theme)).toBe(theme.colors.error);
    expect(priceColor("Don\u2019t buy", theme)).toBe(theme.colors.success);
  });

  it("returns success for price values", () => {
    expect(priceColor("€45", theme)).toBe(theme.colors.success);
    expect(priceColor("$60", theme)).toBe(theme.colors.success);
  });
});

describe("formatCurrencyValue", () => {
  it("formats with currency code", () => {
    const result = formatCurrencyValue(45, "USD");
    expect(result).toContain("45");
  });

  it("defaults to USD when no code provided", () => {
    const result = formatCurrencyValue(45, undefined);
    expect(result).toContain("45");
  });

  it("handles JPY (no decimals)", () => {
    const result = formatCurrencyValue(5000, "JPY");
    expect(result).toContain("5,000") ;
  });

  it("falls back to code + number for invalid currency", () => {
    const result = formatCurrencyValue(45, "INVALID");
    expect(result).toContain("INVALID");
    expect(result).toContain("45");
  });
});

describe("formatPrice", () => {
  it("formats price with decimals", () => {
    const result = formatPrice(59.99, "USD");
    expect(result).toContain("59");
  });

  it("defaults to USD", () => {
    const result = formatPrice(30, undefined);
    expect(result).toContain("30");
  });

  it("falls back for invalid currency", () => {
    const result = formatPrice(30, "INVALID");
    expect(result).toContain("30");
  });
});

describe("displaySortKey", () => {
  it("returns correct order for known sections", () => {
    expect(displaySortKey("refund-guard")).toBe(0);
    expect(displaySortKey("positive-alignment")).toBe(1);
    expect(displaySortKey("negative-factors")).toBe(2);
    expect(displaySortKey("red-line-risk")).toBe(3);
    expect(displaySortKey("public-sentiment")).toBe(4);
  });

  it("returns length for unknown sections (sorts last)", () => {
    expect(displaySortKey("unknown-section")).toBe(DISPLAY_ORDER.length);
  });

  it("sorts known before unknown", () => {
    const known = displaySortKey("refund-guard");
    const unknown = displaySortKey("custom-section");
    expect(known).toBeLessThan(unknown);
  });
});

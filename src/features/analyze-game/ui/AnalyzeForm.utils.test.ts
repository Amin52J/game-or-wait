import { describe, it, expect } from "vitest";
import { currencyPrefixFromSettings } from "./AnalyzeForm.utils";

describe("currencyPrefixFromSettings", () => {
  it("returns $ for undefined currency", () => {
    expect(currencyPrefixFromSettings(undefined)).toBe("$");
  });

  it("returns a symbol for known currency codes", () => {
    const eur = currencyPrefixFromSettings("EUR");
    expect(eur.length).toBeGreaterThan(0);

    const usd = currencyPrefixFromSettings("USD");
    expect(usd).toContain("$");
  });

  it("returns the code itself for unknown currencies", () => {
    expect(currencyPrefixFromSettings("FAKE")).toBe("FAKE");
  });

  it("handles JPY", () => {
    const jpy = currencyPrefixFromSettings("JPY");
    expect(jpy.length).toBeGreaterThan(0);
  });
});

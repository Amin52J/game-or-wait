import { describe, it, expect } from "vitest";
import { NAV_ITEMS, isNavActive } from "./Sidebar.utils";

describe("NAV_ITEMS", () => {
  it("contains all required navigation items", () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    expect(labels).toContain("Analyze");
    expect(labels).toContain("Library");
    expect(labels).toContain("Score");
    expect(labels).toContain("History");
    expect(labels).toContain("Settings");
    expect(labels).toContain("Help");
  });

  it("every item has href, label, and icon", () => {
    for (const item of NAV_ITEMS) {
      expect(item.href).toBeTruthy();
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
    }
  });
});

describe("isNavActive", () => {
  it("returns true for exact path match", () => {
    expect(isNavActive("/library", "/library")).toBe(true);
    expect(isNavActive("/settings", "/settings")).toBe(true);
  });

  it("returns true for analyze when pathname is /", () => {
    expect(isNavActive("/", "/analyze")).toBe(true);
  });

  it("returns true for sub-paths", () => {
    expect(isNavActive("/library/import", "/library")).toBe(true);
    expect(isNavActive("/settings/account", "/settings")).toBe(true);
  });

  it("returns false for non-matching paths", () => {
    expect(isNavActive("/library", "/settings")).toBe(false);
    expect(isNavActive("/analyze", "/library")).toBe(false);
  });

  it("returns false for partial but non-sub-path matches", () => {
    expect(isNavActive("/help-more", "/help")).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { matchRoute, PAGES } from "./KeepAlivePages.utils";

describe("matchRoute", () => {
  it("matches exact path", () => {
    expect(matchRoute("/library", "/library")).toBe(true);
    expect(matchRoute("/settings", "/settings")).toBe(true);
  });

  it("matches / and /analyze for the analyze route", () => {
    expect(matchRoute("/", "/analyze")).toBe(true);
    expect(matchRoute("/analyze", "/analyze")).toBe(true);
  });

  it("matches sub-paths", () => {
    expect(matchRoute("/history/detail", "/history")).toBe(true);
    expect(matchRoute("/settings/provider", "/settings")).toBe(true);
  });

  it("returns false for non-matching paths", () => {
    expect(matchRoute("/library", "/settings")).toBe(false);
    expect(matchRoute("/help", "/history")).toBe(false);
  });

  it("does not match partial prefix without /", () => {
    expect(matchRoute("/scores", "/score")).toBe(false);
  });
});

describe("PAGES", () => {
  it("has entries for all main routes", () => {
    const paths = PAGES.map((p) => p.path);
    expect(paths).toContain("/analyze");
    expect(paths).toContain("/library");
    expect(paths).toContain("/score");
    expect(paths).toContain("/history");
    expect(paths).toContain("/settings");
    expect(paths).toContain("/help");
  });

  it("all entries have a Component", () => {
    for (const page of PAGES) {
      expect(page.Component).toBeDefined();
      expect(typeof page.Component).toBe("function");
    }
  });
});

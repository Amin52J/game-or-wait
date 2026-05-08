import { describe, expect, it } from "vitest";
import { showcaseShareDescription } from "./showcase-share-description";

describe("showcaseShareDescription", () => {
  it("formats count for one game", () => {
    expect(showcaseShareDescription(1)).toMatch(/^1 game\b/);
  });

  it("formats count for multiple games", () => {
    expect(showcaseShareDescription(42)).toContain("42 games");
  });

  it("handles empty", () => {
    expect(showcaseShareDescription(0)).toContain("Read-only");
  });
});

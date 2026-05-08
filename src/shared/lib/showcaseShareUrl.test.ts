import { describe, expect, it } from "vitest";
import { PUBLIC_SITE_ORIGIN } from "./publicSiteOrigin";
import { getShowcaseShareUrl } from "./showcaseShareUrl";

describe("getShowcaseShareUrl", () => {
  it("builds a showcase URL with encoded id", () => {
    const id = "abc-123";
    expect(getShowcaseShareUrl(id)).toBe(
      `${PUBLIC_SITE_ORIGIN}/showcase?id=${encodeURIComponent(id)}`,
    );
  });

  it("trims the public id", () => {
    expect(getShowcaseShareUrl("  x  ")).toBe(
      `${PUBLIC_SITE_ORIGIN}/showcase?id=${encodeURIComponent("x")}`,
    );
  });
});

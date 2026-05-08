import { describe, expect, it } from "vitest";
import { possessiveShowcaseHeading } from "./possessive-showcase-heading";

describe("possessiveShowcaseHeading", () => {
  it("uses 's when the name does not end in s", () => {
    expect(possessiveShowcaseHeading("Alex")).toBe("Alex's library");
  });

  it("uses apostrophe only when the name ends in s (any case)", () => {
    expect(possessiveShowcaseHeading("James")).toBe("James' library");
    expect(possessiveShowcaseHeading("Chris")).toBe("Chris' library");
    expect(possessiveShowcaseHeading("JONES")).toBe("JONES' library");
  });

  it("returns fallback when empty or whitespace", () => {
    expect(possessiveShowcaseHeading(null)).toBe("Library showcase");
    expect(possessiveShowcaseHeading("")).toBe("Library showcase");
    expect(possessiveShowcaseHeading("  ")).toBe("Library showcase");
  });
});

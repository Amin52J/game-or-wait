import { describe, expect, it } from "vitest";
import {
  SHOWCASE_ROUTE,
  isPublicShowcasePath,
  normalizeShowcasePath,
} from "./publicShowcaseRoute";

describe("publicShowcaseRoute", () => {
  it("exports the showcase pathname", () => {
    expect(SHOWCASE_ROUTE).toBe("/showcase");
  });

  describe("normalizeShowcasePath", () => {
    it("returns empty string for nullish or blank input", () => {
      expect(normalizeShowcasePath(null)).toBe("");
      expect(normalizeShowcasePath(undefined)).toBe("");
      expect(normalizeShowcasePath("")).toBe("");
      expect(normalizeShowcasePath("   ")).toBe("");
    });

    it("trims whitespace and trailing slashes", () => {
      expect(normalizeShowcasePath(" /showcase/ ")).toBe("/showcase");
      expect(normalizeShowcasePath("/showcase///")).toBe("/showcase");
    });

    it("leaves single slash as root path", () => {
      expect(normalizeShowcasePath("/")).toBe("/");
    });
  });

  describe("isPublicShowcasePath", () => {
    it("is true only for the normalized showcase path", () => {
      expect(isPublicShowcasePath("/showcase")).toBe(true);
      expect(isPublicShowcasePath("/showcase/")).toBe(true);
      expect(isPublicShowcasePath("/showcase/other")).toBe(false);
      expect(isPublicShowcasePath("/")).toBe(false);
    });
  });
});

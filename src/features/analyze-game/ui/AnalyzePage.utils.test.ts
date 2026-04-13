import { describe, it, expect } from "vitest";
import { errorMessage } from "./AnalyzePage.utils";

describe("errorMessage", () => {
  it("returns message from Error instance", () => {
    expect(errorMessage(new Error("test error"))).toBe("test error");
  });

  it("returns string directly", () => {
    expect(errorMessage("string error")).toBe("string error");
  });

  it("returns fallback for unknown types", () => {
    expect(errorMessage(null)).toBe("Something went wrong. Try again.");
    expect(errorMessage(undefined)).toBe("Something went wrong. Try again.");
    expect(errorMessage(42)).toBe("Something went wrong. Try again.");
    expect(errorMessage({})).toBe("Something went wrong. Try again.");
  });
});

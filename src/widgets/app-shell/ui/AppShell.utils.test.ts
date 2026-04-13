import { describe, it, expect, beforeEach } from "vitest";
import { noopSubscribe, getTauriServer } from "./AppShell.utils";

describe("noopSubscribe", () => {
  it("returns a function", () => {
    const unsubscribe = noopSubscribe();
    expect(typeof unsubscribe).toBe("function");
  });

  it("returned function is callable without error", () => {
    const unsubscribe = noopSubscribe();
    expect(() => unsubscribe()).not.toThrow();
  });
});

describe("getTauriServer", () => {
  it("returns null (server-side snapshot value)", () => {
    expect(getTauriServer()).toBeNull();
  });
});

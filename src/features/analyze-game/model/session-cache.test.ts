import { describe, it, expect, beforeEach } from "vitest";
import { sessionCache } from "./session-cache";

describe("sessionCache", () => {
  beforeEach(() => {
    sessionCache.clear();
  });

  it("returns empty defaults after clear", () => {
    const session = sessionCache.get();
    expect(session.gameName).toBe("");
    expect(session.priceRaw).toBe("");
    expect(session.result).toBeNull();
    expect(session.streamedText).toBe("");
    expect(session.prefillId).toBe(0);
  });

  it("sets partial data and merges", () => {
    sessionCache.set({ gameName: "Elden Ring", priceRaw: "60" });
    const session = sessionCache.get();
    expect(session.gameName).toBe("Elden Ring");
    expect(session.priceRaw).toBe("60");
    expect(session.result).toBeNull();
  });

  it("preserves unset fields on partial update", () => {
    sessionCache.set({ gameName: "Elden Ring" });
    sessionCache.set({ priceRaw: "60" });
    const session = sessionCache.get();
    expect(session.gameName).toBe("Elden Ring");
    expect(session.priceRaw).toBe("60");
  });

  it("overwrites fields on subsequent set", () => {
    sessionCache.set({ gameName: "Elden Ring" });
    sessionCache.set({ gameName: "Hollow Knight" });
    expect(sessionCache.get().gameName).toBe("Hollow Knight");
  });

  it("stores and retrieves a result object", () => {
    const result = {
      id: "abc123",
      gameName: "Test Game",
      price: 60,
      response: "## Public Sentiment\nVery Positive",
      timestamp: Date.now(),
    };
    sessionCache.set({ result });
    expect(sessionCache.get().result).toEqual(result);
  });

  it("stores streamed text", () => {
    sessionCache.set({ streamedText: "## Public Sentiment" });
    sessionCache.set({ streamedText: "## Public Sentiment\nVery Positive" });
    expect(sessionCache.get().streamedText).toBe(
      "## Public Sentiment\nVery Positive",
    );
  });

  it("clear resets everything", () => {
    sessionCache.set({
      gameName: "Test",
      priceRaw: "50",
      streamedText: "content",
      prefillId: 123,
    });
    sessionCache.clear();
    const session = sessionCache.get();
    expect(session.gameName).toBe("");
    expect(session.priceRaw).toBe("");
    expect(session.streamedText).toBe("");
    expect(session.prefillId).toBe(0);
  });
});

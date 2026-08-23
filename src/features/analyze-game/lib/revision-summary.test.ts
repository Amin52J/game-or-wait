import { describe, expect, it } from "vitest";
import { buildRevisionSummary } from "./revision-summary";

function analysis({
  score = 72,
  risk = "None",
  refund = "Not required",
  confidence = "High",
}: {
  score?: number;
  risk?: string;
  refund?: string;
  confidence?: string;
} = {}) {
  return [
    `## Red-Line Risk`,
    risk,
    ``,
    `## Refund Guard`,
    refund,
    ``,
    `## Enjoyment Score`,
    `**${score}/100** | Confidence: ${confidence}`,
  ].join("\n");
}

describe("buildRevisionSummary", () => {
  it("reports a score change with both values", () => {
    const summary = buildRevisionSummary(analysis({ score: 72 }), analysis({ score: 61 }), 60, "EUR");
    expect(summary).toContain("Enjoyment score **72 → 61**");
  });

  it("reports the derived target price change alongside the score", () => {
    const summary = buildRevisionSummary(analysis({ score: 85 }), analysis({ score: 50 }), 60, "USD");
    expect(summary).toMatch(/Target price \*\*.+ → .+\*\*/);
  });

  it("says nothing changed when the re-run lands on the same numbers", () => {
    const summary = buildRevisionSummary(analysis(), analysis(), 60, "EUR");
    expect(summary).toContain("came out the same");
  });

  it("reports a risk level change", () => {
    const summary = buildRevisionSummary(
      analysis({ risk: "None" }),
      analysis({ risk: "High — always-online" }),
      60,
      "EUR",
    );
    expect(summary).toContain("Red-line risk **none → high**");
  });

  it("reports the refund guard flipping on", () => {
    const summary = buildRevisionSummary(
      analysis({ refund: "Not required" }),
      analysis({ refund: "Recommended — check the first two hours" }),
      60,
      "EUR",
    );
    expect(summary).toContain("Refund guard is now **recommended**");
  });

  it("falls back to a plain message when the score cannot be parsed", () => {
    const summary = buildRevisionSummary("no sections here", "still nothing", 60, "EUR");
    expect(summary).toContain("came out the same");
  });
});

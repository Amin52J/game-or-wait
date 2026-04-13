import { describe, it, expect } from "vitest";
import {
  parseResponseSections,
  extractMetrics,
  getSectionType,
  isKnownSection,
  isInternalSection,
} from "./response-parser";

describe("parseResponseSections", () => {
  it("returns empty array for empty text", () => {
    expect(parseResponseSections("")).toEqual([]);
  });

  it("captures preamble text before any ## heading", () => {
    const text = "Some intro text\n\n## Section One\nContent";
    const sections = parseResponseSections(text);
    expect(sections[0].key).toBe("preamble");
    expect(sections[0].content).toBe("Some intro text");
  });

  it("captures [EARLY_ACCESS] in preamble", () => {
    const text = "[EARLY_ACCESS]\n\n## Enjoyment Score\n**75/100** | Confidence: High";
    const sections = parseResponseSections(text);
    expect(sections[0].key).toBe("preamble");
    expect(sections[0].content).toContain("[EARLY_ACCESS]");
  });

  it("parses multiple ## sections", () => {
    const text = `## Public Sentiment
Very Positive on Steam

## Positive Alignment
Great match with your taste

## Negative Factors
Some grind reported`;
    const sections = parseResponseSections(text);
    expect(sections).toHaveLength(3);
    expect(sections[0].heading).toBe("Public Sentiment");
    expect(sections[1].heading).toBe("Positive Alignment");
    expect(sections[2].heading).toBe("Negative Factors");
  });

  it("normalizes section keys", () => {
    const text = "## Red-Line Risk Assessment\nContent here";
    const sections = parseResponseSections(text);
    expect(sections[0].key).toBe("red-line-risk-assessment");
  });

  it("handles heading-only sections with no content", () => {
    const text = "## Empty Section";
    const sections = parseResponseSections(text);
    expect(sections[0].heading).toBe("Empty Section");
    expect(sections[0].content).toBe("");
  });

  it("strips trailing horizontal rules from section content", () => {
    const text = "## Section\nContent here\n\n---";
    const sections = parseResponseSections(text);
    expect(sections[0].content).not.toContain("---");
  });
});

describe("extractMetrics", () => {
  function makeSections(texts: Record<string, string>) {
    return Object.entries(texts).map(([heading, content]) => ({
      heading,
      content,
      key: heading
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    }));
  }

  it("extracts standard score and confidence", () => {
    const sections = makeSections({
      "Enjoyment Score": "**82/100** | Confidence: High",
    });
    const m = extractMetrics(sections);
    expect(m.score).toBe(82);
    expect(m.confidence).toBe("High");
  });

  it("extracts early access current/potential scores", () => {
    const sections = [
      { heading: "", content: "[EARLY_ACCESS]", key: "preamble" },
      {
        heading: "Enjoyment Score",
        content: "**65/100 (Current) → 82/100 (Potential)** | Confidence: Medium",
        key: "enjoyment-score",
      },
    ];
    const m = extractMetrics(sections);
    expect(m.score).toBe(65);
    expect(m.potentialScore).toBe(82);
    expect(m.earlyAccess).toBe(true);
  });

  it("extracts risk level", () => {
    const high = makeSections({ "Red-Line Risk": "**High** — core gameplay broken" });
    expect(extractMetrics(high).riskLevel).toBe("high");

    const medium = makeSections({ "Red-Line Risk": "**Medium** — some concerns" });
    expect(extractMetrics(medium).riskLevel).toBe("medium");

    const none = makeSections({ "Red-Line Risk": "**None** — no issues" });
    expect(extractMetrics(none).riskLevel).toBe("none");
  });

  it("extracts refund recommendation", () => {
    const rec = makeSections({ "Refund Guard": "**Recommended** — Mixed reviews" });
    expect(extractMetrics(rec).refundRecommended).toBe(true);

    const notReq = makeSections({ "Refund Guard": "**Not required** — solid reviews" });
    expect(extractMetrics(notReq).refundRecommended).toBe(false);
  });

  it("extracts target price text", () => {
    const sections = makeSections({ "Target Price": "**€45** at current quality" });
    const m = extractMetrics(sections);
    expect(m.targetPrice).toContain("45");
  });

  it("returns defaults for empty sections", () => {
    const m = extractMetrics([]);
    expect(m.score).toBeNull();
    expect(m.potentialScore).toBeNull();
    expect(m.confidence).toBeNull();
    expect(m.riskLevel).toBe("unknown");
    expect(m.targetPrice).toBeNull();
    expect(m.refundRecommended).toBe(false);
    expect(m.earlyAccess).toBe(false);
  });

  it("handles confidence levels: Very High, Medium, Low, Very Low", () => {
    const veryHigh = makeSections({ "Enjoyment Score": "90/100 | Confidence: Very High" });
    expect(extractMetrics(veryHigh).confidence).toBe("Very High");

    const low = makeSections({ "Enjoyment Score": "50/100 | Confidence: Low" });
    expect(extractMetrics(low).confidence).toBe("Low");

    const veryLow = makeSections({ "Enjoyment Score": "30/100 | Very Low confidence" });
    expect(extractMetrics(veryLow).confidence).toBe("Very Low");
  });

  it("handles percentage notation for score", () => {
    const sections = makeSections({ "Enjoyment Score": "**72%** | Confidence: Medium" });
    expect(extractMetrics(sections).score).toBe(72);
  });
});

describe("getSectionType", () => {
  it("returns 'score' for enjoyment-score key", () => {
    expect(getSectionType("enjoyment-score")).toBe("score");
  });

  it("returns 'score' for score-summary key", () => {
    expect(getSectionType("score-summary")).toBe("score");
  });

  it("returns 'price' for target-price key", () => {
    expect(getSectionType("target-price")).toBe("price");
  });

  it("returns 'refund' for refund-guard key", () => {
    expect(getSectionType("refund-guard")).toBe("refund");
  });

  it("returns 'positive' for positive-alignment key", () => {
    expect(getSectionType("positive-alignment")).toBe("positive");
  });

  it("returns 'negative' for negative-factors key", () => {
    expect(getSectionType("negative-factors")).toBe("negative");
  });

  it("returns 'risk' for red-line-risk key", () => {
    expect(getSectionType("red-line-risk")).toBe("risk");
  });

  it("returns 'sentiment' for public-sentiment key", () => {
    expect(getSectionType("public-sentiment")).toBe("sentiment");
  });

  it("returns 'signals' for library-signals key", () => {
    expect(getSectionType("library-signals")).toBe("signals");
  });

  it("returns 'default' for unknown keys", () => {
    expect(getSectionType("unknown-section")).toBe("default");
    expect(getSectionType("foo-bar")).toBe("default");
  });
});

describe("isKnownSection", () => {
  it("returns true for known section keys", () => {
    expect(isKnownSection("target-price")).toBe(true);
    expect(isKnownSection("refund-guard")).toBe(true);
    expect(isKnownSection("enjoyment-score")).toBe(true);
    expect(isKnownSection("public-sentiment")).toBe(true);
    expect(isKnownSection("positive-alignment")).toBe(true);
    expect(isKnownSection("negative-factors")).toBe(true);
    expect(isKnownSection("red-line-risk")).toBe(true);
    expect(isKnownSection("library-signals")).toBe(true);
    expect(isKnownSection("what-the-game-is")).toBe(true);
    expect(isKnownSection("summary")).toBe(true);
  });

  it("matches partial keys (e.g. with extra suffixes)", () => {
    expect(isKnownSection("enjoyment-score-summary")).toBe(true);
    expect(isKnownSection("red-line-risk-assessment")).toBe(true);
  });

  it("returns false for unknown keys", () => {
    expect(isKnownSection("random-section")).toBe(false);
    expect(isKnownSection("foo")).toBe(false);
  });
});

describe("isInternalSection", () => {
  it("returns true for internal section keys", () => {
    expect(isInternalSection("scoring-procedure")).toBe(true);
    expect(isInternalSection("internal-calculation")).toBe(true);
    expect(isInternalSection("methodology")).toBe(true);
    expect(isInternalSection("step-by-step")).toBe(true);
    expect(isInternalSection("anchor-games")).toBe(true);
    expect(isInternalSection("penalty-checklist")).toBe(true);
    expect(isInternalSection("base-score")).toBe(true);
  });

  it("returns false for non-internal keys", () => {
    expect(isInternalSection("public-sentiment")).toBe(false);
    expect(isInternalSection("enjoyment-score")).toBe(false);
    expect(isInternalSection("positive-alignment")).toBe(false);
  });
});

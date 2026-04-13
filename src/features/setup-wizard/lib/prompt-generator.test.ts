import { describe, it, expect } from "vitest";
import { generateInstructions, getExtendedSectionNames } from "./prompt-generator";
import type { SetupAnswers } from "@/shared/types";

function makeAnswers(overrides: Partial<SetupAnswers> = {}): SetupAnswers {
  return {
    playStyle: "singleplayer",
    storyImportance: 4,
    gameplayImportance: 4,
    explorationImportance: 3,
    combatImportance: 3,
    puzzleImportance: 2,
    strategyImportance: 2,
    dealbreakers: ["grind", "always_online", "bad_controls"],
    customDealbreakers: [],
    voiceActingPreference: "preferred",
    difficultyPreference: "moderate",
    idealLength: "medium",
    currency: "EUR",
    region: "Germany",
    additionalNotes: "",
    ...overrides,
  };
}

describe("prompt-generator", () => {
  it("generates non-empty instructions", () => {
    const result = generateInstructions(makeAnswers());
    expect(result.length).toBeGreaterThan(100);
  });

  it("includes role section", () => {
    const result = generateInstructions(makeAnswers());
    expect(result).toContain("Role");
    expect(result).toContain("game analysis assistant");
  });

  it("includes core principles", () => {
    const result = generateInstructions(makeAnswers());
    expect(result).toContain("Core Principles");
    expect(result).toContain("Ground Truth");
    expect(result).toContain("No Assumptions");
  });

  it("includes single-player rules for SP preference", () => {
    const result = generateInstructions(makeAnswers({ playStyle: "singleplayer" }));
    expect(result).toContain("Single-player focus");
  });

  it("includes multiplayer rules for MP preference", () => {
    const result = generateInstructions(makeAnswers({ playStyle: "multiplayer" }));
    expect(result).toContain("Multiplayer considered");
  });

  it("includes both rules for both preference", () => {
    const result = generateInstructions(makeAnswers({ playStyle: "both" }));
    expect(result).toContain("Single-player first");
  });

  it("adds movement clunk penalty for bad_controls dealbreaker", () => {
    const result = generateInstructions(
      makeAnswers({ dealbreakers: ["bad_controls"] }),
    );
    expect(result).toContain("Movement clunk");
  });

  it("adds grind/pacing rules for grind dealbreaker", () => {
    const result = generateInstructions(makeAnswers({ dealbreakers: ["grind"] }));
    expect(result).toContain("Repetition");
  });

  it("adds voice acting rules for essential preference", () => {
    const result = generateInstructions(
      makeAnswers({ voiceActingPreference: "essential" }),
    );
    expect(result).toContain("strongly dislikes");
  });

  it("skips dialogue rules for indifferent preference", () => {
    const result = generateInstructions(
      makeAnswers({ voiceActingPreference: "indifferent" }),
    );
    expect(result).not.toContain("Dialogue & Voice Acting");
  });

  it("includes wayfinding rules when selected", () => {
    const result = generateInstructions(
      makeAnswers({ dealbreakers: ["wayfinding"] }),
    );
    expect(result).toContain("Wayfinding");
  });

  it("does not include target price section (pricing is client-side)", () => {
    const result = generateInstructions(makeAnswers({ currency: "USD", region: "US" }));
    expect(result).not.toContain("## Target Price");
    expect(result).toContain("pricing is computed separately");
  });

  it("includes additional notes when provided", () => {
    const result = generateInstructions(
      makeAnswers({ additionalNotes: "I love open-world games" }),
    );
    expect(result).toContain("I love open-world games");
  });

  it("does not include additional notes section when empty", () => {
    const result = generateInstructions(makeAnswers({ additionalNotes: "" }));
    expect(result).not.toContain("Additional Notes");
  });

  it("includes Red-Line Risk section", () => {
    const result = generateInstructions(makeAnswers());
    expect(result).toContain("Red-Line Risk");
    expect(result).toContain("High");
    expect(result).toContain("Medium");
    expect(result).toContain("None");
  });

  it("includes output format section", () => {
    const result = generateInstructions(makeAnswers());
    expect(result).toContain("Prediction Output Format");
    expect(result).toContain("Enjoyment Score");
  });

  it("includes refund guard in pricing", () => {
    const result = generateInstructions(makeAnswers());
    expect(result).toContain("Refund");
  });

  it("includes custom dealbreakers in Red-Line Risk", () => {
    const result = generateInstructions(
      makeAnswers({ customDealbreakers: ["excessive microtransactions"] }),
    );
    expect(result).toContain("excessive microtransactions");
  });

  it("includes heavy_reading dealbreaker", () => {
    const result = generateInstructions(
      makeAnswers({ dealbreakers: ["heavy_reading"] }),
    );
    expect(result).toContain("reading-heavy");
  });

  it("includes gaas dealbreaker", () => {
    const result = generateInstructions(
      makeAnswers({ dealbreakers: ["gaas"] }),
    );
    expect(result).toContain("GAAS");
  });

  it("includes religious_themes dealbreaker", () => {
    const result = generateInstructions(
      makeAnswers({ dealbreakers: ["religious_themes"] }),
    );
    expect(result).toContain("religious themes");
  });

  it("includes shallow_crafting dealbreaker", () => {
    const result = generateInstructions(
      makeAnswers({ dealbreakers: ["shallow_crafting"] }),
    );
    expect(result).toContain("busywork crafting");
  });

  it("includes slow_start dealbreaker", () => {
    const result = generateInstructions(
      makeAnswers({ dealbreakers: ["slow_start"] }),
    );
    expect(result).toContain("slow early hours");
  });

  it("generates personalized sections for high combat importance", () => {
    const sections = getExtendedSectionNames(
      makeAnswers({ combatImportance: 5 }),
    );
    expect(sections).toContain("Combat Feel & Feedback");
  });

  it("generates personalized sections for high puzzle importance", () => {
    const sections = getExtendedSectionNames(
      makeAnswers({ puzzleImportance: 5 }),
    );
    expect(sections).toContain("Puzzle Design & Variety");
  });

  it("generates personalized sections for high strategy importance", () => {
    const sections = getExtendedSectionNames(
      makeAnswers({ strategyImportance: 5 }),
    );
    expect(sections).toContain("Strategic Depth & Decision-Making");
  });

  it("generates personalized sections for high exploration importance", () => {
    const sections = getExtendedSectionNames(
      makeAnswers({ explorationImportance: 5 }),
    );
    expect(sections).toContain("World Design & Exploration");
  });

  it("falls back to Detailed Assessment when no high-importance sections", () => {
    const sections = getExtendedSectionNames(
      makeAnswers({
        storyImportance: 2,
        gameplayImportance: 2,
        explorationImportance: 2,
        combatImportance: 2,
        puzzleImportance: 2,
        strategyImportance: 2,
        dealbreakers: [],
      }),
    );
    expect(sections).toContain("Detailed Assessment");
  });

  it("getExtendedSectionNames always includes base sections", () => {
    const sections = getExtendedSectionNames(makeAnswers());
    expect(sections).toContain("Library Signals");
    expect(sections).toContain("What the Game Is");
    expect(sections).toContain("Summary");
  });

  it("includes voice acting section for preferred", () => {
    const result = generateInstructions(
      makeAnswers({ voiceActingPreference: "preferred" }),
    );
    expect(result).toContain("voice");
  });

  it("includes all dealbreakers combined", () => {
    const result = generateInstructions(
      makeAnswers({
        dealbreakers: [
          "grind", "always_online", "bad_controls",
          "wayfinding", "gaas", "heavy_reading",
          "religious_themes", "shallow_crafting", "slow_start",
        ],
        customDealbreakers: ["pay-to-win"],
        voiceActingPreference: "essential",
      }),
    );
    expect(result).toContain("always-online");
    expect(result).toContain("wayfinding");
    expect(result).toContain("GAAS");
    expect(result).toContain("reading-heavy");
    expect(result).toContain("religious themes");
    expect(result).toContain("busywork crafting");
    expect(result).toContain("slow early hours");
    expect(result).toContain("pay-to-win");
  });
});

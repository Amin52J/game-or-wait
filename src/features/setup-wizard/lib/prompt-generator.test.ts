import { describe, it, expect } from "vitest";
import { generateInstructions, getExtendedSectionNames } from "./prompt-generator";
import type { SetupAnswers } from "../../../shared/types";

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
    const result = generateInstructions(makeAnswers({ dealbreakers: ["bad_controls"] }));
    expect(result).toContain("Movement clunk");
  });

  it("adds grind/pacing rules for grind dealbreaker", () => {
    const result = generateInstructions(makeAnswers({ dealbreakers: ["grind"] }));
    expect(result).toContain("Repetition");
  });

  it("adds voice acting rules for essential preference", () => {
    const result = generateInstructions(makeAnswers({ voiceActingPreference: "essential" }));
    expect(result).toContain("strongly dislikes");
  });

  it("skips dialogue rules for indifferent preference", () => {
    const result = generateInstructions(makeAnswers({ voiceActingPreference: "indifferent" }));
    expect(result).not.toContain("## Dialogue & Voice Acting");
  });

  it("includes wayfinding rules when selected", () => {
    const result = generateInstructions(makeAnswers({ dealbreakers: ["wayfinding"] }));
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
    const result = generateInstructions(makeAnswers({ dealbreakers: ["heavy_reading"] }));
    expect(result).toContain("reading-heavy");
  });

  it("includes gaas dealbreaker", () => {
    const result = generateInstructions(makeAnswers({ dealbreakers: ["gaas"] }));
    expect(result).toContain("GAAS");
  });

  it("includes religious_themes dealbreaker", () => {
    const result = generateInstructions(makeAnswers({ dealbreakers: ["religious_themes"] }));
    expect(result).toContain("religious themes");
  });

  it("includes shallow_crafting dealbreaker", () => {
    const result = generateInstructions(makeAnswers({ dealbreakers: ["shallow_crafting"] }));
    expect(result).toContain("busywork crafting");
  });

  it("includes slow_start dealbreaker", () => {
    const result = generateInstructions(makeAnswers({ dealbreakers: ["slow_start"] }));
    expect(result).toContain("slow early hours");
  });

  it("generates personalized sections for high combat importance", () => {
    const sections = getExtendedSectionNames(makeAnswers({ combatImportance: 5 }));
    expect(sections).toContain("Combat Feel & Feedback");
  });

  it("generates personalized sections for high puzzle importance", () => {
    const sections = getExtendedSectionNames(makeAnswers({ puzzleImportance: 5 }));
    expect(sections).toContain("Puzzle Design & Variety");
  });

  it("generates personalized sections for high strategy importance", () => {
    const sections = getExtendedSectionNames(makeAnswers({ strategyImportance: 5 }));
    expect(sections).toContain("Strategic Depth & Decision-Making");
  });

  it("generates personalized sections for high exploration importance", () => {
    const sections = getExtendedSectionNames(makeAnswers({ explorationImportance: 5 }));
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
    const result = generateInstructions(makeAnswers({ voiceActingPreference: "preferred" }));
    expect(result).toContain("voice");
  });

  it("includes all dealbreakers combined", () => {
    const result = generateInstructions(
      makeAnswers({
        dealbreakers: [
          "grind",
          "always_online",
          "bad_controls",
          "wayfinding",
          "gaas",
          "heavy_reading",
          "religious_themes",
          "shallow_crafting",
          "slow_start",
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

  describe("custom dealbreakers magnitude", () => {
    it("uses the −8 / −12 / −15 dealbreaker scale (not a fixed −10)", () => {
      const result = generateInstructions(makeAnswers({ customDealbreakers: ["pay-to-win"] }));
      expect(result).toContain("pay-to-win");
      expect(result).toContain("−8");
      expect(result).toContain("−12");
      expect(result).toContain("−15");
      expect(result).not.toMatch(/Custom dealbreaker:[^.]*→ −10\./);
    });
  });

  describe("play-style mismatch", () => {
    it("emits hard MP-only mismatch rule for singleplayer users", () => {
      const result = generateInstructions(makeAnswers({ playStyle: "singleplayer" }));
      expect(result).toContain("Play-style mismatch");
      expect(result).toContain("MP-only");
      expect(result).toContain("−15");
    });

    it("emits hard SP-only mismatch rule for multiplayer users", () => {
      const result = generateInstructions(makeAnswers({ playStyle: "multiplayer" }));
      expect(result).toContain("Play-style mismatch");
      expect(result).toContain("single-player-only");
      expect(result).toContain("−15");
    });

    it("does not emit a hard mismatch for 'both' users", () => {
      const result = generateInstructions(makeAnswers({ playStyle: "both" }));
      const playStyleSection = result.match(/## Play Style Rules\n\n([^]*?)(?=\n## )/)?.[1] ?? "";
      expect(playStyleSection).toContain("Play-style guidance");
      expect(playStyleSection).not.toContain("Play-style mismatch");
    });

    it("includes play-style triggers in High Red-Line list", () => {
      const sp = generateInstructions(makeAnswers({ playStyle: "singleplayer" }));
      expect(sp).toContain("game is MP-only / MP-primary (single-player user)");

      const mp = generateInstructions(makeAnswers({ playStyle: "multiplayer" }));
      expect(mp).toContain("game is single-player-only (multiplayer user)");
    });
  });

  describe("voice acting matrix", () => {
    it("essential: emits no-VA −15, no penalty when VA present", () => {
      const result = generateInstructions(makeAnswers({ voiceActingPreference: "essential" }));
      expect(result).toContain("## Dialogue & Voice Acting");
      expect(result).toContain("strongly dislikes");
      expect(result).toContain("−15");
      expect(result).toContain("no change");
    });

    it("preferred: emits +5 bonus for VA and −5 for no-VA", () => {
      const result = generateInstructions(makeAnswers({ voiceActingPreference: "preferred" }));
      expect(result).toContain("## Dialogue & Voice Acting");
      expect(result).toContain("+5");
      expect(result).toContain("−5");
    });

    it.each(["indifferent", "fine_with_text", "any"] as const)(
      "%s: emits no Dialogue & Voice Acting section",
      (pref) => {
        const result = generateInstructions(makeAnswers({ voiceActingPreference: pref }));
        expect(result).not.toContain("## Dialogue & Voice Acting");
      },
    );
  });

  describe("length fit", () => {
    it("does not emit Length Fit when idealLength is 'any'", () => {
      const result = generateInstructions(makeAnswers({ idealLength: "any" }));
      expect(result).not.toContain("## Length Fit");
    });

    it("medium preference: short and long both → −12", () => {
      const result = generateInstructions(makeAnswers({ idealLength: "medium" }));
      expect(result).toContain("## Length Fit");
      expect(result).toContain("medium-length");
      expect(result).toContain("undershoots");
      expect(result).toContain("overshoots");
      expect(result).toContain("−12");
    });

    it("short preference: medium → −8, long → −12", () => {
      const result = generateInstructions(makeAnswers({ idealLength: "short" }));
      expect(result).toContain("## Length Fit");
      expect(result).toMatch(/medium \(15–40h\)[^]*?−8/);
      expect(result).toMatch(/long \(40h\+\)[^]*?−12/);
    });

    it("long preference: medium → −8, short → −12", () => {
      const result = generateInstructions(makeAnswers({ idealLength: "long" }));
      expect(result).toContain("## Length Fit");
      expect(result).toMatch(/medium \(15–40h\)[^]*?−8/);
      expect(result).toMatch(/short \(≤ 15h\)[^]*?−12/);
    });

    it("triggers High Red-Line Risk override for any length penalty", () => {
      const result = generateInstructions(makeAnswers({ idealLength: "medium" }));
      expect(result).toContain("Length Fit penalty was applied");
      expect(result).toContain("campaign length strongly mismatches user's ideal length");
    });
  });

  describe("difficulty appetite", () => {
    it("does not emit Difficulty Appetite when difficultyPreference is 'any'", () => {
      const result = generateInstructions(makeAnswers({ difficultyPreference: "any" }));
      expect(result).not.toContain("## Difficulty Appetite");
    });

    it("challenging: easy +3, moderate +5, challenging +8, soulslike −8", () => {
      const result = generateInstructions(makeAnswers({ difficultyPreference: "challenging" }));
      expect(result).toContain("## Difficulty Appetite");
      expect(result).toMatch(/challenging difficulty[^]*?\+8/);
      expect(result).toMatch(/moderate difficulty[^]*?\+5/);
      expect(result).toMatch(/easy \/ accessible[^]*?\+3/);
      expect(result).toMatch(/soulslike[^]*?−8/);
    });

    it("moderate: easy +5, moderate +8, challenging −5, soulslike −8", () => {
      const result = generateInstructions(makeAnswers({ difficultyPreference: "moderate" }));
      expect(result).toContain("## Difficulty Appetite");
      expect(result).toMatch(/moderate difficulty[^]*?\+8/);
      expect(result).toMatch(/easy \/ accessible[^]*?\+5/);
      expect(result).toMatch(/challenging difficulty[^]*?−5/);
      expect(result).toMatch(/soulslike[^]*?−8/);
    });

    it("easy: easy +8, others negative", () => {
      const result = generateInstructions(makeAnswers({ difficultyPreference: "easy" }));
      expect(result).toMatch(/easy \/ accessible[^]*?\+8/);
      expect(result).toMatch(/moderate difficulty[^]*?−5/);
      expect(result).toMatch(/challenging difficulty[^]*?−8/);
      expect(result).toMatch(/soulslike[^]*?−8/);
    });

    it("soulslike: soulslike +8, challenging +5, moderate/easy −3", () => {
      const result = generateInstructions(makeAnswers({ difficultyPreference: "soulslike" }));
      expect(result).toMatch(/soulslike difficulty[^]*?\+8/);
      expect(result).toMatch(/challenging difficulty[^]*?\+5/);
      expect(result).toMatch(/moderate difficulty[^]*?−3/);
      expect(result).toMatch(/easy \/ accessible[^]*?−3/);
    });
  });

  describe("axis sensitivity", () => {
    it("emits no Axis Sensitivity section when all sliders are 1", () => {
      const result = generateInstructions(
        makeAnswers({
          storyImportance: 1,
          gameplayImportance: 1,
          explorationImportance: 1,
          combatImportance: 1,
          puzzleImportance: 1,
          strategyImportance: 1,
        }),
      );
      expect(result).not.toContain("## Axis Sensitivity");
    });

    it("scales magnitudes with slider values", () => {
      const result = generateInstructions(
        makeAnswers({
          storyImportance: 5,
          gameplayImportance: 4,
          explorationImportance: 3,
          combatImportance: 2,
          puzzleImportance: 1,
          strategyImportance: 1,
        }),
      );
      expect(result).toContain("## Axis Sensitivity");
      expect(result).toMatch(/Story & Narrative[^]*?-12[^]*?\+8/);
      expect(result).toMatch(/Gameplay & Mechanics[^]*?-8[^]*?\+5/);
      expect(result).toMatch(/Exploration & World Design[^]*?-5[^]*?\+3/);
      expect(result).toMatch(/Combat Feel[^]*?-3[^]*?no bonus/);
      expect(result).not.toContain("Puzzle Design (importance");
      expect(result).not.toContain("Strategic Depth (importance");
    });

    it("removes the legacy boolean +5 'Meaningful systems bonus' rule", () => {
      const result = generateInstructions(
        makeAnswers({ gameplayImportance: 4, explorationImportance: 4 }),
      );
      expect(result).not.toContain("Meaningful systems bonus");
    });

    it("caps Axis Sensitivity total contribution at ±12", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("capped at ±12");
    });
  });

  describe("score caps and floors", () => {
    it("caps totalB at +15 overall in the Scoring Procedure", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Cap totalB at +15");
    });

    it("includes hard caps tied to Red-Line Risk and totalP", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Red-Line Risk = High → R ≤ 69");
      expect(result).toContain("Red-Line Risk = Medium → R ≤ 79");
      expect(result).toMatch(/totalP ≥ 30 → R ≤ 59/);
      expect(result).toMatch(/totalP ≥ 20 → R ≤ 69/);
      expect(result).toMatch(/totalP ≥ 10 → R ≤ 79/);
      expect(result).toMatch(/totalP ≥ 5 → R ≤ 89/);
    });

    it("includes the consistency check between Red-Line Risk and Enjoyment Score", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Consistency check");
      expect(result).toContain("no scenario where Red-Line Risk is Medium and the score is 80+");
    });

    it("explicitly states bonuses cannot override hard caps", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Bonuses (totalB) cannot override these caps");
    });
  });

  describe("frictionLoad stacking escalation", () => {
    it("defines frictionLoad in the Red-Line Risk section", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("frictionLoad");
      expect(result).toContain("EXCLUDES RQD and GQP");
    });

    it("escalates Red-Line Risk to High when frictionLoad ≥ 25", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("frictionLoad ≥ 25");
      expect(result).toContain("stacked-penalty escalation");
    });

    it("places Medium at frictionLoad 12-24", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("frictionLoad is in the 12–24 range");
    });

    it("None requires frictionLoad < 12", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("frictionLoad < 12");
    });

    it("defines frictionLoad as a separate metric from totalP in Scoring Procedure", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("frictionLoad represents user-specific friction");
      expect(result).toContain("totalP** = RQD + GQP + frictionLoad");
    });

    it("requires citing the cumulative load when stacking escalates", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("briefly state the cumulative load");
    });
  });

  describe("refund guard triggers", () => {
    it("triggers refund guard on Enjoyment Score ≤ 59", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("The Enjoyment Score is ≤ 59");
      expect(result).toContain("weak match or heavy penalties");
    });

    it("does not use ≤ 69 as the score-based threshold", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).not.toContain("The Enjoyment Score is ≤ 69");
    });

    it("triggers refund guard when a tier-A near-twin anchor scored ≤ 75 in the library", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("tier-A near-twin anchor has a library score ≤ 75");
      expect(result).toContain("documented direct evidence of friction");
      expect(result).toContain("below their enjoyment line of 76");
    });

    it("restricts the ≤ 75 refund-guard threshold to tier-A library scores, not the final Enjoyment Score", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**Scope restriction**");
      expect(result).toContain(
        "The ≤ 75 threshold applies ONLY to tier-A near-twin library scores",
      );
      expect(result).toContain(
        "A final Enjoyment Score below 76 does NOT itself trigger this rule",
      );
      expect(result).toContain("The Enjoyment-Score-based trigger lives in condition 5 (≤ 59)");
    });

    it("no longer uses the legacy ≤ 65 tier-A refund-guard threshold", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).not.toContain("library score ≤ 65");
      expect(result).not.toContain("No tier-A near-twin anchor scored ≤ 65");
    });

    it("auto-recommends refund guard when a tier-A near-twin scored ≤ 60", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("tier-A near-twin anchor has a library score ≤ 60");
      expect(result).toContain("auto-triggered by the corresponding Near-twin cap");
    });

    it("clarifies that tier-B/C anchors do NOT trigger the near-twin refund rule", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Tier-B and tier-C anchors do NOT trigger this rule");
    });

    it("keeps the tier-A near-twin precondition in the Not-required list at the ≤ 75 threshold", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("No tier-A near-twin anchor scored ≤ 75");
    });

    it("no longer uses the legacy ≤ 50 anchor threshold", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).not.toContain("library score ≤ 50");
      expect(result).not.toContain("No anchor game scored ≤ 50");
    });

    it("does NOT include the Enjoyment Score as a Not-required precondition", () => {
      const result = generateInstructions(makeAnswers());
      const notRequiredSection =
        result.match(
          /refund guard is \*\*Not required\*\* ONLY if ALL of these are true:([^]*?)If ANY one/,
        )?.[1] ?? "";
      expect(notRequiredSection).not.toMatch(/Enjoyment Score ≥/);
    });

    it("explains that scores in the 60–69 range rely on other triggers", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("score in the 60–69 range is not automatically safe");
    });

    it("auto-triggers refund guard on High Red-Line Risk only (not Medium)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain('Red-Line Risk section above states "High" → Recommended');
      expect(result).not.toContain('Red-Line Risk section above states "High" or "Medium"');
    });

    it("explicitly notes that Medium does NOT auto-trigger", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Medium does NOT auto-trigger");
    });

    it("only High R-L Risk is mandatory for Recommended", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        'If you wrote "High" in the Red-Line Risk section above, you MUST mark the refund guard as Recommended',
      );
      expect(result).not.toContain(
        'If you wrote "Medium" or "High" in the Red-Line Risk section above, you MUST mark the refund guard as Recommended',
      );
    });
  });

  describe("axis prominence gate", () => {
    it("describes the prominence gate at section level", () => {
      const result = generateInstructions(makeAnswers({ storyImportance: 5 }));
      expect(result).toContain("Prominence gate (applies to NEGATIVE penalties only)");
      expect(result).toContain(
        "If the axis is **NOT prominent**, do NOT apply the negative penalty",
      );
    });

    it("explicitly says bonuses bypass the prominence gate", () => {
      const result = generateInstructions(makeAnswers({ storyImportance: 5 }));
      expect(result).toContain("Bonuses always apply (no prominence gate)");
    });

    it("includes per-axis prominence criteria for active axes", () => {
      const result = generateInstructions(
        makeAnswers({
          storyImportance: 5,
          gameplayImportance: 4,
          combatImportance: 4,
        }),
      );
      expect(result).toContain("Per-axis prominence criteria");
      expect(result).toContain("Story & Narrative**: Prominent in narrative-driven games");
      expect(result).toContain("Combat Feel**: Prominent when combat is a core pillar");
    });

    it("marks Gameplay & Mechanics as always prominent in the active list", () => {
      const result = generateInstructions(makeAnswers({ gameplayImportance: 4 }));
      expect(result).toMatch(
        /Gameplay & Mechanics[^\n]*always prominent — penalty applies in every game/,
      );
    });

    it("does not mark non-universal axes as always prominent", () => {
      const result = generateInstructions(
        makeAnswers({
          storyImportance: 5,
          gameplayImportance: 1,
        }),
      );
      expect(result).not.toMatch(/Story & Narrative[^\n]*always prominent/);
    });

    it("uses 2D action platformer as the worked example for skipping story penalty", () => {
      const result = generateInstructions(makeAnswers({ storyImportance: 5 }));
      expect(result).toContain(
        "weak story in a 2D action platformer that doesn't promise narrative is not a penalty",
      );
    });

    it("requires conservative default when prominence is unclear", () => {
      const result = generateInstructions(makeAnswers({ storyImportance: 5 }));
      expect(result).toContain(
        "When unclear whether an axis is prominent, default to NOT applying the penalty",
      );
    });

    it("requires AI to note when the prominence gate skips a penalty", () => {
      const result = generateInstructions(makeAnswers({ storyImportance: 5 }));
      expect(result).toContain(
        "When the prominence gate skips a penalty that would otherwise apply, briefly note this",
      );
    });

    it("excludes prominence section when no axes are active", () => {
      const result = generateInstructions(
        makeAnswers({
          storyImportance: 1,
          gameplayImportance: 1,
          explorationImportance: 1,
          combatImportance: 1,
          puzzleImportance: 1,
          strategyImportance: 1,
        }),
      );
      expect(result).not.toContain("Prominence gate");
    });

    it("only includes prominence criteria for active axes (not all six)", () => {
      const result = generateInstructions(
        makeAnswers({
          storyImportance: 5,
          gameplayImportance: 1,
          explorationImportance: 1,
          combatImportance: 1,
          puzzleImportance: 1,
          strategyImportance: 1,
        }),
      );
      expect(result).toContain("Story & Narrative**: Prominent in narrative-driven games");
      expect(result).not.toContain("Strategic Depth**: Prominent in strategy games");
      expect(result).not.toContain("Combat Feel**: Prominent when combat");
    });
  });

  describe("anchor tier classification", () => {
    it("defines tier A (near-twin), tier B (strong match), tier C (supporting)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Tier A — Near-twin");
      expect(result).toContain("Tier B — Strong match");
      expect(result).toContain("Tier C — Supporting");
    });

    it("tier-A requires same studio/franchise/direct-lineage AND same core gameplay loop", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "same core gameplay loop AND same genre AND same studio/franchise/direct-lineage",
      );
    });

    it("includes a discipline check against tier-A inflation from shared writing/story-driven traits", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Discipline check");
      expect(result).toContain('"they both have great writing"');
      expect(result).toContain("Different gameplay loop = never tier A");
    });

    it("explicitly drops the old '3–5 most similar by genre, mechanics, and tone' rule", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).not.toContain("3–5 most similar library titles by genre, mechanics, and tone");
    });

    it("anchors tier-A near-twin base score to the anchor's library score (not weighted average)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "If a tier-A near-twin exists, B starts at the tier-A anchor's library score",
      );
      expect(result).toContain("Tier-B and tier-C anchors may adjust B by at most +/-8 combined");
    });

    it("falls back to weighted average of tier-B and tier-C when no tier-A exists", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "If no tier-A anchor exists, B = weighted average of tier-B and tier-C anchor scores",
      );
    });
  });

  describe("near-twin caps", () => {
    it("caps R at near-twin score + 12 when tier-A near-twin scored ≤ 70 without escape", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Else Tier-A near-twin ≤ 70 AND Escape Clause did NOT fire → R ≤ (near-twin score + 12)",
      );
    });

    it("caps R at near-twin score + 8 when tier-A near-twin scored ≤ 60 without escape", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Tier-A near-twin ≤ 60 AND Escape Clause did NOT fire → R ≤ (near-twin score + 8)",
      );
    });

    it("relaxes the near-twin cap to +20 when the Escape Clause fires", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Tier-A near-twin ≤ 70 AND Escape Clause fired → R ≤ (near-twin score + 20)",
      );
    });

    it("clarifies that tier-B/C anchors never trigger near-twin caps", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Tier-B and tier-C anchors NEVER trigger near-twin caps regardless of their scores",
      );
    });

    it("states that the strong-overlap floor never overrides a near-twin cap", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Floors NEVER override a near-twin cap");
    });

    it("requires applying EXACTLY ONE near-twin cap (strictest matching)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Apply EXACTLY ONE near-twin cap");
      expect(result).toContain("the strictest one whose condition is met");
      expect(result).toContain("Do NOT apply both the ≤ 60 and the ≤ 70 caps together");
    });

    it("clamp step also instructs applying exactly one tier-A cap", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Tier-A near-twin caps (apply EXACTLY ONE — the strictest matching condition, never both)",
      );
    });
  });

  describe("escape clause (evidence-based, no inference)", () => {
    it("requires BOTH review evidence AND a direct user-signal mapping", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Escape Clause (evidence-only — never on inference)");
      expect(result).toContain("BOTH (i) and (ii) below are TRUE");
    });

    it("evidence must be Concrete, Comparative, and Broadly supported", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("*Concrete*");
      expect(result).toContain("*Comparative*");
      expect(result).toContain("*Broadly supported*");
    });

    it("makes reviewer vocabulary explicitly irrelevant (no phrase-matching)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("vocabulary used by reviewers");
      expect(result).toContain("is irrelevant");
    });

    it("requires the changed aspect to map to an EXPLICIT user signal", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Direct mapping to an EXPLICIT user signal");
      expect(result).toContain("axis rated 3+ importance");
    });

    it("defaults to keeping the cap when evidence or user signal is missing", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("If either is missing, the cap stands");
      expect(result).toContain(
        'NEVER relax on a single review, vague "better than before" language',
      );
    });

    it("forbids inferring why the user disliked a low-scored library game", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("No Inference About Dislike Reasons");
      expect(result).toContain("do NOT invent or assume *why* they disliked it");
    });

    it("distinguishes core-loop changes from additions-on-top in evidence (i)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("*Core-loop relevant, not additions-on-top*");
      expect(result).toContain("Adding NEW systems on top of an unchanged core loop");
      expect(result).toContain("is a WEAKER form of change");
      expect(result).toContain(
        'When in doubt between "core loop changed" and "additions on top", treat the evidence as ambiguous and the cap stands',
      );
    });

    it("restricts gameplayImportance alone from satisfying mapping (ii) for additions-style changes", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "gameplayImportance is too generic to satisfy (ii) on its own when the change is",
      );
      expect(result).toContain(
        "gameplayImportance ≥ 3 alone is NOT sufficient for additions-style changes",
      );
      expect(result).toContain(
        "gameplayImportance CAN satisfy (ii) when the change is to the core loop itself",
      );
    });
  });

  describe("output format — tier-A surfacing", () => {
    it("requires Positive Factors to call out tier-A near-twins explicitly", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("explicitly call it out as such");
      expect(result).toContain("tier-A near-twin: same studio");
    });

    it("requires the analysis to state whether the Escape Clause fired", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("MUST state whether the Escape Clause");
      expect(result).toContain("Do NOT relax the near-twin cap silently");
    });

    it("forbids the Score Summary from contradicting an Escape Clause that fired", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Consistency with the Escape Clause");
      expect(result).toContain(
        "if the Escape Clause fired (Positive Factors said so), the Score Summary MUST NOT undercut that decision",
      );
      expect(result).toContain('"has historically underdelivered"');
      expect(result).toContain('"is a real warning sign"');
    });

    it("allows citing near-twin friction in the summary when the Escape Clause did NOT fire", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "if the Escape Clause did NOT fire, the summary may freely cite the near-twin friction",
      );
    });
  });

  describe("output format — negative factors brevity", () => {
    it("instructs the model to only list penalties that were actually applied", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**Only list penalties that were actually applied.**");
    });

    it("forbids any non-applied penalty line including the prominence-gate skip note", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("If a penalty was NOT applied for ANY reason");
      expect(result).toContain("simply OMIT it entirely");
      expect(result).toContain('"— no penalty"');
      expect(result).toContain('"— skipped"');
      expect(result).toContain('"— no corpus match for X"');
      expect(result).toContain('"— no note-derived penalty applied"');
      expect(result).toContain(
        "There are NO exceptions, including the Combat Feel / prominence-gate skip note",
      );
    });

    it("forbids placing positive bonuses in Negative Factors", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Positive bonuses NEVER appear in this section regardless of which axis or rule produced them",
      );
      expect(result).toContain("route them to Positive Factors instead");
    });
  });

  describe("output format — positive factors owns all bonuses", () => {
    it("requires all positive adjustments to live exclusively in Positive Factors", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "**All positive adjustments belong here, never in Negative Factors.**",
      );
      expect(result).toContain(
        "Axis Sensitivity bonuses, Difficulty Appetite bonuses, Voice Acting bonuses, and any other applied positive bonus MUST be mentioned exclusively in this section",
      );
    });

    it("keeps the bonus in Positive Factors even if the same axis could have been a penalty", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "even if the same axis or preference was *evaluated* in a way that could have produced a penalty but instead produced a bonus",
      );
    });
  });

  describe("output format — no internal math leakage", () => {
    it("declares an explicit no-internal-math-leakage rule", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**No internal-math leakage**");
    });

    it("forbids the internal variable names from appearing in the output", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("`R`");
      expect(result).toContain("`B`");
      expect(result).toContain("`totalP`");
      expect(result).toContain("`totalB`");
      expect(result).toContain("`frictionLoad`");
      expect(result).toContain("`RQD`");
      expect(result).toContain("`GQP`");
    });

    it("forbids near-twin-cap arithmetic and phrasing in the output", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain('"near-twin cap"');
      expect(result).toContain('"near-twin score + 12"');
      expect(result).toContain('"near-twin score + 8"');
      expect(result).toContain('"near-twin score + 20"');
      expect(result).toContain("Any arithmetic in the form");
      expect(result).toContain("`X ≤ (Y + Z) = N`");
    });

    it("forbids step references and aggregate magnitude bookkeeping in the output", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Step references like");
      expect(result).toContain('"step 1c"');
      expect(result).toContain("Aggregate/internal magnitude bookkeeping");
      expect(result).toContain('"RQD = −5"');
      expect(result).toContain('"GQP = −3"');
    });
  });

  describe("output format — second-person tone", () => {
    it("requires second-person address throughout the response", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**Second person only**");
      expect(result).toContain('Address the reader directly as "you"');
    });

    it("forbids third-person references to the user in the output", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain('Do NOT use "the user", "the user\'s", "this user"');
      expect(result).toContain(
        'Internal reasoning may say "the user"; the final response must not.',
      );
    });

    it("declares the second-person voice directive up-front, before the section list", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**Voice (applies to EVERY section below)**");
      expect(result).toContain("The app is speaking *to* the reader, not *about* them.");
      const voiceIdx = result.indexOf("**Voice (applies to EVERY section below)**");
      const sectionsIdx = result.indexOf("1. **Public Sentiment**");
      expect(voiceIdx).toBeGreaterThan(-1);
      expect(sectionsIdx).toBeGreaterThan(-1);
      expect(voiceIdx).toBeLessThan(sectionsIdx);
    });

    it("explicitly applies the voice directive to every output section by name", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "every section — Public Sentiment, Positive Factors, Negative Factors, Red-Line Risk, Refund Guard, Enjoyment Score, and Score Summary",
      );
    });
  });

  describe("output format — section ordering and taste-alignment framing", () => {
    it("enforces Positive Factors appears before Negative Factors with no reordering allowed", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        'EXACTLY this order — no exceptions, no reordering, no moving "Positive Factors" below "Negative Factors"',
      );
      expect(result).toContain("This section MUST appear BEFORE Negative Factors.");
    });

    it("forbids listing a low-scored tier-A near-twin in Positive Factors", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "If a tier-A near-twin has a library score ≤ 75, it is a friction signal, not an alignment signal, and MUST appear ONLY in Negative Factors",
      );
      expect(result).toContain("**Tier-A near-twin exclusivity**");
      expect(result).toContain(
        "when a tier-A near-twin has a library score ≤ 75, it MUST be listed here AND MUST NOT also appear as a positive item in Positive Factors",
      );
    });

    it("frames Negative Factors as taste-alignment, not generic review complaints", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        'This is NOT a generic "negative reviews" or "complaints about the game" list — it is a **taste-alignment** list.',
      );
      expect(result).toContain(
        "A review complaint that does NOT map to any of your signals MUST be omitted, no matter how often reviewers mention it.",
      );
    });

    it("requires every Positive Factors bullet to cite a specific user signal", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Every bullet MUST link the game's trait to a specific user signal");
      expect(result).toContain(
        'Bullets that only describe the game ("the combat is praised", "the story is moving") without anchoring to a user signal are NOT allowed.',
      );
    });

    it("requires every Negative Factors bullet to cite a specific user signal", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Every bullet MUST link a friction trait of the game to a specific user signal",
      );
      expect(result).toContain("turns the trait into friction for *you specifically*");
    });
  });

  describe("output format — per-item point values on factors", () => {
    it("requires each Positive/Negative Factors bullet to end with the applied point value in parentheses", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "per-item point values in Positive Factors and Negative Factors are REQUIRED",
      );
      expect(result).toContain('"(−5)"');
      expect(result).toContain('"(+8)"');
    });

    it("restricts per-item point values to Positive/Negative Factors only", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "Do NOT add these per-item values in any other section (Public Sentiment, Red-Line Risk, Refund Guard, Score Summary, Enjoyment Score)",
      );
    });
  });

  describe("output format — brevity and per-section length caps", () => {
    it("declares an overall response length target", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**Be concise**");
      expect(result).toContain("~250–400 words total");
    });

    it("declares per-section length caps for every output section", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**Per-section length caps**");
      expect(result).toContain("Public Sentiment: ≤ 6 bullets, each ≤ 25 words.");
      expect(result).toContain("Positive Factors: ≤ 5 bullets total. Each bullet ≤ 35 words.");
      expect(result).toContain("Negative Factors: ≤ 5 bullets total. Each bullet ≤ 35 words.");
      expect(result).toContain("Red-Line Risk: exactly 1 sentence.");
      expect(result).toContain("Refund Guard: ≤ 2 sentences");
      expect(result).toContain("Score Summary: ≤ 2 sentences.");
    });

    it("forbids meta-explaining the internal framework in the output", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**No meta-explaining**");
      expect(result).toContain("do NOT explain anchor classification mechanics");
      expect(result).toContain("the Escape Clause framework");
      expect(result).toContain("the tier system");
    });
  });

  describe("library audit (anti-hallucination guard)", () => {
    it("includes a MANDATORY Library audit step before anchor classification", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("0a. Library audit (MANDATORY");
      expect(result).toContain("do this FIRST, before any anchor classification");
    });

    it("treats the library list as ground truth and requires scanning the entire list", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("library is the GROUND TRUTH");
      expect(result).toContain("Scan the entire list");
    });

    it("requires the model to quote each anchor's exact name and score from the library", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("quote its EXACT name and score from the library list");
      expect(result).toContain("you MUST NOT use that game as an anchor");
    });

    it("forbids hallucinating that a game is absent from the library", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        'It is FORBIDDEN to claim a game is "absent" or "unscored" from the library',
      );
      expect(result).toContain("the game IS in the library — re-scan");
    });

    it("flags same-studio/franchise titles and low-scored games as priority scan targets", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Same-studio / same-franchise / direct-predecessor titles");
      expect(result).toContain("user's lowest-scored games (≤ 70)");
    });
  });

  describe("penalty evidence ladder (citation-count gating)", () => {
    it("declares a Penalty Evidence Ladder in Core Principles", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("**Penalty Evidence Ladder**");
      expect(result).toContain("NEVER pick a magnitude by feel");
    });

    it("defines four citation-count tiers (Strong / Moderate / Weak / No evidence)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("*Strong evidence* (≥ 3 independent reviews");
      expect(result).toContain("*Moderate evidence* (exactly 2 independent reviews");
      expect(result).toContain("*Weak / single-source evidence* (exactly 1 review");
      expect(result).toContain("*No evidence*");
    });

    it("caps single-source evidence at the lowest magnitude of each scale", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("cap at the LOWEST magnitude of the rule's scale");
      expect(result).toContain(
        "For dealbreakers use −8; for notes use −3; for single-value rules use −5",
      );
      expect(result).toContain("NEVER apply the full magnitude on single-source evidence");
    });

    it("requires the model to count distinct reviews before applying a penalty", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "you MUST be able to point internally to a specific number of distinct reviews",
      );
    });

    it("clarifies that 'consistently report' shorthand still requires the citation count", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        'Phrasing like "reviews consistently report" / "broadly cited" elsewhere in this prompt is shorthand for *Strong evidence*',
      );
      expect(result).toContain('does NOT mean "fire the penalty regardless of citation count"');
    });

    it("scopes the ladder to negative penalties only (positive bonuses keep fixed values)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("This ladder applies to NEGATIVE penalties only");
      expect(result).toContain(
        "Positive bonuses (Axis Sensitivity positives, Difficulty Appetite positives, Voice Acting bonus, Length Fit pacing bonus) keep their fixed values",
      );
    });
  });

  describe("penalty rules — explicit ladder mapping", () => {
    it("rewrites Repetition & Pacing as a 4-tier ladder, capping single-source at −5", () => {
      const result = generateInstructions(makeAnswers({ dealbreakers: ["grind"] }));
      expect(result).toContain("## Repetition & Pacing");
      expect(result).toContain("Strong evidence (≥ 3 independent reviews");
      expect(result).toContain("Moderate evidence (exactly 2 independent reviews) → **−8**");
      expect(result).toContain("Weak / single-source evidence");
      expect(result).toContain('one critic calling an opening "insanely rough"');
      expect(result).toContain('NEVER apply −12 on a single reviewer\'s "rough opening" line');
    });

    it("rewrites Wayfinding Friction as a 4-tier ladder with single-source cap at −5", () => {
      const result = generateInstructions(makeAnswers({ dealbreakers: ["wayfinding"] }));
      expect(result).toContain("## Wayfinding Friction");
      expect(result).toContain("Strong evidence (≥ 3 reviews");
      expect(result).toContain("Moderate evidence (exactly 2 reviews) → **−7**");
      expect(result).toContain("Weak / single-source evidence (1 review) → **−5**");
      expect(result).toContain("NEVER apply −10 on a single reviewer's wayfinding complaint");
    });

    it("rewrites the bad_controls Movement clunk penalty to reference the ladder", () => {
      const result = generateInstructions(makeAnswers({ dealbreakers: ["bad_controls"] }));
      expect(result).toContain("**Movement clunk**");
      expect(result).toContain("Apply per the Penalty Evidence Ladder on the dealbreaker scale");
      expect(result).toContain("Weak / single-source → −8 (lowest tier)");
    });

    it("rewrites the shallow_crafting Jank penalty to reference the ladder", () => {
      const result = generateInstructions(makeAnswers({ dealbreakers: ["shallow_crafting"] }));
      expect(result).toContain("**Jank and shallow systems**");
      expect(result).toContain("Apply per the Penalty Evidence Ladder on the dealbreaker scale");
      expect(result).toContain("Weak / single-source → −8");
    });

    it("rewrites the religious_themes penalty to reference the ladder", () => {
      const result = generateInstructions(makeAnswers({ dealbreakers: ["religious_themes"] }));
      expect(result).toContain("**Heavy religious themes**");
      expect(result).toContain("Apply per the Penalty Evidence Ladder");
      expect(result).toContain("Weak / single-source → −5");
    });
  });

  describe("additional taste context — ladder binding", () => {
    it("binds note-derived magnitudes (−3/−5/−8) to citation-count tiers", () => {
      const result = generateInstructions(makeAnswers({ additionalNotes: "I dislike grind" }));
      expect(result).toContain("mapped through the **Penalty Evidence Ladder** in Core Principles");
      expect(result).toContain("−3 (Weak / single-source evidence");
      expect(result).toContain("−5 (Moderate evidence — exactly 2 independent reviews)");
      expect(result).toContain("−8 (Strong evidence — ≥3 reviews");
    });

    it("requires citing distinct review counts for note-derived penalties", () => {
      const result = generateInstructions(makeAnswers({ additionalNotes: "I dislike grind" }));
      expect(result).toContain(
        "quote the specific review snippet(s) that support it AND state the number of distinct reviews",
      );
    });

    it("explicitly forbids escalating note magnitudes on a single vivid review", () => {
      const result = generateInstructions(makeAnswers({ additionalNotes: "I dislike grind" }));
      expect(result).toContain(
        "Apply a higher magnitude (−5 or −8) on the strength of a single review",
      );
      expect(result).toContain("Single-source caps at −3");
    });
  });

  describe("anchor sanity check (post-clamp guard)", () => {
    it("requires an Anchor sanity check before the score is written", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Anchor sanity check (MANDATORY");
      expect(result).toContain("perform after step 13 and BEFORE writing the score");
    });

    it("invalidates the analysis if anchor scores cannot be restated from the audit", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("the analysis is INVALID");
      expect(result).toContain(
        "Return to step 0a, re-scan the library, and redo the anchor classification",
      );
    });

    it("instructs a same-studio/franchise re-scan when the target is a known sequel/sibling", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Same-studio / same-franchise / same-sub-genre check");
      expect(result).toContain("scan the library AGAIN specifically for that predecessor");
    });

    it("requires explicit justification when no tier-A anchor is selected for a well-known franchise/studio", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain("Tier-A absence justification");
      expect(result).toContain('re-scan rather than concluding "no tier-A exists"');
    });

    it("names the failure mode it is guarding against (silent near-twin drop)", () => {
      const result = generateInstructions(makeAnswers());
      expect(result).toContain(
        "silently dropping a near-twin anchor and thereby disabling the near-twin cap",
      );
    });
  });
});

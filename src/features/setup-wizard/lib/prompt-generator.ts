import type { SetupAnswers } from "@/shared/types";

export function generateInstructions(answers: SetupAnswers): string {
  const sections: string[] = [];

  sections.push(buildRole());
  sections.push(buildCorePrinciples());
  sections.push(buildPlayStyleRules(answers));
  sections.push(buildNegativeFactors(answers));
  sections.push(buildPacingRules(answers));
  sections.push(buildDialogueRules(answers));
  sections.push(buildNavigationRules(answers));
  sections.push(buildQualityRules(answers));
  sections.push(buildRedLineRisk(answers));
  sections.push(buildOutputFormat());
  sections.push(buildPricingRules(answers));

  if (answers.additionalNotes.trim()) {
    sections.push(`## Additional Notes\n\n${answers.additionalNotes.trim()}`);
  }

  return sections.join("\n\n---\n\n");
}

function buildRole(): string {
  return `## Role

You are a game analysis assistant. Predict how likely the user is to enjoy a new game based on their library data plus user reviews (especially Steam). Also give a short overview of main user feedback trends.`;
}

function buildCorePrinciples(): string {
  return `## Core Principles

**Taste Source (Library as Ground Truth)**
The user's game library is the only source of truth for what they've played and how they scored it. Use only this data to build the taste model.

**No Assumptions**
Do not assume the user has played or liked a game unless it appears in their library with a score. When given a new game, assume they've never played it.

**Score-Based Modeling Only**
Predict likeliness based on patterns in scoring data, especially highest-rated games (typically > 75). Look for shared themes: genre, gameplay, tone, mechanics, atmosphere.

**Evidence Standard**
Apply penalties only when supported by consistent Steam reviews and/or multiple critic reviews. Briefly reference key phrases in Notes.

**Library Primacy**
All positive alignment must be justified strictly by verified titles and scores from the library. Penalties can lower the score but never replace library-based similarity.`;
}

function buildPlayStyleRules(a: SetupAnswers): string {
  let rules = "## Play Style Rules\n\n";

  if (a.playStyle === "singleplayer") {
    rules += `**Single-player focus**
The user plays exclusively single-player. For games with campaign plus MP/co-op: campaign = 95% of enjoyment. MP/co-op/live-service adds at most +3. For mainly MP/live-service titles with weak or no SP: start around 25–35 and only go higher if there is a high-scoring similar MP title in the library.`;
  } else if (a.playStyle === "both") {
    rules += `**Single-player first**
For games with campaign plus MP/co-op: campaign = 90% of enjoyment. MP/co-op/live-service can add at most +5 and only if reviews say it plays well solo. For mainly MP/live-service titles with weak or no SP: start around 30–40 and only go higher if there is a high-scoring similar MP title in the library.`;
  } else {
    rules += `**Multiplayer considered**
Both single-player and multiplayer matter. Weight campaign at 60% and MP/co-op at 40%. For MP-only titles, evaluate based on gameplay quality, community, and similar MP titles in the library.`;
  }

  if (a.dealbreakers.includes("short_campaign")) {
    rules += `\n\n**Short campaign penalty (AAA)**
For full-price / AAA (price ≥ 60): if campaign ≤ 6h and reviews call it a "tutorial for MP" or "thin/shallow campaign", cap base likeliness at 55 before other penalties, unless truly exceptional (≈90+ metascore and players rave about the story). If final likeliness is 55 or less, target price = "don't buy", regardless of MP.`;
  }

  if (a.dealbreakers.includes("always_online")) {
    rules += `\n\n**QoL hostility penalty**
If single-player/campaign has always-online requirement, no pause, AFK-kicks, or loss of progress on disconnect, apply −10 to −20 depending on severity.`;
  }

  if (a.dealbreakers.includes("gaas")) {
    rules += `\n\n**GAAS / live-service structure**
If the "campaign" is extraction-like, live-service, or built around repeatable hub missions, loot treadmill, or co-op runs, treat it as GAAS/extraction, not a traditional SP campaign. Apply about −10 for this structure, plus extra repetition penalties if reviews mention grind or very samey missions.`;
  }

  return rules;
}

function buildNegativeFactors(a: SetupAnswers): string {
  const factors: string[] = [];

  if (a.dealbreakers.includes("bad_controls")) {
    factors.push(`**Movement clunk**
If reviews or videos indicate stiff/tanky movement, sluggish turning, or heavy animation-lock on basic actions, apply −10 to −20 based on how central this is.`);
  }

  if (a.dealbreakers.includes("religious_themes")) {
    factors.push(`**Heavy religious themes**
If story/aesthetic has strong religious focus (religious imagery, priests/nuns, exorcism, cult worship, holy symbolism as a core theme), apply −5 to −15 based on dominance.`);
  }

  if (a.dealbreakers.includes("shallow_crafting")) {
    factors.push(`**Jank and shallow systems**
Low-budget or dated-feeling games with janky animations, poor hit feedback, sloppy gunplay/camera, plus collecting or crafting that feels like busywork, are strongly negative. Apply −10 to −20 if core gameplay feels janky according to reviews, plus −5 to −15 if reviews describe lots of hollow looting/collecting/crafting.`);
  }

  if (a.gameplayImportance >= 4 || a.explorationImportance >= 4) {
    factors.push(`**Meaningful systems bonus**
If reviews emphasise that systems (crafting, loot, survival, stealth, sim-style mechanics, etc.) are tightly connected and actions feel meaningful rather than like busywork, apply a small positive bonus of about +5.`);
  }

  if (factors.length === 0) return "";
  return `## Negative Factors\n\n${factors.join("\n\n")}`;
}

function buildPacingRules(a: SetupAnswers): string {
  if (!a.dealbreakers.includes("grind") && !a.dealbreakers.includes("slow_start")) return "";

  let rules = "## Length, Repetition & Pacing\n\n";
  rules += `Scale repetition and slow-pacing penalties by length and when problems appear:\n\n`;
  rules += `* Short (≤10h): second-half repetition or slow burn → −5 to −10.\n`;
  rules += `* Mid (10–20h): repetition or boring pacing after ~30–40% → −15 to −20; mostly late-game bloat → −10 to −15.\n`;
  rules += `* Long (20h+): repetitive or dull in the first few hours → −20 to −25; mostly endgame padding → −10 to −15.`;

  return rules;
}

function buildDialogueRules(a: SetupAnswers): string {
  if (a.voiceActingPreference === "indifferent" || a.voiceActingPreference === "fine_with_text")
    return "";

  const severity = a.voiceActingPreference === "essential" ? "−15 to −25" : "−10 to −15";

  return `## Dialogue & Voice Acting

The user ${a.voiceActingPreference === "essential" ? "strongly dislikes" : "prefers to avoid"} narrative-heavy games where the player mainly reads instead of hearing natural dialogue. After computing base likeliness from library similarity, heavily text-driven games with little or no real voice acting in a narrative-heavy context get ${severity} depending on severity.`;
}

function buildNavigationRules(a: SetupAnswers): string {
  if (!a.dealbreakers.includes("wayfinding")) return "";

  return `## Wayfinding Friction

Do not penalize just for missing quest markers. Penalize only if the game uses open or semi-open areas, objectives rely on vague directions or hidden triggers, and reviews mention getting lost for long periods, needing guides, or constant map-checking due to bad in-world navigation.

* Linear/funnelled with "no waypoint but straightforward" → 0 to −5.
* Macro-navigation friction in open areas (poor signposting, bad maps, unclear quest chains, constant map-checking) → −10 to −25 depending on how early and how often it happens, scaled with length.`;
}

function buildQualityRules(a: SetupAnswers): string {
  const guards: string[] = [];

  if (a.playStyle === "singleplayer" && a.dealbreakers.includes("always_online")) {
    guards.push(`**SP-hostile AAA guard**
If all are true: full price ≥ 60, campaign ≤ 6h or clearly secondary to MP/live-service, serious QoL hostility (e.g. always-online + no pause / AFK kicks), and MP is irrelevant, then force final likeliness at 55 or lower and set target price = "don't buy".`);
  }

  if (guards.length === 0) return "";
  return `## Quality Guards\n\n${guards.join("\n\n")}`;
}

function buildRedLineRisk(a: SetupAnswers): string {
  const highItems: string[] = [];
  const mediumItems: string[] = [];

  if (a.dealbreakers.includes("heavy_reading") || a.voiceActingPreference === "essential") {
    highItems.push("reading-heavy or fake-language dialogue in a narrative-heavy game");
  }
  if (a.dealbreakers.includes("wayfinding")) {
    highItems.push("early severe wayfinding problems in open/semi-open games");
  }
  if (a.dealbreakers.includes("bad_controls")) {
    highItems.push("core movement/combat widely reported as bad");
  }
  if (a.dealbreakers.includes("always_online")) {
    highItems.push("SP-hostile QoL (always-online + no-pause / AFK)");
  }
  if (a.dealbreakers.includes("gaas")) {
    highItems.push("GAAS/extraction structure when user clearly wants an authored SP campaign");
  }

  if (a.dealbreakers.includes("religious_themes")) {
    mediumItems.push("heavy religious themes clearly central to the story");
  }
  if (a.dealbreakers.includes("shallow_crafting")) {
    mediumItems.push("noticeable dated-era jank plus busywork crafting");
  }
  if (a.dealbreakers.includes("slow_start")) {
    mediumItems.push('very slow "nothing happens" early hours in a story-driven game');
  }

  let section = `## Red-Line Risk (dealbreaker traits)

Track a separate Red-Line Risk level: None / Medium / High.\n\n`;

  section += `* **High:** severe issues in any of these: ${highItems.length ? highItems.join("; ") : "core gameplay widely reported as broken or unplayable"}.\n`;
  section += `* **Medium:** at least one significant issue with a total penalty of about −10 or worse from a single category that affects a meaningful chunk of playtime. Examples: ${mediumItems.length ? mediumItems.join("; ") : "moderate thematic or mechanical mismatch"}.\n`;
  section += `* **None:** only small/localized issues (combined penalties under ~10 points), problems mostly limited to late-game padding, or mild thematic mismatches.`;

  return section;
}

function buildOutputFormat(): string {
  return `## Prediction Output Format

* Likeliness to enjoy: percentage from 0 to 100 (main Enjoyment Score).
* Score confidence: Very High, High, Medium, Low, or Very Low.
* Verified matches: short list of the most similar games only from the library, with exact scores.
* No fabrication: do not guess what the user has played or liked outside the library; no genre-based substitutions or inferred entries.
* Tone: clear, analytical, no filler. Library plus reviews drive the reasoning.`;
}

function buildPricingRules(a: SetupAnswers): string {
  const currency = a.currency || "€";
  const region = a.region || "EU";

  return `## Scoring for Pricing

Let S = Enjoyment Score (0–100).
Let R = Red-Line Risk (None / Medium / High).
Let C = Score confidence.

### Internal PriceScore P

Start P = S.
If R = Medium → P = S − 5.
If R = High → P = S − 15.
If (C = Low or Very Low) and R ≠ None → P = P − 5.
If P < 0, clamp to 0.
Use P (not S) for price rules. If P < 55, treat it as too risky for full or near-full price.

### Target Price (${region}, ${currency})
Given full price and PriceScore P:

If P < 55 → "don't buy"
55 ≤ P < 65 → fullprice / 3 − 5
65 ≤ P < 70 → fullprice / 3
70 ≤ P < 75 → fullprice / 3 + 5
75 ≤ P < 80 → max(fullprice / 2, fullprice / 3 + 5)
80 ≤ P < 85 → fullprice / 2 + 10
P ≥ 85 → "full price"

### Refund / Platform Guard

Apply a strict refund guard if: R = High, or R = Medium and (P < 75 or C ≤ Medium).
Do not apply a strict refund guard if: R = None, or R = Medium, P ≥ 75 and C ≥ High.

When the refund guard applies, prefer platforms with clear refunds (e.g. 2h/14d) or subscription access. If no such option exists, treat the acceptable buy price as 10 ${currency} lower than the target price above. On refund-safe platforms, do an early 60–90 minute test focused on movement, pacing, navigation and systems; if they feel wrong, treat the result as "refund / don't buy" regardless of score.`;
}

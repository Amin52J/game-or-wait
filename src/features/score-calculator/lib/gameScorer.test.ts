import { describe, it, expect } from "vitest";
import { calculateGameScore, parseTimeInput, formatTime } from "./gameScorer";

describe("calculateGameScore", () => {
  it("returns 0 for 0 minutes unfinished", () => {
    const result = calculateGameScore(0, false);
    expect(result.calculatedScore).toBe(0);
    expect(result.effectiveTimeUsed).toBe(0);
    expect(result.isFinished).toBe(false);
  });

  it("scores linearly up to 30 effective minutes", () => {
    expect(calculateGameScore(15, false).calculatedScore).toBe(15);
    expect(calculateGameScore(30, false).calculatedScore).toBe(30);
  });

  it("doubles effective time for finished games", () => {
    const result = calculateGameScore(15, true);
    expect(result.effectiveTimeUsed).toBe(30);
    expect(result.calculatedScore).toBe(30);
  });

  it("scores 30-40 in the 30-60 effective minute range", () => {
    const at45 = calculateGameScore(45, false);
    expect(at45.calculatedScore).toBe(35);

    const at60 = calculateGameScore(60, false);
    expect(at60.calculatedScore).toBe(40);
  });

  it("scores 40-50 in the 60-120 effective minute range", () => {
    const at90 = calculateGameScore(90, false);
    expect(at90.calculatedScore).toBe(45);

    const at120 = calculateGameScore(120, false);
    expect(at120.calculatedScore).toBe(50);
  });

  it("scores 50-60 in the 120-300 effective minute range", () => {
    const at210 = calculateGameScore(210, false);
    expect(at210.calculatedScore).toBe(55);

    const at300 = calculateGameScore(300, false);
    expect(at300.calculatedScore).toBe(60);
  });

  it("scores 60-70 in the 300-600 effective minute range", () => {
    const at450 = calculateGameScore(450, false);
    expect(at450.calculatedScore).toBe(65);

    const at600 = calculateGameScore(600, false);
    expect(at600.calculatedScore).toBe(70);
  });

  it("caps unfinished games at 74", () => {
    const result = calculateGameScore(2000, false);
    expect(result.calculatedScore).toBeLessThanOrEqual(74);
  });

  it("allows finished games to reach 75", () => {
    const result = calculateGameScore(2000, true);
    expect(result.calculatedScore).toBe(75);
  });

  it("caps finished games at 75", () => {
    const result = calculateGameScore(10000, true);
    expect(result.calculatedScore).toBe(75);
  });

  it("returns rounded scores", () => {
    const result = calculateGameScore(37, false);
    expect(result.calculatedScore).toBe(Math.round(result.calculatedScore));
  });

  it("produces monotonically increasing scores for increasing time", () => {
    let prevScore = -1;
    for (let t = 0; t <= 1000; t += 10) {
      const score = calculateGameScore(t, false).calculatedScore;
      expect(score).toBeGreaterThanOrEqual(prevScore);
      prevScore = score;
    }
  });
});

describe("parseTimeInput", () => {
  it("returns null for empty string", () => {
    expect(parseTimeInput("")).toBeNull();
    expect(parseTimeInput("  ")).toBeNull();
  });

  it("parses h:mm format", () => {
    expect(parseTimeInput("1:30")).toBe(90);
    expect(parseTimeInput("2:00")).toBe(120);
    expect(parseTimeInput("0:45")).toBe(45);
  });

  it("parses :mm format (no hours)", () => {
    expect(parseTimeInput(":30")).toBe(30);
    expect(parseTimeInput(":45")).toBe(45);
  });

  it("parses h: format (no minutes)", () => {
    expect(parseTimeInput("2:")).toBe(120);
  });

  it("parses plain hours", () => {
    expect(parseTimeInput("2")).toBe(120);
    expect(parseTimeInput("10")).toBe(600);
  });

  it("rejects decimal input", () => {
    expect(parseTimeInput("1.5")).toBeNull();
  });

  it("rejects negative values", () => {
    expect(parseTimeInput("-1:30")).toBeNull();
    expect(parseTimeInput("-1")).toBeNull();
  });

  it("rejects minutes >= 60", () => {
    expect(parseTimeInput("1:60")).toBeNull();
    expect(parseTimeInput("1:99")).toBeNull();
  });

  it("rejects multiple colons", () => {
    expect(parseTimeInput("1:2:3")).toBeNull();
  });

  it("handles whitespace around input", () => {
    expect(parseTimeInput("  1:30  ")).toBe(90);
    expect(parseTimeInput("  2  ")).toBe(120);
  });
});

describe("formatTime", () => {
  it("formats minutes only", () => {
    expect(formatTime(30)).toBe("30 minutes");
    expect(formatTime(1)).toBe("1 minute");
  });

  it("formats hours only", () => {
    expect(formatTime(60)).toBe("1 hour");
    expect(formatTime(120)).toBe("2 hours");
  });

  it("formats hours and minutes", () => {
    expect(formatTime(90)).toBe("1 hour and 30 minutes");
    expect(formatTime(150)).toBe("2 hours and 30 minutes");
    expect(formatTime(61)).toBe("1 hour and 1 minute");
  });

  it("formats 0 minutes", () => {
    expect(formatTime(0)).toBe("0 minutes");
  });
});

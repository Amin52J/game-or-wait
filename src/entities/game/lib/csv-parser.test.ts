import { describe, it, expect } from "vitest";
import { parseCSV, parseJSON, parsePlainText, parseAnyFormat, gamesToCSV } from "./csv-parser";

describe("csv-parser", () => {
  describe("parseCSV", () => {
    it("parses standard CSV with Name, Sorting Name, User Score", () => {
      const csv = `Name,Sorting Name,User Score
Batman: Arkham Knight,,96
Cyberpunk 2077,,96
Cities: Skylines,,100`;
      const games = parseCSV(csv);
      expect(games).toHaveLength(3);
      expect(games[0].name).toBe("Batman: Arkham Knight");
      expect(games[0].score).toBe(96);
      expect(games[2].name).toBe("Cities: Skylines");
      expect(games[2].score).toBe(100);
    });

    it("handles empty scores", () => {
      const csv = `Name,Sorting Name,User Score
Test Game,,
Another Game,,75`;
      const games = parseCSV(csv);
      expect(games).toHaveLength(2);
      expect(games[0].score).toBeNull();
      expect(games[1].score).toBe(75);
    });

    it("deduplicates by name keeping highest score", () => {
      const csv = `Name,Sorting Name,User Score
Game A,,80
Game A,,90
Game A,,`;
      const games = parseCSV(csv);
      expect(games).toHaveLength(1);
      expect(games[0].score).toBe(90);
    });

    it("handles quoted names with commas", () => {
      const csv = `Name,Sorting Name,User Score
"Crash Bandicoot 4: It's About Time",,52`;
      const games = parseCSV(csv);
      expect(games).toHaveLength(1);
      expect(games[0].name).toBe("Crash Bandicoot 4: It's About Time");
      expect(games[0].score).toBe(52);
    });

    it("returns empty array for empty input", () => {
      expect(parseCSV("")).toEqual([]);
    });

    it("handles alternative column names", () => {
      const csv = `game,rating
Test Game,85`;
      const games = parseCSV(csv);
      expect(games).toHaveLength(1);
    });
  });

  describe("parseJSON", () => {
    it("parses array of game objects", () => {
      const json = JSON.stringify([
        { name: "Game A", score: 90 },
        { name: "Game B", score: 70 },
      ]);
      const games = parseJSON(json);
      expect(games).toHaveLength(2);
      expect(games[0].name).toBe("Game A");
      expect(games[0].score).toBe(90);
    });

    it("parses wrapped format with games key", () => {
      const json = JSON.stringify({
        games: [{ name: "Game A", score: 90 }],
      });
      const games = parseJSON(json);
      expect(games).toHaveLength(1);
    });

    it("handles rating field as score", () => {
      const json = JSON.stringify([{ name: "Game A", rating: 85 }]);
      const games = parseJSON(json);
      expect(games[0].score).toBe(85);
    });

    it("handles missing scores", () => {
      const json = JSON.stringify([{ name: "Game A" }]);
      const games = parseJSON(json);
      expect(games[0].score).toBeNull();
    });
  });

  describe("parsePlainText", () => {
    it("parses lines with name and score", () => {
      const text = `Game A - 90
Game B - 75
Game C`;
      const games = parsePlainText(text);
      expect(games).toHaveLength(3);
      expect(games[0].name).toBe("Game A");
      expect(games[0].score).toBe(90);
      expect(games[2].name).toBe("Game C");
      expect(games[2].score).toBeNull();
    });

    it("skips empty lines", () => {
      const text = `Game A - 90

Game B - 75`;
      const games = parsePlainText(text);
      expect(games).toHaveLength(2);
    });
  });

  describe("parseAnyFormat", () => {
    it("auto-detects JSON", () => {
      const json = JSON.stringify([{ name: "Game A", score: 90 }]);
      const games = parseAnyFormat(json);
      expect(games).toHaveLength(1);
      expect(games[0].name).toBe("Game A");
    });

    it("auto-detects CSV", () => {
      const csv = `Name,User Score
Game A,90`;
      const games = parseAnyFormat(csv);
      expect(games).toHaveLength(1);
      expect(games[0].score).toBe(90);
    });

    it("falls back to plain text", () => {
      const text = "Game A\nGame B";
      const games = parseAnyFormat(text);
      expect(games).toHaveLength(2);
    });
  });

  describe("gamesToCSV", () => {
    it("converts games to CSV format", () => {
      const games = [
        { id: "1", name: "Game A", score: 90 },
        { id: "2", name: "Game B", sortingName: "B Game", score: null },
      ];
      const csv = gamesToCSV(games);
      expect(csv).toContain("Name");
      expect(csv).toContain("Game A");
      expect(csv).toContain("90");
      expect(csv).toContain("Game B");
      expect(csv).toContain("B Game");
    });
  });
});

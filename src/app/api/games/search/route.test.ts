import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

describe("/api/games/search POST", () => {
  const originalKey = process.env.RAWG_API_KEY;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env.RAWG_API_KEY = originalKey;
  });

  it("returns empty games when RAWG_API_KEY is unset", async () => {
    delete process.env.RAWG_API_KEY;
    const res = await POST(
      new Request("http://localhost/api/games/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "hal" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.games).toEqual([]);
    expect(body.unavailable).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns empty when query shorter than 3 characters", async () => {
    process.env.RAWG_API_KEY = "test-key";
    const res = await POST(
      new Request("http://localhost/api/games/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "ha" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ games: [] });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("proxies RAWG and maps names and images", async () => {
    process.env.RAWG_API_KEY = "test-key";
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { name: " Half-Life ", background_image: "https://media.rawg.io/a.jpg" },
          { name: "Half-Life 2", background_image: null },
        ],
      }),
    } as Response);

    const res = await POST(
      new Request("http://localhost/api/games/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "hal" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      games: [
        { name: "Half-Life", image: "https://media.rawg.io/a.jpg" },
        { name: "Half-Life 2", image: null },
      ],
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain("api.rawg.io/api/games");
    expect(calledUrl).toContain("search=hal");
    expect(calledUrl).toContain("key=test-key");
  });

  it("dedupes by case-insensitive name", async () => {
    process.env.RAWG_API_KEY = "k";
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          { name: "Portal", background_image: "https://x/1.jpg" },
          { name: "portal", background_image: "https://x/2.jpg" },
          { name: "Portal 2", background_image: null },
        ],
      }),
    } as Response);

    const res = await POST(
      new Request("http://localhost/api/games/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "por" }),
      }),
    );
    const body = await res.json();
    expect(body.games).toEqual([
      { name: "Portal", image: "https://x/1.jpg" },
      { name: "Portal 2", image: null },
    ]);
  });
});

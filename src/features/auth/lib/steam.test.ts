import { describe, it, expect } from "vitest";
import {
  buildSteamOpenIdUrl,
  parseSteamCallbackParams,
  extractSteamIdFromParams,
} from "./steam";

describe("buildSteamOpenIdUrl", () => {
  it("returns a URL starting with steamcommunity.com", () => {
    const url = buildSteamOpenIdUrl("https://example.com/callback");
    expect(url).toContain("steamcommunity.com/openid/login");
  });

  it("includes the return_to parameter", () => {
    const returnTo = "https://example.com/steam-callback.html";
    const url = buildSteamOpenIdUrl(returnTo);
    expect(url).toContain(encodeURIComponent(returnTo));
  });

  it("includes the realm derived from return_to origin", () => {
    const url = buildSteamOpenIdUrl("https://myapp.com/callback");
    expect(url).toContain(encodeURIComponent("https://myapp.com"));
  });

  it("includes required OpenID parameters", () => {
    const url = buildSteamOpenIdUrl("https://example.com/cb");
    expect(url).toContain("openid.ns=");
    expect(url).toContain("openid.mode=checkid_setup");
    expect(url).toContain("openid.identity=");
    expect(url).toContain("openid.claimed_id=");
  });
});

describe("parseSteamCallbackParams", () => {
  it("extracts openid.* params from URL", () => {
    const url =
      "https://example.com/callback?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.mode=id_res&openid.claimed_id=https%3A%2F%2Fsteamcommunity.com%2Fopenid%2Fid%2F76561198012345678&other_param=ignored";
    const params = parseSteamCallbackParams(url);
    expect(params["openid.ns"]).toBe("http://specs.openid.net/auth/2.0");
    expect(params["openid.mode"]).toBe("id_res");
    expect(params["openid.claimed_id"]).toContain("76561198012345678");
    expect(params["other_param"]).toBeUndefined();
  });

  it("returns empty object when no openid params exist", () => {
    const url = "https://example.com/callback?foo=bar";
    const params = parseSteamCallbackParams(url);
    expect(Object.keys(params)).toHaveLength(0);
  });

  it("handles URL with no query params", () => {
    const url = "https://example.com/callback";
    const params = parseSteamCallbackParams(url);
    expect(Object.keys(params)).toHaveLength(0);
  });
});

describe("extractSteamIdFromParams", () => {
  it("extracts Steam ID from claimed_id", () => {
    const params = {
      "openid.claimed_id":
        "https://steamcommunity.com/openid/id/76561198012345678",
    };
    expect(extractSteamIdFromParams(params)).toBe("76561198012345678");
  });

  it("returns null when claimed_id is missing", () => {
    expect(extractSteamIdFromParams({})).toBeNull();
  });

  it("returns null for malformed claimed_id", () => {
    expect(
      extractSteamIdFromParams({ "openid.claimed_id": "not-a-valid-url" }),
    ).toBeNull();

    expect(
      extractSteamIdFromParams({
        "openid.claimed_id": "https://steamcommunity.com/openid/id/",
      }),
    ).toBeNull();
  });

  it("returns null for non-numeric Steam ID", () => {
    expect(
      extractSteamIdFromParams({
        "openid.claimed_id":
          "https://steamcommunity.com/openid/id/abc123",
      }),
    ).toBeNull();
  });

  it("handles different Steam ID lengths", () => {
    const shortId = extractSteamIdFromParams({
      "openid.claimed_id": "https://steamcommunity.com/openid/id/12345",
    });
    expect(shortId).toBe("12345");

    const longId = extractSteamIdFromParams({
      "openid.claimed_id":
        "https://steamcommunity.com/openid/id/76561199999999999",
    });
    expect(longId).toBe("76561199999999999");
  });
});

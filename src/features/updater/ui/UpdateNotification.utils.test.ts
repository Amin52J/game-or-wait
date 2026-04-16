import { describe, it, expect, afterEach } from "vitest";
import {
  compareVersions,
  isTauri,
  REPO,
  RELEASES_URL,
  API_URL,
  DISMISS_KEY,
} from "./UpdateNotification.utils";

describe("compareVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
    expect(compareVersions("v1.2.3", "1.2.3")).toBe(0);
  });

  it("returns positive when a > b", () => {
    expect(compareVersions("2.0.0", "1.0.0")).toBeGreaterThan(0);
    expect(compareVersions("1.1.0", "1.0.0")).toBeGreaterThan(0);
    expect(compareVersions("1.0.1", "1.0.0")).toBeGreaterThan(0);
  });

  it("returns negative when a < b", () => {
    expect(compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
    expect(compareVersions("1.0.0", "1.1.0")).toBeLessThan(0);
    expect(compareVersions("1.0.0", "1.0.1")).toBeLessThan(0);
  });

  it("strips v prefix", () => {
    expect(compareVersions("v1.2.3", "v1.2.3")).toBe(0);
    expect(compareVersions("v2.0.0", "v1.0.0")).toBeGreaterThan(0);
  });

  it("handles versions with different segment counts", () => {
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
    expect(compareVersions("1.0.1", "1.0")).toBeGreaterThan(0);
  });

  it("handles multi-digit version numbers", () => {
    expect(compareVersions("1.11.6", "1.9.0")).toBeGreaterThan(0);
    expect(compareVersions("1.11.6", "1.11.7")).toBeLessThan(0);
  });
});

describe("constants", () => {
  it("REPO is correctly formatted", () => {
    expect(REPO).toMatch(/^\w+\/[\w-]+$/);
  });

  it("RELEASES_URL contains github", () => {
    expect(RELEASES_URL).toContain("github.com");
    expect(RELEASES_URL).toContain(REPO);
  });

  it("API_URL points to GitHub API", () => {
    expect(API_URL).toContain("api.github.com");
    expect(API_URL).toContain(REPO);
  });

  it("DISMISS_KEY is a non-empty string", () => {
    expect(DISMISS_KEY.length).toBeGreaterThan(0);
  });
});

describe("isTauri", () => {
  afterEach(() => {
    delete (window as any).__TAURI__;
  });

  it("returns false when __TAURI__ is not on window", () => {
    expect(isTauri()).toBe(false);
  });

  it("returns true when __TAURI__ is on window", () => {
    Object.defineProperty(window, "__TAURI__", { value: {}, configurable: true });
    expect(isTauri()).toBe(true);
  });
});

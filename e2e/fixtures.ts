import { test as base, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

function extractRefFromUrl(url: string): string | null {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

function extractRefFromFile(filename: string): string | null {
  const filePath = path.resolve(__dirname, "..", filename);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(
    /NEXT_PUBLIC_SUPABASE_URL=https:\/\/([^.]+)\.supabase\.co/,
  );
  return match ? match[1] : null;
}

function readProjectRef(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? extractRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    : null;
  if (fromEnv) return fromEnv;

  const fromDotEnv = extractRefFromFile(".env");
  if (fromDotEnv) return fromDotEnv;

  const fromProd = extractRefFromFile(".env.production");
  if (fromProd) return fromProd;

  throw new Error(
    "Cannot resolve Supabase project ref. Set NEXT_PUBLIC_SUPABASE_URL or provide .env / .env.production",
  );
}

const PROJECT_REF = readProjectRef();
const SUPABASE_GLOB = `**/${PROJECT_REF}.supabase.co`;
const AUTH_STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

const FAKE_USER = {
  id: "e2e-user-id-0001",
  aud: "authenticated",
  role: "authenticated",
  email: "e2e@gameorwait.test",
  email_confirmed_at: "2025-01-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  user_metadata: { full_name: "E2E Tester", has_password: true },
  app_metadata: { provider: "email" },
};

const FAKE_SESSION = {
  access_token: "e2e-fake-access-token",
  refresh_token: "e2e-fake-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: FAKE_USER,
};

const GAMES = [
  { id: "g1", name: "Elden Ring", sorting_name: null, score: 95, user_id: FAKE_USER.id },
  { id: "g2", name: "Hollow Knight", sorting_name: null, score: 90, user_id: FAKE_USER.id },
  { id: "g3", name: "Hades", sorting_name: null, score: 88, user_id: FAKE_USER.id },
  { id: "g4", name: "Celeste", sorting_name: null, score: 85, user_id: FAKE_USER.id },
  { id: "g5", name: "Stardew Valley", sorting_name: null, score: 82, user_id: FAKE_USER.id },
  { id: "g6", name: "Dead Cells", sorting_name: null, score: 78, user_id: FAKE_USER.id },
  { id: "g7", name: "Slay the Spire", sorting_name: null, score: 75, user_id: FAKE_USER.id },
  { id: "g8", name: "Terraria", sorting_name: null, score: 70, user_id: FAKE_USER.id },
  { id: "g9", name: "Valheim", sorting_name: null, score: 65, user_id: FAKE_USER.id },
  { id: "g10", name: "No Man's Sky", sorting_name: null, score: 55, user_id: FAKE_USER.id },
];

const ANALYSIS_HISTORY = [
  {
    id: "a1",
    user_id: FAKE_USER.id,
    game_name: "Balatro",
    price: 15,
    response:
      "## Enjoyment Score\n**92/100** | Confidence: High\n\n## Score Summary\nExcellent match given your taste profile.",
    timestamp: Date.now() - 86400000,
  },
];

const USER_SETTINGS = {
  id: FAKE_USER.id,
  ai_provider: {
    type: "anthropic",
    apiKey: "sk-ant-e2e-test-key",
    model: "claude-sonnet-4-6",
  },
  instructions: "You are a game analysis assistant.",
  is_setup_complete: true,
  setup_answers: {
    playStyle: "singleplayer",
    storyImportance: 4,
    gameplayImportance: 4,
    explorationImportance: 3,
    combatImportance: 3,
    puzzleImportance: 2,
    strategyImportance: 2,
    dealbreakers: ["grind", "always_online"],
    customDealbreakers: [],
    voiceActingPreference: "preferred",
    difficultyPreference: "moderate",
    idealLength: "medium",
    currency: "USD",
    region: "US",
    additionalNotes: "",
  },
};

const SETUP_INCOMPLETE_SETTINGS = {
  ...USER_SETTINGS,
  is_setup_complete: false,
  ai_provider: null,
  instructions: "",
  setup_answers: null,
};

async function interceptSupabase(page: Page, settings = USER_SETTINGS) {
  await page.route(`${SUPABASE_GLOB}/auth/v1/token**`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_SESSION),
    });
  });

  await page.route(`${SUPABASE_GLOB}/auth/v1/user`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_USER),
    });
  });

  await page.route(`${SUPABASE_GLOB}/auth/v1/logout`, async (route) => {
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.route(`${SUPABASE_GLOB}/rest/v1/user_settings**`, async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settings),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.route(`${SUPABASE_GLOB}/rest/v1/games**`, async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settings === USER_SETTINGS ? GAMES : []),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.route(`${SUPABASE_GLOB}/rest/v1/analysis_history**`, async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(settings === USER_SETTINGS ? ANALYSIS_HISTORY : []),
      });
    }
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.route(`${SUPABASE_GLOB}/functions/v1/**`, async (route) => {
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

async function interceptSupabaseUnauthenticated(page: Page) {
  await page.route(`${SUPABASE_GLOB}/auth/v1/token**`, async (route) => {
    return route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        error: "invalid_grant",
        error_description: "Invalid Refresh Token",
      }),
    });
  });

  await page.route(`${SUPABASE_GLOB}/auth/v1/user`, async (route) => {
    return route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Invalid token" }),
    });
  });

  await page.route(`${SUPABASE_GLOB}/auth/v1/signup`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_SESSION),
    });
  });

  await page.route(`${SUPABASE_GLOB}/auth/v1/recover`, async (route) => {
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

async function injectAuthState(page: Page) {
  await page.addInitScript(
    ({ key, session }) => {
      localStorage.setItem(key, JSON.stringify(session));
    },
    { key: AUTH_STORAGE_KEY, session: FAKE_SESSION },
  );
}

export const test = base.extend<{
  authenticatedPage: Page;
  unauthenticatedPage: Page;
  freshSetupPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    await interceptSupabase(page, USER_SETTINGS);
    await injectAuthState(page);
    await use(page);
  },

  unauthenticatedPage: async ({ page }, use) => {
    await interceptSupabaseUnauthenticated(page);
    await use(page);
  },

  freshSetupPage: async ({ page }, use) => {
    await interceptSupabase(page, SETUP_INCOMPLETE_SETTINGS);
    await injectAuthState(page);
    await use(page);
  },
});

export { expect } from "@playwright/test";
export { FAKE_USER, FAKE_SESSION, USER_SETTINGS, GAMES, ANALYSIS_HISTORY, SUPABASE_GLOB, AUTH_STORAGE_KEY };

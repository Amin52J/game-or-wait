import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AIClient, testConnection } from "./client";
import type { AIProviderConfig, Game } from "@/shared/types";

const anthropicConfig: AIProviderConfig = {
  type: "anthropic",
  apiKey: "sk-test-key",
  model: "claude-sonnet-4-6",
};

const openaiConfig: AIProviderConfig = {
  type: "openai",
  apiKey: "sk-openai-test",
  model: "gpt-5.4",
};

const googleConfig: AIProviderConfig = {
  type: "google",
  apiKey: "google-test-key",
  model: "gemini-3.1-pro",
};

const customConfig: AIProviderConfig = {
  type: "custom",
  apiKey: "custom-key",
  model: "my-model",
  baseUrl: "https://custom-api.example.com/v1/completions",
};

const sampleGames: Game[] = [
  { id: "1", name: "Elden Ring", score: 95 },
  { id: "2", name: "Hollow Knight", score: 90 },
];

function mockFetchResponse(body: unknown, status = 200) {
  return vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
    body: null,
  });
}

function mockFetchSSE(events: string[], status = 200) {
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(new TextEncoder().encode(event + "\n"));
      }
      controller.close();
    },
  });

  return vi.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    text: async () => "streaming response",
    json: async () => ({}),
    body: stream,
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AIClient", () => {
  describe("Anthropic provider", () => {
    it("sends correct headers and body for non-streaming request", async () => {
      const mockResponse = {
        content: [{ type: "text", text: "Analysis result" }],
      };
      const fetchMock = mockFetchResponse(mockResponse);
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(anthropicConfig);
      const result = await client.analyze("Elden Ring", 60, "system prompt", sampleGames, "€");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.anthropic.com/v1/messages");
      expect(options.headers["x-api-key"]).toBe("sk-test-key");
      expect(options.headers["anthropic-version"]).toBe("2023-06-01");
      expect(result).toBe("Analysis result");
    });

    it("includes web_search tool in body", async () => {
      const fetchMock = mockFetchResponse({
        content: [{ type: "text", text: "OK" }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(anthropicConfig);
      await client.analyze("Test", 0, "system", [], "€");

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.tools).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "web_search_20250305" })]),
      );
    });

    it("handles streaming response", async () => {
      const events = [
        'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello "}}',
        'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"World"}}',
        "data: [DONE]",
      ];
      const fetchMock = mockFetchSSE(events);
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(anthropicConfig);
      const chunks: string[] = [];
      const result = await client.analyze(
        "Test", 0, "system", [], "€",
        (chunk) => chunks.push(chunk),
      );

      expect(result).toBe("Hello World");
      expect(chunks).toEqual(["Hello ", "World"]);
    });

    it("throws on API error (non-retryable)", async () => {
      const fetchMock = mockFetchResponse({ error: "Invalid API key" }, 401);
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(anthropicConfig);
      await expect(
        client.analyze("Test", 0, "system", [], "€"),
      ).rejects.toThrow("Anthropic API error (401)");
    });
  });

  describe("OpenAI provider", () => {
    it("sends correct headers and body", async () => {
      const fetchMock = mockFetchResponse({
        choices: [{ message: { content: "OpenAI result" } }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(openaiConfig);
      const result = await client.analyze("Test", 60, "system prompt", sampleGames, "$");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.openai.com/v1/chat/completions");
      expect(options.headers.Authorization).toBe("Bearer sk-openai-test");
      expect(result).toBe("OpenAI result");

      const body = JSON.parse(options.body);
      expect(body.messages[0].role).toBe("system");
      expect(body.messages[1].role).toBe("user");
    });

    it("includes web_search_preview tool", async () => {
      const fetchMock = mockFetchResponse({
        choices: [{ message: { content: "OK" } }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(openaiConfig);
      await client.analyze("Test", 0, "system", [], "$");

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.tools).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: "web_search_preview" })]),
      );
    });
  });

  describe("Google provider", () => {
    it("sends to Google generative AI endpoint", async () => {
      const fetchMock = mockFetchResponse({
        choices: [{ message: { content: "Google result" } }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(googleConfig);
      const result = await client.analyze("Test", 60, "system", sampleGames, "€");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url] = fetchMock.mock.calls[0];
      expect(url).toContain("generativelanguage.googleapis.com");
      expect(result).toBe("Google result");
    });
  });

  describe("Custom provider", () => {
    it("sends to custom base URL", async () => {
      const fetchMock = mockFetchResponse({
        choices: [{ message: { content: "Custom result" } }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(customConfig);
      const result = await client.analyze("Test", 60, "system", sampleGames, "$");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe("https://custom-api.example.com/v1/completions");
      expect(result).toBe("Custom result");
    });

    it("throws if no base URL configured", async () => {
      const config: AIProviderConfig = { type: "custom", apiKey: "", model: "m" };
      const client = new AIClient(config);
      await expect(
        client.analyze("Test", 0, "system", [], "$"),
      ).rejects.toThrow("base URL");
    });

    it("handles alternative response formats", async () => {
      const fetchMock = mockFetchResponse({
        content: [{ text: "Alt format" }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(customConfig);
      const result = await client.analyze("Test", 0, "system", [], "$");
      expect(result).toBe("Alt format");
    });
  });

  describe("formatLibrary", () => {
    it("only includes games with scores in the user message", async () => {
      const fetchMock = mockFetchResponse({
        content: [{ type: "text", text: "OK" }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const games: Game[] = [
        { id: "1", name: "Scored Game", score: 85 },
        { id: "2", name: "Unscored Game", score: null },
      ];

      const client = new AIClient(anthropicConfig);
      await client.analyze("Test", 0, "system", games, "€");

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      const userMsg = body.messages[0].content;
      expect(userMsg).toContain("Scored Game: 85/100");
      expect(userMsg).not.toContain("Unscored Game");
    });
  });

  describe("expandAnalysis", () => {
    it("sends expand request with original response", async () => {
      const fetchMock = mockFetchResponse({
        content: [{ type: "text", text: "## Extended Section\nMore detail" }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(anthropicConfig);
      const result = await client.expandAnalysis(
        "Elden Ring",
        "Original analysis here",
        ["Narrative & Story Depth", "Combat Feel"],
      );

      expect(result).toContain("Extended Section");
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      const userMsg = body.messages[0].content;
      expect(userMsg).toContain("Elden Ring");
      expect(userMsg).toContain("Original analysis here");
    });
  });

  describe("extended thinking", () => {
    it("sets max_tokens to 8192 for Anthropic with extended thinking", async () => {
      const config: AIProviderConfig = {
        ...anthropicConfig,
        extendedThinking: true,
      };
      const fetchMock = mockFetchResponse({
        content: [{ type: "text", text: "OK" }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(config);
      await client.analyze("Test", 0, "system", [], "€");

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.max_tokens).toBe(8192);
    });

    it("sets reasoning_effort for OpenAI with extended thinking", async () => {
      const config: AIProviderConfig = {
        ...openaiConfig,
        extendedThinking: true,
      };
      const fetchMock = mockFetchResponse({
        choices: [{ message: { content: "OK" } }],
      });
      vi.stubGlobal("fetch", fetchMock);

      const client = new AIClient(config);
      await client.analyze("Test", 0, "system", [], "$");

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.reasoning_effort).toBe("low");
    });
  });
});

describe("expandAnalysis with streaming", () => {
  it("calls anthropicExpandStream for Anthropic", async () => {
    const events = [
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"## Expanded"}}',
      'event: message_stop\ndata: {"type":"message_stop"}',
    ];
    const fetchMock = mockFetchSSE(events);
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(anthropicConfig);
    const onStream = vi.fn();
    const result = await client.expandAnalysis("Test", "Original", ["Combat"], onStream);
    expect(onStream).toHaveBeenCalledWith("## Expanded");
    expect(result).toContain("## Expanded");
  });

  it("calls openaiStream for OpenAI expand", async () => {
    const events = [
      'data: {"choices":[{"delta":{"content":"## Detail"}}]}',
      "data: [DONE]",
    ];
    const fetchMock = mockFetchSSE(events);
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(openaiConfig);
    const onStream = vi.fn();
    const result = await client.expandAnalysis("Test", "Original", ["Story"], onStream);
    expect(result).toContain("## Detail");
  });

  it("calls googleStream for Google expand", async () => {
    const events = [
      'data: {"choices":[{"delta":{"content":"## Google Section"}}]}',
      "data: [DONE]",
    ];
    const fetchMock = mockFetchSSE(events);
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(googleConfig);
    const onStream = vi.fn();
    const result = await client.expandAnalysis("Test", "Original", ["Story"], onStream);
    expect(result).toContain("## Google Section");
  });

  it("falls back to customRequest for custom expand", async () => {
    const fetchMock = mockFetchResponse({
      choices: [{ message: { content: "## Custom Expanded" } }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(customConfig);
    const onStream = vi.fn();
    const result = await client.expandAnalysis("Test", "Original", ["Combat"], onStream);
    expect(result).toContain("## Custom Expanded");
  });
});

describe("custom provider", () => {
  it("sends correct request for non-streaming analysis", async () => {
    const fetchMock = mockFetchResponse({
      choices: [{ message: { content: "Custom result" } }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(customConfig);
    const result = await client.analyze("TestGame", 10, "instructions", [], "$");
    expect(result).toBe("Custom result");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://custom-api.example.com/v1/completions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws if no baseUrl", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const config: AIProviderConfig = { ...customConfig, baseUrl: undefined };
    const client = new AIClient(config);
    await expect(client.analyze("Test", 0, "sys", [], "$")).rejects.toThrow("base URL");
  });

  it("handles data.content[0].text response format", async () => {
    const fetchMock = mockFetchResponse({
      content: [{ text: "Alternative format" }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(customConfig);
    const result = await client.analyze("Test", 0, "sys", [], "$");
    expect(result).toBe("Alternative format");
  });

  it("handles data.response format", async () => {
    const fetchMock = mockFetchResponse({ response: "Flat response" });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(customConfig);
    const result = await client.analyze("Test", 0, "sys", [], "$");
    expect(result).toBe("Flat response");
  });

  it("falls back to JSON.stringify for unknown format", async () => {
    const fetchMock = mockFetchResponse({ unknown: true });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(customConfig);
    const result = await client.analyze("Test", 0, "sys", [], "$");
    expect(result).toContain("unknown");
  });

  it("sends without Authorization when no apiKey", async () => {
    const config: AIProviderConfig = { ...customConfig, apiKey: "" };
    const fetchMock = mockFetchResponse({
      choices: [{ message: { content: "OK" } }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(config);
    await client.analyze("Test", 0, "sys", [], "$");
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
  });

  it("throws on custom API error", async () => {
    const fetchMock = mockFetchResponse("Server error", 500);
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(customConfig);
    await expect(client.analyze("Test", 0, "sys", [], "$")).rejects.toThrow("Custom API error");
  });
});

describe("google non-streaming", () => {
  it("sends correct non-streaming Google request", async () => {
    const fetchMock = mockFetchResponse({
      choices: [{ message: { content: "Google result" } }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(googleConfig);
    const result = await client.analyze("TestGame", 10, "instructions", [], "€");
    expect(result).toBe("Google result");
  });

  it("throws on Google API error", async () => {
    const fetchMock = mockFetchResponse("Quota exceeded", 429);
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(googleConfig);
    await expect(client.analyze("Test", 0, "sys", [], "$")).rejects.toThrow("Google API error");
  });

  it("uses extended thinking params for Google", async () => {
    const config: AIProviderConfig = { ...googleConfig, extendedThinking: true };
    const fetchMock = mockFetchResponse({
      choices: [{ message: { content: "OK" } }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new AIClient(config);
    await client.analyze("Test", 0, "sys", [], "$");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.reasoning_effort).toBe("low");
    expect(body.max_tokens).toBe(8192);
  });
});

describe("testConnection", () => {
  it("returns true when analyze succeeds", async () => {
    const fetchMock = mockFetchResponse({
      content: [{ type: "text", text: "OK" }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await testConnection(anthropicConfig);
    expect(result).toBe(true);
  });

  it("returns false when analyze throws", async () => {
    const fetchMock = mockFetchResponse({ error: "Bad key" }, 401);
    vi.stubGlobal("fetch", fetchMock);

    const result = await testConnection(anthropicConfig);
    expect(result).toBe(false);
  });
});

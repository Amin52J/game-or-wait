import type { AIProviderConfig, Game } from "@/shared/types";
import { getSupabase } from "@/shared/api/supabase";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/** One turn of a follow-up discussion about a finished analysis. */
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface DiscussionContext {
  gameName: string;
  price: number;
  currencySymbol: string;
  /** The analysis being discussed, as currently shown to the user. */
  analysis: string;
  /** The user's generated taste instructions — same system prompt used to produce the analysis. */
  instructions: string;
}

function discussionContextBlock(ctx: DiscussionContext): string {
  return `You are discussing an analysis you already produced for this user. Everything above describes their taste profile and the procedure the analysis was scored with.

GAME: ${ctx.gameName}
PRICE: ${ctx.currencySymbol}${ctx.price}

THE ANALYSIS UNDER DISCUSSION:
"""
${ctx.analysis}
"""`;
}

const DISCUSSION_RULES = `How to reply:
- Be brief. Two or three sentences is the target and 100 words is the hard ceiling.
- Answer only what was asked. No preamble, no restating the question, no recap of the analysis, no offers of further help.
- Plain prose, no ## headings. Use bullets only when the answer really is a list, and keep it to three short lines.
- If the user corrects a fact or tells you that you misread one of their taste points, accept it and say in one line what it changes: which factor, which direction the Enjoyment Score moves, and roughly how far. If it changes nothing meaningful, say exactly that and stop.
- Never output a rewritten analysis. The user has a separate control for re-running it.
- If you are unsure of a fact, say so in a few words rather than guessing. You may search the web to check.`;

const REVISION_RULES = `The user has discussed this analysis with you and now wants it re-run.

Produce a COMPLETE replacement analysis for this game using the exact same section format and scoring procedure defined above. It must stand alone and be usable in place of the old analysis.

Apply everything established in the discussion: corrected facts, corrected taste points, and any adjustment you already agreed to. Where the discussion changed nothing, keep your previous conclusions rather than drifting.

Output only the analysis itself, with no preamble describing what you changed.`;

const REVISION_REQUEST = "Re-run the full analysis now, applying everything we agreed in this discussion.";

/**
 * Discussion replies are meant to be a few sentences; the ceiling keeps rambling in check.
 * Reasoning models spend part of the budget on hidden tokens before the reply starts, so
 * they get more headroom — brevity is enforced by the prompt, not by truncation.
 */
const DISCUSSION_MAX_TOKENS = 1024;
const DISCUSSION_MAX_TOKENS_REASONING = 4096;

function applyMaxTokens(body: Record<string, unknown>, maxTokens: number) {
  if ("max_completion_tokens" in body) body.max_completion_tokens = maxTokens;
  else body.max_tokens = maxTokens;
  return body;
}

/**
 * Anthropic rejects consecutive same-role turns and transcripts that don't open
 * with the user, which a thread can hit if a reply failed midway.
 */
function normalizeTurns(turns: ChatTurn[]): ChatTurn[] {
  const merged: ChatTurn[] = [];
  for (const turn of turns) {
    if (!turn.content.trim()) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === turn.role) {
      merged[merged.length - 1] = { role: last.role, content: `${last.content}\n\n${turn.content}` };
    } else {
      merged.push({ ...turn });
    }
  }
  while (merged.length > 0 && merged[0].role !== "user") merged.shift();
  return merged;
}

/** Providers without cacheable system blocks take one flattened system message. */
function joinSystem(cachedSystem: string, contextSystem: string, turns: ChatTurn[]): Message[] {
  const system = [cachedSystem.trim(), contextSystem].filter(Boolean).join("\n\n---\n\n");
  return [{ role: "system", content: system }, ...turns];
}

class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableError";
  }
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable =
        err instanceof RetryableError ||
        (err instanceof Error && /overloaded|529|rate.?limit|too many requests/i.test(err.message));
      if (!isRetryable || attempt === retries) {
        if (isRetryable && err instanceof Error) {
          throw new Error(
            `The AI service is currently overloaded. Retried ${retries} times but it's still busy, please try again in a minute.`,
          );
        }
        throw err;
      }
      const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 500;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Retry exhausted");
}

export class AIClient {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async analyze(
    gameName: string,
    price: number,
    instructions: string,
    games: Game[],
    currencySymbol: string,
    onStream?: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const libraryData = this.formatLibrary(games);
    const systemPrompt = instructions;
    const userMessage = `Here is my game library:\n\n${libraryData}\n\n---\n\nAnalyze this game for me: **${gameName}** at **${currencySymbol}${price}**\n\nIMPORTANT: Search the web for "${gameName} Steam reviews" to find the current Steam review rating (e.g. Very Positive, Mixed), total review count, and the most common praise/complaints. Use ONLY factual review statistics — do not change your scoring based on individual reviewer opinions. Review data informs the Public Sentiment section and penalty evidence, but anchor games and the scoring procedure drive the Enjoyment Score.`;

    if (onStream) {
      return this.streamRequest(systemPrompt, userMessage, onStream, signal, onThinking);
    }
    return this.request(systemPrompt, userMessage, signal);
  }

  async expandAnalysis(
    gameName: string,
    originalResponse: string,
    sectionNames: string[],
    onStream?: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const system =
      "You are a game analysis assistant. The user has already received a core analysis and is now requesting additional detail sections. Generate ONLY the requested sections using ## headings. Be concise and analytical.";
    const user = `Here is the core analysis for **${gameName}**:\n\n${originalResponse}\n\n---\n\nNow provide these additional sections:\n${sectionNames.map((n) => `- **${n}**`).join("\n")}\n\nUse ## headings for each section. Base your answers on the information already in the analysis. Do not repeat information from the core analysis.`;

    if (onStream) {
      return this.streamExpandRequest(system, user, onStream, signal);
    }
    return this.request(system, user, signal);
  }

  private async streamExpandRequest(
    system: string,
    user: string,
    onStream: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    switch (this.config.type) {
      case "anthropic":
        return this.anthropicExpandStream(system, user, onStream, signal);
      case "openai":
        return this.openaiStream(system, user, onStream, signal);
      case "google":
        return this.googleStream(system, user, onStream, signal);
      case "custom":
        return this.customStream(system, user, onStream, signal);
    }
  }

  private async anthropicExpandStream(
    system: string,
    user: string,
    onStream: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.config.model,
      system,
      messages: [{ role: "user", content: user }],
      max_tokens: 8192,
      temperature: 0,
      stream: true,
    };
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${err}`);
    }
    return this.readAnthropicSSE(res, onStream);
  }

  /** Answers a follow-up question about an analysis, with the prior turns as context. */
  async discuss(
    ctx: DiscussionContext,
    history: ChatTurn[],
    question: string,
    onStream?: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    return this.chat(
      ctx.instructions,
      `${discussionContextBlock(ctx)}\n\n${DISCUSSION_RULES}`,
      [...history, { role: "user", content: question }],
      this.config.extendedThinking ? DISCUSSION_MAX_TOKENS_REASONING : DISCUSSION_MAX_TOKENS,
      onStream,
      signal,
      onThinking,
    );
  }

  /** Regenerates the whole analysis, folding in whatever the discussion established. */
  async reviseAnalysis(
    ctx: DiscussionContext,
    history: ChatTurn[],
    onStream?: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    return this.chat(
      ctx.instructions,
      `${discussionContextBlock(ctx)}\n\n${REVISION_RULES}`,
      [...history, { role: "user", content: REVISION_REQUEST }],
      this.config.extendedThinking ? 16384 : 8192,
      onStream,
      signal,
      onThinking,
    );
  }

  /**
   * Multi-turn request. `cachedSystem` is the long, stable instruction prompt and is
   * marked cacheable on Anthropic; `contextSystem` holds the per-analysis details.
   */
  private async chat(
    cachedSystem: string,
    contextSystem: string,
    rawTurns: ChatTurn[],
    maxTokens: number,
    onStream?: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const turns = normalizeTurns(rawTurns);
    switch (this.config.type) {
      case "anthropic":
        return this.anthropicChat(
          cachedSystem,
          contextSystem,
          turns,
          maxTokens,
          onStream,
          signal,
          onThinking,
        );
      case "openai":
        return this.openAICompatChat(
          "https://api.openai.com/v1/chat/completions",
          applyMaxTokens(
            this.buildOpenAIBody(joinSystem(cachedSystem, contextSystem, turns), Boolean(onStream)),
            maxTokens,
          ),
          onStream,
          signal,
          onThinking,
        );
      case "google":
        return this.openAICompatChat(
          this.googleBaseUrl,
          applyMaxTokens(
            this.buildGoogleBody(joinSystem(cachedSystem, contextSystem, turns), Boolean(onStream)),
            maxTokens,
          ),
          onStream,
          signal,
          onThinking,
        );
      case "custom":
        return this.customChat(joinSystem(cachedSystem, contextSystem, turns), maxTokens, signal);
    }
  }

  private async anthropicChat(
    cachedSystem: string,
    contextSystem: string,
    turns: ChatTurn[],
    maxTokens: number,
    onStream?: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const system: Record<string, unknown>[] = [];
    if (cachedSystem.trim()) {
      system.push({ type: "text", text: cachedSystem, cache_control: { type: "ephemeral" } });
    }
    system.push({ type: "text", text: contextSystem });

    const body: Record<string, unknown> = {
      model: this.config.model,
      system,
      messages: turns.map((t) => ({ role: t.role, content: t.content })),
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }],
      temperature: 0,
      max_tokens: maxTokens,
    };
    if (onStream) body.stream = true;

    return withRetry(async () => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
        signal,
      });
      if (!res.ok) {
        const err = await res.text();
        if (res.status === 429 || res.status === 529 || /overloaded/i.test(err)) {
          throw new RetryableError(`Anthropic API error (${res.status}): ${err}`);
        }
        throw new Error(`Anthropic API error (${res.status}): ${err}`);
      }
      if (onStream) return this.readAnthropicSSE(res, onStream, onThinking);
      const data = await res.json();
      const textBlocks = (data.content || []).filter((b: { type: string }) => b.type === "text");
      return textBlocks.map((b: { text: string }) => b.text).join("") || "";
    });
  }

  private async openAICompatChat(
    url: string,
    body: Record<string, unknown>,
    onStream?: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API error (${res.status}): ${err}`);
    }
    if (onStream) return this.readOpenAISSE(res, onStream, onThinking);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private async customChat(
    messages: Message[],
    maxTokens: number,
    signal?: AbortSignal,
  ): Promise<string> {
    const url = this.config.baseUrl;
    if (!url) throw new Error("Custom provider requires a base URL");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0,
      }),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Custom API error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      data.content?.[0]?.text ||
      data.response ||
      JSON.stringify(data)
    );
  }

  private formatLibrary(games: Game[]): string {
    const scored = games.filter((g) => g.score !== null);
    const lines = scored.map((g) => `${g.name}: ${g.score}/100`);
    return lines.join("\n");
  }

  private async request(system: string, user: string, signal?: AbortSignal): Promise<string> {
    switch (this.config.type) {
      case "anthropic":
        return this.anthropicRequest(system, user, signal);
      case "openai":
        return this.openaiRequest(system, user, signal);
      case "google":
        return this.googleRequest(system, user, signal);
      case "custom":
        return this.customRequest(system, user, signal);
    }
  }

  private async streamRequest(
    system: string,
    user: string,
    onStream: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    switch (this.config.type) {
      case "anthropic":
        return this.anthropicStream(system, user, onStream, signal, onThinking);
      case "openai":
        return this.openaiStream(system, user, onStream, signal, onThinking);
      case "google":
        return this.googleStream(system, user, onStream, signal, onThinking);
      case "custom":
        return this.customStream(system, user, onStream, signal);
    }
  }

  // --- Anthropic ---

  private buildAnthropicBody(system: string, user: string, stream = false) {
    const body: Record<string, unknown> = {
      model: this.config.model,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: user }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }],
      temperature: 0,
    };

    if (this.config.extendedThinking) {
      body.max_tokens = 16384;
    } else {
      body.max_tokens = 8192;
    }

    if (stream) body.stream = true;
    return body;
  }

  private async anthropicRequest(
    system: string,
    user: string,
    signal?: AbortSignal,
  ): Promise<string> {
    return withRetry(async () => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(this.buildAnthropicBody(system, user)),
        signal,
      });
      if (!res.ok) {
        const err = await res.text();
        if (res.status === 429 || res.status === 529 || /overloaded/i.test(err)) {
          throw new RetryableError(`Anthropic API error (${res.status}): ${err}`);
        }
        throw new Error(`Anthropic API error (${res.status}): ${err}`);
      }
      const data = await res.json();
      const textBlocks = (data.content || []).filter((b: { type: string }) => b.type === "text");
      return textBlocks.map((b: { text: string }) => b.text).join("") || "";
    });
  }

  private async anthropicStream(
    system: string,
    user: string,
    onStream: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    return withRetry(async () => {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(this.buildAnthropicBody(system, user, true)),
        signal,
      });
      if (!res.ok) {
        const err = await res.text();
        if (res.status === 429 || res.status === 529 || /overloaded/i.test(err)) {
          throw new RetryableError(`Anthropic API error (${res.status}): ${err}`);
        }
        throw new Error(`Anthropic API error (${res.status}): ${err}`);
      }
      return this.readAnthropicSSE(res, onStream, onThinking);
    });
  }

  private extractLatestThought(text: string): string {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    if (lines.length === 0) return "Thinking\u2026";
    const last = lines[lines.length - 1].trim();
    if (last.length > 150) return last.slice(0, 147) + "\u2026";
    return last;
  }

  private async readAnthropicSSE(
    res: Response,
    onStream: (chunk: string) => void,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";
    let thinkingAccum = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        if (json === "[DONE]") break;
        try {
          const evt = JSON.parse(json);

          if (evt.type === "error") {
            const errType = evt.error?.type ?? "unknown_error";
            const errMsg = evt.error?.message ?? "Unknown error";
            if (/overloaded|rate.?limit/i.test(errType) || /overloaded|rate.?limit/i.test(errMsg)) {
              throw new RetryableError(`Anthropic API: ${errMsg} (${errType})`);
            }
            throw new Error(`Anthropic API stream error: ${errMsg} (${errType})`);
          }

          if (evt.type === "content_block_start" && onThinking) {
            const block = evt.content_block;
            if (block?.type === "thinking") {
              thinkingAccum = "";
            } else if (block?.type === "server_tool_use" || block?.type === "tool_use") {
              const label =
                block.name === "web_search"
                  ? "Searching the web\u2026"
                  : `Running ${block.name}\u2026`;
              onThinking(label);
            }
          }
          if (evt.type === "content_block_delta") {
            if (evt.delta?.type === "thinking_delta" && evt.delta.thinking && onThinking) {
              thinkingAccum += evt.delta.thinking;
              onThinking(this.extractLatestThought(thinkingAccum));
            }
            if (evt.delta?.text) {
              full += evt.delta.text;
              onStream(evt.delta.text);
            }
          }
        } catch (e) {
          if (
            e instanceof RetryableError ||
            (e instanceof Error && e.message.includes("stream error"))
          )
            throw e;
        }
      }
    }
    return full;
  }

  // --- OpenAI ---

  private buildOpenAIBody(messages: Message[], stream = false) {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages,
      tools: [{ type: "web_search_preview" }],
    };

    if (this.config.extendedThinking) {
      body.reasoning_effort = "low";
      body.max_completion_tokens = 16384;
    } else {
      body.max_tokens = 8192;
      body.temperature = 0;
    }

    if (stream) body.stream = true;
    return body;
  }

  private async openaiRequest(system: string, user: string, signal?: AbortSignal): Promise<string> {
    const messages: Message[] = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(this.buildOpenAIBody(messages)),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private async openaiStream(
    system: string,
    user: string,
    onStream: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const messages: Message[] = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(this.buildOpenAIBody(messages, true)),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${err}`);
    }
    return this.readOpenAISSE(res, onStream, onThinking);
  }

  private async readOpenAISSE(
    res: Response,
    onStream: (chunk: string) => void,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";
    let thinkingAccum = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6);
        if (json === "[DONE]") break;
        try {
          const evt = JSON.parse(json);
          const delta = evt.choices?.[0]?.delta;
          const reasoning = delta?.reasoning_content || delta?.reasoning;
          if (reasoning && onThinking) {
            thinkingAccum += reasoning;
            onThinking(this.extractLatestThought(thinkingAccum));
          }
          if (delta?.content) {
            full += delta.content;
            onStream(delta.content);
          }
        } catch {
          /* skip */
        }
      }
    }
    return full;
  }

  // --- Google (Gemini via OpenAI-compatible endpoint) ---

  private googleBaseUrl =
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  private buildGoogleBody(messages: Message[], stream = false) {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages,
    };
    if (this.config.extendedThinking) {
      body.reasoning_effort = "low";
      body.max_tokens = 16384;
    } else {
      body.max_tokens = 8192;
      body.temperature = 0;
    }
    if (stream) body.stream = true;
    return body;
  }

  private async googleRequest(system: string, user: string, signal?: AbortSignal): Promise<string> {
    const messages: Message[] = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
    const body = this.buildGoogleBody(messages);
    const res = await fetch(this.googleBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google API error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private async googleStream(
    system: string,
    user: string,
    onStream: (chunk: string) => void,
    signal?: AbortSignal,
    onThinking?: (chunk: string) => void,
  ): Promise<string> {
    const messages: Message[] = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
    const body = this.buildGoogleBody(messages, true);
    const res = await fetch(this.googleBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google API error (${res.status}): ${err}`);
    }
    return this.readOpenAISSE(res, onStream, onThinking);
  }

  // --- Custom ---

  private async customRequest(system: string, user: string, signal?: AbortSignal): Promise<string> {
    const url = this.config.baseUrl;
    if (!url) throw new Error("Custom provider requires a base URL");

    const messages: Message[] = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: 8192,
        temperature: 0,
      }),
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Custom API error (${res.status}): ${err}`);
    }
    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      data.content?.[0]?.text ||
      data.response ||
      JSON.stringify(data)
    );
  }

  private async customStream(
    system: string,
    user: string,
    onStream: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    return this.customRequest(system, user, signal);
  }
}

export async function testConnection(config: AIProviderConfig): Promise<boolean> {
  const client = new AIClient(config);
  try {
    const result = await client.analyze("Test", 0, "Reply with exactly: OK", [], "€");
    return result.length > 0;
  } catch {
    return false;
  }
}

export class TrialAnalysisError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "TrialAnalysisError";
    this.code = code;
  }
}

export async function trialAnalyze(
  gameName: string,
  price: number,
  instructions: string,
  games: Game[],
  currencySymbol: string,
  onStream: (chunk: string) => void,
  signal?: AbortSignal,
  onThinking?: (chunk: string) => void,
): Promise<string> {
  const scored = games.filter((g) => g.score !== null);
  const libraryData = scored.map((g) => `${g.name}: ${g.score}/100`).join("\n");

  const systemPrompt = instructions;
  const userMessage = `Here is my game library:\n\n${libraryData}\n\n---\n\nAnalyze this game for me: **${gameName}** at **${currencySymbol}${price}**\n\nIMPORTANT: Search the web for "${gameName} Steam reviews" to find the current Steam review rating (e.g. Very Positive, Mixed), total review count, and the most common praise/complaints. Use ONLY factual review statistics — do not change your scoring based on individual reviewer opinions. Review data informs the Public Sentiment section and penalty evidence, but anchor games and the scoring procedure drive the Enjoyment Score.`;

  const sb = getSupabase();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const res = await fetch(`${supabaseUrl}/functions/v1/analyze-game`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ system: systemPrompt, user: userMessage, gameName }),
    signal,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: "Unknown error" }));
    if (errData.error === "FREE_TRIAL_EXHAUSTED") {
      throw new TrialAnalysisError("FREE_TRIAL_EXHAUSTED", errData.message);
    }
    throw new Error(errData.error || `Analysis failed (${res.status})`);
  }

  // Parse Anthropic SSE stream (same format as direct calls)
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";
  let thinkingAccum = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6);
      if (json === "[DONE]") break;
      try {
        const evt = JSON.parse(json);

        if (evt.type === "content_block_start" && onThinking) {
          const block = evt.content_block;
          if (block?.type === "server_tool_use" || block?.type === "tool_use") {
            const label =
              block.name === "web_search"
                ? "Searching the web\u2026"
                : `Running ${block.name}\u2026`;
            onThinking(label);
          }
        }
        if (evt.type === "content_block_delta") {
          if (evt.delta?.type === "thinking_delta" && evt.delta.thinking && onThinking) {
            thinkingAccum += evt.delta.thinking;
            const tLines = thinkingAccum.split("\n").filter((l: string) => l.trim().length > 0);
            const last = tLines.length > 0 ? tLines[tLines.length - 1].trim() : "Thinking\u2026";
            onThinking(last.length > 150 ? last.slice(0, 147) + "\u2026" : last);
          }
          if (evt.delta?.text) {
            full += evt.delta.text;
            onStream(evt.delta.text);
          }
        }
      } catch {
        /* skip parse errors */
      }
    }
  }
  return full;
}

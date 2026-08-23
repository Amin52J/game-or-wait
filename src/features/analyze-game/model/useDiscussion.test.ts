import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { resetAllMocks, mockAppContext } from "@/__tests__/test-utils";
import * as db from "@/shared/api/db";
import type { DiscussionMessage } from "@/shared/types";
import { useDiscussion } from "./useDiscussion";

const ai = vi.hoisted(() => ({
  discuss: vi.fn(),
  reviseAnalysis: vi.fn(),
}));

vi.mock("@/entities/ai-provider/api/client", () => ({
  AIClient: class {
    discuss = ai.discuss;
    reviseAnalysis = ai.reviseAnalysis;
  },
}));

const ANALYSIS = "## Red-Line Risk\nNone\n\n## Enjoyment Score\n**90/100** | Confidence: High";

const ARGS = {
  analysisId: "a1",
  gameName: "Celeste",
  price: 20,
  response: ANALYSIS,
};

function message(over: Partial<DiscussionMessage>): DiscussionMessage {
  return {
    id: "m",
    analysisId: "a1",
    role: "user",
    content: "c",
    timestamp: 1,
    ...over,
  };
}

function setup() {
  return renderHook(() => useDiscussion(ARGS));
}

async function loaded() {
  const hook = setup();
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

beforeEach(() => {
  resetAllMocks();
  ai.discuss.mockReset();
  ai.reviseAnalysis.mockReset();
  vi.mocked(db.loadDiscussion).mockResolvedValue([]);
  mockAppContext.state = {
    ...mockAppContext.state,
    aiProvider: { type: "anthropic", apiKey: "sk-test", model: "claude-sonnet-4-6" },
    instructions: "taste instructions",
    setupAnswers: { ...mockAppContext.state.setupAnswers!, currency: "USD" },
  };
});

describe("useDiscussion", () => {
  it("ignores a blank question", async () => {
    const { result } = await loaded();
    await act(async () => {
      await result.current.send("   ");
    });
    expect(ai.discuss).not.toHaveBeenCalled();
  });

  it("does nothing without a configured provider", async () => {
    mockAppContext.state = { ...mockAppContext.state, aiProvider: null };
    const { result } = await loaded();

    expect(result.current.hasOwnKey).toBe(false);
    await act(async () => {
      await result.current.send("why?");
    });
    expect(ai.discuss).not.toHaveBeenCalled();
  });

  it("treats a provider with a blank key as having no key", async () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      aiProvider: { type: "anthropic", apiKey: "   ", model: "claude-sonnet-4-6" },
    };
    const { result } = await loaded();
    expect(result.current.hasOwnKey).toBe(false);
  });

  it("reports a non-Error rejection as a readable message", async () => {
    ai.discuss.mockRejectedValue("provider exploded");
    const { result } = await loaded();

    await act(async () => {
      await result.current.send("why?").catch(() => {});
    });
    expect(result.current.error?.message).toBe("provider exploded");
  });

  it("reports a non-Error rejection from a re-run", async () => {
    ai.reviseAnalysis.mockRejectedValue("provider exploded");
    const { result } = await loaded();

    await act(async () => {
      await result.current.revise();
    });
    expect(result.current.error?.message).toBe("provider exploded");
  });

  it("resolves the currency symbol from the user's settings", async () => {
    ai.discuss.mockResolvedValue("Short answer.");
    const { result } = await loaded();

    await act(async () => {
      await result.current.send("why?");
    });
    expect(ai.discuss.mock.calls[0][0].currencySymbol).toBe("$");
  });

  it("falls back to the raw code when the currency is not a valid one", async () => {
    mockAppContext.state = {
      ...mockAppContext.state,
      setupAnswers: { ...mockAppContext.state.setupAnswers!, currency: "not-a-currency" },
    };
    ai.discuss.mockResolvedValue("Short answer.");
    const { result } = await loaded();

    await act(async () => {
      await result.current.send("why?");
    });
    expect(ai.discuss.mock.calls[0][0].currencySymbol).toBe("not-a-currency");
  });

  it("accumulates streamed chunks into the stored reply", async () => {
    ai.discuss.mockImplementation(
      async (
        _ctx: unknown,
        _history: unknown,
        _question: unknown,
        onStream?: (chunk: string) => void,
      ) => {
        onStream?.("Part one. ");
        onStream?.("Part two.");
        return "Part one. Part two.";
      },
    );
    const { result } = await loaded();

    await act(async () => {
      await result.current.send("why?");
    });

    expect(result.current.messages.at(-1)?.content).toBe("Part one. Part two.");
    expect(result.current.streamedReply).toBe("");
  });

  it("streams the re-run draft while it regenerates", async () => {
    const revised = "## Enjoyment Score\n**50/100** | Confidence: High";
    ai.reviseAnalysis.mockImplementation(
      async (_ctx: unknown, _history: unknown, onStream?: (chunk: string) => void) => {
        onStream?.("## Enjoyment Score\n");
        onStream?.("**50/100** | Confidence: High");
        return revised;
      },
    );
    const { result } = await loaded();

    await act(async () => {
      await result.current.revise();
    });

    expect(mockAppContext.reviseAnalysis).toHaveBeenCalledWith("a1", revised, ANALYSIS);
    expect(result.current.revisionDraft).toBe("");
  });

  it("treats an empty reply as an error and drops the question", async () => {
    ai.discuss.mockResolvedValue("   ");
    const { result } = await loaded();

    await act(async () => {
      await result.current.send("why?").catch(() => {});
    });

    expect(result.current.error?.message).toMatch(/empty reply/i);
    expect(result.current.messages).toHaveLength(0);
    expect(db.deleteDiscussionMessage).toHaveBeenCalledTimes(1);
  });

  it("stays silent when the user aborts a question", async () => {
    const aborted = new Error("The user aborted a request.");
    aborted.name = "AbortError";
    ai.discuss.mockRejectedValue(aborted);
    const { result } = await loaded();

    await act(async () => {
      await result.current.send("why?").catch(() => {});
    });

    expect(result.current.error).toBeNull();
    expect(result.current.messages).toHaveLength(0);
  });

  it("keeps revision markers out of the transcript sent to the AI", async () => {
    vi.mocked(db.loadDiscussion).mockResolvedValue([
      message({ id: "1", role: "user", content: "first" }),
      message({ id: "2", role: "assistant", content: "reply" }),
      message({ id: "3", role: "revision", content: "Analysis re-run." }),
    ]);
    ai.discuss.mockResolvedValue("Short answer.");
    const { result } = await loaded();

    await act(async () => {
      await result.current.send("second");
    });

    expect(ai.discuss.mock.calls[0][1]).toEqual([
      { role: "user", content: "first" },
      { role: "assistant", content: "reply" },
    ]);
  });

  it("only allows a re-run once the AI has replied", async () => {
    vi.mocked(db.loadDiscussion).mockResolvedValue([
      message({ id: "1", role: "user", content: "first" }),
    ]);
    const { result } = await loaded();
    expect(result.current.canRevise).toBe(false);

    await act(async () => {
      await result.current.revise();
    });
    expect(mockAppContext.reviseAnalysis).not.toHaveBeenCalled();
  });

  it("does not commit an empty re-run", async () => {
    ai.reviseAnalysis.mockResolvedValue("");
    const { result } = await loaded();

    await act(async () => {
      await result.current.revise();
    });

    expect(result.current.error?.message).toMatch(/empty analysis/i);
    expect(mockAppContext.reviseAnalysis).not.toHaveBeenCalled();
  });

  it("swallows an aborted re-run", async () => {
    const aborted = new Error("aborted");
    ai.reviseAnalysis.mockRejectedValue(aborted);
    const { result } = await loaded();

    await act(async () => {
      await result.current.revise();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isRevising).toBe(false);
  });

  it("commits the re-run and appends a revision marker", async () => {
    ai.reviseAnalysis.mockResolvedValue(
      "## Red-Line Risk\nHigh — always online\n\n## Enjoyment Score\n**40/100** | Confidence: Low",
    );
    const { result } = await loaded();

    await act(async () => {
      await result.current.revise();
    });

    expect(mockAppContext.reviseAnalysis).toHaveBeenCalledWith(
      "a1",
      expect.stringContaining("40/100"),
      ANALYSIS,
    );
    const marker = result.current.messages.at(-1)!;
    expect(marker.role).toBe("revision");
    expect(marker.content).toContain("90 → 40");
    expect(db.insertDiscussionMessage).toHaveBeenCalledWith(marker);
  });

  it("stop() is safe when nothing is in flight", async () => {
    const { result } = await loaded();
    expect(() => result.current.stop()).not.toThrow();
  });
});

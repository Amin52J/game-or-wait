import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks, mockAppContext } from "@/__tests__/test-utils";
import * as db from "@/shared/api/db";
import { DiscussionPanel } from "./DiscussionPanel";

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

const ANALYSIS = [
  "## Red-Line Risk",
  "None",
  "",
  "## Enjoyment Score",
  "**72/100** | Confidence: High",
].join("\n");

function renderPanel(props: Partial<React.ComponentProps<typeof DiscussionPanel>> = {}) {
  return renderWithProviders(
    <DiscussionPanel
      analysisId="a1"
      gameName="Hollow Knight"
      price={30}
      response={ANALYSIS}
      defaultOpen
      {...props}
    />,
  );
}

beforeEach(() => {
  resetAllMocks();
  ai.discuss.mockReset();
  ai.reviseAnalysis.mockReset();
  mockAppContext.state = {
    ...mockAppContext.state,
    aiProvider: { type: "anthropic", apiKey: "sk-test", model: "claude-sonnet-4-6" },
    instructions: "taste instructions",
  };
});

describe("DiscussionPanel", () => {
  it("asks for an API key instead of a composer when the user is on the trial", async () => {
    mockAppContext.state = { ...mockAppContext.state, aiProvider: null };
    renderPanel();

    expect(await screen.findByText(/needs your own API key/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ask" })).not.toBeInTheDocument();
  });

  it("keeps the thread collapsed until the header is clicked", async () => {
    const user = userEvent.setup();
    renderPanel({ defaultOpen: false });

    expect(screen.queryByRole("button", { name: "Ask" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /discuss this analysis/i }));
    expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();
  });

  it("sends a question and renders the reply", async () => {
    const user = userEvent.setup();
    ai.discuss.mockResolvedValue("Because combat matters most to you.");
    renderPanel();

    await user.type(screen.getByLabelText(/your question/i), "Why this score?");
    await user.click(screen.getByRole("button", { name: "Ask" }));

    expect(await screen.findByText("Because combat matters most to you.")).toBeInTheDocument();
    expect(screen.getByText("Why this score?")).toBeInTheDocument();
    expect(db.insertDiscussionMessage).toHaveBeenCalledTimes(2);
  });

  it("passes the analysis and prior turns as context on the second question", async () => {
    const user = userEvent.setup();
    ai.discuss.mockResolvedValue("First reply.");
    renderPanel();

    await user.type(screen.getByLabelText(/your question/i), "One?");
    await user.click(screen.getByRole("button", { name: "Ask" }));
    await screen.findByText("First reply.");

    ai.discuss.mockResolvedValue("Second reply.");
    await user.type(screen.getByLabelText(/your question/i), "Two?");
    await user.click(screen.getByRole("button", { name: "Ask" }));
    await screen.findByText("Second reply.");

    const [context, history, question] = ai.discuss.mock.calls[1];
    expect(context.analysis).toBe(ANALYSIS);
    expect(context.gameName).toBe("Hollow Knight");
    expect(history).toEqual([
      { role: "user", content: "One?" },
      { role: "assistant", content: "First reply." },
    ]);
    expect(question).toBe("Two?");
  });

  it("drops the question again when the reply fails, so the thread stays clean", async () => {
    const user = userEvent.setup();
    ai.discuss.mockRejectedValue(new Error("Anthropic API error (500)"));
    renderPanel();

    await user.type(screen.getByLabelText(/your question/i), "Why this score?");
    await user.click(screen.getByRole("button", { name: "Ask" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Anthropic API error/);
    expect(db.deleteDiscussionMessage).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/your question/i)).toHaveValue("Why this score?");
  });

  it("only offers a re-run once the AI has replied, and commits the new analysis", async () => {
    const user = userEvent.setup();
    ai.discuss.mockResolvedValue("Good point, that drops it a few points.");
    ai.reviseAnalysis.mockResolvedValue(
      "## Red-Line Risk\nNone\n\n## Enjoyment Score\n**61/100** | Confidence: High",
    );
    renderPanel();

    expect(screen.queryByRole("button", { name: /re-run score/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/your question/i), "You misread my taste.");
    await user.click(screen.getByRole("button", { name: "Ask" }));
    await screen.findByText(/Good point/);

    await user.click(screen.getByRole("button", { name: /re-run score/i }));

    await waitFor(() => {
      expect(mockAppContext.reviseAnalysis).toHaveBeenCalledWith(
        "a1",
        expect.stringContaining("61/100"),
        ANALYSIS,
      );
    });
    expect(await screen.findByText(/72 → 61/)).toBeInTheDocument();
  });

  it("can show the original analysis after a re-run", async () => {
    const user = userEvent.setup();
    renderPanel({ originalResponse: "## Enjoyment Score\n**90/100** | Confidence: High" });

    await user.click(screen.getByRole("button", { name: /view original/i }));
    expect(screen.getByText(/original analysis, before any re-run/i)).toBeInTheDocument();
    expect(screen.getByText(/90\/100/)).toBeInTheDocument();
  });
});

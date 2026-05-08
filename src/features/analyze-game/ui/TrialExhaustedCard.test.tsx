import { screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { TrialExhaustedCard } from "./TrialExhaustedCard";

beforeEach(resetAllMocks);

describe("TrialExhaustedCard", () => {
  it("renders guidance and settings links", () => {
    renderWithProviders(<TrialExhaustedCard />);
    expect(screen.getByRole("heading", { name: /all 5 starter analyses used/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to settings/i })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("link", { name: /learn more/i })).toHaveAttribute("href", "/help#api-key");
  });
});

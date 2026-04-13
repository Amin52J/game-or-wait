import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Badge } from "./Badge";

beforeEach(resetAllMocks);

describe("Badge", () => {
  it("renders children text", () => {
    renderWithProviders(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("defaults to 'default' variant", () => {
    renderWithProviders(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders with success variant", () => {
    renderWithProviders(<Badge variant="success">Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with warning variant", () => {
    renderWithProviders(<Badge variant="warning">Pending</Badge>);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("renders with error variant", () => {
    renderWithProviders(<Badge variant="error">Failed</Badge>);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("passes through extra props", () => {
    renderWithProviders(<Badge data-testid="my-badge">Test</Badge>);
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });
});

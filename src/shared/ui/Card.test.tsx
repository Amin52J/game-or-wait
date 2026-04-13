import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { Card } from "./Card";

beforeEach(resetAllMocks);

describe("Card", () => {
  it("renders children content", () => {
    renderWithProviders(<Card>Card body</Card>);
    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("renders title", () => {
    renderWithProviders(<Card title="My Card">Content</Card>);
    expect(screen.getByText("My Card")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    renderWithProviders(<Card title="Card" subtitle="A description">Content</Card>);
    expect(screen.getByText("A description")).toBeInTheDocument();
  });

  it("renders action slot", () => {
    renderWithProviders(
      <Card title="Card" action={<button>Edit</button>}>Content</Card>,
    );
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("renders without header when no title/subtitle/action", () => {
    const { container } = renderWithProviders(<Card>Just body</Card>);
    expect(container.querySelector("header")).toBeNull();
  });

  it("renders with header when title is provided", () => {
    const { container } = renderWithProviders(<Card title="T">Body</Card>);
    expect(container.querySelector("header")).not.toBeNull();
  });

  it("renders as article element", () => {
    renderWithProviders(<Card>Content</Card>);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});

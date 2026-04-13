import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { GuidanceBanner } from "./GuidanceBanner";

beforeEach(() => {
  resetAllMocks();
  localStorage.clear();
});

describe("GuidanceBanner", () => {
  it("renders children content", () => {
    renderWithProviders(<GuidanceBanner>Important info</GuidanceBanner>);
    expect(screen.getByText("Important info")).toBeInTheDocument();
  });

  it("renders link when linkText and linkHref are provided", () => {
    renderWithProviders(
      <GuidanceBanner linkText="Learn more" linkHref="/help">
        Info
      </GuidanceBanner>,
    );
    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });

  it("can be dismissed when dismissKey is provided", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <GuidanceBanner dismissKey="test_banner">Dismissable info</GuidanceBanner>,
    );
    expect(screen.getByText("Dismissable info")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Dismissable info")).not.toBeInTheDocument();
  });

  it("stays dismissed after re-render", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProviders(
      <GuidanceBanner dismissKey="test_persist">Persist test</GuidanceBanner>,
    );
    await user.click(screen.getByLabelText("Dismiss"));
    unmount();
    renderWithProviders(
      <GuidanceBanner dismissKey="test_persist">Persist test</GuidanceBanner>,
    );
    expect(screen.queryByText("Persist test")).not.toBeInTheDocument();
  });

  it("does not show dismiss button without dismissKey", () => {
    renderWithProviders(<GuidanceBanner>No dismiss</GuidanceBanner>);
    expect(screen.queryByLabelText("Dismiss")).not.toBeInTheDocument();
  });

  it("renders warning variant", () => {
    renderWithProviders(<GuidanceBanner variant="warning">Warning!</GuidanceBanner>);
    expect(screen.getByText("Warning!")).toBeInTheDocument();
  });

  it("renders tip variant", () => {
    renderWithProviders(<GuidanceBanner variant="tip">Pro tip</GuidanceBanner>);
    expect(screen.getByText("Pro tip")).toBeInTheDocument();
  });

  it("calls onLinkClick when link is clicked", async () => {
    const user = userEvent.setup();
    const onLinkClick = vi.fn();
    renderWithProviders(
      <GuidanceBanner linkText="Click me" onLinkClick={onLinkClick}>
        Content
      </GuidanceBanner>,
    );
    await user.click(screen.getByText("Click me"));
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });
});

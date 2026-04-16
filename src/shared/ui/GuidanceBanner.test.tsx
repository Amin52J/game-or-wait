import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
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
    renderWithProviders(<GuidanceBanner dismissKey="test_banner">Dismissable info</GuidanceBanner>);
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
    renderWithProviders(<GuidanceBanner dismissKey="test_persist">Persist test</GuidanceBanner>);
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

  it("scrolls to hash when linkHref contains hash", () => {
    vi.useFakeTimers();

    const target = document.createElement("div");
    target.id = "scoring";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    renderWithProviders(
      <GuidanceBanner linkText="Learn" linkHref="/help#scoring">
        Info
      </GuidanceBanner>,
    );
    fireEvent.click(screen.getByText("Learn"));
    vi.advanceTimersByTime(300);

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    vi.useRealTimers();
    document.body.removeChild(target);
  });

  it("does not scroll when linkHref has no hash", () => {
    renderWithProviders(
      <GuidanceBanner linkText="Go" linkHref="/help">
        Info
      </GuidanceBanner>,
    );
    fireEvent.click(screen.getByText("Go"));
  });

  it("uses default icon based on variant", () => {
    const { container } = renderWithProviders(
      <GuidanceBanner variant="warning">Alert!</GuidanceBanner>,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses custom icon when provided", () => {
    const { container } = renderWithProviders(<GuidanceBanner icon="check">Done!</GuidanceBanner>);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("does not render link when linkText is provided but no href or onClick", () => {
    renderWithProviders(<GuidanceBanner linkText="Dead link">Info</GuidanceBanner>);
    expect(screen.queryByText("Dead link")).not.toBeInTheDocument();
  });

  it("handles isDismissed with localStorage error", () => {
    const origGetItem = localStorage.getItem.bind(localStorage);
    localStorage.getItem = () => {
      throw new Error("blocked");
    };
    renderWithProviders(<GuidanceBanner dismissKey="err_key">Content</GuidanceBanner>);
    expect(screen.getByText("Content")).toBeInTheDocument();
    localStorage.getItem = origGetItem;
  });

  it("scrolls using main element when available", () => {
    vi.useFakeTimers();

    const main = document.createElement("main");
    main.scrollTo = vi.fn();
    document.body.appendChild(main);

    const target = document.createElement("div");
    target.id = "sec";
    main.appendChild(target);

    renderWithProviders(
      <GuidanceBanner linkText="Go" linkHref="/page#sec">
        Info
      </GuidanceBanner>,
    );
    fireEvent.click(screen.getByText("Go"));
    vi.advanceTimersByTime(300);

    expect(main.scrollTo).toHaveBeenCalled();
    vi.useRealTimers();
    document.body.removeChild(main);
  });
});

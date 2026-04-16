import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders, resetAllMocks } from "@/__tests__/test-utils";
import { HashLink } from "./HashLink";

beforeEach(() => {
  resetAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("HashLink", () => {
  it("renders link with text", () => {
    renderWithProviders(<HashLink href="/help#scoring">Learn more</HashLink>);
    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });

  it("renders with correct href", () => {
    renderWithProviders(<HashLink href="/help#scoring">Learn more</HashLink>);
    const link = screen.getByText("Learn more").closest("a");
    expect(link).toHaveAttribute("href", "/help#scoring");
  });

  it("handles click on hash link and triggers scroll to element", () => {
    const target = document.createElement("div");
    target.id = "scoring";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    renderWithProviders(<HashLink href="/help#scoring">Click me</HashLink>);
    fireEvent.click(screen.getByText("Click me"));

    vi.advanceTimersByTime(300);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });

    document.body.removeChild(target);
  });

  it("does not scroll when href has no hash", () => {
    renderWithProviders(<HashLink href="/help">No hash</HashLink>);
    fireEvent.click(screen.getByText("No hash"));
    vi.advanceTimersByTime(300);
    // No error should occur
  });

  it("handles object href with hash", () => {
    const target = document.createElement("div");
    target.id = "faq";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    renderWithProviders(<HashLink href={{ pathname: "/help", hash: "#faq" }}>FAQ</HashLink>);
    fireEvent.click(screen.getByText("FAQ"));

    vi.advanceTimersByTime(300);
    expect(target.scrollIntoView).toHaveBeenCalled();

    document.body.removeChild(target);
  });

  it("handles object href without hash", () => {
    renderWithProviders(<HashLink href={{ pathname: "/help" }}>No hash obj</HashLink>);
    fireEvent.click(screen.getByText("No hash obj"));
    vi.advanceTimersByTime(300);
  });

  it("scrolls using main element when available", () => {
    const main = document.createElement("main");
    main.scrollTo = vi.fn();
    document.body.appendChild(main);

    const target = document.createElement("div");
    target.id = "section";
    main.appendChild(target);

    renderWithProviders(<HashLink href="/page#section">Go</HashLink>);
    fireEvent.click(screen.getByText("Go"));
    vi.advanceTimersByTime(300);

    expect(main.scrollTo).toHaveBeenCalled();
    document.body.removeChild(main);
  });

  it("uses scrollIntoView when no main element exists", () => {
    document.querySelectorAll("main").forEach((el) => el.remove());

    const target = document.createElement("div");
    target.id = "target";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    renderWithProviders(<HashLink href="/page#target">Go</HashLink>);
    fireEvent.click(screen.getByText("Go"));
    vi.advanceTimersByTime(300);

    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    document.body.removeChild(target);
  });

  it("does nothing when target element does not exist", () => {
    renderWithProviders(<HashLink href="/page#nonexistent">Go</HashLink>);
    fireEvent.click(screen.getByText("Go"));
    vi.advanceTimersByTime(300);
  });
});

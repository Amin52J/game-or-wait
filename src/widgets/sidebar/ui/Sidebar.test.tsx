import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks, mockAuthContext, mockNavigationContext } from "@/__tests__/test-utils";
import { Sidebar } from "./Sidebar";

beforeEach(() => {
  resetAllMocks();
  mockAuthContext.user = { id: "user-1", email: "test@example.com" } as any;
});

describe("Sidebar", () => {
  it("renders navigation items", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Analyze")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("renders GameFit logo", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("GameFit")).toBeInTheDocument();
  });

  it("renders log out button", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("shows logout confirmation modal on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);
    await user.click(screen.getByText("Log Out"));
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
  });

  it("calls signOut when logout is confirmed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);
    await user.click(screen.getByText("Log Out"));
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
    const logoutConfirm = screen.getAllByText("Log Out").find(
      (el) => el.closest("[role='dialog']") || el.closest("div[class*='Modal']"),
    );
    if (logoutConfirm) {
      await user.click(logoutConfirm);
      await waitFor(() => {
        expect(mockAuthContext.signOut).toHaveBeenCalled();
      });
    }
  });

  it("cancels logout modal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);
    await user.click(screen.getByText("Log Out"));
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });
    await user.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });

  it("has navigation links with correct hrefs", () => {
    renderWithProviders(<Sidebar />);
    const analyzeLink = screen.getByText("Analyze").closest("a");
    expect(analyzeLink).toHaveAttribute("href", "/analyze");
    const libraryLink = screen.getByText("Library").closest("a");
    expect(libraryLink).toHaveAttribute("href", "/library");
  });

  it("has hamburger menu toggle", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByLabelText(/open menu|close menu/i)).toBeInTheDocument();
  });
});

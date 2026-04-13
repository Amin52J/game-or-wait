import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, resetAllMocks, mockAuthContext } from "@/__tests__/test-utils";
import { AuthPage } from "./AuthPage";

beforeEach(resetAllMocks);

function getSubmitButton() {
  const form = document.querySelector("form")!;
  return within(form).getByRole("button", { name: /log in|create account|sign up|send reset|set new|please wait/i });
}

describe("AuthPage — Login", () => {
  it("renders login form with email and password fields", () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(getSubmitButton().textContent).toBe("Log In");
  });

  it("calls signIn on login form submit", async () => {
    const user = userEvent.setup();
    mockAuthContext.signIn.mockResolvedValue(null);
    renderWithProviders(<AuthPage initialMode="login" />);
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(mockAuthContext.signIn).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("calls signIn and handles error", async () => {
    const user = userEvent.setup();
    mockAuthContext.signIn.mockResolvedValue("Invalid credentials");
    renderWithProviders(<AuthPage initialMode="login" />);
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(mockAuthContext.signIn).toHaveBeenCalledWith("test@example.com", "wrongpassword");
    });
  });

  it("has forgot password link", () => {
    renderWithProviders(<AuthPage initialMode="login" />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it("has social login buttons (GitHub, Steam)", () => {
    renderWithProviders(<AuthPage initialMode="login" />);
    const buttons = screen.getAllByRole("button");
    const githubBtn = buttons.find((b) => b.textContent?.includes("GitHub"));
    const steamBtn = buttons.find((b) => b.textContent?.includes("Steam"));
    expect(githubBtn).toBeDefined();
    expect(steamBtn).toBeDefined();
  });

  it("renders back button when onBack is provided", () => {
    const onBack = vi.fn();
    renderWithProviders(<AuthPage onBack={onBack} />);
    expect(screen.getByText(/back/i)).toBeInTheDocument();
  });
});

describe("AuthPage — Sign Up", () => {
  it("renders signup form when initialMode is signup", () => {
    renderWithProviders(<AuthPage initialMode="signup" />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(getSubmitButton().textContent).toBe("Create Account");
  });

  it("can switch between login and signup tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage initialMode="login" />);
    const signUpTab = Array.from(document.querySelectorAll("button")).find(
      (b) => b.textContent === "Sign Up" && b.getAttribute("type") !== "submit",
    );
    expect(signUpTab).toBeDefined();
    await user.click(signUpTab!);
    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(getSubmitButton().textContent).toBe("Create Account");
    });
  });

  it("calls signUp on signup form submit", async () => {
    const user = userEvent.setup();
    mockAuthContext.signUp.mockResolvedValue(null);
    renderWithProviders(<AuthPage initialMode="signup" />);
    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(mockAuthContext.signUp).toHaveBeenCalledWith("john@example.com", "password123", "John");
    });
  });

  it("shows success message after signup", async () => {
    const user = userEvent.setup();
    mockAuthContext.signUp.mockResolvedValue(null);
    renderWithProviders(<AuthPage initialMode="signup" />);
    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it("shows error from signUp", async () => {
    const user = userEvent.setup();
    mockAuthContext.signUp.mockResolvedValue("Email already registered");
    renderWithProviders(<AuthPage initialMode="signup" />);
    await user.type(screen.getByLabelText("Name"), "John");
    await user.type(screen.getByLabelText("Email"), "john@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });
});

describe("AuthPage — Forgot Password", () => {
  it("navigates to forgot password mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage initialMode="login" />);
    await user.click(screen.getByText(/forgot password/i));
    await waitFor(() => {
      expect(getSubmitButton().textContent).toBe("Send Reset Link");
    });
  });

  it("calls resetPassword on submit", async () => {
    const user = userEvent.setup();
    mockAuthContext.resetPassword.mockResolvedValue(null);
    renderWithProviders(<AuthPage initialMode="login" />);
    await user.click(screen.getByText(/forgot password/i));
    await waitFor(() => {
      expect(getSubmitButton().textContent).toBe("Send Reset Link");
    });
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(mockAuthContext.resetPassword).toHaveBeenCalledWith("test@example.com");
    });
  });

  it("shows success message after reset request", async () => {
    const user = userEvent.setup();
    mockAuthContext.resetPassword.mockResolvedValue(null);
    renderWithProviders(<AuthPage initialMode="login" />);
    await user.click(screen.getByText(/forgot password/i));
    await waitFor(() => screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it("has back to login button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage initialMode="login" />);
    await user.click(screen.getByText(/forgot password/i));
    await waitFor(() => {
      expect(screen.getByText(/back to log in/i)).toBeInTheDocument();
    });
  });

  it("navigates back to login from forgot password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthPage initialMode="login" />);
    await user.click(screen.getByText(/forgot password/i));
    await waitFor(() => screen.getByText(/back to log in/i));
    await user.click(screen.getByText(/back to log in/i));
    await waitFor(() => {
      expect(getSubmitButton().textContent).toBe("Log In");
    });
  });
});

describe("AuthPage — Recovery Mode", () => {
  it("renders recovery form when auth is in recovery", () => {
    mockAuthContext.recoveryMode = true;
    renderWithProviders(<AuthPage />);
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(getSubmitButton().textContent).toBe("Set New Password");
  });

  it("calls updatePassword on recovery form submit", async () => {
    const user = userEvent.setup();
    mockAuthContext.recoveryMode = true;
    mockAuthContext.updatePassword.mockResolvedValue(null);
    renderWithProviders(<AuthPage />);
    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(mockAuthContext.updatePassword).toHaveBeenCalledWith("newpassword123");
    });
  });

  it("shows success on password update", async () => {
    const user = userEvent.setup();
    mockAuthContext.recoveryMode = true;
    mockAuthContext.updatePassword.mockResolvedValue(null);
    renderWithProviders(<AuthPage />);
    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText(/password updated/i)).toBeInTheDocument();
    });
  });

  it("calls clearRecoveryMode after successful update", async () => {
    const user = userEvent.setup();
    mockAuthContext.recoveryMode = true;
    mockAuthContext.updatePassword.mockResolvedValue(null);
    renderWithProviders(<AuthPage />);
    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(mockAuthContext.clearRecoveryMode).toHaveBeenCalled();
    });
  });

  it("shows error from updatePassword", async () => {
    const user = userEvent.setup();
    mockAuthContext.recoveryMode = true;
    mockAuthContext.updatePassword.mockResolvedValue("Token expired");
    renderWithProviders(<AuthPage />);
    await user.type(screen.getByLabelText("New Password"), "newpassword123");
    await user.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText("Token expired")).toBeInTheDocument();
    });
  });
});

describe("AuthPage — Social Login", () => {
  it("calls signInWithProvider for GitHub", async () => {
    const user = userEvent.setup();
    mockAuthContext.signInWithProvider.mockResolvedValue(null);
    renderWithProviders(<AuthPage initialMode="login" />);
    const githubBtn = screen.getAllByRole("button").find((b) => b.textContent?.includes("GitHub"));
    expect(githubBtn).toBeDefined();
    await user.click(githubBtn!);
    await waitFor(() => {
      expect(mockAuthContext.signInWithProvider).toHaveBeenCalledWith("github");
    });
  });
});

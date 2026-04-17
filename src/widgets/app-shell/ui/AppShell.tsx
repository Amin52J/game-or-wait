"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useApp } from "@/app/providers/AppProvider";
import { AuthPage } from "@/features/auth";
import { LandingOrAuth } from "@/features/landing/ui/LandingPage";
import { Sidebar } from "@/widgets/sidebar";
import { KeepAlivePages } from "./KeepAlivePages";
import { AuthLoadingSkeleton, HydrationSkeleton } from "./AppShellSkeleton";
import { UpdateNotification } from "@/features/updater/ui/UpdateNotification";
import { ShellRoot, Main } from "./AppShell.styles";
import { noopSubscribe, getTauri, getTauriServer } from "./AppShell.utils";
import type { AppShellProps } from "./AppShell.types";

export function AppShell({ children }: AppShellProps) {
  const { user, loading: authLoading, recoveryMode } = useAuth();
  const { state, hydrated } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const forceSetup = pathname === "/setup";
  const setupDone = state.isSetupComplete && !forceSetup;

  const isTauri = useSyncExternalStore(noopSubscribe, getTauri, getTauriServer);

  // Redirect to home when landing on a deep link and either:
  // - not authenticated, or
  // - authenticated but hasn't completed setup.
  useEffect(() => {
    if (pathname !== "/") {
      if (!authLoading && !user) {
        router.replace("/");
      } else if (user && hydrated && !state.isSetupComplete) {
        router.replace("/");
      }
    }
  }, [authLoading, user, hydrated, state.isSetupComplete, pathname, router]);

  if (authLoading || isTauri === null) {
    return <AuthLoadingSkeleton />;
  }

  if (!user) {
    return isTauri ? <AuthPage /> : <LandingOrAuth />;
  }

  if (recoveryMode) {
    return <AuthPage initialMode="recovery" />;
  }

  if (!hydrated) {
    return <HydrationSkeleton />;
  }

  return (
    <ShellRoot>
      {setupDone ? <Sidebar /> : null}
      <Main $fullWidth={!setupDone}>{setupDone ? <KeepAlivePages /> : children}</Main>
      <UpdateNotification />
    </ShellRoot>
  );
}

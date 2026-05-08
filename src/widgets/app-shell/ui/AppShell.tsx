"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";
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
import {
  normalizeShowcasePath,
  isPublicShowcasePath,
} from "@/shared/lib/publicShowcaseRoute";

export function AppShell({ children }: AppShellProps) {
  const { user, loading: authLoading, recoveryMode } = useAuth();
  const { state, hydrated } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const forceSetup = pathname === "/setup";
  const setupDone = state.isSetupComplete && !forceSetup;

  const [pathFromBrowser, setPathFromBrowser] = useState("");
  useLayoutEffect(() => {
    setPathFromBrowser(normalizeShowcasePath(window.location.pathname));
  }, [pathname]);

  const publicShowcase =
    isPublicShowcasePath(pathname) || isPublicShowcasePath(pathFromBrowser);

  const isTauri = useSyncExternalStore(noopSubscribe, getTauri, getTauriServer);

  // Redirect to home when landing on a deep link and either:
  // - not authenticated, or
  // - authenticated but hasn't completed setup.
  useEffect(() => {
    if (publicShowcase) return;
    if (pathname !== "/") {
      if (!authLoading && !user) {
        router.replace("/");
      } else if (user && hydrated && !state.isSetupComplete) {
        router.replace("/");
      }
    }
  }, [
    authLoading,
    user,
    hydrated,
    state.isSetupComplete,
    pathname,
    router,
    publicShowcase,
  ]);

  if (authLoading || isTauri === null) {
    return <AuthLoadingSkeleton />;
  }

  if (!user) {
    if (publicShowcase) {
      return (
        <ShellRoot>
          <Main $fullWidth>{children}</Main>
        </ShellRoot>
      );
    }
    return isTauri ? <AuthPage /> : <LandingOrAuth />;
  }

  if (recoveryMode) {
    return <AuthPage initialMode="recovery" />;
  }

  if (!hydrated && !publicShowcase) {
    return <HydrationSkeleton />;
  }

  return (
    <ShellRoot>
      {setupDone && !publicShowcase ? <Sidebar /> : null}
      <Main $fullWidth={!setupDone || publicShowcase}>
        {setupDone && !publicShowcase ? <KeepAlivePages /> : children}
      </Main>
      <UpdateNotification />
    </ShellRoot>
  );
}

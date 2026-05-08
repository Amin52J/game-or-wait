"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigation } from "@/app/providers/NavigationProvider";
import {
  PageSlot,
  NotFoundRoot,
  NotFoundCode,
  NotFoundTitle,
  NotFoundDesc,
  NotFoundLink,
} from "./KeepAlivePages.styles";
import { normalizeShowcasePath, isPublicShowcasePath } from "@/shared/lib/publicShowcaseRoute";
import { PAGES, matchRoute } from "./KeepAlivePages.utils";

export function KeepAlivePages() {
  const { activePath } = useNavigation();
  const normalizedActivePath = normalizeShowcasePath(activePath);
  const anyMatch = PAGES.some((p) => matchRoute(normalizedActivePath, p.path));
  const onPublicShowcase = isPublicShowcasePath(activePath);
  const prevPathRef = useRef(normalizedActivePath);

  useEffect(() => {
    if (prevPathRef.current === normalizedActivePath) return;
    prevPathRef.current = normalizedActivePath;
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "instant" });
  }, [normalizedActivePath]);

  const [mounted, setMounted] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const match = PAGES.find((p) => matchRoute(normalizedActivePath, p.path));
    if (match) initial.add(match.path);
    return initial;
  });

  useEffect(() => {
    const currentMatch = PAGES.find((p) => matchRoute(normalizedActivePath, p.path));
    if (!currentMatch) return;
    setMounted((prev) => {
      if (prev.has(currentMatch.path)) return prev;
      return new Set([...prev, currentMatch.path]);
    });
  }, [normalizedActivePath]);

  return (
    <>
      {PAGES.map(({ path, Component }) => {
        const active = matchRoute(normalizedActivePath, path);
        if (!mounted.has(path) && !active) return null;
        return (
          <PageSlot key={path} $visible={active}>
            <Component />
          </PageSlot>
        );
      })}
      {!anyMatch && !onPublicShowcase && (
        <NotFoundRoot>
          <NotFoundCode>404</NotFoundCode>
          <NotFoundTitle>Page not found</NotFoundTitle>
          <NotFoundDesc>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </NotFoundDesc>
          <NotFoundLink href="/analyze">Go to Analyze</NotFoundLink>
        </NotFoundRoot>
      )}
    </>
  );
}

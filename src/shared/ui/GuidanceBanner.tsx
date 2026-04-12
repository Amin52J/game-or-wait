"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

export interface GuidanceBannerProps {
  icon?: IconName;
  variant?: "info" | "warning" | "tip";
  dismissKey?: string;
  linkText?: string;
  linkHref?: string;
  onLinkClick?: () => void;
  children: React.ReactNode;
}

const COLORS = {
  info: { bg: "accentMuted", border: "accent", fg: "accent" },
  warning: { bg: "warningMuted", border: "warning", fg: "warning" },
  tip: { bg: "successMuted", border: "success", fg: "success" },
} as const;

const Root = styled.div<{ $variant: "info" | "warning" | "tip" }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  line-height: 1.6;
  background: ${({ theme, $variant }) => theme.colors[COLORS[$variant].bg]};
  border: 1px solid ${({ theme, $variant }) => theme.colors[COLORS[$variant].border]};
  color: ${({ theme, $variant }) => theme.colors[COLORS[$variant].fg]};
  animation: fadeIn 250ms ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  strong {
    font-weight: 700;
  }
`;

const IconWrap = styled.span`
  flex-shrink: 0;
  display: flex;
  margin-top: 1px;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const LinkBtn = styled(Link)`
  display: inline;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  color: inherit;

  &:hover {
    opacity: 0.85;
  }
`;

const Dismiss = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  padding: 2px;
  line-height: 1;
  transition: opacity 150ms;

  &:hover {
    opacity: 1;
  }
`;

function isDismissed(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`gf_dismissed_${key}`) === "1";
  } catch {
    return false;
  }
}

function dismiss(key: string) {
  try {
    localStorage.setItem(`gf_dismissed_${key}`, "1");
  } catch { /* noop */ }
}

function scrollToHash(hash: string) {
  const el = document.getElementById(hash);
  if (!el) return;

  const main = document.querySelector("main");
  if (main) {
    const elTop = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
    main.scrollTo({ top: elTop, behavior: "smooth" });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function GuidanceBanner({
  icon,
  variant = "info",
  dismissKey,
  linkText,
  linkHref,
  onLinkClick,
  children,
}: GuidanceBannerProps) {
  const [hidden, setHidden] = useState(() => dismissKey ? isDismissed(dismissKey) : false);

  const handleDismiss = useCallback(() => {
    if (dismissKey) dismiss(dismissKey);
    setHidden(true);
  }, [dismissKey]);

  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      if (onLinkClick) {
        e.preventDefault();
        onLinkClick();
        return;
      }
      if (linkHref && linkHref.includes("#")) {
        const hash = linkHref.split("#")[1];
        setTimeout(() => scrollToHash(hash), 300);
      }
    },
    [onLinkClick, linkHref],
  );

  if (hidden) return null;

  const iconName = icon ?? (variant === "warning" ? "alert-triangle" : "info");

  return (
    <Root $variant={variant}>
      <IconWrap><Icon name={iconName} size={16} /></IconWrap>
      <Body>
        {children}
        {linkText && (linkHref || onLinkClick) && (
          <>
            {" "}
            <LinkBtn href={linkHref ?? ""} onClick={handleLinkClick}>
              {linkText}
            </LinkBtn>
          </>
        )}
      </Body>
      {dismissKey && (
        <Dismiss type="button" onClick={handleDismiss} aria-label="Dismiss">
          <Icon name="x" size={14} />
        </Dismiss>
      )}
    </Root>
  );
}

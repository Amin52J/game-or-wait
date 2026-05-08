"use client";

import styled, { css, keyframes } from "styled-components";
import type { Theme } from "@/shared/config/theme";

const toastSlideIn = (theme: Theme) => keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%)
      translateY(calc(-1 * (${theme.spacing.sm} + ${theme.spacing.xs})));
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`;

/** Fixed toast; centered in the viewport, or horizontally aligned with the main column when shell has a sidebar. */
export const Toast = styled.div<{ $type: "success" | "error"; $offsetForAppShell?: boolean }>`
  position: fixed;
  top: ${({ theme }) => `calc(${theme.spacing.lg} + env(safe-area-inset-top, 0px))`};
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme, $type }) =>
    $type === "success" ? theme.colors.successMuted : theme.colors.errorMuted};
  border: 1px solid
    ${({ theme, $type }) => ($type === "success" ? theme.colors.success : theme.colors.error)};
  color: ${({ theme, $type }) => ($type === "success" ? theme.colors.success : theme.colors.error)};
  font-size: 0.85rem;
  font-weight: 500;
  box-shadow: ${({ theme }) => theme.shadow.md};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: ${({ theme }) => toastSlideIn(theme)} 250ms ease;
  pointer-events: none;

  @media (min-width: ${({ theme }) => theme.breakpoint.tablet}) {
    padding: 10px ${({ theme }) => theme.spacing.lg};
  }

  ${({ $offsetForAppShell, theme }) =>
    $offsetForAppShell &&
    css`
      @media (min-width: ${theme.breakpoint.tablet}) {
        left: calc(50% + ${theme.spacing.xl});
      }

      @media (min-width: ${theme.breakpoint.desktop}) {
        left: calc(50% + 120px);
      }
    `}
`;

"use client";

import React from "react";
import styled, { css } from "styled-components";
import type { Theme } from "@/shared/config/theme";

export type BadgeVariant = "default" | "success" | "warning" | "error";

const variantStyles = (theme: Theme, variant: BadgeVariant) => {
  switch (variant) {
    case "success":
      return css`
        color: ${theme.colors.success};
        background: ${theme.colors.successMuted};
        border-color: rgba(34, 197, 94, 0.35);
      `;
    case "warning":
      return css`
        color: ${theme.colors.warning};
        background: ${theme.colors.warningMuted};
        border-color: rgba(245, 158, 11, 0.35);
      `;
    case "error":
      return css`
        color: ${theme.colors.error};
        background: ${theme.colors.errorMuted};
        border-color: rgba(239, 68, 68, 0.35);
      `;
    default:
      return css`
        color: ${theme.colors.textSecondary};
        background: ${theme.colors.surfaceHover};
        border-color: ${theme.colors.border};
      `;
  }
};

const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  max-width: 100%;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid transparent;
  ${({ theme, $variant }) => variantStyles(theme, $variant)}
`;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", children, ...rest }: BadgeProps) {
  return (
    <StyledBadge $variant={variant} {...rest}>
      {children}
    </StyledBadge>
  );
}

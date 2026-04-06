"use client";

import React from "react";
import styled, { css } from "styled-components";

const Shell = styled.article<{ $hoverable: boolean }>`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  transition:
    background-color ${({ theme }) => theme.transition.normal},
    border-color ${({ theme }) => theme.transition.normal},
    box-shadow ${({ theme }) => theme.transition.normal};

  ${({ $hoverable, theme }) =>
    $hoverable &&
    css`
      cursor: default;

      &:hover {
        background: ${theme.colors.surfaceHover};
        border-color: ${theme.colors.borderLight};
        box-shadow: ${theme.shadow.md};
      }
    `}
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`;

const Title = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

const Subtitle = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`;

const ActionSlot = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Body = styled.div<{ $padded: boolean }>`
  padding: ${({ theme, $padded }) => ($padded ? theme.spacing.lg : "0")};
`;

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  /** Adds hover elevation / surface change */
  hoverable?: boolean;
  /** Wrap body with default padding (default true when header exists) */
  padded?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  action,
  hoverable = false,
  padded,
  className,
  children,
}: CardProps) {
  const hasHeader = title != null || subtitle != null || action != null;
  const bodyPadded = padded ?? hasHeader;

  return (
    <Shell className={className} $hoverable={hoverable}>
      {hasHeader ? (
        <Header>
          <HeaderText>
            {title != null ? <Title>{title}</Title> : null}
            {subtitle != null ? <Subtitle>{subtitle}</Subtitle> : null}
          </HeaderText>
          {action != null ? <ActionSlot>{action}</ActionSlot> : null}
        </Header>
      ) : null}
      <Body $padded={bodyPadded}>{children}</Body>
    </Shell>
  );
}

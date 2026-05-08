"use client";

import styled from "styled-components";
import { PageTitle, SectionTitle, ButtonRow } from "@/shared/ui";

export const SettingsPageTitle = styled(PageTitle)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const KeyFieldWrap = styled.div`
  position: relative;
`;

export const RevealKeyButton = styled.button`
  position: absolute;
  right: calc(${({ theme }) => theme.spacing.sm} + 2px);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font-size: 0.8rem;
`;

export const MarginedButtonRow = styled(ButtonRow)`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const DangerSectionTitle = styled(SectionTitle)`
  color: ${({ theme }) => theme.colors.error};
`;

export const FormRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

export const FormGroup = styled.div`
  flex: 1;
  min-width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoint.tablet}) {
    min-width: 200px;
  }
`;

export const TrialStatusBox = styled.div<{ $exhausted: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 0.8125rem;
  line-height: 1.55;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid
    ${({ theme, $exhausted }) => ($exhausted ? theme.colors.warning : theme.colors.accent)};
  background: ${({ theme, $exhausted }) =>
    $exhausted ? theme.colors.warningMuted : theme.colors.accentMuted};
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

"use client";

import React, { forwardRef, useId } from "react";
import styled from "styled-components";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FieldRow = styled.div<{ $hasError: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme, $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  transition:
    border-color ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.fast};

  &:focus-within {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.accent};
    box-shadow: 0 0 0 3px
      ${({ theme, $hasError }) => ($hasError ? theme.colors.errorMuted : theme.colors.accentMuted)};
  }
`;

const IconSlot = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding-left: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`;

const StyledInput = styled.input<{ $withIcon: boolean }>`
  flex: 1;
  min-width: 0;
  padding: ${({ theme, $withIcon }) =>
    `${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${
      $withIcon ? theme.spacing.xs : theme.spacing.md
    }`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: none;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
`;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  id?: string;
  icon?: React.ReactNode;
}

const HintText = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, icon, className, disabled, ...rest },
  ref,
) {
  const genId = useId();
  const inputId = id ?? (typeof rest.name === "string" ? rest.name : undefined) ?? genId;
  const hasError = Boolean(error);

  return (
    <Root className={className}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <FieldRow $hasError={hasError}>
        {icon ? <IconSlot aria-hidden>{icon}</IconSlot> : null}
        <StyledInput
          ref={ref}
          id={inputId}
          $withIcon={Boolean(icon)}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
      </FieldRow>
      {error ? (
        <ErrorText id={`${inputId}-error`} role="alert">
          {error}
        </ErrorText>
      ) : hint ? (
        <HintText id={`${inputId}-hint`}>{hint}</HintText>
      ) : null}
    </Root>
  );
});

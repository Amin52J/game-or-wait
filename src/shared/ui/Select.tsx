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
  display: block;
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

const StyledSelect = styled.select`
  appearance: none;
  width: 100%;
  padding: ${({ theme }) =>
    `${theme.spacing.sm} ${theme.spacing.xl} ${theme.spacing.sm} ${theme.spacing.md}`};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Chevron = styled.span`
  pointer-events: none;
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid ${({ theme }) => theme.colors.textMuted};
`;

const ErrorText = styled.span`
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.error};
`;

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  id?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className, disabled, children, ...rest },
  ref,
) {
  const genId = useId();
  const selectId = id ?? (typeof rest.name === "string" ? rest.name : undefined) ?? genId;
  const hasError = Boolean(error);

  return (
    <Root className={className}>
      {label ? <Label htmlFor={selectId}>{label}</Label> : null}
      <FieldRow $hasError={hasError}>
        <StyledSelect
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...rest}
        >
          {children}
        </StyledSelect>
        <Chevron aria-hidden />
      </FieldRow>
      {error ? (
        <ErrorText id={`${selectId}-error`} role="alert">
          {error}
        </ErrorText>
      ) : null}
    </Root>
  );
});

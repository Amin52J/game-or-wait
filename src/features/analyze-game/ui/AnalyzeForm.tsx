"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/app/providers/AppProvider";
import { sessionCache } from "@/features/analyze-game/model/session-cache";
import { RawgGameAutocompleteField } from "@/features/manage-library/ui/RawgGameAutocompleteField";
import { FREE_ANALYSIS_LIMIT } from "@/shared/types";
import { Button } from "@/shared/ui/Button";
import {
  FormRoot,
  FieldBlock,
  Label,
  PriceRow,
  CurrencyPrefix,
  PriceField,
  ErrorBanner,
  FieldError,
} from "./AnalyzeForm.styles";
import { currencyPrefixFromSettings } from "./AnalyzeForm.utils";

export interface AnalyzeFormProps {
  onSubmit: (gameName: string, price: number) => void;
  isLoading: boolean;
  trialExhausted?: boolean;
  notEnoughScored?: boolean;
  scoredCount?: number;
}

export function AnalyzeForm({
  onSubmit,
  isLoading,
  trialExhausted,
  notEnoughScored,
  scoredCount = 0,
}: AnalyzeFormProps) {
  const { state, hydrated } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const cached = sessionCache.get();
  const [gameName, setGameName] = useState(cached.gameName);
  const [priceRaw, setPriceRaw] = useState(cached.priceRaw);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (pathname === "/" || pathname === "/analyze") {
      nameRef.current?.focus();
    }
  }, [pathname]);

  const hasOwnKey = Boolean(state.aiProvider?.apiKey?.trim());
  const hasTrialLeft = state.freeAnalysesUsed < FREE_ANALYSIS_LIMIT;
  const canAnalyze = hasOwnKey || hasTrialLeft;
  const showProviderError = hydrated && !canAnalyze;
  const currencyPrefix = currencyPrefixFromSettings(state.setupAnswers?.currency);

  const priceNum = priceRaw.trim() === "" ? NaN : Number(priceRaw);
  const priceInvalid = touched && (Number.isNaN(priceNum) || priceNum < 0);
  const nameInvalid = touched && gameName.trim() === "";

  const syncGameName = useCallback((next: string) => {
    setGameName(next);
    sessionCache.set({ gameName: next });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(true);
      if (!canAnalyze) return;
      const name = gameName.trim();
      const price = Number(priceRaw);
      if (!name || Number.isNaN(price) || price < 0) return;
      onSubmit(name, price);
    },
    [gameName, priceRaw, canAnalyze, onSubmit],
  );

  const disabled = isLoading || showProviderError || trialExhausted || notEnoughScored;

  return (
    <FormRoot ref={formRef} onSubmit={handleSubmit} noValidate>
      <FieldBlock>
        <Label htmlFor="analyze-game-name">Game name</Label>
        <RawgGameAutocompleteField
          ref={nameRef}
          id="analyze-game-name"
          placeholder=""
          value={gameName}
          onValueChange={syncGameName}
          onPick={(hit) => syncGameName(hit.name)}
          listboxLabel="Suggested game titles"
          onEnterWhenCollapsed={() => formRef.current?.requestSubmit()}
          error={nameInvalid ? "Enter a game name." : undefined}
          inputProps={{
            name: "gameName",
            disabled,
            autoComplete: "off",
            spellCheck: false,
            style: {
              fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)",
              fontWeight: 600,
              lineHeight: 1.3,
            },
          }}
        />
      </FieldBlock>

      <FieldBlock>
        <Label htmlFor="analyze-price">Full Price (before discounts)</Label>
        <PriceRow $invalid={priceInvalid}>
          <CurrencyPrefix aria-hidden>{currencyPrefix}</CurrencyPrefix>
          <PriceField
            id="analyze-price"
            name="price"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={priceRaw}
            onChange={(e) => {
              setPriceRaw(e.target.value);
              sessionCache.set({ priceRaw: e.target.value });
            }}
            disabled={disabled}
            aria-invalid={priceInvalid || undefined}
          />
        </PriceRow>
        {priceInvalid ? <FieldError>Enter a valid price (0 or greater).</FieldError> : null}
      </FieldBlock>

      {notEnoughScored && (
        <ErrorBanner onClick={() => router.push("/library")} style={{ cursor: "pointer" }}>
          You need at least 10 scored games to run an analysis. You currently have {scoredCount}.
          Head to your library and score some games first.
          <br />
          The more games you score, the more accurate the analysis will be.
        </ErrorBanner>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
        disabled={disabled}
      >
        Analyze
      </Button>
    </FormRoot>
  );
}

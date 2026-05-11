"use client";

import React, { forwardRef, useCallback, useEffect, useId, useState } from "react";
import type { GameSearchHit } from "@/shared/types";
import { Input, type InputProps } from "@/shared/ui";
import {
  AddGameAutocompleteWrap,
  AddGameSuggestionsList,
  AddGameSuggestionItem,
  AddGameSuggestionThumbWrap,
  AddGameSuggestionThumb,
  AddGameSuggestionLabel,
  AddGameSuggestionsStatus,
} from "./GameLibrary.styles";
import {
  RAWG_GAME_SEARCH_MIN_QUERY_LEN,
  useDebouncedRawgGameSearch,
} from "../lib/useDebouncedRawgGameSearch";

type ControlledAutocompleteKeys =
  | "label"
  | "id"
  | "placeholder"
  | "value"
  | "onChange"
  | "onFocus"
  | "onBlur"
  | "onKeyDown"
  | "role"
  | "aria-expanded"
  | "aria-controls"
  | "aria-autocomplete"
  | "aria-activedescendant"
  | "autoFocus"
  | "error"
  | "hint";

/** Password-manager hints (`data-*`) are omitted from strict DOM typings in some TS setups */
type VendorHookInputAttrs = {
  "data-bwignore"?: boolean | string;
  "data-1p-ignore"?: boolean | string;
  "data-lpignore"?: string;
  "data-form-type"?: string;
};

type PassthroughInputProps = Omit<InputProps, ControlledAutocompleteKeys> & VendorHookInputAttrs;

export type RawgGameAutocompleteFieldProps = {
  id: string;
  label?: string;
  placeholder: string;
  value: string;
  onValueChange: (next: string) => void;
  /** If set, choosing a suggestion calls this instead of `onValueChange(hit.name)`. */
  onPick?: (hit: GameSearchHit) => void;
  autoFocus?: boolean;
  /** Second-stage Escape when the suggestion list is already closed. */
  onEscapeWhenCollapsed?: () => void;
  /**
   * When the list is closed or empty, Enter invokes this (after preventDefault).
   * Use e.g. `form.requestSubmit()` so validation runs once.
   */
  onEnterWhenCollapsed?: () => void;
  listboxLabel?: string;
  inputProps?: PassthroughInputProps;
  error?: string;
  hint?: string;
};

export const RawgGameAutocompleteField = forwardRef<HTMLInputElement, RawgGameAutocompleteFieldProps>(
  function RawgGameAutocompleteField(
    {
      id,
      label,
      placeholder,
      value,
      onValueChange,
      onPick,
      autoFocus,
      onEscapeWhenCollapsed,
      onEnterWhenCollapsed,
      listboxLabel = "Game suggestions",
      inputProps,
      error,
      hint,
    },
    ref,
  ) {
    const listboxId = useId();
    const [listOpen, setListOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const { suggestions, loading } = useDebouncedRawgGameSearch(value);

    const showList =
      listOpen &&
      value.trim().length >= RAWG_GAME_SEARCH_MIN_QUERY_LEN &&
      (loading || suggestions.length > 0);

    useEffect(() => {
      setActiveIndex(-1);
    }, [suggestions]);

    const handlePick = useCallback(
      (hit: GameSearchHit) => {
        if (onPick) onPick(hit);
        else onValueChange(hit.name);
        setListOpen(false);
        setActiveIndex(-1);
      },
      [onPick, onValueChange],
    );

    return (
      <AddGameAutocompleteWrap>
        <Input
          {...inputProps}
          ref={ref}
          label={label}
          id={id}
          placeholder={placeholder}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
          }
          value={value}
          error={error}
          hint={hint}
          onChange={(e) => {
            onValueChange(e.target.value);
            const native = e.nativeEvent as InputEvent;
            const pastedOrDropped =
              native.inputType === "insertFromPaste" || native.inputType === "insertFromDrop";
            if (pastedOrDropped) {
              setListOpen(false);
              return;
            }
            setListOpen(true);
          }}
          onFocus={() => setListOpen(true)}
          onBlur={() => {
            setTimeout(() => setListOpen(false), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              if (showList) {
                e.preventDefault();
                setListOpen(false);
                setActiveIndex(-1);
                return;
              }
              onEscapeWhenCollapsed?.();
              return;
            }

            if (!showList || suggestions.length === 0) {
              if (e.key === "Enter" && onEnterWhenCollapsed) {
                e.preventDefault();
                onEnterWhenCollapsed();
              }
              return;
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1 >= suggestions.length ? 0 : i + 1));
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              const hit = activeIndex >= 0 ? suggestions[activeIndex] : undefined;
              if (hit) handlePick(hit);
              else onEnterWhenCollapsed?.();
              return;
            }
          }}
        />
        {showList ? (
          <AddGameSuggestionsList id={listboxId} role="listbox" aria-label={listboxLabel}>
            {loading && suggestions.length === 0 ? (
              <AddGameSuggestionsStatus role="status" aria-live="polite">
                Searching…
              </AddGameSuggestionsStatus>
            ) : (
              suggestions.map((hit, i) => (
                <li key={`${hit.name}-${i}`} role="presentation">
                  <AddGameSuggestionItem
                    type="button"
                    tabIndex={-1}
                    id={`${listboxId}-opt-${i}`}
                    role="option"
                    aria-selected={activeIndex === i}
                    $active={activeIndex === i}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => handlePick(hit)}
                  >
                    <AddGameSuggestionThumbWrap aria-hidden>
                      {hit.image ? (
                        <AddGameSuggestionThumb
                          src={hit.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </AddGameSuggestionThumbWrap>
                    <AddGameSuggestionLabel>{hit.name}</AddGameSuggestionLabel>
                  </AddGameSuggestionItem>
                </li>
              ))
            )}
          </AddGameSuggestionsList>
        ) : null}
      </AddGameAutocompleteWrap>
    );
  },
);

RawgGameAutocompleteField.displayName = "RawgGameAutocompleteField";

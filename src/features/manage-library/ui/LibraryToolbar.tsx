"use client";

import React from "react";
import { Input, FilterChip } from "@/shared/ui";
import {
  Toolbar,
  ToolbarSearchRow,
  ToolbarSearchWrap,
  FilterBar,
  FilterLabel,
} from "./GameLibrary.styles";
import { SCORE_RANGES } from "./GameLibrary.utils";

export function LibraryToolbar({
  inputValue,
  setSearch,
  activeRanges,
  toggleRange,
}: {
  inputValue: string;
  setSearch: (v: string) => void;
  activeRanges: Set<string>;
  toggleRange: (key: string) => void;
}) {
  return (
    <Toolbar>
      <ToolbarSearchRow>
        <ToolbarSearchWrap>
          <Input
            placeholder="Search your library..."
            value={inputValue}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            data-bwignore
            name="library-search"
            id="library-search"
            type="search"
          />
        </ToolbarSearchWrap>
      </ToolbarSearchRow>
      <FilterBar>
        <FilterLabel>Score:</FilterLabel>
        {SCORE_RANGES.map((r) => (
          <FilterChip
            key={r.key}
            $active={activeRanges.has(r.key)}
            onClick={() => toggleRange(r.key)}
          >
            {r.label}
          </FilterChip>
        ))}
      </FilterBar>
    </Toolbar>
  );
}

"use client";

import React, { useCallback, useState } from "react";
import { Button, Input } from "@/shared/ui";
import {
  ModalBackdrop,
  ModalCard,
  AddGameModalTitle,
  ModalActions,
  AddGameCoverPreview,
  AddGameCoverPreviewImg,
} from "./GameLibrary.styles";
import { RawgGameAutocompleteField } from "./RawgGameAutocompleteField";

export function AddGameModal({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, scoreStr: string) => void;
  onClose: () => void;
}) {
  const [draftName, setDraftName] = useState("");
  const [draftScore, setDraftScore] = useState("");
  const [pickedCoverUrl, setPickedCoverUrl] = useState<string | null>(null);

  const submit = useCallback(() => {
    const name = draftName.trim();
    if (!name) return;
    onAdd(name, draftScore);
  }, [draftName, draftScore, onAdd]);

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <AddGameModalTitle>Add Game</AddGameModalTitle>
        {pickedCoverUrl ? (
          <AddGameCoverPreview>
            <AddGameCoverPreviewImg
              src={pickedCoverUrl}
              alt={`Cover preview for ${draftName.trim() || "selected game"}`}
              width={76}
              height={43}
              decoding="async"
            />
          </AddGameCoverPreview>
        ) : null}
        <RawgGameAutocompleteField
          id="add-game-name"
          label="Game name"
          placeholder="Enter game name…"
          value={draftName}
          onValueChange={(v) => {
            setDraftName(v);
            setPickedCoverUrl(null);
          }}
          onPick={(hit) => {
            setDraftName(hit.name);
            setPickedCoverUrl(hit.image);
          }}
          autoFocus
          onEscapeWhenCollapsed={onClose}
          onEnterWhenCollapsed={submit}
          inputProps={{
            autoComplete: "off",
            autoCorrect: "off",
            spellCheck: false,
            "data-bwignore": true,
            "data-1p-ignore": true,
            "data-lpignore": "true",
          }}
        />
        <Input
          label="Score (optional)"
          id="add-game-score"
          value={draftScore}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || (/^\d+$/.test(v) && Number(v) <= 100)) setDraftScore(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onClose();
          }}
          placeholder="0–100"
          type="number"
          min={0}
          max={100}
          inputMode="numeric"
          autoComplete="off"
          data-bwignore
          data-1p-ignore
          data-lpignore="true"
        />
        <ModalActions>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!draftName.trim()} onClick={submit}>
            Add
          </Button>
        </ModalActions>
      </ModalCard>
    </ModalBackdrop>
  );
}

"use client";

import React from "react";
import { GuidanceBanner } from "@/shared/ui";
import { ImportSectionRoot } from "./GameLibrary.styles";
import { SteamImport } from "./SteamImport";
import { EpicImport } from "./EpicImport";
import { FileImport } from "./FileImport";
import { PasteImport } from "./PasteImport";

interface ImportSectionProps {
  handleImport: (text: string) => void;
  onHide: () => void;
}

export function ImportSection({ handleImport, onHide }: ImportSectionProps) {
  return (
    <ImportSectionRoot>
      <GuidanceBanner variant="info" dismissKey="library_import_guide" linkText="Importing guide" linkHref="/help#importing">
        Connect your gaming platforms or import a CSV / JSON / text file. Duplicates are
        automatically merged by game name. You can export your library from apps like
        Playnite, GOG Galaxy, or import directly from Steam.
      </GuidanceBanner>
      <SteamImport />
      <EpicImport />
      <FileImport handleImport={handleImport} />
      <PasteImport handleImport={handleImport} onHide={onHide} />
    </ImportSectionRoot>
  );
}

"use client";

import React, { useState } from "react";
import { GuidanceBanner, HashLink } from "@/shared/ui";
import {
  ImportPanel,
  ImportPanelHeader,
  ImportPanelChevron,
  ImportPanelBody,
} from "./GameLibrary.styles";
import { SteamImport } from "./SteamImport";
import { EpicImport } from "./EpicImport";
import { FileImport } from "./FileImport";

interface ImportSectionProps {
  handleImport: (text: string) => void;
}

export function ImportSection({ handleImport }: ImportSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <ImportPanel>
      <ImportPanelHeader onClick={() => setOpen((o) => !o)}>
        Import Games
        <ImportPanelChevron $open={open}>▾</ImportPanelChevron>
      </ImportPanelHeader>

      {open && (
        <ImportPanelBody>
          <GuidanceBanner
            variant="info"
            dismissKey="library_import_guide"
            linkText="Importing guide"
            linkHref="/help#importing"
          >
            Connect your gaming platforms or import a CSV / JSON / text file. Duplicates are
            automatically merged by game name. You can export your library from apps like Playnite,
            GOG Galaxy, or import directly from Steam.
          </GuidanceBanner>
          <HashLink
            href="/help#importing"
            style={{ fontSize: "0.8125rem", textDecoration: "underline" }}
          >
            Importing from apps guide
          </HashLink>
          <SteamImport />
          <EpicImport />
          <FileImport handleImport={handleImport} />
        </ImportPanelBody>
      )}
    </ImportPanel>
  );
}

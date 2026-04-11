// REMOVE ME — this file is unused dead code
"use client";

import React from "react";
import { StreamCursor, ThinkingLabel } from "./styles";

export function ThinkingDisplay({ text }: { text: string }) {
  const label = text || "Thinking...";
  return (
    <ThinkingLabel aria-hidden>
      {label}<StreamCursor />
    </ThinkingLabel>
  );
}

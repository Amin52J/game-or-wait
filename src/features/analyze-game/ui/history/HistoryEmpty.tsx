// REMOVE ME — this file is unused dead code
"use client";

import React from "react";
import { PageHeader, PageTitle } from "@/shared/ui";
import { Page, EmptyState } from "./styles";

interface HistoryEmptyProps {
  message: string;
}

export function HistoryEmpty({ message }: HistoryEmptyProps) {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Analysis history</PageTitle>
      </PageHeader>
      <EmptyState>{message}</EmptyState>
    </Page>
  );
}

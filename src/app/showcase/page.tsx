"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LibraryShowcasePage } from "@/features/library-showcase/ui/LibraryShowcasePage";
import styled from "styled-components";

const Loading = styled.p`
  margin: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-family: ${({ theme }) => theme.font.sans};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function ShowcaseGate() {
  const sp = useSearchParams();
  const id = sp.get("id")?.trim() ?? "";
  return <LibraryShowcasePage publicId={id} />;
}

export default function ShowcaseRoutePage() {
  return (
    <Suspense fallback={<Loading>Loading…</Loading>}>
      <ShowcaseGate />
    </Suspense>
  );
}

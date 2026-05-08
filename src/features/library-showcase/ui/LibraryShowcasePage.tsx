"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { getLibraryShowcaseByPublicId } from "@/shared/api/db";
import { getShowcaseShareUrl } from "@/shared/lib/showcaseShareUrl";
import type { Game } from "@/shared/types";
import { Icon, Toast } from "@/shared/ui";
import { fetchGameCover } from "@/entities/game/api/cover";
import { GameGrid } from "@/features/manage-library/ui/GameGrid";
import {
  countGameGridColumns,
  showcaseInfiniteScrollChunkSize,
} from "@/features/manage-library/ui/GameLibrary.utils";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  applyShowcaseDocumentMeta,
  clearShowcaseDocumentMeta,
} from "../lib/apply-showcase-document-meta";
import { possessiveShowcaseHeading } from "../lib/possessive-showcase-heading";
import { showcaseShareDescription } from "../lib/showcase-share-description";
import { sortShowcaseGamesToGames } from "../lib/sort-showcase-games";
import {
  ShowcaseRoot,
  ShowcaseHeaderSection,
  ShowcaseHeaderRow,
  ShowcaseIconLink,
  ShowcaseTitleBlock,
  ShowcaseHeading,
  ShowcaseEmpty,
  ShowcaseError,
  ShowcaseScrollSentinel,
  ShowcaseLoadingMore,
  ShowcaseGridMeasure,
  ShowcaseIconActions,
  ShowcaseIconButton,
} from "./LibraryShowcasePage.styles";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Horizontal padding-ish fallback when resize width reads 0 before layout. */
const SHOWCASE_WIDTH_FALLBACK_INSET_PX = 48;

function readInlineSizePx(entry: ResizeObserverEntry): number {
  const obs = entry.borderBoxSize?.[0];
  if (obs && typeof obs.inlineSize === "number") return obs.inlineSize;
  const cbs = entry.contentBoxSize?.[0];
  if (cbs && typeof cbs.inlineSize === "number") return cbs.inlineSize;
  return entry.contentRect.width;
}

export function LibraryShowcasePage({ publicId }: { publicId: string }) {
  const { user } = useAuth();
  const gridRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const gamesRef = useRef<Game[] | null>(null);
  const columnsRef = useRef(1);
  const lastMeasuredInlinePx = useRef<number | null>(null);

  const [games, setGames] = useState<Game[] | null>(null);
  const [ownerDisplayName, setOwnerDisplayName] = useState<string | null>(null);
  const [columnsPerRow, setColumnsPerRow] = useState(1);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [webShareSupported, setWebShareSupported] = useState(false);

  const showcaseVisibleInitRef = useRef<string | null>(null);
  const toastDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    if (toastDismissRef.current) clearTimeout(toastDismissRef.current);
    setToast({ msg, type });
    toastDismissRef.current = setTimeout(() => {
      setToast(null);
      toastDismissRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    setWebShareSupported(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    return () => {
      if (toastDismissRef.current) clearTimeout(toastDismissRef.current);
    };
  }, []);

  gamesRef.current = games;
  columnsRef.current = columnsPerRow;

  useEffect(() => {
    setToast(null);
    if (toastDismissRef.current) {
      clearTimeout(toastDismissRef.current);
      toastDismissRef.current = null;
    }
    showcaseVisibleInitRef.current = null;
  }, [publicId]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!UUID_RE.test(publicId)) {
        setGames(null);
        setOwnerDisplayName(null);
        setError(null);
        setLoading(false);
        setVisibleCount(0);
        return;
      }
      setLoading(true);
      setError(null);
      setGames(null);
      setOwnerDisplayName(null);
      setVisibleCount(0);
      try {
        const payload = await getLibraryShowcaseByPublicId(publicId);
        if (cancelled) return;
        if (!payload) {
          setGames(null);
          setOwnerDisplayName(null);
          setVisibleCount(0);
        } else {
          const sorted = sortShowcaseGamesToGames(payload.games);
          setGames(sorted);
          setOwnerDisplayName(payload.ownerDisplayName);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Could not load showcase.");
        setGames(null);
        setOwnerDisplayName(null);
        setVisibleCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  useLayoutEffect(() => {
    if (!games?.length) {
      lastMeasuredInlinePx.current = null;
      return;
    }
    const host = measureRef.current;
    if (!host) return;

    let raf = 0;

    function applyWidth(inlinePx: number) {
      const vw = window.innerWidth;
      const effective =
        inlinePx > 2 ? inlinePx : Math.max(0, vw - SHOWCASE_WIDTH_FALLBACK_INSET_PX);
      setColumnsPerRow((prev) => {
        const next = countGameGridColumns(effective, vw);
        return prev === next ? prev : next;
      });
    }

    function onResize(entries: ResizeObserverEntry[]) {
      const entry = entries[0];
      if (!entry) return;
      const inline = readInlineSizePx(entry);
      const prev = lastMeasuredInlinePx.current;
      if (prev !== null && Math.abs(inline - prev) < 0.5) return;
      lastMeasuredInlinePx.current = inline;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => applyWidth(inline));
    }

    const ro = new ResizeObserver(onResize);
    ro.observe(host, { box: "border-box" });

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const inline = host.getBoundingClientRect().width;
      lastMeasuredInlinePx.current = inline;
      applyWidth(inline);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      lastMeasuredInlinePx.current = null;
    };
  }, [games, publicId]);

  useEffect(() => {
    if (!games || games.length === 0) {
      setVisibleCount(0);
      return;
    }
    const chunk = showcaseInfiniteScrollChunkSize(columnsPerRow);
    if (showcaseVisibleInitRef.current !== publicId) {
      showcaseVisibleInitRef.current = publicId;
      setVisibleCount(() => {
        const next = Math.min(chunk, games.length);
        return next;
      });
      return;
    }
    setVisibleCount((v) => {
      const next = Math.min(games.length, Math.max(v, Math.min(chunk, games.length)));
      return next === v ? v : next;
    });
  }, [games, publicId, columnsPerRow]);

  const hasMore = Boolean(games && games.length > 0 && visibleCount < games.length);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((c) => {
          const g = gamesRef.current;
          if (!g?.length || c >= g.length) return c;
          const chunk = showcaseInfiniteScrollChunkSize(columnsRef.current);
          const next = Math.min(c + chunk, g.length);
          return next === c ? c : next;
        });
      },
      { root: null, rootMargin: "320px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, publicId]);

  useEffect(() => {
    if (!UUID_RE.test(publicId) || loading || error || games === null) {
      return undefined;
    }

    let cancelled = false;

    void (async () => {
      const canonicalUrl = getShowcaseShareUrl(publicId);
      const heading = possessiveShowcaseHeading(ownerDisplayName);
      const ogTitle = `${heading} · GameOrWait`;
      const description = showcaseShareDescription(games.length);

      const topNames = games.slice(0, 5).map((g) => g.name);
      const urls: string[] = [];
      for (const name of topNames) {
        if (cancelled) return;
        try {
          const { image } = await fetchGameCover(name);
          if (image) urls.push(image);
        } catch {
          /* ignore */
        }
      }

      if (cancelled) return;

      applyShowcaseDocumentMeta({
        documentTitle: ogTitle,
        ogTitle,
        description,
        canonicalUrl,
        imageUrls: urls,
      });
    })();

    return () => {
      cancelled = true;
      clearShowcaseDocumentMeta();
    };
  }, [loading, error, publicId, games, ownerDisplayName]);

  const copyShareLink = useCallback(async () => {
    if (!UUID_RE.test(publicId)) return;
    try {
      await navigator.clipboard.writeText(getShowcaseShareUrl(publicId));
      showToast("Link copied", "success");
    } catch {
      showToast("Could not copy — try the address bar.", "error");
    }
  }, [publicId, showToast]);

  const nativeShare = useCallback(async () => {
    if (!UUID_RE.test(publicId) || games === null) return;
    const url = getShowcaseShareUrl(publicId);
    try {
      await navigator.share({
        title: `${possessiveShowcaseHeading(ownerDisplayName)} · GameOrWait`,
        text: showcaseShareDescription(games.length),
        url,
      });
    } catch (e) {
      const err = e as { name?: string };
      if (err?.name === "AbortError") return;
    }
  }, [publicId, games, ownerDisplayName]);

  const backLabel = user ? "Back to app" : "Back to GameOrWait";
  const pageTitle = possessiveShowcaseHeading(ownerDisplayName);
  const showShareChrome = UUID_RE.test(publicId) && !loading && !error && games !== null;
  const nativeShareAvailable = showShareChrome && webShareSupported;
  const pageSlice = games ? games.slice(0, visibleCount) : [];

  return (
    <ShowcaseRoot>
      <ShowcaseHeaderSection>
        <ShowcaseHeaderRow>
          <ShowcaseIconLink href="/" aria-label={backLabel} title={backLabel}>
            <Icon name="chevron-left" size={18} />
          </ShowcaseIconLink>
          <ShowcaseTitleBlock>
            <ShowcaseHeading title={pageTitle}>{pageTitle}</ShowcaseHeading>
          </ShowcaseTitleBlock>
          {showShareChrome ? (
            <ShowcaseIconActions>
              <ShowcaseIconButton
                type="button"
                onClick={() => void copyShareLink()}
                aria-label="Copy link"
                title="Copy link"
              >
                <Icon name="copy" size={18} />
              </ShowcaseIconButton>
              {nativeShareAvailable ? (
                <ShowcaseIconButton
                  type="button"
                  onClick={() => void nativeShare()}
                  aria-label="Share"
                  title="Share"
                >
                  <Icon name="share" size={18} />
                </ShowcaseIconButton>
              ) : null}
            </ShowcaseIconActions>
          ) : null}
        </ShowcaseHeaderRow>
      </ShowcaseHeaderSection>

      {loading ? (
        <ShowcaseEmpty aria-live="polite">Loading…</ShowcaseEmpty>
      ) : error ? (
        <ShowcaseError role="alert">{error}</ShowcaseError>
      ) : !UUID_RE.test(publicId) || games === null ? (
        <ShowcaseEmpty>This showcase link is invalid or no longer exists.</ShowcaseEmpty>
      ) : games.length === 0 ? (
        <ShowcaseEmpty>This library is empty.</ShowcaseEmpty>
      ) : (
        <ShowcaseGridMeasure ref={measureRef}>
          <GameGrid gridRef={gridRef} pageGames={pageSlice} totalGames={games.length} />
          {hasMore ? (
            <>
              <ShowcaseScrollSentinel ref={sentinelRef} aria-hidden />
              <ShowcaseLoadingMore aria-live="polite">Loading more…</ShowcaseLoadingMore>
            </>
          ) : null}
        </ShowcaseGridMeasure>
      )}
      {toast ? (
        <Toast $type={toast.type} role="status" aria-live="polite">
          {toast.msg}
        </Toast>
      ) : null}
    </ShowcaseRoot>
  );
}

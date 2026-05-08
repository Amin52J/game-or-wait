import { PUBLIC_SITE_ORIGIN } from "@/shared/lib/publicSiteOrigin";

const ATTR = "[data-showcase-meta='dynamic']";

const FALLBACK_OG_IMAGE = `${PUBLIC_SITE_ORIGIN}/og-image.png`;

function removeDynamicMetaTags(): void {
  document.head.querySelectorAll(ATTR).forEach((el) => el.remove());
}

function upsertUniqueMeta(attrName: "name" | "property", key: string, content: string): void {
  const sel =
    attrName === "property"
      ? `${ATTR}[property="${key.replace(/"/g, '\\"')}"]`
      : `${ATTR}[name="${key.replace(/"/g, '\\"')}"]`;
  let el = document.head.querySelector(sel) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.dataset.showcaseMeta = "dynamic";
    el.setAttribute(attrName, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string): void {
  const sel = `${ATTR}[rel="${rel.replace(/"/g, '\\"')}"]`;
  let el = document.head.querySelector(sel) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.dataset.showcaseMeta = "dynamic";
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setOgImages(urls: string[]): void {
  document.head.querySelectorAll(`meta[property="og:image"]${ATTR}`).forEach((e) => e.remove());
  const list = urls.filter(Boolean).length ? urls.slice(0, 5) : [FALLBACK_OG_IMAGE];
  for (const u of list) {
    const el = document.createElement("meta");
    el.dataset.showcaseMeta = "dynamic";
    el.setAttribute("property", "og:image");
    el.setAttribute("content", u);
    document.head.appendChild(el);
  }
}

export function clearShowcaseDocumentMeta(): void {
  removeDynamicMetaTags();
}

/**
 * Updates document title + social meta for the showcase (helps in-app preview; crawlers rely on CDN HTML injection).
 */
export function applyShowcaseDocumentMeta(opts: {
  documentTitle: string;
  ogTitle: string;
  description: string;
  canonicalUrl: string;
  imageUrls: string[];
}): void {
  removeDynamicMetaTags();

  document.title = opts.documentTitle;

  upsertUniqueMeta("name", "description", opts.description);

  upsertLink("canonical", opts.canonicalUrl);

  upsertUniqueMeta("property", "og:title", opts.ogTitle);
  upsertUniqueMeta("property", "og:description", opts.description);
  upsertUniqueMeta("property", "og:type", "website");
  upsertUniqueMeta("property", "og:url", opts.canonicalUrl);
  upsertUniqueMeta("property", "og:site_name", "GameOrWait");

  upsertUniqueMeta("name", "twitter:card", "summary_large_image");
  upsertUniqueMeta("name", "twitter:title", opts.ogTitle);
  upsertUniqueMeta("name", "twitter:description", opts.description);

  upsertUniqueMeta(
    "name",
    "twitter:image",
    opts.imageUrls.filter(Boolean)[0] ?? FALLBACK_OG_IMAGE,
  );

  setOgImages(opts.imageUrls);
}

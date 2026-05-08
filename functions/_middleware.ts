/**
 * Injects showcase-specific `<title>` and Open Graph / Twitter meta into the static HTML returned
 * for `/showcase` requests. Needed because `next build` emits a single generic HTML shell.
 *
 * Cloudflare Pages: set secrets `SUPABASE_URL` + `SUPABASE_ANON_KEY` (same anon key your app uses).
 * Supabase: deploy `showcase-meta` function (`supabase functions deploy showcase-meta`).
 */
interface ShowcaseEnv {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

const SITE_ORIGIN = "https://gameorwait.com";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-image.png`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SocialMetaPayload {
  title: string;
  description: string;
  canonicalUrl: string;
  images?: string[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function defaultShowcaseMeta(pageUrl: string): SocialMetaPayload {
  return {
    title: "Library showcase · GameOrWait",
    description:
      "Browse read-only libraries shared by GameOrWait players — ranked by taste score.",
    canonicalUrl: pageUrl,
    images: [DEFAULT_IMAGE],
  };
}

function injectSocialMeta(html: string, meta: SocialMetaPayload): string {
  const imgs =
    meta.images && meta.images.length > 0 ? meta.images.slice(0, 5) : [DEFAULT_IMAGE];
  const ogImageTags = imgs
    .map((href) => `<meta property="og:image" content="${escapeHtml(href)}">`)
    .join("\n");

  const block = `
<meta name="description" content="${escapeHtml(meta.description)}">
<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}">
<meta property="og:title" content="${escapeHtml(meta.title)}">
<meta property="og:description" content="${escapeHtml(meta.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}">
<meta property="og:site_name" content="GameOrWait">
${ogImageTags}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(meta.title)}">
<meta name="twitter:description" content="${escapeHtml(meta.description)}">
<meta name="twitter:image" content="${escapeHtml(imgs[0]!)}">
`.trim();

  let out = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

  out = out.replace(/<meta[^>]*name\s*=\s*["']description["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]*property\s*=\s*["']og:[^'"]+["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]*name\s*=\s*["']twitter:[^'"]+["'][^>]*>/gi, "");
  out = out.replace(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi, "");

  const headOpen = /<head[^>]*>/i.exec(out);
  if (headOpen && headOpen.index !== undefined) {
    const i = headOpen.index + headOpen[0].length;
    return `${out.slice(0, i)}\n${block}\n${out.slice(i)}`;
  }
  return out;
}

async function fetchShowcaseMeta(
  env: ShowcaseEnv,
  publicId: string,
): Promise<SocialMetaPayload | null> {
  const base = env.SUPABASE_URL?.replace(/\/$/, "");
  const key = env.SUPABASE_ANON_KEY;
  if (!base || !key) return null;

  const url = `${base}/functions/v1/showcase-meta?public_id=${encodeURIComponent(publicId)}`;
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as SocialMetaPayload;
  if (!data.title || !data.description || !data.canonicalUrl) return null;
  return data;
}

export async function onRequest(context: {
  request: Request;
  env: ShowcaseEnv;
  next: () => Promise<Response>;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/$/, "") || "/";
  if (path !== "/showcase") {
    return context.next();
  }

  const res = await context.next();
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/html")) {
    return res;
  }

  const html = await res.text();
  const publicId = url.searchParams.get("id")?.trim() ?? "";
  const pageUrl = `${SITE_ORIGIN}/showcase${url.search}`;

  let meta: SocialMetaPayload;
  if (UUID_RE.test(publicId)) {
    const remote = await fetchShowcaseMeta(context.env, publicId);
    meta = remote
      ? {
          ...remote,
          images:
            remote.images && remote.images.length > 0 ? remote.images : [DEFAULT_IMAGE],
        }
      : {
          ...defaultShowcaseMeta(pageUrl),
          canonicalUrl: pageUrl,
        };
  } else {
    meta = defaultShowcaseMeta(pageUrl);
  }

  const nextHtml = injectSocialMeta(html, meta);
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  return new Response(nextHtml, { status: res.status, headers });
}

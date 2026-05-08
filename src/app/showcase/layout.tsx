import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Base metadata; Cloudflare `functions/_middleware.ts` overwrites per-share on production. */
export const metadata: Metadata = {
  title: "Library showcase",
  description:
    "Browse read-only libraries shared by GameOrWait players — ranked by taste score.",
  alternates: {
    canonical: "/showcase",
  },
  openGraph: {
    title: "Library showcase — GameOrWait",
    description:
      "Browse read-only libraries shared by GameOrWait players — ranked by taste score.",
    url: "https://gameorwait.com/showcase",
    siteName: "GameOrWait",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "GameOrWait" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Library showcase — GameOrWait",
    description:
      "Browse read-only libraries shared by GameOrWait players — ranked by taste score.",
    images: ["/og-image.png"],
  },
};

export default function ShowcaseLayout({ children }: { children: ReactNode }) {
  return children;
}

import { PUBLIC_SITE_ORIGIN } from "./publicSiteOrigin";

export function getShowcaseShareUrl(publicId: string): string {
  const id = publicId.trim();
  return `${PUBLIC_SITE_ORIGIN}/showcase?id=${encodeURIComponent(id)}`;
}

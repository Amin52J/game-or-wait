export const SHOWCASE_ROUTE = "/showcase";

function trimTrailingSlashes(pathname: string | null | undefined): string {
  if (pathname == null || pathname === "") return "";
  let p = pathname.trim();
  while (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/** Normalizes Next/browser pathnames (e.g. strips trailing slash except for "/"). */
export function normalizeShowcasePath(pathname: string | null | undefined): string {
  return trimTrailingSlashes(pathname);
}

export function isPublicShowcasePath(pathname: string | null | undefined): boolean {
  return trimTrailingSlashes(pathname) === SHOWCASE_ROUTE;
}

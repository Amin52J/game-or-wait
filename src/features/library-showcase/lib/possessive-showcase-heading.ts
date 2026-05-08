/** Heading on the public library showcase, e.g. "Alex's library" or "James' library". */
export function possessiveShowcaseHeading(ownerDisplayName: string | null | undefined): string {
  const name = ownerDisplayName?.trim();
  if (!name) return "Library showcase";
  const endsWithS = /s$/i.test(name);
  return endsWithS ? `${name}' library` : `${name}'s library`;
}

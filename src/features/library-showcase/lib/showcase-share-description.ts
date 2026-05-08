export function showcaseShareDescription(gameCount: number): string {
  if (gameCount <= 0) {
    return "Read-only library showcase on GameOrWait.";
  }
  const g = `${gameCount} game${gameCount === 1 ? "" : "s"}`;
  return `${g} · Read-only library showcase sorted by taste score on GameOrWait.`;
}

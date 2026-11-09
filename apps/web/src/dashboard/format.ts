/** Shared dashboard formatting helpers. */
export function formatDate(ts: number | null): string {
  if (!ts) return "never";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

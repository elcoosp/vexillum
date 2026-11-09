/**
 * Extracts collections and variant cells from the badge collection document.
 */
import type { El } from "./dom";
import { attr, classes, children, descendants, textOf } from "./dom";

export interface CollectionInfo {
  id: string; // "c01"
  slug: string; // "foundational"
  title: string; // "FOUNDATIONAL" → "Foundational"
  description: string;
}

export interface VariantCell {
  id: string; // "c01-01"
  collection: string; // "c01"
  index: number; // 1
  title: string; // "Two-tone split"
  badge: El;
}

const KNOWN_SLUGS: Record<string, string> = {
  C01: "foundational",
  C02: "premium",
  C03: "technical",
  C04: "luminous",
  C05: "brutalist",
  C06: "editorial",
  C07: "industrial",
  C08: "organic",
  C09: "terminal",
  C10: "system",
  C11: "experimental",
  C12: "kinetic",
  C13: "data",
  C14: "social",
  C15: "status",
  C16: "minimal",
  C17: "slab",
  C18: "frame",
  C19: "capsule",
  C20: "tab",
  C21: "ruled",
  C22: "ledger",
  C23: "facet",
  C24: "ring",
  C25: "cap",
  C26: "contour",
  C27: "crop",
  C28: "rail",
  C29: "ticket",
  C30: "stack",
  C31: "float",
  C32: "spark",
  C33: "stacked",
  C34: "stat",
};

const VARIANT_ID_RE = /^c(\d{2})-(\d{2})$/;

/**
 * Walks the document body: every `.collection` section holds a header
 * (number + title + description) and a grid of `.variant` cells.
 */
export function extractCollections(root: El): CollectionInfo[] {
  const out: CollectionInfo[] = [];
  for (const section of descendants(root)) {
    if (!classes(section).includes("collection")) continue;
    // section id like "c01" or "a"
    const id = (attr(section, "id") ?? "").toLowerCase();
    let normalized = id;
    if (!/^c\d{2}$/.test(id)) {
      // older naming: single letters; infer from header comment order later
      normalized = "";
    }
    const header = children(section).find((c) => c.tagName === "div" && classes(c).includes("collection-header"));
    let title = "";
    let number = "";
    let description = "";
    if (header) {
      for (const part of children(header)) {
        const cs = classes(part);
        if (cs.includes("collection-number")) number = textOf(part);
        else if (cs.includes("collection-title")) title = textOf(part);
        else if (cs.includes("collection-desc")) description = textOf(part);
      }
    }
    // normalize id from the number token "C01 · 01" or "Collection C01 / 01"
    const numMatch = (number + " " + title).match(/C(\d{2})/i);
    if (!normalized && numMatch) normalized = `c${numMatch[1]}`;
    if (!normalized) continue;
    const slug = KNOWN_SLUGS[normalized.toUpperCase()] ?? title.toLowerCase().replace(/\s+/g, "-");
    out.push({
      id: normalized,
      slug,
      title: title.replace(/C\d{2}\s*·\s*/i, "").trim() || slug,
      description: description.trim(),
    });
  }
  return out;
}

/** Finds every `.variant` cell with a badge inside. */
export function extractVariants(root: El): VariantCell[] {
  const out: VariantCell[] = [];
  for (const cell of descendants(root)) {
    if (!classes(cell).includes("variant") && !classes(cell).includes("cell")) continue;
    // title element precedes the badge in some generators; find both
    const titleEl = children(cell).find(
      (c) => classes(c).includes("variant-title") || classes(c).includes("cap"),
    );
    const badge = descendants(cell).find((d) => classes(d).some((c) => VARIANT_ID_RE.test(c)));
    if (!badge) continue;
    const id = classes(badge).find((c) => VARIANT_ID_RE.test(c))!;
    const m = id.match(VARIANT_ID_RE)!;
    const title = titleEl ? textOf(titleEl).replace(/^[\dIVX]+\s*[·.-]\s*/, "").trim() : id;
    out.push({
      id,
      collection: `c${m[1]}`,
      index: Number(m[2]),
      title,
      badge,
    });
  }
  // document order is preserved (dedupe by id defensively)
  const seen = new Set<string>();
  return out.filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)));
}

/**
 * Icon library client: the icondata catalog (33,987 icons across 19 sets)
 * plus the 97 curated brands. Set path data ships as per-set lazy chunks
 * (generated — see scripts/gen-icondata-catalog.py) so the main bundle stays
 * small; chunks load on demand and are cached for the session.
 *
 * Slug contract (mirrors the API):
 * - brand slugs are bare (`github`, `docker`) — brand colors;
 * - icondata slugs are `<set>-<kebab-name>` (`mdi-account`, `si-github`,
 *   `lu-git-branch`) — rendered with `currentColor` unless overridden.
 */
import { LOADERS, SET_META, type IconSetMeta } from "@/lib/icon-data";
import type { IconMeta } from "@/lib/icon-catalog-full";

export type { IconMeta };

export interface IconEntry {
  /** viewBox */
  v: string;
  /** inner SVG markup */
  d: string;
  /** fill (absent → currentColor) */
  f?: string;
  /** stroke + friends (stroke-based sets like Lucide/Feather) */
  st?: string;
  sw?: string;
  slc?: string;
  slj?: string;
}

export type { IconSetMeta };

const SET_IDS = new Set(SET_META.map((s) => s.id));

const setCache = new Map<string, Promise<Record<string, IconEntry>>>();

/** Loads (and caches) one set's path data chunk. */
export function loadIconSet(setId: string): Promise<Record<string, IconEntry>> {
  let p = setCache.get(setId);
  if (!p) {
    const loader = LOADERS[setId];
    p = loader ? loader().then((m) => m.DATA) : Promise.resolve({});
    setCache.set(setId, p);
  }
  return p;
}

let slugSetsPromise: Promise<Record<string, string>> | null = null;

/** Loads the slug → set index used by the "All sets" search scope. */
export function loadSlugSets(): Promise<Record<string, string>> {
  slugSetsPromise ??= import("@/lib/icon-data/slugs").then((m) => m.SLUG_SETS);
  return slugSetsPromise;
}

/** True when the slug carries a known icondata set prefix (`mdi-account`). */
export function isIcondataSlug(slug: string): boolean {
  const dash = slug.indexOf("-");
  if (dash <= 0) return false;
  return SET_IDS.has(slug.slice(0, dash));
}

/** The set id of an icondata slug, or null for brand slugs. */
export function setOfSlug(slug: string): string | null {
  const dash = slug.indexOf("-");
  if (dash <= 0) return null;
  const set = slug.slice(0, dash);
  return SET_IDS.has(set) ? set : null;
}

/** `mdi-ab-testing` → `ab-testing` (chunk keys are unprefixed). */
export function unprefixedSlug(slug: string): string {
  const set = setOfSlug(slug);
  return set ? slug.slice(set.length + 1) : slug;
}

export { SET_META };

// ---------------------------------------------------------------------------
// Brand library (Simple Icons via simpleicons-rs on the server): the eager
// catalog/paths cover template defaults + a popular core; the FULL data
// ships as lazy chunks and loads on demand (picker open / preview miss).
// ---------------------------------------------------------------------------

let brandCatalogPromise: Promise<IconMeta[]> | null = null;

/** Loads (and caches) the full brand metadata catalog (all Simple Icons). */
export function loadBrandCatalog(): Promise<IconMeta[]> {
  brandCatalogPromise ??= import("@/lib/icon-catalog-full").then((m) => m.BRAND_ICONS_FULL);
  return brandCatalogPromise;
}

let brandPathsFullPromise: Promise<Record<string, string>> | null = null;

/** Loads (and caches) the full brand path-data record (all Simple Icons). */
export function loadBrandPathsFull(): Promise<Record<string, string>> {
  brandPathsFullPromise ??= import("@/lib/icon-paths-full").then((m) => m.ICON_PATHS_FULL);
  return brandPathsFullPromise;
}

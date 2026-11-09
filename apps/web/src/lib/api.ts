/**
 * API configuration + typed access to the real backend when it is reachable.
 * The SPA stays fully functional offline: every dashboard number falls back
 * to the deterministic demo generator unless a live fetch succeeds.
 */
import { BadgeCloudClient, type BadgeUrlOptions } from "@vexillum/sdk";

export const API_BASE: string = import.meta.env.VITE_API_BASE ?? "";

/** True when a real API origin is configured for "render via API" mode. */
export const hasApiBase = API_BASE.length > 0;

export const apiClient = new BadgeCloudClient(API_BASE);

export interface RealUsage {
  requestsThisWindow: number;
  rpm: number;
}

/**
 * Fetches /v1/usage with a live key. Returns null on any failure
 * (no network in tests, API not running, 4xx) — callers then show demo data.
 */
export async function fetchRealUsage(key: string): Promise<RealUsage | null> {
  if (!hasApiBase || !key) return null;
  try {
    const usage = await apiClient.usage(key);
    return { requestsThisWindow: usage.requestsThisWindow, rpm: usage.rpm };
  } catch {
    return null;
  }
}

/**
 * POSTs a brand color to /v1/themes (WCAG guardrail endpoint).
 * Returns null when the API is not configured.
 */
export async function fetchBrandTheme(
  brand: string,
  key: string,
): Promise<{ colorCorrected: boolean; colors: Record<string, string> } | null> {
  if (!hasApiBase || !key) return null;
  try {
    return await apiClient.createTheme(brand, key);
  } catch {
    return null;
  }
}

export interface PopularStats {
  /** Total requests across tracked variants. */
  total: number;
  /** Variant id → request count (top 100 by demand). */
  variants: Record<string, number>;
}

/**
 * Fetches `GET /v1/stats/popular?limit=100` — which badges are the most
 * used. Returns null on any failure (API not configured / unreachable):
 * callers then hide the usage sort + render chips gracefully.
 */
export async function fetchPopular(): Promise<PopularStats | null> {
  if (!hasApiBase) return null;
  try {
    const res = await fetch(`${API_BASE}/v1/stats/popular?limit=100`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      total?: number;
      variants?: Array<{ variant: string; renders: number }>;
    };
    if (!Array.isArray(json.variants)) return null;
    const variants: Record<string, number> = {};
    for (const row of json.variants) {
      if (typeof row?.variant === "string" && typeof row?.renders === "number") {
        variants[row.variant] = row.renders;
      }
    }
    return { total: json.total ?? 0, variants };
  } catch {
    return null;
  }
}

export function healthUrl(): string {
  return `${API_BASE || "https://your-api.example.com"}/health`;
}

/**
 * The font families bundled by the render engine (crates/render/src/fonts.rs).
 * `slug` is the `?font=` URL value (lowercase kebab-case); `family` is the CSS
 * font-family used for live client-side previews; `label` is display copy.
 */
export const BUNDLED_FONTS = [
  { slug: "inter", label: "Inter", family: "Inter" },
  { slug: "jetbrains-mono", label: "JetBrains Mono", family: "'JetBrains Mono'" },
  { slug: "instrument-serif", label: "Instrument Serif", family: "'Instrument Serif'" },
  { slug: "space-mono", label: "Space Mono", family: "'Space Mono'" },
] as const;

export type BadgeFont = (typeof BUNDLED_FONTS)[number]["slug"];

/** Type guard for `?font=` slugs (also narrows away the "source" sentinel). */
export function isBadgeFont(value: string | null | undefined): value is BadgeFont {
  return BUNDLED_FONTS.some((f) => f.slug === value);
}

/** CSS font-family for a font slug (bundled lookup first, passthrough otherwise). */
export function badgeFontFamily(font: string): string {
  return BUNDLED_FONTS.find((f) => f.slug === font)?.family ?? `'${font}'`;
}

export interface WebBadgeUrlOptions extends BadgeUrlOptions {
  /**
   * Force a font family on the server render: a bundled slug (`inter`,
   * `jetbrains-mono`, `instrument-serif`, `space-mono`) or any Google Fonts
   * catalog slug (1,959 families — validated server-side; unknown → 400).
   * Omit → source design.
   */
  font?: string;
  /** Custom semantic seed (hex, with or without `#`) — `?seed=`. */
  seed?: string;
  /**
   * Second, independent seed for the VALUE segment (hex) — `?seed2=`.
   * The value side re-colors while label/icon sides keep the base seed.
   */
  seed2?: string;
  /** Surface mode for the semantic ramp — `?mode=light|dark`. */
  mode?: "light" | "dark";
}

/**
 * Font/seed-aware badge URL: the SDK client's exact grammar plus `font=`,
 * `seed=`, `seed2=` and `mode=` appended ONLY when non-default, so canonical
 * URLs stay minimal (same encoding style as the SDK).
 */
export function badgeUrl(
  collection: string,
  variant: string,
  label: string,
  value: string,
  options: WebBadgeUrlOptions = {},
): string {
  const { font, seed, seed2, mode, ...rest } = options;
  const base = apiClient.badgeUrl(collection, variant, label, value, rest);
  const extras: string[] = [];
  if (font) extras.push(`font=${encodeURIComponent(font)}`);
  if (seed) extras.push(`seed=${encodeURIComponent(seed)}`);
  if (seed2) extras.push(`seed2=${encodeURIComponent(seed2)}`);
  if (mode && mode !== "light") extras.push(`mode=${mode}`);
  if (extras.length === 0) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${extras.join("&")}`;
}

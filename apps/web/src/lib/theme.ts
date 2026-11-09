/**
 * Client-side theme resolution for the SPA.
 *
 * `@vexillum/themes` ships the full Rust-parity semantic resolver (same
 * OKLCH math, same `oklch(L C H)` values the API renders — enforced by the
 * shared `fixtures/semantic.json` in the themes package). One seed drives
 * the entire vocabulary (surfaces, borders, text, accents, status), and the
 * mode flips the surface ramps — so preview colors are byte-identical to
 * server output for any (seed, mode) pair.
 */
import * as themesPkg from "@vexillum/themes";
import { contrastRatio as _contrastRatio } from "@vexillum/themes";

type ThemesModule = typeof themesPkg & {
  semanticVars?: (seed: string, mode: "light" | "dark") => Record<string, string>;
  semanticVarsDuo?: (
    seed: string,
    valueSeed: string | null | undefined,
    mode: "light" | "dark",
  ) => Record<string, string>;
  SEMANTIC_PRESET_SEEDS?: ReadonlyArray<readonly [string, string]>;
  semanticPresetSeed?: (name: string) => string | null;
  parseSemanticSeed?: (value: string) => { l: number; c: number; h: number } | null;
};

const pkg = themesPkg as ThemesModule;

// ------------------------------------------------------------------ presets

export interface SemanticPreset {
  name: string;
  seed: string;
}

/** The eight seed presets (the design source's swatch row, v4 aliases kept). */
export const SEMANTIC_PRESETS: SemanticPreset[] = (pkg.SEMANTIC_PRESET_SEEDS ?? []).map(
  ([name, seed]) => ({ name, seed }),
);

/** Resolves a preset name (incl. v4 aliases) to its seed hex; null otherwise. */
export function presetSeedHex(name: string): string | null {
  if (!name || name === "source") return null;
  if (typeof pkg.semanticPresetSeed === "function") return pkg.semanticPresetSeed(name);
  return SEMANTIC_PRESETS.find((p) => p.name === name)?.seed ?? null;
}

/** Normalizes any seed-ish string (`#abc`, `ec4899`) to `#ec4899`, or null. */
export function normalizeSeed(input: string): string | null {
  const v = input.trim().replace(/^%23/, "").replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(v)) return null;
  const full = v.length === 3 ? v[0] + v[0] + v[1] + v[1] + v[2] + v[2] : v;
  return `#${full.toLowerCase()}`;
}

/**
 * The full resolved semantic palette for a seed + mode — byte-identical to
 * what `?seed=&mode=` renders server-side (the shared fixture pins both
 * engines). Returns null for an unparseable seed.
 */
export function semanticVars(seed: string, mode: "light" | "dark"): Record<string, string> | null {
  if (typeof pkg.semanticVars === "function") {
    try {
      return pkg.semanticVars(seed, mode);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * The base palette plus the value-side `vx-v-*` family for a second seed —
 * the preview mirror of `?seed2=`. Falls back to the base seed's own values
 * when no value seed is given (the server overlays the family either way),
 * so the value-segment `var(--vx-v-*, fallback)` references resolve to the
 * seeded colors in every state. Returns null for an unparseable base seed.
 */
export function semanticVarsDuo(
  seed: string,
  valueSeed: string | null | undefined,
  mode: "light" | "dark",
): Record<string, string> | null {
  if (typeof pkg.semanticVarsDuo === "function") {
    try {
      return pkg.semanticVarsDuo(seed, valueSeed, mode);
    } catch {
      return null;
    }
  }
  return semanticVars(seed, mode);
}

/**
 * Effective seed for a picker state. The custom seed only applies while the
 * picker is actually in `"custom"` mode — a named preset always resolves to
 * its OWN seed (so picking a preset after a custom color visibly switches
 * the preview). Unknown names (e.g. a stale `?theme=source` deep link) fall
 * back to null and the caller decides the default.
 */
export function effectiveSeed(
  presetName: string,
  customSeed?: string | null,
): string | null {
  if (presetName === "custom") {
    return normalizeSeed(customSeed ?? "") ?? themesPkg.SEMANTIC_DEFAULT_SEED;
  }
  return presetSeedHex(presetName);
}

export { relativeLuminance } from "@vexillum/themes";
export const contrastRatio = _contrastRatio;

// ------------------------------------------------------------- picker state

/** What a themed render needs: seed + surface mode (+ optional value seed). */
export interface SemanticThemeSpec {
  seed: string;
  mode: "light" | "dark";
  /**
   * Second, independent seed for the VALUE segment (`?seed2=`). Absent =
   * the value side rides the base seed — pixel-identical to a single-seed
   * render.
   */
  valueSeed?: string;
}

/** The theme picker's state: a preset name or "custom". */
export interface SemanticPresetState {
  name: string;
  customSeed?: string;
  /** Optional independent value-segment seed (hex) — `?seed2=`. */
  customSeed2?: string;
  dark: boolean;
}

/**
 * Effective preview spec for a picker state. Presets resolve to their own
 * seeds; custom mode resolves the picked hex; unknown names resolve to null.
 * The value seed (when picked) applies on top of ANY base — preset or custom
 * — exactly like the API's `?seed2=`.
 */
export function semanticSpecFor(state: SemanticPresetState): SemanticThemeSpec | null {
  const seed = effectiveSeed(state.name, state.customSeed);
  if (!seed) return null;
  return {
    seed,
    mode: state.dark ? "dark" : "light",
    ...(state.customSeed2 ? { valueSeed: normalizeSeed(state.customSeed2) ?? undefined } : {}),
  };
}

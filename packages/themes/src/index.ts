/**
 * TS mirror of crates/theme: the frozen token vocabulary, WCAG guardrail,
 * and the six launch presets.
 *
 * `resolveThemeTokens` is a faithful port of the Rust `preset_theme` path —
 * the same OKLCH math (Ottosson OKLab, chroma-reduction gamut mapping), the
 * same guardrail steps, the same `oklch(L C H)` serialization — so client
 * previews resolve to the *same colors* the API renders. The earlier hex
 * approximation diverged badly: light label-rail inks leaked onto badges
 * whose text sits on transparent/white surfaces (looked semi-transparent)
 * and gradient ramps collapsed to gray.
 */

export const TOKENS = [
  "label-bg",
  "label-fg",
  "value-bg",
  "value-fg",
  "label-ink",
  "value-ink",
  "border",
  "divider",
  "accent",
  "accent-fg",
  "icon-color",
  // gradient ramps (crates/theme derives these from value-bg/label-bg)
  "g-from",
  "g-to",
  "gl-from",
  "gl-to",
] as const;

export type TokenName = (typeof TOKENS)[number];
export type ThemeTokens = Partial<Record<TokenName, string>> & Record<string, string | undefined>;

// ------------------------------------------------------------ WCAG (sRGB hex)

/** WCAG 2.1 relative luminance of an sRGB color. */
export function relativeLuminance(rgb: [number, number, number]): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}

/** WCAG contrast ratio in 1..=21. */
export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Parses `#rgb`/`#rrggbb` to an sRGB triplet. */
export function parseHex(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1];
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Guardrail (client mirror): dark/white ink pick for a background. */
export function contrastText(bg: string): "#ffffff" | "#111827" {
  const rgb = parseHex(bg);
  if (!rgb) return "#111827";
  const white = contrastRatio(rgb, [255, 255, 255]);
  const dark = contrastRatio(rgb, [17, 24, 39]);
  return white >= dark ? "#ffffff" : "#111827";
}

/** The value-fg correction flag a brand theme would report. */
export function needsCorrection(brandBg: string): boolean {
  const rgb = parseHex(brandBg);
  if (!rgb) return true;
  return (
    contrastRatio(rgb, [255, 255, 255]) < 4.5 && contrastRatio(rgb, [17, 24, 39]) < 4.5
  );
}

export interface PresetInfo {
  name: string;
  /** preview hex approximations for the SPA swatches */
  swatch: string;
}

export const PRESETS: PresetInfo[] = [
  { name: "slate", swatch: "#64748b" },
  { name: "blue", swatch: "#3b82f6" },
  { name: "violet", swatch: "#8b5cf6" },
  { name: "emerald", swatch: "#10b981" },
  { name: "amber", swatch: "#f59e0b" },
  { name: "rose", swatch: "#f43f5e" },
];

// ------------------------------------------------------------ hex mix helpers

export function mixHex(a: string, b: string, t: number): string {
  const ca = parseHex(a) ?? [17, 24, 39];
  const cb = parseHex(b) ?? [255, 255, 255];
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return "#" + out.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function lightenHex(hex: string, t: number): string {
  return mixHex(hex, "#ffffff", t);
}

export function darkenHex(hex: string, t: number): string {
  return mixHex(hex, "#000000", t);
}

/**
 * WCAG AA pair guard (client mirror of vexillum-theme's ensure_readable_pair):
 * picks the better naive ink; when neither white nor dark ink reaches 4.5:1
 * (the "no accessible ink" band) the background is nudged stepwise until
 * the pair is readable. Returns whether the background had to move.
 */
export function ensureReadablePair(
  bg: string,
  fg?: string,
): { bg: string; fg: string; corrected: boolean } {
  const rgb = parseHex(bg);
  if (!rgb) return { bg, fg: fg ?? "#111827", corrected: false };
  const passes = (candidate: string) =>
    contrastRatio(rgb, parseHex(candidate) ?? [0, 0, 0]) >= 4.5;

  if (fg) {
    if (passes(fg)) return { bg, fg, corrected: false };
    const fgLum = relativeLuminance(parseHex(fg) ?? [0, 0, 0]);
    const target = fgLum >= 0.25 ? "#000000" : "#ffffff";
    let moved = bg;
    for (let t = 0.08; t <= 0.8; t += 0.08) {
      moved = mixHex(bg, target, t);
      if (contrastRatio(parseHex(moved)!, parseHex(fg)!) >= 4.5) {
        return { bg: moved, fg, corrected: true };
      }
    }
    return { bg: moved, fg, corrected: true };
  }

  const naive = contrastText(bg);
  if (passes(naive)) return { bg, fg: naive, corrected: false };
  const best =
    contrastRatio(rgb, [255, 255, 255]) >= contrastRatio(rgb, [17, 24, 39])
      ? "#ffffff"
      : "#111827";
  const target = best === "#ffffff" ? "#000000" : "#ffffff";
  let moved = bg;
  for (let t = 0.08; t <= 0.8; t += 0.08) {
    moved = mixHex(bg, target, t);
    if (contrastRatio(parseHex(moved)!, parseHex(best)!) >= 4.5) break;
  }
  return { bg: moved, fg: best, corrected: true };
}

// ------------------------------------------------------- OKLCH (Rust parity)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function linearFromSrgb(v: number): number {
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function srgbFromLinear(v: number): number {
  return v <= 0.003_130_8 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
}

/** Ottosson OKLab from linear sRGB (mirrors crates/theme oklab_from_linear). */
function oklabFromLinear(r: number, g: number, b: number): [number, number, number] {
  const l = 0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_992_9 * b;
  const m = 0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b;
  const s = 0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return [
    0.210_454_255_3 * l_ + 0.793_617_785_0 * m_ - 0.004_072_046_8 * s_,
    1.977_998_495_1 * l_ - 2.428_592_205_0 * m_ + 0.450_593_709_9 * s_,
    0.025_904_037_1 * l_ + 0.782_771_766_2 * m_ - 0.808_675_766_0 * s_,
  ];
}

/** Linear sRGB from OKLab (Ottosson inverse, mirrors linear_from_oklab). */
function linearFromOklab(lum: number, a: number, b: number): [number, number, number] {
  const l_ = lum + 0.396_337_777_4 * a + 0.215_803_757_3 * b;
  const m_ = lum - 0.105_561_345_8 * a - 0.063_854_172_8 * b;
  const s_ = lum - 0.089_484_177_5 * a - 1.291_485_548_0 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
    -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s,
    -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701_0 * s,
  ];
}

/** TS mirror of crates/theme::Oklch — same math, same serialization. */
class Oklch {
  constructor(
    public l: number,
    public c: number,
    public h: number,
  ) {}

  static fromRgb8(r: number, g: number, b: number): Oklch {
    const [lr, lg, lb] = [linearFromSrgb(r / 255), linearFromSrgb(g / 255), linearFromSrgb(b / 255)];
    const [L, a, bb] = oklabFromLinear(lr, lg, lb);
    const c = Math.sqrt(a * a + bb * bb);
    let h = (Math.atan2(bb, a) * 180) / Math.PI;
    if (h < 0) h += 360;
    return new Oklch(L, c, h);
  }

  static neutral(l: number): Oklch {
    return new Oklch(l, 0, 0);
  }

  darken(amount: number): Oklch {
    return new Oklch(clamp01(this.l - amount), this.c, this.h);
  }

  lighten(amount: number): Oklch {
    return new Oklch(clamp01(this.l + amount), this.c, this.h);
  }

  get lightness(): number {
    return this.l;
  }

  /** Mirrors try_rgb8: direct conversion, None-equivalent when out of gamut. */
  private tryRgb8(): [number, number, number] | null {
    const hRad = (this.h * Math.PI) / 180;
    const [lr, lg, lb] = linearFromOklab(this.l, this.c * Math.cos(hRad), this.c * Math.sin(hRad));
    const inGamut = [lr, lg, lb].every((v) => v >= -1e-4 && v <= 1.0 + 1e-4);
    if (!inGamut) return null;
    const to8 = (v: number) => Math.round(srgbFromLinear(Math.min(1, Math.max(0, v))) * 255);
    return [to8(lr), to8(lg), to8(lb)];
  }

  /** Mirrors to_rgb8: chroma-reduction gamut mapping. */
  toRgb8(): [number, number, number] {
    let color: Oklch = this;
    for (let i = 0; i < 64; i++) {
      const rgb = color.tryRgb8();
      if (rgb) return rgb;
      color = new Oklch(color.l, color.c * 0.97, color.h);
    }
    return (
      Oklch.neutral(color.l).tryRgb8() ?? [
        Math.round(clamp01(color.l) * 255),
        Math.round(clamp01(color.l) * 255),
        Math.round(clamp01(color.l) * 255),
      ]
    );
  }

  /** Mirrors to_css: `oklch(L C H)` with 4/4/2 decimals. */
  toCss(): string {
    const fmt = (v: number, digits: number) => v.toFixed(digits);
    return `oklch(${fmt(clamp01(this.l), 4)} ${fmt(Math.max(0, this.c), 4)} ${fmt(((this.h % 360) + 360) % 360, 2)})`;
  }
}

/**
 * Parses a `oklch(L C H)` string to its components (null for other formats).
 * Exported so consumers/tests can reason about token values the same way the
 * Rust crate does.
 */
export function parseOklch(css: string): { l: number; c: number; h: number } | null {
  const m = css.trim().match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  if (!m) return null;
  return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) };
}

/** Converts any theme color value (hex or oklch) to an sRGB triplet. */
export function valueToRgb(value: string): [number, number, number] | null {
  const hex = parseHex(value);
  if (hex) return hex;
  const ok = parseOklch(value);
  if (!ok) return null;
  return new Oklch(ok.l, ok.c, ok.h).toRgb8();
}

function oklchRatio(fg: Oklch, bg: Oklch): number {
  return contrastRatio(fg.toRgb8(), bg.toRgb8());
}

const WHITE_OK = Oklch.fromRgb8(255, 255, 255);

/** Mirrors crates/theme contrast::ensure_contrast (lightness-only steps of .02). */
function ensureContrast(fg: Oklch, bg: Oklch, minRatio: number): Oklch {
  if (oklchRatio(fg, bg) >= minRatio) return fg;
  const white = WHITE_OK;
  const dark = Oklch.fromRgb8(17, 24, 39);
  const target = oklchRatio(white, bg) >= oklchRatio(dark, bg) ? white : dark;
  let adjusted = new Oklch(fg.l, fg.c, fg.h);
  const step = target.l >= fg.l ? 0.02 : -0.02;
  for (let i = 0; i < 128; i++) {
    const next = clamp01(adjusted.l + step);
    if (Math.abs(next - adjusted.l) < Number.EPSILON) break;
    adjusted = new Oklch(next, adjusted.c, adjusted.h);
    if (oklchRatio(adjusted, bg) >= minRatio) return adjusted;
  }
  return oklchRatio(target, bg) >= minRatio ? target : adjusted;
}

/** Mirrors ensure_readable_pair: (fg, bg) both Oklch → guarded pair. */
function ensureReadablePairOk(fg: Oklch, bg: Oklch): [Oklch, Oklch] {
  const fixedFg = ensureContrast(fg, bg, 4.5);
  if (oklchRatio(fixedFg, bg) >= 4.5) return [fixedFg, bg];
  // no ink passes: the background itself must move
  const dark = Oklch.fromRgb8(17, 24, 39);
  const useWhite = oklchRatio(WHITE_OK, bg) >= oklchRatio(dark, bg);
  const ink = useWhite ? WHITE_OK : dark;
  const dir = useWhite ? -0.02 : 0.02;
  let bg2 = new Oklch(bg.l, bg.c, bg.h);
  for (let i = 0; i < 64; i++) {
    const next = clamp01(bg2.l + dir);
    if (Math.abs(next - bg2.l) < Number.EPSILON) break;
    bg2 = new Oklch(next, bg2.c, bg2.h);
    if (oklchRatio(ink, bg2) >= 4.5) return [ensureContrast(fg, bg2, 4.5), bg2];
  }
  return [ink, bg2];
}

function contrastTextOk(bg: Oklch): Oklch {
  const white = WHITE_OK;
  const dark = Oklch.fromRgb8(17, 24, 39);
  return oklchRatio(white, bg) >= oklchRatio(dark, bg) ? white : dark;
}

// --------------------------------------------------------- preset resolution

/** Mirrors crates/theme PRESETS (hue/chroma drive everything; swatches are UI-only). */
const PRESET_HUES: Record<string, { hue: number; chroma: number }> = {
  slate: { hue: 250.0, chroma: 0.03 },
  blue: { hue: 259.0, chroma: 0.19 },
  violet: { hue: 295.0, chroma: 0.21 },
  emerald: { hue: 160.0, chroma: 0.15 },
  amber: { hue: 75.0, chroma: 0.14 },
  rose: { hue: 15.0, chroma: 0.19 },
};

/**
 * Retint parameters per preset — the API's retint theming renders each
 * template fallback toward this hue with its lightness preserved (see
 * crates/theme `re_tint`). The SPA mirrors it for live previews.
 */
export const PRESET_TINTS: Record<string, { hue: number; chroma: number }> = {
  slate: { hue: 250.0, chroma: 0.03 },
  blue: { hue: 259.0, chroma: 0.19 },
  violet: { hue: 295.0, chroma: 0.21 },
  emerald: { hue: 160.0, chroma: 0.15 },
  amber: { hue: 75.0, chroma: 0.14 },
  rose: { hue: 15.0, chroma: 0.19 },
};

/**
 * Re-tints one color toward a theme hue — byte-for-byte mirror of
 * crates/theme's `re_tint` + `themed_value_for` retint path:
 * - true neutrals (C < 0.005) come back byte-verbatim;
 * - lightness is preserved, hue rotates to the theme;
 * - chroma lands in `[12% of the theme chroma, theme chroma]`.
 */
export function reTint(value: string, hue: number, chromaMax: number): string {
  const ok = parseOklch(value);
  const base = ok
    ? new Oklch(ok.l, ok.c, ok.h)
    : (() => {
        const rgb = parseHex(value);
        return rgb ? Oklch.fromRgb8(rgb[0], rgb[1], rgb[2]) : null;
      })();
  if (!base) return value;
  if (base.c < 0.005) return value;
  return new Oklch(
    base.l,
    Math.min(Math.max(base.c, chromaMax * 0.12), chromaMax),
    hue,
  ).toCss();
}

/** Hex-lightened/darkened ramp helpers kept in OKLCH (mirror lighten/darken). */
function ramp(base: Oklch | undefined, up: number, down: number): [string, string] | null {
  if (!base) return null;
  return [base.lighten(up).toCss(), base.darken(down).toCss()];
}

/**
 * Resolves a preset name into a complete 15-token map — a faithful port of
 * crates/theme's `preset_theme` → `ResolvedTheme::from_brand` →
 * `derive_gradients`, including the `label-ink`/`value-ink` on-light inks.
 * Returns undefined for "source"/unknown names.
 */
export function resolveThemeTokens(name: string): ThemeTokens | undefined {
  const preset = PRESET_HUES[name];
  if (!preset) return undefined;

  // preset value backgrounds sit at a pleasant mid lightness (spec §8.3)
  const primary = new Oklch(0.58, preset.chroma, preset.hue);

  const labelBg = Oklch.fromRgb8(0xf3, 0xf4, 0xf6); // #f3f4f6
  const labelFg = ensureContrast(Oklch.fromRgb8(0x37, 0x41, 0x51), labelBg, 4.5);
  const [valueFg, valueBg] = ensureReadablePairOk(contrastTextOk(primary), primary);
  const border = Oklch.fromRgb8(0xd1, 0xd5, 0xdb);
  const divider = Oklch.fromRgb8(0xe5, 0xe7, 0xeb);
  const accent = valueBg;
  const accentFg = ensureContrast(contrastTextOk(valueBg), valueBg, 4.5);
  const icon = primary.lightness > 0.72 ? primary.darken(0.18) : primary;
  // ink on transparent/white surfaces: brand hue darkened into the readable
  // band, guarded against white — mirrors from_brand's label_ink/value_ink
  const labelInk = ensureContrast(primary.darken(0.35), WHITE_OK, 4.5);
  const valueInk = ensureContrast(primary.darken(0.2), WHITE_OK, 4.5);

  const tokens: ThemeTokens = {
    "label-bg": labelBg.toCss(),
    "label-fg": labelFg.toCss(),
    "value-bg": valueBg.toCss(),
    "value-fg": valueFg.toCss(),
    "label-ink": labelInk.toCss(),
    "value-ink": valueInk.toCss(),
    border: border.toCss(),
    divider: divider.toCss(),
    accent: accent.toCss(),
    "accent-fg": accentFg.toCss(),
    "icon-color": icon.toCss(),
  };

  // derive_gradients: ramps ride value-bg / label-bg, inks ride their segments
  const gRamp = ramp(valueBg, 0.06, 0.08);
  if (gRamp) {
    tokens["g-from"] = gRamp[0];
    tokens["g-to"] = gRamp[1];
  }
  const glRamp = ramp(labelBg, 0.03, 0.05);
  if (glRamp) {
    tokens["gl-from"] = glRamp[0];
    tokens["gl-to"] = glRamp[1];
  }
  return tokens;
}

/** Whether resolving this preset required a guardrail correction. */
export function presetColorCorrected(name: string): boolean {
  const preset = PRESET_HUES[name];
  if (!preset) return false;
  // mirroring from_brand: a correction happened when ensure_readable_pair had
  // to move the background or ensure_contrast had to move a foreground
  const primary = new Oklch(0.58, preset.chroma, preset.hue);
  const naive = contrastTextOk(primary);
  const [, valueBg] = ensureReadablePairOk(naive, primary);
  if (valueBg !== primary) return true;
  const accentFg = ensureContrast(contrastTextOk(valueBg), valueBg, 4.5);
  return accentFg !== contrastTextOk(valueBg);
}

// ---------------------------------------------------------------------------
// Semantic theming (v5): one seed → the full OKLCH ramp.
// Byte-identical mirror of crates/theme/src/semantic.rs — see ./semantic.ts.
// ---------------------------------------------------------------------------

export {
  DEFAULT_SEED as SEMANTIC_DEFAULT_SEED,
  DARK_OVERRIDES as SEMANTIC_DARK_OVERRIDES,
  CORE as SEMANTIC_CORE,
  MIXES as SEMANTIC_MIXES,
  PRESET_SEEDS as SEMANTIC_PRESET_SEEDS,
  PRESET_ALIASES as SEMANTIC_PRESET_ALIASES,
  alphaToCss,
  colorMix,
  oklchFromRgb8,
  parseOklchValue,
  parseSeed as parseSemanticSeed,
  presetSeed as semanticPresetSeed,
  resolveRamp as resolveSemanticRamp,
  semanticVars,
  semanticVarsDuo,
} from "./semantic";
export type { Mode as SemanticMode } from "./semantic";

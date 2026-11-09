/**
 * Theme token mapping: flat colors in semantic roles become
 * `var(--token, <original>)` references.
 *
 * The fallback is essential: variants disagree on e.g. label ink (#374151 vs
 * #6b7280), so the *default* render injects no tokens at all and every
 * fallback reproduces the source collection exactly (pixel-perfect by
 * construction). When a theme is selected, the renderer injects the token
 * values via a `:root` stylesheet and every variant re-themes coherently.
 *
 * Text tokens are SURFACE-AWARE: `.label`/`.value` text that sits directly
 * on a transparent or hardcoded-light surface maps to the `label-ink` /
 * `value-ink` tokens (dark, readable-on-white inks), because the `-fg`
 * inks are designed to pair with the themed `label-bg`/`value-bg` and
 * disappear on the page background. Text on a themed or dark surface keeps
 * the `-fg` tokens.
 */

export type TokenName =
  | "label-bg"
  | "label-fg"
  | "value-bg"
  | "value-fg"
  | "label-ink"
  | "value-ink"
  | "border"
  | "divider"
  | "accent"
  | "accent-fg"
  | "icon-color";

/** Frozen token vocabulary — mirrors crates/theme TOKENS. */
export const TOKENS: readonly TokenName[] = [
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
];

/** The surface a text node paints onto, tracked down the tree. */
export type Surface = "transparent" | "light" | "dark" | "themed";

/**
 * Classifies a `background`/`background-color` value:
 * - `null` → the element declares no background (children inherit)
 * - `"transparent"` → explicitly transparent (children see through to the page)
 * - `"light"` → hardcoded near-white/light flat color (dark ink required)
 * - `"dark"` → hardcoded mid/dark flat color (themed -fg inks are fine)
 * - `"themed"` → var()/gradient/other (rides the themed surface system)
 */
export function classifyBackground(value: string | undefined): Surface | null {
  if (value === undefined) return null;
  const v = value.trim();
  if (v === "" || v === "none" || v === "transparent") return "transparent";
  if (isFlatColor(v)) {
    const rgb = flatColorToRgb(v);
    if (!rgb) return "themed";
    // "light" = white-ish surfaces where light themed ink would vanish
    return contrastVsWhite(rgb) < 3 ? "light" : "dark";
  }
  // gradients / var() / layered values ride the theme system
  return "themed";
}

/** Parses hex/rgb()/rgba() to an 8-bit triplet (null otherwise). */
function flatColorToRgb(value: string): [number, number, number] | null {
  const hex = value.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
    }
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3]] as [number, number, number];
  return null;
}

function contrastVsWhite(rgb: [number, number, number]): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  return 1.05 / (lum + 0.05);
}

export interface TokenizedDecl {
  declarations: Record<string, string>;
  /** token name → original resolved value (for the default theme) */
  resolved: Record<string, string>;
}

const COLOR_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
]);

/** Matches a plain (non-repeating) linear-gradient and captures its argument list. */
const LINEAR_GRADIENT_RE = /^([^()]*)\blinear-gradient\((.+)\)([^()]*)$/i;

interface GradientStop {
  color: string;
  rest: string; // position suffix like " 0%" (verbatim)
}

/** Splits a gradient stop list into stops (flat colors only). */
function parseGradientStops(stopList: string): GradientStop[] | null {
  const parts = stopList.split(",").map((s) => s.trim());
  if (parts.length < 2) return null;
  const stops: GradientStop[] = [];
  for (const part of parts) {
    const m = part.match(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))(\s+.*)?$/);
    if (!m) return null; // non-flat stop (transparent, var(), …) → leave literal
    stops.push({ color: m[1], rest: m[2] ?? "" });
  }
  return stops;
}

/**
 * Tokenizes a linear-gradient background's color stops into theme ramp
 * variables.
 *
 * Root and value-role gradients ride the primary ramp (--g-from/--g-to,
 * three-stop middle → --value-bg); label-role gradients ride the label ramp
 * (--gl-from/--gl-to). Repeating gradients, layered non-gradient leftovers
 * with other gradients, and non-role elements stay literal — they are
 * texture, not theme surface.
 */
function tokenizeGradient(
  elClass: string,
  isRoot: boolean,
  value: string,
): { css: string; resolved: Record<string, string> } | null {
  const m = value.match(LINEAR_GRADIENT_RE);
  if (!m) return null;
  const [, prefix, args, suffix] = m;
  if (/gradient\(/i.test(prefix) || /repeating-/i.test(prefix)) return null;
  const commaIdx = args.indexOf(",");
  if (commaIdx < 0) return null;
  const angle = args.slice(0, commaIdx);
  const stops = parseGradientStops(args.slice(commaIdx + 1));
  if (!stops) return null;
  const cls = elClass.split(/\s+/)[0];
  const isLabel = cls === "label";
  const isValue = cls === "value";
  if (!isRoot && !isLabel && !isValue) return null;

  const resolved: Record<string, string> = {};
  const token = (name: string, original: string): string => {
    resolved[name] = original;
    return `var(--${name}, ${original})`;
  };
  const first = stops[0];
  const last = stops[stops.length - 1];
  first.color = token(isLabel ? "gl-from" : "g-from", first.color);
  last.color = token(isLabel ? "gl-to" : "g-to", last.color);
  if (stops.length === 3 && !isLabel) {
    stops[1].color = token("value-bg", stops[1].color);
  }
  const body = stops.map((s) => `${s.color}${s.rest}`).join(", ");
  return { css: `${prefix}linear-gradient(${angle}, ${body})${suffix}`, resolved };
}

export function isFlatColor(value: string): boolean {
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return true;
  if (/^rgba?\(\s*[\d.\s,%]+\)$/i.test(value)) return true;
  if (/^hsla?\(\s*[\d.\s,%deg]+\)$/i.test(value)) return true;
  return false;
}

/** Text color vs background color role for an element class. */
function roleFor(elClass: string, prop: string, surface: Surface): TokenName | null {
  const cls = elClass.split(/\s+/)[0];
  if (prop === "color") {
    // text on transparent/light surfaces needs the dark on-light inks —
    // the -fg inks pair with themed label-bg/value-bg and vanish on the page
    const onLight = surface === "transparent" || surface === "light";
    if (cls === "label") return onLight ? "label-ink" : "label-fg";
    if (cls === "value") return onLight ? "value-ink" : "value-fg";
    if (cls === "sep" || cls === "s") return "divider";
    if (cls === "icon" || cls === "i") return "icon-color";
    return null;
  }
  if (prop === "background" || prop === "background-color") {
    if (cls === "label") return "label-bg";
    if (cls === "value") return "value-bg";
    if (cls === "sep" || cls === "s") return "divider";
    return null;
  }
  return null;
}

/**
 * Rewrites a declarations block, mapping semantic colors to
 * `var(--token, original)` where the element role is unambiguous.
 *
 * `surface` is the surface this element's text paints onto (inherited from
 * the ancestor chain by the caller); it decides -fg vs -ink for text roles.
 */
export function tokenizeDeclarations(
  elClass: string,
  isRoot: boolean,
  declarations: Record<string, string>,
  surface: Surface = "light",
): TokenizedDecl {
  const out: Record<string, string> = {};
  const resolved: Record<string, string> = {};

  const map = (prop: string, original: string, token: TokenName): void => {
    out[prop] = `var(--${token}, ${original})`;
    resolved[token] = original;
  };

  for (const [prop, value] of Object.entries(declarations)) {
    // gradient ramps (root / label / value roles) → --g-from/--g-to/--gl-*
    if (prop === "background" || prop === "background-image") {
      const gradient = tokenizeGradient(elClass, isRoot, value);
      if (gradient) {
        out[prop] = gradient.css;
        Object.assign(resolved, gradient.resolved);
        continue;
      }
    }

    const role = roleFor(elClass, prop, surface);
    if (role && isFlatColor(value)) {
      map(prop, value, role);
      continue;
    }

    // Filled variants put the badge's primary color on the ROOT (background
    // = the value fill, color = the text on it) — map them so themes work.
    if (isRoot && prop === "background" && isFlatColor(value)) {
      map(prop, value, "value-bg");
      continue;
    }
    if (isRoot && prop === "color" && isFlatColor(value)) {
      map(prop, value, surface === "transparent" || surface === "light" ? "value-ink" : "value-fg");
      continue;
    }

    // Root border shorthand: `border: 1.5px solid #7c3aed`
    if (isRoot && prop === "border") {
      const m = value.match(/^(.*\S)\s+(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))$/);
      if (m) {
        out[prop] = `${m[1]} var(--border, ${m[2]})`;
        resolved.border = m[2];
        continue;
      }
    }
    // Root border color longhands
    if (isRoot && (prop === "border-color" || prop === "border-top-color") && isFlatColor(value)) {
      map(prop, value, "border");
      continue;
    }

    out[prop] = value;
  }

  return { declarations: out, resolved };
}

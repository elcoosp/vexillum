/**
 * Semantic tokenizer for badge-collections.html.
 *
 * Applies the "one seed → full OKLCH ramp" technique (the uploaded deepseek
 * demo) to the whole design source:
 *
 * 1. Adopts the demo's remade CSS for every variant it provides (c05, c07,
 *    c11 fully; hero variants elsewhere).
 * 2. Tokenizes every remaining color literal into `var(--vx-<token>,
 *    <baked-default>)` references — surfaces/borders/text/accents/status —
 *    using hue+lightness classification mirroring the demo's mapping.
 * 3. Rewrites every `color-mix(in oklch, …)` and accent-tinted rgba() into a
 *    generated mix token (`--vx-m-*`), registering the formula in
 *    crates/theme/assets/semantic-mixes.json (consumed by Rust + TS resolvers).
 * 4. Bakes fallbacks by resolving the full ramp at the default seed (light),
 *    via the canonical TS resolver (packages/themes/src/semantic.ts).
 * 5. Injects the design page's live theme panel: default ramp <style>, seed
 *    picker + swatches + dark toggle, and an inline resolver using the exact
 *    same tables.
 *
 * Run: pnpm exec tsx scripts/semantic-tokenize.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = resolve(ROOT, "badge-collections.html");
const DEMO = "/home/z/my-project/upload/deepseek_html_20261027_47df52.html";
const MIXES_OUT = resolve(ROOT, "crates/theme/assets/semantic-mixes.json");
const DRY = process.argv.includes("--dry");

const html = readFileSync(SRC, "utf8");
const demoHtml = readFileSync(DEMO, "utf8");

// ---------------------------------------------------------------------------
// Color math helpers (classification only — resolution comes from semantic.ts)
// ---------------------------------------------------------------------------

function oklchOf(r, g, b) {
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lr = lin(r / 255), lg = lin(g / 255), lb = lin(b / 255);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const aOk = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const c = Math.sqrt(aOk * aOk + bOk * bOk);
  let h = (Math.atan2(bOk, aOk) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

function hexToRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** ok/warn/err/seed family by OKLCH hue (matches the demo's mapping). */
function familyOf({ c, h }) {
  if (c < 0.04) return "neutral";
  if (h >= 344 || h < 30) return "err";
  if (h < 120) return "warn";
  if (h < 190) return "ok";
  return "seed";
}

// ---------------------------------------------------------------------------
// Mix token registry
// ---------------------------------------------------------------------------

const mixes = new Map(); // token → formula (sans token)
function mixToken(top, pct, base) {
  const pctInt = Math.round(pct);
  const slug = (part) => {
    if (part === "transparent") return "t";
    if (part.startsWith("#")) return part.slice(1).toLowerCase();
    return part.replace(/^vx-/, "");
  };
  const token = `vx-m-${slug(top)}-${pctInt}-${slug(base)}`;
  const formula = {
    token,
    pct: pctInt,
    top: top === "seed" ? "seed" : top.startsWith("#") || top === "transparent" ? top : top.replace(/^vx-/, ""),
    base: base.startsWith("#") || base === "transparent" ? base : base.replace(/^vx-/, ""),
  };
  const existing = mixes.get(token);
  if (existing && JSON.stringify(existing) !== JSON.stringify(formula)) {
    throw new Error(`mix collision for ${token}: ${JSON.stringify(existing)} vs ${JSON.stringify(formula)}`);
  }
  mixes.set(token, formula);
  return token;
}

const STATUS_FAMILY_TOKEN = { ok: "vx-ok", warn: "vx-warn", err: "vx-err", seed: "vx-a" };

// ---------------------------------------------------------------------------
// Literal → token mapping
// ---------------------------------------------------------------------------

const report = { mapped: 0, kept: 0, unmapped: [] };

const NEUTRAL_TEXT = {
  "#9ca3af": "vx-t-subtle", "#94a3b8": "vx-t-subtle", "#d6d3d1": "vx-t-muted",
  "#cbd5e1": "vx-t-muted", "#78716c": "vx-t-muted",
  "#6b7280": "vx-t-muted",
  "#4b5563": "vx-t-body", "#374151": "vx-t-body", "#334155": "vx-t-body",
  "#1f2937": "vx-t-strong", "#1e293b": "vx-t-strong", "#24292f": "vx-t-strong",
  "#111827": "vx-t-heading", "#0f172a": "vx-t-heading", "#1c1917": "vx-t-heading",
  "#191414": "vx-t-heading", "#000000": "vx-t-heading", "#000": "vx-t-heading",
};
const NEUTRAL_BG = {
  "#ffffff": "vx-s-white", "#fff": "vx-s-white",
  "#fafafa": "vx-s-50", "#f9fafb": "vx-s-50", "#f6f8fa": "vx-s-50",
  "#f3f4f6": "vx-s-100", "#e5e7eb": "vx-s-200", "#d1d5db": "vx-s-300",
  "#1e1e1e": "vx-d-surface", "#0c0c0c": "vx-d-bg", "#000000": "vx-d-bg", "#000": "vx-d-bg",
  "#111827": "vx-t-heading", "#0f172a": "vx-t-heading", "#1e293b": "vx-t-heading",
  "#1f2937": "vx-t-heading", "#1c1917": "vx-t-heading", "#191414": "vx-t-heading",
  "#24292f": "vx-t-heading",
};
const NEUTRAL_BORDER = {
  "#e5e7eb": "vx-b-100", "#d0d7de": "vx-b-100",
  "#d1d5db": "vx-b-200", "#cbd5e1": "vx-b-200",
  "#9ca3af": "vx-b-300", "#6b7280": "vx-b-300",
  "#374151": "vx-t-heading", "#4b5563": "vx-t-heading", "#1f2937": "vx-t-heading",
  "#111827": "vx-t-heading", "#0f172a": "vx-t-heading", "#1e293b": "vx-t-heading",
  "#000000": "vx-t-heading", "#000": "vx-t-heading", "#24292f": "vx-t-heading",
};

function seedVariantByL(l) {
  if (l >= 0.94) return "vx-a-muted";
  if (l >= 0.88) return "vx-a-soft";
  if (l >= 0.75) return "vx-a-bright";
  if (l >= 0.45) return "vx-a";
  if (l >= 0.30) return "vx-a-ink";
  return "vx-a-deep";
}

/** Text/icon roles need different bands than fills: text on light surfaces
 * must darken into the readable band (a-ink), icons ride the plain accent. */
function seedVariantForRole(l, role) {
  if (role === "icon") return l >= 0.75 ? "vx-a-bright" : "vx-a";
  if (role === "text") {
    if (l >= 0.75) return "vx-a-bright";
    if (l >= 0.62) return "vx-a";
    if (l >= 0.30) return "vx-a-ink";
    return "vx-a-deep";
  }
  return seedVariantByL(l);
}

/** Detects the role of the styled element from the rule's last selector class. */
function roleOf(selector) {
  const last = selector.trim().split(/\s+/).pop() ?? "";
  if (last === "[svg]" || /\.(icon|i)\b/.test(last)) return "icon";
  if (/\.(label|value|s|sep|sub|big|score|pct|num|kw|var|op|count|digit)\b/.test(last)) return "text";
  return "fill";
}

function statusVariant(family, l, prop) {
  if (l >= 0.88 && (prop === "background" || prop === "background-color" || prop === "background-image")) {
    const pct = l >= 0.94 ? 15 : l >= 0.90 ? 20 : 25;
    return mixToken(STATUS_FAMILY_TOKEN[family], pct, "vx-s-white");
  }
  if (l >= 0.75) return STATUS_FAMILY_TOKEN[family];
  if (l >= 0.55) return STATUS_FAMILY_TOKEN[family];
  if (l >= 0.35) return mixToken(STATUS_FAMILY_TOKEN[family], 60, "#000000");
  return mixToken(STATUS_FAMILY_TOKEN[family], 75, "#000000");
}

/** Keeps iconic data-viz colors literal (GitHub heat ramp, JS logo yellow). */
function isException(selector, value) {
  if (selector.includes("heatmap")) return true;
  if (value === "#f7df1e") return true;
  return false;
}

function mapHex(hex, prop, selector) {
  const key = hex.toLowerCase();
  const isC09 = selector.includes(".c09-");
  if (isC09) {
    // Terminal surfaces are always-dark: use the d-* ramp.
    if (key === "#1e1e1e") return "vx-d-surface";
    if (key === "#0c0c0c" || key === "#000000" || key === "#000") return "vx-d-bg";
    if (prop === "background" || prop === "background-color") {
      if (NEUTRAL_BG[key]) return NEUTRAL_BG[key];
    }
    if (prop.startsWith("border")) {
      if (key === "#e5e7eb" || key === "#d0d7de" || key === "#d1d5db" || key === "#374151") return "vx-d-border";
    }
    if (prop === "color") {
      if (key === "#9ca3af" || key === "#94a3b8" || key === "#6b7280") return "vx-d-text-mut";
      if (key === "#e5e7eb" || key === "#d0d7de" || key === "#ffffff" || key === "#fff" || key === "#d1d5db") return "vx-d-text";
    }
    // saturated inside c09 falls through to the family logic below (bright
    // accents on dark → a-bright via the L rules)
  }
  if (prop === "color") {
    if (NEUTRAL_TEXT[key]) return NEUTRAL_TEXT[key];
  }
  if (prop === "background" || prop === "background-color" || prop === "background-image") {
    if (NEUTRAL_BG[key]) return NEUTRAL_BG[key];
  }
  if (prop.startsWith("border")) {
    if (NEUTRAL_BORDER[key]) return NEUTRAL_BORDER[key];
  }
  // fallback by best role guess for unlisted prop/neutral combos
  if (NEUTRAL_TEXT[key] || NEUTRAL_BG[key] || NEUTRAL_BORDER[key]) {
    if (prop.startsWith("border")) return NEUTRAL_BORDER[key] ?? NEUTRAL_BG[key];
    if (prop === "color") return NEUTRAL_TEXT[key] ?? NEUTRAL_BG[key] ?? NEUTRAL_TEXT["#111827"];
    return NEUTRAL_BG[key] ?? NEUTRAL_TEXT[key];
  }
  // saturated (or unlisted neutral) — classify by family
  const [r, g, b] = hexToRgb(key);
  const okl = oklchOf(r, g, b);
  const family = familyOf(okl);
  if (family === "neutral") {
    // unlisted neutrals: nearest surface/border/text by lightness
    if (okl.l >= 0.95) return "vx-s-100";
    if (okl.l >= 0.90) return "vx-s-200";
    if (okl.l >= 0.80) return prop.startsWith("border") ? "vx-b-200" : "vx-s-300";
    if (okl.l >= 0.60) return prop === "color" ? "vx-t-muted" : "vx-b-300";
    return prop === "color" ? "vx-t-strong" : "vx-t-heading";
  }
  if (family === "seed") return seedVariantForRole(okl.l, prop === "color" ? roleOf(selector) : "fill");
  if (family !== "neutral" && prop === "color" && okl.l >= 0.75 && roleOf(selector) === "text") {
    // bright status text on dark surfaces stays the family color
    return STATUS_FAMILY_TOKEN[family];
  }
  return statusVariant(family, okl.l, prop);
}

function mapRgba(rgba, prop, selector) {
  const m = rgba.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/i);
  if (!m) return null;
  const r = +m[1], g = +m[2], b = +m[3];
  const a = m[4] === undefined ? 1 : +m[4];
  // neutral whites/blacks stay literal (texture)
  if (Math.max(r, g, b) - Math.min(r, g, b) < 8) return null;
  const okl = oklchOf(r, g, b);
  const family = familyOf(okl);
  const pct = Math.min(100, Math.max(1, Math.round(a * 100)));
  return mixToken(STATUS_FAMILY_TOKEN[family], pct, "transparent");
}

const COLOR_TOKEN_RE = /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\))/g;

/** Tokenizes one declaration value. Returns null when nothing changed. */
function tokenizeValue(prop, value, selector) {
  let changed = false;
  const out = value.replace(COLOR_TOKEN_RE, (match) => {
    if (isException(selector, match.toLowerCase())) return match;
    let repl = null;
    if (match.startsWith("#")) repl = mapHex(match, prop, selector);
    else if (/^rgba?\(/i.test(match)) repl = mapRgba(match, prop, selector);
    else repl = null; // hsl: keep
    if (repl == null) return match;
    changed = true;
    report.mapped++;
    return `var(--${repl}, @@VX:${repl}@@)`;
  });
  return changed ? out : null;
}

const COLOR_PROPS =
  /^(color|background|background-color|background-image|border(-top|-right|-bottom|-left)?(-color)?|box-shadow|text-shadow|filter|fill|stroke|outline(?:-color)?|caret-color)$/;

/** Tokenizes a full `prop: value` declaration (or null to keep). */
function tokenizeDeclaration(decl, selector) {
  const ci = decl.indexOf(":");
  if (ci < 0) return null;
  const prop = decl.slice(0, ci).trim().toLowerCase();
  const value = decl.slice(ci + 1).trim();
  if (!COLOR_PROPS.test(prop)) return null;
  const mapped = tokenizeValue(prop, value, selector);
  if (!mapped) return null;
  return `${prop}: ${mapped}`;
}

// ---------------------------------------------------------------------------
// Demo CSS adoption
// ---------------------------------------------------------------------------

function extractStyle(htmlText) {
  const m = htmlText.match(/<style>([\s\S]*?)<\/style>/);
  if (!m) throw new Error("no <style> found");
  return m[1];
}

/** Splits CSS into top-level rules, preserving comments. */
function splitRules(css) {
  const rules = [];
  let depth = 0;
  let buf = "";
  for (const ch of css) {
    buf += ch;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        rules.push(buf);
        buf = "";
      }
    }
  }
  if (buf.trim()) rules.push(buf); // trailing comment block
  return rules;
}

function ruleSelector(rule) {
  const m = rule.match(/([^{}]+)\{/);
  if (!m) return "";
  // strip comments so variant matching isn't broken by glued section comments
  return m[1]
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function ruleBody(rule) {
  const m = rule.match(/\{([\s\S]*)\}/);
  return m ? m[1] : "";
}

const VARIANT_RE = /^\.c(\d{2})-(\d{2})\b/;

function variantOf(selector) {
  const m = selector.match(VARIANT_RE);
  return m ? `c${m[1]}-${m[2]}` : null;
}

const demoStyle = extractStyle(demoHtml);
const demoRules = splitRules(demoStyle);
const demoVariants = new Map(); // variant id → { rules: string[], keyframes: Set<string> }
const demoKeyframes = new Map(); // name → full rule text
for (const rule of demoRules) {
  const selector = ruleSelector(rule);
  if (selector.startsWith("@keyframes")) {
    const name = selector.replace(/@keyframes\s+/, "").trim();
    demoKeyframes.set(name, rule);
    continue;
  }
  const variant = variantOf(selector);
  if (variant) {
    if (!demoVariants.has(variant)) demoVariants.set(variant, []);
    demoVariants.get(variant).push(rule.trim());
  }
}

/** Rewrites a demo rule into vx- vocabulary with baked fallbacks. */
function transformDemoRule(rule) {
  // color-mix(...) → mix tokens (balanced-paren scan; args may nest var())
  let out = replaceColorMixCalls(rule, (inner) => {
    const parts = inner.split("in oklch")[1] ?? "";
    const args = splitTopLevel(parts.replace(/^\s*,/, ""));
    if (args.length !== 2) throw new Error(`unsupported color-mix args: '${inner}'`);
    // segment 1 = "<top> <pct>%", segment 2 = the base
    const segMatch = args[0].trim().match(/^([\s\S]*\S)\s+([\d.]+)%$/);
    if (!segMatch) throw new Error(`unsupported color-mix top: '${args[0]}'`);
    const top = parseMixComponent(segMatch[1].trim());
    const base = parseMixComponent(args[1].trim());
    const pct = parseFloat(segMatch[2]);
    const token = mixToken(top, pct, base);
    return `var(--${token}, @@VX:${token}@@)`;
  });
  // bare var(--x) → var(--vx-x, baked)
  out = out.replace(/var\(\s*--([a-z0-9-]+)\s*\)/g, (_, name) => `var(--vx-${name}, @@VX:vx-${name}@@)`);
  // rename keyframes to the vx- namespace to avoid collisions
  for (const name of demoKeyframes.keys()) {
    const re = new RegExp(`(animation[^;:]*:\\s*[^;]*?)\\b${name}\\b`, "g");
    out = out.replace(re, `$1vx-${name}`);
  }
  return out.trim();
}

function replaceColorMixCalls(text, fn) {
  let out = "";
  let i = 0;
  for (;;) {
    const start = text.indexOf("color-mix(", i);
    if (start < 0) {
      out += text.slice(i);
      return out;
    }
    let depth = 0;
    let j = start + "color-mix".length;
    for (; j < text.length; j++) {
      if (text[j] === "(") depth++;
      else if (text[j] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    const inner = text.slice(start + "color-mix(".length, j);
    out += text.slice(i, start) + fn(inner);
    i = j + 1;
  }
}

function splitTopLevel(s) {
  const parts = [];
  let depth = 0;
  let buf = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(buf);
      buf = "";
    } else buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts;
}

function parseMixComponent(raw) {
  const varMatch = raw.match(/^var\(\s*--([a-z0-9-]+)\s*\)$/);
  if (varMatch) {
    const token = `vx-${varMatch[1]}`;
    // mixes may only stack on the (opaque) core vocabulary
    if (!CORE_TOKEN_SET.has(token)) {
      throw new Error(`mix component '${raw}' is not a core token`);
    }
    return token;
  }
  if (/^transparent$/i.test(raw)) return "transparent";
  const keyword = raw.toLowerCase();
  if (keyword === "black") return "#000000";
  if (keyword === "white") return "#ffffff";
  if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return raw.toLowerCase();
  throw new Error(`unsupported mix component: '${raw}'`);
}

const CORE_TOKEN_SET = new Set([
  "vx-s-white", "vx-s-50", "vx-s-100", "vx-s-200", "vx-s-300",
  "vx-b-100", "vx-b-200", "vx-b-300", "vx-b-strong",
  "vx-t-subtle", "vx-t-muted", "vx-t-body", "vx-t-strong", "vx-t-heading",
  "vx-a", "vx-a-bright", "vx-a-soft", "vx-a-muted", "vx-a-deep", "vx-a-ink", "vx-a-on",
  "vx-ok", "vx-warn", "vx-err",
  "vx-d-bg", "vx-d-surface", "vx-d-surface-2", "vx-d-border", "vx-d-text", "vx-d-text-mut",
  "vx-metal-1", "vx-metal-2", "vx-metal-3", "vx-metal-4",
]);

// ---------------------------------------------------------------------------
// Current file processing
// ---------------------------------------------------------------------------

const style = extractStyle(html);

// collect existing keyframes names (left untouched)
const existingKeyframes = new Set();
for (const rule of splitRules(style)) {
  const sel = ruleSelector(rule);
  if (sel.startsWith("@keyframes")) existingKeyframes.add(sel.replace(/@keyframes\s+/, "").trim());
}

const outRules = [];
const adopted = new Set();
const keptStats = { rules: 0, tokenized: 0 };
for (const rule of splitRules(style)) {
  const selector = ruleSelector(rule);
  if (selector.startsWith("@keyframes") || selector.startsWith("@media") || selector === "") {
    outRules.push(rule.trimEnd());
    continue;
  }
  const variant = variantOf(selector);
  if (variant && demoVariants.has(variant)) {
    if (!adopted.has(variant)) {
      adopted.add(variant);
      for (const demoRule of demoVariants.get(variant)) {
        outRules.push(transformDemoRule(demoRule));
      }
    }
    continue; // current rules for adopted variants are replaced
  }
  // page chrome / non-adopted variant rules: tokenize literals
  const body = ruleBody(rule);
  const decls = body
    .split(";")
    .map((decl) => {
      const t = tokenizeDeclaration(decl, selector);
      if (t != null) keptStats.tokenized++;
      return t ?? decl;
    });
  // White text on an accent/status fill must be `a-on` (stays white in dark
  // mode); white text on structural/neutral surfaces is `s-white` (flips).
  const fillTokens = decls
    .filter((d) => /^(background|background-color|background-image)\s*:/i.test(d))
    .map((d) => d.match(/var\(--(vx-[a-z0-9-]+)/)?.[1])
    .filter(Boolean);
  const hasAccentFill = fillTokens.some((t) =>
    ["vx-a", "vx-a-bright", "vx-a-deep", "vx-ok", "vx-warn", "vx-err"].includes(t) ||
    /^vx-m-(a|ok|warn|err)-\d+-t$/.test(t),
  );
  const newDecls = hasAccentFill
    ? decls.map((d) =>
        d.replace(
          /^(color\s*:\s*)var\(--vx-s-white,\s*(?:oklch\([^)]*\)|@@VX:vx-s-white@@)\)/i,
          (m, p1) => `${p1}var(--vx-a-on, @@VX:vx-a-on@@)`,
        ),
      )
    : decls;
  const newBody = newDecls.join(";");
  const head = rule.slice(0, rule.indexOf("{"));
  outRules.push(`${head.trimEnd()}{${newBody}}`);
  keptStats.rules++;
}

// append adopted demo keyframes (renamed)
for (const [name, rule] of demoKeyframes) {
  if (!existingKeyframes.has(`vx-${name}`)) {
    outRules.push(rule.replace(`@keyframes ${name}`, `@keyframes vx-${name}`).trim());
  }
}

console.log(`demo variants adopted: ${adopted.size}/${demoVariants.size}`);
console.log(`demo variants available: ${[...demoVariants.keys()].sort().join(" ")}`);
console.log(`current rules kept: ${keptStats.rules}, declarations tokenized: ${keptStats.tokenized}`);

// ---------------------------------------------------------------------------
// Inline styles in the markup
// ---------------------------------------------------------------------------

let outHtml = html;
// <style> swap
outHtml = outHtml.replace(/(<style>)[\s\S]*?(<\/style>)/, (_, open, close) => `${open}\n${outRules.join("\n\n")}\n${close}`);

// inline style attributes (only color-bearing declarations change)
outHtml = outHtml.replace(/style="([^"]*)"/g, (m, value) => {
  const decls = value.split(";");
  let changed = false;
  const newDecls = decls.map((decl) => {
    const t = tokenizeDeclaration(decl, "[inline]");
    if (t != null) {
      changed = true;
      return t;
    }
    return decl;
  });
  return changed ? `style="${newDecls.join(";")}"` : m;
});

// SVG presentation attributes (fill/stroke/stop-color with literal colors)
outHtml = outHtml.replace(
  /\b(fill|stroke|stop-color)="(#[0-9a-fA-F]{3,8})"/g,
  (m, attr, hex) => {
    const token = mapHex(hex, "color", "[svg]");
    if (!token || token === hex) return m;
    report.mapped++;
    return `${attr}="var(--${token}, @@VX:${token}@@)"`;
  },
);

// ---------------------------------------------------------------------------
// Bake fallbacks via the canonical TS resolver (after mixes JSON is written)
// ---------------------------------------------------------------------------

writeFileSync(MIXES_OUT, JSON.stringify({ mixes: [...mixes.values()].sort((a, b) => a.token.localeCompare(b.token)) }, null, 2) + "\n");
console.log(`mix tokens registered: ${mixes.size}`);

const sem = await import(resolve(ROOT, "packages/themes/src/semantic.ts"));
const ramp = sem.resolveRamp(sem.parseOklchValue ? sem.parseSeed(sem.DEFAULT_SEED) : null, "light");

// replace @@VX:token@@ placeholders
let missing = 0;
outHtml = outHtml.replace(/@@VX:([a-z0-9-]+)@@/g, (_, token) => {
  const value = ramp[token];
  if (!value) {
    missing++;
    return "oklch(0.5 0 0)";
  }
  return value;
});
if (missing) throw new Error(`${missing} fallback tokens missing from the ramp`);

// ---------------------------------------------------------------------------
// Inject the design page theme panel + resolver
// ---------------------------------------------------------------------------

const defaultRamp = ramp;
const rampCss = Object.entries(defaultRamp).map(([k, v]) => `  --${k}: ${v};`).join("\n");
const panel = buildPanelCss() + "\n" + buildPanelHtml(sem.PRESET_SEEDS) + "\n" + buildResolverScript(sem);

outHtml = outHtml.replace("</body>", `${panel}\n</body>`);

// ramp style as its own element right after the main stylesheet
outHtml = outHtml.replace(
  /<\/style>/,
  `</style>\n<style id="vx-ramp">\n:root {\n${rampCss}\n}\n</style>`,
);

if (!DRY) writeFileSync(SRC, outHtml);
console.log(`fallback tokens missing: ${missing}`);
console.log(`wrote: ${DRY ? "(dry — not written)" : SRC}`);
console.log(`mixes: ${MIXES_OUT}`);

// ---------------------------------------------------------------------------
// Panel + resolver builders
// ---------------------------------------------------------------------------

function buildPanelCss() {
  return `<style id="vx-panel-css">
/* ============================================================
   THEME PANEL — seed picker + dark mode (semantic OKLCH ramp)
   ============================================================ */
.theme-panel {
  position: fixed; top: 16px; right: 16px; z-index: 1000;
  background: var(--vx-s-white); border: 1px solid var(--vx-b-100);
  border-radius: 12px; padding: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  display: flex; flex-direction: column; gap: 10px; width: 220px;
}
.panel-row { display: flex; align-items: center; gap: 8px; }
.panel-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--vx-t-muted);
  font-family: 'JetBrains Mono', monospace;
}
#vx-seed {
  width: 34px; height: 34px; border: 1px solid var(--vx-b-100);
  border-radius: 8px; padding: 3px; cursor: pointer; background: var(--vx-s-white);
}
#vx-seed::-webkit-color-swatch-wrapper { padding: 0; }
#vx-seed::-webkit-color-swatch { border: none; border-radius: 5px; }
#vx-seed::-moz-color-swatch { border: none; border-radius: 5px; }
.vx-swatches { display: flex; gap: 5px; flex-wrap: wrap; }
.vx-swatch {
  width: 22px; height: 22px; border-radius: 50%; border: 0; padding: 0;
  cursor: pointer; transition: transform .12s ease;
}
.vx-swatch:hover { transform: scale(1.15); }
.vx-swatch[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--vx-s-white), 0 0 0 3.5px var(--vx-t-heading); }
.panel-btn {
  font: 600 11px/1 'Inter', sans-serif; color: var(--vx-t-strong);
  background: var(--vx-s-100); border: 1px solid var(--vx-b-100);
  border-radius: 7px; padding: 8px; cursor: pointer;
}
.panel-btn:hover { background: var(--vx-a-soft); }
.panel-toggle {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 600; color: var(--vx-t-muted);
  cursor: pointer; user-select: none;
}
.panel-toggle input { accent-color: var(--vx-a); cursor: pointer; }
</style>`;
}

function buildPanelHtml(presetSeeds) {
  const swatches = presetSeeds
    .map(
      ([name, hex], i) =>
        `<button class="vx-swatch" data-c="${hex}" title="${name}" style="background:${hex}" aria-pressed="${i === 0 ? "true" : "false"}"></button>`,
    )
    .join("\n    ");
  return `<div class="theme-panel">
  <div class="panel-row">
    <span class="panel-label">Seed</span>
    <input type="color" id="vx-seed" value="#3b82f6">
  </div>
  <div class="vx-swatches">
    ${swatches}
  </div>
  <button class="panel-btn" id="vx-shuffle">Shuffle seed</button>
  <label class="panel-toggle"><input type="checkbox" id="vx-dark"> Dark page</label>
</div>`;
}

function buildResolverScript(sem) {
  // Serialize the canonical tables so the page's resolver is provably the
  // same palette the API serves.
  const tables = JSON.stringify({
    core: sem.CORE,
    dark: sem.DARK_OVERRIDES,
    mixes: sem.MIXES,
    presets: sem.PRESET_SEEDS,
  });
  return `<script id="vx-resolver">
(function () {
  var TABLES = ${tables};
  var ACHROMATIC = 1e-6;
  function clamp01(v) { return Math.min(1, Math.max(0, v)); }
  function oklchFromRgb8(r, g, b) {
    function lin(v) { return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    var lr = lin(r / 255), lg = lin(g / 255), lb = lin(b / 255);
    var l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    var m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    var s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    var aOk = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
    var bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
    var L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
    var c = Math.sqrt(aOk * aOk + bOk * bOk);
    var h = Math.atan2(bOk, aOk) * 180 / Math.PI;
    if (h < 0) h += 360;
    return { l: L, c: c, h: h };
  }
  function hexToOklch(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return oklchFromRgb8(parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16));
  }
  function colorMix(top, base, pct) {
    var w1 = Math.min(1, Math.max(0, pct / 100)), w2 = 1 - w1;
    var h1 = top.color.h, h2 = base.color.h;
    var tA = top.color.c < ACHROMATIC || top.alpha <= 0;
    var bA = base.color.c < ACHROMATIC || base.alpha <= 0;
    if (tA && !bA) h1 = h2; else if (bA && !tA) h2 = h1;
    var d = h2 - h1;
    if (d > 180) d -= 360; else if (d < -180) d += 360;
    var h = h1 + w2 * d;
    var a = w1 * top.alpha + w2 * base.alpha;
    if (a <= 0) return { color: { l: 0, c: 0, h: 0 }, alpha: 0 };
    function chan(t, b) { return (w1 * top.alpha * t + w2 * base.alpha * b) / a; }
    return {
      color: { l: chan(top.color.l, base.color.l), c: chan(Math.max(0, top.color.c), Math.max(0, base.color.c)), h: h },
      alpha: a
    };
  }
  function css(c) {
    var h = ((c.color.h % 360) + 360) % 360;
    var core = clamp01(c.color.l).toFixed(4) + ' ' + Math.max(0, c.color.c).toFixed(4) + ' ' + h.toFixed(2);
    return c.alpha >= 1 ? 'oklch(' + core + ')' : 'oklch(' + core + ' / ' + clamp01(c.alpha).toFixed(2) + ')';
  }
  var OPAQUE = function (c) { return { color: c, alpha: 1 }; };
  var TRANSPARENT = { color: { l: 0, c: 0, h: 0 }, alpha: 0 };
  function parseOklchString(v) {
    var m = v.match(/oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)(?:\\s*\\/\\s*([\\d.]+))?\\)/);
    return m
      ? { color: { l: +m[1], c: +m[2], h: +m[3] }, alpha: m[4] === undefined ? 1 : +m[4] }
      : { color: { l: 0, c: 0, h: 0 }, alpha: 1 };
  }
  function componentValue2(name, seedAlpha, tokens) {
    if (name === 'seed') return seedAlpha;
    if (name === 'transparent') return TRANSPARENT;
    if (name.charAt(0) === '#') return OPAQUE(hexToOklch(name));
    var key = name.indexOf('vx-') === 0 ? name : 'vx-' + name;
    var v = tokens[key] || tokens[name];
    var parsed = parseOklchString(v || 'oklch(0 0 0)');
    return { color: parsed.color, alpha: parsed.alpha };
  }
  function resolveRamp(seedOklch, mode) {
    var seedAlpha = OPAQUE(seedOklch);
    var tokens = {};
    function evalCore(entries) {
      for (var i = 0; i < entries.length; i++) {
        var token = entries[i][0], formula = entries[i][1];
        if (formula.kind === 'fixed') tokens[token] = css(OPAQUE(hexToOklch(formula.hex)));
        else tokens[token] = css(colorMix(seedAlpha, OPAQUE(hexToOklch(formula.base)), formula.pct));
      }
    }
    evalCore(TABLES.core);
    if (mode === 'dark') evalCore(TABLES.dark);
    for (var i = 0; i < TABLES.mixes.length; i++) {
      var f = TABLES.mixes[i];
      var top = componentValue2(f.top, seedAlpha, tokens);
      var base = componentValue2(f.base, seedAlpha, tokens);
      tokens[f.token] = css(colorMix(top, base, f.pct));
    }
    return tokens;
  }
  function parseSeed(input) {
    var v = (input || '').trim().replace(/^#/, '');
    if (!/^[0-9a-fA-F]+$/.test(v) || (v.length !== 3 && v.length !== 6)) return null;
    if (v.length === 3) v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
    return oklchFromRgb8(parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16));
  }
  window.__vxResolveRamp = resolveRamp;
  window.__vxParseSeed = parseSeed;

  var root = document.documentElement;
  var seedInput = document.getElementById('vx-seed');
  var darkInput = document.getElementById('vx-dark');
  var shuffle = document.getElementById('vx-shuffle');
  var currentSeed = '#3b82f6';
  function apply() {
    var seed = window.__vxParseSeed(currentSeed) || window.__vxParseSeed('#3b82f6');
    var mode = darkInput && darkInput.checked ? 'dark' : 'light';
    var tokens = window.__vxResolveRamp(seed, mode);
    for (var k in tokens) root.style.setProperty('--' + k, tokens[k]);
  }
  function markSwatches(hex) {
    var swatches = document.querySelectorAll('.vx-swatch');
    for (var i = 0; i < swatches.length; i++) {
      swatches[i].setAttribute('aria-pressed', swatches[i].dataset.c.toLowerCase() === hex.toLowerCase() ? 'true' : 'false');
    }
  }
  if (seedInput) seedInput.addEventListener('input', function (e) { currentSeed = e.target.value; markSwatches(currentSeed); apply(); });
  var swatchButtons = document.querySelectorAll('.vx-swatch');
  for (var i = 0; i < swatchButtons.length; i++) {
    swatchButtons[i].addEventListener('click', function (e) {
      currentSeed = e.currentTarget.dataset.c;
      if (seedInput) seedInput.value = currentSeed;
      markSwatches(currentSeed);
      apply();
    });
  }
  if (darkInput) darkInput.addEventListener('change', apply);
  if (shuffle) shuffle.addEventListener('click', function () {
    var h = Math.floor(Math.random() * 360);
    var s = 0.55 + Math.random() * 0.35;
    var l = 0.5 + Math.random() * 0.1;
    function f(n) { var k = (n + h / 30) % 12; var a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); }
    function hx(x) { return Math.round(x * 255).toString(16).padStart(2, '0'); }
    currentSeed = '#' + hx(f(0)) + hx(f(8)) + hx(f(4));
    if (seedInput) seedInput.value = currentSeed;
    markSwatches(currentSeed);
    apply();
  });
  apply();
})();
</script>`;
}

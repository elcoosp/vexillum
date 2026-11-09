/**
 * Shared helpers for generating the c33 "stacked" and c34 "stat" collections.
 *
 * The two collections are hand-authored (like the c29 rebuild) rather than
 * converted from badge-collections.html: every construction sticks to the
 * takumi-safe kit recorded in worklog.md —
 *   - no mask-image, no transforms, no pseudo-elements, no negative margins;
 *   - px-anchored gradient centers, integer background geometry;
 *   - rgba() shadows only (oklch-alpha shadows render at full opacity);
 *   - icon defaults are single-<path> svgs (circle/line/rect rasterize wrong);
 *   - value-segment colors ride the --vx-v-* dual-seed token family so
 *     ?seed2= re-themes them, mirroring the seed2 codemod convention.
 */

export const ICONS = {
  layers:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 1.5 15 5 8 8.5 1 5ZM2.9 7.4 1 8.4 8 12l7-3.6-1.9-1L8 9.9 2.9 7.4ZM2.9 10.9 1 11.9 8 15.5l7-3.6-1.9-1L8 13.4 2.9 10.9Z"/></svg>',
  chart:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M2 13.5h2.4V8.2H2v5.3Zm4.8 0h2.4v-11H6.8v11Zm4.8 0H14V5.5h-2.4v8Z"/></svg>',
  star:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 1.6l1.86 3.77 4.16.61-3.01 2.93.71 4.14L8 11.1l-3.72 1.95.71-4.14L1.98 5.98l4.16-.61L8 1.6Z"/></svg>',
  bolt:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M9.5 1L3.5 9h3.4l-.9 6 6-8H8.6l.9-6Z"/></svg>',
  user:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 8.2a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2ZM2.5 14a5.5 5.5 0 0 1 11 0h-11Z"/></svg>',
  arrowUp:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 2l4.8 5.6H9.9V14H6.1V7.6H3.2L8 2Z"/></svg>',
  arrowDown:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M8 14L3.2 8.4h2.9V2h3.8v6.4h2.9L8 14Z"/></svg>',
  check:
    '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><path d="M6.5 11L3 7.5 4.4 6l2.1 2.1L11.6 3 13 4.4 6.5 11Z"/></svg>',
};

/**
 * Semantic token palette — fallbacks mirror the c01 seed family used by the
 * converter output. Value-side tokens are the vx-v-* dual-seed family.
 */
export const T = {
  sWhite: 'var(--vx-s-white, oklch(0.9925 0.0038 259.81))',
  s50: 'var(--vx-s-50, oklch(0.9812 0.0094 259.81))',
  s100: 'var(--vx-s-100, oklch(0.9661 0.0169 259.81))',
  s200: 'var(--vx-s-200, oklch(0.9435 0.0282 259.81))',
  b100: 'var(--vx-b-100, oklch(0.8819 0.0331 263.82))',
  b200: 'var(--vx-b-200, oklch(0.8200 0.0180 252.00))',
  b300: 'var(--vx-b-300, oklch(0.6820 0.0783 260.80))',
  tSubtle: 'var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))',
  tBody: 'var(--vx-t-body, oklch(0.4105 0.0542 259.75))',
  tHeading: 'var(--vx-t-heading, oklch(0.0935 0.0282 259.81))',
  a: 'var(--vx-a, oklch(0.6231 0.1880 259.81))',
  aBright: 'var(--vx-a-bright, oklch(0.7738 0.1128 259.81))',
  aSoft: 'var(--vx-a-soft, oklch(0.9100 0.0450 252.00))',
  aMuted: 'var(--vx-a-muted, oklch(0.9600 0.0180 252.00))',
  aDeep: 'var(--vx-a-deep, oklch(0.5109 0.1542 259.81))',
  aInk: 'var(--vx-a-ink, oklch(0.3427 0.1034 259.81))',
  aOn: 'var(--vx-a-on, oklch(1.0000 0.0000 89.88))',
  ok: 'var(--vx-ok, oklch(0.6959 0.1491 162.48))',
  warn: 'var(--vx-warn, oklch(0.7686 0.1647 70.08))',
  err: 'var(--vx-err, oklch(0.6368 0.2078 25.33))',
  dBg: 'var(--vx-d-bg, oklch(0.2492 0.0546 265.16))',
  dSurface: 'var(--vx-d-surface, oklch(0.2971 0.0301 259.81))',
  dBorder: 'var(--vx-d-border, oklch(0.4355 0.0700 259.75))',
  dTextMut: 'var(--vx-d-text-mut, oklch(0.6955 0.0529 261.02))',
  // dual-seed (value segment) family — mirrors of the base tokens
  vTHeading: 'var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))',
  vTBody: 'var(--vx-v-t-body, oklch(0.4105 0.0542 259.75))',
  vTSubtle: 'var(--vx-v-t-subtle, oklch(0.6937 0.0563 260.99))',
  vA: 'var(--vx-v-a, oklch(0.6231 0.1880 259.81))',
  vADeep: 'var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81))',
  vSWhite: 'var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))',
  vOk: 'var(--vx-v-ok, oklch(0.6959 0.1491 162.48))',
  vErr: 'var(--vx-v-err, oklch(0.6368 0.2078 25.33))',
};

/** pascal component name for a variant id, e.g. "c33-01" -> "C3301". */
export function componentName(id) {
  const [, c, v] = id.match(/^c(\d{2})-(\d{2})$/);
  return `C${c}${v}`;
}

/** Renders one TSX component file following the converter output layout. */
export function emitTsx(variant) {
  const name = componentName(variant.id);
  const params = ['label', 'value', 'extra', 'icon']
    .filter((k) => variant[k] !== false)
    .join(', ');
  // Dual-seed convention (mirrors scripts/seed2-value-tokens.mjs): every
  // element whose className carries the `value` token rides the vx-v-*
  // token family, so ?seed2= re-themes the value segment. All core tokens
  // (s-*, b-*, t-*, a-*, ok/warn/err, d-*) exist in the mirrored family.
  const jsx = variant.jsx
    .split("\n")
    .map((line) =>
      /\bclassName="[^"]*\bvalue\b/.test(line)
        ? line.replace(/var\(--vx-(?!v-)/g, "var(--vx-v-")
        : line,
    )
    .join("\n");
  return `// ${variant.id} · ${variant.title} — ${variant.collectionTitle}
// Authored for the ${variant.slug} collection by scripts/gen-collections — hand-tuned for takumi engine parity (do not convert).
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function ${name}({ ${params} }: BadgeProps) {
  return (
${jsx}
  );
}
`;
}

/** Serializes the new registry.json (collections + variants appended). */
export function buildRegistryPatch(collections, variants) {
  return { collections, variants };
}

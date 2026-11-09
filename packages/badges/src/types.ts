/**
 * The badge component contract (spec §3.1). Every generated badge component
 * receives these props; the compiler renders them with `__VX_*__` slot
 * markers, the preview with real values.
 */
import type { CSSProperties, ReactNode } from "react";

/** Slot markers embedded at compile time (never collide with badge text). */
export const LABEL_MARKER = "__VX_LABEL__";
export const VALUE_MARKER = "__VX_VALUE__";
export const EXTRA_MARKER = "__VX_EXTRA__";
export const EXTRA2_MARKER = "__VX_EXTRA2__";
export const ICON_MARKER = "__VX_ICON__";

/**
 * The frozen theme token vocabulary (mirrors crates/theme TOKENS).
 * Values are CSS colors; `undefined` tokens fall back to each template's
 * baked-in source value, which is what keeps the default render
 * pixel-identical to the source collections.
 */
export interface ThemeTokens {
  "label-bg"?: string;
  "label-fg"?: string;
  "value-bg"?: string;
  "value-fg"?: string;
  border?: string;
  divider?: string;
  accent?: string;
  "accent-fg"?: string;
  "icon-color"?: string;
  [token: string]: string | undefined;
}

export interface BadgeProps {
  /** Left slot text (rendered as {label} inside the template). */
  label?: ReactNode;
  /** Right slot text. */
  value?: ReactNode;
  /** Third-segment text for tri-segment / tag variants. */
  extra?: ReactNode;
  /** Fourth-segment text for quad variants (c17-08). */
  extra2?: ReactNode;
  /** Icon content: a real <svg> in the preview, the marker string at compile. */
  icon?: ReactNode;
  /** Theme tokens; converted to CSS custom properties on the root node. */
  theme?: ThemeTokens;
}

/**
 * Converts theme tokens into CSS custom properties for inline injection.
 * Only defined tokens are emitted, so an empty/undefined theme preserves
 * the per-template `var(--token, fallback)` source values.
 */
export function themeToVars(theme?: ThemeTokens): CSSProperties | undefined {
  if (!theme) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme)) {
    if (typeof v === "string" && v.length > 0) out[`--${k}`] = v;
  }
  return Object.keys(out).length > 0 ? (out as CSSProperties) : undefined;
}

/** Allows the `tw` attribute (vexillum's built-in Tailwind resolver) in JSX. */
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    tw?: string;
  }
}

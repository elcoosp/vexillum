/**
 * Theme plumbing for previews and the SPA: the default theme is empty on
 * purpose — every template's `var(--token, <source value>)` fallback then
 * reproduces the source collections exactly.
 */
import type { ReactElement, ReactNode } from "react";
import { themeToVars, type ThemeTokens } from "./types";

export const DEFAULT_THEME: ThemeTokens = {};

/** Wraps children in a node that defines the theme's custom properties. */
export function ThemeVars({
  tokens,
  children,
}: {
  tokens?: ThemeTokens;
  children: ReactNode;
}): ReactElement {
  return (
    <div data-vexillum-theme style={themeToVars(tokens) ?? undefined}>
      {children}
    </div>
  );
}

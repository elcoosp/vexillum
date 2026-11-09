/**
 * @vexillum/badges — the full badge library: registry of all structural variants
 * plus the authoring primitives (slots, theme).
 */
export { registry, variantIds } from "./registry";
export { IconSlot } from "./slots";
export { ThemeVars, DEFAULT_THEME } from "./theme";
export {
  LABEL_MARKER,
  VALUE_MARKER,
  EXTRA_MARKER,
  ICON_MARKER,
  themeToVars,
  type BadgeProps,
  type ThemeTokens,
} from "./types";

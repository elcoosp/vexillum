/**
 * Badge preview plumbing shared by Explore, Playground, Landing and the
 * dashboard theme gallery: variant typing, icon resolution (registry default
 * / curated slug / custom SVG) and a small client-side SVG sanitizer.
 */
import type { ComponentType, ReactElement, ReactNode } from "react";
import registryJson from "@vexillum/badges/registry.json";
import { registry } from "@vexillum/badges";
import type { ThemeTokens } from "@vexillum/badges";
import { semanticVarsDuo, type SemanticThemeSpec } from "@/lib/theme";
import { CURATED_ICONS, type IconMeta } from "@/lib/icon-catalog";

export type { SemanticThemeSpec } from "@/lib/theme";

export type RegistryJson = typeof registryJson;
export type VariantMeta = RegistryJson["variants"][number];
export type CollectionMeta = RegistryJson["collections"][number];

export const collections = registryJson.collections as CollectionMeta[];
export const variants = registryJson.variants as VariantMeta[];

export function collectionBySlug(slug: string): CollectionMeta | undefined {
  return collections.find((c) => c.slug === slug || c.id === slug);
}

export function variantById(id: string): VariantMeta | undefined {
  return variants.find((v) => v.id === id);
}

export function variantComponent(id: string): ComponentType<{
  label?: unknown;
  value?: unknown;
  extra?: unknown;
  extra2?: unknown;
  icon?: unknown;
  theme?: ThemeTokens;
}> | undefined {
  return registry[id] as unknown as ComponentType<{
    label?: unknown;
    value?: unknown;
    extra?: unknown;
    extra2?: unknown;
    icon?: unknown;
    theme?: ThemeTokens;
  }> | undefined;
}

/**
 * Simple Icons brand metadata (eager core: template defaults + popular
 * brands — the full 3,400+ set loads via `loadBrandCatalog()` from
 * `@/lib/icon-library`). All slugs resolve on the API via simpleicons-rs.
 */
export { CURATED_ICONS };
export type { IconMeta };

export function curatedIcon(slug: string): IconMeta | undefined {
  return CURATED_ICONS.find((i) => i.slug === slug);
}

/**
 * Builds an inline-SVG React node from lazily-loaded curated path data
 * (see the dynamic `import("@/lib/icon-paths")` in the playground).
 */
export function curatedIconNode(path: string, size: number, color?: string): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color ?? "currentColor"} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/** One icondata catalog entry (shape mirrors crates/icons CatalogEntry). */
export interface IconEntryParts {
  /** viewBox */
  v: string;
  /** inner SVG markup */
  d: string;
  f?: string;
  st?: string;
  sw?: string;
  slc?: string;
  slj?: string;
}

/**
 * Builds an inline-SVG React node from an icondata catalog entry, honoring
 * its per-icon `viewBox` and stroke attributes (parity with the server's
 * `wrap_entry_svg`): stroke-based entries (fill none + stroke) colorize via
 * `stroke`, everything else via `fill`.
 */
export function iconNodeFromEntry(entry: IconEntryParts, size: number, color?: string): ReactElement {
  // parity with the server's `stroke_or_fill` for IconColor::Current (the
  // default since icon.color flipped to themed ink): the resolved color —
  // currentColor when absent — always REPLACES the painted attribute;
  // stroke-based entries (fill none + a stroke) colorize via stroke
  const strokeBased = entry.f === "none" && !!entry.st;
  const paint = color ?? "currentColor";
  const fill = strokeBased ? "none" : paint;
  const stroke = strokeBased ? paint : entry.st;
  return (
    <svg
      viewBox={entry.v}
      width={size}
      height={size}
      fill={fill}
      stroke={stroke}
      strokeWidth={entry.sw}
      strokeLinecap={entry.slc as React.SVGAttributes<SVGSVGElement>["strokeLinecap"]}
      strokeLinejoin={entry.slj as React.SVGAttributes<SVGSVGElement>["strokeLinejoin"]}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: entry.d }}
    />
  );
}

const FORBIDDEN_TAGS = /<\s*(script|foreignObject|iframe|object|embed|link|meta)\b/gi;
const EVENT_ATTRS = /\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi;
const JS_URLS = /(href|src|xlink:href)\s*=\s*("|\')?\s*javascript:/gi;

/**
 * Client-side sanity filter for custom SVG pasted into the playground /
 * icon upload panel. The API runs the full vexillum-icons sanitizer; this keeps
 * obviously hostile markup out of the DOM (defense in depth, not a boundary).
 */
export function sanitizeSvg(source: string): { svg: string | null; error?: string } {
  const trimmed = source.trim();
  if (!trimmed) return { svg: null, error: "Paste SVG markup to continue." };
  if (!/<svg[\s>]/i.test(trimmed)) return { svg: null, error: "That doesn't look like SVG — expected an <svg> root element." };
  if (trimmed.length > 32_768) return { svg: null, error: "SVG too large (max 32 KB)." };
  if (FORBIDDEN_TAGS.test(trimmed)) return { svg: null, error: "Rejected: script/iframe/object elements are not allowed." };
  if (EVENT_ATTRS.test(trimmed) || JS_URLS.test(trimmed)) return { svg: null, error: "Rejected: event handlers and javascript: URLs are not allowed." };
  const cleaned = trimmed
    .replace(FORBIDDEN_TAGS, "<rejected")
    .replace(EVENT_ATTRS, "")
    .replace(JS_URLS, "$1=$2blocked:");
  return { svg: cleaned };
}

/**
 * The registry's default icon is trusted first-party markup generated by the
 * compiler pipeline (same policy as the original explorer).
 */
export function defaultIconNode(svg: string): ReactElement {
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/**
 * Maps a resolved semantic palette to CSS custom properties
 * (`vx-s-white` → `--vx-s-white`) on the preview wrapper. The generated
 * badge components reference `var(--vx-*, fallback)` — setting the full
 * ramp on an ancestor themes the preview exactly like the server's
 * textual substitution does, with byte-identical values (shared fixture).
 *
 * The value-side `vx-v-*` family is ALWAYS set: the templates address the
 * value segment through `var(--vx-v-*, fallback)`, and the family mirrors
 * the base seed when no value seed is picked (the server does the same),
 * so seeded previews stay pixel-identical with or without seed2.
 *
 * The mapped object is cached per (seed, valueSeed, mode): every explore
 * card asks for the same ramp each render, and returning the identical
 * reference keeps React's style diffing a pointer compare.
 */
const varsStyleCache = new Map<string, Record<string, string> | null>();

function semanticVarsStyle(
  seed: string,
  mode: "light" | "dark",
  valueSeed?: string,
): Record<string, string> | null {
  const key = `${seed.trim().toLowerCase()}|${(valueSeed ?? "").trim().toLowerCase()}|${mode}`;
  let cached = varsStyleCache.get(key);
  if (cached === undefined) {
    const ramp = semanticVarsDuo(seed, valueSeed, mode);
    if (ramp) {
      const style: Record<string, string> = {};
      for (const [key, value] of Object.entries(ramp)) {
        style[`--${key}`] = value;
      }
      cached = style;
    } else {
      cached = null;
    }
    if (varsStyleCache.size >= 1024) varsStyleCache.clear();
    varsStyleCache.set(key, cached);
  }
  return cached;
}

/**
 * The surface a themed preview sits on. Dark mode re-derives the whole
 * badge palette over a dark page (the design source's
 * `:root[data-page="dark"]`), so typography-only badges (c16 Minimal and
 * friends) paint light ink on transparent surfaces — correct on a dark
 * page, invisible on a white card. Containers rendering themed previews
 * apply this style so the preview surface matches the mode's page: the
 * exact `vx-s-white` value the ramp itself uses.
 */
export function previewSurfaceStyle(
  semantic: SemanticThemeSpec | null | undefined,
): Record<string, string> | undefined {
  if (!semantic || semantic.mode !== "dark") return undefined;
  const surface = semanticVarsDuo(semantic.seed, semantic.valueSeed, semantic.mode)?.["vx-s-white"];
  return surface ? { background: surface } : undefined;
}

export interface PreviewSpec {
  variant: VariantMeta;
  label?: string;
  value?: string;
  extra?: string;
  extra2?: string;
  /**
   * Declarative icon mode: `"default"` → the registry's default icon.
   * Superseded by `iconNode` whenever the caller provides one; kept so
   * Explore/Landing/Themes keep their `icon: "default"` contract.
   */
  icon?: "default" | null;
  /**
   * Semantic theming (seed presets, custom seeds, dark mode): when set, the
   * preview applies the full resolved `--vx-*` ramp on a wrapper — the same
   * contract as `?seed=&mode=` on the API, byte-identical values.
   */
  semantic?: SemanticThemeSpec | null;
  /** Legacy palette theming (custom token maps) — still applied as CSS vars. */
  tokens?: ThemeTokens;
  /**
   * Explicit icon node for the preview:
   * - a `ReactElement` → used verbatim (curated slug or sanitized custom SVG);
   * - `undefined` → "default" mode — the registry default icon when the
   *   variant has one;
   * - `null` → explicit "none" — an empty stand-in is rendered instead.
   *
   * The generated components render `{icon ?? <IconSlot />}`, and `null`
   * triggers that fallback exactly like `undefined` — so for any variant with
   * an icon slot, `renderVariant` ALWAYS passes a concrete, non-nullish
   * element (empty `<span aria-hidden="true" />` when nothing else applies).
   * Otherwise the literal `__VX_ICON__` compile-time SSR marker would leak
   * into the browser as visible text.
   */
  iconNode?: ReactElement | null;
}

/**
 * Maps theme tokens to CSS custom properties (`label-bg` → `--label-bg`).
 * The generated badge components read `var(--token, source-fallback)` —
 * setting the properties on an ancestor (display:contents wrapper) themes
 * the preview exactly like the server's textual substitution does.
 */
function tokenVarsStyle(tokens: ThemeTokens): Record<string, string> {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === "string" && value.length > 0) {
      style[`--${key}`] = value;
    }
  }
  return style;
}

/**
 * Renders a variant through the generated registry component. Icon slots are
 * always fed a real element — never `undefined`/`null` — so the IconSlot
 * marker fallback can never surface in a client-side preview. Theme tokens
 * (when provided) are applied as CSS custom properties on a `display:
 * contents` wrapper, so every `var(--token, …)` in the badge resolves to the
 * themed value in the live preview — same contract as `?theme=` on the API.
 */
export function renderVariant(spec: PreviewSpec): ReactElement | null {
  const Component = variantComponent(spec.variant.id);
  if (!Component) return null;
  const v = spec.variant;
  let icon: ReactElement | undefined;
  if (v.hasIcon) {
    if (spec.iconNode != null) {
      // explicit node (curated slug / custom SVG / playground element) wins
      icon = spec.iconNode;
    } else if (spec.iconNode === undefined && v.defaultIcon) {
      // "default" mode — registry icon (Explore/Landing/Themes pass
      // icon: "default"; Playground passes iconNode: undefined)
      icon = defaultIconNode(v.defaultIcon);
    } else {
      // explicit "none" (iconNode === null) or no default to fall back to —
      // render an empty non-nullish node so `{icon ?? <IconSlot />}` never
      // fires and the __VX_ICON__ marker stays invisible
      icon = <span aria-hidden="true" />;
    }
  }
  const themed = spec.semantic != null || (spec.tokens && Object.keys(spec.tokens).length > 0);
  const component = (
    <Component
      label={spec.label ?? v.defaultLabel}
      value={v.hasValue ? (spec.value ?? v.defaultValue) : undefined}
      extra={v.hasExtra ? (spec.extra ?? v.defaultExtra ?? undefined) : undefined}
      extra2={v.hasExtra2 ? (spec.extra2 ?? v.defaultExtra2 ?? undefined) : undefined}
      icon={icon}
      theme={spec.tokens}
    />
  );
  // the themed wrapper exists only for themed previews — unthemed markup
  // stays byte-identical to the pre-theme renderer
  if (!themed) return component;
  if (spec.semantic) {
    const varsStyle = semanticVarsStyle(
      spec.semantic.seed,
      spec.semantic.mode,
      spec.semantic.valueSeed,
    );
    if (varsStyle) {
      return (
        <div data-vx-themed="true" style={{ display: "contents", ...varsStyle }}>
          {component}
        </div>
      );
    }
    return component;
  }
  return (
    <div data-vx-themed="true" style={{ display: "contents", ...tokenVarsStyle(spec.tokens!) }}>
      {component}
    </div>
  );
}

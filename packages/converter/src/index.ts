/**
 * @vexillum/converter — turns the badge collection HTML (HTML + CSS, one file)
 * into per-variant React TSX components, a registry manifest, and global
 * keyframes CSS.
 *
 * Public API: `convert(sourceHtml)`.
 */
import { parseDocument } from "./dom";
import { children, classes, descendants, textOf } from "./dom";
import { parseStylesheet, type KeyframesRule } from "./css";
import { computeTreeStyles } from "./style";
import { extractCollections, extractVariants } from "./collect";
import { materialize, type CNode } from "./materialize";
import { classifyBackground, tokenizeDeclarations, type Surface } from "./tokens";
import { emitTsx, pascalComponentName } from "./emit";

export interface ConvertedVariant {
  id: string;
  collection: string;
  collectionSlug: string;
  index: number;
  title: string;
  component: string;
  tsx: string;
  hasIcon: boolean;
  hasLabel: boolean;
  hasValue: boolean;
  hasExtra: boolean;
  defaultIcon: string | null;
  defaultLabel: string;
  defaultValue: string;
  defaultExtra: string | null;
  animations: Array<{ name: string; durationMs: number; timing: string; iteration: string }>;
  /** token → original resolved value (documentation for default themes) */
  resolvedTokens: Record<string, string>;
}

export interface ConversionResult {
  collections: Array<{ id: string; slug: string; title: string; description: string }>;
  variants: ConvertedVariant[];
  registry: {
    collections: Array<{ id: string; slug: string; title: string; description: string }>;
    variants: Array<{
      id: string;
      collection: string;
      title: string;
      hasIcon: boolean;
      hasLabel: boolean;
      hasValue: boolean;
      hasExtra: boolean;
      defaultIcon: string | null;
      defaultLabel: string;
      defaultValue: string;
      defaultExtra: string | null;
      animations: Array<{ name: string; durationMs: number; timing: string; iteration: string }>;
    }>;
  };
  keyframesCss: string;
  /** tailwind-relevant shared base declarations (for docs) */
  sharedBadgeStyle: Record<string, string>;
}

/** Finds conflicting keyframe names (same name, different bodies). */
function keyframeRenamesFor(
  keyframes: KeyframesRule[],
  usagePerVariant: Map<string, Set<string>>,
): Map<string, string> {
  // canonical body per name
  const canonical = new Map<string, string>();
  const conflicted = new Set<string>();
  for (const kf of keyframes) {
    const body = JSON.stringify(kf.stops);
    if (!canonical.has(kf.name)) {
      canonical.set(kf.name, body);
    } else if (canonical.get(kf.name) !== body) {
      conflicted.add(kf.name);
    }
  }
  const renames = new Map<string, string>();
  for (const [variantId, names] of usagePerVariant) {
    for (const name of names) {
      if (conflicted.has(name)) {
        renames.set(`${variantId}::${name}`, `${variantId}-${name}`);
      }
    }
  }
  return renames;
}

function keyframesKey(kf: KeyframesRule): string {
  return kf.name;
}

export function convert(sourceHtml: string): ConversionResult {
  const doc = parseDocument(sourceHtml);
  const body = children(doc).find((c) => c.tagName === "body");
  if (!body) throw new Error("no <body>");

  // stylesheet lives in <head><style>
  const head = children(doc).find((c) => c.tagName === "head");
  const styleEl = head
    ? descendants(head).find((c) => c.tagName === "style")
    : undefined;
  const styleText = styleEl ? textOf(styleEl) : "";
  const parsed = parseStylesheet(styleText);

  const collections = extractCollections(body);
  const variants = extractVariants(body);
  if (collections.length === 0) throw new Error("no collections found");
  if (variants.length === 0) throw new Error("no variants found");

  // keyframes usage per variant (for conflict renames)
  const usagePerVariant = new Map<string, Set<string>>();
  for (const v of variants) {
    const names = new Set<string>();
    for (const rule of parsed.rules) {
      if (!rule.selector.includes(`.${v.id}`)) continue;
      const anim = rule.declarations["animation"];
      if (anim) {
        const m = anim.match(/^([a-zA-Z][\w-]*)/);
        if (m) names.add(m[1]);
      }
    }
    usagePerVariant.set(v.id, names);
  }
  const renames = keyframeRenamesFor(parsed.keyframes, usagePerVariant);

  // dedupe keyframes by name, keeping first body; emit renamed variants too
  const seen = new Map<string, KeyframesRule>();
  const renamedRules: Array<{ name: string; rule: KeyframesRule }> = [];
  for (const kf of parsed.keyframes) {
    if (!seen.has(kf.name)) seen.set(kf.name, kf);
  }
  for (const [key, newName] of renames) {
    const [variantId, origName] = key.split("::");
    const source = seen.get(origName);
    if (source) renamedRules.push({ name: newName, rule: source });
    void variantId;
  }

  const keyframesCss = [
    ...[...seen.values()].map((kf) => renderKeyframes(kf.name, kf)),
    ...renamedRules.map(({ name, rule }) => renderKeyframes(name, rule)),
  ].join("\n");

  const collectionById = new Map(collections.map((c) => [c.id, c]));

  const converted: ConvertedVariant[] = [];
  const resolvedByVariant = new Map<string, Record<string, string>>();

  for (const v of variants) {
    const styles = computeTreeStyles(v.badge, parsed.rules, v.id);
    // scope global conflict renames ("${variantId}::${name}") to this variant
    const variantRenames = new Map<string, string>();
    for (const [key, newName] of renames) {
      const [vid, name] = key.split("::");
      if (vid === v.id) variantRenames.set(name, newName);
    }
    const result = materialize(v.badge, styles, v.id, variantRenames);

    // theme tokenization across the tree + collect resolved defaults.
    // Text tokens are surface-aware: the walk tracks the nearest effective
    // background so label/value text landing on transparent/light surfaces
    // gets the dark on-light inks (label-ink/value-ink) instead of the
    // -fg inks that pair with themed segment backgrounds.
    const resolved: Record<string, string> = {};
    const tokenizeTree = (node: CNode, isRoot: boolean, inherited: Surface): void => {
      const cls = node.attrs["class"] ?? "";
      const own = classifyBackground(
        node.style["background"] ?? node.style["background-color"],
      );
      // own non-transparent background wins; explicit transparent resets to
      // the page surface; no declaration inherits the ancestor surface
      const surface: Surface =
        own !== null && own !== "transparent" ? own : own === "transparent" ? "transparent" : inherited;
      const t = tokenizeDeclarations(cls, isRoot, node.style, surface);
      node.style = t.declarations;
      Object.assign(resolved, t.resolved);
      for (const c of node.children) {
        if (c.type === "el") tokenizeTree(c.node, false, surface);
      }
    };
    // the page under every badge is the app's white card surface
    tokenizeTree(result.root, true, "transparent");
    resolvedByVariant.set(v.id, resolved);

    // Column-layout cards self-constrain the way the source page did: the
    // collection grid lays variants out in 326px cells ((1400 - 3×32) / 4),
    // and long value text wraps inside that box instead of running off the
    // canvas (pull quote c06-15). Default content renders unchanged (every
    // column variant's natural width is ≤ 326px), so this is overflow
    // behavior only.
    if (result.root.style["flex-direction"] === "column") {
      result.root.style["max-width"] ??= "326px";
      const valueNode = result.slotNodes.value;
      if (valueNode && valueNode.style["white-space"] === undefined) {
        valueNode.style["white-space"] = "normal";
      }
    }

    const slotOf = (expr: string) => result.slots.find((s) => s.expr === expr);
    const label = slotOf("label");
    const value = slotOf("value");
    const extra = slotOf("extra");
    const hasLabel = Boolean(label);
    const hasValue = Boolean(value);
    const hasExtra = Boolean(extra);

    // value slot may be absent (icon-only); ensure both markers exist per contract
    const defaultLabel = label?.original ?? "";
    const defaultValue = value?.original ?? label?.original ?? "";
    const defaultExtra = extra?.original ?? null;

    const collection = collectionById.get(v.collection);
    const tsx = emitTsx({
      variantId: v.id,
      title: v.title,
      collectionTitle: collection?.title ?? v.collection,
      tree: result.root,
      hasIcon: result.iconSlot,
      hasLabel,
      hasValue,
      hasExtra,
    });

    converted.push({
      id: v.id,
      collection: v.collection,
      collectionSlug: collection?.slug ?? v.collection,
      index: v.index,
      title: v.title,
      component: pascalComponentName(v.id),
      tsx,
      hasIcon: result.iconSlot,
      hasLabel,
      hasValue,
      hasExtra,
      defaultIcon: result.defaultIcon,
      defaultLabel,
      defaultValue,
      defaultExtra,
      animations: result.animations,
      resolvedTokens: resolved,
    });
  }

  const registry = {
    collections: collections.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
    })),
    variants: converted.map((v) => ({
      id: v.id,
      collection: v.collection,
      title: v.title,
      hasIcon: v.hasIcon,
      hasLabel: v.hasLabel,
      hasValue: v.hasValue,
      hasExtra: v.hasExtra,
      defaultIcon: v.defaultIcon,
      defaultLabel: v.defaultLabel,
      defaultValue: v.defaultValue,
      defaultExtra: v.defaultExtra,
      animations: v.animations,
    })),
  };

  // shared badge style for documentation
  const sharedBadgeStyle =
    parsed.rules.find((r) => r.selector === ".badge")?.declarations ?? {};

  return {
    collections: collections.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
    })),
    variants: converted,
    registry,
    keyframesCss,
    sharedBadgeStyle,
  };
}

function renderKeyframes(name: string, kf: KeyframesRule): string {
  const stops = kf.stops
    .map((s) => `  ${s.stop} { ${Object.entries(s.declarations).map(([k, v]) => `${k}: ${v}`).join("; ")}; }`)
    .join("\n");
  return `@keyframes ${name} {\n${stops}\n}`;
}

export { pascalComponentName };

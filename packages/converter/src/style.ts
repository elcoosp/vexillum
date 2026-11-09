/**
 * Selector matching + cascade for the badge stylesheet.
 *
 * Supported selector shapes (everything the source collections use):
 *   .badge            — shared base
 *   .badge svg        — tag descendant
 *   .c01-01           — variant root
 *   .c01-01 .label    — variant descendant (any depth)
 *   .heatmap span     — bare tag compounds
 *   .scatter span.on  — tag + class compounds
 *   .c01-01 .x::before / ::after
 *   .av:first-child / .seg:last-child
 *   .bars span:nth-child(2)
 *   .step + .step     — adjacent sibling
 *   .c11-11 > *       — child combinator + universal
 * Inline `style="…"` attributes participate with the highest priority.
 */
import type { El } from "./dom";
import { children, classes, descendants, parentOf } from "./dom";
import { isBadgeRule, parseDeclarations, splitPseudo, type CssRule } from "./css";

export interface NodeStyle {
  /** Non-pseudo declarations in cascade order. */
  declarations: Record<string, string>;
  /** Materializable pseudo-element declarations. */
  before?: Record<string, string>;
  after?: Record<string, string>;
}

type Combinator = "desc" | "child" | "adj";

interface SelectorPart {
  comb: Combinator;
  compound: string;
}

/** Splits a selector into (combinator, compound) pairs, left to right. */
function parseCombinators(selector: string): SelectorPart[] {
  const normalized = selector.trim().replace(/\s*([+>])\s*/g, " $1 ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const out: SelectorPart[] = [];
  let comb: Combinator = "desc";
  for (const token of tokens) {
    if (token === ">") {
      comb = "child";
      continue;
    }
    if (token === "+") {
      comb = "adj";
      continue;
    }
    out.push({ comb, compound: token });
    comb = "desc";
  }
  return out;
}

interface CompoundMatch {
  base: string;
  nth: number | null;
  first: boolean;
  last: boolean;
}

/** Strips trailing positional pseudo-classes from a compound. */
function parseCompound(compound: string): CompoundMatch {
  const flags: CompoundMatch = { base: compound, nth: null, first: false, last: false };
  flags.base = flags.base
    .replace(/:nth-child\((\d+)\)/gi, (_, n: string) => {
      flags.nth = Number(n);
      return "";
    })
    .replace(/:first-child/gi, () => {
      flags.first = true;
      return "";
    })
    .replace(/:last-child/gi, () => {
      flags.last = true;
      return "";
    })
    .trim();
  return flags;
}

function elementSiblings(el: El): El[] {
  const parent = parentOf(el);
  return parent ? children(parent) : [el];
}

/**
 * One compound (e.g. `span.on:nth-child(2)`) against one element.
 * A part matches when it equals the tag name OR is one of the element's
 * classes; `*` (and an empty base) matches everything.
 */
function matchesCompound(el: El, compound: string, indexAmongSiblings: number): boolean {
  const { base, nth, first, last } = parseCompound(compound);
  const siblings = first || last || nth !== null ? elementSiblings(el) : null;
  if (siblings) {
    const idx = indexAmongSiblings >= 0 ? indexAmongSiblings : siblings.indexOf(el) + 1;
    if (nth !== null && nth !== idx) return false;
    if (first && siblings[0] !== el) return false;
    if (last && siblings[siblings.length - 1] !== el) return false;
  }
  if (base === "*" || base === "") return true;
  const cs = classes(el);
  for (const part of base.split(".").filter(Boolean)) {
    if (el.tagName === part) continue; // bare tag (span, svg, path, …)
    if (cs.includes(part)) continue; // class
    return false;
  }
  return true;
}

/** Right-to-left matching across descendant / child / adjacent combinators. */
function matchesSelector(el: El, selector: string, indexAmongSiblings: number): boolean {
  const parts = parseCombinators(selector);
  if (parts.length === 0) return false;
  const lastPart = parts[parts.length - 1];
  if (!matchesCompound(el, lastPart.compound, indexAmongSiblings)) return false;
  let current: El | null = el;
  for (let i = parts.length - 2; i >= 0; i--) {
    const { compound } = parts[i];
    // the combinator BETWEEN parts[i] and parts[i+1] is attached to parts[i+1]
    const comb = parts[i + 1].comb;
    if (!current) return false;
    if (comb === "child") {
      current = parentOf(current);
      if (!current || !matchesCompound(current, compound, -1)) return false;
    } else if (comb === "adj") {
      const parent = parentOf(current);
      if (!parent) return false;
      const siblings = children(parent);
      const pos = siblings.indexOf(current);
      if (pos <= 0) return false;
      current = siblings[pos - 1];
      if (!matchesCompound(current, compound, -1)) return false;
    } else {
      // descendant: some ancestor must match; matching continues above it
      let ancestor = parentOf(current);
      let matched: El | null = null;
      while (ancestor) {
        if (matchesCompound(ancestor, compound, -1)) {
          matched = ancestor;
          break;
        }
        ancestor = parentOf(ancestor);
      }
      if (!matched) return false;
      current = matched;
    }
  }
  return true;
}

/** Index of el among its element siblings (1-based, CSS nth-child semantics). */
export function siblingIndex(el: El): number {
  return elementSiblings(el).indexOf(el) + 1;
}

/**
 * Computes the cascade for one element given the badge-scoped rules.
 * Rules apply in source order; later declarations win on equal specificity
 * (the source file is written with that assumption; we additionally sort by
 * specificity: shared < variant-descendant). Inline style attributes win
 * over every rule.
 */
export function computeStyle(
  el: El,
  rules: CssRule[],
  variantId: string,
): NodeStyle {
  const idx = siblingIndex(el);
  const matches: Array<{ spec: number; order: number; decls: Record<string, string> }> = [];
  rules.forEach((rule, order) => {
    // badge-scoped rules, or rules scoped to this variant id (synthetic
    // fixtures may use non cNN-MM ids)
    if (!isBadgeRule(rule.selector) && !rule.selector.startsWith(`.${variantId}`)) return;
    const { base, pseudo } = splitPseudo(rule.selector);
    if (pseudo) return; // pseudo handled separately
    if (!matchesSelector(el, base, idx)) return;
    const compounds = parseCombinators(base).length;
    // specificity approximation: variant-scoped (2 compounds) beats shared (1)
    const isVariant = base.includes(`.${variantId}`);
    const spec = (isVariant ? 2 : 1) * 10 + compounds;
    matches.push({ spec, order, decls: rule.declarations });
  });
  matches.sort((a, b) => a.spec - b.spec || a.order - b.order);

  const declarations: Record<string, string> = {};
  for (const m of matches) Object.assign(declarations, m.decls);

  // inline style attribute: highest cascade priority
  const styleAttr = el.attrs?.find((a) => a.name === "style")?.value;
  if (styleAttr) Object.assign(declarations, parseDeclarations(styleAttr));

  // pseudo-elements: only from variant-scoped rules targeting this element
  let before: Record<string, string> | undefined;
  let after: Record<string, string> | undefined;
  rules.forEach((rule) => {
    const { base, pseudo } = splitPseudo(rule.selector);
    if (!pseudo) return;
    if (!matchesSelector(el, base, idx)) return;
    if (pseudo === "before") before = { ...(before ?? {}), ...rule.declarations };
    else after = { ...(after ?? {}), ...rule.declarations };
  });

  return { declarations, before, after };
}

/**
 * Computes styles for every element in the subtree (document order).
 */
export function computeTreeStyles(
  root: El,
  rules: CssRule[],
  variantId: string,
): Map<El, NodeStyle> {
  const map = new Map<El, NodeStyle>();
  for (const el of [root, ...descendants(root)]) {
    map.set(el, computeStyle(el, rules, variantId));
  }
  return map;
}

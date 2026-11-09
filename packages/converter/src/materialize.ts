/**
 * DOM transforms that make the source markup renderer-agnostic.
 *
 * Produces an explicit intermediate tree (CNode) rather than mutating the
 * parse5 tree:
 *  - pseudo-elements (::before/::after) materialized into real span nodes
 *  - `inset` expanded into longhands
 *  - the first SVG becomes the icon slot; default icon HTML captured
 *  - text slots (label/value/extra) identified and replaced with expressions
 *  - animated elements tagged with data-anim
 */
import type { El } from "./dom";
import { attr, classes, descendants, parentOf } from "./dom";
import type { NodeStyle } from "./style";
import { parseAnimationShorthand } from "./animation";

export interface CNode {
  tag: string;
  attrs: Record<string, string>;
  style: Record<string, string>;
  children: CChild[];
}

export type CChild =
  | { type: "el"; node: CNode }
  | { type: "text"; text: string }
  | { type: "expr"; name: "label" | "value" | "extra" | "icon" };

export interface SlotInfo {
  expr: "label" | "value" | "extra";
  original: string;
}

export interface AnimationInfo {
  name: string;
  durationMs: number;
  timing: string;
  iteration: string;
}

export interface MaterializeResult {
  root: CNode;
  iconSlot: boolean;
  defaultIcon: string | null;
  slots: SlotInfo[];
  /** slot expr → the CNode that hosts it (for post-passes) */
  slotNodes: Partial<Record<"label" | "value" | "extra", CNode>>;
  animations: AnimationInfo[];
}

const SVG_TAGS = new Set([
  "svg", "path", "line", "polyline", "polygon", "rect", "circle",
  "ellipse", "g", "use", "defs", "symbol",
]);

const SELF_CLOSING_SVG = new Set([
  "path", "line", "polyline", "polygon", "rect", "circle", "ellipse", "use",
]);

function isSvgFamily(el: El): boolean {
  return SVG_TAGS.has(el.tagName);
}

function directText(el: El): string {
  let out = "";
  for (const n of el.childNodes ?? []) {
    if ((n as { nodeName?: string }).nodeName === "#text") {
      out += (n as { value: string }).value;
    }
  }
  return out.trim();
}

/** Expands `inset: 3px` into top/right/bottom/left longhands. */
export function expandInset(decls: Record<string, string>): Record<string, string> {
  const out = { ...decls };
  const inset = out["inset"];
  if (inset !== undefined) {
    delete out["inset"];
    const parts = inset.split(/\s+/);
    const [t, r = t, b = t, l = r] = parts;
    if (out["top"] === undefined) out["top"] = t;
    if (out["right"] === undefined) out["right"] = r;
    if (out["bottom"] === undefined) out["bottom"] = b;
    if (out["left"] === undefined) out["left"] = l;
  }
  return out;
}

/** Serializes an element subtree back to HTML (used for the default icon). */
export function serializeElement(el: El): string {
  const attrs = el.attrs
    .map((a) => ` ${a.name}="${a.value.replace(/"/g, "&quot;")}"`)
    .join("");
  const kids = (el.childNodes ?? [])
    .map((n) => {
      if ((n as { nodeName?: string }).nodeName === "#text") return (n as { value: string }).value;
      return serializeElement(n as El);
    })
    .join("");
  const tag = el.tagName;
  if (kids.length === 0 && SELF_CLOSING_SVG.has(tag)) return `<${tag}${attrs}/>`;
  return `<${tag}${attrs}>${kids}</${tag}>`;
}

/** Decodes CSS escape sequences (`\2191 ` → "↑", `\+` → "+") in content strings. */
function decodeCssEscapes(s: string): string {
  return s
    .replace(/\\([0-9a-fA-F]{1,6})(\r\n|[ \t\r\n\f])?/g, (_, hex: string, ws: string | undefined) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) + (ws ? "" : "") : _;
    })
    .replace(/\\(.)/g, "$1");
}

/**
 * Materializes one pseudo-element as a real child span.
 *
 * Pseudo-elements never match the page's `* { box-sizing: border-box }`
 * rule (universal selectors don't match pseudo-elements), so they lay out
 * with the CSS default `content-box`. Real elements in vexillum default to
 * `border-box`, so the materialized span pins `content-box` explicitly —
 * otherwise bordered/arced pseudos (gauge rings, frames) shrink by their
 * border/padding. Empty-content shape pseudos are kept: they are pure
 * decoration (triangles, rings, stripes) and carry their own styles.
 */
function pseudoToChild(which: "before" | "after", decls: Record<string, string>): CChild | null {
  const d = expandInset(decls);
  const contentRaw = d["content"] ?? "''";
  delete d["content"];
  if (contentRaw === "none" || contentRaw === "normal") return null;
  const cm = contentRaw.match(/^(?:'([^']*)'|"([^"]*)")$/);
  const text = cm ? decodeCssEscapes(cm[1] ?? cm[2] ?? "") : contentRaw;

  if (d["box-sizing"] === undefined) d["box-sizing"] = "content-box";

  const children: CChild[] = [];
  if (text.length > 0) children.push({ type: "text", text });
  return {
    type: "el",
    node: {
      tag: "span",
      attrs: { "data-pseudo": which, "aria-hidden": "true" },
      style: d,
      children,
    },
  };
}

/**
 * Main entry: converts the badge subtree into an emit-ready CNode tree.
 * Pure: the parse5 tree is only read (plus explicit width/height attrs on
 * the icon svg so the substituted icon keeps the source sizing).
 */
export function materialize(
  root: El,
  styles: Map<El, NodeStyle>,
  variantId: string,
  keyframeRenames: Map<string, string>,
): MaterializeResult {
  const animations: AnimationInfo[] = [];
  const order = new Map<El, number>();
  [root, ...descendants(root)].forEach((el, i) => order.set(el, i));

  let iconSlot = false;
  let defaultIcon: string | null = null;

  // ---------- icon slot: first svg in document order ----------
  const svgs = [root, ...descendants(root)].filter((el) => el.tagName === "svg");
  const iconEl = svgs[0] ?? null;
  if (iconEl) {
    const st = styles.get(iconEl);
    const w = attr(iconEl, "width") ?? st?.declarations["width"]?.replace(/px$/, "");
    const h = attr(iconEl, "height") ?? st?.declarations["height"]?.replace(/px$/, "");
    if (w && !attr(iconEl, "width")) iconEl.attrs.push({ name: "width", value: w });
    if (h && !attr(iconEl, "height")) iconEl.attrs.push({ name: "height", value: h });
    defaultIcon = serializeElement(iconEl).trim();
    iconSlot = true;
  }

  // ---------- text slot candidates ----------
  const candidates = [root, ...descendants(root)]
    .filter((el) => !isSvgFamily(el))
    .map((el) => ({ el, text: directText(el), idx: order.get(el) ?? -1 }))
    .filter((c) => c.text.length > 0);
  const used = new Set<El>();
  const inSubtree = (rootEl: El, candidate: El): boolean => {
    let cur: El | null = candidate;
    while (cur) {
      if (cur === rootEl) return true;
      cur = parentOf(cur);
    }
    return false;
  };

  const findLabeled = (cls: string): { el: El; text: string } | null => {
    const hosts = [root, ...descendants(root)].filter(
      (el) => classes(el).includes(cls) && !isSvgFamily(el),
    );
    for (const host of hosts) {
      if (directText(host) && !used.has(host)) return { el: host, text: directText(host) };
      const inner = descendants(host)
        .filter((el) => !isSvgFamily(el))
        .find((el) => directText(el) && !used.has(el));
      if (inner) return { el: inner, text: directText(inner) };
    }
    return null;
  };

  const slotFor = new Map<El, SlotInfo>();
  const takeCandidate = (): { el: El; text: string } | null => {
    const c = candidates.find((c) => !used.has(c.el));
    return c ? { el: c.el, text: c.text } : null;
  };

  // label: semantic .label host first, else the first text candidate
  let label = findLabeled("label");
  if (!label) label = takeCandidate();
  if (label) {
    used.add(label.el);
    slotFor.set(label.el, { expr: "label", original: label.text });
  }
  // value: semantic .value host (not already used), else next candidate
  let value = findLabeled("value");
  if (value && used.has(value.el)) value = null;
  if (!value) value = takeCandidate();
  if (value) {
    used.add(value.el);
    slotFor.set(value.el, { expr: "value", original: value.text });
  }
  const valueIdx = order.get(value?.el ?? root) ?? -1;
  const extra = candidates.find(
    (c) =>
      !used.has(c.el) &&
      c.idx > valueIdx &&
      (label && value
        ? !inSubtree(label.el, c.el) && !inSubtree(value.el, c.el)
        : true),
  );
  if (extra) {
    used.add(extra.el);
    slotFor.set(extra.el, { expr: "extra", original: extra.text });
  }

  const slotRank = (e: SlotInfo["expr"]) => (e === "label" ? 0 : e === "value" ? 1 : 2);
  const slots = [...slotFor.values()].sort((a, b) => slotRank(a.expr) - slotRank(b.expr));

  // ---------- recursive CNode build ----------
  const renamedShorthand = (value: string): string => {
    const parsed = parseAnimationShorthand(value);
    if (!parsed) return value;
    const renamed = keyframeRenames.get(parsed.name) ?? parsed.name;
    animations.push({
      name: renamed,
      durationMs: parsed.durationMs,
      timing: parsed.timing,
      iteration: parsed.iteration,
    });
    return value.replace(parsed.name, renamed);
  };

  const build = (el: El, isRoot: boolean): CNode => {
    const st = styles.get(el) ?? { declarations: {} };
    const style: Record<string, string> = {};
    for (const [k, v] of Object.entries(st.declarations)) {
      style[k] = k === "animation" ? renamedShorthand(v) : v;
    }

    const attrs: Record<string, string> = {};
    for (const a of el.attrs ?? []) attrs[a.name] = a.value;
    if (style["animation"]) {
      const parsed = parseAnimationShorthand(style["animation"]);
      if (parsed) attrs["data-anim"] = keyframeRenames.get(parsed.name) ?? parsed.name;
    }

    const pseudoBefore: CChild[] = [];
    const pseudoAfter: CChild[] = [];
    if (st.before) {
      const child = pseudoToChild("before", st.before);
      if (child) pseudoBefore.push(child);
    }
    if (st.after) {
      const child = pseudoToChild("after", st.after);
      if (child) pseudoAfter.push(child);
    }

    const children: CChild[] = [...pseudoBefore];
    for (const n of el.childNodes ?? []) {
      const nodeName = (n as { nodeName?: string }).nodeName;
      if (nodeName === "#text") {
        const value2 = (n as { value: string }).value;
        if (value2.trim()) children.push({ type: "text", text: value2 });
      } else if (iconEl && n === (iconEl as unknown)) {
        children.push({ type: "expr", name: "icon" });
      } else {
        children.push({ type: "el", node: build(n as El, false) });
      }
    }
    children.push(...pseudoAfter);

    const slot = slotFor.get(el);
    if (slot) {
      // The slot expression replaces the host's text, positioned before the
      // first text child so any materialized ::before (delta arrows, ± signs,
      // diff markers) stays ahead of the text like CSS paints it.
      const firstTextIdx = children.findIndex((c) => c.type === "text");
      const filtered = children.filter((c) => c.type !== "text");
      const exprChild: CChild = { type: "expr", name: slot.expr };
      const at =
        firstTextIdx >= 0
          ? children.slice(0, firstTextIdx).filter((c) => c.type !== "text").length
          : filtered.length;
      filtered.splice(Math.min(at, filtered.length), 0, exprChild);
      children.length = 0;
      children.push(...filtered);
    }

    const node: CNode = { tag: el.tagName, attrs, style, children };
    if (slot) slotNodes[slot.expr] = node;
    return node;
  };

  const slotNodes: Partial<Record<"label" | "value" | "extra", CNode>> = {};

  const rootNode = build(root, true);
  void variantId;
  return { root: rootNode, iconSlot, defaultIcon, slots, slotNodes, animations };
}

export { parseAnimationShorthand };

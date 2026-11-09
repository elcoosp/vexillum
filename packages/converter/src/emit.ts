/**
 * TSX code generation from the intermediate CNode tree.
 * Inline styles are the source of truth; Tailwind classes are additive.
 */
import type { CChild, CNode } from "./materialize";
import { toTailwind } from "./tailwind";

const SVG_ATTR_MAP: Record<string, string> = {
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "fill-rule": "fillRule",
  "fill-opacity": "fillOpacity",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "text-anchor": "textAnchor",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
};

const SVG_SELF_CLOSING = new Set([
  "path", "line", "polyline", "polygon", "rect", "circle", "ellipse", "use", "stop",
]);

/** kebab-case CSS property → React camelCase (custom props untouched). */
export function cssPropToJsx(prop: string): string {
  if (prop.startsWith("--")) return prop;
  const vendor = prop.startsWith("-webkit-")
    ? "Webkit"
    : prop.startsWith("-moz-")
      ? "Moz"
      : prop.startsWith("-ms-")
        ? "ms"
        : "";
  const rest = vendor ? prop.slice(prop.indexOf("-", 1) + 1) : prop;
  const camel = rest.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return vendor + camel;
}

function jsxAttrName(name: string): string {
  return SVG_ATTR_MAP[name] ?? name;
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/\n/g, " ");
}

interface EmitOptions {
  variantId: string;
  /** extra classes appended after the semantic ones (tailwind utilities) */
}

function classString(node: CNode, isRoot: boolean): string {
  const tw = toTailwind(node.style);
  const semantic = (node.attrs["class"] ?? "").split(/\s+/).filter(Boolean);
  if (isRoot) {
    return [...new Set(["badge", ...semantic, ...tw.classes])].join(" ");
  }
  return [...new Set([...semantic, ...tw.classes])].filter(Boolean).join(" ");
}

function twString(node: CNode): string {
  return toTailwind(node.style).classes.join(" ");
}

function styleObjectString(style: Record<string, string>): string {
  const entries = Object.entries(style).map(([k, v]) => {
    return `${JSON.stringify(cssPropToJsx(k))}: ${JSON.stringify(v)}`;
  });
  return `{{ ${entries.join(", ")} }}`;
}

function emitNode(node: CNode, depth: number, isRoot: boolean): string {
  const pad = "  ".repeat(depth);
  const padIn = "  ".repeat(depth + 1);
  const cls = classString(node, isRoot);
  const attrs: string[] = [];
  if (cls) attrs.push(`className="${escapeAttr(cls)}"`);
  const tw = twString(node);
  if (tw) attrs.push(`tw="${escapeAttr(tw)}"`);
  if (Object.keys(node.style).length > 0) {
    attrs.push(`style=${styleObjectString(node.style)}`);
  }
  for (const [k, v] of Object.entries(node.attrs)) {
    if (k === "class") continue;
    if (k === "style") continue; // style is emitted from node.style
    attrs.push(`${jsxAttrName(k)}="${escapeAttr(v)}"`);
  }
  void padIn;

  const open = `<${node.tag}${attrs.length ? " " + attrs.join(" ") : ""}`;
  const inner = node.children.map((c) => emitChild(c, depth + 1)).join("");
  if (inner.length === 0) {
    if (SVG_SELF_CLOSING.has(node.tag)) return `${pad}${open} />`;
    return `${pad}${open}></${node.tag}>`;
  }
  if (inner.length <= 60 && !inner.includes("\n")) {
    return `${pad}${open}>${inner.trim()}</${node.tag}>`;
  }
  return `${pad}${open}>\n${inner}\n${pad}</${node.tag}>`;
}

function emitChild(child: CChild, depth: number): string {
  const pad = "  ".repeat(depth);
  switch (child.type) {
    case "text":
      // brace-wrapped expression so any character (>, {, quotes) is safe
      return `${pad}{${JSON.stringify(child.text)}}\n`;
    case "expr":
      if (child.name === "icon") return `${pad}{icon ?? <IconSlot />}\n`;
      return `${pad}{${child.name}}\n`;
    case "el":
      return `${emitNode(child.node, depth, false)}\n`;
  }
}

export function pascalComponentName(variantId: string): string {
  const m = variantId.match(/^c(\d{2})-(\d{2})$/);
  if (!m) throw new Error(`unexpected variant id: ${variantId}`);
  return `C${m[1]}${m[2]}`;
}

export function emitTsx(input: {
  variantId: string;
  title: string;
  collectionTitle: string;
  tree: CNode;
  hasIcon: boolean;
  hasLabel: boolean;
  hasValue: boolean;
  hasExtra: boolean;
}): string {
  const { variantId, title, collectionTitle, tree, hasIcon, hasLabel, hasValue, hasExtra } = input;
  const component = pascalComponentName(variantId);
  const props = [
    hasLabel ? "label" : null,
    hasValue ? "value" : null,
    hasExtra ? "extra" : null,
    hasIcon ? "icon" : null,
  ].filter(Boolean).join(", ");

  const body = emitNode(tree, 2, true);

  return `// ${variantId} · ${title} — ${collectionTitle}
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function ${component}({ ${props} }: BadgeProps) {
  return (
${body}
  );
}
`;
}

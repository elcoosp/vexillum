/**
 * Minimal DOM abstraction over parse5's parse tree, with the helpers the
 * converter needs: class matching, text extraction, structural cloning.
 */
import { parseFragment, parse, serialize } from "parse5";

/**
 * Structural DOM node type — the converter only relies on these fields, so
 * it stays decoupled from parse5's internal tree type names.
 */
export interface El {
  tagName: string;
  nodeName: string;
  namespaceURI?: string;
  attrs: Array<{ name: string; value: string }>;
  childNodes?: unknown[];
  parentNode?: El | null;
}

export type AnyNode = El | { nodeName: string; value?: string };

export function parseHtml(html: string): El {
  const frag = parseFragment(html) as unknown as { childNodes: AnyNode[] };
  const el = frag.childNodes.find(
    (n): n is El => (n as El).tagName !== undefined && !isTextNode(n),
  );
  if (!el) throw new Error("no root element in fragment");
  return el;
}

export function parseDocument(html: string): El {
  const doc = parse(html) as unknown as { childNodes: AnyNode[] };
  const htmlEl = doc.childNodes.find(
    (n): n is El => (n as El).tagName === "html",
  );
  if (!htmlEl) throw new Error("no <html> element");
  return htmlEl;
}

export function isTextNode(n: unknown): boolean {
  return typeof n === "object" && n !== null && (n as { nodeName?: string }).nodeName === "#text";
}

export function textOf(n: unknown): string {
  if (isTextNode(n)) return (n as { value: string }).value;
  if (typeof n === "object" && n !== null) {
    const node = n as { childNodes?: unknown[] };
    return (node.childNodes ?? []).map(textOf).join("");
  }
  return "";
}

export function classes(el: El): string[] {
  const attr = el.attrs?.find((a) => a.name === "class")?.value ?? "";
  return attr.split(/\s+/).filter(Boolean);
}

export function attr(el: El, name: string): string | undefined {
  return el.attrs?.find((a) => a.name === name)?.value;
}

export function children(el: El): El[] {
  return (el.childNodes ?? []).filter(
    (n): n is El => !isTextNode(n) && (n as El).tagName !== undefined,
  );
}

/** All descendants (elements only), document order. */
export function descendants(el: El): El[] {
  const out: El[] = [];
  const walk = (n: El) => {
    for (const c of children(n)) {
      out.push(c);
      walk(c);
    }
  };
  walk(el);
  return out;
}

/** Direct non-text children with their text-only siblings flattened. */
export function childNodesMixed(el: El): Array<El | { text: string }> {
  return (el.childNodes ?? []).map((n) =>
    isTextNode(n) ? { text: (n as { value: string }).value } : (n as El),
  );
}

/** Serialized outer HTML of a subtree. */
export function outerHtml(el: El): string {
  return serialize(el as never);
}

/** Inner HTML (children only). */
export function innerHtml(el: El): string {
  const frag = { nodeName: "#document-fragment", childNodes: el.childNodes ?? [] };
  return serialize(frag as never);
}

/** Creates a new element. */
export function makeEl(
  tagName: string,
  attrs: Record<string, string> = {},
  childNodes: Array<El | { text: string }> = [],
): El {
  return {
    tagName,
    nodeName: tagName,
    namespaceURI: "http://www.w3.org/1999/xhtml",
    attrs: Object.entries(attrs).map(([name, value]) => ({ name, value })),
    childNodes: childNodes.map((c) =>
      "text" in c
        ? { nodeName: "#text", value: c.text, parentNode: null }
        : c,
    ),
    parentNode: null,
  };
}

/** Parent element of a node, if it is an element. */
export function parentOf(el: El): El | null {
  const p = el.parentNode as El | null | undefined;
  if (p && p.tagName !== undefined) return p;
  return null;
}

/** Serializes an element to JSX-compatible props listing (class only kept). */
export function classSelector(el: El): string {
  return classes(el).join(".");
}

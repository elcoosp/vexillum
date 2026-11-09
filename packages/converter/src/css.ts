//! Copyright note suppressed — see LICENSE.
/**
 * CSS rule + @keyframes parser for the badge collection stylesheet.
 *
 * The source stylesheet is machine-generated and flat: no nesting beyond
 * @keyframes bodies, no comments inside blocks after stripping, single-line
 * declarations. This parser exploits that structure; it is not a general
 * CSS parser.
 */

export interface CssRule {
  selector: string;
  declarations: Record<string, string>;
}

export interface KeyframesRule {
  name: string;
  /** keyframe stop → declarations, in source order */
  stops: Array<{ stop: string; declarations: Record<string, string> }>;
}

export interface ParsedStylesheet {
  rules: CssRule[];
  keyframes: KeyframesRule[];
}

/** Strips /* *\/ comments from CSS text. */
export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Parses `a:b;c:d` into an object, preserving declaration order. */
export function parseDeclarations(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const chunk of body.split(";")) {
    const i = chunk.indexOf(":");
    if (i < 0) continue;
    const name = chunk.slice(0, i).trim().toLowerCase();
    const value = chunk
      .slice(i + 1)
      .trim()
      .replace(/\s+/g, " ");
    if (name && value) out[name] = value;
  }
  return out;
}

/**
 * Parses a flat stylesheet into rules and @keyframes blocks.
 * Selectors are kept verbatim (one per rule, comma lists split).
 */
export function parseStylesheet(css: string): ParsedStylesheet {
  const text = stripComments(css);
  const rules: CssRule[] = [];
  const keyframes: KeyframesRule[] = [];

  let i = 0;
  while (i < text.length) {
    // find next meaningful token
    const braceIdx = text.indexOf("{", i);
    if (braceIdx < 0) break;
    const prelude = text.slice(i, braceIdx).trim();

    // find the matching close brace (keyframes nest one level)
    let depth = 1;
    let j = braceIdx + 1;
    while (j < text.length && depth > 0) {
      if (text[j] === "{") depth++;
      else if (text[j] === "}") depth--;
      j++;
    }
    const body = text.slice(braceIdx + 1, j - 1);

    if (prelude.startsWith("@keyframes")) {
      const name = prelude.replace(/@keyframes\s+/, "").trim();
      const stops: KeyframesRule["stops"] = [];
      // inner blocks: stop% { decls }
      const inner = /([^{}]+)\{([^{}]*)\}/g;
      let m: RegExpExecArray | null;
      while ((m = inner.exec(body))) {
        stops.push({
          stop: m[1].trim(),
          declarations: parseDeclarations(m[2]),
        });
      }
      keyframes.push({ name, stops });
    } else if (prelude.startsWith("@")) {
      // @media etc: recurse into the body
      const nested = parseStylesheet(body);
      rules.push(...nested.rules);
      keyframes.push(...nested.keyframes);
    } else {
      for (const sel of prelude.split(",")) {
        rules.push({ selector: sel.trim(), declarations: parseDeclarations(body) });
      }
    }
    i = j;
  }

  return { rules, keyframes };
}

const PSEUDO_RE = /^(.*?)(::before|::after)$/;

export interface MatchedRule {
  /** Rule selector with the pseudo-element part removed ("" if pure pseudo). */
  baseSelector: string;
  pseudo: "before" | "after" | null;
  declarations: Record<string, string>;
  order: number;
}

/** True when the selector can match nodes inside a badge subtree. */
export function isBadgeRule(selector: string): boolean {
  return selector.startsWith(".badge") || /^\.(c\d{2}-\d{2})/.test(selector);
}

/** Splits a selector into its pseudo-element part, if any. */
export function splitPseudo(selector: string): { base: string; pseudo: "before" | "after" | null } {
  const m = selector.match(PSEUDO_RE);
  if (m) {
    return { base: m[1].trim(), pseudo: m[2] === "::before" ? "before" : "after" };
  }
  return { base: selector.trim(), pseudo: null };
}

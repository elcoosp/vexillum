/**
 * seed2-value-tokens.mjs — dual-seed template codemod.
 *
 * Rewrites the VALUE segment's inline styles in every generated badge
 * component so its color tokens address the value-side token family:
 *
 *   var(--vx-t-strong, oklch(…))  →  var(--vx-v-t-strong, oklch(…))
 *
 * The `vx-v-*` family is derived from `?seed2=` on the API (falling back to
 * the base seed when absent — see `overlay_value_seed`), so the value segment
 * can carry an independent palette while label/icon sides keep the base one.
 * Parenthesis counts are preserved (token rename only), so the source-value
 * fallbacks keep unthemed renders byte-identical.
 *
 * Scope guard: only elements whose className lists `value` as a class TOKEN,
 * and only `style={{ … }}` objects inside that element's own open tag —
 * nested children and label-side elements are untouched.
 *
 * Idempotent: `--vx-v-*` references are never re-renamed.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "packages/badges/src");

const collections = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let files = 0;
let touched = 0;
let replacements = 0;

for (const col of collections) {
  const dir = join(root, col);
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    continue;
  }
  for (const f of entries) {
    if (!/^[a-z]\d{2}-\d{2}\.tsx$/.test(f)) continue;
    const path = join(dir, f);
    const src = readFileSync(path, "utf8");
    files++;

    let out = "";
    let pos = 0;
    let fileReplacements = 0;

    // every JSX open tag
    const openTag = /<[a-zA-Z][a-zA-Z0-9]*\b/g;
    openTag.lastIndex = 0;
    while (pos < src.length) {
      openTag.lastIndex = pos;
      const m = openTag.exec(src);
      if (!m) {
        out += src.slice(pos);
        break;
      }
      const tagStart = m.index;
      const tagEnd = findTagEnd(src, tagStart);
      if (tagEnd === -1) {
        out += src.slice(pos);
        break;
      }
      const tag = src.slice(tagStart, tagEnd + 1);
      if (hasValueClass(tag)) {
        const rewritten = rewriteStyleVars(tag);
        fileReplacements += rewritten.count;
        out += src.slice(pos, tagStart) + rewritten.text;
      } else {
        out += src.slice(pos, tagEnd + 1);
      }
      pos = tagEnd + 1;
    }

    if (fileReplacements > 0) {
      writeFileSync(path, out);
      touched++;
      replacements += fileReplacements;
      console.log(`${col}/${f}: ${fileReplacements} token(s)`);
    }
  }
}

console.log(`\n${files} files scanned, ${touched} rewritten, ${replacements} tokens remapped`);

/** True when the open tag's className lists `value` as a standalone token. */
function hasValueClass(tag) {
  const m = tag.match(/className="([^"]*)"/);
  if (!m) return false;
  return m[1].split(/\s+/).includes("value");
}

/**
 * Renames `var(--vx-X,` → `var(--vx-v-X,` inside the tag's style object(s)
 * only. Anything outside `style={{ … }}` (className, tw, markers) is kept.
 * Single pass over the tag with balanced-brace scanning; paren counts are
 * preserved so the source-value fallback stays valid.
 */
function rewriteStyleVars(tag) {
  let count = 0;
  let out = "";
  let i = 0;
  while (i < tag.length) {
    const at = tag.indexOf("style={{", i);
    if (at === -1) {
      out += tag.slice(i);
      break;
    }
    out += tag.slice(i, at + "style={{".length);
    // walk the balanced {{ … }} object literal (quote-aware)
    let depth = 2;
    let j = at + "style={{".length;
    let inStr = null;
    while (j < tag.length && depth > 0) {
      const c = tag[j];
      if (inStr) {
        if (c === "\\") {
          j += 2; // skip the escaped char — emitted via the body slice
          continue;
        }
        if (c === inStr) inStr = null;
      } else if (c === '"' || c === "'") {
        inStr = c;
      } else if (c === "{" || c === "(" || c === "[") {
        depth++;
      } else if (c === "}" || c === ")" || c === "]") {
        depth--;
      }
      j++;
    }
    const body = tag.slice(at + "style={{".length, j - 1);
    out += body.replace(/var\(--vx-(?!v-)([a-z0-9-]+),/g, (_full, token) => {
      count++;
      return `var(--vx-v-${token},`;
    });
    i = j - 1; // the closing brace is re-emitted on the next slice
  }
  return { text: out, count };
}

/** Index of the `>` closing the open tag that starts at `start`, or -1. */
function findTagEnd(src, start) {
  let depth = 0;
  let inStr = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = c;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i;
  }
  return -1;
}

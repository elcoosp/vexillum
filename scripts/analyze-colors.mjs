#!/usr/bin/env node
/**
 * Analysis pass: inventory every color literal in badge-collections.html CSS
 * with its property context, so the tokenizer rules can be designed against
 * reality. Prints distinct values grouped by classification.
 */
import { readFileSync } from "node:fs";

const html = readFileSync("badge-collections.html", "utf8");
const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];

// crude rule splitter: selector { decls }
const COLOR_RE =
  /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\bcolor-mix\([^;]*?\)|\btransparent\b)/g;

const byValue = new Map();
let ruleCount = 0;
// split into rules (handle nested @keyframes blocks crudely by scanning braces)
const rules = [];
let depth = 0;
let buf = "";
for (const ch of style) {
  buf += ch;
  if (ch === "{") depth++;
  else if (ch === "}") {
    depth--;
    if (depth === 0) {
      rules.push(buf);
      buf = "";
    }
  }
}
for (const rule of rules) {
  const m = rule.match(/([^{}]+)\{([\s\S]*)\}/);
  if (!m) continue;
  ruleCount++;
  const selector = m[1].trim().replace(/\s+/g, " ");
  const decls = m[2];
  for (const decl of decls.split(";")) {
    const di = decl.indexOf(":");
    if (di < 0) continue;
    const prop = decl.slice(0, di).trim().toLowerCase();
    const value = decl.slice(di + 1).trim();
    for (const match of value.matchAll(COLOR_RE)) {
      const v = match[0];
      if (!byValue.has(v)) byValue.set(v, []);
      const arr = byValue.get(v);
      if (arr.length < 40) arr.push(`${selector} [${prop}]`);
    }
  }
}

function classify(v) {
  const hex = v.match(/^#([0-9a-fA-F]{6})$/);
  if (!hex) return "other";
  const n = parseInt(hex[1], 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lr = lin(r), lg = lin(g), lb = lin(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const A = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const C = Math.sqrt(A * A + B * B);
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  let family = "seed";
  if (C >= 0.04) {
    if (H >= 95 && H < 190) family = "ok";
    else if (H > 25 && H < 95) family = "warn";
    else if (H >= 345 || H < 25) family = "err";
  } else family = "neutral";
  return `C${C.toFixed(3)} L${L.toFixed(3)} H${H.toFixed(0)} ${family}`;
}

const groups = new Map();
for (const [v, ctxs] of [...byValue.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const key = classify(v);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push([v, ctxs]);
}

for (const [key, vals] of [...groups.entries()].sort()) {
  console.log(`\n== ${key} (${vals.length} distinct) ==`);
  for (const [v, ctxs] of vals) {
    console.log(`  ${v.padEnd(22)} ×${byValue.get(v).length}  e.g. ${ctxs[0]}`);
  }
}
console.log(`\nrules: ${ruleCount}, distinct colors: ${byValue.size}`);

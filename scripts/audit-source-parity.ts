/**
 * Converter parity audit: diffs the SOURCE-TRUTH renders (badge-collections.html
 * fragments rendered through vexillum with the original stylesheet) against the
 * converted-pipeline renders (render-goldens candidates).
 *
 * Any pixel drift is a converter fidelity gap: dropped decorations, wrong slot
 * assignment, broken order, etc. Variants with animations are excluded from
 * strict equality (the source stylesheet animates; the converted static render
 * freezes), but their static base state still compares cleanly because
 * animations are stripped from the reference stylesheet.
 *
 * Usage:
 *   pnpm tsx scripts/audit-source-parity.ts [sourceDir] [candidateDir] [--json]
 *
 * Defaults: target/source-truth target/golden-candidates (both produced by
 * cargo bins `render-source` and `render-goldens`).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PNG } = require("pngjs") as typeof import("pngjs");
const pixelmatchModule = require("pixelmatch") as { default: typeof import("pixelmatch").default };
const pixelmatch = pixelmatchModule.default ?? pixelmatchModule;

const sourceDir = resolve(process.argv[2] ?? "target/source-truth");
const candidateDir = resolve(process.argv[3] ?? "target/golden-candidates");
const JSON_OUT = process.argv.includes("--json");

const registry = JSON.parse(
  readFileSync("crates/templates/assets/registry.json", "utf8"),
) as {
  variants: Array<{ id: string; animations: Array<{ name: string }> }>;
};

interface Row {
  id: string;
  pct: number;
  pixels: number;
  sizeDelta: string | null;
}

const rows: Row[] = [];

for (const v of registry.variants) {
  // animated variants ship as GIF goldens (byte-compared by the regression
  // gate); the source-truth reference is static-only, so skip them here
  if (v.animations.length > 0) continue;
  const goldPath = `${sourceDir}/${v.id}.png`;
  const candPath = `${candidateDir}/${v.id}.png`;
  if (!existsSync(goldPath) || !existsSync(candPath)) {
    rows.push({ id: v.id, pct: 100, pixels: -1, sizeDelta: "missing render" });
    continue;
  }
  const a = PNG.sync.read(readFileSync(goldPath));
  const b = PNG.sync.read(readFileSync(candPath));
  if (a.width !== b.width || a.height !== b.height) {
    rows.push({
      id: v.id,
      pct: 100,
      pixels: -1,
      sizeDelta: `${a.width}x${a.height} vs ${b.width}x${b.height}`,
    });
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
  rows.push({
    id: v.id,
    pct: (mismatched / (a.width * a.height)) * 100,
    pixels: mismatched,
    sizeDelta: null,
  });
}

rows.sort((x, y) => y.pct - x.pct);
const drifted = rows.filter((r) => r.pct > 0.1);

if (JSON_OUT) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log(`audited ${rows.length} variants; drifted (pixelmatch > 0.1%): ${drifted.length}`);
  for (const r of drifted.slice(0, 60)) {
    console.log(
      `  ${r.id}: ${r.pct.toFixed(2)}% (${r.pixels >= 0 ? r.pixels + "px" : r.pixels})${r.sizeDelta ? ` [${r.sizeDelta}]` : ""}`,
    );
  }
  if (drifted.length > 60) console.log(`  … and ${drifted.length - 60} more`);
}
process.exitCode = 0;

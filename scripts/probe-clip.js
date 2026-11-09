// Probe: does the server render clip c02-02's overhanging seal / c04-10 shadows?
// Renders each variant at pad=8 and pad=20, then reports the first non-transparent
// column from the left. If pad=8 touches column 0 while pad=20 starts later,
// the pad=8 render is clipping content.
const { execFileSync } = require("node:child_process");
const { PNG } = require("pngjs");
const fs = require("node:fs");
const path = require("node:path");

const crate = path.join(__dirname, "..", "crates", "render");

function render(variant, pad, out) {
  // render-goldens bin renders all variants; too heavy. Use a tiny rust bin instead? 
  // Simpler: call the existing bin with env overrides is not supported — so we
  // drive the library through a one-off rust script is overkill here.
  // Instead: reuse `render-source`? Keep this file for the PNG analysis step only.
  return fs.readFileSync(out);
}

function firstOpaqueColumn(png) {
  for (let x = 0; x < png.width; x++) {
    for (let y = 0; y < png.height; y++) {
      const a = png.data[(y * png.width + x) * 4 + 3];
      if (a > 8) return x;
    }
  }
  return -1;
}

function lastOpaqueColumn(png) {
  for (let x = png.width - 1; x >= 0; x--) {
    for (let y = 0; y < png.height; y++) {
      const a = png.data[(y * png.width + x) * 4 + 3];
      if (a > 8) return x;
    }
  }
  return -1;
}

const [, , variant, padA, fileA, padB, fileB] = process.argv;
const A = PNG.sync.read(fs.readFileSync(fileA));
const B = PNG.sync.read(fs.readFileSync(fileB));
console.log(`${variant}: pad=${padA} ${A.width}x${A.height} first/last opaque col = ${firstOpaqueColumn(A)}/${lastOpaqueColumn(A)} | pad=${padB} ${B.width}x${B.height} = ${firstOpaqueColumn(B)}/${lastOpaqueColumn(B)}`);

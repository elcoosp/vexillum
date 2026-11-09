import { describe, expect, it } from "vitest";
import badgeKeyframesCss from "@vexillum/badges/keyframes.css?raw";
import mainTsx from "../main.tsx?raw";

/**
 * Kinetic-parity guard — runs in the BROWSER (no jsdom in this repo), so the
 * badge sources arrive as Vite raw-import bundles instead of node:fs reads:
 * every @keyframes name referenced by the generated badge components (inline
 * `animation` shorthands — including multi-layer shorthands like "typing 3s
 * steps(12) infinite, blink 0.8s step-end infinite") must exist in
 * packages/badges/src/keyframes.css, and the web entry must import that
 * stylesheet AFTER index.css so the badge definitions win the cascade over
 * same-named Tailwind built-ins (spin/pulse). Without the import, kinetic
 * collection previews (c12) render statically.
 */

const badgeSources: Record<string, string> = import.meta.glob(
  "../../../../packages/badges/src/**/*.tsx",
  { query: "?raw", import: "default", eager: true },
);

const usedNames = new Set<string>();
for (const src of Object.values(badgeSources)) {
  for (const m of src.matchAll(/"animation"\s*:\s*"([^"]+)"/g)) {
    // shorthand layers: the first word of each comma-separated layer is the name
    for (const layer of m[1].split(",")) {
      const name = layer.trim().split(/\s+/)[0];
      if (name) usedNames.add(name);
    }
  }
  for (const m of src.matchAll(/animationName\s*:\s*"([\w-]+)"/g)) usedNames.add(m[1]);
}

const definedNames = new Set(
  [...badgeKeyframesCss.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]),
);

describe("badge keyframes parity", () => {
  it("scanned the whole generated component set", () => {
    // audit sanity: the glob must actually pick up the 544-template library
    expect(Object.keys(badgeSources).length).toBeGreaterThan(500);
  });

  it("defines every animation name referenced by the generated components", () => {
    // audit sanity: the scan must actually find the kinetic set
    expect(usedNames.size).toBeGreaterThan(15);
    const missing = [...usedNames].filter((n) => !definedNames.has(n));
    expect(missing, "animation names used but not defined in keyframes.css").toEqual([]);
  });

  it("web entry imports @vexillum/badges/keyframes.css after index.css", () => {
    const ixCss = mainTsx.indexOf('./index.css');
    const badgeCss = mainTsx.indexOf("@vexillum/badges/keyframes.css");
    expect(ixCss).toBeGreaterThan(-1);
    expect(badgeCss).toBeGreaterThan(ixCss);
  });
});

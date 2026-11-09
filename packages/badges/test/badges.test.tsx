import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { registry, variantIds } from "../src/registry";
import registryJson from "../src/registry.json";
import { LABEL_MARKER, VALUE_MARKER, ICON_MARKER } from "../src/types";
import { ThemeVars } from "../src/theme";

const meta = new Map(registryJson.variants.map((v) => [v.id, v]));

describe("registry", () => {
  it("contains all 544 variants across 34 collections", () => {
    expect(variantIds).toHaveLength(544);
    expect(registryJson.collections).toHaveLength(34);
    expect(registryJson.variants).toHaveLength(544);
    // ids unique
    expect(new Set(variantIds).size).toBe(544);
    // collections ordered
    expect(registryJson.collections.map((c) => c.id)).toEqual(
      Array.from({ length: 34 }, (_, i) => `c${String(i + 1).padStart(2, "0")}`),
    );
  });

  it("has a component for every registry entry", () => {
    for (const id of variantIds) {
      expect(registry[id], `missing component for ${id}`).toBeTypeOf("function");
      expect(meta.has(id)).toBe(true);
    }
  });
});

describe("compiled contract", () => {
  it("renders slot markers for a standard badge", () => {
    const html = renderToStaticMarkup(
      // compiler passes markers as props
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (registry["c01-01"] as any)({
        label: LABEL_MARKER,
        value: VALUE_MARKER,
        icon: undefined,
      }),
    );
    expect(html).toContain(LABEL_MARKER);
    expect(html).toContain(VALUE_MARKER);
    expect(html).toContain(ICON_MARKER);
    // semantic token fallbacks preserved (baked at the default seed)
    expect(html).toContain("var(--vx-t-body, oklch(");
    // no pseudo-element rules leaked into markup
    expect(html).not.toContain("::before");
  });

  it("renders extra marker only for tri-segment variants", () => {
    expect(meta.get("c01-14")?.hasExtra).toBe(true);
    expect(meta.get("c01-01")?.hasExtra).toBe(false);
    const tri = renderToStaticMarkup(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (registry["c01-14"] as any)({
        label: LABEL_MARKER,
        value: VALUE_MARKER,
        extra: "__VX_EXTRA__",
        icon: undefined,
      }),
    );
    expect(tri).toContain("__VX_EXTRA__");
  });

  it("renders the stacked + stat collections with dual-seed value tokens", () => {
    for (const id of ["c33-01", "c33-16", "c34-01", "c34-16"]) {
      const html = renderToStaticMarkup(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (registry[id] as any)({
          label: LABEL_MARKER,
          value: VALUE_MARKER,
          icon: undefined,
        }),
      );
      expect(html).toContain(LABEL_MARKER);
      expect(html).toContain(VALUE_MARKER);
      // value segments ride the vx-v-* dual-seed family so ?seed2= re-themes them
      expect(html).toContain("var(--vx-v-");
      // takumi-safe: no masks/transforms/pseudo-elements anywhere
      // (text-transform: uppercase is fine — the check targets the
      // `transform` paint property, i.e. not preceded by "text-")
      expect(html).not.toContain("mask");
      expect(html).not.toMatch(/[^-]transform:/);
      expect(html).not.toContain("::before");
    }
  });

  it("theme tokens map to CSS custom properties (preview wrapper)", () => {
    const html = renderToStaticMarkup(
      ThemeVars({ tokens: { "value-bg": "#123456" }, children: null }),
    );
    expect(html).toContain("--value-bg:#123456");
  });
});

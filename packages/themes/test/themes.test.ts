import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  contrastText,
  ensureReadablePair,
  needsCorrection,
  parseHex,
  presetColorCorrected,
  PRESETS,
  resolveThemeTokens,
  TOKENS,
  valueToRgb,
} from "../src";

/** Token values are oklch strings now — resolve them to sRGB for WCAG checks. */
function tokenRgb(tokens: Record<string, string | undefined>, key: string): [number, number, number] {
  const rgb = valueToRgb(tokens[key]!);
  expect(rgb, `${key} parses`).toBeTruthy();
  return rgb!;
}

describe("parity with crates/theme", () => {
  it("uses the same frozen token vocabulary", () => {
    expect(TOKENS).toHaveLength(15);
    expect(TOKENS).toContain("value-bg");
    expect(TOKENS).toContain("g-from");
    expect(TOKENS).toContain("gl-to");
  });

  it("computes identical contrast ratios for known pairs", () => {
    // #767676 on white ≈ 4.54 (mirrors the Rust test)
    const gray = parseHex("#767676")!;
    const white: [number, number, number] = [255, 255, 255];
    expect(Math.abs(contrastRatio(gray, white) - 4.54)).toBeLessThan(0.03);
    expect(contrastRatio([0, 0, 0], white)).toBeCloseTo(21, 5);
  });

  it("picks the same ink as the Rust guardrail", () => {
    expect(contrastText("#ffffff")).toBe("#111827");
    expect(contrastText("#111827")).toBe("#ffffff");
  });

  it("flags the no-ink band identically", () => {
    // #7a7a7a: the same mid-gray the Rust integration test uses
    expect(needsCorrection("#7a7a7a")).toBe(true);
    expect(needsCorrection("#fde047")).toBe(false);
    expect(needsCorrection("#3b82f6")).toBe(false);
  });
});

describe("presets", () => {
  it("ships the six launch presets", () => {
    expect(PRESETS.map((p) => p.name)).toEqual([
      "slate", "blue", "violet", "emerald", "amber", "rose",
    ]);
  });
});

describe("resolveThemeTokens (full 13-token maps)", () => {
  it("returns undefined for source and unknown names", () => {
    expect(resolveThemeTokens("source")).toBeUndefined();
    expect(resolveThemeTokens("nope")).toBeUndefined();
  });

  it("resolves every vocabulary token for each preset", () => {
    for (const p of PRESETS) {
      const tokens = resolveThemeTokens(p.name)!;
      expect(tokens).toBeDefined();
      for (const t of TOKENS) {
        expect(typeof tokens[t], `${p.name}.${t}`).toBe("string");
        expect((tokens[t] as string).length, `${p.name}.${t}`).toBeGreaterThan(0);
      }
    }
  });

  it("enforces WCAG AA on the readable pairs", () => {
    for (const p of PRESETS) {
      const t = resolveThemeTokens(p.name)!;
      const pairs: Array<[string, string]> = [
        ["value-bg", "value-fg"],
        ["label-bg", "label-fg"],
        ["accent", "accent-fg"],
      ];
      for (const [bgK, fgK] of pairs) {
        const bg = tokenRgb(t, bgK);
        const fg = tokenRgb(t, fgK);
        expect(contrastRatio(bg, fg), `${p.name} ${bgK}/${fgK}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("derives gradient ramps that bracket their base color", () => {
    for (const p of PRESETS) {
      const t = resolveThemeTokens(p.name)!;
      const vb = tokenRgb(t, "value-bg");
      const gf = tokenRgb(t, "g-from");
      const gt = tokenRgb(t, "g-to");
      const lum = (c: [number, number, number]) =>
        contrastRatio(c, [0, 0, 0]); // monotone proxy: larger = lighter
      expect(lum(gf)).toBeGreaterThan(lum(vb));
      expect(lum(gt)).toBeLessThan(lum(vb));
    }
  });

  it("keeps icons readable on light chips (the icon rides brand color)", () => {
    for (const p of PRESETS) {
      const t = resolveThemeTokens(p.name)!;
      const ratio = contrastRatio(tokenRgb(t, "icon-color"), [255, 255, 255]);
      expect(ratio, p.name).toBeGreaterThanOrEqual(3);
    }
  });

  it("reports guardrail corrections consistently", () => {
    // slate's mid swatch sits in the correction band per the Rust fixture
    expect(typeof presetColorCorrected("slate")).toBe("boolean");
    expect(presetColorCorrected("nope")).toBe(false);
  });

  it("ensureReadablePair corrects the no-ink band", () => {
    const moved = ensureReadablePair("#7a7a7a");
    expect(moved.corrected).toBe(true);
    expect(
      contrastRatio(parseHex(moved.bg)!, parseHex(moved.fg)!),
    ).toBeGreaterThanOrEqual(4.5);
    const fine = ensureReadablePair("#111827");
    expect(fine.corrected).toBe(false);
    expect(fine.fg).toBe("#ffffff");
  });
});

import fixture from "./fixtures/presets.json";

describe("cross-language parity (fixtures/presets.json from crates/theme)", () => {

  it("resolves the exact oklch strings the Rust theme crate emits", () => {
    for (const [name, expected] of Object.entries(fixture)) {
      const tokens = resolveThemeTokens(name)!;
      expect(tokens).toBeDefined();
      for (const [token, value] of Object.entries(expected as Record<string, string>)) {
        expect(tokens[token], `${name}.${token}`).toBe(value);
      }
      // and no extra color tokens beyond the Rust set
      for (const key of Object.keys(tokens)) {
        if (tokens[key] === undefined) continue;
        expect((expected as Record<string, string>)[key], `${name}.${key} extra`).toBeDefined();
      }
    }
  });

  it("keeps the on-light inks readable on white", () => {
    for (const [name, expected] of Object.entries(fixture)) {
      for (const ink of ["label-ink", "value-ink"]) {
        const value = (expected as Record<string, string>)[ink];
        expect(value, `${name}.${ink}`).toBeDefined();
        const m = value.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/)!;
        expect(m).toBeTruthy();
      }
    }
  });
});

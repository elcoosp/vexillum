import { describe, expect, it } from "vitest";
import {
  SEMANTIC_PRESETS,
  effectiveSeed,
  normalizeSeed,
  presetSeedHex,
  semanticSpecFor,
  semanticVars,
} from "@/lib/theme";

/**
 * The SPA's semantic shim: the eight seed presets, seed normalization, and
 * the resolved ramp shape. Byte-parity with the API is enforced upstream by
 * packages/themes' fixture test (both sides share the resolver); here we
 * pin the shim's own contract.
 */

describe("SEMANTIC_PRESETS", () => {
  it("ships the eight seed presets with hex seeds", () => {
    expect(SEMANTIC_PRESETS.map((p) => p.name)).toEqual([
      "blue", "violet", "pink", "red", "amber", "green", "teal", "slate",
    ]);
    for (const p of SEMANTIC_PRESETS) {
      expect(p.seed).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("resolves v4 preset aliases to their seeds", () => {
    expect(presetSeedHex("rose")).toBe("#ec4899");
    expect(presetSeedHex("emerald")).toBe("#22c55e");
    expect(presetSeedHex("blue")).toBe("#3b82f6");
    // source was removed — it is not a preset
    expect(presetSeedHex("source")).toBeNull();
    expect(presetSeedHex("nope")).toBeNull();
  });
});

describe("normalizeSeed / effectiveSeed", () => {
  it("accepts hashed, hashless and short forms", () => {
    expect(normalizeSeed("#ec4899")).toBe("#ec4899");
    expect(normalizeSeed("EC4899")).toBe("#ec4899");
    expect(normalizeSeed("f0a")).toBe("#ff00aa");
    expect(normalizeSeed("%23ec4899")).toBe("#ec4899");
    expect(normalizeSeed("nope")).toBeNull();
    expect(normalizeSeed("")).toBeNull();
  });

  it("custom seed applies only in custom mode; unknown names have no seed", () => {
    // a named preset resolves to its OWN seed even when a custom hex lingers
    // — picking a preset after a custom color must visibly switch
    expect(effectiveSeed("rose", "#22c55e")).toBe("#ec4899");
    expect(effectiveSeed("rose")).toBe("#ec4899");
    // a removed theme behaves like any unknown name
    expect(effectiveSeed("source")).toBeNull();
    expect(effectiveSeed("source", "#22c55e")).toBeNull();
    expect(effectiveSeed("custom", "#22c55e")).toBe("#22c55e");
    expect(effectiveSeed("custom")).toBe("#3b82f6");
    expect(effectiveSeed("custom", "junk")).toBe("#3b82f6");
  });
});

describe("semanticVars shim", () => {
  it("resolves the full ramp for any seed and mode", () => {
    const ramp = semanticVars("#3b82f6", "light")!;
    expect(ramp).toBeTruthy();
    expect(Object.keys(ramp).length).toBeGreaterThanOrEqual(34);
    for (const token of ["vx-s-white", "vx-t-heading", "vx-a", "vx-ok", "vx-d-bg", "vx-metal-1"]) {
      expect(ramp[token], token).toMatch(/^oklch\(/);
    }
    // unknown seeds resolve too (any valid hex)
    const odd = semanticVars("#ff7a59", "dark")!;
    expect(odd["vx-a"]).toMatch(/^oklch\(/);
    // junk seeds return null rather than throwing
    expect(semanticVars("nothex", "light")).toBeNull();
  });
});

describe("semanticSpecFor picker state", () => {
  it("removed/unknown names are unthemed; presets and custom theme", () => {
    expect(semanticSpecFor({ name: "source", dark: false })).toBeNull();
    expect(semanticSpecFor({ name: "bogus", dark: true })).toBeNull();
    // a preset wins over a stale custom seed
    expect(semanticSpecFor({ name: "rose", customSeed: "#22c55e", dark: false })).toEqual({
      seed: "#ec4899",
      mode: "light",
    });
    expect(semanticSpecFor({ name: "custom", customSeed: "#ff7a59", dark: true })).toEqual({
      seed: "#ff7a59",
      mode: "dark",
    });
  });
});

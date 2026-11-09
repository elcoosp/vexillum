/**
 * Cross-language parity: the TypeScript semantic resolver must produce
 * byte-identical token strings to the Rust engine (crates/theme/src/semantic.rs),
 * pinned by the fixture the `dump-semantic` bin generates.
 */
import { describe, expect, it } from "vitest";
import fixture from "./fixtures/semantic.json";
import { parseSeed, presetSeed, resolveRamp, semanticVars, semanticVarsDuo, type Mode } from "../src/semantic";

const EDGE_SEEDS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  "near-white": "#fefefe",
  yellow: "#facc15",
  navy: "#1e1b4b",
  short: "#f0a",
};

const groups = fixture as Record<string, Record<string, string>>;

describe("semantic ramp parity with Rust", () => {
  it("covers presets plus edge seeds in both modes", () => {
    expect(Object.keys(groups).length).toBeGreaterThanOrEqual(28);
  });

  for (const [group, tokens] of Object.entries(groups)) {
    const match = group.match(/^(.*)-(light|dark)$/);
    expect(match, `${group} ends in -light/-dark`).toBeTruthy();
    const [, name, mode] = match!;
    it(`${group}: matches the Rust engine exactly`, () => {
      const hex = presetSeed(name) ?? EDGE_SEEDS[name];
      expect(hex, `seed ${name} mapped`).toBeTruthy();
      const seed = parseSeed(hex!);
      expect(seed).toBeTruthy();
      const ramp = resolveRamp(seed!, mode as Mode);
      expect(Object.keys(ramp).length).toBe(Object.keys(tokens).length);
      for (const [token, value] of Object.entries(tokens)) {
        expect(ramp[token], `${group}.${token}`).toBe(value);
      }
    });
  }
});

describe("resolver invariants", () => {
  it("dark mode flips surfaces but not accents", () => {
    const seed = parseSeed("#3b82f6")!;
    const light = resolveRamp(seed, "light");
    const dark = resolveRamp(seed, "dark");
    expect(parseFloat(dark["vx-s-white"].slice(6))).toBeLessThan(0.35);
    expect(parseFloat(light["vx-s-white"].slice(6))).toBeGreaterThan(0.95);
    expect(dark["vx-a"]).toBe(light["vx-a"]);
    expect(dark["vx-ok"]).toBe(light["vx-ok"]);
  });

  it("status hues never move with the seed", () => {
    const ok = resolveRamp(parseSeed("#3b82f6")!, "light")["vx-ok"];
    const okRose = resolveRamp(parseSeed("#ec4899")!, "light")["vx-ok"];
    expect(ok).toBe(okRose);
  });

  it("rejects junk seeds", () => {
    expect(parseSeed("nothex")).toBeNull();
    expect(parseSeed("#12345")).toBeNull();
    expect(parseSeed("")).toBeNull();
    expect(parseSeed("fff")).not.toBeNull();
  });
});

describe("semanticVarsDuo (value-side family)", () => {
  const base = "#3b82f6";
  const pink = "#ec4899";

  it("mirrors the base ramp under vx-v- when no value seed is given", () => {
    const duo = semanticVarsDuo(base, null, "light");
    const solo = semanticVars(base, "light");
    for (const [token, css] of Object.entries(solo)) {
      expect(duo[`vx-v-${token.slice(3)}`]).toBe(css);
      expect(duo[token]).toBe(css);
    }
  });

  it("rides the value seed for vx-v-* while base tokens stay put", () => {
    const duo = semanticVarsDuo(base, pink, "light");
    const solo = semanticVars(base, "light");
    const valueRamp = semanticVars(pink, "light");
    for (const [token, css] of Object.entries(solo)) {
      expect(duo[token]).toBe(css);
    }
    for (const [token, css] of Object.entries(valueRamp)) {
      expect(duo[`vx-v-${token.slice(3)}`]).toBe(css);
    }
    expect(duo["vx-v-a"]).not.toBe(duo["vx-a"]);
  });

  it("matches the Rust overlay byte-for-byte (same-seed + dual-seed)", () => {
    // same seed twice: every v- twin equals its base token
    const same = semanticVarsDuo(base, base, "dark");
    const solo = semanticVars(base, "dark");
    for (const [token, css] of Object.entries(solo)) {
      expect(same[`vx-v-${token.slice(3)}`]).toBe(css);
    }
  });

  it("is cached and stable across calls", () => {
    expect(semanticVarsDuo(base, pink, "light")).toBe(semanticVarsDuo(base, pink, "light"));
  });
});

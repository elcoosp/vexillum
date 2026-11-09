import { describe, expect, it } from "vitest";
import { convert } from "../src/index";
import { parseAnimationShorthand, expandInset } from "../src/materialize";

const FIXTURE = `<!DOCTYPE html>
<html lang="en">
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .badge { display: inline-flex; align-items: center; font-size: 12px; font-weight: 600; line-height: 1; white-space: nowrap; }
  .badge svg { width: 14px; height: 14px; flex-shrink: 0; display: block; }

  .c01-01 { height: 24px; border-radius: 6px; overflow: hidden; }
  .c01-01 .label { background: #f3f4f6; color: #374151; padding: 0 10px; border-right: 1px solid rgba(255,255,255,0.5); display: inline-flex; align-items: center; gap: 6px; height: 100%; }
  .c01-01 .value { background: #111827; color: #ffffff; padding: 0 12px; display: inline-flex; align-items: center; gap: 6px; height: 100%; }
  .c01-01 .label::before { content: ''; position: absolute; left: 2px; top: 50%; transform: translateY(-50%); width: 4px; height: 4px; border-radius: 50%; background: #10b981; }

  .c02-08 { gap: 8px; padding: 0 12px; background: #fff; border: 1px solid #e5e7eb; }
  .c02-08 .mono { width: 22px; height: 22px; background: #111827; color: #fff; }
  .c02-08 .label { color: #6b7280; }
  .c02-08 .value { color: #111827; font-weight: 700; }

  .c12-02 { gap: 9px; }
  .c12-02 .track { width: 64px; height: 5px; background: #e5e7eb; overflow: hidden; }
  .c12-02 .fill { height: 100%; width: 78%; background: #2563eb; animation: slide 2s linear infinite; }
  @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

  .c09-05 { gap: 8px; }
  .c09-05 .caret { width: 2px; height: 12px; background: #111827; animation: blink 1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0.4; } }

  .c12-05 { gap: 8px; }
  .c12-05 .caret { width: 2px; height: 12px; background: #ef4444; animation: blink 0.8s steps(2) infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style>
</head>
<body>
  <section class="collection" id="c01">
    <div class="collection-header"><span class="collection-number">C01 · 01</span><span class="collection-title">FOUNDATIONAL</span><span class="collection-desc">Basics.</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">01 · Two-tone split</div><div class="badge c01-01"><div class="label"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8z"/></svg><span>build</span></div><div class="value"><span>passing</span></div></div></div>
    </div>
  </section>
  <section class="collection" id="c02">
    <div class="collection-header"><span class="collection-number">C02 · 02</span><span class="collection-title">PREMIUM</span><span class="collection-desc">Fancy.</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">08 · Monogram</div><div class="badge c02-08"><div class="mono">V</div><span class="label">engine</span><span class="sep">·</span><span class="value">vexillum</span></div></div>
    </div>
  </section>
  <section class="collection" id="c12">
    <div class="collection-header"><span class="collection-number">C12 · 12</span><span class="collection-title">KINETIC</span><span class="collection-desc">Animated.</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">02 · Progress</div><div class="badge c12-02"><span class="label">deploy</span><div class="track"><div class="fill"></div></div></div></div>
      <div class="variant"><div class="variant-title">05 · Blink</div><div class="badge c12-05"><span class="label">live</span><div class="caret"></div><span class="value">true</span></div></div>
    </div>
  </section>
  <section class="collection" id="c09">
    <div class="collection-header"><span class="collection-number">C09 · 09</span><span class="collection-title">TERMINAL</span><span class="collection-desc">Term.</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">05 · Blink B</div><div class="badge c09-05"><span class="label">tty</span><div class="caret"></div><span class="value">ok</span></div></div>
    </div>
  </section>
</body>
</html>`;

describe("parseAnimationShorthand", () => {
  it("parses name/duration/timing/iteration", () => {
    expect(parseAnimationShorthand("slide 2s linear infinite")).toEqual({
      name: "slide",
      durationMs: 2000,
      timing: "linear",
      iteration: "infinite",
    });
    expect(parseAnimationShorthand("blink 1s steps(1) infinite")).toMatchObject({
      name: "blink",
      durationMs: 1000,
      timing: "steps(1)",
      iteration: "infinite",
    });
    expect(parseAnimationShorthand("sh 3.5s infinite")).toMatchObject({
      name: "sh",
      durationMs: 3500,
      timing: "ease",
    });
  });
});

describe("expandInset", () => {
  it("expands shorthand into longhands without clobbering", () => {
    const out = expandInset({ inset: "3px", top: "7px" });
    expect(out).toEqual({ top: "7px", right: "3px", bottom: "3px", left: "3px" });
  });
});

describe("convert", () => {
  const result = convert(FIXTURE);

  it("extracts collections and variants", () => {
    expect(result.collections.map((c) => c.slug)).toEqual([
      "foundational", "premium", "kinetic", "terminal",
    ]);
    // document order is preserved
    expect(result.variants.map((v) => v.id)).toEqual([
      "c01-01", "c02-08", "c12-02", "c12-05", "c09-05",
    ]);
  });

  it("assigns label/value slots from semantic classes", () => {
    const c0101 = result.variants.find((v) => v.id === "c01-01")!;
    expect(c0101.hasLabel && c0101.hasValue).toBe(true);
    expect(c0101.defaultLabel).toBe("build");
    expect(c0101.defaultValue).toBe("passing");
  });

  it("does not treat the monogram glyph as the extra slot", () => {
    const monogram = result.variants.find((v) => v.id === "c02-08")!;
    expect(monogram.defaultLabel).toBe("engine");
    expect(monogram.defaultValue).toBe("vexillum");
    expect(monogram.defaultExtra).toBeNull();
  });

  it("materializes pseudo-elements as real spans", () => {
    const c0101 = result.variants.find((v) => v.id === "c01-01")!;
    expect(c0101.tsx).toContain('data-pseudo="before"');
    expect(c0101.tsx).toContain("translateY(-50%)");
    expect(c0101.tsx).not.toContain("::before");
  });

  it("captures the default icon with explicit dimensions", () => {
    const c0101 = result.variants.find((v) => v.id === "c01-01")!;
    expect(c0101.hasIcon).toBe(true);
    expect(c0101.defaultIcon).toContain("<svg");
    expect(c0101.defaultIcon).toContain('width="14"');
    expect(c0101.defaultIcon).toContain('height="14"');
    expect(c0101.tsx).toContain("{icon ?? <IconSlot />}");
  });

  it("tokenizes semantic colors with fallbacks", () => {
    const c0101 = result.variants.find((v) => v.id === "c01-01")!;
    expect(c0101.tsx).toContain("var(--label-bg, #f3f4f6)");
    expect(c0101.tsx).toContain("var(--value-fg, #ffffff)");
    // resolved tokens documented for the default theme
    expect(c0101.resolvedTokens["label-bg"]).toBe("#f3f4f6");
  });

  it("emits animations with metadata and data-anim attrs", () => {
    const progress = result.variants.find((v) => v.id === "c12-02")!;
    expect(progress.animations).toHaveLength(1);
    expect(progress.animations[0]).toMatchObject({ name: "slide", durationMs: 2000 });
    expect(progress.tsx).toContain('data-anim="slide"');
  });

  it("renames conflicting keyframes per variant", () => {
    // blink is defined twice with different bodies → per-variant renames
    const a = result.variants.find((v) => v.id === "c12-05")!;
    const b = result.variants.find((v) => v.id === "c09-05")!;
    expect(a.animations[0].name).toBe("c12-05-blink");
    expect(b.animations[0].name).toBe("c09-05-blink");
    expect(result.keyframesCss).toContain("@keyframes c12-05-blink");
    expect(result.keyframesCss).toContain("@keyframes c09-05-blink");
  });

  it("produces a registry with collections and variants", () => {
    expect(result.registry.collections).toHaveLength(4);
    expect(result.registry.variants).toHaveLength(5);
    const entry = result.registry.variants.find((v) => v.id === "c01-01")!;
    expect(entry.defaultIcon).toBeTruthy();
    expect(entry.animations).toEqual([]);
  });

  it("emits tailwind classes alongside inline styles", () => {
    const c0101 = result.variants.find((v) => v.id === "c01-01")!;
    expect(c0101.tsx).toContain("inline-flex");
    expect(c0101.tsx).toContain("items-center");
    // inline style remains the source of truth
    expect(c0101.tsx).toContain('"height": "24px"');
  });
});

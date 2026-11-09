/**
 * Converter fidelity suite (Task 3-a): every decoration-drop class found by
 * the source-parity audit, expressed as failing-first tests.
 *
 * Bug classes covered here:
 *  A. pseudo-elements on the ROOT badge element were dropped
 *  B. inline `style="…"` attributes were ignored by the cascade
 *  C. selector shapes the matcher did not understand: bare tag compounds,
 *     :nth-child on tags, :first-child/:last-child, `+`/`>` combinators, `*`
 *  D. slot expressions were emitted before `::before` materializations
 *  E. gradient backgrounds must become token-driven (--g-from/--g-to/…)
 *  F. pseudo-elements lay out content-box (they never match the page's
 *     `* { box-sizing: border-box }` rule) and are aria-hidden decoration
 *  G. column-layout roots self-constrain to the source grid cell width and
 *     let long value text wrap (pull-quote overflow)
 *  H. decorative (non-icon) svgs beyond the first survive verbatim
 */
import { describe, expect, it } from "vitest";
import { convert } from "../src/index";
import { computeStyle } from "../src/style";
import { makeEl, parseHtml } from "../src/dom";
import { parseDeclarations } from "../src/css";

const FIXTURE = `<!DOCTYPE html>
<html lang="en">
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .badge { display: inline-flex; align-items: center; font-size: 12px; font-weight: 600; line-height: 1; white-space: nowrap; }

  /* class A: root pseudo-elements (folds, frames, hazard stripes) */
  .c02-07 { height: 26px; background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; position: relative; margin: 0 8px; }
  .c02-07::before, .c02-07::after { content: ''; position: absolute; top: 0; width: 8px; height: 100%; background: inherit; }
  .c02-07::before { left: -8px; clip-path: polygon(100% 0, 100% 100%, 0 50%); }
  .c02-07::after { right: -8px; clip-path: polygon(0 0, 0 100%, 100% 50%); }
  .c02-07 .label { color: #ffffff; }
  .c02-03 { height: 28px; padding: 3px; background: #ffffff; border: 1px solid #111827; position: relative; }
  .c02-03::before { content: ''; position: absolute; inset: 3px; border: 1px solid #111827; border-radius: 2px; pointer-events: none; }
  .c02-03 .inner { height: 100%; padding: 0 10px; display: inline-flex; align-items: center; gap: 8px; }

  /* class B: inline styles carry the geometry (sparkline bars, segs) */
  .c13-06 { gap: 8px; background: #ffffff; }
  .c13-06 .bars { display: flex; gap: 2px; align-items: flex-end; height: 14px; }
  .c13-06 .bars span { width: 3px; background: #3b82f6; border-radius: 1px; }
  .c13-06 .label { color: #6b7280; }

  /* class C: selector shapes */
  .c13-07 { gap: 8px; }
  .c13-07 .heatmap { display: grid; grid-template-columns: repeat(7, 4px); gap: 1px; }
  .c13-07 .heatmap span { width: 4px; height: 4px; border-radius: 1px; }
  .c13-07 .heatmap .l2 { background: #40c463; }

  .c15-09 { gap: 8px; }
  .c15-09 .bars { display: flex; gap: 1px; align-items: flex-end; height: 10px; }
  .c15-09 .bars span { width: 2px; background: #10b981; }
  .c15-09 .bars span:nth-child(2) { height: 70%; }

  .c14-07 { gap: 8px; }
  .c14-07 .avatars { display: flex; }
  .c14-07 .avatars .av { width: 18px; height: 18px; border-radius: 50%; margin-left: -6px; }
  .c14-07 .avatars .av:first-child { margin-left: 0; }

  .c01-14 { height: 24px; }
  .c01-14 .seg { padding: 0 10px; border-right: 1px solid rgba(255,255,255,0.2); }
  .c01-14 .seg:last-child { border-right: none; }

  .c11-15 { height: 28px; }
  .c11-15 .step { height: 100%; background: #111827; color: #ffffff; padding: 0 12px; }
  .c11-15 .step + .step { margin-left: -8px; background: #374151; }

  .c11-11 { height: 28px; }
  .c11-11 > * { transform: skewX(10deg); }

  /* class D: ::before materialization must precede the slot expression */
  .c12-09 { gap: 8px; }
  .c12-09 .delta { color: #10b981; font-weight: 700; }
  .c12-09 .delta.up::before { content: '↑ '; }

  /* class E: gradients on roles */
  .c04-07 { height: 26px; background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: #ffffff; }
  .c04-07 .label { color: #ffffff; }
  .c04-12 { height: 26px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%); }
  .c04-12 .label { color: #111827; }
  .c01-01 .label { background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%); color: #374151; }
  .c01-01 .value { background: linear-gradient(180deg, #1f2937 0%, #111827 100%); color: #ffffff; }

  /* class F: bordered pseudo on an inset box (gauge arc geometry) */
  .c15-05 { gap: 8px; }
  .c15-05 .gauge { width: 60px; height: 30px; position: relative; overflow: hidden; }
  .c15-05 .gauge::before { content: ''; position: absolute; inset: 0; border: 6px solid #e5e7eb; border-bottom: none; border-radius: 60px 60px 0 0; }

  /* class G: column pull-quote card */
  .c06-15 { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 12px 16px; background: #fafafa; border-left: 2px solid #111827; }
  .c06-15 .label { color: #6b7280; font-size: 10px; text-transform: uppercase; }
  .c06-15 .value { color: #111827; font-size: 18px; font-style: italic; }

  /* class H: decorative svg beyond the icon slot */
  .c13-08 { gap: 8px; }
  .c13-08 .deco { width: 10px; height: 10px; }
</style>
</head>
<body>
  <section class="collection" id="c02"><div class="collection-header"><span class="collection-number">C02</span><span class="collection-title">PREMIUM</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">07 · Folded ribbon</div><div class="badge c02-07"><span class="label">featured</span><span class="value">pick</span></div></div>
      <div class="variant"><div class="variant-title">03 · Certified</div><div class="badge c02-03"><div class="inner"><span class="label">cert</span><span class="value">partner</span></div></div></div>
    </div>
  </section>
  <section class="collection" id="c13"><div class="collection-header"><span class="collection-number">C13</span><span class="collection-title">DATA</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">06 · Trend bars</div><div class="badge c13-06"><div class="bars"><span style="height: 40%;"></span><span style="height: 70%;"></span><span style="height: 50%;"></span></div><span class="label">trend</span><span class="value">+18%</span></div></div>
      <div class="variant"><div class="variant-title">07 · Heatmap</div><div class="badge c13-07"><div class="heatmap"><span class="l0"></span><span class="l2"></span><span class="l4"></span></div><span class="label">commits</span></div></div>
    </div>
  </section>
  <section class="collection" id="c15"><div class="collection-header"><span class="collection-number">C15</span><span class="collection-title">STATUS</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">09 · Bars</div><div class="badge c15-09"><div class="bars"><span></span><span></span><span></span></div><span class="label">load</span></div></div>
    </div>
  </section>
  <section class="collection" id="c14"><div class="collection-header"><span class="collection-number">C14</span><span class="collection-title">SOCIAL</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">07 · Avatars</div><div class="badge c14-07"><div class="avatars"><div class="av a"></div><div class="av b"></div><div class="av c"></div></div><span class="label">team</span></div></div>
    </div>
  </section>
  <section class="collection" id="c01"><div class="collection-header"><span class="collection-number">C01</span><span class="collection-title">FOUNDATIONAL</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">14 · Segments</div><div class="badge c01-14"><div class="seg seg1"><span>tests</span></div><div class="seg seg2"><span>142</span></div></div></div>
      <div class="variant"><div class="variant-title">01 · Two-tone</div><div class="badge c01-01"><div class="label"><span>build</span></div><div class="value"><span>passing</span></div></div></div>
    </div>
  </section>
  <section class="collection" id="c11"><div class="collection-header"><span class="collection-number">C11</span><span class="collection-title">SHAPES</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">15 · Steps</div><div class="badge c11-15"><div class="step"><span class="label">label</span></div><div class="step"><span class="value">value</span></div></div></div>
      <div class="variant"><div class="variant-title">11 · Skew</div><div class="badge c11-11"><span class="label">slant</span><span class="value">wide</span></div></div>
    </div>
  </section>
  <section class="collection" id="c12"><div class="collection-header"><span class="collection-number">C12</span><span class="collection-title">KINETIC</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">09 · Delta</div><div class="badge c12-09"><span class="label">delta</span><span class="delta up">12.4%</span></div></div>
    </div>
  </section>
  <section class="collection" id="c04"><div class="collection-header"><span class="collection-number">C04</span><span class="collection-title">LUMINOUS</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">07 · Glow</div><div class="badge c04-07"><span class="label">neon</span><span class="value">glow</span></div></div>
      <div class="variant"><div class="variant-title">12 · Amber</div><div class="badge c04-12"><span class="label">sun</span><span class="value">bright</span></div></div>
    </div>
  </section>
  <section class="collection" id="c06"><div class="collection-header"><span class="collection-number">C06</span><span class="collection-title">EDITORIAL</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">15 · Pull quote</div><div class="badge c06-15"><span class="label">quote</span><span class="value">&quot;Design is intelligence made visible.&quot;</span></div></div>
    </div>
  </section>
  <section class="collection" id="c15b"><div class="collection-header"><span class="collection-number">C15</span><span class="collection-title">STATUS</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">05 · Gauge</div><div class="badge c15-05"><div class="gauge"></div><span class="value">70</span></div></div>
    </div>
  </section>
  <section class="collection" id="c13b"><div class="collection-header"><span class="collection-number">C13</span><span class="collection-title">DATA</span><span class="collection-desc">d</span></div>
    <div class="grid">
      <div class="variant"><div class="variant-title">08 · Deco svg</div><div class="badge c13-08"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15V3"/></svg><span class="label">deco</span><svg class="deco" viewBox="0 0 10 10"><rect x="1" y="1" width="4" height="4"/></svg></div></div>
    </div>
  </section>
</body>
</html>`;

const result = convert(FIXTURE);
const byId = (id: string) => result.variants.find((v) => v.id === id)!;

describe("class A: root pseudo-elements materialize", () => {
  it("emits ::before/::after spans inside the root element", () => {
    const tsx = byId("c02-07").tsx;
    expect(tsx).toContain('data-pseudo="before"');
    expect(tsx).toContain('data-pseudo="after"');
    // folds sit inside the root div (before the label span)
    const beforeIdx = tsx.indexOf('data-pseudo="before"');
    const rootIdx = tsx.indexOf("<div");
    const labelIdx = tsx.indexOf('className="label');
    expect(beforeIdx).toBeGreaterThan(rootIdx);
    expect(beforeIdx).toBeLessThan(labelIdx);
  });

  it("keeps background:inherit so the folds pick up the ribbon gradient", () => {
    const tsx = byId("c02-07").tsx;
    expect(tsx).toContain('"background": "inherit"');
    expect(tsx).toContain('"clipPath": "polygon(100% 0, 100% 100%, 0 50%)"');
  });

  it("keeps root ::before with content-less decorative frames (c02-03 style)", () => {
    // c02-03 root has ::before { inset: 3px; border: … } — a frame
    const tsx = byId("c02-03").tsx;
    expect(tsx).toContain('data-pseudo="before"');
  });
});

describe("class B: inline style attributes join the cascade", () => {
  it("inline height survives next to class-rule width (sparkline bars)", () => {
    const tsx = byId("c13-06").tsx;
    expect(tsx).toContain('"height": "40%"');
    expect(tsx).toContain('"width": "3px"');
    expect(tsx).toContain('"height": "70%"');
  });

  it("inline styles override the cascade on conflicts", () => {
    // real parse tree so the descendant rule's ancestor chain exists
    const root = parseHtml('<div class="v"><span class="b" style="width: 9px"></span></div>');
    const el = root.childNodes![0] as never as Parameters<typeof computeStyle>[0];
    const rules = [
      { selector: ".v .b", declarations: { width: "3px", color: "red" } },
    ];
    const st = computeStyle(el, rules, "v");
    expect(st.declarations["width"]).toBe("9px");
    expect(st.declarations["color"]).toBe("red");
  });
});

describe("class C: selector shapes", () => {
  it("matches bare tag compounds (.heatmap span)", () => {
    const tsx = byId("c13-07").tsx;
    expect(tsx).toContain('"width": "4px"');
    expect(tsx).toContain('"height": "4px"');
    expect(tsx).toContain('"background": "#40c463"');
  });

  it("matches :nth-child on tag compounds (.bars span:nth-child(2))", () => {
    const tsx = byId("c15-09").tsx;
    expect(tsx).toContain('"height": "70%"');
    // exactly one bar carries the nth height
    expect(tsx.split('"height": "70%"')).toHaveLength(2);
  });

  it("matches :first-child (.av:first-child resets the overlap margin)", () => {
    const tsx = byId("c14-07").tsx;
    // first avatar: margin-left 0; others: -6px
    expect(tsx.split('"marginLeft": "0"')).toHaveLength(2);
    expect(tsx.split('"marginLeft": "-6px"')).toHaveLength(3);
  });

  it("matches :last-child (.seg:last-child drops the divider)", () => {
    const tsx = byId("c01-14").tsx;
    // two segs: seg1 keeps the divider, seg2 (last child) overrides it to none
    expect(tsx).toContain('"borderRight": "none"');
    expect(tsx.split('"borderRight": "1px solid rgba(255,255,255,0.2)"')).toHaveLength(2);
  });

  it("matches the adjacent sibling combinator (.step + .step)", () => {
    const tsx = byId("c11-15").tsx;
    expect(tsx.split('"background": "#374151"')).toHaveLength(2);
    expect(tsx).toContain('"marginLeft": "-8px"');
  });

  it("matches child combinator + universal (.c11-11 > *)", () => {
    const tsx = byId("c11-11").tsx;
    expect(tsx.split('"transform": "skewX(10deg)"')).toHaveLength(3); // 2 spans + root itself? no — children only
    expect(tsx.split('"transform": "skewX(10deg)"').length).toBeGreaterThan(1);
  });
});

describe("class D: slot expressions come after ::before materializations", () => {
  it("renders the delta arrow before the value text", () => {
    const tsx = byId("c12-09").tsx;
    const valueIdx = tsx.indexOf("{value}");
    const pseudoIdx = tsx.indexOf('data-pseudo="before"');
    expect(pseudoIdx).toBeGreaterThan(-1);
    expect(pseudoIdx).toBeLessThan(valueIdx);
    expect(tsx).toContain("↑ ");
  });
});

describe("class E: gradient backgrounds become token-driven", () => {
  it("two-stop root gradient maps to var(--g-from)/var(--g-to)", () => {
    const tsx = byId("c04-07").tsx;
    expect(tsx).toContain("var(--g-from, #7c3aed)");
    expect(tsx).toContain("var(--g-to, #db2777)");
  });

  it("three-stop root gradient maps the middle stop to var(--value-bg)", () => {
    const tsx = byId("c04-12").tsx;
    expect(tsx).toContain("var(--g-from, #fef3c7)");
    expect(tsx).toContain("var(--value-bg, #fde68a)");
    expect(tsx).toContain("var(--g-to, #fbbf24)");
  });

  it("label gradients map to the label ramp (--gl-from/--gl-to)", () => {
    const tsx = byId("c01-01").tsx;
    expect(tsx).toContain("var(--gl-from, #f3f4f6)");
    expect(tsx).toContain("var(--gl-to, #e5e7eb)");
    // value segment uses the primary ramp
    expect(tsx).toContain("var(--g-from, #1f2937)");
    expect(tsx).toContain("var(--g-to, #111827)");
  });

  it("leaves repeating gradients and non-role gradients literal", () => {
    const el = makeEl("div", { class: "badge c03-04" });
    const st = computeStyle(
      el,
      [
        {
          selector: ".c03-04",
          declarations: {
            background:
              "repeating-linear-gradient(to bottom, #6b7280 0px, #6b7280 1px, transparent 1px, transparent 3px)",
          },
        },
      ],
      "c03-04",
    );
    expect(st.declarations["background"]).not.toContain("var(");
  });
});

describe("class F: pseudo-element box model + a11y", () => {
  it("materialized pseudo spans declare box-sizing: content-box", () => {
    // pseudo-elements never match the page's `* { box-sizing: border-box }`
    // rule, so they lay out content-box — vexillum's element default is
    // border-box, so the converter must pin it explicitly
    const tsx = byId("c02-07").tsx;
    expect(tsx.split('"boxSizing": "content-box"').length - 1).toBe(2); // both folds
  });

  it("bordered inset pseudo keeps content-box so the border grows the box (gauge arc)", () => {
    const tsx = byId("c15-05").tsx;
    expect(tsx).toContain('"boxSizing": "content-box"');
    expect(tsx).toContain('"border": "6px solid #e5e7eb"');
    expect(tsx).toContain('"borderRadius": "60px 60px 0 0"');
  });

  it("materialized pseudo spans are aria-hidden decoration", () => {
    const tsx = byId("c02-07").tsx;
    expect(tsx.split('aria-hidden="true"').length - 1).toBe(2);
    expect(tsx).toContain('data-pseudo="before"');
  });
});

describe("class G: column-layout self-constraint (pull quote)", () => {
  it("column roots cap at the source grid cell width and let the value wrap", () => {
    const tsx = byId("c06-15").tsx;
    expect(tsx).toContain('"maxWidth": "326px"');
    // white-space: normal lands on the value span (after root, before {value})
    const wsIdx = tsx.indexOf('"whiteSpace": "normal"');
    expect(wsIdx).toBeGreaterThan(-1);
    expect(wsIdx).toBeGreaterThan(tsx.indexOf("<div"));
    expect(tsx.indexOf("{value}")).toBeGreaterThan(wsIdx);
  });

  it("row-layout roots are untouched", () => {
    expect(byId("c02-07").tsx).not.toContain('"maxWidth"');
  });
});

describe("class H: decorative svgs beyond the icon slot", () => {
  it("keeps the first svg as the icon slot and preserves later svgs verbatim", () => {
    const tsx = byId("c13-08").tsx;
    expect(tsx).toContain("{icon ?? <IconSlot />}");
    expect(tsx).toContain('<rect x="1" y="1" width="4" height="4"');
    expect(tsx).toContain('className="deco');
  });
});

describe("inline style parsing helper", () => {
  it("parseDeclarations handles the sparkline inline style", () => {
    expect(parseDeclarations("height: 40%")).toEqual({ height: "40%" });
  });
});

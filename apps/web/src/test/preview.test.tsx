import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ICON_MARKER } from "@vexillum/badges/types";
import { renderVariant, variantById, variants } from "@/lib/badge";

/**
 * Icon-marker parity: the generated components render `{icon ?? <IconSlot />}`
 * and IconSlot emits the literal `__VX_ICON__` compile-time SSR marker (the
 * Rust engine substitutes it in template mode). Client previews must NEVER
 * surface that marker as text — `null` triggers the ?? fallback exactly like
 * `undefined`, so renderVariant has to hand every icon slot a concrete,
 * non-nullish ReactElement in all three Playground modes (default / none /
 * explicit node) and for the declarative `icon: "default"` contract.
 */
describe("renderVariant icon contract — the __VX_ICON__ marker never leaks", () => {
  it("renders every variant with the default preview spec without emitting the marker", () => {
    for (const v of variants) {
      const html = renderToStaticMarkup(renderVariant({ variant: v })!);
      expect(html, v.id).not.toContain(ICON_MARKER);
    }
  });

  it("keeps the icon: 'default' contract — registry icon renders (Explore/Landing/Themes)", () => {
    const v = variantById("c01-01")!;
    expect(v.hasIcon).toBe(true);
    expect(v.defaultIcon).toBeTruthy();
    const html = renderToStaticMarkup(renderVariant({ variant: v, icon: "default" })!);
    expect(html).toContain("display:contents"); // defaultIconNode wrapper
    expect(html).toContain("<svg"); // the actual default icon markup
    expect(html).not.toContain(ICON_MARKER);
  });

  it("treats iconNode: undefined as 'default' mode — registry icon, no marker (Playground default)", () => {
    const v = variantById("c01-01")!;
    const html = renderToStaticMarkup(renderVariant({ variant: v })!);
    expect(html).toContain("display:contents");
    expect(html).not.toContain(ICON_MARKER);
  });

  it("treats iconNode: null as explicit 'none' — empty stand-in, never the marker (Playground none)", () => {
    const v = variantById("c01-01")!;
    const html = renderToStaticMarkup(renderVariant({ variant: v, iconNode: null })!);
    expect(html).not.toContain(ICON_MARKER);
    expect(html).not.toContain("display:contents");
    expect(html).toContain('<span aria-hidden="true"></span>');
  });

  it("passes an explicit iconNode through verbatim (curated slug / custom SVG)", () => {
    const v = variantById("c01-01")!;
    const html = renderToStaticMarkup(
      renderVariant({
        variant: v,
        iconNode: <svg data-testid="custom-icon" viewBox="0 0 24 24" />,
      })!,
    );
    expect(html).toContain('data-testid="custom-icon"');
    expect(html).not.toContain(ICON_MARKER);
  });

  it("variants without an icon slot stay marker-free too", () => {
    const v = variantById("c12-01")!; // kinetic pulse beacon — no icon slot
    expect(v.hasIcon).toBe(false);
    const html = renderToStaticMarkup(renderVariant({ variant: v })!);
    expect(html).not.toContain(ICON_MARKER);
  });
});

/**
 * Theme parity: choosing a preset in the playground MUST change the badge.
 * Tokens are applied as CSS custom properties on a display:contents wrapper,
 * which every generated component's `var(--token, source-fallback)` styles
 * then resolve — mirroring the server's `?theme=` textual substitution.
 */
describe("renderVariant theme contract — preset tokens theme the live preview", () => {
  it("wraps themed previews with the token CSS variables", () => {
    const v = variantById("c01-01")!;
    const tokens = {
      "label-bg": "#881337",
      "label-fg": "#ffe4e6",
      "value-bg": "#f43f5e",
      "value-fg": "#ffffff",
      border: "#f43f5e",
      divider: "#fb7185",
      accent: "#f43f5e",
      "accent-fg": "#ffffff",
      "icon-color": "#ffffff",
      "g-from": "#f43f5e",
      "g-to": "#be123c",
      "gl-from": "#881337",
      "gl-to": "#4c0519",
    };
    const html = renderToStaticMarkup(renderVariant({ variant: v, tokens })!);
    expect(html).toContain('data-vx-themed="true"');
    expect(html).toContain("--label-bg:#881337");
    expect(html).toContain("--value-bg:#f43f5e");
    expect(html).toContain("--g-to:#be123c");
    // unthemed previews stay wrapper-free (byte-identical legacy markup)
    const plain = renderToStaticMarkup(renderVariant({ variant: v })!);
    expect(plain).not.toContain("data-vx-themed");
  });
});

describe("renderVariant semantic contract — seed ramp theming", () => {
  it("applies the full --vx-* ramp on the themed wrapper", async () => {
    const { render, cleanup } = await import("@testing-library/react");
    const v = variantById("c01-01")!;
    const { container } = render(
      renderVariant({ variant: v, semantic: { seed: "#ec4899", mode: "light" } })!,
    );
    const themed = container.querySelector('[data-vx-themed="true"]') as HTMLElement;
    expect(themed).toBeTruthy();
    // the accent carries the seed hue, the surface ramp resolves alongside
    const accent = themed.style.getPropertyValue("--vx-a");
    expect(accent).toMatch(/^oklch\([\d.]+ [\d.]+ /);
    expect(parseFloat(accent.slice(6))).toBeGreaterThan(0.1); // chroma present
    expect(themed.style.getPropertyValue("--vx-s-white")).toMatch(/^oklch\(/);
    expect(themed.style.getPropertyValue("--vx-t-heading")).toMatch(/^oklch\(/);
    cleanup();
  });

  it("dark mode flips the surface tokens on the wrapper", async () => {
    const { render, cleanup } = await import("@testing-library/react");
    const v = variantById("c01-01")!;
    const light = render(
      renderVariant({ variant: v, semantic: { seed: "#3b82f6", mode: "light" } })!,
    ).container.querySelector('[data-vx-themed="true"]') as HTMLElement;
    const dark = render(
      renderVariant({ variant: v, semantic: { seed: "#3b82f6", mode: "dark" } })!,
    ).container.querySelector('[data-vx-themed="true"]') as HTMLElement;
    const lw = parseFloat(light.style.getPropertyValue("--vx-s-white").slice(6));
    const dw = parseFloat(dark.style.getPropertyValue("--vx-s-white").slice(6));
    expect(lw).toBeGreaterThan(0.95);
    expect(dw).toBeLessThan(0.35);
    // accents stay put
    expect(dark.style.getPropertyValue("--vx-a")).toBe(light.style.getPropertyValue("--vx-a"));
    cleanup();
  });

  it("leaves unthemed previews untouched (no wrapper, no vars)", async () => {
    const { render, cleanup } = await import("@testing-library/react");
    const v = variantById("c01-01")!;
    const { container } = render(renderVariant({ variant: v })!);
    expect(container.querySelector('[data-vx-themed="true"]')).toBeNull();
    cleanup();
  });
});

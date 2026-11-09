import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { iconNodeFromEntry } from "@/lib/badge";
import { isIcondataSlug, setOfSlug, SET_META } from "@/lib/icon-library";

/**
 * icondata integration: slug grammar, set routing, and the per-entry
 * viewBox/stroke handling of the client node builder (parity with the
 * server's `wrap_entry_svg`).
 */
describe("icon library slug grammar", () => {
  it("routes icondata slugs by set prefix and leaves brand slugs alone", () => {
    expect(isIcondataSlug("mdi-account")).toBe(true);
    expect(isIcondataSlug("si-github")).toBe(true);
    expect(isIcondataSlug("lu-git-branch")).toBe(true);
    // brand slugs are bare — even when they contain a dash
    expect(isIcondataSlug("github")).toBe(false);
    expect(isIcondataSlug("creative-commons")).toBe(false); // no such set prefix
    expect(setOfSlug("mdi-account")).toBe("mdi");
    expect(setOfSlug("github")).toBeNull();
  });

  it("ships the full icondata catalog metadata (19 sets, 30k+ icons)", () => {
    expect(SET_META.length).toBeGreaterThanOrEqual(19);
    const total = SET_META.reduce((n, s) => n + s.count, 0);
    expect(total).toBeGreaterThan(30_000);
    const mdi = SET_META.find((s) => s.id === "mdi")!;
    expect(mdi.count).toBeGreaterThan(7_000);
    expect(mdi.label).toBe("Material Design Icons");
  });
});

describe("iconNodeFromEntry — per-entry viewBox and stroke parity", () => {
  it("renders fill-based 24×24 entries with currentColor by default", () => {
    const html = renderToStaticMarkup(
      iconNodeFromEntry({ v: "0 0 24 24", d: '<path d="M0 0"/>' }, 14),
    );
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('width="14"');
    expect(html).toContain('fill="currentColor"');
    expect(html).toContain('d="M0 0"');
  });

  it("applies a color override to the fill for fill-based entries", () => {
    const html = renderToStaticMarkup(
      iconNodeFromEntry({ v: "0 0 24 24", d: '<path d="M0 0"/>' }, 14, "#ff0000"),
    );
    expect(html).toContain('fill="#ff0000"');
  });

  it("honors per-entry viewBox (icondata is NOT uniformly 24×24)", () => {
    const html = renderToStaticMarkup(
      iconNodeFromEntry({ v: "0 0 30 30", d: '<path d="M0 0"/>' }, 14),
    );
    expect(html).toContain('viewBox="0 0 30 30"');
  });

  it("colorizes stroke-based entries (lucide-style) via stroke, keeping fill none", () => {
    const lucide = {
      v: "0 0 24 24",
      d: '<circle cx="12" cy="12" r="10"/>',
      f: "none",
      st: "currentColor",
      sw: "2",
      slc: "round",
      slj: "round",
    };
    const plain = renderToStaticMarkup(iconNodeFromEntry(lucide, 14));
    expect(plain).toContain('fill="none"');
    expect(plain).toContain('stroke="currentColor"');
    expect(plain).toContain('stroke-width="2"');
    const colored = renderToStaticMarkup(iconNodeFromEntry(lucide, 14, "#00ff00"));
    expect(colored).toContain('stroke="#00ff00"');
    expect(colored).toContain('fill="none"');
    expect(colored).not.toContain('fill="#00ff00"');
  });
});

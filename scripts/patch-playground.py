#!/usr/bin/env python3
"""Wires the Google Fonts picker into PlaygroundPage (idempotent, verified)."""
import sys

p = "apps/web/src/pages/PlaygroundPage.tsx"
src = open(p).read()
orig = src

# 1. imports
src = src.replace(
    'import { BUNDLED_FONTS, badgeFontFamily, badgeUrl, hasApiBase, isBadgeFont, type BadgeFont } from "@/lib/api";',
    'import { BUNDLED_FONTS, badgeFontFamily, badgeUrl, hasApiBase } from "@/lib/api";\n'
    'import {\n'
    '  ensureGoogleFontLoaded,\n'
    '  loadGoogleFonts,\n'
    '  resolveFontChoice,\n'
    '  type GoogleFontInfo,\n'
    '} from "@/lib/google-fonts";',
)
src = src.replace(
    'import { useEffect, useMemo, useState, type CSSProperties } from "react";',
    'import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";',
)

# 2. module-level helper
marker = "const curatedIconHex = (slug: string): string | undefined =>\n  CURATED_ICONS.find((i) => i.slug === slug)?.hex;"
assert marker in src, "curatedIconHex marker missing"
src = src.replace(
    marker,
    marker
    + "\n\nconst isBundledSlug = (slug: string | null | undefined): boolean =>\n  !!slug && BUNDLED_FONTS.some((f) => f.slug === slug);",
)

# 3. font state block
old_state = '''  const [font, setFont] = useState<BadgeFont | "source">(() => {
    const f = params.get("font");
    return isBadgeFont(f) ? f : "source";
  });'''
new_state = '''  // ?font= deep link: bundled slugs resolve synchronously; Google slugs are
  // validated + resolved once the catalog chunk loads (unknown → source)
  const [font, setFont] = useState<string>(() => {
    const f = params.get("font");
    return f && f !== "source" ? f : "source";
  });
  const [fontLabel, setFontLabel] = useState<string>(() => {
    const f = params.get("font");
    return f && f !== "source" ? f : "Source (badge design)";
  });
  const [fontFamily, setFontFamily] = useState<string | null>(() => {
    const f = params.get("font");
    return isBundledSlug(f) ? badgeFontFamily(f) : null;
  });
  const [googleFonts, setGoogleFonts] = useState<GoogleFontInfo[] | null>(null);
  // the catalog effect reads the latest selection without re-subscribing
  const fontRef = useRef(font);
  fontRef.current = font;'''
assert old_state in src, "font state block missing"
src = src.replace(old_state, new_state)

# 4. catalog effect — anchor on the label state declaration
anchor = '  const [label, setLabel] = useState("build");'
assert anchor in src, "label state anchor missing"
effect = '''  // catalog chunk loads once; resolves a pending Google ?font= deep link
  // (family + stylesheet link) and resets an unknown slug to source
  useEffect(() => {
    let cancelled = false;
    loadGoogleFonts().then((catalog) => {
      if (cancelled) return;
      setGoogleFonts(catalog);
      const current = fontRef.current;
      if (current === "source" || isBundledSlug(current)) return;
      const choice = resolveFontChoice(current, catalog, BUNDLED_FONTS);
      if (!choice || choice === "source") {
        setFont("source");
        setFontLabel("Source (badge design)");
        setFontFamily(null);
        return;
      }
      ensureGoogleFontLoaded(choice.family);
      setFontFamily(choice.family);
      setFontLabel(choice.family);
    });
    return () => {
      cancelled = true;
    };
  }, []);

'''
src = src.replace(anchor, effect + anchor, 1)

# 5. URL builder font option
old_url = "      font: isBadgeFont(font) ? font : undefined,"
new_url = "      font: font === \"source\" ? undefined : font,"
assert old_url in src, "url font option missing"
src = src.replace(old_url, new_url)

# 6. preview font style
old_preview = '''  // live preview honors the font override by inheritance; "source" = untouched
  const previewFontStyle: CSSProperties | undefined = isBadgeFont(font)
    ? { fontFamily: badgeFontFamily(font) }
    : undefined;'''
new_preview = '''  // live preview honors the font override by inheritance; "source" = untouched
  const previewFontStyle: CSSProperties | undefined =
    fontFamily && font !== "source" ? { fontFamily } : undefined;'''
assert old_preview in src, "preview font style missing"
src = src.replace(old_preview, new_preview)

# 7. the picker UI: Select → datalist combobox
old_ui = '''          <div className="rounded-lg border border-border bg-white p-4">
            <Label htmlFor="pg-font">Font</Label>
            <Select
              id="pg-font"
              value={font}
              onChange={(e) => setFont(isBadgeFont(e.target.value) ? e.target.value : "source")}
            >
              <option value="source">Source (badge design)</option>
              {BUNDLED_FONTS.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.label}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Server renders with bundled fonts: {BUNDLED_FONTS.map((f) => f.label).join(" · ")}
            </p>
          </div>'''
new_ui = '''          <div className="rounded-lg border border-border bg-white p-4">
            <Label htmlFor="pg-font">Font</Label>
            <Input
              id="pg-font"
              list="pg-font-list"
              value={fontLabel}
              autoComplete="off"
              placeholder="Search fonts…"
              onChange={(e) => selectFont(e.target.value)}
            />
            <datalist id="pg-font-list">
              <option value="source">Source (badge design)</option>
              {BUNDLED_FONTS.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.label}
                </option>
              ))}
              {(googleFonts ?? []).map((f) => (
                <option key={f.slug} value={f.slug}>
                  {`${f.family} — Google Fonts · ${f.category}`}
                </option>
              ))}
            </datalist>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Server renders with bundled fonts: {BUNDLED_FONTS.map((f) => f.label).join(" · ")} —
              plus {(googleFonts?.length ?? 0) > 0
                ? `${googleFonts!.length.toLocaleString()} Google Fonts`
                : "the full Google Fonts catalog"}
              . Type a name to search.
            </p>
          </div>'''
assert old_ui in src, "picker UI block missing"
src = src.replace(old_ui, new_ui)

# 8. selectFont handler — anchor after previewFontStyle block
anchor2 = new_preview
handler = '''
  /**
   * Resolves a font picker entry to a renderable selection. Bundled slugs
   * and "source" resolve synchronously (keeps the preview + URL instant);
   * Google lookups fall back to the (already loaded) catalog or, on a cold
   * start, to the async loader. Unresolvable input keeps the previous
   * selection — the URL must only ever carry slugs the API accepts.
   */
  const selectFont = (raw: string) => {
    const sync = resolveFontChoice(raw, googleFonts, BUNDLED_FONTS);
    if (sync) {
      applyFontChoice(sync);
      return;
    }
    void loadGoogleFonts().then((catalog) => {
      setGoogleFonts(catalog);
      const async = resolveFontChoice(raw, catalog, BUNDLED_FONTS);
      if (async) applyFontChoice(async);
      else setFontLabel(raw); // keep the typed text; selection unchanged
    });
  };

  function applyFontChoice(
    choice: ReturnType<typeof resolveFontChoice>,
  ): asserts choice is Exclude<ReturnType<typeof resolveFontChoice>, null> {
    if (choice === "source") {
      setFont("source");
      setFontLabel("Source (badge design)");
      setFontFamily(null);
      return;
    }
    setFont(choice.slug);
    setFontLabel(choice.family);
    setFontFamily(choice.family);
    if (!choice.bundled) ensureGoogleFontLoaded(choice.family);
  }
'''
assert anchor2 in src
src = src.replace(anchor2, anchor2 + handler, 1)

assert src != orig
open(p, "w").write(src)
print("PlaygroundPage wired")

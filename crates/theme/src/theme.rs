//! The frozen theme token vocabulary, brand→theme resolution, presets, and
//! the CSS custom-property block injected at render time.

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::color::Oklch;
use crate::contrast::{self, AA, ensure_readable_pair};

/// White, the reference surface for the on-light ink tokens.
const WHITE: Oklch = Oklch {
    l: 1.0,
    c: 0.0,
    h: 0.0,
};

/// The complete frozen token vocabulary (spec §8.1). Every badge template
/// references only these via `var(--token)`; anything else in the source CSS
/// stays literal.
///
/// `label-ink` / `value-ink` (added later) are the *on-light-surface* text
/// inks: several collections put label/value text directly on the page
/// background (transparent or white), where the `-fg` inks — designed to
/// pair with `label-bg` / `value-bg` — can be near-invisible. Themes resolve
/// them to dark, hue-tinted, WCAG-AA-on-white colors.
pub const TOKENS: [&str; 15] = [
    "label-bg",
    "label-fg",
    "value-bg",
    "value-fg",
    "label-ink",
    "value-ink",
    "border",
    "divider",
    "accent",
    "accent-fg",
    "icon-color",
    // gradient ramps (converter materializes gradient backgrounds as
    // var(--g-from)/var(--g-to) on value segments, --gl-* on label ramps)
    "g-from",
    "g-to",
    "gl-from",
    "gl-to",
];

/// A resolved theme: color tokens plus the two structural tokens.
///
/// Two modes:
/// - **retint** (`tint_hue`/`tint_chroma` set; presets and brand colors) —
///   render-time substitution re-tints each template fallback toward the
///   theme hue while preserving its lightness, so themes nuance the design
///   instead of repainting it (a white badge stays near-white, a dark badge
///   stays dark — both pick up the hue).
/// - **palette** (tint fields `None`; explicit token maps) — token values
///   substitute verbatim, the classic behavior.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ResolvedTheme {
    /// Color tokens keyed by token name (`label-bg`, …).
    pub colors: BTreeMap<String, String>,
    /// `radius` structural token (CSS value, e.g. `6px`).
    #[serde(default = "default_radius")]
    pub radius: String,
    /// `shadow` structural token (CSS `box-shadow` value or `none`).
    #[serde(default = "default_shadow")]
    pub shadow: String,
    /// Where this theme came from (preset name, `brand:…`, `custom`).
    #[serde(default)]
    pub source: String,
    /// Retint mode: the hue every themed color rotates to (degrees).
    #[serde(default)]
    pub tint_hue: Option<f64>,
    /// Retint mode: the chroma ceiling (vivid designs stay ≤ this).
    #[serde(default)]
    pub tint_chroma: Option<f64>,
}

fn default_radius() -> String {
    "6px".into()
}

fn default_shadow() -> String {
    "none".into()
}

impl ResolvedTheme {
    /// Retint mode predicate.
    pub fn is_retint(&self) -> bool {
        self.tint_hue.is_some() && self.tint_chroma.is_some()
    }

    /// Re-tints one fallback color toward this theme (retint mode).
    /// Palette mode returns the token value verbatim.
    ///
    /// True neutrals (C < 0.005) come back BYTE-VERBATIM in retint mode —
    /// pure white text, pure grays and pure blacks are untouched by design,
    /// and keeping the original string keeps neutral-only renders
    /// byte-identical to their unthemed source.
    pub fn themed_value_for(&self, token: &str, fallback: Option<&str>) -> String {
        if self.is_retint() {
            if let Some(fb) = fallback {
                if let Some(base) = Oklch::parse(fb) {
                    if base.c < 0.005 {
                        return fb.to_string();
                    }
                    return re_tint(
                        base,
                        self.tint_hue.unwrap_or(0.0),
                        self.tint_chroma.unwrap_or(0.0),
                    )
                    .to_css();
                }
            }
        }
        self.colors
            .get(token)
            .cloned()
            .or_else(|| fallback.map(str::to_string))
            .unwrap_or_default()
    }

    /// Derives the gradient ramp tokens from the resolved role colors when
    /// they are not explicitly set: the value ramp rides value-bg, the label
    /// ramp rides label-bg. Themes that set every token explicitly are
    /// untouched. Missing on-light inks (`label-ink`/`value-ink`) derive from
    /// their segment background, darkened into the AA-on-white band.
    pub fn derive_gradients(mut self) -> Self {
        let derive =
            |base: Option<&String>, up: f64, down: f64| -> (Option<String>, Option<String>) {
                let Some(base) = base else {
                    return (None, None);
                };
                let Some(c) = Oklch::parse(base) else {
                    return (None, None);
                };
                (Some(c.lighten(up).to_css()), Some(c.darken(down).to_css()))
            };
        // fill only the missing stops so explicit overrides are respected
        let value_missing =
            !self.colors.contains_key("g-from") || !self.colors.contains_key("g-to");
        if value_missing {
            let (from, to) = derive(self.colors.get("value-bg"), 0.06, 0.08);
            if !self.colors.contains_key("g-from") {
                if let Some(from) = from.clone() {
                    self.colors.insert("g-from".into(), from);
                }
            }
            if !self.colors.contains_key("g-to") {
                if let Some(to) = to.clone() {
                    self.colors.insert("g-to".into(), to);
                }
            }
        }
        let label_missing =
            !self.colors.contains_key("gl-from") || !self.colors.contains_key("gl-to");
        if label_missing {
            let (from, to) = derive(self.colors.get("label-bg"), 0.03, 0.05);
            if !self.colors.contains_key("gl-from") {
                if let Some(from) = from.clone() {
                    self.colors.insert("gl-from".into(), from);
                }
            }
            if !self.colors.contains_key("gl-to") {
                if let Some(to) = to.clone() {
                    self.colors.insert("gl-to".into(), to);
                }
            }
        }
        // on-light inks: darken the segment background into the readable
        // band, guarded against white (they land on transparent/white surfaces)
        let derive_ink = |base: Option<&String>| -> Option<String> {
            let base = Oklch::parse(base?)?;
            Some(contrast::ensure_contrast(base.darken(0.35), WHITE, AA).to_css())
        };
        if !self.colors.contains_key("value-ink") {
            if let Some(ink) = derive_ink(self.colors.get("value-bg")) {
                self.colors.insert("value-ink".into(), ink);
            }
        }
        if !self.colors.contains_key("label-ink") {
            if let Some(ink) = derive_ink(self.colors.get("label-bg")) {
                self.colors.insert("label-ink".into(), ink);
            }
        }
        self
    }

    /// Builds the theme that reproduces the source collections exactly:
    /// the defaults the collections were designed with.
    pub fn collection_default() -> Self {
        Self::from_tokens(&[
            ("label-bg", "#f3f4f6"),
            ("label-fg", "#374151"),
            ("value-bg", "#111827"),
            ("value-fg", "#ffffff"),
            ("label-ink", "#374151"),
            ("value-ink", "#111827"),
            ("border", "#d1d5db"),
            ("divider", "#e5e7eb"),
            ("accent", "#3b82f6"),
            ("accent-fg", "#ffffff"),
            ("icon-color", "#3178c6"),
        ])
        .expect("collection default tokens are valid")
    }

    /// Builds a theme from hex/oklch strings, validating each.
    pub fn from_tokens(tokens: &[(&str, &str)]) -> Result<Self, crate::Error> {
        let mut colors = BTreeMap::new();
        for (name, value) in tokens {
            if !TOKENS.contains(name) {
                return Err(crate::Error::BadRequest(format!("unknown token '{name}'")));
            }
            let parsed = Oklch::parse(value).ok_or_else(|| {
                crate::Error::BadRequest(format!("unparseable color '{value}' for '{name}'"))
            })?;
            colors.insert((*name).to_string(), parsed.to_css());
        }
        Ok(Self {
            colors,
            radius: default_radius(),
            shadow: default_shadow(),
            source: "custom".into(),
            tint_hue: None,
            tint_chroma: None,
        }
        .derive_gradients())
    }

    /// Resolves a theme from a single brand color using the guardrail
    /// (spec §8.2): value segment takes the brand, label stays neutral,
    /// every foreground is contrast-corrected.
    ///
    /// `label-ink` / `value-ink` are dark, hue-tinted inks guarded to WCAG AA
    /// against white — they theme the collections whose text sits directly on
    /// transparent/white surfaces, where the `-fg` inks would vanish.
    pub fn from_brand(primary: Oklch) -> Self {
        let mut colors = BTreeMap::new();
        let insert = |colors: &mut BTreeMap<String, String>, k: &str, v: Oklch| {
            colors.insert(k.to_string(), v.to_css());
        };

        let label_bg = Oklch::from_rgb8(0xf3, 0xf4, 0xf6); // #f3f4f6
        let label_fg = contrast::ensure_contrast(Oklch::from_rgb8(0x37, 0x41, 0x51), label_bg, AA);
        let (value_fg, value_bg) =
            ensure_readable_pair(contrast::contrast_text(primary), primary, AA);
        let border = Oklch::from_rgb8(0xd1, 0xd5, 0xdb);
        let divider = Oklch::from_rgb8(0xe5, 0xe7, 0xeb);
        let accent = value_bg;
        let accent_fg = contrast::ensure_contrast(contrast::contrast_text(value_bg), value_bg, AA);
        // Icons mostly sit on light chips (white value backgrounds, light
        // label rails, the page itself) — guard ≥2.5:1 against WHITE so the
        // brand color never washes out there; retint rendering keeps each
        // design's own lightness, so icons never melt into themed surfaces.
        let icon_base = if primary.lightness() > 0.72 {
            primary.darken(0.18)
        } else {
            primary
        };
        let icon = contrast::ensure_contrast(icon_base, WHITE, 2.5);
        // Ink on transparent/white surfaces: the brand hue, darkened into the
        // readable band and guarded against white.
        let label_ink = contrast::ensure_contrast(primary.darken(0.35), WHITE, AA);
        let value_ink = contrast::ensure_contrast(primary.darken(0.2), WHITE, AA);

        insert(&mut colors, "label-bg", label_bg);
        insert(&mut colors, "label-fg", label_fg);
        insert(&mut colors, "value-bg", value_bg);
        insert(&mut colors, "value-fg", value_fg);
        insert(&mut colors, "label-ink", label_ink);
        insert(&mut colors, "value-ink", value_ink);
        insert(&mut colors, "border", border);
        insert(&mut colors, "divider", divider);
        insert(&mut colors, "accent", accent);
        insert(&mut colors, "accent-fg", accent_fg);
        insert(&mut colors, "icon-color", icon);

        Self {
            colors,
            radius: default_radius(),
            shadow: default_shadow(),
            source: "brand".into(),
            // presets/brand themes are retint themes: hue-shift, not repaint
            tint_hue: Some(primary.h),
            tint_chroma: Some(primary.c),
        }
        .derive_gradients()
    }
    // (from_brand returns Self directly — derive_gradients consumes and returns Self)

    /// The CSS custom-property block for render-time injection.
    pub fn css_root_block(&self) -> String {
        let mut out = String::from(":root {\n");
        for (k, v) in &self.colors {
            out.push_str(&format!("  --{k}: {v};\n"));
        }
        out.push_str(&format!("  --radius: {};\n", self.radius));
        out.push_str(&format!("  --shadow: {};\n", self.shadow));
        out.push_str("}\n");
        out
    }

    /// Looks up a color token as its CSS string.
    pub fn token(&self, name: &str) -> Option<&str> {
        self.colors.get(name).map(String::as_str)
    }

    /// Overrides one token (validated), used by per-request query params.
    pub fn with_token(mut self, name: &str, value: &str) -> Result<Self, crate::Error> {
        if !TOKENS.contains(&name) {
            return Err(crate::Error::BadRequest(format!("unknown token '{name}'")));
        }
        let parsed = Oklch::parse(value)
            .ok_or_else(|| crate::Error::BadRequest(format!("unparseable color '{value}'")))?;
        self.colors.insert(name.to_string(), parsed.to_css());
        Ok(self)
    }
}

/// Re-tints a fallback color toward a theme hue — the core of the nuanced
/// ("don't repaint, re-hue") theming model:
///
/// - **lightness is preserved** — a white badge stays near-white, a dark
///   badge stays dark; only the hue moves;
/// - **true neutrals (C < 0.005) stay untouched** — pure white text stays
///   pure white;
/// - **chroma lands in `[12% of theme chroma, theme chroma]`** — muted
///   designs get a whisper of the hue, vivid designs are capped so nothing
///   gets louder than the theme itself.
pub fn re_tint(base: Oklch, hue: f64, chroma_max: f64) -> Oklch {
    if base.c < 0.005 {
        return base;
    }
    Oklch {
        l: base.l,
        c: base.c.max(chroma_max * 0.12).min(chroma_max),
        h: hue,
    }
}

/// A named preset shipped with the product (spec §8.3).
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct Preset {
    pub name: &'static str,
    /// OKLCH base hue in degrees.
    pub hue: f64,
    /// Chroma for the value background.
    pub chroma: f64,
}

/// The six launch presets, generated from base hues (spec §8.3).
pub const PRESETS: [Preset; 6] = [
    Preset {
        name: "slate",
        hue: 250.0,
        chroma: 0.03,
    },
    Preset {
        name: "blue",
        hue: 259.0,
        chroma: 0.19,
    },
    Preset {
        name: "violet",
        hue: 295.0,
        chroma: 0.21,
    },
    Preset {
        name: "emerald",
        hue: 160.0,
        chroma: 0.15,
    },
    Preset {
        name: "amber",
        hue: 75.0,
        chroma: 0.14,
    },
    Preset {
        name: "rose",
        hue: 15.0,
        chroma: 0.19,
    },
];

/// Resolves a preset by name into a full theme.
pub fn preset_theme(name: &str) -> Option<ResolvedTheme> {
    let preset = PRESETS.iter().find(|p| p.name == name)?;
    // Preset value backgrounds sit at a pleasant mid lightness.
    let primary = Oklch::new(0.58, preset.chroma, preset.hue);
    let mut theme = ResolvedTheme::from_brand(primary);
    theme.source = preset.name.to_string();
    Some(theme)
}

/// Lists preset names.
pub fn preset_names() -> Vec<&'static str> {
    PRESETS.iter().map(|p| p.name).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::color::Oklch;
    use crate::contrast::{AA, ratio};

    #[test]
    fn token_vocabulary_is_frozen() {
        assert_eq!(TOKENS.len(), 15);
        assert!(TOKENS.contains(&"value-bg"));
        assert!(TOKENS.contains(&"g-from"));
        assert!(TOKENS.contains(&"label-ink"));
        assert!(TOKENS.contains(&"value-ink"));
        assert!(!TOKENS.contains(&"hero-bg"));
    }

    #[test]
    fn on_light_inks_are_readable_on_white() {
        let white = Oklch::from_rgb8(255, 255, 255);
        for name in preset_names() {
            let t = preset_theme(name).unwrap();
            for ink in ["label-ink", "value-ink"] {
                let c = Oklch::parse(t.token(ink).unwrap()).unwrap();
                assert!(
                    contrast::ratio(c, white) >= AA,
                    "{name}.{ink} must pass AA on white, got {}",
                    contrast::ratio(c, white)
                );
            }
        }
        let cd = ResolvedTheme::collection_default();
        for ink in ["label-ink", "value-ink"] {
            let c = Oklch::parse(cd.token(ink).unwrap()).unwrap();
            assert!(contrast::ratio(c, white) >= AA);
        }
    }

    #[test]
    fn from_tokens_derives_missing_inks() {
        let t = ResolvedTheme::from_tokens(&[("value-bg", "#3b82f6"), ("label-bg", "#f3f4f6")])
            .unwrap();
        let white = Oklch::from_rgb8(255, 255, 255);
        for ink in ["label-ink", "value-ink"] {
            let c = Oklch::parse(t.token(ink).unwrap()).unwrap();
            assert!(contrast::ratio(c, white) >= AA, "{ink} derived readable");
        }
        // explicit inks are respected
        let t2 = ResolvedTheme::from_tokens(&[("value-bg", "#3b82f6"), ("value-ink", "#111827")])
            .unwrap();
        assert_eq!(
            t2.token("value-ink").unwrap(),
            &Oklch::parse("#111827").unwrap().to_css()
        );
    }

    #[test]
    fn gradient_tokens_derive_from_role_colors() {
        let t = ResolvedTheme::collection_default();
        let vb = Oklch::parse(t.token("value-bg").unwrap()).unwrap();
        let gf = Oklch::parse(t.token("g-from").unwrap()).unwrap();
        let gt = Oklch::parse(t.token("g-to").unwrap()).unwrap();
        assert!(gf.lightness() > vb.lightness());
        assert!(gt.lightness() < vb.lightness());
        let lb = Oklch::parse(t.token("label-bg").unwrap()).unwrap();
        let glf = Oklch::parse(t.token("gl-from").unwrap()).unwrap();
        let glt = Oklch::parse(t.token("gl-to").unwrap()).unwrap();
        assert!(glf.lightness() > lb.lightness());
        assert!(glt.lightness() < lb.lightness());
    }

    #[test]
    fn explicit_gradient_tokens_are_not_overridden() {
        let t = ResolvedTheme::from_tokens(&[
            ("value-bg", "#111827"),
            ("label-bg", "#f3f4f6"),
            ("g-from", "#ff0000"),
        ])
        .unwrap();
        assert_eq!(
            t.token("g-from").unwrap(),
            &Oklch::parse("#ff0000").unwrap().to_css()
        );
        assert!(t.token("g-to").is_some()); // still derived for the missing stop
    }

    #[test]
    fn gradient_tokens_overridable_via_with_token() {
        let t = ResolvedTheme::collection_default();
        let t = t.with_token("g-from", "#22d3ee").unwrap();
        assert_eq!(
            t.token("g-from").unwrap(),
            &Oklch::parse("#22d3ee").unwrap().to_css()
        );
    }

    #[test]
    fn collection_default_matches_source_colors() {
        let t = ResolvedTheme::collection_default();
        // direct equality with the oklch-serialized source hexes
        assert_eq!(
            t.colors.get("label-bg").unwrap(),
            &Oklch::from_rgb8(0xf3, 0xf4, 0xf6).to_css()
        );
        assert_eq!(
            t.colors.get("value-bg").unwrap(),
            &Oklch::from_rgb8(0x11, 0x18, 0x27).to_css()
        );
        assert_eq!(
            t.colors.get("label-fg").unwrap(),
            &Oklch::from_rgb8(0x37, 0x41, 0x51).to_css()
        );
    }

    #[test]
    fn from_brand_guards_all_foregrounds() {
        for hex in ["#3b82f6", "#ef4444", "#10b981", "#fbbf24", "#111827"] {
            let primary = Oklch::parse(hex).unwrap();
            let t = ResolvedTheme::from_brand(primary);
            let value_bg = Oklch::parse(t.token("value-bg").unwrap()).unwrap();
            let value_fg = Oklch::parse(t.token("value-fg").unwrap()).unwrap();
            assert!(
                ratio(value_fg, value_bg) >= AA,
                "{hex}: {}",
                ratio(value_fg, value_bg)
            );
            let label_bg = Oklch::parse(t.token("label-bg").unwrap()).unwrap();
            let label_fg = Oklch::parse(t.token("label-fg").unwrap()).unwrap();
            assert!(ratio(label_fg, label_bg) >= AA);
        }
    }

    #[test]
    fn css_root_block_shape() {
        let t = ResolvedTheme::collection_default();
        let css = t.css_root_block();
        assert!(css.starts_with(":root {"));
        assert!(css.contains("--value-bg:"));
        assert!(css.contains("--radius: 6px;"));
        assert!(css.ends_with("}\n"));
    }

    #[test]
    fn presets_resolve_and_guard() {
        for name in preset_names() {
            let t = preset_theme(name).expect(name);
            assert_eq!(t.source, name);
            let bg = Oklch::parse(t.token("value-bg").unwrap()).unwrap();
            let fg = Oklch::parse(t.token("value-fg").unwrap()).unwrap();
            assert!(ratio(fg, bg) >= AA, "{name} fails guardrail");
        }
        assert!(preset_theme("nope").is_none());
    }

    #[test]
    fn with_token_validates() {
        let t = ResolvedTheme::collection_default();
        assert!(t.clone().with_token("value-bg", "#ef4444").is_ok());
        assert!(t.clone().with_token("bogus", "#ef4444").is_err());
        assert!(t.with_token("value-bg", "junk").is_err());
    }

    #[test]
    fn re_tint_preserves_lightness_and_neutrals() {
        let theme = preset_theme("rose").unwrap(); // hue 15, chroma 0.19
        let (hue, cmax) = (theme.tint_hue.unwrap(), theme.tint_chroma.unwrap());
        // pure white stays pure white (true neutral)
        let white = Oklch::from_rgb8(255, 255, 255);
        assert_eq!(re_tint(white, hue, cmax), white);
        // dark ink keeps its lightness, gains the hue
        let ink = Oklch::from_rgb8(0x11, 0x18, 0x27); // #111827
        let out = re_tint(ink, hue, cmax);
        assert!((out.l - ink.l).abs() < 1e-9, "lightness preserved");
        assert!((out.h - hue).abs() < 1e-9, "hue rotated");
        assert!(out.c >= ink.c.min(cmax) - 1e-9 && out.c <= cmax);
        // muted colors get a whisper of chroma (12% floor), vivid capped
        let muted = Oklch::new(0.55, 0.01, 120.0);
        assert!((re_tint(muted, hue, cmax).c - cmax * 0.12).abs() < 1e-9);
        let vivid = Oklch::new(0.55, 0.33, 120.0);
        assert!(
            (re_tint(vivid, hue, cmax).c - cmax).abs() < 1e-9,
            "vivid capped at theme chroma"
        );
    }

    #[test]
    fn themed_value_for_retints_the_fallback() {
        let theme = preset_theme("blue").unwrap();
        // a white badge background stays BYTE-VERBATIM (true neutral untouched)
        assert_eq!(
            theme.themed_value_for("value-bg", Some("#ffffff")),
            "#ffffff"
        );
        // a colored accent re-hues to the theme while keeping lightness
        let violet = Oklch::parse("#8b5cf6").unwrap();
        let out = theme.themed_value_for("g-from", Some("#8b5cf6"));
        let parsed = Oklch::parse(&out).unwrap();
        assert!(
            (parsed.l - violet.l).abs() < 1e-3,
            "lightness preserved, got {out}"
        );
        assert!(
            (parsed.h - 259.0).abs() < 1.0,
            "hue rotated to theme, got {out}"
        );
        // palette mode (custom token maps) substitutes verbatim
        let custom = ResolvedTheme::from_tokens(&[("value-bg", "#111827")]).unwrap();
        assert_eq!(
            custom.themed_value_for("value-bg", Some("#ffffff")),
            Oklch::parse("#111827").unwrap().to_css()
        );
        // missing fallback falls back to the palette value
        assert_eq!(
            theme.themed_value_for("value-bg", None),
            theme.token("value-bg").unwrap()
        );
    }

    #[test]
    fn presets_are_retint_themes_and_custom_maps_are_palette_themes() {
        for name in preset_names() {
            let t = preset_theme(name).unwrap();
            assert!(t.is_retint(), "{name} must be a retint theme");
        }
        assert!(
            !ResolvedTheme::from_tokens(&[("value-bg", "#111827")])
                .unwrap()
                .is_retint()
        );
        assert!(!ResolvedTheme::collection_default().is_retint());
    }

    #[test]
    fn json_roundtrip() {
        let t = ResolvedTheme::collection_default();
        let json = serde_json::to_string(&t).unwrap();
        let back: ResolvedTheme = serde_json::from_str(&json).unwrap();
        assert_eq!(back, t);
    }
}

//! Semantic theming: one seed → the full OKLCH ramp.
//!
//! Every color a badge can paint comes from a small vocabulary of semantic
//! tokens (surfaces `s-*`, borders `b-*`, text `t-*`, accents `a-*`, status
//! `ok/warn/err`, dark surfaces `d-*`, metallics `metal-*`). Each token is a
//! `color-mix(in oklch, …)` formula over the seed and a fixed base — the same
//! formulas the design source (`badge-collections.html`) declares in `:root`:
//!
//! ```css
//! --s-100:  color-mix(in oklch, var(--seed) 9%,  #ffffff);
//! --t-body: color-mix(in oklch, var(--seed) 15%, #374151);
//! --a-deep: color-mix(in oklch, var(--seed) 82%, #000000);
//! ```
//!
//! Dark mode re-derives the surface/border/text ramps over dark bases; the
//! accent, status, dark-surface and metallic tokens are mode-independent.
//!
//! Because takumi cannot evaluate `color-mix()` (and browsers cannot be
//! trusted to agree with it to the pixel), the server resolves every formula
//! to a concrete `oklch(…)` string here, once, and substitutes it into the
//! template's `var(--vx-*, fallback)` references. The TypeScript mirror
//! (`packages/themes/src/semantic.ts`) implements byte-identical math, pinned
//! by the shared fixture (`dump-semantic.rs` → `semantic.json`), so the live
//! preview and the API render from exactly the same palette.

use std::collections::BTreeMap;
use std::sync::LazyLock;

use serde::Deserialize;

use crate::color::Oklch;

/// The default seed — Tailwind blue-500, the collection design color.
pub const DEFAULT_SEED: &str = "#3b82f6";

/// Below this chroma a color counts as achromatic: its hue is "missing" and
/// interpolation carries the other side's hue (CSS color-mix missing-hue
/// rule). Pure white converts to C ≈ 4e-8, grays sit far above this.
const ACHROMATIC: f64 = 1e-6;

/// Surface for a color-mix component. Encoded as a plain string with the
/// same convention on both sides (Rust/TS):
/// `"seed"` | `"transparent"` | `"#rrggbb"` | token name (e.g. `"a"`,
/// `"s-white"` — normalized to `vx-<name>` at resolution time).
pub type Component = String;

/// One `color-mix(in oklch, top pct, base)` formula.
///
/// `pct` is the *top* component's percentage (CSS color-mix's first
/// percentage); the base takes the remainder.
#[derive(Debug, Clone, PartialEq, Deserialize)]
pub struct MixFormula {
    /// Token name including the `vx-` prefix (e.g. `vx-s-100`).
    pub token: String,
    /// Top component percentage, 0..=100.
    pub pct: f64,
    /// The color mixed at `pct`.
    pub top: Component,
    /// The color mixed at `100 - pct`.
    pub base: Component,
}

/// An OKLCH color with an alpha channel (1.0 = opaque).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct AlphaColor {
    pub color: Oklch,
    pub alpha: f64,
}

impl AlphaColor {
    pub fn opaque(color: Oklch) -> Self {
        Self { color, alpha: 1.0 }
    }

    /// Transparent black — the CSS `transparent` keyword.
    pub fn transparent() -> Self {
        Self {
            color: Oklch::neutral(0.0),
            alpha: 0.0,
        }
    }

    /// CSS serialization: `oklch(L C H)`, or `oklch(L C H / A)` when
    /// translucent. Byte-identical to the TypeScript mirror.
    ///
    /// Components are first quantized to a 1e-10 grid (absorbing libm ulp
    /// noise between the Rust and JS engines — interpolated hues can sit
    /// exactly on a decimal rounding boundary), then formatted.
    pub fn to_css(&self) -> String {
        let c = &self.color;
        if self.alpha >= 1.0 {
            format!(
                "oklch({:.4} {:.4} {:.2})",
                q(clamp01(c.l), 10),
                q(c.c.max(0.0), 10),
                q(c.h.rem_euclid(360.0), 10)
            )
        } else {
            format!(
                "oklch({:.4} {:.4} {:.2} / {:.2})",
                q(clamp01(c.l), 10),
                q(c.c.max(0.0), 10),
                q(c.h.rem_euclid(360.0), 10),
                q(self.alpha.clamp(0.0, 1.0), 10)
            )
        }
    }
}

/// Quantizes to a decimal grid so ulp-level libm differences between the
/// Rust and JavaScript engines cannot change the serialized output.
fn q(v: f64, digits: i32) -> f64 {
    let m = 10f64.powi(digits);
    (v * m).round() / m
}

fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
}

/// `color-mix(in oklch, top pct%, base)` — premultiplied interpolation with
/// the CSS missing-hue and shorter-arc rules.
///
/// Both sides (Rust/TS) implement exactly this, in exactly this order, so
/// the serialized strings match bit for bit.
pub fn color_mix(top: AlphaColor, base: AlphaColor, pct: f64) -> AlphaColor {
    let w1 = (pct / 100.0).clamp(0.0, 1.0);
    let w2 = 1.0 - w1;

    // Missing hue: an achromatic component contributes no hue.
    let mut h1 = top.color.h;
    let mut h2 = base.color.h;
    let t_achromatic = top.color.c < ACHROMATIC || top.alpha <= 0.0;
    let b_achromatic = base.color.c < ACHROMATIC || base.alpha <= 0.0;
    if t_achromatic && !b_achromatic {
        h1 = h2;
    } else if b_achromatic && !t_achromatic {
        h2 = h1;
    }
    // Shorter hue arc (the CSS default `shorter` interpolation method).
    let delta = h2 - h1;
    let delta = if delta > 180.0 {
        delta - 360.0
    } else if delta < -180.0 {
        delta + 360.0
    } else {
        delta
    };
    let h = h1 + w2 * delta;

    // Premultiplied channel interpolation.
    let a = w1 * top.alpha + w2 * base.alpha;
    if a <= 0.0 {
        return AlphaColor::transparent();
    }
    let mix_channel = |t: f64, b: f64| (w1 * top.alpha * t + w2 * base.alpha * b) / a;
    let color = Oklch {
        l: mix_channel(top.color.l, base.color.l),
        c: mix_channel(top.color.c.max(0.0), base.color.c.max(0.0)),
        h,
    };
    AlphaColor { color, alpha: a }
}

/// A resolved semantic palette: every token of the vocabulary (core formulas
/// plus the discovered `color-mix` tokens) for one (seed, mode) pair.
pub struct SemanticRamp {
    /// `vx-s-white` → `oklch(0.9945 0.0043 259.82)`.
    pub tokens: BTreeMap<String, String>,
}

impl SemanticRamp {
    /// The theme this ramp becomes for render-time substitution: a palette
    /// theme (explicit values, no retinting).
    pub fn to_theme(&self, source: &str) -> crate::theme::ResolvedTheme {
        crate::theme::ResolvedTheme {
            colors: self.tokens.clone(),
            radius: "6px".into(),
            shadow: "none".into(),
            source: source.to_string(),
            tint_hue: None,
            tint_chroma: None,
        }
    }
}

/// Rendering mode: which surface ramp the tokens ride.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Mode {
    Light,
    Dark,
}

impl Mode {
    /// Parses `?mode=`.
    pub fn parse(value: &str) -> Option<Self> {
        match value.to_ascii_lowercase().as_str() {
            "light" => Some(Self::Light),
            "dark" => Some(Self::Dark),
            _ => None,
        }
    }
}

/// Parses `?seed=` / `seed:` themes: `#3b82f6`, `3b82f6`, `#fff`.
pub fn parse_seed(value: &str) -> Option<Oklch> {
    let v = value.trim();
    let v = v.strip_prefix('#').unwrap_or(v);
    if v.is_empty() || v.len() > 6 || !v.chars().all(|c| c.is_ascii_hexdigit()) {
        return None;
    }
    let hex = match v.len() {
        3 => format!(
            "{}{}{}",
            &v[..1].repeat(2),
            &v[1..2].repeat(2),
            &v[2..3].repeat(2)
        ),
        6 => v.to_string(),
        _ => return None,
    };
    let n = u32::from_str_radix(&hex, 16).ok()?;
    Some(Oklch::from_rgb8((n >> 16) as u8, (n >> 8) as u8, n as u8))
}

// ---------------------------------------------------------------------------
// The vocabulary — the design source's `:root` formulas, mirrored exactly.
// ---------------------------------------------------------------------------

/// One core-vocabulary entry.
#[derive(Debug, Clone, Copy)]
enum Core {
    /// `color-mix(in oklch, var(--seed) pct, base)` — seed-derived.
    Mix(f64, &'static str),
    /// A fixed color (mode- and seed-independent).
    Fixed(&'static str),
}

/// The vocabulary — the design source's `:root` formulas, mirrored exactly.
/// `(token, formula)`; the `vx-` prefix keeps template references collision-free.
const CORE: &[(&str, Core)] = &[
    // surfaces (light mode bases)
    ("vx-s-white", Core::Mix(2.0, "#ffffff")),
    ("vx-s-50", Core::Mix(5.0, "#ffffff")),
    ("vx-s-100", Core::Mix(9.0, "#ffffff")),
    ("vx-s-200", Core::Mix(15.0, "#ffffff")),
    ("vx-s-300", Core::Mix(22.0, "#ffffff")),
    // borders
    ("vx-b-100", Core::Mix(15.0, "#e5e7eb")),
    ("vx-b-200", Core::Mix(22.0, "#d1d5db")),
    ("vx-b-300", Core::Mix(35.0, "#9ca3af")),
    ("vx-b-strong", Core::Mix(55.0, "#1f2937")),
    // text
    ("vx-t-subtle", Core::Mix(22.0, "#9ca3af")),
    ("vx-t-muted", Core::Mix(20.0, "#6b7280")),
    ("vx-t-body", Core::Mix(15.0, "#374151")),
    ("vx-t-strong", Core::Mix(12.0, "#111827")),
    ("vx-t-heading", Core::Mix(15.0, "#000000")),
    // accents (mode-independent)
    ("vx-a", Core::Mix(100.0, "#ffffff")),
    ("vx-a-bright", Core::Mix(60.0, "#ffffff")),
    ("vx-a-soft", Core::Mix(25.0, "#ffffff")),
    ("vx-a-muted", Core::Mix(10.0, "#ffffff")),
    ("vx-a-deep", Core::Mix(82.0, "#000000")),
    ("vx-a-ink", Core::Mix(55.0, "#000000")),
    ("vx-a-on", Core::Fixed("#ffffff")),
    // status hues (fixed)
    ("vx-ok", Core::Fixed("#10b981")),
    ("vx-warn", Core::Fixed("#f59e0b")),
    ("vx-err", Core::Fixed("#ef4444")),
    // dark surfaces (mode-independent — always dark)
    ("vx-d-bg", Core::Mix(10.0, "#0f172a")),
    ("vx-d-surface", Core::Mix(16.0, "#1e1e1e")),
    ("vx-d-surface-2", Core::Mix(22.0, "#18181b")),
    ("vx-d-border", Core::Mix(25.0, "#374151")),
    ("vx-d-text", Core::Mix(10.0, "#e5e7eb")),
    ("vx-d-text-mut", Core::Mix(20.0, "#9ca3af")),
    // metallics (mode-independent)
    ("vx-metal-1", Core::Mix(8.0, "#e5e7eb")),
    ("vx-metal-2", Core::Mix(15.0, "#9ca3af")),
    ("vx-metal-3", Core::Mix(22.0, "#6b7280")),
    ("vx-metal-4", Core::Mix(28.0, "#374151")),
];

/// Dark-mode re-derivations of the surface/border/text ramps (the design
/// source's `:root[data-page="dark"]` block).
const DARK_OVERRIDES: &[(&str, Core)] = &[
    ("vx-s-white", Core::Mix(8.0, "#0b0b12")),
    ("vx-s-50", Core::Mix(10.0, "#0b0b12")),
    ("vx-s-100", Core::Mix(14.0, "#0b0b12")),
    ("vx-s-200", Core::Mix(20.0, "#0b0b12")),
    ("vx-s-300", Core::Mix(26.0, "#0b0b12")),
    ("vx-b-100", Core::Mix(22.0, "#2a2a35")),
    ("vx-b-200", Core::Mix(30.0, "#3a3a45")),
    ("vx-b-300", Core::Mix(40.0, "#4a4a55")),
    ("vx-b-strong", Core::Mix(55.0, "#8a8a95")),
    ("vx-t-subtle", Core::Mix(20.0, "#8a8a95")),
    ("vx-t-muted", Core::Mix(15.0, "#b0b0bb")),
    ("vx-t-body", Core::Mix(10.0, "#d0d0db")),
    ("vx-t-strong", Core::Mix(8.0, "#e8e8f0")),
    ("vx-t-heading", Core::Mix(8.0, "#ffffff")),
    // Accent ink rides the page surface: dark (on light) in light mode,
    // bright (on dark) in dark mode.
    ("vx-a-ink", Core::Mix(62.0, "#ffffff")),
];

/// The generated `color-mix` tokens discovered in the badge CSS by the
/// tokenizer (`scripts/semantic-tokenize.mjs`), which writes this file.
#[derive(Debug, Deserialize)]
pub struct MixSpecFile {
    pub mixes: Vec<MixFormula>,
}

pub static MIX_SPEC: LazyLock<Vec<MixFormula>> = LazyLock::new(|| {
    serde_json::from_str::<MixSpecFile>(include_str!("../assets/semantic-mixes.json"))
        .expect("semantic-mixes.json is valid")
        .mixes
});

/// Resolves the full ramp for a seed and mode: the core vocabulary plus
/// every discovered mix token.
pub fn resolve_ramp(seed: Oklch, mode: Mode) -> SemanticRamp {
    let seed_alpha = AlphaColor::opaque(seed);
    let mut tokens = BTreeMap::new();

    let eval = |tokens: &mut BTreeMap<String, String>, token: &str, formula: Core| {
        let value = match formula {
            Core::Fixed(hex) => {
                AlphaColor::opaque(Oklch::parse(hex).expect("fixed token parses")).to_css()
            }
            Core::Mix(pct, base) => {
                let base = AlphaColor::opaque(Oklch::parse(base).expect("core base parses"));
                color_mix(seed_alpha, base, pct).to_css()
            }
        };
        tokens.insert(token.to_string(), value);
    };

    for (token, formula) in CORE {
        eval(&mut tokens, token, *formula);
    }
    if mode == Mode::Dark {
        for (token, formula) in DARK_OVERRIDES {
            eval(&mut tokens, token, *formula);
        }
    }

    // Discovered mixes, on top of the resolved core.
    for formula in MIX_SPEC.iter() {
        let resolved_top = resolve_component(&formula.top, seed_alpha, &tokens);
        let resolved_base = resolve_component(&formula.base, seed_alpha, &tokens);
        let mixed = color_mix(resolved_top, resolved_base, formula.pct);
        tokens.insert(formula.token.clone(), mixed.to_css());
    }
    SemanticRamp { tokens }
}

fn resolve_component(
    component: &str,
    seed: AlphaColor,
    tokens: &BTreeMap<String, String>,
) -> AlphaColor {
    if component == "seed" {
        return seed;
    }
    if component == "transparent" {
        return AlphaColor::transparent();
    }
    if let Some(hex) = component.strip_prefix('#') {
        let full = if hex.len() == 3 {
            format!(
                "#{}{}{}",
                &hex[..1].repeat(2),
                &hex[1..2].repeat(2),
                &hex[2..3].repeat(2)
            )
        } else {
            component.to_string()
        };
        return AlphaColor::opaque(
            Oklch::parse(&full).unwrap_or_else(|| panic!("mix hex '{component}' parses")),
        );
    }
    let key = if component.starts_with("vx-") {
        component.to_string()
    } else {
        format!("vx-{component}")
    };
    let value = tokens
        .get(&key)
        .or_else(|| tokens.get(component))
        .unwrap_or_else(|| panic!("mix references unresolved token '{component}'"));
    AlphaColor::opaque(Oklch::parse(value).expect("resolved token parses"))
}

/// Named seed presets — the design source's swatch row. Old preset names map
/// to the same seeds they approximated before.
pub const PRESET_SEEDS: &[(&str, &str)] = &[
    ("blue", "#3b82f6"),
    ("violet", "#8b5cf6"),
    ("pink", "#ec4899"),
    ("red", "#ef4444"),
    ("amber", "#f59e0b"),
    ("green", "#22c55e"),
    ("teal", "#14b8a6"),
    ("slate", "#64748b"),
];

/// Backward-compatible preset aliases (v4 names → seeds).
pub const PRESET_ALIASES: &[(&str, &str)] = &[("rose", "pink"), ("emerald", "green")];

/// Resolves a preset name to its seed hex.
pub fn preset_seed(name: &str) -> Option<&'static str> {
    let name = PRESET_ALIASES
        .iter()
        .find(|(alias, _)| *alias == name)
        .map(|(_, canonical)| *canonical)
        .unwrap_or(name);
    PRESET_SEEDS
        .iter()
        .find(|(n, _)| *n == name)
        .map(|(_, hex)| *hex)
}

/// The semantic theme for a seed + mode, ready for render-time substitution.
pub fn semantic_theme(seed: &Oklch, mode: Mode, source: &str) -> crate::theme::ResolvedTheme {
    resolve_ramp(*seed, mode).to_theme(source)
}

/// Merges the value-side `vx-v-*` token family — the full semantic ramp
/// derived from `value_seed` — into an already-resolved base theme.
///
/// This is the API path for `?seed2=`: the base may be anything (seed,
/// preset, brand, the default ramp, dark or light), and only the value-side
/// family is overlaid. The base tokens, radius, shadow, source and retint
/// flags are untouched; callers set `source` (and any retint caveat) before
/// calling.
pub fn overlay_value_seed(
    mut base: crate::theme::ResolvedTheme,
    value_seed: &Oklch,
    mode: Mode,
) -> crate::theme::ResolvedTheme {
    let value = resolve_ramp(*value_seed, mode);
    for (token, css) in value.tokens {
        let prefixed = token.replacen("vx-", "vx-v-", 1);
        base.colors.insert(prefixed, css);
    }
    base
}

/// The dual-seed semantic theme: the base ramp rides `seed` exactly like
/// `semantic_theme`, and a second, independent ramp derived from `value_seed`
/// is merged under `v-`-prefixed token names (`vx-s-white` → `vx-v-s-white`).
///
/// Templates address the value segment through the `vx-v-*` family (with the
/// source value as fallback: `var(--vx-v-t-strong, oklch(…))`), so `?seed2=`
/// re-colors the value side without touching the label side.
pub fn semantic_theme_duo(
    seed: &Oklch,
    value_seed: &Oklch,
    mode: Mode,
    source: &str,
) -> crate::theme::ResolvedTheme {
    overlay_value_seed(semantic_theme(seed, mode, source), value_seed, mode)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_seed_matches_design_source_formulas() {
        // The design source bakes these by evaluating the same formulas with
        // #3b82f6 — the fixture (dump-semantic) pins the full set.
        let ramp = resolve_ramp(parse_seed(DEFAULT_SEED).unwrap(), Mode::Light);
        let a = ramp.tokens.get("vx-a").unwrap();
        assert_eq!(a, &Oklch::parse("#3b82f6").unwrap().to_css());
        // surfaces are near-white with a blue whisper
        let s = Oklch::parse(ramp.tokens.get("vx-s-white").unwrap()).unwrap();
        assert!(s.l > 0.99 && s.c < 0.02, "s-white near-white, got {s:?}");
        // text ramps stay dark
        let t = Oklch::parse(ramp.tokens.get("vx-t-heading").unwrap()).unwrap();
        assert!(t.l < 0.25, "t-heading dark, got {t:?}");
    }

    #[test]
    fn dark_mode_flips_surfaces_only() {
        let seed = parse_seed(DEFAULT_SEED).unwrap();
        let light = resolve_ramp(seed, Mode::Light);
        let dark = resolve_ramp(seed, Mode::Dark);
        // surfaces flip
        let lw = Oklch::parse(light.tokens.get("vx-s-white").unwrap())
            .unwrap()
            .l;
        let dw = Oklch::parse(dark.tokens.get("vx-s-white").unwrap())
            .unwrap()
            .l;
        assert!(lw > 0.95 && dw < 0.35, "surface flips: {lw} → {dw}");
        let lh = Oklch::parse(light.tokens.get("vx-t-heading").unwrap())
            .unwrap()
            .l;
        let dh = Oklch::parse(dark.tokens.get("vx-t-heading").unwrap())
            .unwrap()
            .l;
        assert!(lh < 0.25 && dh > 0.9, "heading flips: {lh} → {dh}");
        // accents / status / dark surfaces / metallics stay identical
        for token in ["vx-a", "vx-a-deep", "vx-ok", "vx-d-bg", "vx-metal-2"] {
            assert_eq!(
                light.tokens.get(token),
                dark.tokens.get(token),
                "{token} mode-independent"
            );
        }
        // …except the accent ink, which must brighten on dark surfaces
        let li = Oklch::parse(light.tokens.get("vx-a-ink").unwrap())
            .unwrap()
            .l;
        let di = Oklch::parse(dark.tokens.get("vx-a-ink").unwrap())
            .unwrap()
            .l;
        assert!(li < 0.45 && di > 0.75, "a-ink flips: {li} → {di}");
    }

    #[test]
    fn seed_drives_the_whole_ramp() {
        let blue = resolve_ramp(parse_seed("#3b82f6").unwrap(), Mode::Light);
        let rose = resolve_ramp(parse_seed("#ec4899").unwrap(), Mode::Light);
        let hb = Oklch::parse(blue.tokens.get("vx-a-bright").unwrap())
            .unwrap()
            .h;
        let hr = Oklch::parse(rose.tokens.get("vx-a-bright").unwrap())
            .unwrap()
            .h;
        assert!((hb - 259.8).abs() < 2.0, "blue hue, got {hb}");
        assert!(
            (hr - 350.0).abs() < 15.0 || hr > 345.0,
            "rose hue, got {hr}"
        );
        // every accent-family token rotates with the seed
        for token in ["vx-a", "vx-a-bright", "vx-a-soft", "vx-a-deep", "vx-a-ink"] {
            assert_ne!(blue.tokens.get(token), rose.tokens.get(token), "{token}");
        }
        // status hues never move
        assert_eq!(blue.tokens.get("vx-ok"), rose.tokens.get("vx-ok"));
    }

    #[test]
    fn color_mix_matches_css_semantics() {
        let seed = AlphaColor::opaque(Oklch::parse("#3b82f6").unwrap());
        let white = AlphaColor::opaque(Oklch::from_rgb8(255, 255, 255));
        // mix 60% seed + white keeps the seed hue
        let mixed = color_mix(seed, white, 60.0);
        assert!((mixed.color.h - seed.color.h).abs() < 3.0);
        assert!(mixed.color.l > seed.color.l, "lighter than the seed");
        // transparent base: channels unchanged, alpha = pct
        let glow = color_mix(seed, AlphaColor::transparent(), 30.0);
        assert!((glow.alpha - 0.30).abs() < 1e-9);
        assert!(
            (glow.color.l - seed.color.l).abs() < 1e-9,
            "channels ride the top color"
        );
        assert!(glow.to_css().contains(" / 0.30"), "{}", glow.to_css());
        // achromatic top carries the base hue
        let gray = AlphaColor::opaque(Oklch::from_rgb8(0x6b, 0x72, 0x80));
        let mixed = color_mix(AlphaColor::opaque(Oklch::neutral(0.5)), gray, 20.0);
        assert!((mixed.color.h - gray.color.h).abs() < 1e-6, "hue carried");
    }

    #[test]
    fn parse_seed_accepts_hashless_and_short() {
        assert!(parse_seed("3b82f6").is_some());
        assert!(parse_seed("#3b82f6").is_some());
        assert_eq!(parse_seed("#fff").unwrap().to_rgb8(), (255, 255, 255));
        assert!(parse_seed("nothex").is_none());
        assert!(parse_seed("#12345").is_none());
        assert!(parse_seed("").is_none());
        assert!(parse_seed("1234567").is_none());
    }

    #[test]
    fn mode_parses() {
        assert_eq!(Mode::parse("dark"), Some(Mode::Dark));
        assert_eq!(Mode::parse("LIGHT"), Some(Mode::Light));
        assert_eq!(Mode::parse("midnight"), None);
    }

    #[test]
    fn presets_resolve_to_seeds() {
        assert_eq!(preset_seed("blue"), Some("#3b82f6"));
        assert_eq!(preset_seed("rose"), Some("#ec4899"), "v4 alias");
        assert_eq!(preset_seed("emerald"), Some("#22c55e"), "v4 alias");
        assert_eq!(preset_seed("pink"), Some("#ec4899"));
        assert_eq!(preset_seed("nope"), None);
        for (name, hex) in PRESET_SEEDS {
            assert!(parse_seed(hex).is_some(), "{name} seed parses");
        }
    }

    #[test]
    fn every_core_token_resolves_parseable() {
        for mode in [Mode::Light, Mode::Dark] {
            let ramp = resolve_ramp(parse_seed(DEFAULT_SEED).unwrap(), mode);
            assert_eq!(
                ramp.tokens.len(),
                34 + MIX_SPEC.len(),
                "core vocabulary + discovered mixes"
            );
            for (k, v) in &ramp.tokens {
                assert!(v.starts_with("oklch("), "{k} → {v}");
                Oklch::parse(v).unwrap_or_else(|| panic!("{k} = {v} parses"));
            }
        }
    }

    #[test]
    fn theme_bridge_is_palette_mode() {
        let theme = semantic_theme(&parse_seed("#ec4899").unwrap(), Mode::Dark, "test");
        assert!(!theme.is_retint());
        assert_eq!(theme.source, "test");
        assert!(theme.token("vx-t-heading").is_some());
    }

    /// The committed fixture must reproduce resolve_ramp exactly — it is the
    /// cross-language parity contract with packages/themes/src/semantic.ts.
    #[test]
    fn fixture_pins_the_ramps() {
        let fixture = include_str!("../../../packages/themes/test/fixtures/semantic.json");
        let groups: BTreeMap<String, BTreeMap<String, String>> =
            serde_json::from_str(fixture).expect("fixture parses");
        assert!(groups.len() >= 28, "fixture covers presets + edges");
        for (group, tokens) in &groups {
            let (name, mode) = match group.strip_suffix("-light") {
                Some(n) => (n, Mode::Light),
                None => (
                    group
                        .strip_suffix("-dark")
                        .unwrap_or_else(|| panic!("{group} ends in -light/-dark")),
                    Mode::Dark,
                ),
            };
            let hex = preset_seed(name).unwrap_or_else(|| match name {
                "black" => "#000000",
                "white" => "#ffffff",
                "near-white" => "#fefefe",
                "yellow" => "#facc15",
                "navy" => "#1e1b4b",
                "short" => "#f0a",
                other => panic!("fixture seed '{other}' unmapped"),
            });
            let ramp = resolve_ramp(parse_seed(hex).unwrap(), mode);
            assert_eq!(
                ramp.tokens.len(),
                tokens.len(),
                "{group}: token count drift"
            );
            for (token, value) in tokens {
                assert_eq!(
                    ramp.tokens.get(token).map(String::as_str),
                    Some(value.as_str()),
                    "{group}.{token} drifts from the fixture"
                );
            }
        }
    }

    #[test]
    fn duo_theme_merges_value_ramp_under_v_prefix() {
        let base = parse_seed("#3b82f6").unwrap();
        let value = parse_seed("#ec4899").unwrap();
        let duo = semantic_theme_duo(&base, &value, Mode::Light, "seed duo");
        let solo = semantic_theme(&base, Mode::Light, "seed solo");

        // base tokens are untouched by the value ramp
        for (token, css) in &solo.colors {
            assert_eq!(
                duo.colors.get(token).map(String::as_str),
                Some(css.as_str()),
                "{token} must survive the merge unchanged"
            );
        }
        // every base token has a v- twin derived from the second seed
        let pink = resolve_ramp(value, Mode::Light);
        for (token, css) in &pink.tokens {
            let prefixed = token.replacen("vx-", "vx-v-", 1);
            assert_eq!(
                duo.colors.get(&prefixed).map(String::as_str),
                Some(css.as_str()),
                "{prefixed} must ride the value seed"
            );
        }
        assert_eq!(duo.source, "seed duo");
        assert!(!duo.is_retint(), "duo stays palette-mode");
        // the v- accent really differs from the base accent (pink vs blue)
        assert_ne!(duo.colors.get("vx-v-a"), duo.colors.get("vx-a"));
    }

    #[test]
    fn duo_with_same_seed_matches_single_ramp() {
        let seed = parse_seed("#3b82f6").unwrap();
        let duo = semantic_theme_duo(&seed, &seed, Mode::Dark, "duo same");
        let solo = semantic_theme(&seed, Mode::Dark, "solo");
        for (token, css) in &solo.colors {
            let prefixed = token.replacen("vx-", "vx-v-", 1);
            assert_eq!(
                duo.colors.get(&prefixed).map(String::as_str),
                Some(css.as_str()),
                "same-seed v- twin must equal the base token"
            );
        }
    }
}

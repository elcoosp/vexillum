//! Template substitution: slot markers → escaped badge text / icon SVG.
//!
//! Substitution is single-pass string replacement before `from_html`, so the
//! markers never reach the HTML parser and badge text can never inject
//! markup (spec §5.2).

use vexillum_core::{EXTRA2_MARKER, EXTRA_MARKER, ICON_MARKER, LABEL_MARKER, VALUE_MARKER};

/// HTML-escapes untrusted text for interpolation into a template.
pub fn html_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            _ => out.push(c),
        }
    }
    out
}

/// What fills each slot of a template.
#[derive(Debug, Clone, Default)]
pub struct SlotInput<'a> {
    pub label: Option<&'a str>,
    pub value: Option<&'a str>,
    pub extra: Option<&'a str>,
    pub extra2: Option<&'a str>,
    /// Raw inline SVG — trusted (produced by the icon system), not escaped.
    pub icon_html: Option<&'a str>,
}

/// Replaces all markers in `template` with the escaped slot values.
pub fn substitute(template: &str, slots: &SlotInput<'_>) -> String {
    template
        .replace(LABEL_MARKER, &html_escape(slots.label.unwrap_or_default()))
        .replace(VALUE_MARKER, &html_escape(slots.value.unwrap_or_default()))
        .replace(EXTRA_MARKER, &html_escape(slots.extra.unwrap_or_default()))
        .replace(EXTRA2_MARKER, &html_escape(slots.extra2.unwrap_or_default()))
        .replace(ICON_MARKER, slots.icon_html.unwrap_or_default())
}

/// Removes inline `animation:*;` declarations for static renders, freezing
/// kinetic variants at their base (at-rest) state.
pub fn strip_static_animations(html: &str) -> String {
    let mut out = String::with_capacity(html.len());
    let mut rest = html;
    while let Some(i) = rest.find("animation:") {
        // only strip the `animation` longhand, not animation-* longhands
        let before_ok = rest[..i]
            .chars()
            .last()
            .map(|c| c == ';' || c == ' ' || c == '"' || c == '\'')
            .unwrap_or(true);
        if !before_ok {
            let next = i + "animation:".len();
            out.push_str(&rest[..next]);
            rest = &rest[next..];
            continue;
        }
        let end = rest[i..].find([';', '"']).map(|j| i + j);
        match end {
            Some(j) if rest.as_bytes().get(j) == Some(&b';') => {
                out.push_str(&rest[..i]);
                rest = &rest[j + 1..];
            }
            Some(j) => {
                // `"` terminator (end of the style attribute): drop the
                // declaration, keep the quote, keep scanning
                out.push_str(&rest[..i]);
                rest = &rest[j..];
            }
            None => {
                out.push_str(&rest[..i]);
                break;
            }
        }
    }
    out.push_str(rest);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn escapes_all_html_specials() {
        assert_eq!(
            html_escape("a&b<c>d\"e'f"),
            "a&amp;b&lt;c&gt;d&quot;e&#39;f"
        );
    }

    #[test]
    fn leaves_plain_text_alone() {
        assert_eq!(html_escape("build passing"), "build passing");
        assert_eq!(html_escape("42 ms"), "42 ms");
        assert_eq!(html_escape(""), "");
    }

    #[test]
    fn substitutes_markers() {
        let t = "<b>__VX_LABEL__</b><i>__VX_VALUE__</i><u>__VX_EXTRA__</u><q>__VX_EXTRA2__</q><s>__VX_ICON__</s>";
        let slots = SlotInput {
            label: Some("build"),
            value: Some("passing"),
            extra: Some("Free"),
            extra2: Some("pro"),
            icon_html: Some("<svg/>"),
        };
        assert_eq!(
            substitute(t, &slots),
            "<b>build</b><i>passing</i><u>Free</u><q>pro</q><s><svg/></s>"
        );
    }

    #[test]
    fn label_cannot_inject_markup() {
        let t = "<b>__VX_LABEL__</b>";
        let slots = SlotInput {
            label: Some("<img src=x onerror=alert(1)>"),
            ..Default::default()
        };
        let out = substitute(t, &slots);
        assert!(!out.contains("<img"));
        assert!(out.contains("&lt;img"));
    }

    #[test]
    fn missing_slots_become_empty() {
        let t = "[__VX_LABEL__][__VX_VALUE__][__VX_EXTRA__][__VX_EXTRA2__][__VX_ICON__]";
        let out = substitute(t, &SlotInput::default());
        assert_eq!(out, "[][][][][]");
    }

    #[test]
    fn strips_animation_declarations() {
        let html = r#"<div style="height:26px;animation:shimmer 3s infinite;color:#fff" data-anim="shimmer">x</div>"#;
        let out = strip_static_animations(html);
        assert!(!out.contains("animation:"));
        assert!(out.contains("height:26px"));
        assert!(out.contains("color:#fff"));
        // data-anim attribute survives (registry metadata, harmless)
        assert!(out.contains("data-anim"));
    }

    #[test]
    fn keeps_animation_delay_and_fill_longhands() {
        let html = r#"<span style="animation-delay:1s;animation-fill-mode:both">x</span>"#;
        assert_eq!(strip_static_animations(html), html);
    }
}

/// Resolves `var(--token, fallback)` references in a template against a
/// theme, by textual substitution.
///
/// Why substitution instead of relying on the injected `:root { … }`
/// stylesheet: vexillum resolves custom properties for plain property values,
/// but not *inside* functional values like `linear-gradient(… var(--g-from,
/// #7c3aed) …)` — those silently fall back, which made gradient collections
/// (luminous, two-tone) ignore themes entirely. Substituting before
/// `from_html` works for every position a `var()` can appear in, and the
/// stylesheet injection stays as a belt-and-suspenders for anything else.
///
/// Two theme modes:
/// - **retint** (presets, brand colors): each fallback is re-tinted toward
///   the theme hue with its lightness preserved — themes nuance the design
///   instead of repainting it. The palette is only used when a var() has no
///   parseable fallback.
/// - **palette** (explicit token maps): the token value substitutes
///   verbatim; a missing token keeps the fallback.
pub fn apply_theme_vars(html: &str, theme: &vexillum_theme::ResolvedTheme) -> String {
    let mut out = String::with_capacity(html.len());
    let mut rest = html;
    while let Some(start) = rest.find("var(") {
        let before = &rest[..start];
        let after = &rest[start + 4..]; // skip "var("
        // find the matching close paren — fallbacks in our templates never
        // nest, but oklch(...) *values* we insert do; scan the source only
        let mut depth = 1usize;
        let mut end = None;
        for (i, c) in after.char_indices() {
            match c {
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        end = Some(i);
                        break;
                    }
                }
                _ => {}
            }
        }
        let Some(end) = end else {
            // unbalanced — emit literally and stop scanning here
            out.push_str(before);
            out.push_str("var(");
            rest = after;
            continue;
        };
        let inner = &after[..end];
        let tail = &after[end + 1..];
        out.push_str(before);
        out.push_str(&resolve_var(inner, theme));
        rest = tail;
    }
    out.push_str(rest);
    out
}

/// Resolves the inside of one `var(…)` against the theme.
fn resolve_var(inner: &str, theme: &vexillum_theme::ResolvedTheme) -> String {
    let inner = inner.trim();
    let (name, fallback) = match inner.find(',') {
        Some(i) => (inner[..i].trim(), Some(inner[i + 1..].trim())),
        None => (inner, None),
    };
    let name = name.strip_prefix("--").unwrap_or(name);
    theme.themed_value_for(name, fallback)
}

#[cfg(test)]
mod theme_var_tests {
    use super::*;
    use vexillum_theme::{Oklch, ResolvedTheme};

    fn palette(pairs: &[(&str, &str)]) -> ResolvedTheme {
        ResolvedTheme::from_tokens(pairs).expect("valid tokens")
    }

    #[test]
    fn palette_mode_substitutes_simple_and_gradient_positions() {
        let t = palette(&[("g-from", "oklch(0.55 0.19 259)"), ("value-fg", "#ffffff")]);
        let html = "background:linear-gradient(135deg, var(--g-from, #7c3aed) 0%, var(--g-to, #db2777) 100%); color: var(--value-fg, #111827)";
        let out = apply_theme_vars(html, &t);
        assert!(out.contains("oklch(0.5500 0.1900 259.00)"), "{out}");
        assert!(
            out.contains("#db2777"),
            "missing token must keep fallback: {out}"
        );
        assert!(out.contains("oklch(1.0000 0.0000"), "{out}");
        assert!(!out.contains("var("), "{out}");
    }

    #[test]
    fn handles_unknown_tokens_and_missing_fallbacks() {
        let t = palette(&[("accent", "#ff0000")]);
        // palette values are normalized to oklch by the theme crate
        assert_eq!(
            apply_theme_vars("a: var(--accent, #333); b: var(--mystery);", &t),
            format!("a: {}; b: ;", Oklch::parse("#ff0000").unwrap().to_css())
        );
        // unbalanced var( is left literal
        assert_eq!(apply_theme_vars("x var(--oops y", &t), "x var(--oops y");
    }

    #[test]
    fn value_with_parens_does_not_confuse_the_scanner() {
        // the REPLACEMENT contains parens; the scan runs on source order
        let t = palette(&[("value-bg", "oklch(0.6 0.2 15)")]);
        let html = "<div style=\"background:var(--value-bg, #111827)\"><span style=\"color:var(--value-fg, #fff)\">x</span></div>";
        let out = apply_theme_vars(html, &t);
        assert!(out.contains("oklch(0.6000 0.2000 15.00)"), "{out}");
        // value-fg not in the palette → fallback kept verbatim
        assert!(out.contains("#fff"), "{out}");
        assert!(!out.contains("var("), "{out}");
    }

    #[test]
    fn retint_mode_re_hues_each_fallback_in_place() {
        let t = vexillum_theme::preset_theme("blue").unwrap(); // hue 259
        let html = "background:var(--value-bg, #ffffff); color:var(--value-ink, #111827); border:1px solid var(--border, #7c3aed)";
        let out = apply_theme_vars(html, &t);
        // white stays white (true neutral)
        assert!(out.contains("#ffffff"), "white must stay: {out}");
        // dark ink re-hues at its own lightness (parseable oklch out)
        assert!(
            out.contains("oklch(0.2"),
            "ink re-tinted near its lightness: {out}"
        );
        // violet border rotates to the theme hue
        assert!(out.contains(" 259.00)"), "hue rotated to theme: {out}");
        assert!(!out.contains("var("), "{out}");
    }
}

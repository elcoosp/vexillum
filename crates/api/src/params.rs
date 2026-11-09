//! Query parameter parsing (spec §10.2) shared by badge routes.

use std::collections::HashMap;

use vexillum_core::{Error, Format, Result, Scale};

/// What `?font=` resolved to.
#[derive(Debug, Clone, PartialEq, Default)]
pub enum FontSelection {
    /// No override — source design fonts.
    #[default]
    None,
    /// One of the four families embedded in the renderer (no network).
    Bundled(String),
    /// A Google Fonts catalog family, fetched and cached by the API layer.
    Google(String),
}

impl FontSelection {
    /// The family name the render stylesheet forces, if any.
    pub fn family(&self) -> Option<&str> {
        match self {
            Self::None => None,
            Self::Bundled(f) | Self::Google(f) => Some(f),
        }
    }
}

/// Semantic theming request: `?seed=<hex>` (custom seed) + `?mode=`
/// (light|dark). Both are optional; seed overrides `?theme=`.

#[derive(Debug, Clone, Default)]
pub struct BadgeQuery {
    pub format: Option<Format>,
    pub scale: Option<Scale>,
    pub theme: Option<String>,
    pub icon: Option<vexillum_icons::IconSpec>,
    pub icon_color: Option<vexillum_icons::IconColor>,
    pub icon_size: Option<u32>,
    pub no_icon: bool,
    pub pad: Option<u32>,
    pub strict: Option<bool>,
    /// Resolved `?font=`: bundled family, Google family, or none.
    pub font: FontSelection,
    /// Third-segment text (`?extra=`, suffix / tri-segment badges); absent =
    /// the design's default extra, empty string = explicit none.
    pub extra: Option<String>,
    /// Fourth-segment text (`?extra2=`, quad badges like c17-08); absent =
    /// the design's default extra2, empty string = explicit none.
    pub extra2: Option<String>,
    /// shields.io compatibility aliases
    pub logo: Option<vexillum_icons::IconSpec>,
    pub logo_color: Option<vexillum_icons::IconColor>,
    /// Custom seed (`?seed=3b82f6` / `?seed=%233b82f6`) for the semantic
    /// OKLCH ramp — overrides `?theme=` when present.
    pub seed: Option<String>,
    /// Second, independent seed (`?seed2=3b82f6`) driving the VALUE-side
    /// token family (`vx-v-*`): the value segment re-colors while the label
    /// side keeps the base seed. Optional; validated like `seed`.
    pub seed2: Option<String>,
    /// Surface mode for the semantic ramp (`?mode=light|dark`).
    pub mode: Option<vexillum_theme::Mode>,
}

impl BadgeQuery {
    pub fn from_map(map: &HashMap<String, String>) -> Result<Self> {
        let get = |k: &str| map.get(k).cloned();
        let format = match get("format") {
            Some(v) => Some(v.parse::<Format>()?),
            None => None,
        };
        let scale = match get("scale") {
            Some(v) => Some(v.parse::<Scale>()?),
            None => None,
        };
        let icon_spec = get("icon").filter(|v| !v.is_empty());
        let no_icon = icon_spec.as_deref() == Some("none");
        let icon = match icon_spec {
            Some(v) if v != "none" => Some(vexillum_icons::IconSpec::parse(&v)?),
            _ => None,
        };
        let icon_color = match get("icon.color")
            .or_else(|| get("iconColor"))
            .or_else(|| get("logoColor"))
        {
            Some(v) if !v.is_empty() => Some(vexillum_icons::IconColor::parse(&v)?),
            _ => None,
        };
        let icon_size = match get("icon.size").or_else(|| get("iconSize")) {
            Some(v) => Some(parse_range(&v, 8, 48, "icon.size")?),
            None => None,
        };
        let pad = match get("pad") {
            Some(v) => Some(parse_range(&v, 0, 64, "pad")?),
            None => None,
        };
        let strict = get("strict").map(|v| v != "false");
        let theme = get("theme").filter(|t| !t.is_empty());
        // `?font=` slug → bundled family → Google Fonts catalog → 400.
        // absent/empty = no override (byte-identical default render)
        let font = match get("font") {
            Some(v) if !v.is_empty() => {
                if let Some(family) = vexillum_render::font_family_from_slug(&v) {
                    FontSelection::Bundled(family.to_string())
                } else if let Some(family) =
                    vexillum_render::google_fonts::resolve_google_family(&v)
                {
                    FontSelection::Google(family.to_string())
                } else {
                    return Err(Error::InvalidFont(v));
                }
            }
            _ => FontSelection::None,
        };
        // third-segment text: ?extra= (absent = design default; empty = none)
        let extra = match get("extra") {
            Some(v) if v.len() > 64 => {
                return Err(Error::BadRequest(
                    "extra must be at most 64 characters".into(),
                ));
            }
            Some(v) => Some(v),
            None => None,
        };
        // fourth-segment text: ?extra2= (quad badges; same contract as extra)
        let extra2 = match get("extra2") {
            Some(v) if v.len() > 64 => {
                return Err(Error::BadRequest(
                    "extra2 must be at most 64 characters".into(),
                ));
            }
            Some(v) => Some(v),
            None => None,
        };
        // shields.io compatibility: logo/logoColor are aliases for icon/icon.color
        let logo = get("logo").and_then(|v| vexillum_icons::IconSpec::parse(&v).ok());
        let icon = icon.or(logo);
        // semantic theming: custom seed + surface mode. Accept URL-encoded
        // (%23), hashed (#) and bare hex forms.
        let parse_seed_param = |v: String| -> Result<String> {
            let normalized = v
                .trim()
                .trim_start_matches("%23")
                .trim_start_matches('#')
                .to_ascii_lowercase();
            if vexillum_theme::parse_seed(&normalized).is_none() {
                return Err(Error::BadRequest(format!(
                    "invalid seed '{v}' — expected a hex color like 3b82f6"
                )));
            }
            Ok(normalized)
        };
        let seed = match get("seed") {
            Some(v) if !v.is_empty() => Some(parse_seed_param(v)?),
            _ => None,
        };
        let seed2 = match get("seed2") {
            Some(v) if !v.is_empty() => Some(parse_seed_param(v)?),
            _ => None,
        };
        let mode = match get("mode") {
            Some(v) if !v.is_empty() => Some(vexillum_theme::Mode::parse(&v).ok_or_else(|| {
                Error::BadRequest(format!("invalid mode '{v}' — expected light or dark"))
            })?),
            _ => None,
        };
        Ok(Self {
            format,
            scale,
            theme,
            icon,
            icon_color,
            icon_size,
            no_icon,
            pad,
            strict,
            font,
            extra,
            extra2,
            logo: None,
            logo_color: None,
            seed,
            seed2,
            mode,
        })
    }
}

fn parse_range(v: &str, min: u32, max: u32, name: &str) -> Result<u32> {
    let n: u32 = v
        .parse()
        .map_err(|_| Error::BadRequest(format!("{name} must be an integer")))?;
    if !(min..=max).contains(&n) {
        return Err(Error::BadRequest(format!(
            "{name} must be within {min}..={max}"
        )));
    }
    Ok(n)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn map(pairs: &[(&str, &str)]) -> HashMap<String, String> {
        pairs
            .iter()
            .map(|(k, v)| (k.to_string(), v.to_string()))
            .collect()
    }

    #[test]
    fn parses_all_params() {
        let q = BadgeQuery::from_map(&map(&[
            ("format", "png"),
            ("scale", "2"),
            ("theme", "rose"),
            ("icon", "simple:github"),
            ("icon.color", "#ff0000"),
            ("icon.size", "20"),
            ("pad", "12"),
        ]))
        .unwrap();
        assert_eq!(q.format, Some(Format::Png));
        assert_eq!(q.scale, Some(Scale::Two));
        assert_eq!(q.theme.as_deref(), Some("rose"));
        assert_eq!(
            q.icon,
            Some(vexillum_icons::IconSpec::Simple("github".into()))
        );
        assert_eq!(q.icon_size, Some(20));
        assert_eq!(q.pad, Some(12));
    }

    #[test]
    fn shields_aliases() {
        let q = BadgeQuery::from_map(&map(&[
            ("format", "svg"),
            ("logo", "simple:npm"),
            ("logoColor", "auto"),
        ]))
        .unwrap();
        assert_eq!(q.icon, Some(vexillum_icons::IconSpec::Simple("npm".into())));
        assert_eq!(q.icon_color, Some(vexillum_icons::IconColor::Current));
    }

    #[test]
    fn rejects_invalid_values() {
        assert!(BadgeQuery::from_map(&map(&[("format", "bmp")])).is_err());
        assert!(BadgeQuery::from_map(&map(&[("scale", "9")])).is_err());
        assert!(BadgeQuery::from_map(&map(&[("pad", "999")])).is_err());
        assert!(BadgeQuery::from_map(&map(&[("icon.size", "1")])).is_err());
    }

    #[test]
    fn extra_param_parses_and_validates() {
        let q = BadgeQuery::from_map(&map(&[("extra", "since 09:41")])).unwrap();
        assert_eq!(q.extra.as_deref(), Some("since 09:41"));
        // absent = design default; empty = explicit none
        assert_eq!(BadgeQuery::from_map(&map(&[])).unwrap().extra, None);
        assert_eq!(
            BadgeQuery::from_map(&map(&[("extra", "")])).unwrap().extra,
            Some(String::new())
        );
        let long: String = "x".repeat(65);
        assert!(BadgeQuery::from_map(&map(&[("extra", long.as_str())])).is_err());
    }

    #[test]
    fn extra2_param_parses_and_validates_like_extra() {
        let q = BadgeQuery::from_map(&map(&[("extra2", "third")])).unwrap();
        assert_eq!(q.extra2.as_deref(), Some("third"));
        // absent = design default; empty = explicit none
        assert_eq!(BadgeQuery::from_map(&map(&[])).unwrap().extra2, None);
        assert_eq!(
            BadgeQuery::from_map(&map(&[("extra2", "")])).unwrap().extra2,
            Some(String::new())
        );
        // ?extra= and ?extra2= are independent
        let q = BadgeQuery::from_map(&map(&[("extra", "b"), ("extra2", "c")])).unwrap();
        assert_eq!(q.extra.as_deref(), Some("b"));
        assert_eq!(q.extra2.as_deref(), Some("c"));
        let long: String = "x".repeat(65);
        assert!(BadgeQuery::from_map(&map(&[("extra2", long.as_str())])).is_err());
    }

    #[test]
    fn icon_none_disables() {
        let q = BadgeQuery::from_map(&map(&[("icon", "none")])).unwrap();
        assert!(q.no_icon);
    }

    #[test]
    fn seed_and_mode_parse_and_validate() {
        let q = BadgeQuery::from_map(&map(&[("seed", "%233b82f6")])).unwrap();
        assert_eq!(q.seed.as_deref(), Some("3b82f6"));
        let q = BadgeQuery::from_map(&map(&[("seed", "#EC4899"), ("mode", "dark")])).unwrap();
        assert_eq!(q.seed.as_deref(), Some("ec4899"));
        assert_eq!(q.mode, Some(vexillum_theme::Mode::Dark));
        // absent or empty = no override
        assert_eq!(BadgeQuery::from_map(&map(&[])).unwrap().seed, None);
        assert_eq!(
            BadgeQuery::from_map(&map(&[("seed", "")])).unwrap().seed,
            None
        );
        assert_eq!(
            BadgeQuery::from_map(&map(&[("mode", "")])).unwrap().mode,
            None
        );
        // junk is rejected
        let err = BadgeQuery::from_map(&map(&[("seed", "nothex")])).unwrap_err();
        assert_eq!(err.status(), 400);
        let err = BadgeQuery::from_map(&map(&[("mode", "midnight")])).unwrap_err();
        assert_eq!(err.status(), 400);
    }

    #[test]
    fn seed2_parses_and_validates_like_seed() {
        let q = BadgeQuery::from_map(&map(&[("seed2", "%23ec4899")])).unwrap();
        assert_eq!(q.seed2.as_deref(), Some("ec4899"));
        let q = BadgeQuery::from_map(&map(&[("seed", "3b82f6"), ("seed2", "#22C55E")])).unwrap();
        assert_eq!(q.seed.as_deref(), Some("3b82f6"));
        assert_eq!(q.seed2.as_deref(), Some("22c55e"));
        // absent or empty = no value-side override
        assert_eq!(BadgeQuery::from_map(&map(&[])).unwrap().seed2, None);
        assert_eq!(
            BadgeQuery::from_map(&map(&[("seed2", "")])).unwrap().seed2,
            None
        );
        let err = BadgeQuery::from_map(&map(&[("seed2", "nothex")])).unwrap_err();
        assert_eq!(err.status(), 400);
    }

    #[test]
    fn font_slug_resolves_to_family() {
        let q = BadgeQuery::from_map(&map(&[("font", "space-mono")])).unwrap();
        assert_eq!(q.font, FontSelection::Bundled("Space Mono".into()));
        let q = BadgeQuery::from_map(&map(&[("font", "jetbrains-mono")])).unwrap();
        assert_eq!(q.font, FontSelection::Bundled("JetBrains Mono".into()));
        // absent or empty = no override (byte-identical default render)
        assert_eq!(
            BadgeQuery::from_map(&map(&[])).unwrap().font,
            FontSelection::None
        );
        assert_eq!(
            BadgeQuery::from_map(&map(&[("font", "")])).unwrap().font,
            FontSelection::None
        );
    }

    #[test]
    fn google_font_slugs_resolve_to_the_catalog_family() {
        let q = BadgeQuery::from_map(&map(&[("font", "roboto")])).unwrap();
        assert_eq!(q.font, FontSelection::Google("Roboto".into()));
        let q = BadgeQuery::from_map(&map(&[("font", "noto-sans-sc")])).unwrap();
        assert_eq!(q.font, FontSelection::Google("Noto Sans SC".into()));
        // a family name also resolves
        let q = BadgeQuery::from_map(&map(&[("font", "Playfair Display")])).unwrap();
        assert_eq!(q.font, FontSelection::Google("Playfair Display".into()));
    }

    #[test]
    fn unknown_font_slug_is_invalid_font_error() {
        let err = BadgeQuery::from_map(&map(&[("font", "bogus")])).unwrap_err();
        assert_eq!(err.status(), 400);
        assert!(err.type_uri().ends_with("invalid-font"));
        // empty does NOT error — it means "no override"
        assert!(BadgeQuery::from_map(&map(&[("font", "")])).is_ok());
    }
}

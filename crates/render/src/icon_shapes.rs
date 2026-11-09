//! Normalizes SVG basic shapes (`<line>`, `<circle>`, `<ellipse>`, `<rect>`)
//! inside icon markup into equivalent `<path>` elements.
//!
//! Why: takumi resolves basic-shape geometry (`x1`/`cx`/`r`/…) through
//! CSS-length conversion, which is device-pixel-ratio dependent — at DPR ≥ 2
//! the resolved coordinates land outside the icon viewport and the shape
//! silently disappears (the c09-06 terminal prompt lost its underscore at
//! 2x/3x). `<path>`/`<polyline>`/`<polygon>` geometry is raw user units and
//! renders correctly at every DPR, so rewriting the four basic shapes into
//! paths makes icon output DPR-invariant. Browsers treat both forms
//! identically, so the substitution is also web-safe.
//!
//! The converter is intentionally conservative: anything it cannot parse
//! (percentages, calc(), exotic units) is left untouched rather than
//! approximated.

/// Bezier control constant for a quarter-circle approximation.
const K: f64 = 0.552_284_749_830_793_6;

/// Rewrites every convertible basic shape in `svg` into a `<path>`.
pub fn normalize_shapes(svg: &str) -> String {
    if !svg.contains("<line") && !svg.contains("<circle") && !svg.contains("<ellipse") && !svg.contains("<rect") {
        return svg.to_string();
    }
    let mut out = String::with_capacity(svg.len() + 64);
    let mut rest = svg;
    while let Some(pos) = find_shape_tag(rest) {
        let (prefix, tag_start) = rest.split_at(pos);
        out.push_str(prefix);
        let Some(tag_end_rel) = tag_start.find('>') else {
            out.push_str(tag_start);
            break;
        };
        let tag = &tag_start[..tag_end_rel + 1];
        out.push_str(&convert_tag(tag));
        rest = &tag_start[tag_end_rel + 1..];
    }
    out.push_str(rest);
    out
}

fn find_shape_tag(s: &str) -> Option<usize> {
    let mut best: Option<(usize, usize)> = None;
    for (i, name) in ["<line", "<circle", "<ellipse", "<rect"].iter().enumerate() {
        if let Some(p) = s.find(name) {
            let is_word_boundary = s[p + name.len()..]
                .chars()
                .next()
                .map(|c| c == ' ' || c == '>' || c == '/')
                .unwrap_or(false);
            if !is_word_boundary {
                continue;
            }
            match best {
                Some((bp, _)) if bp <= p => {}
                _ => best = Some((p, i)),
            }
        }
    }
    best.map(|(p, _)| p)
}

/// Converts one basic-shape tag into `<path d="…"/>`, preserving every
/// non-geometry attribute verbatim. Returns the input unchanged when the
/// geometry cannot be expressed reliably.
fn convert_tag(tag: &str) -> String {
    let Some(attrs) = parse_attrs(tag) else {
        return tag.to_string();
    };
    let shape = tag_name(tag);
    let num = |key: &str| -> Option<f64> {
        let raw = attrs.iter().find(|(k, _)| k == key)?.1.clone();
        parse_length(&raw)
    };
    let d = match shape {
        "line" => match (num("x1"), num("y1"), num("x2"), num("y2")) {
            (Some(x1), Some(y1), Some(x2), Some(y2)) => {
                format!("M {} {} L {} {}", fmt(x1), fmt(y1), fmt(x2), fmt(y2))
            }
            _ => return tag.to_string(),
        },
        "circle" => match (num("cx"), num("cy"), num("r")) {
            (Some(cx), Some(cy), Some(r)) if r > 0.0 => ellipse_path(cx, cy, r, r),
            _ => return tag.to_string(),
        },
        "ellipse" => match (num("cx"), num("cy"), num("rx"), num("ry")) {
            (Some(cx), Some(cy), Some(rx), Some(ry)) if rx > 0.0 && ry > 0.0 => {
                ellipse_path(cx, cy, rx, ry)
            }
            _ => return tag.to_string(),
        },
        "rect" => match (num("x"), num("y"), num("width"), num("height")) {
            (Some(x), Some(y), Some(w), Some(h)) if w > 0.0 && h > 0.0 => {
                rect_path(x, y, w, h, num("rx"), num("ry"))
            }
            _ => return tag.to_string(),
        },
        _ => return tag.to_string(),
    };
    let kept: Vec<String> = attrs
        .iter()
        .filter(|(k, _)| !is_geometry_key(shape, k))
        .map(|(k, v)| format!("{k}=\"{v}\""))
        .collect();
    if kept.is_empty() {
        format!("<path d=\"{d}\"/>")
    } else {
        format!("<path d=\"{d}\" {}/>", kept.join(" "))
    }
}

fn tag_name(tag: &str) -> &'static str {
    let inner = tag.trim_start_matches('<');
    let name: String = inner
        .chars()
        .take_while(|c| c.is_ascii_alphanumeric())
        .collect();
    match name.as_str() {
        "line" => "line",
        "circle" => "circle",
        "ellipse" => "ellipse",
        "rect" => "rect",
        _ => "",
    }
}

fn is_geometry_key(shape: &str, key: &str) -> bool {
    match shape {
        "line" => matches!(key, "x1" | "y1" | "x2" | "y2"),
        "circle" => matches!(key, "cx" | "cy" | "r"),
        "ellipse" => matches!(key, "cx" | "cy" | "rx" | "ry"),
        "rect" => matches!(key, "x" | "y" | "width" | "height" | "rx" | "ry"),
        _ => false,
    }
}

fn parse_attrs(tag: &str) -> Option<Vec<(String, String)>> {
    let inner = tag.strip_prefix('<')?.strip_suffix("/>").unwrap_or(tag.strip_prefix('<')?);
    let name_len = inner
        .chars()
        .take_while(|c| c.is_ascii_alphanumeric())
        .count();
    let body = &inner[name_len..];
    let mut attrs = Vec::new();
    let mut rest = body.trim_start();
    while !rest.is_empty() {
        let eq = rest.find('=')?;
        let key = rest[..eq].trim().to_string();
        if !key.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == ':') {
            return None;
        }
        let rest2 = &rest[eq + 1..];
        let rest2 = rest2.trim_start();
        let quote = rest2.chars().next()?;
        if quote != '"' && quote != '\'' {
            return None;
        }
        let end = rest2[1..].find(quote)? + 1;
        attrs.push((key, rest2[1..end].to_string()));
        rest = rest2[end + 1..].trim_start();
    }
    Some(attrs)
}

/// Parses a plain number, optionally suffixed with `px`. `None` for anything
/// else (percentages, em, calc) — those shapes stay unconverted.
fn parse_length(raw: &str) -> Option<f64> {
    let t = raw.trim();
    let t = t.strip_suffix("px").unwrap_or(t);
    if t.is_empty() {
        return None;
    }
    t.parse::<f64>().ok()
}

fn fmt(v: f64) -> String {
    if (v - v.round()).abs() < 1e-9 {
        format!("{}", v.round() as i64)
    } else {
        format!("{v:.3}")
    }
}

fn ellipse_path(cx: f64, cy: f64, rx: f64, ry: f64) -> String {
    let kx = K * rx;
    let ky = K * ry;
    format!(
        "M {} {} C {} {} {} {} {} {} C {} {} {} {} {} {} C {} {} {} {} {} {} C {} {} {} {} {} {} Z",
        fmt(cx - rx), fmt(cy),
        fmt(cx - rx), fmt(cy - ky), fmt(cx - kx), fmt(cy - ry), fmt(cx), fmt(cy - ry),
        fmt(cx + kx), fmt(cy - ry), fmt(cx + rx), fmt(cy - ky), fmt(cx + rx), fmt(cy),
        fmt(cx + rx), fmt(cy + ky), fmt(cx + kx), fmt(cy + ry), fmt(cx), fmt(cy + ry),
        fmt(cx - kx), fmt(cy + ry), fmt(cx - rx), fmt(cy + ky), fmt(cx - rx), fmt(cy),
    )
}

fn rect_path(x: f64, y: f64, w: f64, h: f64, rx: Option<f64>, ry: Option<f64>) -> String {
    let (rx, ry) = match (rx, ry) {
        (Some(a), Some(b)) => (a, b),
        (Some(a), None) | (None, Some(a)) => (a, a),
        (None, None) => {
            return format!(
                "M {} {} H {} V {} H {} Z",
                fmt(x),
                fmt(y),
                fmt(x + w),
                fmt(y + h),
                fmt(x)
            )
        }
    };
    let rx = rx.min(w / 2.0);
    let ry = ry.min(h / 2.0);
    if rx <= 0.0 || ry <= 0.0 {
        return format!(
            "M {} {} H {} V {} H {} Z",
            fmt(x),
            fmt(y),
            fmt(x + w),
            fmt(y + h),
            fmt(x)
        );
    }
    let kx = K * rx;
    let ky = K * ry;
    let (x2, y2) = (x + w, y + h);
    format!(
        "M {} {} H {} C {} {} {} {} {} {} V {} C {} {} {} {} {} {} H {} C {} {} {} {} {} {} V {} C {} {} {} {} {} {} Z",
        fmt(x + rx), fmt(y),
        fmt(x2 - rx),
        fmt(x2 - kx), fmt(y), fmt(x2), fmt(y + ky), fmt(x2), fmt(y + ry),
        fmt(y2 - ry),
        fmt(x2), fmt(y2 - ky), fmt(x2 - kx), fmt(y2), fmt(x2 - rx), fmt(y2),
        fmt(x + rx),
        fmt(x + kx), fmt(y2), fmt(x), fmt(y2 - ky), fmt(x), fmt(y2 - ry),
        fmt(y + ry),
        fmt(x), fmt(y + ky), fmt(x + kx), fmt(y), fmt(x + rx), fmt(y),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn converts_line_preserving_other_attrs() {
        let svg = r#"<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="11" height="11"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>"#;
        let out = normalize_shapes(svg);
        assert!(!out.contains("<line"));
        assert!(out.contains(r#"<path d="M 12 19 L 20 19"/>"#));
        // untouched siblings survive
        assert!(out.contains(r#"<polyline points="4 17 10 11 4 5"/>"#));
        assert!(out.contains("stroke=\"currentColor\""));
    }

    #[test]
    fn converts_circle_and_ellipse_to_bezier_loops() {
        let out = normalize_shapes(r#"<g><circle cx="12" cy="12" r="8"/></g>"#);
        assert!(!out.contains("<circle"));
        assert!(out.contains("M 4 12") && out.contains("Z"));
        let out = normalize_shapes(r#"<g><ellipse cx="12" cy="12" rx="9" ry="6"/></g>"#);
        assert!(!out.contains("<ellipse"));
        assert!(out.contains("M 3 12"));
    }

    #[test]
    fn converts_rect_with_and_without_radius() {
        let out = normalize_shapes(r#"<g><rect x="4" y="4" width="16" height="16"/></g>"#);
        assert!(out.contains(r#"<path d="M 4 4 H 20 V 20 H 4 Z"/>"#));
        let out = normalize_shapes(r#"<g><rect x="2" y="2" width="20" height="20" rx="4"/></g>"#);
        assert!(!out.contains("<rect"));
        assert!(out.contains("C"));
    }

    #[test]
    fn leaves_unparseable_geometry_untouched() {
        let svg = r#"<g><circle cx="50%" cy="12" r="8"/><rect x="1pt" y="4" width="16" height="16"/></g>"#;
        assert_eq!(normalize_shapes(svg), svg);
    }

    #[test]
    fn word_boundary_guard() {
        // "circles" (a class name, not a tag) must not be rewritten
        let svg = r#"<g class="circles"><circle cx="1" cy="1" r="1"/></g>"#;
        let out = normalize_shapes(svg);
        assert!(out.contains("class=\"circles\""));
        assert!(!out.contains("<circle"));
    }

    #[test]
    fn plain_svg_passthrough() {
        let svg = r#"<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>"#;
        assert_eq!(normalize_shapes(svg), svg);
    }
}

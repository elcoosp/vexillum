//! Vexillum-backed rendering: template + slots + theme → SVG / PNG / WebP /
//! GIF / APNG / JPEG bytes.
//!
//! Sizing is content-driven: the fragment (root = the badge element) is
//! measured in an unconstrained viewport, then rendered at exactly the
//! badge box plus a small padding that keeps box-shadows visible.

use std::sync::{Arc, OnceLock};

pub mod fonts;
pub mod google_fonts;
pub mod icon_shapes;
pub mod substitute;

use takumi::prelude::*;
use takumi::{from_html, measure, render, render_svg, write_animation, write_image};
use vexillum_core::{BadgeData, Error, Format, Scale};
use vexillum_templates::Template;

use crate::substitute::{SlotInput, html_escape, strip_static_animations};

/// Crate result alias.
pub type Result<T> = std::result::Result<T, Error>;

/// Padding added around the badge box so shadows, glows and overhanging
/// decorations are not cropped. Sized from the collections' worst cases:
/// c02-15's 15 px stacked offset shadows, c03-06's 14 px coordinate
/// annotation, c02-07's margin+arrow pair, and the 16 px glow blurs.
/// Used for animated output (frames cannot be cropped after encode) and
/// as the explicit-`?pad=` default.
pub const DEFAULT_PAD_PX: u32 = 18;

/// Padding for the auto-trim render pass. Static output renders with this
/// generous room, then is cropped tight to the painted (alpha > 0) bounding
/// box — flat badges ship with zero wasted transparent margins while glows
/// and offset shadows keep exactly the room they actually use. Must stay ≥
/// the collections' worst-case overhang (see [`DEFAULT_PAD_PX`]); the
/// `auto_trim_never_clips` test sweeps all 544 variants to enforce it.
pub const AUTO_TRIM_PAD_PX: u32 = 32;
/// Frames per second for animated output (GIF min frame = 20ms → ≤ 50).
pub const DEFAULT_ANIMATION_FPS: u32 = 12;

/// A fully resolved render request.
#[derive(Clone)]
pub struct RenderRequest {
    pub variant: String,
    pub data: BadgeData,
    /// `None` = source mode: template fallbacks reproduce the collection
    /// exactly (pixel-perfect default).
    pub theme: Option<vexillum_theme::ResolvedTheme>,
    /// Raw inline SVG for the icon slot; `None` = default collection icon.
    pub icon_html: Option<String>,
    /// `true` renders without any icon even if the template has a slot.
    pub no_icon: bool,
    /// Bundled family name forced onto every node (`?font=` override);
    /// `None` = template defaults, byte-identical to the source collection.
    pub font_family: Option<String>,
    /// Downloaded Google Font face for [`Self::font_family`], fetched by the
    /// API layer (native only). `None` = bundled registry only.
    pub font_bytes: Option<Arc<dyn AsRef<[u8]> + Send + Sync>>,
    pub format: Format,
    pub scale: Scale,
    /// `None` = auto: static output is rendered with [`AUTO_TRIM_PAD_PX`] of
    /// room and cropped tight to the painted content; animated output keeps
    /// [`DEFAULT_PAD_PX`]. `Some(n)` = exactly `n` px of transparent padding
    /// on every side, no cropping.
    pub pad: Option<u32>,
}

impl std::fmt::Debug for RenderRequest {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RenderRequest")
            .field("variant", &self.variant)
            .field("data", &self.data)
            .field("theme", &self.theme)
            .field("icon_html", &self.icon_html.as_ref().map(|s| s.len()))
            .field("no_icon", &self.no_icon)
            .field("font_family", &self.font_family)
            .field(
                "font_bytes",
                &self.font_bytes.as_ref().map(|b| b.as_ref().as_ref().len()),
            )
            .field("format", &self.format)
            .field("scale", &self.scale)
            .field("pad", &self.pad)
            .finish()
    }
}

impl RenderRequest {
    pub fn new(variant: impl Into<String>, data: BadgeData, format: Format) -> Self {
        Self {
            variant: variant.into(),
            data,
            theme: None,
            icon_html: None,
            no_icon: false,
            font_family: None,
            font_bytes: None,
            format,
            scale: Scale::One,
            pad: None,
        }
    }
}

/// Maps a documented `?font=` slug to its bundled family name.
///
/// The mapping is total over the four families embedded in
/// [`crate::fonts`]; any other slug (including empty) is `None`, which the
/// API layer turns into a 400 `invalid-font` problem (after checking the
/// Google Fonts catalog via [`google_fonts::resolve_google_family`]).
pub fn font_family_from_slug(slug: &str) -> Option<&'static str> {
    match slug {
        "inter" => Some("Inter"),
        "jetbrains-mono" => Some("JetBrains Mono"),
        "instrument-serif" => Some("Instrument Serif"),
        "space-mono" => Some("Space Mono"),
        _ => None,
    }
}

/// The bundled registry, shared in an `Arc` so font resolution returns one
/// uniform type for both the bundled and Google-font paths.
pub fn bundled_fonts_arc() -> &'static Arc<Fonts> {
    static ARC: OnceLock<Arc<Fonts>> = OnceLock::new();
    ARC.get_or_init(|| Arc::new(fonts::build_fonts().expect("bundled fonts must register")))
}

/// Resolves the font registry for a request: bundled by default, bundled +
/// the downloaded Google face when `font_bytes` is present. Font layout
/// depends on the registry (a wider face must measure wider), so this is
/// threaded through measurement and every render path.
pub fn resolve_fonts(request: &RenderRequest) -> Result<Arc<Fonts>> {
    match (&request.font_bytes, request.font_family.as_deref()) {
        (Some(bytes), Some(family)) => {
            google_fonts::fonts_with_google_family(family, bytes.clone())
        }
        _ => Ok(bundled_fonts_arc().clone()),
    }
}

/// The stylesheet rule that forces `family` onto every node. Appended to the
/// injected stylesheet (after theme tokens / keyframes) so it merges with —
/// never clobbers — what is already there.
fn font_override_css(family: &str) -> String {
    // family names come from the bundled registry constants, but stay
    // defensive: strip quotes so the emitted CSS can never break out
    let safe = family.replace(['"', '\\'], "");
    format!("* {{ font-family: \"{safe}\"; }}")
}

/// Builds the stylesheet CSS injected at render time: theme tokens (when a
/// theme is selected) plus the global keyframes, plus the `?font=` override
/// rule (when a family is forced). Parsed lossy so the Tailwind output's
/// non-badge at-rules are skipped rather than fatal.
fn stylesheet_css(
    theme: Option<&vexillum_theme::ResolvedTheme>,
    font_family: Option<&str>,
) -> String {
    let mut css = String::new();
    if let Some(t) = theme {
        css.push_str(&t.css_root_block());
    }
    css.push_str(vexillum_templates::SHARED_KEYFRAMES_CSS);
    if let Some(family) = font_family {
        css.push_str(&font_override_css(family));
    }
    css
}

/// Resolves the icon HTML for a template: explicit override wins, then the
/// collection default, then nothing. Basic shapes (`<line>`/`<circle>`/…)
/// are rewritten to `<path>` so icon geometry renders identically at every
/// device pixel ratio (see [`icon_shapes`] for why).
pub fn icon_for(template: &Template, request: &RenderRequest) -> String {
    let meta = vexillum_templates::manifest().variant(&request.variant);
    let has_marker = template.html.contains(vexillum_core::ICON_MARKER);
    if !has_marker {
        return String::new();
    }
    if request.no_icon {
        return String::new();
    }
    if let Some(svg) = &request.icon_html {
        return icon_shapes::normalize_shapes(svg);
    }
    meta.and_then(|m| m.default_icon.as_deref())
        .map(icon_shapes::normalize_shapes)
        .unwrap_or_default()
}

/// Substitutes the template with badge data + icon.
pub fn prepare_html(template: &Template, request: &RenderRequest) -> String {
    let meta = vexillum_templates::manifest().variant(&request.variant);
    let label = if request.data.label.is_empty() {
        meta.map(|m| m.default_label.as_str()).unwrap_or_default()
    } else {
        request.data.label.as_str()
    };
    let value = if request.data.value.is_empty() {
        meta.map(|m| m.default_value.as_str()).unwrap_or_default()
    } else {
        request.data.value.as_str()
    };
    let extra = request
        .data
        .extra
        .as_deref()
        .or(meta.and_then(|m| m.default_extra.as_deref()));
    let extra2 = request
        .data
        .extra2
        .as_deref()
        .or(meta.and_then(|m| m.default_extra2.as_deref()));

    let slots = SlotInput {
        label: Some(label),
        value: Some(value),
        extra,
        extra2,
        icon_html: Some(&icon_for(template, request)),
    };
    let filled = crate::substitute::substitute(template.html, &slots);
    // theme tokens resolve by textual substitution (works inside gradients,
    // where vexillum's custom-property engine does not); no theme keeps the
    // template fallbacks — the pixel-perfect source default.
    let filled = match &request.theme {
        Some(t) => crate::substitute::apply_theme_vars(&filled, t),
        None => filled,
    };
    // takumi's raster path applies the DPR transform to svg stroke widths
    // without dividing by it (probed at DPR 3: `stroke-width="2.5"` paints
    // ~7.5 px and blobs thin glyphs, `stroke-width="0.83"` paints the
    // intended 2.5 px; DPR 1 is always correct). Compensate the icon
    // strokes for scaled *raster* output so stroke-based icons keep their
    // design weight at 2x/3x. SVG output is vector at DPR 1 and must stay
    // untouched.
    let filled = if request.scale.as_f32() > 1.0 && request.format != Format::Svg {
        compensate_svg_stroke_widths(&filled, request.scale.as_f32())
    } else {
        filled
    };
    // class/tw are browser-preview hooks (Tailwind source scanning); the
    // renderer loads no stylesheet that uses them, and takumi's from_html
    // mis-resolves containing blocks for absolutely-positioned descendants
    // when a class attribute is anywhere on the ancestor chain (probed at
    // DPR 3: a zero-inset halo inside a relative inline-flex parent sized
    // itself to the badge root). Stripping them is pixel-neutral and
    // removes the whole bug class.
    let filled = strip_layout_inert_attributes(&filled);
    // animated output keeps animations (driven by time_ms); static freezes
    if request.format.is_animated() {
        filled
    } else {
        strip_static_animations(&filled)
    }
}

/// Divides every svg `stroke-width` (attribute form and inline-style form) by
/// `scale`, undoing takumi's DPR>1 stroke inflation for scaled raster output.
fn compensate_svg_stroke_widths(html: &str, scale: f32) -> String {
    let divide = |raw: &str| -> String {
        match raw.parse::<f32>() {
            Ok(w) => format!("{:.3}", w / scale),
            Err(_) => raw.to_string(),
        }
    };
    // attribute form: stroke-width="2.5"
    let attr_replaced = {
        let mut out = String::with_capacity(html.len());
        let mut rest = html;
        let needle = "stroke-width=\"";
        while let Some(i) = rest.find(needle) {
            out.push_str(&rest[..i + needle.len()]);
            rest = &rest[i + needle.len()..];
            match rest.find('"') {
                Some(j) => {
                    out.push_str(&divide(&rest[..j]));
                    rest = &rest[j..];
                }
                None => break,
            }
        }
        out.push_str(rest);
        out
    };
    // inline-style form: stroke-width:1.6 (semicolons/quote terminate)
    let style_replaced = {
        let mut out = String::with_capacity(attr_replaced.len());
        let mut rest = &attr_replaced[..];
        let needle = "stroke-width:";
        while let Some(i) = rest.find(needle) {
            out.push_str(&rest[..i + needle.len()]);
            let after = &rest[i + needle.len()..];
            let end = after
                .find(|c: char| !(c.is_ascii_digit() || c == '.'))
                .unwrap_or(after.len());
            out.push_str(&divide(&after[..end]));
            rest = &after[end..];
        }
        out.push_str(rest);
        out
    };
    style_replaced
}

/// Removes `class`/`tw` attributes — inert for the renderer (no stylesheet
/// is loaded here) and the trigger of takumi's containing-block bug.
fn strip_layout_inert_attributes(html: &str) -> String {
    let strip = |html: &str, attr: &str| -> String {
        let mut out = String::with_capacity(html.len());
        let mut rest = html;
        while let Some(i) = rest.find(attr) {
            // must be an attribute start: preceded by whitespace
            let ok = rest[..i]
                .chars()
                .last()
                .map(|c| c == ' ' || c == '\n' || c == '\t')
                .unwrap_or(false);
            let after = &rest[i + attr.len()..];
            if !ok || !after.starts_with("=\"") {
                out.push_str(&rest[..i + attr.len()]);
                rest = after;
                continue;
            }
            let value = &after[2..];
            match value.find('"') {
                Some(j) => {
                    out.push_str(&rest[..i]);
                    // drop one leading space (the attribute separator)
                    if out.ends_with(' ') {
                        out.pop();
                    }
                    rest = &value[j + 1..];
                }
                None => {
                    out.push_str(&rest[..i + attr.len()]);
                    rest = after;
                }
            }
        }
        out.push_str(rest);
        out
    };
    strip(&strip(html, "class"), "tw")
}

#[cfg(test)]
mod wrapper_width_tests {
    #[test]
    fn appends_width_to_root_style() {
        let html = r#"<div style="display:inline-flex;height:28px"><span>x</span></div>"#;
        let out = super::inject_root_width(html, 151);
        assert!(
            out.contains(r#"style="display:inline-flex;height:28px;width:151px;""#),
            "{out}"
        );
    }

    #[test]
    fn appended_width_overrides_earlier_auto() {
        let html = r#"<div style="width:auto;height:28px"></div>"#;
        let out = super::inject_root_width(html, 90);
        assert!(out.contains("width:auto;height:28px;width:90px;"), "{out}");
    }

    #[test]
    fn leaves_html_without_style_alone() {
        assert_eq!(super::inject_root_width("<div>x</div>", 10), "<div>x</div>");
    }
}

#[cfg(test)]
mod stroke_compensation_tests {
    #[test]
    fn divides_attribute_and_style_forms() {
        let html = r#"<svg stroke-width="2.5"><rect style="stroke-width:1.6;fill:none"/></svg>"#;
        let out = super::compensate_svg_stroke_widths(html, 3.0);
        assert!(out.contains(r#"stroke-width="0.833""#), "{out}");
        assert!(out.contains("stroke-width:0.533"), "{out}");
    }

    #[test]
    fn leaves_non_numeric_and_other_props_alone() {
        let html = r#"<svg stroke-width="2px" style="stroke:currentColor;stroke-linecap:round">x</svg>"#;
        let out = super::compensate_svg_stroke_widths(html, 2.0);
        assert!(out.contains(r#"stroke-width="2px""#), "{out}");
        assert!(out.contains("stroke:currentColor"), "{out}");
        assert!(!out.contains("stroke-linecap:0.5"), "{out}");
    }

    #[test]
    fn scale_one_is_identity() {
        let html = r#"<svg stroke-width="2.5" style="stroke-width:1.6"/>"#;
        let out = super::compensate_svg_stroke_widths(html, 1.0);
        assert!(out.contains(r#"stroke-width="2.500""#), "{out}");
        assert!(out.contains("stroke-width:1.600"), "{out}");
    }
}

#[cfg(test)]
mod strip_tests {
    #[test]
    fn strips_class_and_tw_but_keeps_style() {
        let html = r#"<div class="badge x" tw="flex" style="color:red"><span class="i">y</span></div>"#;
        let out = super::strip_layout_inert_attributes(html);
        assert!(!out.contains("class="), "{out}");
        assert!(!out.contains("tw="), "{out}");
        assert!(out.contains("style=\"color:red\""), "{out}");
        assert!(out.contains("<div style=\"color:red\">"), "{out}");
        assert!(out.contains("<span>y</span>"), "{out}");
    }

    #[test]
    fn keeps_class_mentions_in_text_and_other_attrs() {
        let html = r#"<div data-class="keep" style="x">class= is text</div>"#;
        let out = super::strip_layout_inert_attributes(html);
        assert!(out.contains("data-class"), "{out}");
        assert!(out.contains("class= is text"), "{out}");
    }
}

/// Parses the fragment into a vexillum node tree.
pub fn parse_fragment(html: &str) -> Result<Node> {
    from_html(html, FromHtmlOptions::default())
        .map_err(|e| Error::Render(format!("from_html failed: {e:?}")))
}

/// Wraps badge HTML in a transparent, `width: fit-content` padded container.
///
/// Two problems this solves, both verified against takumi 2.18 layout:
///
/// 1. **Root stretch** — a blockified badge root laid out directly in the
///    padded viewport fills the viewport width, so backgrounds/borders paint
///    `2 × pad` px wider than designed. The fit-content wrapper box resolves
///    to exactly content + padding, and the badge inside lays out at its
///    intrinsic size.
/// 2. **Clipped overhangs** — decorations outside the badge box (negative
///    absolute offsets, offset shadows) painted at the viewport origin were
///    cropped on the left/top. Inside the wrapper they get `pad` px of room
///    on every side.
pub fn padded_wrapper(html: &str, pad: u32) -> String {
    format!(r#"<div style="padding: {pad}px; width: fit-content;">{html}</div>"#)
}

/// [`padded_wrapper`] with the badge root snapped to its measured integer
/// width. takumi floors background-position while keeping fractional tile
/// sizes, so a fractional badge width leaves an unpainted column before
/// right-anchored gradient layers (the c29 ticket "white stripe"): a
/// 22.05px tile anchored at `100%` paints up to floor(W−22.05)+22.05 =
/// W−0.95. Snapping the root to the ceiling'd measure makes every
/// percentage/calc resolution integer-exact; the sub-pixel slack lands in
/// the badge's own padding.
pub fn padded_wrapper_sized(html: &str, pad: u32, badge_width: u32) -> String {
    let sized = inject_root_width(html, badge_width);
    format!(r#"<div style="padding: {pad}px; width: fit-content;">{sized}</div>"#)
}

/// Appends `width:{w}px;` to the root element's inline style (after any
/// existing declarations, so it wins over e.g. `width:auto`).
fn inject_root_width(html: &str, w: u32) -> String {
    const NEEDLE: &str = "style=\"";
    let Some(start) = html.find(NEEDLE) else {
        return html.to_string();
    };
    let after = &html[start + NEEDLE.len()..];
    let Some(close) = after.find('"') else {
        return html.to_string();
    };
    let mut out = String::with_capacity(html.len() + 18);
    out.push_str(&html[..start + NEEDLE.len() + close]);
    if !out.ends_with(';') {
        out.push(';');
    }
    out.push_str(&format!("width:{w}px;"));
    out.push_str(&after[close..]);
    out
}

/// Measures the content-sized badge box (width, height).
///
/// The fragment root blockifies at layout root, so an unconstrained viewport
/// (default) makes the blockified flex container shrink-to-fit its content —
/// exactly the intrinsic badge size.
///
/// A `font_family` override shapes measurement too: the injected rule must
/// drive layout or a wider font would render clipped.
pub fn measure_badge(node: &Node, font_family: Option<&str>) -> Result<(u32, u32)> {
    measure_badge_with_fonts(node, bundled_fonts_arc(), font_family)
}

/// [`measure_badge`] over an explicit registry — the Google-font path, where
/// the downloaded face must participate in layout.
pub fn measure_badge_with_fonts(
    node: &Node,
    fonts: &Fonts,
    font_family: Option<&str>,
) -> Result<(u32, u32)> {
    let builder = RenderOptions::builder()
        .viewport(Viewport::default())
        .node(node.clone())
        .fonts(fonts);
    // No font → no stylesheet → byte-identical to the legacy measurement path.
    let options = match font_family {
        Some(family) => builder
            .stylesheet(Arc::new(StyleSheet::parse_loosy(&font_override_css(
                family,
            ))))
            .build(),
        None => builder.build(),
    };
    let measured = measure(options).map_err(|e| Error::Render(format!("measure failed: {e:?}")))?;
    Ok((measured.width.ceil() as u32, measured.height.ceil() as u32))
}

fn render_options<'a>(
    node: Node,
    theme: Option<&vexillum_theme::ResolvedTheme>,
    font_family: Option<&str>,
    fonts: &'a Fonts,
    viewport: Viewport,
    time_ms: u64,
) -> RenderOptions<'a> {
    let sheet = StyleSheet::parse_loosy(&stylesheet_css(theme, font_family));
    RenderOptions::builder()
        .viewport(viewport)
        .node(node)
        .fonts(fonts)
        .stylesheet(Arc::new(sheet))
        .time_ms(time_ms)
        .build()
}

/// The raster viewport. takumi's `Viewport::size` is in DEVICE pixels —
/// `device_pixel_ratio` only converts CSS-px style values (`font-size`,
/// borders, …) — so scaled renders must multiply the measured CSS-px box by
/// the DPR here. Passing the CSS-px size alongside a DPR > 1 laid the badge
/// out 1× inside a 1× canvas while painting text 3× — scaled PNG/WebP/JPEG
/// came out mis-sized with text missing.
fn viewport_for(size: (u32, u32), scale: Scale) -> Viewport {
    let s = scale.as_f32();
    Viewport::new((
        (size.0 as f32 * s).round() as u32,
        (size.1 as f32 * s).round() as u32,
    ))
    .with_device_pixel_ratio(s)
}

/// The SVG viewport: CSS px at dpr 1 — vector output scales client-side, so
/// `?scale=` must not re-scale the layout coordinates.
fn svg_viewport(size: (u32, u32)) -> Viewport {
    Viewport::new(size)
}

/// Resolves the effective padding and trim mode for a request.
///
/// `Some(pad)` (explicit `?pad=`) always wins — exact room, never cropped.
/// `None` auto-selects: animated containers keep [`DEFAULT_PAD_PX`] (frames
/// are encoded inside `write_animation` and cannot be cropped afterwards),
/// static output renders with [`AUTO_TRIM_PAD_PX`] and is cropped to the
/// painted bounding box.
fn resolve_pad_trim(request: &RenderRequest) -> (u32, bool) {
    let kinetic = request.format.is_animated()
        && (request.format != Format::WebP || is_animated_variant(&request.variant));
    match request.pad {
        Some(p) => (p, false),
        None if kinetic => (DEFAULT_PAD_PX, false),
        None => (AUTO_TRIM_PAD_PX, true),
    }
}

/// The bounding box of every pixel with `alpha > 0`, as `(x, y, w, h)`, or
/// `None` for a fully transparent bitmap.
fn alpha_bbox(bitmap: &Bitmap) -> Option<(u32, u32, u32, u32)> {
    let (w, h) = (bitmap.width(), bitmap.height());
    let raw = bitmap.as_raw();
    let mut min_x = w;
    let mut min_y = h;
    let mut max_x = 0u32;
    let mut max_y = 0u32;
    let mut any = false;
    for y in 0..h {
        let row = &raw[(y * w * 4) as usize..((y + 1) * w * 4) as usize];
        for x in 0..w {
            if row[(x * 4 + 3) as usize] > 0 {
                any = true;
                if x < min_x {
                    min_x = x;
                }
                if x > max_x {
                    max_x = x;
                }
                min_y = min_y.min(y);
                max_y = max_y.max(y);
            }
        }
    }
    any.then(|| (min_x, min_y, max_x - min_x + 1, max_y - min_y + 1))
}

/// Extracts `x, y, w, h` as a new bitmap.
fn crop_bitmap(bitmap: &Bitmap, (x, y, w, h): (u32, u32, u32, u32)) -> Bitmap {
    let src = bitmap.as_raw();
    let stride = bitmap.width() as usize * 4;
    let mut data = Vec::with_capacity(w as usize * h as usize * 4);
    for row in y..y + h {
        let start = row as usize * stride + x as usize * 4;
        data.extend_from_slice(&src[start..start + w as usize * 4]);
    }
    Bitmap::from_raw(w, h, data).expect("cropped region keeps RGBA length")
}

/// Composites the bitmap over opaque white (JPEG has no alpha channel —
/// encoding RGBA directly would render transparent areas black).
fn flatten_onto_white(bitmap: &Bitmap) -> Bitmap {
    let mut data = bitmap.as_raw().to_vec();
    for px in data.chunks_exact_mut(4) {
        let a = px[3] as u32;
        if a < 255 {
            for c in &mut px[..3] {
                *c = ((*c as u32 * a + 255 * (255 - a)) / 255) as u8;
            }
        }
    }
    Bitmap::from_raw(bitmap.width(), bitmap.height(), data).expect("same RGBA length")
}

/// Rewrites the ROOT `<svg …>` tag's `width`/`height` attributes to
/// `scale ×` their value, leaving the `viewBox` (user-space coordinates)
/// untouched. Vector output stays crisp at any size — this only changes the
/// intrinsic display size, so `<img src="…?format=svg&scale=2">` really is
/// twice as large. Returns the string unchanged when the root tag does not
/// carry numeric `width`/`height`.
fn scale_svg_display_size(svg: &str, scale: f32) -> String {
    if (scale - 1.0).abs() < f32::EPSILON {
        return svg.to_string();
    }
    let Some(tag_end) = svg.find('>') else {
        return svg.to_string();
    };
    let (tag, rest) = svg.split_at(tag_end);
    let rewrite = |tag: &str, attr: &str| -> String {
        let needle = format!("{attr}=\"");
        let Some(i) = tag.find(&needle) else {
            return tag.to_string();
        };
        let after = &tag[i + needle.len()..];
        let Some(j) = after.find('"') else {
            return tag.to_string();
        };
        match after[..j].parse::<f32>() {
            Ok(v) => format!(
                "{}{}\"{}",
                &tag[..i + needle.len()],
                format_num(v * scale),
                &after[j + 1..]
            ),
            Err(_) => tag.to_string(),
        }
    };
    let tag = rewrite(tag, "width");
    let tag = rewrite(&tag, "height");
    format!("{tag}{rest}")
}

/// Formats a float without a trailing `.0` (SVG attribute values).
fn format_num(v: f32) -> String {
    let r = v.round();
    if (v - r).abs() < 0.001 {
        format!("{}", r as u32)
    } else {
        format!("{v:.2}")
    }
}

/// Crops the root `<svg>`'s `viewBox` to `(x, y, w, h)` and sets
/// `width`/`height` to match, trimming transparent margins out of the vector
/// output. Coordinates are in the padded user space the SVG was rendered in.
fn crop_svg_view_box(svg: &str, (x, y, w, h): (u32, u32, u32, u32)) -> String {
    let Some(tag_end) = svg.find('>') else {
        return svg.to_string();
    };
    let (tag, rest) = svg.split_at(tag_end);
    let needle = "viewBox=\"";
    let Some(i) = tag.find(needle) else {
        return svg.to_string();
    };
    let after = &tag[i + needle.len()..];
    let Some(j) = after.find('"') else {
        return svg.to_string();
    };
    let rewritten = format!(
        "{}{} {} {} {}\"{}",
        &tag[..i + needle.len()],
        x,
        y,
        w,
        h,
        &after[j + 1..]
    );
    // width/height must equal the cropped box so the intrinsic size matches
    let rewritten = set_attr(&rewritten, "width", &w.to_string());
    let rewritten = set_attr(&rewritten, "height", &h.to_string());
    format!("{rewritten}{rest}")
}

/// Replaces `attr="…"` in the first (root) tag.
fn set_attr(svg_tag: &str, attr: &str, value: &str) -> String {
    let needle = format!("{attr}=\"");
    let Some(i) = svg_tag.find(&needle) else {
        return svg_tag.to_string();
    };
    let after = &svg_tag[i + needle.len()..];
    let Some(j) = after.find('"') else {
        return svg_tag.to_string();
    };
    format!(
        "{}{}\"{}",
        &svg_tag[..i + needle.len()],
        value,
        &after[j + 1..]
    )
}

/// Renders one static frame (SVG string for [`Format::Svg`], raster PNG otherwise).
pub fn render_static_bytes(request: &RenderRequest) -> Result<Vec<u8>> {
    let template = vexillum_templates::lookup(&request.variant)
        .ok_or_else(|| Error::UnknownVariant(request.variant.clone()))?;
    let html = prepare_html(template, request);
    let fonts = resolve_fonts(request)?;
    let node = parse_fragment(&html)?;
    let (w, h) = measure_badge_with_fonts(&node, &fonts, request.font_family.as_deref())?;
    let (pad, trim) = resolve_pad_trim(request);
    let size = (w + pad * 2, h + pad * 2);
    // rendered tree lives inside the padded fit-content wrapper (see
    // [`padded_wrapper_sized`]) so the badge box never stretches and overhangs
    // keep `pad` px of room on every side; the root is snapped to the
    // measured integer width so background geometry resolves integer-exact
    let node = parse_fragment(&padded_wrapper_sized(&html, pad, w))?;

    match request.format {
        Format::Svg => {
            // Auto-trim needs the painted bounding box, which layout
            // measurement cannot know (shadows/overhangs) — rasterize the
            // same tree at 1× and scan alpha.
            let crop = if trim {
                let bitmap = render(render_options(
                    node.clone(),
                    request.theme.as_ref(),
                    request.font_family.as_deref(),
                    &fonts,
                    svg_viewport(size),
                    0,
                ))
                .map_err(|e| Error::Render(format!("svg trim probe failed: {e:?}")))?;
                alpha_bbox(&bitmap)
            } else {
                None
            };
            let builder = SvgOptions::builder()
                .viewport(svg_viewport(size))
                .node(node)
                .fonts(&fonts);
            // SVG themes resolve by textual substitution, so the default path
            // injects no stylesheet at all; the font override is the one
            // feature that needs one here.
            let options = match request.font_family.as_deref() {
                Some(family) => builder
                    .stylesheet(Arc::new(StyleSheet::parse_loosy(&font_override_css(
                        family,
                    ))))
                    .build(),
                None => builder.build(),
            };
            let svg = render_svg(options)
                .map_err(|e| Error::Render(format!("svg render failed: {e:?}")))?;
            let svg = match crop {
                Some(box_) => crop_svg_view_box(&svg, box_),
                None => svg,
            };
            let svg = scale_svg_display_size(&svg, request.scale.as_f32());
            Ok(svg.into_bytes())
        }
        Format::Png => {
            let bitmap = render(render_options(
                node,
                request.theme.as_ref(),
                request.font_family.as_deref(),
                &fonts,
                viewport_for(size, request.scale),
                0,
            ))
            .map_err(|e| Error::Render(format!("png render failed: {e:?}")))?;
            let bitmap = crop_to_bbox(bitmap, trim);
            let mut out = Vec::new();
            write_image(&bitmap, &mut out, OutputFormat::Png)
                .map_err(|e| Error::Render(format!("png encode failed: {e:?}")))?;
            Ok(out)
        }
        // kinetic variants animate WebP too (the format is declared animated
        // via `Format::is_animated`); static variants keep the single-frame
        // lossy path below. NOTE: this guarded arm must precede the
        // unguarded `Format::WebP` static arm so it can ever fire.
        Format::WebP if is_animated_variant(&request.variant) => {
            render_animation_bytes(request, node, size, &fonts)
        }
        Format::WebP => {
            let bitmap = render(render_options(
                node,
                request.theme.as_ref(),
                request.font_family.as_deref(),
                &fonts,
                viewport_for(size, request.scale),
                0,
            ))
            .map_err(|e| Error::Render(format!("webp render failed: {e:?}")))?;
            let bitmap = crop_to_bbox(bitmap, trim);
            let mut out = Vec::new();
            // Lossy WebP is native-only (vexillum); wasm falls back to lossless.
            #[cfg(not(target_arch = "wasm32"))]
            let format = OutputFormat::WebP {
                quality: Quality::new(85),
            };
            #[cfg(target_arch = "wasm32")]
            let format = OutputFormat::WebPLossless;
            write_image(&bitmap, &mut out, format)
                .map_err(|e| Error::Render(format!("webp encode failed: {e:?}")))?;
            Ok(out)
        }
        Format::Jpeg => {
            let bitmap = render(render_options(
                node,
                request.theme.as_ref(),
                request.font_family.as_deref(),
                &fonts,
                viewport_for(size, request.scale),
                0,
            ))
            .map_err(|e| Error::Render(format!("jpeg render failed: {e:?}")))?;
            let bitmap = crop_to_bbox(bitmap, trim);
            let bitmap = flatten_onto_white(&bitmap);
            let mut out = Vec::new();
            write_image(
                &bitmap,
                &mut out,
                OutputFormat::Jpeg {
                    quality: Quality::new(90),
                },
            )
            .map_err(|e| Error::Render(format!("jpeg encode failed: {e:?}")))?;
            Ok(out)
        }
        Format::Gif | Format::Apng => render_animation_bytes(request, node, size, &fonts),
    }
}

/// Auto-trim post-pass for raster output: crops the rendered bitmap to the
/// painted bounding box. `alpha_bbox` runs on the actual bitmap (whatever
/// its DPR), so the crop is content-exact at every scale.
fn crop_to_bbox(bitmap: Bitmap, trim: bool) -> Bitmap {
    if !trim {
        return bitmap;
    }
    match alpha_bbox(&bitmap) {
        Some(box_) => crop_bitmap(&bitmap, box_),
        None => bitmap,
    }
}

/// Whether the variant ships CSS animations (registry metadata).
fn is_animated_variant(variant: &str) -> bool {
    vexillum_templates::manifest()
        .variant(variant)
        .is_some_and(|m| !m.animations.is_empty())
}

/// Renders the animation timeline for kinetic variants. Static variants
/// produce a single-frame animation (a de-facto still).
///
/// The timeline must be ONE scene spanning the full duration: takumi's
/// animation writer schedules frames across the whole timeline (Σ scene
/// durations) and renders each scene at its LOCAL time (`span.start_ms −
/// scene_start`), ignoring `RenderOptions::time_ms`. Emitting one scene per
/// frame with the absolute time in `time_ms` therefore rendered every frame
/// at ≈ t0 — the encoded GIF/APNG was a frozen still (8 of the 10 golden
/// GIFs used to contain a single unique frame).
fn render_animation_bytes(
    request: &RenderRequest,
    node: Node,
    size: (u32, u32),
    fonts: &Fonts,
) -> Result<Vec<u8>> {
    let meta = vexillum_templates::manifest()
        .variant(&request.variant)
        .ok_or_else(|| Error::UnknownVariant(request.variant.clone()))?;
    let fps = DEFAULT_ANIMATION_FPS.min(50);
    // kinetic variants sweep their full animation timeline; static variants
    // get exactly one frame at the base rate
    let duration_ms = if meta.animations.is_empty() {
        (1000.0 / fps as f64).round() as u32
    } else {
        meta.animations
            .iter()
            .map(|a| a.duration_ms)
            .max()
            .unwrap_or(400)
    };

    let scene = SequentialScene::builder()
        .options(render_options(
            node,
            request.theme.as_ref(),
            request.font_family.as_deref(),
            fonts,
            viewport_for(size, request.scale),
            0,
        ))
        .duration_ms(duration_ms)
        .build();

    let mut out = Vec::new();
    match request.format {
        Format::Gif => write_animation(
            &[scene],
            fps,
            AnimationFormat::Gif(AnimatedGifOptions::default()),
            &mut out,
        ),
        Format::Apng => write_animation(
            &[scene],
            fps,
            AnimationFormat::Apng(AnimatedPngOptions::default()),
            &mut out,
        ),
        Format::WebP => {
            // lossy animated WebP is native-only (same trade-off as the
            // static path); wasm falls back to lossless
            #[cfg(not(target_arch = "wasm32"))]
            let webp = AnimatedWebpOptions::builder()
                .lossless(false)
                .quality(85)
                .build();
            #[cfg(target_arch = "wasm32")]
            let webp = AnimatedWebpOptions::default();
            write_animation(&[scene], fps, AnimationFormat::WebP(webp), &mut out)
        }
        _ => unreachable!("render_animation_bytes called for static format"),
    }
    .map_err(|e| Error::Render(format!("animation encode failed: {e:?}")))?;
    Ok(out)
}

/// Convenience: escaped text for logging/tests.
pub fn escape_text(s: &str) -> String {
    html_escape(s)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn req(variant: &str, format: Format) -> RenderRequest {
        RenderRequest::new(variant, BadgeData::static_badge("build", "passing"), format)
    }

    fn measure_of(variant: &str, font: Option<&str>) -> (u32, u32) {
        let template = vexillum_templates::lookup(variant).unwrap();
        let mut r = req(variant, Format::Png);
        r.font_family = font.map(str::to_string);
        let html = prepare_html(template, &r);
        let node = parse_fragment(&html).unwrap();
        measure_badge(&node, font).unwrap()
    }

    #[test]
    fn prepares_html_with_escaped_slots() {
        let template = vexillum_templates::lookup("c01-01").unwrap();
        let mut r = req("c01-01", Format::Png);
        r.data = BadgeData::static_badge("a<b", "x&y");
        let html = prepare_html(template, &r);
        assert!(html.contains("a&lt;b"));
        assert!(html.contains("x&amp;y"));
        assert!(!html.contains("__VX_LABEL__"));
    }

    #[test]
    fn default_icon_substituted_when_present() {
        let template = vexillum_templates::lookup("c01-01").unwrap();
        let r = req("c01-01", Format::Png);
        let html = prepare_html(template, &r);
        assert!(html.contains("<svg"), "default icon should be inlined");
        assert!(!html.contains(vexillum_core::ICON_MARKER));
    }

    #[test]
    fn static_renders_strip_animations() {
        let template = vexillum_templates::lookup("c12-02").unwrap(); // kinetic progress
        let r = req("c12-02", Format::Png);
        let html = prepare_html(template, &r);
        assert!(!html.contains("animation:"));
        // animated format keeps them
        let r2 = req("c12-02", Format::Gif);
        let html2 = prepare_html(template, &r2);
        assert!(html2.contains("animation:"));
    }

    #[test]
    fn theme_injection_changes_rendered_pixels() {
        let source = {
            let r = req("c01-07", Format::Png);
            render_static_bytes(&r).expect("source render")
        };
        let themed = {
            let mut r = req("c01-07", Format::Png);
            r.theme = Some(vexillum_theme::preset_theme("rose").unwrap());
            render_static_bytes(&r).expect("themed render")
        };
        assert_ne!(source, themed, "theme must change the rendered output");
        // and the stylesheet carries the tokens
        let css = stylesheet_css(Some(&vexillum_theme::preset_theme("rose").unwrap()), None);
        assert!(css.contains("--value-bg:"));
    }

    #[test]
    fn font_slug_mapping_covers_bundled_families() {
        assert_eq!(font_family_from_slug("inter"), Some("Inter"));
        assert_eq!(
            font_family_from_slug("jetbrains-mono"),
            Some("JetBrains Mono")
        );
        assert_eq!(
            font_family_from_slug("instrument-serif"),
            Some("Instrument Serif")
        );
        assert_eq!(font_family_from_slug("space-mono"), Some("Space Mono"));
        // unknown, empty, and near-miss slugs map to nothing
        assert_eq!(font_family_from_slug("comic-sans"), None);
        assert_eq!(font_family_from_slug(""), None);
        assert_eq!(font_family_from_slug("Inter"), None); // slugs are lowercase
    }

    #[test]
    fn font_stylesheet_merges_and_default_is_unchanged() {
        let theme = vexillum_theme::preset_theme("rose").unwrap();
        // font-only: keyframes are preserved and the override appended
        let font_only = stylesheet_css(None, Some("Space Mono"));
        assert!(font_only.contains("@keyframes"), "keyframes must survive");
        assert!(font_only.contains("* { font-family: \"Space Mono\"; }"));
        // with a theme: tokens + keyframes + font rule all present (merged)
        let both = stylesheet_css(Some(&theme), Some("JetBrains Mono"));
        assert!(both.contains("--value-bg:"), "theme tokens must survive");
        assert!(both.contains("@keyframes"), "keyframes must survive");
        assert!(both.contains("* { font-family: \"JetBrains Mono\"; }"));
        // the legacy default (no theme, no font) is byte-identical to the
        // pre-font string: tokens absent, keyframes only
        assert_eq!(
            stylesheet_css(None, None),
            vexillum_templates::SHARED_KEYFRAMES_CSS
        );
        let tail = stylesheet_css(Some(&theme), None);
        assert_eq!(
            tail,
            format!(
                "{}{}",
                theme.css_root_block(),
                vexillum_templates::SHARED_KEYFRAMES_CSS
            )
        );
    }

    #[test]
    fn font_override_changes_rendered_output() {
        let default_svg = {
            let r = req("c01-01", Format::Svg);
            String::from_utf8(render_static_bytes(&r).unwrap()).unwrap()
        };
        let mono_svg = {
            let mut r = req("c01-01", Format::Svg);
            r.font_family = Some("Space Mono".into());
            String::from_utf8(render_static_bytes(&r).unwrap()).unwrap()
        };
        assert_ne!(
            default_svg, mono_svg,
            "font override must change the SVG bytes"
        );

        let width_of = |s: &str| -> f64 {
            let start = s.find("width=\"").unwrap() + 7;
            let end = s[start..].find('"').unwrap() + start;
            s[start..end].parse().unwrap()
        };
        assert!(
            width_of(&mono_svg) > width_of(&default_svg),
            "Space Mono must measure wider than the default face for c01-01"
        );
    }

    #[test]
    fn font_override_renders_raster_and_gif() {
        for format in [Format::Png, Format::Gif] {
            let mut r = req("c01-01", format);
            r.font_family = Some("Instrument Serif".into());
            let bytes = render_static_bytes(&r).expect("fonted render");
            let magic = match format {
                Format::Png => &bytes[..4] == b"\x89PNG",
                _ => &bytes[..3] == b"GIF",
            };
            assert!(magic, "{format:?} with font override must encode");
        }
        // measurement matches the override (badge grows to fit the new face)
        let default_w = measure_of("c01-01", None);
        let serif_w = measure_of("c01-01", Some("Instrument Serif"));
        assert_ne!(
            default_w.0, serif_w.0,
            "override must change measured width"
        );
    }

    #[test]
    fn renders_png_smoke() {
        let r = req("c01-01", Format::Png);
        let bytes = render_static_bytes(&r).expect("render");
        assert_eq!(&bytes[..4], b"\x89PNG");
        assert!(bytes.len() > 500);
    }

    #[test]
    fn renders_svg_smoke() {
        let r = req("c01-04", Format::Svg);
        let bytes = render_static_bytes(&r).expect("render");
        let s = String::from_utf8(bytes).unwrap();
        assert!(s.contains("<svg"));
    }

    #[test]
    fn renders_gif_smoke() {
        let r = req("c12-02", Format::Gif);
        let bytes = render_static_bytes(&r).expect("render");
        assert_eq!(&bytes[..3], b"GIF");
    }

    #[test]
    fn renders_2x_scale() {
        let mut r = req("c01-01", Format::Png);
        r.scale = Scale::Two;
        let bytes = render_static_bytes(&r).expect("render");
        assert_eq!(&bytes[..4], b"\x89PNG");
    }
}

#[cfg(test)]
mod pad_trim_tests {
    use super::*;

    fn req(variant: &str, format: Format) -> RenderRequest {
        RenderRequest::new(variant, BadgeData::static_badge("build", "passing"), format)
    }

    fn measure_of(variant: &str, font: Option<&str>) -> (u32, u32) {
        let template = vexillum_templates::lookup(variant).unwrap();
        let mut r = req(variant, Format::Png);
        r.font_family = font.map(str::to_string);
        let html = prepare_html(template, &r);
        let node = parse_fragment(&html).unwrap();
        measure_badge(&node, font).unwrap()
    }

    /// Decodes PNG IHDR dimensions (big-endian u32 at bytes 16 and 20).
    fn png_dims(bytes: &[u8]) -> (u32, u32) {
        let be = |i: usize| {
            u32::from_be_bytes(bytes[i..i + 4].try_into().expect("ihdr"))
        };
        (be(16), be(20))
    }

    fn svg_root(svg: &str) -> &str {
        &svg[..svg.find('>').expect("root tag") + 1]
    }

    fn svg_attr<'a>(root: &'a str, attr: &str) -> Option<&'a str> {
        let needle = format!("{attr}=\"");
        let i = root.find(&needle)? + needle.len();
        let rest = &root[i..];
        Some(&rest[..rest.find('"').expect("closed attr")])
    }

    #[test]
    fn auto_trim_tightens_flat_badges() {
        // c01-01 is a flat classic badge: the painted content is the badge
        // box (± a couple of anti-aliasing pixels), so the old fixed 18 px
        // transparent frame around it was pure waste.
        let measured = measure_of("c01-01", None);
        let bytes = render_static_bytes(&req("c01-01", Format::Png)).expect("render");
        let (w, h) = png_dims(&bytes);
        assert!(
            w <= measured.0 + 6 && h <= measured.1 + 6,
            "auto-trim must hug the badge box: measured {measured:?}, got {w}x{h}"
        );
        // and it must not crop INTO the content: the old full-size render
        // (badge + 2×18) is strictly larger
        assert!(w >= measured.0 && h >= measured.1, "content was cropped");
    }

    #[test]
    fn explicit_pad_is_exact_and_uncropped() {
        let mut r = req("c01-01", Format::Png);
        r.pad = Some(7);
        let measured = measure_of("c01-01", None);
        let (w, h) = png_dims(&render_static_bytes(&r).expect("render"));
        assert_eq!(
            (w, h),
            (measured.0 + 14, measured.1 + 14),
            "explicit ?pad= must be exact on every side"
        );
    }

    #[test]
    fn svg_auto_trim_crops_view_box_to_content() {
        let svg = String::from_utf8(render_static_bytes(&req("c01-01", Format::Svg)).unwrap())
            .unwrap();
        let root = svg_root(&svg);
        let view_box = svg_attr(root, "viewBox").expect("viewBox present");
        let nums: Vec<u32> = view_box
            .split(' ')
            .map(|n| n.parse().expect("numeric viewBox"))
            .collect();
        assert_eq!(nums.len(), 4);
        let (w, h) = measure_of("c01-01", None);
        // cropped to painted content (± AA pixels), NOT the padded canvas
        assert!(
            nums[2] <= w + 6 && nums[3] <= h + 6,
            "viewBox must hug content: {view_box} vs badge {w}x{h}"
        );
        assert_eq!(
            svg_attr(root, "width").map(str::to_string),
            Some(nums[2].to_string()),
            "cropped width/height must match the viewBox"
        );
    }

    #[test]
    fn svg_scale_multiplies_display_size_not_coordinates() {
        let root_of = |scale: Scale| {
            let mut r = req("c01-01", Format::Svg);
            r.scale = scale;
            let svg = String::from_utf8(render_static_bytes(&r).unwrap()).unwrap();
            svg_root(&svg).to_string()
        };
        let one = root_of(Scale::One);
        let two = root_of(Scale::Two);
        let w1: f32 = svg_attr(&one, "width").unwrap().parse().unwrap();
        let h1: f32 = svg_attr(&one, "height").unwrap().parse().unwrap();
        let w2: f32 = svg_attr(&two, "width").unwrap().parse().unwrap();
        let h2: f32 = svg_attr(&two, "height").unwrap().parse().unwrap();
        assert!(
            (w2 - 2.0 * w1).abs() < 0.5 && (h2 - 2.0 * h1).abs() < 0.5,
            "scale=2 must double the SVG display size: {w1}x{h1} vs {w2}x{h2}"
        );
        assert_eq!(
            svg_attr(&one, "viewBox"),
            svg_attr(&two, "viewBox"),
            "user-space coordinates must not change with scale"
        );
    }

    #[test]
    fn animated_formats_keep_default_pad_and_do_not_trim() {
        // GIF frames are encoded inside write_animation and cannot be
        // cropped afterwards — the default pad must stay 18 px.
        let r = req("c01-01", Format::Gif);
        assert_eq!(resolve_pad_trim(&r), (DEFAULT_PAD_PX, false));
        // explicit pad wins everywhere
        let mut r = req("c01-01", Format::Gif);
        r.pad = Some(4);
        assert_eq!(resolve_pad_trim(&r), (4, false));
        // static auto → generous room + trim
        assert_eq!(
            resolve_pad_trim(&req("c01-01", Format::Png)),
            (AUTO_TRIM_PAD_PX, true)
        );
        // kinetic variant in WebP → animated path
        assert_eq!(
            resolve_pad_trim(&req("c12-02", Format::WebP)),
            (DEFAULT_PAD_PX, false),
            "c12-02 is kinetic; WebP must take the animation path"
        );
        // static variant in WebP → static path + trim
        assert_eq!(
            resolve_pad_trim(&req("c01-01", Format::WebP)),
            (AUTO_TRIM_PAD_PX, true)
        );
    }

    #[test]
    fn flatten_onto_white_composites_alpha() {
        let bitmap = Bitmap::from_raw(
            2,
            1,
            vec![0, 0, 0, 0, 255, 0, 0, 128], // transparent black, half-alpha red
        )
        .unwrap();
        let flat = flatten_onto_white(&bitmap);
        let raw = flat.as_raw();
        assert_eq!(&raw[..4], &[255, 255, 255, 0], "transparent → white");
        assert_eq!(&raw[4..8], &[255, 127, 127, 128], "half alpha → blended");
    }

    #[test]
    fn alpha_bbox_finds_painted_region() {
        let bitmap = Bitmap::from_raw(
            4,
            3,
            vec![
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, //
                0, 0, 0, 0, 1, 2, 3, 9, 0, 0, 0, 0, 0, 0, 0, 0, //
                0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 7, 0, 0, 0, 0, //
            ],
        )
        .unwrap();
        assert_eq!(alpha_bbox(&bitmap), Some((1, 1, 2, 2)));
        let empty = Bitmap::from_raw(2, 2, vec![0; 16]).unwrap();
        assert_eq!(alpha_bbox(&empty), None);
    }

    #[test]
    fn svg_root_rewrite_is_surgical() {
        let svg = r#"<svg xmlns="http://www.w3.org/2000/svg" width="176" height="60" viewBox="0 0 176 60"><rect width="4" height="4"/></svg>"#;
        // scale doubles ONLY the root display size
        let scaled = scale_svg_display_size(svg, 2.0);
        assert!(scaled.contains(r#"width="352" height="120""#), "{scaled}");
        assert!(scaled.contains(r#"viewBox="0 0 176 60""#), "{scaled}");
        // viewBox crop keeps geometry consistent
        let cropped = crop_svg_view_box(svg, (10, 12, 100, 30));
        assert!(
            cropped.contains(r#"viewBox="10 12 100 30""#)
                && cropped.contains(r#"width="100" height="30""#),
            "{cropped}"
        );
        // malformed input passes through untouched
        assert_eq!(scale_svg_display_size("<div>", 2.0), "<div>");
        assert_eq!(crop_svg_view_box("<svg x=\"1\">", (0, 0, 1, 1)), "<svg x=\"1\">");
    }

    /// The quality gate behind [`AUTO_TRIM_PAD_PX`]: with 32 px of render
    /// room, NO variant's painted content may reach the viewport edge —
    /// anything touching the edge was potentially cut by the canvas, and the
    /// auto-trim crop would silently ship clipped output. Sweeps all 544
    /// variants (their default label/value, themed renders are covered by
    /// the per-variant visual-regression suite).
    #[test]
    fn auto_trim_never_clips() {
        let mut failures: Vec<String> = Vec::new();
        for id in vexillum_templates::ids() {
            let meta = vexillum_templates::manifest().variant(id).unwrap();
            let mut request = RenderRequest::new(
                id,
                BadgeData::static_badge(&meta.default_label, &meta.default_value),
                Format::Png,
            );
            request.pad = Some(AUTO_TRIM_PAD_PX);
            let template = vexillum_templates::lookup(id).unwrap();
            let html = prepare_html(template, &request);
            let Ok(node) = parse_fragment(&html) else {
                failures.push(format!("{id}: parse failed"));
                continue;
            };
            let Ok((w, _h)) = measure_badge(&node, None) else {
                failures.push(format!("{id}: measure failed"));
                continue;
            };
            let size = (w + AUTO_TRIM_PAD_PX * 2, _h + AUTO_TRIM_PAD_PX * 2);
            let Ok(wrapped) = parse_fragment(&padded_wrapper_sized(
                &html,
                AUTO_TRIM_PAD_PX,
                w,
            )) else {
                failures.push(format!("{id}: wrap parse failed"));
                continue;
            };
            let bitmap = match render(render_options(
                wrapped,
                None,
                None,
                &resolve_fonts(&request).unwrap(),
                Viewport::new(size),
                0,
            )) {
                Ok(b) => b,
                Err(e) => {
                    failures.push(format!("{id}: render failed {e:?}"));
                    continue;
                }
            };
            let Some((x, y, bw, bh)) = alpha_bbox(&bitmap) else {
                failures.push(format!("{id}: fully transparent render"));
                continue;
            };
            let margins = (
                x,
                bitmap.width() - x - bw,
                y,
                bitmap.height() - y - bh,
            );
            if margins.0 == 0 || margins.1 == 0 || margins.2 == 0 || margins.3 == 0 {
                failures.push(format!(
                    "{id}: content reaches the generous viewport edge (margins {margins:?}) — raise AUTO_TRIM_PAD_PX"
                ));
            }
        }
        assert!(
            failures.is_empty(),
            "{} variants clip:\n{}",
            failures.len(),
            failures.join("\n")
        );
    }
}

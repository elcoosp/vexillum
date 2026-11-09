//! The all-variants verification gate: every template must render in every
//! supported format family without error, with sane output sizes.

use vexillum_core::{BadgeData, Format, Scale};
use vexillum_render::RenderRequest;

fn req(variant: &str, format: Format) -> RenderRequest {
    let manifest = vexillum_templates::manifest();
    let v = manifest.variant(variant).expect("variant");
    RenderRequest::new(
        variant,
        BadgeData::static_badge(&v.default_label, &v.default_value),
        format,
    )
}

#[test]
fn all_variants_render_png() {
    let manifest = vexillum_templates::manifest();
    let mut failures: Vec<String> = Vec::new();
    for v in &manifest.variants {
        let r = req(&v.id, Format::Png);
        match vexillum_render::render_static_bytes(&r) {
            Ok(bytes) => {
                if bytes.len() < 200 {
                    failures.push(format!(
                        "{}: suspiciously small PNG ({} bytes)",
                        v.id,
                        bytes.len()
                    ));
                }
            }
            Err(e) => failures.push(format!("{}: {e}", v.id)),
        }
    }
    assert!(
        failures.is_empty(),
        "{} failures:\n{}",
        failures.len(),
        failures.join("\n")
    );
}

#[test]
fn sampled_variants_render_svg() {
    // includes both newest collections — SVG output must stay sane there too
    for id in ["c01-01", "c01-13", "c03-02", "c05-01", "c09-07", "c16-16", "c33-01", "c33-16", "c34-01", "c34-16"] {
        let r = req(id, Format::Svg);
        let bytes =
            vexillum_render::render_static_bytes(&r).unwrap_or_else(|e| panic!("{id}: {e}"));
        let s = String::from_utf8(bytes).expect("utf8 svg");
        assert!(s.contains("<svg"), "{id}: not an svg");
        assert!(!s.contains("__VX_"), "{id}: unresolved slot marker leaked");
    }
}

#[test]
fn kinetic_variants_render_gif_with_multiple_frames() {
    let manifest = vexillum_templates::manifest();
    let animated: Vec<_> = manifest
        .variants
        .iter()
        .filter(|v| v.is_animated())
        .collect();
    assert!(!animated.is_empty(), "expected kinetic variants");
    for v in animated {
        let r = req(&v.id, Format::Gif);
        let bytes =
            vexillum_render::render_static_bytes(&r).unwrap_or_else(|e| panic!("{}: {e}", v.id));
        assert_eq!(&bytes[..3], b"GIF", "{}: not a gif", v.id);
    }
}

#[test]
fn all_formats_smoke_on_showcase_variant() {
    for format in [
        Format::Svg,
        Format::Png,
        Format::WebP,
        Format::Gif,
        Format::Apng,
        Format::Jpeg,
    ] {
        let r = req("c01-01", format);
        let bytes =
            vexillum_render::render_static_bytes(&r).unwrap_or_else(|e| panic!("{format:?}: {e}"));
        assert!(!bytes.is_empty());
    }
}

/// Decodes a GIF and composites every frame onto the logical canvas.
/// Returns (width, height, canvas snapshots in RGBA).
fn gif_canvases(bytes: &[u8]) -> (u16, u16, Vec<Vec<u8>>) {
    use std::io::Cursor;

    let mut options = gif::DecodeOptions::new();
    options.set_color_output(gif::ColorOutput::RGBA);
    let mut reader = options
        .read_info(Cursor::new(bytes))
        .expect("valid gif stream");
    let (width, height) = (reader.width(), reader.height());
    let stride = width as usize * 4;
    let mut canvas = vec![0u8; stride * height as usize];
    let mut frames = Vec::new();
    while let Some(frame) = reader.read_next_frame().expect("gif frame") {
        let (fw, fh) = (frame.width as usize, frame.height as usize);
        let (lx, ly) = (frame.left as usize, frame.top as usize);
        for y in 0..fh {
            for x in 0..fw {
                let src = (y * fw + x) * 4;
                let dst = (ly + y) * stride + (lx + x) * 4;
                canvas[dst..dst + 4].copy_from_slice(&frame.buffer[src..src + 4]);
            }
        }
        frames.push(canvas.clone());
        if frame.dispose == gif::DisposalMethod::Background {
            for y in 0..fh {
                for x in 0..fw {
                    let dst = (ly + y) * stride + (lx + x) * 4;
                    canvas[dst..dst + 4].copy_from_slice(&[0, 0, 0, 0]);
                }
            }
        }
    }
    (width, height, frames)
}

/// The animation timeline must actually PROGRESS: the regression guard for
/// the frozen-GIF bug (per-frame scenes rendered at local time ≈ t0 produced
/// N identical frames — 8 of the 10 golden GIFs had exactly one unique frame).
#[test]
fn animated_gif_frames_actually_progress() {
    let unique = |bytes: &[u8]| -> (usize, usize) {
        let (_, _, frames) = gif_canvases(bytes);
        let mut seen = std::collections::HashSet::new();
        for f in &frames {
            seen.insert(f.clone());
        }
        (frames.len(), seen.len())
    };

    // spin, 800 ms @ 12 fps → 10 frames, all visibly different angles
    let (total, uniq) =
        unique(&vexillum_render::render_static_bytes(&req("c12-03", Format::Gif)).unwrap());
    assert!(total >= 8, "c12-03 spin: expected ≥8 frames, got {total}");
    assert!(
        uniq >= 3,
        "c12-03 spin: frames are frozen (only {uniq} unique of {total})"
    );

    // marquee, 8 s @ 12 fps → 96 frames sweeping the full timeline
    let (total, uniq) =
        unique(&vexillum_render::render_static_bytes(&req("c12-04", Format::Gif)).unwrap());
    assert!(
        total >= 48,
        "c12-04 marquee: expected ≥48 frames, got {total}"
    );
    assert!(
        uniq >= 24,
        "c12-04 marquee: frames are frozen (only {uniq} unique of {total})"
    );

    // a static variant encodes a single-frame (de-facto still) GIF
    let (total, uniq) =
        unique(&vexillum_render::render_static_bytes(&req("c01-01", Format::Gif)).unwrap());
    assert_eq!(
        total, 1,
        "static variant must encode exactly 1 frame, got {total}"
    );
    assert_eq!(uniq, 1);
}

/// APNG frames the full timeline too (same scheduling path as GIF), and
/// kinetic WebP is genuinely animated while static WebP stays single-frame.
#[test]
fn apng_and_webp_animation_containers_are_correct() {
    // APNG: one fcTL chunk per animation frame (10 for an 800 ms spin @12 fps)
    let bytes = vexillum_render::render_static_bytes(&req("c12-03", Format::Apng)).unwrap();
    assert_eq!(&bytes[..8], b"\x89PNG\r\n\x1a\n", "not a png");
    let fctl = bytes.windows(4).filter(|w| *w == *b"fcTL").count();
    assert!(
        fctl >= 8,
        "c12-03 apng: expected ≥8 animation frames, got {fctl}"
    );

    // kinetic WebP → animated container (ANIM chunk)
    let bytes = vexillum_render::render_static_bytes(&req("c12-03", Format::WebP)).unwrap();
    assert!(bytes.starts_with(b"RIFF"), "not a webp");
    assert!(
        bytes.windows(4).any(|w| *w == *b"ANIM"),
        "kinetic webp must be animated"
    );

    // static WebP keeps the plain single-frame container (no ANIM chunk)
    let bytes = vexillum_render::render_static_bytes(&req("c01-01", Format::WebP)).unwrap();
    assert!(bytes.starts_with(b"RIFF"), "not a webp");
    assert!(
        !bytes.windows(4).any(|w| *w == *b"ANIM"),
        "static webp must not be animated"
    );
}

#[test]
fn scale_2x_and_3x_render() {
    for scale in [Scale::Two, Scale::Three] {
        let mut r = req("c01-01", Format::Png);
        r.scale = scale;
        let bytes = vexillum_render::render_static_bytes(&r).expect("render");
        assert_eq!(&bytes[..4], b"\x89PNG");
    }
}

#[test]
fn custom_label_changes_width() {
    let short = req("c01-01", Format::Svg);
    let mut long = req("c01-01", Format::Svg);
    long.data = BadgeData::static_badge("an-absurdly-long-label-text", "with-a-long-value-too");
    let short_svg =
        String::from_utf8(vexillum_render::render_static_bytes(&short).unwrap()).unwrap();
    let long_svg = String::from_utf8(vexillum_render::render_static_bytes(&long).unwrap()).unwrap();
    let width_of = |s: &str| -> f64 {
        // viewBox width attribute
        let start = s.find("width=\"").unwrap() + 7;
        let end = s[start..].find('"').unwrap() + start;
        s[start..end].parse().unwrap()
    };
    assert!(
        width_of(&long_svg) > width_of(&short_svg),
        "longer text must widen the badge"
    );
}

#[test]
fn text_slots_accept_user_content() {
    let mut r = req("c01-01", Format::Png);
    r.data = BadgeData::static_badge("custom label", "42");
    let bytes = vexillum_render::render_static_bytes(&r).expect("render");
    assert_eq!(&bytes[..4], b"\x89PNG");
    // injection attempts must not panic nor produce markup
    let mut r = req("c01-01", Format::Svg);
    r.data = BadgeData::static_badge("<script>alert(1)</script>", "x");
    let svg = String::from_utf8(vexillum_render::render_static_bytes(&r).unwrap()).unwrap();
    assert!(!svg.contains("<script>"));
}

#[test]
fn themed_gradient_variants_respond_to_theme_tokens() {
    use vexillum_theme::ResolvedTheme;

    // c04-07 is a two-stop gradient value segment (now semantic tokens:
    // var(--vx-*, baked default-seed fallbacks))
    let manifest = vexillum_templates::manifest();
    let v = manifest.variant("c04-07").expect("c04-07");
    let render_with = |theme: Option<ResolvedTheme>| -> String {
        let r = RenderRequest {
            theme,
            ..RenderRequest::new(
                "c04-07",
                BadgeData::static_badge(&v.default_label, &v.default_value),
                Format::Svg,
            )
        };
        let bytes =
            vexillum_render::render_static_bytes(&r).unwrap_or_else(|e| panic!("render: {e}"));
        String::from_utf8(bytes).expect("utf8 svg")
    };

    let source = render_with(None);
    let blue = render_with(Some(vexillum_theme::preset_theme("blue").unwrap()));
    let rose = render_with(Some(vexillum_theme::preset_theme("rose").unwrap()));

    // themed renders resolve the ramp and differ from source AND from each
    // other (seed-driven)
    assert_ne!(
        source, blue,
        "blue theme had no effect on a gradient variant"
    );
    assert_ne!(
        source, rose,
        "rose theme had no effect on a gradient variant"
    );
    assert_ne!(blue, rose, "blue and rose themed renders are identical");
}

#[test]
fn seed_and_dark_mode_drive_the_render() {
    use vexillum_theme::{Mode, semantic_theme};

    let render_with = |theme: Option<vexillum_theme::ResolvedTheme>| -> String {
        let r = RenderRequest {
            theme,
            ..RenderRequest::new(
                "c01-02",
                BadgeData::static_badge("build", "passing"),
                Format::Svg,
            )
        };
        String::from_utf8(vexillum_render::render_static_bytes(&r).unwrap()).unwrap()
    };

    // Mean relative luminance of every solid fill in the SVG — a robust,
    // serialization-agnostic darkness measure.
    let mean_fill_luminance = |svg: &str| -> f64 {
        let mut sum = 0.0;
        let mut n = 0usize;
        let bytes = svg.as_bytes();
        let mut i = 0usize;
        while let Some(pos) = svg[i..].find("fill=\"#") {
            let start = i + pos + 7;
            if start + 6 <= bytes.len() {
                let hex = &svg[start..start + 6];
                if hex.chars().all(|c| c.is_ascii_hexdigit()) {
                    let r = u8::from_str_radix(&hex[0..2], 16).unwrap_or(0) as f64 / 255.0;
                    let g = u8::from_str_radix(&hex[2..4], 16).unwrap_or(0) as f64 / 255.0;
                    let b = u8::from_str_radix(&hex[4..6], 16).unwrap_or(0) as f64 / 255.0;
                    sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
                    n += 1;
                }
            }
            i = start;
        }
        if n == 0 { 1.0 } else { sum / n as f64 }
    };

    let source = render_with(None);
    let seed = vexillum_theme::parse_seed("#ec4899").unwrap();
    let light = render_with(None);
    let themed_light = render_with(Some(semantic_theme(&seed, Mode::Light, "test")));
    let dark = render_with(Some(semantic_theme(&seed, Mode::Dark, "test")));
    let other_seed = render_with(Some(semantic_theme(
        &vexillum_theme::parse_seed("#22c55e").unwrap(),
        Mode::Light,
        "t2",
    )));

    assert_ne!(source, themed_light, "seed theme had no effect");
    assert_ne!(themed_light, dark, "mode must flip surfaces");
    assert_ne!(themed_light, other_seed, "seed must drive the accent");
    assert!(
        mean_fill_luminance(&dark) < mean_fill_luminance(&light),
        "dark render must be darker than the light render"
    );
}

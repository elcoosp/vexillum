//! Probes output padding/transparency/scale behavior:
//!   1. PNG output dimensions (auto-trim vs explicit pad)
//!   2. JPEG background (alpha handling)
//!   3. SVG root tag with scale (does ?scale= change the SVG display size?)
use takumi::render;
use vexillum_core::{BadgeData, Format, Scale};
use vexillum_render::RenderRequest as RR;

fn req(id: &str, format: Format) -> RR {
    let meta = vexillum_templates::manifest().variant(id).unwrap();
    RR::new(
        id.to_string(),
        BadgeData::static_badge(&meta.default_label, &meta.default_value),
        format,
    )
}

/// Decodes PNG IHDR (bytes 16..24: width, height big-endian).
fn png_dims(bytes: &[u8]) -> (u32, u32) {
    let be = |i: usize| u32::from_be_bytes(bytes[i..i + 4].try_into().unwrap());
    (be(16), be(20))
}

fn main() {
    for id in ["c01-01", "c29-01"] {
        let auto = vexillum_render::render_static_bytes(&req(id, Format::Png)).unwrap();
        let mut explicit = req(id, Format::Png);
        explicit.pad = Some(6);
        let explicit = vexillum_render::render_static_bytes(&explicit).unwrap();
        let badge = {
            let template = vexillum_templates::lookup(id).unwrap();
            let html = vexillum_render::prepare_html(template, &req(id, Format::Png));
            let node = vexillum_render::parse_fragment(&html).unwrap();
            vexillum_render::measure_badge(&node, None).unwrap()
        };
        println!(
            "{id} badge={badge:?} auto_trim={:?} explicit_pad6={:?}",
            png_dims(&auto),
            png_dims(&explicit)
        );
    }

    // JPEG background check (should now flatten onto white, no black corners)
    let jpeg = vexillum_render::render_static_bytes(&req("c01-01", Format::Jpeg)).unwrap();
    println!("jpeg bytes: {} (first={:?})", jpeg.len(), &jpeg[..3]);

    // SVG scale: root width/height must scale, viewBox stays user-space
    for scale in [Scale::One, Scale::Two, Scale::Three] {
        let mut r = req("c01-01", Format::Svg);
        r.scale = scale;
        let bytes = vexillum_render::render_static_bytes(&r).unwrap();
        let s = String::from_utf8(bytes).unwrap();
        let root_end = s.find('>').unwrap_or(0);
        println!("svg scale={:?} root: {}", scale.as_f32(), &s[..root_end + 1]);
    }

    let _ = render;
}

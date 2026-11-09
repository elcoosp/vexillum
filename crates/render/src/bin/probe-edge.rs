//! Renders c02-02 (Overlapping seal) + a few decoration-heavy variants as PNG
//! and reports the opaque extents so left/top/right/bottom clipping is visible.
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn probe(id: &str, format: Format) {
    let meta = vexillum_templates::manifest().variant(id).unwrap();
    let req = RR::new(
        id.to_string(),
        BadgeData::static_badge(&meta.default_label, &meta.default_value),
        format,
    );
    match vexillum_render::render_static_bytes(&req) {
        Ok(bytes) => {
            let path = format!(
                "/tmp/probe-{id}.{}",
                if format == Format::Svg { "svg" } else { "png" }
            );
            std::fs::write(&path, &bytes).unwrap();
            println!("{id} -> {path} ({} bytes)", bytes.len());
        }
        Err(e) => println!("{id}: ERROR {e}"),
    }
}

fn main() {
    for id in ["c02-02", "c02-15", "c02-07", "c04-10", "c03-06"] {
        probe(id, Format::Png);
    }
    probe("c02-02", Format::Svg);
}

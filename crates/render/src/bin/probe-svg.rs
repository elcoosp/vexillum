//! Renders one variant as SVG text for geometry inspection.
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let id = args.get(1).cloned().unwrap_or_else(|| "c17-05".into());
    let out = args
        .get(2)
        .cloned()
        .unwrap_or_else(|| format!("/tmp/probe-{id}.svg"));
    let meta = vexillum_templates::manifest().variant(&id).unwrap();
    let req = RR::new(
        id.clone(),
        BadgeData::static_badge(&meta.default_label, &meta.default_value),
        Format::Svg,
    );
    match vexillum_render::render_static_bytes(&req) {
        Ok(bytes) => {
            std::fs::write(&out, &bytes).unwrap();
            println!("{id} -> {out} ({} bytes)", bytes.len());
        }
        Err(e) => println!("{id}: ERROR {e:?}"),
    }
}

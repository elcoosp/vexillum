//! Renders one variant's GIF timeline for animation debugging.
//! Usage: probe-anim <variant> [out.gif] [scale]
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let id = args.get(1).cloned().unwrap_or_else(|| "c12-15".into());
    let out = args
        .get(2)
        .cloned()
        .unwrap_or_else(|| format!("/tmp/anim-{id}.gif"));
    let scale = args.get(3).map(|s| s.as_str()).unwrap_or("3");
    let meta = vexillum_templates::manifest().variant(&id).unwrap();
    let mut req = RenderRequest::new(
        id.clone(),
        BadgeData::static_badge(&meta.default_label, &meta.default_value),
        Format::Gif,
    );
    req.scale = scale
        .parse()
        .ok()
        .and_then(|s: u32| match s {
            2 => Some(vexillum_core::Scale::Two),
            3 => Some(vexillum_core::Scale::Three),
            _ => Some(vexillum_core::Scale::One),
        })
        .unwrap_or(vexillum_core::Scale::One);
    let template = vexillum_templates::lookup(&id).unwrap();
    let debug_html = vexillum_render::prepare_html(template, &req);
    std::fs::write("/tmp/anim-debug.html", &debug_html).unwrap();
    match vexillum_render::render_static_bytes(&req) {
        Ok(bytes) => {
            std::fs::write(&out, &bytes).unwrap();
            println!("{id} -> {out} ({} bytes)", bytes.len());
        }
        Err(e) => println!("{id}: ERROR {e:?}"),
    }
}

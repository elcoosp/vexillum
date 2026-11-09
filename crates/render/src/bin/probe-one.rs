//! Renders one variant PNG for direct inspection.
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let id = args.get(1).cloned().unwrap_or_else(|| "c17-01".into());
    let scale = args.get(2).map(|s| s.as_str()).unwrap_or("3");
    let out = args
        .get(2)
        .cloned()
        .unwrap_or_else(|| format!("/tmp/probe-{id}.png"));
    let out = if out.ends_with(".png") {
        out
    } else {
        format!("/tmp/probe-{id}.png")
    };
    let meta = vexillum_templates::manifest().variant(&id).unwrap();
    let mut req = RR::new(
        id.clone(),
        BadgeData::static_badge(&meta.default_label, &meta.default_value),
        Format::Png,
    );
    if let Some(seed) = args.get(4) {
        let parsed = vexillum_theme::parse_seed(seed).expect("seed");
        let theme = match args.get(5) {
            Some(vseed) => {
                let vparsed = vexillum_theme::parse_seed(vseed).expect("vseed");
                vexillum_theme::semantic_theme_duo(&parsed, &vparsed, vexillum_theme::Mode::Light, "probe")
            }
            None => vexillum_theme::semantic_theme(&parsed, vexillum_theme::Mode::Light, "probe"),
        };
        req.theme = Some(theme);
    }
    req.scale = scale
        .parse()
        .map(|s| match s {
            2 => vexillum_core::Scale::Two,
            3 => vexillum_core::Scale::Three,
            _ => vexillum_core::Scale::One,
        })
        .unwrap_or(vexillum_core::Scale::One);
    match vexillum_render::render_static_bytes(&req) {
        Ok(bytes) => {
            std::fs::write(&out, &bytes).unwrap();
            println!("{id} -> {out} ({} bytes)", bytes.len());
        }
        Err(e) => println!("{id}: ERROR {e:?}"),
    }
}

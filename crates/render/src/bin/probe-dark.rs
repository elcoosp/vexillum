//! Renders every c16 (Minimal) variant + a few others in dark semantic mode
//! and reports pixel statistics so white-on-white is visible per badge.
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn render_one(id: &str, dark: bool) -> Option<Vec<u8>> {
    let meta = vexillum_templates::manifest().variant(id)?;
    let mut req = RR::new(
        id.to_string(),
        BadgeData::static_badge(&meta.default_label, &meta.default_value),
        Format::Png,
    );
    if dark {
        let seed = vexillum_theme::parse_seed(vexillum_theme::semantic::DEFAULT_SEED).unwrap();
        req.theme = Some(vexillum_theme::semantic_theme(
            &seed,
            vexillum_theme::Mode::Dark,
            "probe",
        ));
    }
    vexillum_render::render_static_bytes(&req).ok()
}

fn main() {
    let manifest = vexillum_templates::manifest();
    let ids: Vec<String> = manifest
        .variants_of("c16")
        .into_iter()
        .map(|v| v.id.clone())
        .collect();
    for id in &ids {
        let Some(bytes) = render_one(id, true) else {
            println!("{id}: RENDER FAILED");
            continue;
        };
        let path = format!("/tmp/dark-{id}.png");
        std::fs::write(&path, &bytes).unwrap();
        println!("{id} -> {path} ({} bytes)", bytes.len());
    }
}

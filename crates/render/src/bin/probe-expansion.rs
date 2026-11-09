//! Renders every Expansion II variant (c17-01 … c32-16) as PNG into
//! /home/z/my-project/download/eyeball/<collection>/ for visual inspection,
//! and composes per-collection contact sheets (4×4 grids) via pure-PNG
//! stitching in Python afterwards.
//!
//! Usage: cargo run -p vexillum-render --bin probe-expansion [-- <seed> <mode>]
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let seed = args.get(1).map(|s| s.as_str()).unwrap_or("");
    let mode = args.get(2).map(|s| s.as_str()).unwrap_or("");

    let manifest = vexillum_templates::manifest();
    let base = "/home/z/my-project/download/eyeball";
    std::fs::create_dir_all(base).unwrap();

    let mut ok = 0usize;
    let mut failed = Vec::new();
    for c in 17..=32 {
        let dir = format!("{base}/c{c:02}");
        std::fs::create_dir_all(&dir).unwrap();
        for i in 1..=16 {
            let id = format!("c{c:02}-{i:02}");
            let Some(meta) = manifest.variant(&id) else {
                failed.push((id.clone(), "missing manifest".into()));
                continue;
            };
            let mut req = RR::new(
                id.clone(),
                BadgeData::static_badge(&meta.default_label, &meta.default_value),
                Format::Png,
            );
            req.scale = vexillum_core::Scale::Three;
            if !seed.is_empty() {
                let parsed = vexillum_theme::semantic::parse_seed(seed).unwrap();
                let m = vexillum_theme::semantic::Mode::parse(mode)
                    .unwrap_or(vexillum_theme::semantic::Mode::Light);
                req.theme = Some(vexillum_theme::semantic::semantic_theme(
                    &parsed, m, "probe",
                ));
            }
            match vexillum_render::render_static_bytes(&req) {
                Ok(bytes) => {
                    std::fs::write(format!("{dir}/{id}.png"), &bytes).unwrap();
                    ok += 1;
                }
                Err(e) => failed.push((id.clone(), format!("{e:?}"))),
            }
        }
    }
    println!("rendered {ok} PNGs; {} failures", failed.len());
    for (id, e) in &failed {
        println!("FAIL {id}: {e}");
    }
}

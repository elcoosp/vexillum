//! Renders every variant as PNG (and animated variants as GIF first frame at
//! several timestamps) into /tmp/vx-sweep for the crop/eyeball pass.
use std::fs;
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn main() {
    let out_dir = "/tmp/vx-sweep";
    fs::create_dir_all(out_dir).unwrap();
    let manifest = vexillum_templates::manifest();
    let mut count = 0;
    let mut failures = Vec::new();
    for meta in manifest.variants.iter() {
        let req = RR::new(
            meta.id.clone(),
            BadgeData::static_badge(&meta.default_label, &meta.default_value),
            Format::Png,
        );
        match vexillum_render::render_static_bytes(&req) {
            Ok(bytes) => {
                fs::write(format!("{out_dir}/{}.png", meta.id), bytes).unwrap();
                count += 1;
            }
            Err(e) => failures.push(format!("{}: {e}", meta.id)),
        }
        if !meta.animations.is_empty() {
            let req = RR::new(
                meta.id.clone(),
                BadgeData::static_badge(&meta.default_label, &meta.default_value),
                Format::Gif,
            );
            match vexillum_render::render_static_bytes(&req) {
                Ok(bytes) => {
                    fs::write(format!("{out_dir}/{}.gif", meta.id), bytes).unwrap();
                }
                Err(e) => failures.push(format!("{} (gif): {e}", meta.id)),
            }
        }
    }
    println!("rendered {count} PNGs; failures: {}", failures.len());
    for f in &failures {
        println!("  FAIL {f}");
    }
}

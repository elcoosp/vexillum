//! Renders the c29 ticket collection across many label/value lengths so the
//! end-cap seam (the "white stripe before the hole") can be pixel-audited at
//! every badge width the content can produce.

use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn main() {
    let out_dir = "/tmp/ticket-sweep";
    std::fs::create_dir_all(out_dir).unwrap();

    let labels = ["ok", "build", "status", "deploy", "coverage", "tests", "integration"];
    let values = ["1", "42", "passing", "v2.18.1", "98.4%", "main", "failed"];

    let manifest = vexillum_templates::manifest();
    let mut rendered = 0usize;
    let mut failed = 0usize;
    for meta in manifest.variants.iter() {
        if !meta.id.starts_with("c29-") {
            continue;
        }
        for (li, label) in labels.iter().enumerate() {
            for (vi, value) in values.iter().enumerate() {
                // 1x: the position-flooring seam reproduces at CSS-px scale
                // (the audit script's hole-width constants assume 1x too)
                let req = RR::new(
                    meta.id.clone(),
                    BadgeData::static_badge(*label, *value),
                    Format::Png,
                );
                let path = format!("{out_dir}/{}-{}-{}.png", meta.id, li, vi);
                match vexillum_render::render_static_bytes(&req) {
                    Ok(bytes) => {
                        std::fs::write(&path, bytes).unwrap();
                        rendered += 1;
                    }
                    Err(e) => {
                        eprintln!("{path}: {e}");
                        failed += 1;
                    }
                }
            }
        }
    }
    println!("rendered {rendered}, failed {failed}");
}

//! Golden image generation: renders every variant (PNG @1x; animated
//! variants as GIF timelines) for CI visual regression.

use std::path::PathBuf;

use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = std::env::args()
        .nth(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("scripts/golden"));
    std::fs::create_dir_all(&out_dir)?;

    let manifest = vexillum_templates::manifest();
    let mut rendered = 0usize;
    let mut failed: Vec<String> = Vec::new();
    let t0 = std::time::Instant::now();

    for v in &manifest.variants {
        let data = BadgeData::static_badge(&v.default_label, &v.default_value);
        let mut request = RenderRequest::new(&v.id, data, Format::Png);
        if v.is_animated() {
            request.format = Format::Gif;
        }
        match vexillum_render::render_static_bytes(&request) {
            Ok(bytes) => {
                let ext = if v.is_animated() { "gif" } else { "png" };
                std::fs::write(out_dir.join(format!("{}.{}", v.id, ext)), bytes)?;
                rendered += 1;
            }
            Err(e) => failed.push(format!("{}: {e}", v.id)),
        }
    }

    let elapsed = t0.elapsed();
    println!(
        "rendered {rendered}/{} variants in {elapsed:.1?}",
        manifest.variants.len()
    );
    if !failed.is_empty() {
        eprintln!("FAILED {}:", failed.len());
        for f in &failed {
            eprintln!("  {f}");
        }
        std::process::exit(1);
    }
    Ok(())
}

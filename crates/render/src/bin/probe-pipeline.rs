//! Dumps the exact HTML that render_static_bytes feeds to takumi, then
//! renders it through the same viewport math — bisects pipeline vs content.
use takumi::prelude::*;
use takumi::{render, write_image};
use vexillum_core::{BadgeData, Format};
use vexillum_render::RenderRequest as RR;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let id = args.get(1).cloned().unwrap_or_else(|| "c04-15".into());
    let scale: f32 = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(3.0);

    let meta = vexillum_templates::manifest().variant(&id).unwrap();
    let label = args.get(3).cloned().unwrap_or_else(|| meta.default_label.clone());
    let value = args.get(4).cloned().unwrap_or_else(|| meta.default_value.clone());
    let mut req = RR::new(
        id.clone(),
        BadgeData::static_badge(&label, &value),
        Format::Png,
    );
    req.scale = vexillum_core::Scale::Three;
    req.scale = if scale == 1.0 {
        vexillum_core::Scale::One
    } else {
        vexillum_core::Scale::Three
    };

    // replicate prepare_html with theme = None (probe-one default path)
    let template = vexillum_templates::lookup(&id).unwrap();
    let html = vexillum_render::prepare_html(template, &req);
    std::fs::write(format!("/tmp/pipeline-{id}.html"), &html).unwrap();
    println!("html dumped -> /tmp/pipeline-{id}.html ({} bytes)", html.len());

    // now render exactly like render_static_bytes
    let fonts = vexillum_render::bundled_fonts_arc();
    let node = takumi::from_html(&html, FromHtmlOptions::default()).unwrap();
    let (w, h) = if std::env::var("PROBE_NO_MEASURE").is_ok() {
        (160, 28) // skip the measure pass entirely
    } else {
        vexillum_render::measure_badge_with_fonts(&node, &fonts, None).unwrap()
    };
    println!("measured {w}x{h}");
    let wrapped = vexillum_render::padded_wrapper(&html, 18);
    let node2 = takumi::from_html(&wrapped, FromHtmlOptions::default()).unwrap();
    // optional: oversized viewport flag to test constraint-dependent behavior
    let big_viewport = std::env::var("PROBE_BIG_VIEWPORT").is_ok();
    let (vw, vh) = if big_viewport { (600, 400) } else { (w + 36, h + 36) };
    let builder = RenderOptions::builder()
        .viewport(
            Viewport::new((
                (vw as f32 * scale).round() as u32,
                (vh as f32 * scale).round() as u32,
            ))
            .with_device_pixel_ratio(scale),
        )
        .node(node2)
        .fonts(fonts);
    let options = if std::env::var("PROBE_STYLESHEET").is_ok() {
        let css = format!(
            "@keyframes vx-rot {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}\n{}",
            vexillum_templates::SHARED_KEYFRAMES_CSS
        );
        builder.stylesheet(std::sync::Arc::new(takumi::prelude::StyleSheet::parse_loosy(&css)))
            .build()
    } else {
        builder.build()
    };
    let bitmap = render(options).expect("render");
    let mut bytes = Vec::new();
    write_image(&bitmap, &mut bytes, OutputFormat::Png).expect("encode");
    let out = format!("/tmp/pipeline-{id}.png");
    std::fs::write(&out, &bytes).unwrap();
    println!("-> {out}");
}

//! Renders raw HTML fragments to PNG — minimal repro harness for engine bugs.
use takumi::prelude::*;
use takumi::{from_html, render, write_image};

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let html = std::fs::read_to_string(args.get(1).expect("html file")).unwrap();
    let out = args
        .get(2)
        .cloned()
        .unwrap_or_else(|| "/tmp/probe-html.png".into());
    // optional third arg: device pixel ratio (default 1)
    let dpr: f32 = args.get(3).and_then(|s| s.parse().ok()).unwrap_or(1.0);

    let node = from_html(&html, FromHtmlOptions::default()).expect("parse");
    let fonts = vexillum_render::bundled_fonts_arc();
    let options = RenderOptions::builder()
        .viewport(
            Viewport::new((
                (600.0 * dpr).round() as u32,
                (400.0 * dpr).round() as u32,
            ))
            .with_device_pixel_ratio(dpr),
        )
        .node(node)
        .fonts(fonts)
        .build();
    let bitmap = render(options).expect("render");
    let mut bytes = Vec::new();
    write_image(&bitmap, &mut bytes, OutputFormat::Png).expect("encode");
    std::fs::write(&out, &bytes).unwrap();
    println!("-> {out} ({} bytes)", bytes.len());
}

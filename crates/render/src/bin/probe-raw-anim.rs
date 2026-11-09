//! Renders a raw HTML fragment to an animated GIF — minimal repro harness for
//! animation-engine bugs. Injects the shared keyframes stylesheet like the
//! real pipeline does.
//! Usage: probe-raw-anim <html-file> <out.gif> [scene-ms] [dpr]
use takumi::prelude::*;
use takumi::{from_html, write_animation};
use std::sync::Arc;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let html = std::fs::read_to_string(args.get(1).expect("html file")).unwrap();
    let out = args.get(2).cloned().unwrap_or("/tmp/raw-anim.gif".into());
    let scene_ms: u32 = args
        .get(3)
        .and_then(|s| s.parse().ok())
        .unwrap_or(2000);
    let dpr: f32 = args
        .get(4)
        .and_then(|s| s.parse().ok())
        .unwrap_or(1.0);
    // "tight" = replicate the real pipeline: measure, inject root width,
    // padded wrapper, tight viewport.
    let tight = args.get(5).map(|s| s == "tight").unwrap_or(false);

    let fonts = vexillum_render::bundled_fonts_arc();
    let html = if tight {
        let node = vexillum_render::parse_fragment(&html).expect("parse");
        let (w, h) = vexillum_render::measure_badge_with_fonts(&node, &fonts, None).expect("measure");
        println!("measured {w}x{h}");
        vexillum_render::padded_wrapper_sized(&html, 18, w)
    } else {
        html
    };

    let node = from_html(&html, FromHtmlOptions::default()).expect("parse");
    let sheet = StyleSheet::parse_loosy(vexillum_templates::SHARED_KEYFRAMES_CSS);
    let options = RenderOptions::builder()
        .viewport(if tight {
            let node2 = from_html(&html, FromHtmlOptions::default()).expect("parse2");
            let (w, h) =
                vexillum_render::measure_badge_with_fonts(&node2, &fonts, None).expect("measure2");
            Viewport::new(((w as f32) as u32, (h as f32) as u32))
                .with_device_pixel_ratio(dpr)
        } else {
            Viewport::new(((240.0 * dpr).round() as u32, (120.0 * dpr).round() as u32))
                .with_device_pixel_ratio(dpr)
        })
        .node(node)
        .fonts(fonts)
        .stylesheet(Arc::new(sheet))
        .time_ms(0)
        .build();
    let scene = SequentialScene::builder()
        .options(options)
        .duration_ms(scene_ms)
        .build();
    let mut bytes = Vec::new();
    write_animation(
        &[scene],
        12,
        AnimationFormat::Gif(AnimatedGifOptions::default()),
        &mut bytes,
    )
    .expect("encode");
    std::fs::write(&out, &bytes).unwrap();
    println!("-> {out} ({} bytes)", bytes.len());
}

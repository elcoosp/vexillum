//! Source-truth renderer: renders the ORIGINAL badge fragments from
//! badge-collections.html through vexillum (fragment + source stylesheet),
//! producing reference PNGs for the converter parity audit.
//!
//! The converted pipeline (render-goldens) renders the generated TSX; the
//! audit (scripts/audit-source-parity.ts) diffs the two render sets, so any
//! decoration the converter dropped shows up as pixel drift.
//!
//! Usage: cargo run -p vexillum-render --bin render-source -- <out-dir> <source-html>

use std::path::PathBuf;
use std::sync::Arc;

use takumi::prelude::*;
use takumi::{from_html, measure, render};

use vexillum_render::fonts::global_fonts;

/// Extracts the `<style>` body from the document head.
fn extract_style(html: &str) -> String {
    let start = html.find("<style>").expect("source has <style>") + "<style>".len();
    let end = html[start..].find("</style>").expect("style closes") + start;
    html[start..end].to_string()
}

/// Strips `animation: …;` declarations so the static reference render shows
/// the at-rest state (mirrors the converted pipeline's static freeze).
fn strip_animations(css: &str) -> String {
    let mut out = String::with_capacity(css.len());
    let mut rest = css;
    while let Some(i) = rest.find("animation:") {
        out.push_str(&rest[..i]);
        let after = &rest[i + "animation:".len()..];
        let end = after.find(';').map(|j| j + 1).unwrap_or(after.len());
        rest = &after[end..];
    }
    out.push_str(rest);
    out
}

/// Extracts one `<div class="badge cXX-YY">…</div>` fragment per variant via
/// balanced div scanning. Returns (id, fragment).
fn extract_fragments(html: &str) -> Vec<(String, String)> {
    let mut out = Vec::new();
    let bytes = html.as_bytes();
    let mut i = 0usize;
    while let Some(pos) = html[i..].find("<div class=\"badge c") {
        let start = i + pos;
        let id_start = start + "<div class=\"badge ".len();
        let id_end = html[id_start..]
            .find('"')
            .map(|j| id_start + j)
            .unwrap_or(id_start);
        let id = html[id_start..id_end].to_string();
        // balanced scan over <div / </div from `start`
        let mut depth = 0usize;
        let mut j = start;
        let mut end = None;
        while j < bytes.len() {
            if html[j..].starts_with("<div") {
                depth += 1;
                j += 4;
            } else if html[j..].starts_with("</div>") {
                depth -= 1;
                j += 6;
                if depth == 0 {
                    end = Some(j);
                    break;
                }
            } else {
                // advance one unicode scalar, not one byte
                j += 1;
                while j < bytes.len() && (bytes[j] & 0xC0) == 0b1000_0000 {
                    j += 1;
                }
            }
        }
        if let Some(end) = end {
            out.push((id, html[start..end].to_string()));
            i = end;
        } else {
            i = start + 10;
        }
    }
    out
}

fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args().skip(1);
    let out_dir = args
        .next()
        .map(PathBuf::from)
        .expect("usage: render-source <out-dir> <source-html>");
    let source_html = args
        .next()
        .expect("usage: render-source <out-dir> <source-html>");
    std::fs::create_dir_all(&out_dir)?;

    let html = std::fs::read_to_string(&source_html)?;
    let css = strip_animations(&extract_style(&html));
    let fragments = extract_fragments(&html);
    let fonts = global_fonts();

    let mut rendered = 0usize;
    let mut failed: Vec<String> = Vec::new();
    let t0 = std::time::Instant::now();

    for (id, fragment) in &fragments {
        let node = match from_html(fragment, FromHtmlOptions::default()) {
            Ok(n) => n,
            Err(e) => {
                failed.push(format!("{id}: from_html {e:?}"));
                continue;
            }
        };
        // unconstrained measure, then render at content box + 8px pad (same
        // geometry the converted pipeline uses)
        let sheet = StyleSheet::parse_loosy(&css);
        let measure_opts = RenderOptions::builder()
            .viewport(Viewport::default())
            .node(node.clone())
            .fonts(fonts)
            .stylesheet(Arc::new(sheet.clone()))
            .build();
        let measured = match measure(measure_opts) {
            Ok(m) => m,
            Err(e) => {
                failed.push(format!("{id}: measure {e:?}"));
                continue;
            }
        };
        // render-goldens geometry: content box + DEFAULT_PAD_PX (8) per side
        let w = measured.width.ceil() as u32 + 16;
        let h = measured.height.ceil() as u32 + 16;

        let sheet = StyleSheet::parse_loosy(&css);
        let opts = RenderOptions::builder()
            .viewport(Viewport::new((w, h)))
            .node(node)
            .fonts(fonts)
            .stylesheet(Arc::new(sheet))
            .build();
        match render(opts) {
            Ok(bitmap) => {
                let mut png = Vec::new();
                takumi::write_image(&bitmap, &mut png, OutputFormat::Png)?;
                std::fs::write(out_dir.join(format!("{id}.png")), png)?;
                rendered += 1;
            }
            Err(e) => failed.push(format!("{id}: render {e:?}")),
        }
    }

    println!(
        "rendered {rendered}/{} source fragments in {:.1?}",
        fragments.len(),
        t0.elapsed()
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

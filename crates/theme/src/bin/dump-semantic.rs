//! Dumps the semantic ramps as JSON for the cross-language parity fixture
//! (`packages/themes/test/fixtures/semantic.json`).
//!
//! Seeds: the eight preset seeds plus edge cases (black, white, near-white,
//! saturated yellow, dark navy). Modes: light + dark for every seed.
//!
//! Run: `cargo run -p vexillum-theme --bin dump-semantic > packages/themes/test/fixtures/semantic.json`

use std::io::Write;

use vexillum_theme::semantic::{self, Mode};

fn main() {
    let seeds = [
        ("blue", semantic::preset_seed("blue").unwrap()),
        ("violet", semantic::preset_seed("violet").unwrap()),
        ("pink", semantic::preset_seed("pink").unwrap()),
        ("red", semantic::preset_seed("red").unwrap()),
        ("amber", semantic::preset_seed("amber").unwrap()),
        ("green", semantic::preset_seed("green").unwrap()),
        ("teal", semantic::preset_seed("teal").unwrap()),
        ("slate", semantic::preset_seed("slate").unwrap()),
        ("black", "#000000"),
        ("white", "#ffffff"),
        ("near-white", "#fefefe"),
        ("yellow", "#facc15"),
        ("navy", "#1e1b4b"),
        ("short", "#f0a"),
    ];

    let mut out = String::from("{\n");
    for (i, (name, hex)) in seeds.iter().enumerate() {
        let seed =
            semantic::parse_seed(hex).unwrap_or_else(|| panic!("seed {name} ({hex}) parses"));
        for (j, mode) in [Mode::Light, Mode::Dark].iter().enumerate() {
            let mode_str = match mode {
                Mode::Light => "light",
                Mode::Dark => "dark",
            };
            let ramp = semantic::resolve_ramp(seed, *mode);
            let comma = if i == seeds.len() - 1 && j == 1 {
                ""
            } else {
                ","
            };
            out.push_str(&format!("  \"{name}-{mode_str}\": {{\n"));
            let tokens: Vec<_> = ramp.tokens.iter().collect();
            for (k, (token, value)) in tokens.iter().enumerate() {
                let tc = if k == tokens.len() - 1 { "" } else { "," };
                out.push_str(&format!("    \"{token}\": \"{value}\"{tc}\n"));
            }
            out.push_str(&format!("  }}{comma}\n"));
        }
    }
    out.push_str("}\n");

    let mut stdout = std::io::stdout();
    stdout.write_all(out.as_bytes()).expect("write fixture");
}

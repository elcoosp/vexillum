//! Dumps the six launch presets as JSON for the cross-language parity
//! fixture (`packages/themes/test/fixtures/presets.json`).
//!
//! Run: `cargo run -p vexillum-theme --bin dump-presets > path/to/presets.json`

fn main() {
    let names = vexillum_theme::preset_names();
    let mut entries: Vec<String> = Vec::new();
    for name in names {
        let theme = vexillum_theme::preset_theme(name).expect("preset resolves");
        let colors = serde_json::to_string(&theme.colors).unwrap();
        entries.push(format!("  \"{name}\": {colors}"));
    }
    println!("{{\n{}\n}}", entries.join(",\n"));
}

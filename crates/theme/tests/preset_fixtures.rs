//! Cross-language parity guard: the committed fixture
//! (`packages/themes/test/fixtures/presets.json`) is generated from THIS
//! crate via `cargo run -p vexillum-theme --bin dump-presets`. The TS mirror
//! (`packages/themes`) asserts the same fixture in its vitest suite, so the
//! client preview and the API always resolve identical preset colors.
//!
//! Regenerate after intentional theme changes:
//! `cargo run -p vexillum-theme --bin dump-presets > ../packages/themes/test/fixtures/presets.json`

use std::collections::BTreeMap;

#[test]
fn committed_fixture_matches_current_presets() {
    let fixture_path = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../packages/themes/test/fixtures/presets.json"
    );
    let raw = std::fs::read_to_string(fixture_path)
        .expect("parity fixture exists (packages/themes/test/fixtures/presets.json)");
    let fixture: BTreeMap<String, BTreeMap<String, String>> = serde_json::from_str(&raw).unwrap();

    let mut expected: BTreeMap<String, BTreeMap<String, String>> = BTreeMap::new();
    for name in vexillum_theme::preset_names() {
        let theme = vexillum_theme::preset_theme(name).expect("preset resolves");
        expected.insert(name.to_string(), theme.colors.clone().into_iter().collect());
    }
    assert_eq!(
        fixture, expected,
        "fixture is stale — regenerate with `cargo run -p vexillum-theme --bin dump-presets \
         > ../packages/themes/test/fixtures/presets.json`"
    );
}

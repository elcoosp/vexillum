//! Embedded badge templates: HTML compiled from the TSX badge library plus
//! the shared stylesheets and registry manifest.

mod embedded;

use std::collections::HashMap;
use std::sync::OnceLock;

use vexillum_core::registry::Registry;
use vexillum_core::MarkerSet;

/// One compiled badge template: structural HTML with `__VX_*__` slot markers.
pub struct Template {
    pub id: &'static str,
    pub html: &'static str,
}

/// Tailwind utility CSS compiled over all 544 templates (spec §4.2).
pub const SHARED_TAILWIND_CSS: &str =
    include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/css/tailwind.css"));

/// Global `@keyframes` for the kinetic variants.
pub const SHARED_KEYFRAMES_CSS: &str =
    include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/css/keyframes.css"));

/// The registry manifest produced by the compiler.
pub const REGISTRY_JSON: &str =
    include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/registry.json"));

fn template_map() -> &'static HashMap<&'static str, Template> {
    static MAP: OnceLock<HashMap<&'static str, Template>> = OnceLock::new();
    MAP.get_or_init(embedded::build_registry)
}

/// Returns the template for `id`, if compiled in.
pub fn lookup(id: &str) -> Option<&'static Template> {
    template_map().get(id)
}

/// All template ids in stable order.
pub fn ids() -> Vec<&'static str> {
    let mut ids: Vec<&'static str> = template_map().keys().copied().collect();
    ids.sort_unstable();
    ids
}

/// The parsed registry manifest (collections + variant metadata).
pub fn manifest() -> &'static Registry {
    static REG: OnceLock<Registry> = OnceLock::new();
    REG.get_or_init(|| {
        Registry::from_json(REGISTRY_JSON).expect("embedded registry.json is valid")
    })
}

/// Marker presence detected from the compiled HTML (source of truth),
/// cross-checked against the manifest in tests.
pub fn markers_of(id: &str) -> Option<MarkerSet> {
    lookup(id).map(|t| MarkerSet::detect(t.html))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_544_templates_embedded() {
        assert_eq!(ids().len(), 544, "expected the full collection");
        for id in ["c01-01", "c05-16", "c12-08", "c16-16", "c33-01", "c34-16"] {
            assert!(lookup(id).is_some(), "{id} missing");
        }
    }

    #[test]
    fn manifest_matches_templates() {
        let manifest = manifest();
        assert_eq!(manifest.collections.len(), 34);
        assert_eq!(manifest.variants.len(), 544);
        for v in &manifest.variants {
            let markers = markers_of(&v.id).unwrap_or_else(|| panic!("{} missing", v.id));
            assert_eq!(markers.icon, v.has_icon, "{} icon marker mismatch", v.id);
            assert_eq!(markers.extra, v.has_extra, "{} extra marker mismatch", v.id);
            assert_eq!(markers.label, v.has_label, "{} label marker mismatch", v.id);
            assert_eq!(markers.value, v.has_value, "{} value marker mismatch", v.id);
        }
    }

    #[test]
    fn stylesheets_are_nonempty() {
        assert!(SHARED_TAILWIND_CSS.contains("display"));
        assert!(SHARED_KEYFRAMES_CSS.contains("@keyframes"));
    }

    #[test]
    fn marker_detection_matches_manifest_flags() {
        let manifest = manifest();
        // spot-check a tri-segment and an icon variant
        let tri = manifest.variant("c01-14").unwrap();
        assert!(tri.has_extra);
        let plain = manifest.variant("c01-04").unwrap();
        assert!(!plain.has_icon);
    }

    #[test]
    fn slot_coverage_is_healthy() {
        let manifest = manifest();
        let no_label: Vec<_> = manifest.variants.iter().filter(|v| !v.has_label).collect();
        let no_value: Vec<_> = manifest.variants.iter().filter(|v| !v.has_value).collect();
        // Every variant carries a label. ~30 variants are intentionally
        // label-only: their "value" is a graphic (prompt caret, avatar stack,
        // sparkline, gauge, checkbox, toggle, spinner, waveform, …).
        assert!(no_label.is_empty(), "{} variants without label", no_label.len());
        assert!(no_value.len() <= 40, "{} variants without value", no_value.len());
    }
}

// Template registry types (shared with embedded.rs).
pub struct Template {
    pub id: &'static str,
    pub html: &'static str,
}

pub const SHARED_TAILWIND_CSS: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/css/tailwind.css"));
pub const SHARED_KEYFRAMES_CSS: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/css/keyframes.css"));
pub const REGISTRY_JSON: &str = include_str!(concat!(env!("CARGO_MANIFEST_DIR"), "/assets/registry.json"));

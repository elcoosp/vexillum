//! The variant registry manifest: metadata for every compiled badge template.
//!
//! The TypeScript compiler emits `registry.json`; this module is the Rust
//! mirror used by the API and renderer.

/// Metadata for one animated property target inside a variant.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnimationMeta {
    /// `@keyframes` rule name, e.g. `shimmer`.
    pub name: String,
    /// CSS `animation-duration` in milliseconds.
    pub duration_ms: u32,
    /// Timing function as written in the source CSS (kept verbatim).
    #[serde(default)]
    pub timing: String,
    /// Iteration count as written (`infinite` or a number).
    #[serde(default = "default_iteration")]
    pub iteration: String,
}

fn default_iteration() -> String {
    "infinite".into()
}

/// Metadata for one badge variant (a structural template).
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VariantMeta {
    /// Stable id, e.g. `c01-01`.
    pub id: String,
    /// Collection id, e.g. `c01`.
    pub collection: String,
    /// Human title, e.g. `Two-tone split`.
    pub title: String,
    /// Whether the template contains the `__VX_ICON__` marker.
    pub has_icon: bool,
    /// Whether the template contains the `__VX_LABEL__` marker.
    #[serde(default = "default_true")]
    pub has_label: bool,
    /// Whether the template contains the `__VX_VALUE__` marker.
    #[serde(default = "default_true")]
    pub has_value: bool,
    /// Whether the template contains the `__VX_EXTRA__` marker.
    #[serde(default)]
    pub has_extra: bool,
    /// Whether the template contains the `__VX_EXTRA2__` marker (quad
    /// badges). Quad variants always also carry an extra slot.
    #[serde(default)]
    pub has_extra2: bool,
    /// Default icon SVG (the glyph the source collection ships), if any.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_icon: Option<String>,
    /// Original label text from the source collection (preview default).
    #[serde(default)]
    pub default_label: String,
    /// Original value text from the source collection (preview default).
    #[serde(default)]
    pub default_value: String,
    /// Original third-segment text, if the template has an extra slot.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_extra: Option<String>,
    /// Original fourth-segment text, if the template has an extra2 slot.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub default_extra2: Option<String>,
    /// Animations declared by the template (kinetic variants).
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub animations: Vec<AnimationMeta>,
}

fn default_true() -> bool {
    true
}

impl VariantMeta {
    /// Whether this variant animates (and can therefore render as GIF/APNG/WebP).
    pub fn is_animated(&self) -> bool {
        !self.animations.is_empty()
    }
}

/// Metadata for a collection of variants.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CollectionMeta {
    /// Short id, e.g. `c01`.
    pub id: String,
    /// URL slug, e.g. `foundational`.
    pub slug: String,
    /// Display title, e.g. `Foundational`.
    pub title: String,
    /// One-line description from the source collection.
    pub description: String,
}

/// The full registry: collections and their ordered variants.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Registry {
    pub collections: Vec<CollectionMeta>,
    pub variants: Vec<VariantMeta>,
}

impl Registry {
    /// Finds a variant by id (`c01-01`) or `collection-slug` qualified id.
    pub fn variant(&self, id: &str) -> Option<&VariantMeta> {
        self.variants.iter().find(|v| v.id == id)
    }

    /// Finds a collection by id or slug.
    pub fn collection(&self, id_or_slug: &str) -> Option<&CollectionMeta> {
        self.collections
            .iter()
            .find(|c| c.id == id_or_slug || c.slug == id_or_slug)
    }

    /// All variants belonging to a collection (id or slug).
    pub fn variants_of(&self, collection: &str) -> Vec<&VariantMeta> {
        self.collections
            .iter()
            .find(|c| c.id == collection || c.slug == collection)
            .map(|c| {
                self.variants
                    .iter()
                    .filter(|v| v.collection == c.id)
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Parses the manifest JSON produced by the compiler.
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample() -> Registry {
        Registry {
            collections: vec![CollectionMeta {
                id: "c01".into(),
                slug: "foundational".into(),
                title: "Foundational".into(),
                description: "The recognizable badges.".into(),
            }],
            variants: vec![
                VariantMeta {
                    id: "c01-01".into(),
                    collection: "c01".into(),
                    title: "Two-tone split".into(),
                    has_icon: true,
                    has_label: true,
                    has_value: true,
                    has_extra: false,
                    has_extra2: false,
                    default_icon: Some("<svg/>".into()),
                    default_label: "build".into(),
                    default_value: "passing".into(),
                    default_extra: None,
                    default_extra2: None,
                    animations: vec![],
                },
                VariantMeta {
                    id: "c01-02".into(),
                    collection: "c01".into(),
                    title: "Classic flat".into(),
                    has_icon: false,
                    has_label: true,
                    has_value: true,
                    has_extra: false,
                    has_extra2: false,
                    default_icon: None,
                    default_label: "version".into(),
                    default_value: "3.1.0".into(),
                    default_extra: None,
                    default_extra2: None,
                    animations: vec![AnimationMeta {
                        name: "shimmer".into(),
                        duration_ms: 3000,
                        timing: "linear".into(),
                        iteration: "infinite".into(),
                    }],
                },
            ],
        }
    }

    #[test]
    fn roundtrips_through_json() {
        let r = sample();
        let json = serde_json::to_string(&r).unwrap();
        let back = Registry::from_json(&json).unwrap();
        assert_eq!(back, r);
    }

    #[test]
    fn lookup_by_id_and_slug() {
        let r = sample();
        assert_eq!(r.variant("c01-01").unwrap().title, "Two-tone split");
        assert_eq!(r.collection("foundational").unwrap().id, "c01");
        assert_eq!(r.collection("c01").unwrap().slug, "foundational");
        assert!(r.variant("c99-99").is_none());
    }

    #[test]
    fn variants_of_collection_are_ordered() {
        let r = sample();
        let ids: Vec<_> = r
            .variants_of("foundational")
            .iter()
            .map(|v| v.id.clone())
            .collect();
        assert_eq!(ids, vec!["c01-01", "c01-02"]);
        assert!(r.variants_of("nope").is_empty());
    }

    #[test]
    fn animated_detection() {
        let r = sample();
        assert!(!r.variant("c01-01").unwrap().is_animated());
        assert!(r.variant("c01-02").unwrap().is_animated());
    }
}

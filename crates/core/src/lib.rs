//! Core domain types shared across the Vexillum workspace: the badge
//! data contract, slot markers, output formats, RFC 7807 errors, and compact
//! number formatting used by data services.

pub mod error;
pub mod format;
pub mod markers;
pub mod number;
pub mod registry;

pub use error::{Error, ErrorBody};

/// Workspace result alias.
pub type Result<T> = std::result::Result<T, Error>;
pub use format::{Format, Scale};
pub use markers::{
    EXTRA2_MARKER, EXTRA_MARKER, ICON_MARKER, LABEL_MARKER, MarkerSet, VALUE_MARKER,
};
pub use number::format_compact_number;
pub use registry::{AnimationMeta, CollectionMeta, Registry, VariantMeta};

/// The normalized data a badge renders, produced by a [`crate::data`] service
/// or given statically on the URL.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct BadgeData {
    /// Left-side text (or the only segment on value-only variants).
    pub label: String,
    /// Right-side / emphasized text.
    pub value: String,
    /// Optional third-segment text for variants that expose `__VX_EXTRA__`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extra: Option<String>,
    /// Optional fourth-segment text for quad variants (c17-08) that expose
    /// `__VX_EXTRA2__`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub extra2: Option<String>,
    /// Optional semantic color hint ("passing", "failing", …) data services
    /// may attach; the renderer maps it through the theme guardrail.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    /// Service-advised cache TTL in seconds; `None` falls back to the default.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cache_seconds: Option<u64>,
}

impl BadgeData {
    /// Creates static badge data from the URL path segments.
    pub fn static_badge(label: impl Into<String>, value: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            value: value.into(),
            extra: None,
            extra2: None,
            color: None,
            cache_seconds: None,
        }
    }
}

/// Renders a [`BadgeData`] into the label/value/extra triple actually
/// substituted into a template, honoring the variant's marker presence.
pub trait SlotValues {
    fn label(&self) -> &str;
    fn value(&self) -> &str;
    fn extra(&self) -> Option<&str>;
    fn extra2(&self) -> Option<&str>;
}

impl SlotValues for BadgeData {
    fn label(&self) -> &str {
        &self.label
    }
    fn value(&self) -> &str {
        &self.value
    }
    fn extra(&self) -> Option<&str> {
        self.extra.as_deref()
    }
    fn extra2(&self) -> Option<&str> {
        self.extra2.as_deref()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn static_badge_has_no_optional_fields() {
        let b = BadgeData::static_badge("build", "passing");
        assert_eq!(b.label, "build");
        assert_eq!(b.value, "passing");
        assert_eq!(b.extra, None);
        assert_eq!(b.extra2, None);
        assert_eq!(b.color, None);
        assert_eq!(b.cache_seconds, None);
    }

    #[test]
    fn badge_data_serializes_optionals_compactly() {
        let b = BadgeData::static_badge("build", "passing");
        let json = serde_json::to_string(&b).unwrap();
        assert!(!json.contains("extra"));
        assert!(!json.contains("color"));
        assert_eq!(b.label(), "build");
        assert_eq!(b.value(), "passing");
        assert_eq!(b.extra(), None);
        assert_eq!(b.extra2(), None);
        // a filled extra2 serializes and round-trips through the trait
        let q = BadgeData {
            extra2: Some("c".into()),
            ..b
        };
        let json = serde_json::to_string(&q).unwrap();
        assert!(json.contains("extra2"));
        assert_eq!(q.extra2(), Some("c"));
    }
}

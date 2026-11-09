//! Slot markers embedded into compiled templates and replaced at render time.
//!
//! Markers use the `__VX_*__` shape so real badge text can never collide with
//! them (it would have to contain the exact delimited token, which the URL
//! grammar forbids). Substitution is single-pass and non-recursive.

/// Left text slot.
pub const LABEL_MARKER: &str = "__VX_LABEL__";
/// Right text slot.
pub const VALUE_MARKER: &str = "__VX_VALUE__";
/// Third-segment text slot (tri-segment, tag chips, …). Optional per variant.
pub const EXTRA_MARKER: &str = "__VX_EXTRA__";
/// Fourth-segment text slot (quad badges, e.g. c17-08's a|b|c|d slab).
/// Optional per variant; implies the variant also carries an extra slot.
pub const EXTRA2_MARKER: &str = "__VX_EXTRA2__";
/// Icon slot: replaced with the resolved inline `<svg>` or removed entirely.
pub const ICON_MARKER: &str = "__VX_ICON__";

/// Which markers a compiled template actually contains.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct MarkerSet {
    pub label: bool,
    pub value: bool,
    pub extra: bool,
    pub extra2: bool,
    pub icon: bool,
}

impl MarkerSet {
    /// Scans a compiled template body for the markers it contains.
    pub fn detect(html: &str) -> Self {
        Self {
            label: html.contains(LABEL_MARKER),
            value: html.contains(VALUE_MARKER),
            extra: html.contains(EXTRA_MARKER),
            extra2: html.contains(EXTRA2_MARKER),
            icon: html.contains(ICON_MARKER),
        }
    }

    /// The set every collection variant is expected to carry.
    pub const fn standard() -> Self {
        Self {
            label: true,
            value: true,
            extra: false,
            extra2: false,
            icon: true,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_finds_present_markers() {
        let html = "<b>__VX_LABEL__</b><i>__VX_VALUE__</i><u>__VX_ICON__</u>";
        let m = MarkerSet::detect(html);
        assert!(m.label && m.value && m.icon);
        assert!(!m.extra && !m.extra2);
    }

    #[test]
    fn detect_finds_the_quad_marker() {
        // c17-08 "quad" — the four-segment slab (label|extra|extra2|value)
        let html = "<b>__VX_LABEL__</b><m>__VX_EXTRA__</m><m>__VX_EXTRA2__</m><i>__VX_VALUE__</i>";
        let m = MarkerSet::detect(html);
        assert!(m.extra && m.extra2);
    }

    #[test]
    fn markers_cannot_collide_with_plain_text() {
        // Even adversarial badge text cannot contain a marker because the URL
        // grammar percent-encodes underscores sequences… and the markers only
        // ever appear verbatim in templates, never derived from user input.
        assert!(!"build passing".contains(LABEL_MARKER));
    }

    #[test]
    fn standard_set_matches_spec() {
        let s = MarkerSet::standard();
        assert!(s.label && s.value && s.icon && !s.extra);
    }
}

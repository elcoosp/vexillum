//! Shared helpers for formatting live data into badge text.

/// Compact number formatting (delegates to vexillum-core, kept for discoverability).
pub use vexillum_core::format_compact_number as compact;

/// Semantic color buckets shared with the theme guardrail.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Semantic {
    Success,
    Failure,
    Warning,
    Information,
    Neutral,
}

impl Semantic {
    /// Maps a raw string (e.g. GitHub status) to a bucket.
    pub fn parse(s: &str) -> Self {
        match s.to_ascii_lowercase().as_str() {
            "passing" | "success" | "passed" | "green" | "ok" | "active" | "operational" => {
                Self::Success
            }
            "failing" | "failure" | "failed" | "error" | "red" | "down" | "outage" => Self::Failure,
            "pending" | "running" | "queued" | "yellow" | "degraded" | "partial" => Self::Warning,
            "building" | "blue" | "info" | "unknown" => Self::Information,
            _ => Self::Neutral,
        }
    }

    /// The canonical shields.io color name for the bucket.
    pub const fn color(self) -> &'static str {
        match self {
            Self::Success => "brightgreen",
            Self::Failure => "red",
            Self::Warning => "yellow",
            Self::Information => "blue",
            Self::Neutral => "lightgrey",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn semantic_buckets() {
        assert_eq!(Semantic::parse("passing"), Semantic::Success);
        assert_eq!(Semantic::parse("FAILED"), Semantic::Failure);
        assert_eq!(Semantic::parse("pending"), Semantic::Warning);
        assert_eq!(Semantic::parse("mystery"), Semantic::Neutral);
        assert_eq!(Semantic::Success.color(), "brightgreen");
    }

    #[test]
    fn compact_formatting() {
        assert_eq!(compact(1_234_567.0), "1.2M");
        assert_eq!(compact(12_345.0), "12.3k");
    }
}

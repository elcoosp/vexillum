//! Unified error type with RFC 7807 (`application/problem+json`) bodies.

use crate::format::Format;

/// Domain error shared by every crate in the workspace.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("unknown variant '{0}'")]
    UnknownVariant(String),
    #[error("unknown collection '{0}'")]
    UnknownCollection(String),
    #[error("unknown format '{0}'")]
    UnknownFormat(String),
    #[error("unknown scale '{0}'")]
    UnknownScale(String),
    #[error("unknown theme '{0}'")]
    UnknownTheme(String),
    #[error("unknown icon '{0}'")]
    UnknownIcon(String),
    #[error("unknown data service '{0}'")]
    UnknownService(String),
    #[error("template '{0}' is missing from the embedded registry")]
    MissingTemplate(String),
    #[error("upstream data source failed: {0}")]
    Upstream(String),
    #[error("invalid request: {0}")]
    BadRequest(String),
    #[error("unauthorized: {0}")]
    Unauthorized(String),
    #[error("forbidden: {0}")]
    Forbidden(String),
    #[error("payment required: {0}")]
    PaymentRequired(String),
    #[error("rate limit exceeded")]
    RateLimited,
    #[error("render failed: {0}")]
    Render(String),
    #[error("icon upload rejected: {0}")]
    InvalidIcon(String),
    #[error("invalid font '{0}'")]
    InvalidFont(String),
    #[error("font source unavailable: {0}")]
    FontUnavailable(String),
    #[error("service not configured: {0}")]
    NotConfigured(String),
}

impl Error {
    /// HTTP status the error maps to.
    pub const fn status(&self) -> u16 {
        match self {
            Self::UnknownVariant(_)
            | Self::UnknownCollection(_)
            | Self::UnknownFormat(_)
            | Self::UnknownScale(_)
            | Self::UnknownTheme(_)
            | Self::UnknownIcon(_)
            | Self::UnknownService(_)
            | Self::MissingTemplate(_) => 404,
            Self::Upstream(_) | Self::Render(_) => 502,
            Self::BadRequest(_) | Self::InvalidIcon(_) | Self::InvalidFont(_) => 400,
            Self::FontUnavailable(_) | Self::NotConfigured(_) => 503,
            Self::Unauthorized(_) => 401,
            Self::Forbidden(_) => 403,
            Self::PaymentRequired(_) => 402,
            Self::RateLimited => 429,
        }
    }

    /// Stable `type` URI segment, e.g. `https://vexillum.dev/errors/unknown-variant`.
    pub fn type_uri(&self) -> String {
        let slug = match self {
            Self::UnknownVariant(_) => "unknown-variant",
            Self::UnknownCollection(_) => "unknown-collection",
            Self::UnknownFormat(_) => "unknown-format",
            Self::UnknownScale(_) => "unknown-scale",
            Self::UnknownTheme(_) => "unknown-theme",
            Self::UnknownIcon(_) => "unknown-icon",
            Self::UnknownService(_) => "unknown-service",
            Self::MissingTemplate(_) => "missing-template",
            Self::Render(_) => "render-failure",
            Self::Upstream(_) => "upstream",
            Self::BadRequest(_) => "bad-request",
            Self::Unauthorized(_) => "unauthorized",
            Self::Forbidden(_) => "forbidden",
            Self::PaymentRequired(_) => "payment-required",
            Self::RateLimited => "rate-limited",
            Self::InvalidIcon(_) => "invalid-icon",
            Self::InvalidFont(_) => "invalid-font",
            Self::FontUnavailable(_) => "font-unavailable",
            Self::NotConfigured(_) => "service-not-configured",
        };
        format!("https://vexillum.dev/errors/{slug}")
    }

    /// Short human title.
    pub fn title(&self) -> String {
        match self {
            Self::UnknownVariant(_) => "Unknown variant".into(),
            Self::UnknownCollection(_) => "Unknown collection".into(),
            Self::UnknownFormat(_) => "Unknown format".into(),
            Self::UnknownScale(_) => "Unknown scale".into(),
            Self::UnknownTheme(_) => "Unknown theme".into(),
            Self::UnknownIcon(_) => "Unknown icon".into(),
            Self::UnknownService(_) => "Unknown data service".into(),
            Self::MissingTemplate(_) => "Missing template".into(),
            Self::Render(_) => "Render failed".into(),
            Self::Upstream(_) => "Upstream data source failed".into(),
            Self::BadRequest(_) => "Bad request".into(),
            Self::Unauthorized(_) => "Unauthorized".into(),
            Self::Forbidden(_) => "Forbidden".into(),
            Self::PaymentRequired(_) => "Payment required".into(),
            Self::RateLimited => "Rate limit exceeded".into(),
            Self::InvalidIcon(_) => "Invalid icon".into(),
            Self::InvalidFont(_) => "Invalid font".into(),
            Self::FontUnavailable(_) => "Font source unavailable".into(),
            Self::NotConfigured(_) => "Service not configured".into(),
        }
    }

    /// RFC 7807 problem body.
    pub fn to_body(&self, instance: Option<&str>) -> ErrorBody {
        ErrorBody {
            r#type: self.type_uri(),
            title: self.title(),
            status: self.status(),
            detail: self.to_string(),
            instance: instance.map(str::to_owned),
        }
    }
}

/// RFC 7807 problem-details document.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct ErrorBody {
    pub r#type: String,
    pub title: String,
    pub status: u16,
    pub detail: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instance: Option<String>,
}

impl ErrorBody {
    /// Media type an RFC 7807 body must be served with.
    pub const CONTENT_TYPE: &'static str = "application/problem+json";
}

impl From<Format> for Error {
    fn from(_: Format) -> Self {
        unreachable!()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unknown_variant_maps_to_404_problem() {
        let e = Error::UnknownVariant("fnd99".into());
        let body = e.to_body(Some("/badge/foundational/fnd99/a/b"));
        assert_eq!(body.status, 404);
        assert_eq!(body.r#type, "https://vexillum.dev/errors/unknown-variant");
        assert_eq!(body.title, "Unknown variant");
        assert_eq!(
            body.instance.as_deref(),
            Some("/badge/foundational/fnd99/a/b")
        );
        let json = serde_json::to_string(&body).unwrap();
        assert!(json.contains("\"status\":404"));
    }

    #[test]
    fn payment_required_is_402() {
        assert_eq!(Error::PaymentRequired("gif".into()).status(), 402);
    }

    #[test]
    fn upstream_maps_to_502() {
        assert_eq!(Error::Upstream("timeout".into()).status(), 502);
    }
}

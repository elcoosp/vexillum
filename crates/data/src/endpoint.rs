//! Shields-compatible `/badge/endpoint` service (spec §6.2 `endpoint`):
//! fetches a JSON document and renders `schemaVersion 1` badge definitions.

use async_trait::async_trait;
use serde_json::Value;
use vexillum_core::{BadgeData, Error, Result};

use crate::service::{DataService, HttpClient};

pub struct EndpointService;

impl EndpointService {
    pub fn new() -> Self {
        Self
    }

    async fn get_json(&self, client: &HttpClient, url: &str) -> Result<Value> {
        let parsed =
            url::Url::parse(url).map_err(|_| Error::BadRequest(format!("invalid url '{url}'")))?;
        if parsed.scheme() != "https" && !allow_insecure_loopback(&parsed) {
            return Err(Error::BadRequest("endpoint requires https".into()));
        }
        crate::ssrf::assert_url_host_is_public(&parsed)?;
        let resp = client
            .get(parsed)
            .header("User-Agent", "vexillum")
            .send()
            .await
            .map_err(|e| Error::Upstream(format!("endpoint request failed: {e}")))?;
        let status = resp.status();
        if !status.is_success() {
            return Err(Error::Upstream(format!("endpoint returned {status}")));
        }
        resp.json()
            .await
            .map_err(|e| Error::Upstream(format!("endpoint body parse failed: {e}")))
    }
}

impl Default for EndpointService {
    fn default() -> Self {
        Self::new()
    }
}

/// Extracts a `BadgeData` from a Shields endpoint JSON body.
pub fn parse_endpoint(body: &Value) -> Result<BadgeData> {
    let label = body["label"].as_str().unwrap_or("endpoint").to_string();
    let value = body["message"]
        .as_str()
        .or(body["value"].as_str())
        .unwrap_or("unknown")
        .to_string();
    let color = body["color"].as_str().map(str::to_string);
    Ok(BadgeData {
        label,
        value,
        extra: None,
        extra2: None,
        color,
        cache_seconds: body["cacheSeconds"].as_u64(),
    })
}

pub struct EndpointRequest<'a> {
    pub url: &'a str,
}

impl EndpointService {
    pub async fn fetch_endpoint(
        &self,
        client: &HttpClient,
        req: &EndpointRequest<'_>,
    ) -> Result<BadgeData> {
        let body = self.get_json(client, req.url).await?;
        parse_endpoint(&body)
    }
}

/// Allows plain http only for loopback hosts in debug builds, so wiremock
/// integration tests work while production stays https-only.
fn allow_insecure_loopback(url: &url::Url) -> bool {
    cfg!(debug_assertions)
        && url.scheme() == "http"
        && url
            .host_str()
            .map(|h| h == "localhost" || h.starts_with("127.0.0.1"))
            .unwrap_or(false)
}

#[async_trait]
impl DataService for EndpointService {
    fn id(&self) -> &'static str {
        "endpoint"
    }

    async fn fetch(&self, _path: &str, _client: &HttpClient) -> Result<BadgeData> {
        Err(Error::BadRequest(
            "endpoint needs query params: /badge/endpoint?url=".into(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_shields_schema() {
        let body = serde_json::json!({
            "schemaVersion": 1,
            "label": "health",
            "message": "99.9%",
            "color": "brightgreen",
            "cacheSeconds": 90
        });
        let data = parse_endpoint(&body).unwrap();
        assert_eq!(data.label, "health");
        assert_eq!(data.value, "99.9%");
        assert_eq!(data.color.as_deref(), Some("brightgreen"));
        assert_eq!(data.cache_seconds, Some(90));
    }

    #[test]
    fn falls_back_for_minimal_body() {
        let data = parse_endpoint(&serde_json::json!({ "message": "ok" })).unwrap();
        assert_eq!(data.label, "endpoint");
        assert_eq!(data.value, "ok");
    }
}

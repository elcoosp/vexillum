//! Generic JSON service (spec §6.2): `url` + `query` (JSONPath subset) +
//! `prefix`/`suffix` — mirrors shields.io's `/badge/dynamic/json`.

use async_trait::async_trait;
use serde_json::Value;
use vexillum_core::{BadgeData, Error, Result};

use crate::service::{DataService, HttpClient};

pub struct GenericJsonService;

impl GenericJsonService {
    pub fn new() -> Self {
        Self
    }

    async fn get_json(&self, client: &HttpClient, url: &str) -> Result<Value> {
        let parsed =
            url::Url::parse(url).map_err(|_| Error::BadRequest(format!("invalid url '{url}'")))?;
        if parsed.scheme() != "https" && !allow_insecure_loopback(&parsed) {
            return Err(Error::BadRequest("dynamic json requires https".into()));
        }
        crate::ssrf::assert_url_host_is_public(&parsed)?;
        let resp = client
            .get(parsed)
            .header("User-Agent", "vexillum")
            .send()
            .await
            .map_err(|e| Error::Upstream(format!("dynamic json request failed: {e}")))?;
        let status = resp.status();
        if !status.is_success() {
            return Err(Error::Upstream(format!("dynamic json returned {status}")));
        }
        resp.json()
            .await
            .map_err(|e| Error::Upstream(format!("dynamic json body parse failed: {e}")))
    }
}

impl Default for GenericJsonService {
    fn default() -> Self {
        Self::new()
    }
}

/// Resolves a dotted JSON path with `a.b[0].c` segments against a value.
pub fn resolve_query<'a>(root: &'a Value, query: &str) -> Option<&'a Value> {
    let mut current = root;
    for segment in query.split('.').filter(|s| !s.is_empty()) {
        // array index form: name[0] or bare [0]
        let (name, index) = match segment.split_once('[') {
            Some((n, rest)) => {
                let idx: usize = rest.trim_end_matches(']').parse().ok()?;
                (n, Some(idx))
            }
            None => (segment, None),
        };
        if !name.is_empty() {
            current = current.get(name)?;
        }
        if let Some(i) = index {
            current = current.get(i)?;
        }
    }
    Some(current)
}

/// Formats a resolved value as badge text (numbers compacted, strings raw).
pub fn format_value(value: &Value, prefix: &str, suffix: &str) -> Result<String> {
    let text = match value {
        Value::String(s) => s.clone(),
        Value::Number(n) => crate::compact::compact(n.as_f64().unwrap_or(0.0)),
        Value::Bool(b) => b.to_string(),
        Value::Null => return Err(Error::Upstream("query resolved to null".into())),
        other => return Err(Error::Upstream(format!("query resolved to {other}"))),
    };
    Ok(format!("{prefix}{text}{suffix}"))
}

pub struct DynamicRequest<'a> {
    pub url: &'a str,
    pub query: &'a str,
    pub prefix: &'a str,
    pub suffix: &'a str,
}

impl GenericJsonService {
    pub async fn fetch_dynamic(
        &self,
        client: &HttpClient,
        req: &DynamicRequest<'_>,
    ) -> Result<BadgeData> {
        let json = self.get_json(client, req.url).await?;
        let value = resolve_query(&json, req.query)
            .ok_or_else(|| Error::Upstream(format!("query '{}' did not resolve", req.query)))?;
        let value = format_value(value, req.prefix, req.suffix)?;
        Ok(BadgeData {
            label: "custom".into(),
            value,
            extra: None,
            extra2: None,
            color: None,
            cache_seconds: Some(300),
        })
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
impl DataService for GenericJsonService {
    fn id(&self) -> &'static str {
        "dynamic"
    }

    async fn fetch(&self, _path: &str, _client: &HttpClient) -> Result<BadgeData> {
        Err(Error::BadRequest(
            "dynamic json needs query params: /badge/dynamic/json?url=&query=&prefix=&suffix="
                .into(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn query_resolution() {
        let json: Value = serde_json::json!({
            "a": { "b": [10, 20, { "c": "deep" }] },
            "name": "v1.2.3",
            "count": 1234
        });
        assert_eq!(resolve_query(&json, "a.b[1]").unwrap(), &Value::from(20));
        assert_eq!(
            resolve_query(&json, "a.b[2].c").unwrap(),
            &Value::from("deep")
        );
        assert_eq!(
            resolve_query(&json, "name").unwrap(),
            &Value::from("v1.2.3")
        );
        assert!(resolve_query(&json, "a.zzz").is_none());
        assert!(resolve_query(&json, "a.b[99]").is_none());
    }

    #[test]
    fn value_formatting() {
        assert_eq!(format_value(&Value::from("v9"), "", "!").unwrap(), "v9!");
        assert_eq!(
            format_value(&Value::from(1234), "", " stars").unwrap(),
            "1.2k stars"
        );
        assert_eq!(format_value(&Value::from(true), "", "").unwrap(), "true");
        assert!(format_value(&Value::Null, "", "").is_err());
    }

    #[tokio::test]
    async fn rejects_http_urls() {
        let svc = GenericJsonService::new();
        let client = HttpClient::new();
        let e = svc
            .fetch_dynamic(
                &client,
                &DynamicRequest {
                    url: "http://insecure.example/x.json",
                    query: "a",
                    prefix: "",
                    suffix: "",
                },
            )
            .await
            .unwrap_err();
        assert_eq!(e.status(), 400);
    }
}

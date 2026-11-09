//! npm data service: version + downloads.

use async_trait::async_trait;
use serde_json::Value;
use vexillum_core::{BadgeData, Error, Result};

use crate::service::{DataService, HttpClient, require_segments, split_path};

pub struct NpmService;

impl NpmService {
    pub fn new() -> Self {
        Self
    }

    async fn get_json(&self, client: &HttpClient, url: &str) -> Result<Value> {
        let resp = client
            .get(url)
            .header("User-Agent", "vexillum")
            .send()
            .await
            .map_err(|e| Error::Upstream(format!("npm request failed: {e}")))?;
        let status = resp.status();
        if !status.is_success() {
            return Err(Error::Upstream(format!("npm returned {status}")));
        }
        resp.json()
            .await
            .map_err(|e| Error::Upstream(format!("npm body parse failed: {e}")))
    }
}

impl Default for NpmService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DataService for NpmService {
    fn id(&self) -> &'static str {
        "npm"
    }

    async fn fetch(&self, path: &str, client: &HttpClient) -> Result<BadgeData> {
        let (action, segs) = split_path(path);
        match action {
            "v" => {
                let pkg = require_segments(&segs, 1)?[0];
                let url = format!("https://registry.npmjs.org/{pkg}/latest");
                let v = self.get_json(client, &url).await?;
                Ok(BadgeData {
                    label: "npm".into(),
                    value: v["version"].as_str().unwrap_or("unknown").to_string(),
                    extra: None,
                    extra2: None,
                    color: None,
                    cache_seconds: Some(600),
                })
            }
            "dm" | "dw" | "dl" => {
                let pkg = require_segments(&segs, 1)?[0];
                let url = format!("https://api.npmjs.org/downloads/point/last-month/{pkg}");
                let v = self.get_json(client, &url).await?;
                let downloads = v["downloads"].as_f64().unwrap_or(0.0);
                Ok(BadgeData {
                    label: "downloads".into(),
                    value: crate::compact::compact(downloads),
                    extra: None,
                    extra2: None,
                    color: None,
                    cache_seconds: Some(3600),
                })
            }
            other => Err(Error::BadRequest(format!(
                "npm action '{other}' not supported (v|dm)"
            ))),
        }
    }
}

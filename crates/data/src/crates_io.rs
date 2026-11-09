//! crates.io data service: version + downloads.

use async_trait::async_trait;
use serde_json::Value;
use vexillum_core::{BadgeData, Error, Result};

use crate::service::{DataService, HttpClient, require_segments, split_path};

pub struct CratesIoService;

impl CratesIoService {
    pub fn new() -> Self {
        Self
    }

    async fn get_json(&self, client: &HttpClient, url: &str) -> Result<Value> {
        let resp = client
            .get(url)
            .header("User-Agent", "vexillum (badge service)")
            .send()
            .await
            .map_err(|e| Error::Upstream(format!("crates.io request failed: {e}")))?;
        let status = resp.status();
        if !status.is_success() {
            return Err(Error::Upstream(format!("crates.io returned {status}")));
        }
        resp.json()
            .await
            .map_err(|e| Error::Upstream(format!("crates.io body parse failed: {e}")))
    }
}

impl Default for CratesIoService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DataService for CratesIoService {
    fn id(&self) -> &'static str {
        "crates"
    }

    async fn fetch(&self, path: &str, client: &HttpClient) -> Result<BadgeData> {
        let (action, segs) = split_path(path);
        match action {
            "v" => {
                let krate = require_segments(&segs, 1)?[0];
                let v = self
                    .get_json(client, &format!("https://crates.io/api/v1/crates/{krate}"))
                    .await?;
                Ok(BadgeData {
                    label: "crates.io".into(),
                    value: v["crate"]["max_stable_version"]
                        .as_str()
                        .or(v["crate"]["max_version"].as_str())
                        .unwrap_or("unknown")
                        .to_string(),
                    extra: None,
                    extra2: None,
                    color: None,
                    cache_seconds: Some(600),
                })
            }
            "dl" => {
                let krate = require_segments(&segs, 1)?[0];
                let v = self
                    .get_json(client, &format!("https://crates.io/api/v1/crates/{krate}"))
                    .await?;
                let downloads = v["crate"]["downloads"].as_f64().unwrap_or(0.0);
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
                "crates action '{other}' not supported (v|dl)"
            ))),
        }
    }
}

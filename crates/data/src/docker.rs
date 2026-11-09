//! Docker Hub data service: pulls.

use async_trait::async_trait;
use serde_json::Value;
use vexillum_core::{BadgeData, Error, Result};

use crate::service::{DataService, HttpClient, require_segments, split_path};

pub struct DockerService;

impl DockerService {
    pub fn new() -> Self {
        Self
    }

    async fn get_json(&self, client: &HttpClient, url: &str) -> Result<Value> {
        let resp = client
            .get(url)
            .header("User-Agent", "vexillum")
            .send()
            .await
            .map_err(|e| Error::Upstream(format!("docker hub request failed: {e}")))?;
        let status = resp.status();
        if !status.is_success() {
            return Err(Error::Upstream(format!("docker hub returned {status}")));
        }
        resp.json()
            .await
            .map_err(|e| Error::Upstream(format!("docker hub body parse failed: {e}")))
    }
}

impl Default for DockerService {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DataService for DockerService {
    fn id(&self) -> &'static str {
        "docker"
    }

    async fn fetch(&self, path: &str, client: &HttpClient) -> Result<BadgeData> {
        let (action, segs) = split_path(path);
        match action {
            "pulls" => {
                let segs = require_segments(&segs, 2)?;
                let image = format!("{}/{}", segs[0], segs[1]);
                let v = self
                    .get_json(
                        client,
                        &format!("https://hub.docker.com/v2/repositories/{image}/"),
                    )
                    .await?;
                Ok(BadgeData {
                    label: "docker pulls".into(),
                    value: crate::compact::compact(v["pull_count"].as_f64().unwrap_or(0.0)),
                    extra: None,
                    extra2: None,
                    color: None,
                    cache_seconds: Some(3600),
                })
            }
            other => Err(Error::BadRequest(format!(
                "docker action '{other}' not supported (pulls)"
            ))),
        }
    }
}

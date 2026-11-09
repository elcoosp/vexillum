//! The `DataService` trait and registry.

use std::sync::Arc;

use async_trait::async_trait;
use vexillum_core::{BadgeData, Error, Result};

use crate::crates_io::CratesIoService;
use crate::docker::DockerService;
use crate::endpoint::EndpointService;
use crate::generic::GenericJsonService;
use crate::github::GitHubService;
use crate::npm::NpmService;

/// HTTP client handle passed to services so tests can swap the transport.
pub type HttpClient = reqwest::Client;

/// A provider of live badge data (spec §6.1).
#[async_trait]
pub trait DataService: Send + Sync {
    /// Stable service id used in routes (`github`, `npm`, …).
    fn id(&self) -> &'static str;
    /// Fetches and formats badge data for the given path segments.
    async fn fetch(&self, path: &str, client: &HttpClient) -> Result<BadgeData>;
    /// Advised cache TTL for the last response (seconds). Services with
    /// per-response TTLs return it via `BadgeData.cache_seconds` instead.
    fn default_ttl(&self) -> u64 {
        300
    }
}

/// All launch services, resolved by route prefix.
pub struct ServiceRegistry {
    services: Vec<Arc<dyn DataService>>,
}

impl ServiceRegistry {
    pub fn new(services: Vec<Arc<dyn DataService>>) -> Self {
        Self { services }
    }

    /// The launch set: GitHub, npm, crates.io, Docker Hub, generic JSON,
    /// Shields-compatible endpoint.
    pub fn launch_set(github_tokens: Vec<String>) -> Self {
        Self::new(vec![
            Arc::new(GitHubService::new(github_tokens)),
            Arc::new(NpmService::new()),
            Arc::new(CratesIoService::new()),
            Arc::new(DockerService::new()),
            Arc::new(GenericJsonService::new()),
            Arc::new(EndpointService::new()),
        ])
    }

    /// Finds a service by id (route prefix).
    pub fn find(&self, id: &str) -> Option<Arc<dyn DataService>> {
        self.services.iter().find(|s| s.id() == id).cloned()
    }

    pub fn ids(&self) -> Vec<&'static str> {
        self.services.iter().map(|s| s.id()).collect()
    }
}

/// Splits `/stars/owner/repo` → ("stars", ["owner", "repo"]).
pub fn split_path(path: &str) -> (&str, Vec<&str>) {
    let trimmed = path.trim_start_matches('/');
    match trimmed.split_once('/') {
        Some((head, rest)) => (head, rest.split('/').filter(|s| !s.is_empty()).collect()),
        None => (trimmed, vec![]),
    }
}

/// Shared guard: rejects empty path segments early.
pub fn require_segments<'a>(segs: &'a [&'a str], n: usize) -> Result<&'a [&'a str]> {
    if segs.len() < n {
        return Err(Error::BadRequest(format!(
            "expected at least {n} path segments"
        )));
    }
    Ok(segs)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn path_splitting() {
        assert_eq!(
            split_path("stars/owner/repo"),
            ("stars", vec!["owner", "repo"])
        );
        assert_eq!(
            split_path("/stars/owner/repo"),
            ("stars", vec!["owner", "repo"])
        );
        assert_eq!(split_path("v/package"), ("v", vec!["package"]));
        assert_eq!(split_path("solo"), ("solo", vec![]));
    }

    #[test]
    fn require_segments_guards() {
        assert!(require_segments(&["a", "b"], 2).is_ok());
        assert!(require_segments(&["a"], 2).is_err());
    }

    #[tokio::test]
    async fn registry_launch_set_resolves() {
        let reg = ServiceRegistry::launch_set(vec![]);
        for id in ["github", "npm", "crates", "docker", "dynamic", "endpoint"] {
            assert!(reg.find(id).is_some(), "{id} missing");
        }
        assert!(reg.find("nope").is_none());
        assert_eq!(reg.ids().len(), 6);
    }
}

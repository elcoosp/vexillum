//! Data services (spec §6): live badge data from GitHub, npm, crates.io,
//! Docker Hub, arbitrary JSON, and Shields-compatible endpoints.

pub mod compact;
pub mod crates_io;
pub mod docker;
pub mod endpoint;
pub mod generic;
pub mod github;
pub mod npm;
pub mod service;
pub mod ssrf;

pub use service::{DataService, HttpClient, ServiceRegistry};

#[cfg(test)]
pub(crate) mod test_support;

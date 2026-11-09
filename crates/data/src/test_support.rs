//! Shared test helpers.

#![allow(dead_code)]

pub fn https_url(path: &str) -> String {
    format!("https://example.test{path}")
}

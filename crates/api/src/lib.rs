//! The HTTP API (spec §10): badge routes, data-service routes, registry
//! endpoints, auth/tier enforcement, RFC 7807 errors, and cache headers.

pub mod auth_routes;
pub mod error_response;
pub mod fonts;
pub mod params;
pub mod routes;
pub mod state;

pub use routes::normalize_origin_host;
pub use state::{AppState, StateConfig};
use std::sync::Arc;

/// Builds the full application router.
pub fn router(state: Arc<AppState>) -> axum::Router {
    routes::build(state)
}

//! RFC 7807 `IntoResponse` for [`vexillum_core::Error`].

use axum::http::{StatusCode, header};
use axum::response::{IntoResponse, Response};
use vexillum_core::ErrorBody;

pub struct Problem(pub vexillum_core::Error);

impl From<vexillum_core::Error> for Problem {
    fn from(e: vexillum_core::Error) -> Self {
        Problem(e)
    }
}

impl IntoResponse for Problem {
    fn into_response(self) -> Response {
        let body: ErrorBody = self.0.to_body(None);
        let status = StatusCode::from_u16(body.status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR);
        let json = serde_json::to_string(&body).unwrap_or_else(|_| "{}".into());
        (
            status,
            [(header::CONTENT_TYPE, ErrorBody::CONTENT_TYPE)],
            json,
        )
            .into_response()
    }
}

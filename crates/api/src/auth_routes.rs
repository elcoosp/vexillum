//! Dashboard account routes: GitHub OAuth (authorization-code flow), the
//! session-cookie wall, and the per-user key management API. Everything here
//! runs against the SeaORM stores in `vexillum-auth` — no raw SQL.

use std::sync::Arc;

use axum::Router;
use axum::extract::{Path, Query, State};
use axum::http::{HeaderMap, StatusCode, header};
use axum::response::{IntoResponse, Redirect, Response};
use axum::routing::{delete, get, post};
use serde_json::json;
use vexillum_auth::{ApiKey, Tier, User};
use vexillum_core::Error;

use crate::error_response::Problem;
use crate::routes::{json_response, normalize_origin_host, now_ms};
use crate::state::{AppState, LOGIN_STATE_TTL_MS};

/// Extracts the `vx_session` cookie value from request headers.
fn session_cookie(headers: &HeaderMap) -> Option<String> {
    let raw = headers.get(header::COOKIE)?.to_str().ok()?;
    for pair in raw.split(';') {
        let (name, value) = pair.trim().split_once('=')?;
        if name == vexillum_auth::SESSION_COOKIE {
            return Some(value.to_string());
        }
    }
    None
}

/// Resolves the session cookie to a user when one is present.
pub(crate) async fn session_user_opt(state: &AppState, headers: &HeaderMap) -> Option<User> {
    let auth = state.auth.as_ref()?;
    let token = session_cookie(headers)?;
    auth.session_user(&token).await.ok().flatten()
}

/// Resolves the signed-in user or errors with 401 (the login wall).
async fn require_user(state: &AppState, headers: &HeaderMap) -> Result<User, Problem> {
    let auth = state
        .auth
        .as_ref()
        .ok_or_else(|| Problem(Error::Unauthorized("auth store not configured".into())))?;
    let token = session_cookie(headers).ok_or_else(|| {
        Problem(Error::Unauthorized(
            "no session — sign in with GitHub".into(),
        ))
    })?;
    match auth.session_user(&token).await {
        Ok(Some(user)) => Ok(user),
        Ok(None) => Err(Problem(Error::Unauthorized(
            "session expired — sign in again".into(),
        ))),
        Err(e) => Err(Problem(e)),
    }
}

/// Serializes a key for its OWNER (full hash so the dashboard can run
/// owner-scoped mutations; the hash never unlocks renders — the plaintext does).
fn owner_key_json(state: &AppState, k: &ApiKey) -> serde_json::Value {
    json!({
        "id": k.id(),
        "keyHash": k.key_hash,
        "label": k.label,
        "env": k.env(),
        "tier": k.tier.as_str(),
        "allowedOrigins": k.allowed_origins,
        "createdAt": k.created_ms,
        "lastUsedAt": state.meter.last_used(&format!("key:{}", k.key_hash)),
    })
}

fn set_session_cookie(token: &str, secure: bool) -> String {
    let mut cookie = format!(
        "{}={}; Path=/; HttpOnly; SameSite=Lax; Max-Age={}",
        vexillum_auth::SESSION_COOKIE,
        token,
        vexillum_auth::SESSION_TTL_MS / 1000
    );
    if secure {
        cookie.push_str("; Secure");
    }
    cookie
}

fn clear_session_cookie() -> String {
    format!(
        "{}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        vexillum_auth::SESSION_COOKIE
    )
}

// ---------------- OAuth flow ----------------

/// `GET /v1/auth/github/login` — 302 to GitHub's authorize URL with a fresh
/// CSRF state. 503 problem+json when OAuth is not configured.
async fn github_login(State(state): State<Arc<AppState>>) -> Response {
    let Some(oauth) = state.oauth.as_ref() else {
        // its own error type — this is a deployment configuration state, not a
        // font failure; the login page probes for this status and shows the
        // operator exactly which env vars to set
        return Problem(Error::NotConfigured(
            "GitHub OAuth is not configured — set VX_GITHUB_CLIENT_ID and VX_GITHUB_CLIENT_SECRET"
                .into(),
        ))
        .into_response();
    };
    let csrf = vexillum_auth::generate_session_token()[..32].to_string();
    state.login_states.lock().insert(csrf.clone(), now_ms());
    let mut redirect: Response = Redirect::to(oauth.authorize_url(&csrf).as_str()).into_response();
    // the redirect target is GitHub — cache-busting headers keep proxies out
    redirect.headers_mut().insert(
        header::CACHE_CONTROL,
        header::HeaderValue::from_static("no-store"),
    );
    redirect
}

/// `GET /v1/auth/github/callback?code=&state=` — validates CSRF state,
/// exchanges the code, upserts the user, opens a session cookie and bounces
/// to the dashboard. Failures redirect to /login with `?error=github`.
async fn github_callback(
    State(state): State<Arc<AppState>>,
    Query(query): Query<std::collections::HashMap<String, String>>,
) -> Response {
    let oauth_error = |why: &str| {
        tracing::warn!("github oauth callback failed: {why}");
        Redirect::to(&format!("{}/login?error=github", state.frontend_url())).into_response()
    };
    let Some(oauth) = state.oauth.as_ref() else {
        return oauth_error("oauth not configured");
    };
    // GitHub reports deny/errors via query params — surface as a login error
    if query.contains_key("error") {
        return oauth_error("user denied or provider error");
    }
    let (code, csrf) = match (query.get("code"), query.get("state")) {
        (Some(c), Some(s)) => (c.clone(), s.clone()),
        _ => return oauth_error("missing code/state"),
    };
    // consume the CSRF state exactly once, 10-minute window
    {
        let mut states = state.login_states.lock();
        let created = states.remove(&csrf);
        match created {
            Some(t) if now_ms().saturating_sub(t) <= LOGIN_STATE_TTL_MS => {}
            _ => return oauth_error("unknown or expired oauth state"),
        }
    }

    let flow = async {
        let token = oauth.exchange(&code).await?;
        let profile = oauth.fetch_user(&token).await?;
        let user = User {
            id: profile.id.to_string(),
            login: profile.login,
            name: profile.name,
            email: profile.email,
            avatar_url: profile.avatar_url,
            tier: Tier::Free,
            created_ms: now_ms(),
        };
        let auth = state
            .auth
            .as_ref()
            .ok_or_else(|| Error::Unauthorized("auth store not configured".into()))?;
        auth.upsert_user(&user).await?;
        Ok::<String, Error>(auth.create_session(&user.id).await?)
    }
    .await;

    match flow {
        Ok(token) => {
            let mut redirect: Response =
                Redirect::to(&format!("{}/dashboard", state.frontend_url())).into_response();
            let secure = oauth.redirect_uri.starts_with("https://");
            if let Ok(v) = header::HeaderValue::from_str(&set_session_cookie(&token, secure)) {
                redirect.headers_mut().append(header::SET_COOKIE, v);
            }
            redirect.headers_mut().insert(
                header::CACHE_CONTROL,
                header::HeaderValue::from_static("no-store"),
            );
            redirect
        }
        Err(e) => oauth_error(&e.to_string()),
    }
}

/// `GET /v1/auth/me` — the dashboard's single real-data payload: session
/// user, owned keys, and live usage aggregates. 401 without a session.
async fn me(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Response {
    let user = match require_user(&state, &headers).await {
        Ok(u) => u,
        Err(p) => return p.into_response(),
    };
    let auth = state.auth.as_ref().unwrap();
    let keys = match auth.keys_for_user(&user.id).await {
        Ok(k) => k,
        Err(e) => return Problem(e).into_response(),
    };
    let now = now_ms();
    let mut requests_today = 0u64;
    let mut requests_this_window = 0u64;
    for k in &keys {
        let meter_key = format!("key:{}", k.key_hash);
        requests_today += state.meter.daily_count(&meter_key, now);
        requests_this_window += state.meter.count(&meter_key);
    }
    let tier = user.tier;
    json_response(
        StatusCode::OK,
        &json!({
            "user": {
                "id": user.id,
                "login": user.login,
                "name": user.name,
                "email": user.email,
                "avatarUrl": user.avatar_url,
                "tier": tier.as_str(),
                "createdAt": user.created_ms,
            },
            "plan": tier.as_str(),
            "keys": keys.iter().map(|k| owner_key_json(&state, k)).collect::<Vec<_>>(),
            "usage": {
                "requestsToday": requests_today,
                "requestsThisWindow": requests_this_window,
                "rpm": tier.rpm(),
                "dailyQuota": daily_quota(tier),
            },
        }),
    )
}

/// Free/Pro daily quotas (mirrors the pricing page).
fn daily_quota(tier: Tier) -> u64 {
    match tier {
        Tier::Free => 5_000,
        Tier::Pro => 100_000,
    }
}

/// `POST /v1/auth/logout` — deletes the session row and clears the cookie.
async fn logout(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Response {
    if let Some(token) = session_cookie(&headers) {
        if let Some(auth) = state.auth.as_ref() {
            let _ = auth.delete_session(&token).await;
        }
    }
    let mut resp = (StatusCode::NO_CONTENT, "").into_response();
    if let Ok(v) = header::HeaderValue::from_str(&clear_session_cookie()) {
        resp.headers_mut().append(header::SET_COOKIE, v);
    }
    resp
}

// ---------------- per-user key management ----------------

/// `GET /v1/account/keys` — the session's keys (owner view).
async fn list_account_keys(State(state): State<Arc<AppState>>, headers: HeaderMap) -> Response {
    let user = match require_user(&state, &headers).await {
        Ok(u) => u,
        Err(p) => return p.into_response(),
    };
    match state.auth.as_ref().unwrap().keys_for_user(&user.id).await {
        Ok(keys) => json_response(
            StatusCode::OK,
            &json!({ "keys": keys.iter().map(|k| owner_key_json(&state, k)).collect::<Vec<_>>() }),
        ),
        Err(e) => Problem(e).into_response(),
    }
}

/// `POST /v1/account/keys` — creates a key for the session user.
/// Body: `{ "label": "...", "env": "live"|"test" }`. Plaintext shown once.
async fn create_account_key(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: String,
) -> Response {
    let user = match require_user(&state, &headers).await {
        Ok(u) => u,
        Err(p) => return p.into_response(),
    };
    let parsed: serde_json::Value = match serde_json::from_str(&body) {
        Ok(v) => v,
        Err(e) => return Problem(Error::BadRequest(format!("invalid json: {e}"))).into_response(),
    };
    let label = parsed["label"].as_str().unwrap_or("production").trim();
    if label.is_empty() || label.len() > 40 {
        return Problem(Error::BadRequest("label must be 1-40 characters".into())).into_response();
    }
    let env = parsed["env"].as_str().unwrap_or("live");
    let auth = state.auth.as_ref().unwrap();
    match auth.create_key_for_user(&user, label, env).await {
        Ok((record, plaintext)) => json_response(
            StatusCode::CREATED,
            &json!({
                "key": owner_key_json(&state, &record),
                "plaintext": plaintext,
            }),
        ),
        Err(e) => Problem(e).into_response(),
    }
}

/// `DELETE /v1/account/keys/:keyHash` — owner-checked revoke.
async fn delete_account_key(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(key_hash): Path<String>,
) -> Response {
    let user = match require_user(&state, &headers).await {
        Ok(u) => u,
        Err(p) => return p.into_response(),
    };
    let auth = state.auth.as_ref().unwrap();
    match auth.revoke_owned(&user.id, &key_hash).await {
        Ok(true) => (StatusCode::NO_CONTENT, "").into_response(),
        Ok(false) => Problem(Error::UnknownVariant(
            "key not found for this account".into(),
        ))
        .into_response(),
        Err(e) => Problem(e).into_response(),
    }
}

/// `PUT /v1/account/keys/:keyHash/origins` — owner-checked origin pinning.
/// Body: `{ "origins": ["github.com", "app.acme.dev:8080"] }`.
async fn update_account_key_origins(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(key_hash): Path<String>,
    body: String,
) -> Response {
    let user = match require_user(&state, &headers).await {
        Ok(u) => u,
        Err(p) => return p.into_response(),
    };
    let auth = state.auth.as_ref().unwrap();
    // ownership check before any mutation
    let owned = match auth.keys_for_user(&user.id).await {
        Ok(keys) => keys.iter().any(|k| k.key_hash == key_hash),
        Err(e) => return Problem(e).into_response(),
    };
    if !owned {
        return Problem(Error::UnknownVariant(
            "key not found for this account".into(),
        ))
        .into_response();
    }
    let parsed: serde_json::Value = match serde_json::from_str(&body) {
        Ok(v) => v,
        Err(e) => return Problem(Error::BadRequest(format!("invalid json: {e}"))).into_response(),
    };
    let Some(raw) = parsed["origins"].as_array() else {
        return Problem(Error::BadRequest(
            "body must be { \"origins\": [...] }".into(),
        ))
        .into_response();
    };
    let mut origins: Vec<String> = Vec::new();
    for v in raw {
        match v.as_str().and_then(normalize_origin_host) {
            Some(host) => origins.push(host),
            None => {
                return Problem(Error::BadRequest(format!(
                    "'{}' is not a valid host (expected host[:port], e.g. github.com)",
                    v.as_str().unwrap_or("")
                )))
                .into_response();
            }
        }
    }
    origins.sort();
    origins.dedup();
    match auth.set_allowed_origins(&key_hash, origins).await {
        Ok(Some(updated)) => json_response(StatusCode::OK, &owner_key_json(&state, &updated)),
        Ok(None) => Problem(Error::UnknownVariant(
            "key not found for this account".into(),
        ))
        .into_response(),
        Err(e) => Problem(e).into_response(),
    }
}

/// Mounts every dashboard/account route.
pub fn build() -> Router<Arc<AppState>> {
    Router::new()
        .route("/v1/auth/github/login", get(github_login))
        .route("/v1/auth/github/callback", get(github_callback))
        .route("/v1/auth/me", get(me))
        .route("/v1/auth/logout", post(logout))
        .route(
            "/v1/account/keys",
            get(list_account_keys).post(create_account_key),
        )
        .route("/v1/account/keys/{keyHash}", delete(delete_account_key))
        .route(
            "/v1/account/keys/{keyHash}/origins",
            axum::routing::put(update_account_key_origins),
        )
}

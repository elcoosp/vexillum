//! Route definitions (spec §10.1).

use std::collections::HashMap;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

use axum::Router;
use axum::extract::{Path, Query, State};
use axum::http::{HeaderMap, HeaderValue, StatusCode, header};
use axum::response::{IntoResponse, Response};
use axum::routing::{get, post};
use vexillum_auth::{ApiKey, Tier};
use vexillum_cache::{CacheKeyInput, cache_control_header, cache_key, etag};
use vexillum_core::{BadgeData, Error, Format, Scale};
use vexillum_render::RenderRequest;

use crate::error_response::Problem;
use crate::fonts::FontFace;
use crate::params::BadgeQuery;
use crate::state::{AppState, resolve_render_theme};

/// Identity derived from the request: an API key or anonymous client.
#[derive(Debug, Clone)]
pub enum Identity {
    Anonymous,
    Key(ApiKey),
}

impl Identity {
    fn tier(&self) -> Tier {
        match self {
            Identity::Anonymous => Tier::Free,
            Identity::Key(k) => k.tier,
        }
    }

    fn meter_key(&self, ip: &str) -> String {
        match self {
            Identity::Anonymous => format!("ip:{ip}"),
            Identity::Key(k) => format!("key:{}", k.key_hash),
        }
    }
}

/// Resolves the identity: `Authorization: Bearer <key>` or `?key=` param.
///
/// When the key carries a per-key origin allowlist, the request's
/// Origin/Referer host must match one of the pinned hosts — a keyed request
/// from any other site (or with no origin at all) is rejected with 403, so a
/// leaked key cannot be spent from someone else's site. README images stay
/// keyless and are unaffected: pinning only guards metered, keyed traffic.
async fn identity_from(
    state: &AppState,
    headers: &HeaderMap,
    query: &HashMap<String, String>,
) -> std::result::Result<Identity, Problem> {
    let plaintext = headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(str::to_string)
        .or_else(|| query.get("key").cloned());
    if let (Some(token), Some(auth)) = (plaintext, state.auth.as_ref()) {
        if let Ok(Some(record)) = auth.verify(&token).await {
            if !record.allowed_origins.is_empty() {
                let host = request_origin_host(headers).ok_or_else(|| {
                    Problem(Error::Forbidden(
                        "this key is pinned to specific origins and the request carries none"
                            .into(),
                    ))
                })?;
                if !record.allowed_origins.iter().any(|o| o == &host) {
                    return Err(Problem(Error::Forbidden(format!(
                        "origin '{host}' is not on this key's allowlist"
                    ))));
                }
            }
            return Ok(Identity::Key(record));
        }
    }
    Ok(Identity::Anonymous)
}

/// The request's origin host (`host[:port]`, lowercase) from the `Origin`
/// header first, then the `Referer` — the headers browsers attach to
/// cross-site image loads. None when neither is present.
fn request_origin_host(headers: &HeaderMap) -> Option<String> {
    let raw = headers
        .get(header::ORIGIN)
        .and_then(|v| v.to_str().ok())
        .or_else(|| headers.get(header::REFERER).and_then(|v| v.to_str().ok()))?;
    normalize_origin_host(raw)
}

/// Normalizes any origin-ish string (`https://app.acme.dev:8080/path`,
/// `app.acme.dev`) to `app.acme.dev:8080` — the same contract the dashboard's
/// origin editor uses. Returns None for unparsable input.
pub fn normalize_origin_host(raw: &str) -> Option<String> {
    let v = raw.trim().to_ascii_lowercase();
    if v.is_empty() {
        return None;
    }
    let host = v
        .split_once("://")
        .map(|(_, rest)| rest)
        .unwrap_or(&v)
        .split(['/', '?', '#'])
        .next()?;
    if host.is_empty() || !host.contains('.') {
        return None;
    }
    let (name, port) = match host.split_once(':') {
        Some((n, p)) => (n, Some(p)),
        None => (host, None),
    };
    let name_ok = !name.is_empty()
        && name
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-');
    let port_ok = match port {
        None => true,
        Some(p) => !p.is_empty() && p.chars().all(|c| c.is_ascii_digit()),
    };
    if name_ok && port_ok {
        Some(host.to_string())
    } else {
        None
    }
}

/// Resolves the client IP for metering.
///
/// `X-Forwarded-For` is honored ONLY when the deployment explicitly opts in
/// (`trust_proxy` — the server sits behind a proxy that OVERWRITES the
/// chain). Otherwise the direct socket address is used, so a spoofable
/// header can never dilute or dodge the per-IP rate-limit bucket.
fn client_ip(
    state: &AppState,
    headers: &HeaderMap,
    connect_info: Option<std::net::SocketAddr>,
) -> String {
    const MAX_IP_LEN: usize = 45; // IPv6 textual maximum
    if state.config.trust_proxy {
        if let Some(xff) = headers
            .get("x-forwarded-for")
            .and_then(|v| v.to_str().ok())
        {
            if let Some(hop) = xff.split(',').next().map(str::trim) {
                let plausible = hop.len() <= MAX_IP_LEN
                    && !hop.is_empty()
                    && hop
                        .chars()
                        .all(|c| c.is_ascii_hexdigit() || matches!(c, '.' | ':' | '[' | ']'));
                if plausible {
                    return hop.to_ascii_lowercase();
                }
            }
        }
    }
    connect_info
        .map(|a| a.ip().to_string())
        .unwrap_or_else(|| "unknown".to_string())
}

/// Caps free-text slot content so a multi-megabyte path segment cannot burn
/// renderer work before anything rejects it (HTML escaping already makes it
/// safe — this bounds the WORK). `extra` is tighter: it is a third segment,
/// not a message.
const MAX_SEGMENT_CHARS: usize = 256;
const MAX_EXTRA_CHARS: usize = 64;

fn cap_segment(kind: &str, s: &str, max: usize) -> std::result::Result<String, Problem> {
    if s.chars().count() > max {
        Err(Problem(Error::BadRequest(format!(
            "{kind} exceeds {max} characters"
        ))))
    } else {
        Ok(s.to_string())
    }
}

pub(crate) fn json_response(status: StatusCode, value: &impl serde::Serialize) -> Response {
    let body = serde_json::to_string(value).unwrap_or_else(|_| "{}".into());
    (status, [(header::CONTENT_TYPE, "application/json")], body).into_response()
}

fn bytes_response(
    status: StatusCode,
    content_type: &str,
    bytes: Vec<u8>,
    cache_ttl: Duration,
    key: &[u8; 32],
    extra_headers: &[(&str, String)],
) -> Response {
    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        HeaderValue::from_str(content_type)
            .unwrap_or(HeaderValue::from_static("application/octet-stream")),
    );
    headers.insert(
        header::CACHE_CONTROL,
        HeaderValue::from_str(&cache_control_header(cache_ttl)).expect("ascii"),
    );
    headers.insert(
        header::ETAG,
        HeaderValue::from_str(&etag(key)).expect("ascii"),
    );
    for (name, value) in extra_headers {
        if let (Ok(n), Ok(v)) = (
            header::HeaderName::try_from(*name),
            HeaderValue::from_str(value),
        ) {
            headers.insert(n, v);
        }
    }
    (status, headers, bytes).into_response()
}

/// Rate limit + tier gate shared by badge routes.
fn gate(
    state: &AppState,
    identity: &Identity,
    format: Format,
    client_ip: &str,
) -> std::result::Result<Tier, Problem> {
    let tier = identity.tier();
    if !tier.allows(format) {
        return Err(Problem(Error::PaymentRequired(format!(
            "format '{format:?}' requires a paid plan"
        ))));
    }
    let rpm = match identity {
        Identity::Anonymous => state.config.anonymous_rpm,
        Identity::Key(_) => tier.rpm(),
    };
    if !state.meter.hit(&identity.meter_key(client_ip), rpm, now_ms()) {
        state
            .stats
            .rate_limited
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        return Err(Problem(Error::RateLimited));
    }
    Ok(tier)
}

pub(crate) fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn theme_hash(theme: &Option<vexillum_theme::ResolvedTheme>) -> [u8; 32] {
    use sha2::{Digest, Sha256};
    match theme {
        Some(t) => Sha256::digest(t.css_root_block().as_bytes()).into(),
        None => [0u8; 32],
    }
}

fn icon_hash(icon_html: &Option<String>) -> [u8; 32] {
    use sha2::{Digest, Sha256};
    match icon_html {
        Some(svg) => Sha256::digest(svg.as_bytes()).into(),
        None => [0u8; 32],
    }
}

/// Renders through the cache: hit → serve; miss → render + store. Returns
/// the bytes, the cache key, and the EFFECTIVE ttl the entry was stored
/// with (tier floor applied) so response headers match reality.
async fn render_with_cache(
    state: &AppState,
    identity: &Identity,
    request: &RenderRequest,
    ttl: Duration,
) -> std::result::Result<(Vec<u8>, [u8; 32], Duration), Problem> {
    let theme = request.theme.clone();
    let icon_html = request.icon_html.clone();
    let key = cache_key(&CacheKeyInput {
        variant: &request.variant,
        label: &request.data.label,
        value: &request.data.value,
        extra: request.data.extra.as_deref(),
        extra2: request.data.extra2.as_deref(),
        theme_hash: &theme_hash(&theme),
        icon_hash: &icon_hash(&icon_html),
        font_family: request.font_family.as_deref(),
        no_icon: request.no_icon,
        format: request.format,
        scale: request.scale,
        pad: request.pad,
    });

    if let Some(entry) = state.cache.get(&key).await {
        // `entry.ttl` is the effective (tier-floored) ttl the entry was
        // stored with — response headers stay consistent on hits too.
        state
            .stats
            .cache_hits
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        return Ok((entry.bytes.as_ref().clone(), key, entry.ttl));
    }
    state
        .stats
        .cache_misses
        .fetch_add(1, std::sync::atomic::Ordering::Relaxed);

    // render on a blocking-friendly thread (vexillum is sync + fast)
    let owned = request.clone();
    let bytes = {
        let render_request = owned;
        tokio::task::spawn_blocking(move || vexillum_render::render_static_bytes(&render_request))
            .await
            .map_err(|e| Problem(Error::Render(format!("render task panicked: {e}"))))?
            .map_err(Problem)?
    };

    // tier TTL floor (spec §11.2): cache no shorter than the tier allows
    let tier = identity.tier();
    let effective_ttl = ttl.max(Duration::from_secs(tier.cache_floor_secs()));
    state.cache.put(&key, bytes.clone(), effective_ttl).await;
    Ok((bytes, key, effective_ttl))
}

/// Loads the Google font face for a query (process cache → network), if the
/// `?font=` selection points at a Google family. Bundled/none need no I/O.
async fn resolve_font_face(query: &BadgeQuery) -> std::result::Result<Option<FontFace>, Problem> {
    crate::fonts::load_font_bytes(&query.font)
        .await
        .map_err(Problem)
}

fn if_none_match_hit(headers: &HeaderMap, key: &[u8; 32]) -> bool {
    headers
        .get(header::IF_NONE_MATCH)
        .and_then(|v| v.to_str().ok())
        .map(|v| v.contains(&etag(key)) || v.trim() == "*")
        .unwrap_or(false)
}

// ---------------- routes ----------------

async fn static_badge_inner(
    state: &Arc<AppState>,
    collection: &str,
    variant: &str,
    label: &str,
    value: &str,
    extra: Option<&str>,
    query: &HashMap<String, String>,
    headers: &HeaderMap,
    client_ip: &str,
) -> std::result::Result<Response, Problem> {
    let identity = identity_from(state, headers, query).await?;
    let query = BadgeQuery::from_map(query)?;

    // resolve variant: accept bare id (c01-01) or collection-qualified
    let manifest = vexillum_templates::manifest();
    let meta = manifest
        .variant(variant)
        // `collection` must actually own the variant: accept the collection
        // id (c01) or slug (foundational), resolved through the manifest. The
        // previous right operand (`collection == collection_slug(collection)`)
        // was a tautology that let any collection prefix serve any variant.
        .filter(|v| {
            manifest
                .collection(collection)
                .is_some_and(|c| c.id == v.collection)
        })
        .or_else(|| {
            // collection slug + index form: /badge/foundational/01/build/passing
            let col = manifest.collection(collection)?;
            let index: usize = variant.parse().ok()?;
            let full = format!("{}-{:02}", col.id, index);
            manifest.variant(&full)
        })
        .ok_or_else(|| Problem(Error::UnknownVariant(format!("{collection}/{variant}"))))?;

    let format = query.format.unwrap_or(Format::Svg);
    let tier = gate(state, &identity, format, client_ip)?;

    // demand stats: every valid static badge request counts toward
    // `GET /v1/stats/popular` (cache hits included — this is demand, not work)
    state.record_variant_render(&meta.id);

    let theme = resolve_render_theme(
        query.theme.as_deref(),
        query.seed.as_deref(),
        query.mode,
        state.config.default_theme.as_deref(),
        query.seed2.as_deref(),
    )
    .map_err(Problem)?;

    let icon_html = resolve_icon_html(state, &query)?;
    let font_face = resolve_font_face(&query).await?;
    let data = BadgeData {
        label: cap_segment("label", &urldecode(label), MAX_SEGMENT_CHARS)?,
        value: cap_segment("value", &urldecode(value), MAX_SEGMENT_CHARS)?,
        extra: match extra
            .map(str::to_string)
            .or_else(|| query.extra.clone().filter(|v| !v.is_empty()))
        {
            Some(e) => Some(cap_segment("extra", &e, MAX_EXTRA_CHARS)?),
            None => None,
        },
        extra2: match query.extra2.clone().filter(|v| !v.is_empty()) {
            Some(e) => Some(cap_segment("extra2", &e, MAX_EXTRA_CHARS)?),
            None => None,
        },
        color: None,
        cache_seconds: None,
    };
    let request = RenderRequest {
        variant: meta.id.clone(),
        data,
        theme,
        icon_html,
        no_icon: query.no_icon,
        font_family: query.font.family().map(str::to_string),
        font_bytes: font_face.map(|f| f.bytes),
        format,
        scale: query.scale.unwrap_or(Scale::One),
        // None = auto (static output trims to the painted content; animated
        // keeps the default pad). Explicit ?pad= gets exactly what it asks.
        pad: query.pad.map(|p| p.min(state.config.max_pad)),
    };

    let ttl = Duration::from_secs(3600);
    let (bytes, key, ttl) = render_with_cache(state, &identity, &request, ttl).await?;
    if if_none_match_hit(headers, &key) {
        return Ok(StatusCode::NOT_MODIFIED.into_response());
    }
    Ok(bytes_response(
        StatusCode::OK,
        format.content_type(),
        bytes,
        ttl,
        &key,
        &[
            ("X-Variant", meta.id.clone()),
            ("X-Tier", format!("{tier:?}").to_lowercase()),
        ],
    ))
}

fn urldecode(s: &str) -> String {
    // axum already percent-decodes Path extracts; keep passthrough
    s.to_string()
}

/// Resolves the icon override HTML from query params.
fn resolve_icon_html(
    state: &AppState,
    query: &BadgeQuery,
) -> std::result::Result<Option<String>, Problem> {
    let spec = query.icon.clone().or_else(|| query.logo.clone());
    match spec {
        None => Ok(None),
        Some(vexillum_icons::IconSpec::Upload(hash)) => {
            let svg = state
                .icons
                .get(&hash)
                .map_err(Problem)?
                .ok_or_else(|| Problem(Error::UnknownIcon(format!("upload:{hash}"))))?;
            let size = query.icon_size.unwrap_or(14);
            Ok(Some(vexillum_icons::icon_span(
                &vexillum_icons::ResolvedIcon {
                    svg,
                    width: size,
                    height: size,
                },
            )))
        }
        Some(vexillum_icons::IconSpec::Simple(slug)) => {
            // default = the badge's own ink (currentColor): themed icons stay
            // readable on every surface, light or dark; `icon.color=brand`
            // opts back into the raw brand hex
            let color = query
                .icon_color
                .clone()
                .unwrap_or(vexillum_icons::IconColor::Current);
            let size = query.icon_size.unwrap_or(14);
            // brands first (brand hex), then the 33k+ icondata catalog
            let icon = vexillum_icons::resolve_any(&slug, &color, size).map_err(Problem)?;
            Ok(Some(vexillum_icons::icon_span(&icon)))
        }
    }
}

/// `GET /badge/:service/*path` — dynamic data badges.
async fn dynamic_badge_inner(
    state: &Arc<AppState>,
    service: &str,
    rest: &str,
    query: &HashMap<String, String>,
    headers: &HeaderMap,
    client_ip: &str,
) -> std::result::Result<Response, Problem> {
    // compatibility paths
    if service == "dynamic" {
        return dynamic_json_inner(state, query, headers, client_ip).await;
    }
    if service == "endpoint" {
        return endpoint_inner(state, query, headers, client_ip).await;
    }

    let svc = state
        .services
        .find(service)
        .ok_or_else(|| Problem(Error::UnknownService(service.to_string())))?;
    let identity = identity_from(state, headers, query).await?;
    let query_params = BadgeQuery::from_map(query)?;
    let format = query_params.format.unwrap_or(Format::Svg);
    gate(state, &identity, format, client_ip)?;

    let mut data = svc.fetch(rest, &reqwest_client()).await.map_err(Problem)?;
    if let Some(ex) = &query_params.extra {
        data.extra = Some(ex.clone());
    }
    if let Some(ex) = &query_params.extra2 {
        data.extra2 = Some(ex.clone());
    }
    // upstream payloads are untrusted size-wise too — same work bounds as
    // the static path
    data.label = cap_segment("label", &data.label, MAX_SEGMENT_CHARS)?;
    data.value = cap_segment("value", &data.value, MAX_SEGMENT_CHARS)?;
    if let Some(ex) = &data.extra {
        data.extra = Some(cap_segment("extra", ex, MAX_EXTRA_CHARS)?);
    }
    if let Some(ex) = &data.extra2 {
        data.extra2 = Some(cap_segment("extra2", ex, MAX_EXTRA_CHARS)?);
    }
    let theme = resolve_render_theme(
        query_params.theme.as_deref(),
        query_params.seed.as_deref(),
        query_params.mode,
        None,
        query_params.seed2.as_deref(),
    )
    .map_err(Problem)?;
    let icon_html = resolve_icon_html(state, &query_params)?;
    let font_face = resolve_font_face(&query_params).await?;
    let request = RenderRequest {
        variant: "c01-04".to_string(), // default dynamic anatomy
        data,
        theme,
        icon_html,
        no_icon: query_params.no_icon,
        font_family: query_params.font.family().map(str::to_string),
        font_bytes: font_face.map(|f| f.bytes),
        format,
        scale: query_params.scale.unwrap_or(Scale::One),
        pad: query_params.pad.map(|p| p.min(state.config.max_pad)),
    };
    let ttl = Duration::from_secs(svc.default_ttl());
    let (bytes, key, ttl) = render_with_cache(state, &identity, &request, ttl).await?;
    if if_none_match_hit(headers, &key) {
        return Ok(StatusCode::NOT_MODIFIED.into_response());
    }
    Ok(bytes_response(
        StatusCode::OK,
        format.content_type(),
        bytes,
        ttl,
        &key,
        &[],
    ))
}

fn reqwest_client() -> vexillum_data::HttpClient {
    vexillum_data::HttpClient::builder()
        .user_agent("vexillum")
        // every hostname resolves through the SSRF guard: connections may
        // only use globally-routable addresses (no check-then-connect gap —
        // the verified addresses ARE the ones dialed)
        .dns_resolver(std::sync::Arc::new(vexillum_data::ssrf::PublicHostDns))
        .build()
        .expect("client")
}

async fn dynamic_json_inner(
    state: &Arc<AppState>,
    query: &HashMap<String, String>,
    headers: &HeaderMap,
    client_ip: &str,
) -> std::result::Result<Response, Problem> {
    let identity = identity_from(state, headers, query).await?;
    let params = BadgeQuery::from_map(query)?;
    let format = params.format.unwrap_or(Format::Svg);
    gate(state, &identity, format, client_ip)?;

    let url = query
        .get("url")
        .ok_or_else(|| Problem(Error::BadRequest("missing url".into())))?;
    let jq = query.get("query").map(String::as_str).unwrap_or("");
    let prefix = query.get("prefix").map(String::as_str).unwrap_or("");
    let suffix = query.get("suffix").map(String::as_str).unwrap_or("");
    let label = query
        .get("label")
        .cloned()
        .unwrap_or_else(|| "custom".into());

    let svc = state
        .services
        .find("dynamic")
        .ok_or_else(|| Problem(Error::UnknownService("dynamic".into())))?;
    let data = svc.fetch("", &reqwest_client()).await; // trait signature; dynamic needs params
    let _ = data;
    // The generic service exposes fetch_dynamic; call it through the concrete
    // service stored in the registry.
    let generic = vexillum_data::generic::GenericJsonService::new();
    let mut data = generic
        .fetch_dynamic(
            &reqwest_client(),
            &vexillum_data::generic::DynamicRequest {
                url,
                query: jq,
                prefix,
                suffix,
            },
        )
        .await
        .map_err(Problem)?;
    data.label = cap_segment("label", &label, MAX_SEGMENT_CHARS)?;
    if let Some(ex) = &params.extra {
        data.extra = Some(ex.clone());
    }
    if let Some(ex) = &params.extra2 {
        data.extra2 = Some(ex.clone());
    }
    data.value = cap_segment("value", &data.value, MAX_SEGMENT_CHARS)?;
    if let Some(ex) = &data.extra {
        data.extra = Some(cap_segment("extra", ex, MAX_EXTRA_CHARS)?);
    }
    if let Some(ex) = &data.extra2 {
        data.extra2 = Some(cap_segment("extra2", ex, MAX_EXTRA_CHARS)?);
    }

    let theme = resolve_render_theme(
        params.theme.as_deref(),
        params.seed.as_deref(),
        params.mode,
        None,
        params.seed2.as_deref(),
    )
    .map_err(Problem)?;
    let font_face = resolve_font_face(&params).await?;
    let request = RenderRequest::new("c01-04", data, format);
    let request = RenderRequest {
        theme,
        font_family: params.font.family().map(str::to_string),
        font_bytes: font_face.map(|f| f.bytes),
        ..request
    };
    let ttl = Duration::from_secs(300);
    let (bytes, key, ttl) = render_with_cache(state, &identity, &request, ttl).await?;
    Ok(bytes_response(
        StatusCode::OK,
        format.content_type(),
        bytes,
        ttl,
        &key,
        &[],
    ))
}

async fn endpoint_inner(
    state: &Arc<AppState>,
    query: &HashMap<String, String>,
    headers: &HeaderMap,
    client_ip: &str,
) -> std::result::Result<Response, Problem> {
    let identity = identity_from(state, headers, query).await?;
    let params = BadgeQuery::from_map(query)?;
    let format = params.format.unwrap_or(Format::Svg);
    gate(state, &identity, format, client_ip)?;
    let url = query
        .get("url")
        .ok_or_else(|| Problem(Error::BadRequest("missing url".into())))?;

    let svc = vexillum_data::endpoint::EndpointService::new();
    let mut data = svc
        .fetch_endpoint(
            &reqwest_client(),
            &vexillum_data::endpoint::EndpointRequest { url },
        )
        .await
        .map_err(Problem)?;
    if let Some(label) = query.get("label") {
        data.label = cap_segment("label", label, MAX_SEGMENT_CHARS)?;
    }
    if let Some(ex) = &params.extra {
        data.extra = Some(ex.clone());
    }
    if let Some(ex) = &params.extra2 {
        data.extra2 = Some(ex.clone());
    }
    data.value = cap_segment("value", &data.value, MAX_SEGMENT_CHARS)?;
    if let Some(ex) = &data.extra {
        data.extra = Some(cap_segment("extra", ex, MAX_EXTRA_CHARS)?);
    }
    if let Some(ex) = &data.extra2 {
        data.extra2 = Some(cap_segment("extra2", ex, MAX_EXTRA_CHARS)?);
    }
    let theme = resolve_render_theme(
        params.theme.as_deref(),
        params.seed.as_deref(),
        params.mode,
        None,
        params.seed2.as_deref(),
    )
    .map_err(Problem)?;
    let font_face = resolve_font_face(&params).await?;
    let request = RenderRequest {
        theme,
        font_family: params.font.family().map(str::to_string),
        font_bytes: font_face.map(|f| f.bytes),
        ..RenderRequest::new("c01-04", data, format)
    };
    let ttl = Duration::from_secs(300);
    let (bytes, key, ttl) = render_with_cache(state, &identity, &request, ttl).await?;
    Ok(bytes_response(
        StatusCode::OK,
        format.content_type(),
        bytes,
        ttl,
        &key,
        &[],
    ))
}

/// `GET /v1/variants` — the registry manifest.
async fn variants() -> Response {
    json_response(StatusCode::OK, vexillum_templates::manifest())
}

/// `GET /v1/meta` — machine-readable catalog overview for agents and
/// integrators: counts, the URL grammar, every query parameter (including
/// the dual-seed `?seed2=`), formats, themes and where to pull deeper
/// discovery (variants / icons / fonts / stats). The single entry point an
/// agent can probe before touching any other route.
async fn meta() -> Response {
    let manifest = vexillum_templates::manifest();
    let presets: Vec<serde_json::Value> = vexillum_theme::PRESET_SEEDS
        .iter()
        .map(|(name, seed)| serde_json::json!({ "name": name, "seed": seed }))
        .collect();
    json_response(
        StatusCode::OK,
        &serde_json::json!({
            "service": "vexillum",
            "badgeUrl": "/badge/{collection}/{variant}/{label}/{value}.{format}",
            "collections": {
                "count": manifest.collections.len(),
                "ids": manifest.collections.iter().map(|c| c.id.clone()).collect::<Vec<_>>(),
            },
            "variants": {
                "count": manifest.variants.len(),
                "addressableBy": ["<id> (c01-01)", "<collection>/<index> (foundational/01)"],
            },
            "formats": {
                "free": ["svg", "png", "jpg"],
                "pro": ["webp", "gif", "apng"],
                "animated": ["gif", "apng"],
            },
            "params": {
                "theme": "<preset-name> — one of the seeds below",
                "seed": "<hex> — custom semantic seed, overrides theme",
                "seed2": "<hex> — second, independent seed for the VALUE segment (vx-v-* token family); rides any base",
                "mode": "light|dark",
                "icon": "<brand-slug> | <set>-<name> | none",
                "icon.color": "currentColor (default) | brand | <css color>",
                "font": "<slug> — bundled or Google Fonts catalog",
                "scale": "1|2|3", "pad": "0..=64", "extra": "<third-segment text>",
                "extra2": "<fourth-segment text — quad badges (c17-08)>",
                "format": "svg|png|jpg|webp|gif|apng",
            },
            "themes": { "presets": presets },
            "discovery": {
                "variants": "/v1/variants (full manifest)",
                "icons": "/v1/icons?q=",
                "fonts": "/v1/fonts",
                "popular": "/v1/stats/popular?limit=20",
                "usage": "/v1/usage (auth'd per-key meters)",
            },
            "caching": "ETag + Cache-Control: public, max-age=3600, immutable; conditional GETs return 304",
        }),
    )
}

/// `GET /v1/themes` — seed presets for the semantic OKLCH ramp.
async fn themes() -> Response {
    let presets: Vec<serde_json::Value> = vexillum_theme::PRESET_SEEDS
        .iter()
        .map(|(name, seed)| serde_json::json!({ "name": name, "seed": seed }))
        .collect();
    json_response(StatusCode::OK, &serde_json::json!({ "presets": presets }))
}

/// `POST /v1/themes` — resolves the semantic ramp for a brand color (the
/// seed). Accepts `{ "brand": "<hex>" }` or `{ "seed": "<hex>",
/// "mode": "light|dark" }` and returns the full resolved palette.
async fn create_theme(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: String,
) -> Response {
    let identity = match identity_from(&state, &headers, &HashMap::new()).await {
        Ok(i) => i,
        Err(p) => return p.into_response(),
    };
    if matches!(identity, Identity::Anonymous) {
        return Problem(Error::Unauthorized("authentication required".into())).into_response();
    }
    let parsed: serde_json::Value = match serde_json::from_str(&body) {
        Ok(v) => v,
        Err(e) => return Problem(Error::BadRequest(format!("invalid json: {e}"))).into_response(),
    };
    let brand = parsed["brand"]
        .as_str()
        .or_else(|| parsed["seed"].as_str())
        .ok_or_else(|| Problem(Error::BadRequest("missing 'brand' color".into())));
    let brand = match brand {
        Ok(v) => v,
        Err(p) => return p.into_response(),
    };
    let normalized = if brand.starts_with('#') {
        brand.to_string()
    } else {
        format!("#{brand}")
    };
    let color = match vexillum_theme::Oklch::parse(&normalized) {
        Some(c) => c,
        None => {
            return Problem(Error::BadRequest(format!("invalid brand color '{brand}'")))
                .into_response();
        }
    };
    let mode = parsed["mode"]
        .as_str()
        .and_then(vexillum_theme::Mode::parse)
        .unwrap_or(vexillum_theme::Mode::Light);
    let theme = vexillum_theme::semantic_theme(&color, mode, &format!("brand:{}", brand));
    // "corrected" when white-on-seed (the ramp's on-accent ink) would fail
    // the naive contrast pick — light seeds need dark foregrounds.
    let corrected =
        vexillum_theme::contrast_text(color) != vexillum_theme::Oklch::parse("#ffffff").unwrap();
    let mut payload = serde_json::to_value(&theme).unwrap_or_default();
    payload["colorCorrected"] = serde_json::Value::Bool(corrected);
    json_response(StatusCode::CREATED, &payload)
}

/// `GET /v1/icons` — icon catalog discovery: Simple Icons brands (the full
/// `simpleicons-rs` dataset) + icondata sets. `?q=` filters brand entries by
/// slug/title substring.
async fn list_icons(
    axum::extract::Query(q): axum::extract::Query<HashMap<String, String>>,
) -> Response {
    let needle = q.get("q").map(|s| s.to_ascii_lowercase());
    let brands: Vec<serde_json::Value> = vexillum_icons::brands()
        .iter()
        .filter(|b| match &needle {
            None => true,
            Some(n) => b.slug.contains(n.as_str()) || b.title.to_ascii_lowercase().contains(n),
        })
        .map(|b| serde_json::json!({ "slug": b.slug, "title": b.title, "hex": b.hex }))
        .collect();
    let curated = vexillum_icons::curated_slugs();
    let sets: Vec<serde_json::Value> = vexillum_icons::icondata_sets()
        .iter()
        .map(|s| serde_json::json!({ "id": s.id, "label": s.label, "count": s.count }))
        .collect();
    json_response(
        StatusCode::OK,
        &serde_json::json!({
            "brands": { "count": curated.len(), "source": "simpleicons-rs", "entries": brands },
            // legacy alias: the bare slug list (kept for existing clients)
            "curated": { "count": curated.len(), "slugs": curated },
            "icondata": {
                "count": vexillum_icons::icondata_total(),
                "sets": sets,
                "slugFormat": "<set>-<kebab-name> (e.g. mdi-account, si-github, lu-git-branch)",
            },
            "usage": "?icon=<slug> or ?icon=<set>-<slug> — unknown slugs are 404 unknown-icon",
        }),
    )
}

/// `GET /v1/fonts` — font catalog discovery: bundled families + the Google
/// Fonts catalog the API can render on demand.
async fn list_fonts() -> Response {
    let bundled = [
        ("inter", "Inter"),
        ("jetbrains-mono", "JetBrains Mono"),
        ("instrument-serif", "Instrument Serif"),
        ("space-mono", "Space Mono"),
    ];
    let google: Vec<serde_json::Value> = vexillum_render::google_fonts::google_font_entries()
        .iter()
        .map(|(slug, family, category)| {
            serde_json::json!({ "slug": slug, "family": family, "category": category })
        })
        .collect();
    json_response(
        StatusCode::OK,
        &serde_json::json!({
            "bundled": {
                "count": bundled.len(),
                "families": bundled.iter().map(|(slug, family)| serde_json::json!({
                    "slug": slug, "family": family,
                })).collect::<Vec<_>>(),
            },
            "google": {
                "count": google.len(),
                "families": google,
                "source": "fetched on demand from fonts.googleapis.com (TTF) and cached",
            },
            "usage": "?font=<slug> — bundled slugs render without network; Google families are fetched once and cached",
        }),
    )
}

/// `POST /v1/icons` — sanitized SVG upload (paid). Authenticated by an API
/// key (Bearer/?key=) OR the dashboard session cookie, so signed-in users can
/// upload without pasting a key into a form.
async fn upload_icon(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Query(query): Query<HashMap<String, String>>,
    body: String,
) -> Response {
    let identity = match identity_from(&state, &headers, &query).await {
        Ok(i) => i,
        Err(p) => return p.into_response(),
    };
    let tier = if matches!(identity, Identity::Anonymous) {
        match crate::auth_routes::session_user_opt(&state, &headers).await {
            Some(user) => user.tier,
            None => {
                return Problem(Error::Unauthorized("authentication required".into()))
                    .into_response();
            }
        }
    } else {
        identity.tier()
    };
    if tier == Tier::Free {
        return Problem(Error::PaymentRequired(
            "icon upload requires a paid plan".into(),
        ))
        .into_response();
    }
    match state.icons.put(&body) {
        Ok(stored) => json_response(
            StatusCode::CREATED,
            &serde_json::json!({ "hash": stored.hash, "bytes": stored.bytes, "reference": format!("upload:{}", stored.hash) }),
        ),
        Err(e) => Problem(e).into_response(),
    }
}

/// `GET /v1/usage` — current-window meter counts.
async fn usage(
    State(state): State<Arc<AppState>>,
    Query(query): Query<HashMap<String, String>>,
    headers: HeaderMap,
    axum::extract::ConnectInfo(addr): axum::extract::ConnectInfo<std::net::SocketAddr>,
) -> Response {
    let identity = match identity_from(&state, &headers, &query).await {
        Ok(i) => i,
        Err(p) => return p.into_response(),
    };
    let ip = client_ip(&state, &headers, Some(addr));
    let count = state.meter.count(&identity.meter_key(&ip));
    json_response(
        StatusCode::OK,
        &serde_json::json!({ "requestsThisWindow": count, "rpm": identity.tier().rpm() }),
    )
}

/// `GET /v1/stats/popular?limit=20` — the most-requested badge variants.
/// Public, aggregate, in-memory (per process): the ranking answers "which
/// badges are the most used". Every valid static badge request bumps its
/// variant, cache hits included.
async fn popular_stats(
    State(state): State<Arc<AppState>>,
    Query(query): Query<HashMap<String, String>>,
) -> Response {
    let limit = query
        .get("limit")
        .and_then(|v| v.parse::<usize>().ok())
        .map(|l| l.clamp(1, 100))
        .unwrap_or(20);
    let tracked = state.usage.lock().len();
    let variants: Vec<serde_json::Value> = state
        .popular_variants(limit)
        .into_iter()
        .map(|(variant, renders)| serde_json::json!({ "variant": variant, "renders": renders }))
        .collect();
    json_response(
        StatusCode::OK,
        &serde_json::json!({
            "total": state.total_variant_renders(),
            "trackedVariants": tracked,
            "limit": limit,
            "variants": variants,
        }),
    )
}

/// `PUT /v1/keys/origins` — replaces the calling key's origin allowlist.
/// Body: `{ "origins": ["github.com", "app.acme.dev:8080"] }` (hosts, not
/// URLs). Authenticated by the key itself (Bearer header or ?key=), so the
/// dashboard can pin origins without any other privileged surface. An empty
/// list lifts the pin (requests allowed from anywhere).
async fn update_key_origins(
    State(state): State<Arc<AppState>>,
    Query(query): Query<HashMap<String, String>>,
    headers: HeaderMap,
    body: String,
) -> Response {
    let auth = match state.auth.as_ref() {
        Some(a) => a.clone(),
        None => {
            return Problem(Error::Unauthorized("auth store not configured".into()))
                .into_response();
        }
    };
    // authenticate FIRST (origin checks don't apply to this management route —
    // a brand-new key starts unpinned)
    let plaintext = headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .map(str::to_string)
        .or_else(|| query.get("key").cloned());
    let token = match plaintext {
        Some(t) => t,
        None => {
            return Problem(Error::Unauthorized("authentication required".into())).into_response();
        }
    };
    let record = match auth.verify(&token).await {
        Ok(Some(r)) => r,
        Ok(None) => return Problem(Error::Unauthorized("unknown key".into())).into_response(),
        Err(e) => return Problem(e).into_response(),
    };

    let parsed: serde_json::Value = match serde_json::from_str(&body) {
        Ok(v) => v,
        Err(e) => return Problem(Error::BadRequest(format!("invalid json: {e}"))).into_response(),
    };
    let raw = match parsed["origins"].as_array() {
        Some(a) => a,
        None => {
            return Problem(Error::BadRequest(
                "body must be { \"origins\": [...] }".into(),
            ))
            .into_response();
        }
    };
    let mut origins: Vec<String> = Vec::new();
    for v in raw {
        let s = match v.as_str() {
            Some(s) => s,
            None => {
                return Problem(Error::BadRequest("origins entries must be strings".into()))
                    .into_response();
            }
        };
        match normalize_origin_host(s) {
            Some(host) => origins.push(host),
            None => {
                return Problem(Error::BadRequest(format!(
                    "'{s}' is not a valid host (expected host[:port], e.g. github.com)"
                )))
                .into_response();
            }
        }
    }
    origins.sort();
    origins.dedup();

    match auth.set_allowed_origins(&record.key_hash, origins).await {
        Ok(Some(updated)) => json_response(
            StatusCode::OK,
            &serde_json::json!({
                "keyHashPrefix": updated.key_hash[..12],
                "label": updated.label,
                "allowedOrigins": updated.allowed_origins,
            }),
        ),
        Ok(None) => Problem(Error::Unauthorized("unknown key".into())).into_response(),
        Err(e) => Problem(e).into_response(),
    }
}

/// `GET /health`
async fn health() -> Response {
    json_response(StatusCode::OK, &serde_json::json!({ "ok": true }))
}

/// `GET /metrics` — minimal Prometheus-style exposition.
async fn metrics(State(state): State<Arc<AppState>>) -> Response {
    use std::sync::atomic::Ordering::Relaxed;
    let s = |a: &std::sync::atomic::AtomicU64| a.load(Relaxed);
    let stats = &state.stats;
    let body = format!(
        "# TYPE tbc_health gauge\ntbc_health 1\n# TYPE tbc_variants gauge\ntbc_variants {}\n\
         # TYPE tbc_badge_requests_total counter\ntbc_badge_requests_total {}\n\
         # TYPE tbc_cache_hits_total counter\ntbc_cache_hits_total {}\n\
         # TYPE tbc_cache_misses_total counter\ntbc_cache_misses_total {}\n\
         # TYPE tbc_rate_limited_total counter\ntbc_rate_limited_total {}\n\
         # TYPE tbc_webhook_events_total counter\ntbc_webhook_events_total {}\n",
        vexillum_templates::manifest().variants.len(),
        s(&stats.badge_requests),
        s(&stats.cache_hits),
        s(&stats.cache_misses),
        s(&stats.rate_limited),
        s(&stats.webhook_events),
    );
    (StatusCode::OK, [(header::CONTENT_TYPE, "text/plain")], body).into_response()
}

/// Single `/badge/*` entry: dispatches static (4 segments), data services
/// (service id first), and the shields-compatibility paths.
///
/// Static badges honor a trailing format extension — the README convention —
/// so `/badge/foundational/c01-01/build/passing.png` renders PNG and
/// `…passing.gif` hits the animated-format tier gate. A known suffix is
/// stripped from the value; an explicit `?format=` wins over it; anything
/// that is not a known format (`v1.2.3`) stays part of the value.
async fn badge_entry(
    State(state): State<Arc<AppState>>,
    Path(path): Path<String>,
    Query(query): Query<HashMap<String, String>>,
    headers: HeaderMap,
    axum::extract::ConnectInfo(addr): axum::extract::ConnectInfo<std::net::SocketAddr>,
) -> Response {
    state
        .stats
        .badge_requests
        .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let ip = client_ip(&state, &headers, Some(addr));
    let segments: Vec<&str> = path.split('/').filter(|s| !s.is_empty()).collect();
    match segments.as_slice() {
        ["dynamic", "json"] => dynamic_json_inner(&state, &query, &headers, &ip)
            .await
            .unwrap_or_else(|p| p.into_response()),
        ["endpoint"] => endpoint_inner(&state, &query, &headers, &ip)
            .await
            .unwrap_or_else(|p| p.into_response()),
        [service, rest @ ..] if !rest.is_empty() && is_service(&state, service) => {
            dynamic_badge_inner(&state, service, &rest.join("/"), &query, &headers, &ip)
                .await
                .unwrap_or_else(|p| p.into_response())
        }
        [collection, variant, label, value] => {
            let (value, query) = apply_path_extension(value, &query);
            static_badge_inner(
                &state, collection, variant, label, value, None, &query, &headers, &ip,
            )
            .await
            .unwrap_or_else(|p| p.into_response())
        }
        [collection, variant, label, value, extra] => {
            let (extra, query) = apply_path_extension(extra, &query);
            static_badge_inner(
                &state,
                collection,
                variant,
                label,
                value,
                Some(extra),
                &query,
                &headers,
                &ip,
            )
            .await
            .unwrap_or_else(|p| p.into_response())
        }
        [first, ..] if vexillum_templates::manifest().collection(first).is_none() => {
            Problem(Error::UnknownService((*first).to_string())).into_response()
        }
        _ => Problem(Error::BadRequest(
            "badge path must be /badge/:collection/:variant/:label/:value or /badge/:service/..."
                .into(),
        ))
        .into_response(),
    }
}

/// Splits a recognized format extension off the static badge's last path
/// segment and returns `(segment_without_ext, query_with_format_applied)`.
///
/// An explicit `?format=` already in the query wins; unknown or empty stems
/// (`v1.2`, a bare `.png`) leave the segment untouched.
fn apply_path_extension<'a>(
    tail: &'a str,
    query: &HashMap<String, String>,
) -> (&'a str, HashMap<String, String>) {
    let Some((stem, ext)) = tail.rsplit_once('.') else {
        return (tail, query.clone());
    };
    if stem.is_empty() {
        return (tail, query.clone());
    }
    if Format::from_str(ext).is_err() {
        return (tail, query.clone());
    }
    let mut query = query.clone();
    // the URL suffix is the format contract; ?format= only wins when the
    // caller set it explicitly — same key, so check before inserting
    query
        .entry("format".to_string())
        .or_insert_with(|| ext.to_ascii_lowercase());
    (stem, query)
}

fn is_service(state: &AppState, id: &str) -> bool {
    matches!(id, "dynamic" | "endpoint") || state.services.find(id).is_some()
}

/// Response hardening applied to every reply: `nosniff` + a referrer policy
/// everywhere, and for image payloads a strict CSP (SVGs can carry script
/// when navigated to directly — this defuses that vector) plus a
/// frame-deny. Existing headers are never overwritten.
async fn security_headers(
    req: axum::extract::Request,
    next: axum::middleware::Next,
) -> Response {
    let mut res = next.run(req).await;
    let headers = res.headers_mut();
    headers
        .entry(header::X_CONTENT_TYPE_OPTIONS)
        .or_insert(HeaderValue::from_static("nosniff"));
    headers.insert(
        header::REFERRER_POLICY,
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );
    let is_image = headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .is_some_and(|ct| ct.starts_with("image/"));
    if is_image {
        headers.insert(
            header::CONTENT_SECURITY_POLICY,
            HeaderValue::from_static("default-src 'none'; style-src 'unsafe-inline'; object-src 'none'"),
        );
        headers.insert(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
    }
    res
}

/// `POST /v1/billing/webhook` — Stripe subscription events. The billing
/// store and the tier state machine live in `vexillum-billing`; this route
/// is the (only) HTTP surface: verify `Stripe-Signature` (HMAC-SHA256,
/// constant-time, 5-minute replay window) over the RAW body, parse the
/// event, apply it idempotently. Configured via `VX_STRIPE_WEBHOOK_SECRET`.
async fn billing_webhook(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: axum::body::Bytes,
) -> Response {
    let Some(billing) = state.billing.as_ref() else {
        return Problem(Error::NotConfigured(
            "billing store is not wired to this deployment".into(),
        ))
        .into_response();
    };
    let Some(secret) = state
        .config
        .stripe_webhook_secret
        .as_deref()
        .filter(|s| !s.is_empty())
    else {
        return Problem(Error::NotConfigured(
            "set VX_STRIPE_WEBHOOK_SECRET to receive Stripe events".into(),
        ))
        .into_response();
    };
    let signature = headers
        .get("stripe-signature")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    let now_secs = now_ms() / 1000;
    if let Err(e) =
        vexillum_billing::webhook::verify_signature(signature, &body, secret, now_secs)
    {
        return Problem(e).into_response();
    }
    let Ok(payload) = serde_json::from_slice::<serde_json::Value>(&body) else {
        return Problem(Error::BadRequest("webhook body is not valid json".into()))
            .into_response();
    };
    state
        .stats
        .webhook_events
        .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    match vexillum_billing::parse_webhook_event(&payload) {
        None => {
            // unhandled event types are ACKed so Stripe stops retrying them
            json_response(
                StatusCode::OK,
                &serde_json::json!({ "received": true, "handled": false }),
            )
        }
        Some((event_id, event)) => match billing.apply_event(&event_id, &event).await {
            Ok(applied) => json_response(
                StatusCode::OK,
                &serde_json::json!({ "received": true, "applied": applied }),
            ),
            Err(e) => Problem(Error::Render(format!("webhook apply failed: {e}")))
                .into_response(),
        },
    }
}

/// Builds the router.
pub fn build(state: Arc<AppState>) -> Router {
    let cors = if state.config.cors_origins.is_empty() {
        // Legacy posture: reflect any origin with credentials. The session
        // cookie is SameSite=Lax (cross-site fetches never carry it), but a
        // same-site sibling subdomain WOULD — deployments that care pin the
        // exact dashboard origin via VX_CORS_ORIGINS.
        tracing::warn!(
            "VX_CORS_ORIGINS is not set: reflecting any origin with credentials. \
             Set it (comma-separated hosts) for a strict allowlist in production."
        );
        tower_http::cors::CorsLayer::new()
            .allow_origin(tower_http::cors::AllowOrigin::predicate(|origin, _| {
                !origin.is_empty()
            }))
            .allow_credentials(true)
    } else {
        // normalized host set (entries may be full origins or bare hosts)
        let allowed: std::collections::HashSet<String> = state
            .config
            .cors_origins
            .iter()
            .filter_map(|entry| normalize_origin_host(entry))
            .collect();
        tracing::info!(
            "CORS allowlist active ({} origin{})",
            allowed.len(),
            if allowed.len() == 1 { "" } else { "s" }
        );
        tower_http::cors::CorsLayer::new()
            .allow_origin(tower_http::cors::AllowOrigin::predicate(
                move |origin, _| {
                    origin
                        .to_str()
                        .ok()
                        .and_then(normalize_origin_host)
                        .is_some_and(|host| allowed.contains(&host))
                },
            ))
            .allow_credentials(true)
    };
    let cors = cors
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::DELETE,
            axum::http::Method::OPTIONS,
        ])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .max_age(std::time::Duration::from_secs(86_400));
    Router::new()
        .route("/badge/{*path}", get(badge_entry))
        .route("/v1/variants", get(variants))
        .route("/v1/meta", get(meta))
        .route("/v1/themes", get(themes).post(create_theme))
        .route("/v1/icons", get(list_icons).post(upload_icon))
        .route("/v1/fonts", get(list_fonts))
        .route("/v1/usage", get(usage))
        .route("/v1/stats/popular", get(popular_stats))
        .route("/v1/billing/webhook", post(billing_webhook))
        .route("/v1/keys/origins", axum::routing::put(update_key_origins))
        .route("/health", get(health))
        .route("/metrics", get(metrics))
        .merge(crate::auth_routes::build())
        .layer(cors)
        // gzip for the compressible text formats (SVG, JSON, HTML) — the
        // default predicate skips already-compressed media (PNG/JPG/WebP/GIF)
        // and bodies under 32 bytes. Vary: Accept-Encoding handled here too.
        .layer(tower_http::compression::CompressionLayer::new())
        // outermost so the headers land on CORS and problem+json replies too
        .layer(axum::middleware::from_fn(security_headers))
        .with_state(state)
}

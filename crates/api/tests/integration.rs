//! End-to-end API integration tests over the full router.

use std::sync::Arc;

use axum::body::Body;
use axum::http::{Request, StatusCode, header};
use tower::ServiceExt;
use vexillum_api::{AppState, StateConfig, router};
use vexillum_auth::{AuthStore, Tier};
use vexillum_billing::BillingStore;

async fn test_state(anonymous_rpm: u32) -> Arc<AppState> {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().to_path_buf();
    std::mem::forget(dir); // keep temp files for the process lifetime
    AppState::builder()
        .cache(vexillum_cache::RenderCache::open(&path.join("cache.redb"), 256).unwrap())
        .auth(AuthStore::open(&path.join("vexillum.db")).await.unwrap())
        .billing(BillingStore::open(&path.join("vexillum.db")).await.unwrap())
        .icons(vexillum_icons::store::IconStore::open(&path.join("icons")).unwrap())
        .config(StateConfig {
            anonymous_rpm,
            ..Default::default()
        })
        .build()
}

fn app(state: Arc<AppState>) -> axum::Router {
    router(state)
        // ConnectInfo without a real socket: the mock feeds the per-IP meter
        // a stable address; per-IP isolation tests vary X-Forwarded-For with
        // trust_proxy instead.
        .layer(axum::extract::connect_info::MockConnectInfo(
            std::net::SocketAddr::from(([127, 0, 0, 1], 4242))),
        )
}

#[tokio::test]
async fn health_and_metrics() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/metrics")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    assert!(String::from_utf8_lossy(&body).contains("tbc_variants 544"));
}

#[tokio::test]
async fn variants_manifest_lists_544() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/v1/variants")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["variants"].as_array().unwrap().len(), 544);
    assert_eq!(json["collections"].as_array().unwrap().len(), 34);
}

#[tokio::test]
async fn themes_endpoint_lists_presets() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/v1/themes")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["presets"].as_array().unwrap().len(), 8);
    let first = &json["presets"][0];
    assert!(first["name"].is_string());
    assert!(first["seed"].as_str().unwrap().starts_with('#'));
}

#[tokio::test]
async fn static_badge_svg_with_cache_headers() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "image/svg+xml"
    );
    assert_eq!(
        res.headers().get(header::CACHE_CONTROL).unwrap(),
        "public, max-age=3600, immutable"
    );
    let etag = res
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    assert_eq!(res.headers().get("x-variant").unwrap(), "c01-01");
    assert_eq!(etag.len(), 66);

    // conditional request → 304
    let res2 = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .header(header::IF_NONE_MATCH, etag)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res2.status(), StatusCode::NOT_MODIFIED);
}

#[tokio::test]
async fn static_badge_png_renders() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=png&scale=2")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "image/png"
    );
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    assert_eq!(&body[..4], b"\x89PNG");
}

#[tokio::test]
async fn seed2_recants_the_value_segment_only() {
    let state = test_state(60).await;

    let plain = render_svg(state.clone(), "/badge/foundational/c01-01/build/passing?seed=3b82f6").await;
    let mirror = render_svg(
        state.clone(),
        "/badge/foundational/c01-01/build/passing?seed=3b82f6&seed2=3b82f6",
    )
    .await;
    let duo = render_svg(
        state.clone(),
        "/badge/foundational/c01-01/build/passing?seed=3b82f6&seed2=ec4899",
    )
    .await;

    // seed2 = base seed → the v- family mirrors the base tokens exactly;
    // the render must stay byte-identical to the plain seed render
    assert_eq!(plain, mirror, "seed2 == seed must not change the render");
    // a different seed2 re-colors the value side
    assert_ne!(plain, duo, "seed2 must change the render");

    // takumi serializes colors as hex; compute the expected value-side
    // heading for both seeds and check the swap really happened
    let hex = |seed: &str, token: &str| -> String {
        let seed = vexillum_theme::parse_seed(seed).unwrap();
        let ramp = vexillum_theme::resolve_ramp(seed, vexillum_theme::Mode::Light);
        let css = ramp.tokens.get(token).unwrap();
        let (r, g, b) = vexillum_theme::Oklch::parse(css).unwrap().to_rgb8();
        format!("#{r:02x}{g:02x}{b:02x}")
    };
    let base_value_heading = hex("#3b82f6", "vx-t-heading");
    let pink_value_heading = hex("#ec4899", "vx-t-heading");
    assert_ne!(base_value_heading, pink_value_heading);
    assert!(
        !plain.contains(&pink_value_heading) && plain.contains(&base_value_heading),
        "plain render paints the value side from the base seed"
    );
    assert!(
        !duo.contains(&base_value_heading) && duo.contains(&pink_value_heading),
        "duo render paints the value side from seed2"
    );

    // the label side keeps the base seed's ink in BOTH renders
    let label_ink = hex("#3b82f6", "vx-t-body");
    assert!(plain.contains(&label_ink) && duo.contains(&label_ink));

    // an invalid seed2 is a 400, not a silent ignore
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?seed2=nothex")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn quad_badge_renders_the_fourth_segment_through_extra2() {
    let state = test_state(60).await;

    // c17-08 "quad" is the four-segment slab (label · extra · extra2 · value).
    // The trailing segments became dynamic slots — without overrides the
    // design defaults (a|b|c|d) render, marker-free as everywhere else.
    let plain = render_svg(state.clone(), "/badge/slab/c17-08/a/d?format=svg").await;
    assert!(plain.contains("<svg"), "quad badge must render");
    assert!(!plain.contains("__VX_"), "slot marker leaked");

    // overriding either trailing segment changes the render, and the two
    // overrides drive DIFFERENT segments (not the same slot twice)
    let e2 = render_svg(
        state.clone(),
        "/badge/slab/c17-08/a/d?format=svg&extra2=WIDE-SEGMENT",
    )
    .await;
    let e1 = render_svg(
        state.clone(),
        "/badge/slab/c17-08/a/d?format=svg&extra=WIDE-SEGMENT",
    )
    .await;
    assert_ne!(plain, e2, "?extra2= must change the render");
    assert_ne!(plain, e1, "?extra= must change the render");
    assert_ne!(e1, e2, "extra and extra2 drive different segments");

    // takumi outlines text as paths: a longer fourth segment widens the badge
    let width = |s: &str| -> u32 {
        s.split("width=\"")
            .nth(1)
            .unwrap()
            .split('"')
            .next()
            .unwrap()
            .parse()
            .unwrap()
    };
    assert!(
        width(&e2) > width(&plain),
        "longer extra2 must widen the quad badge"
    );

    // ?extra2= on a variant without the marker is accepted and inert
    let c01 = render_svg(state.clone(), "/badge/foundational/c01-01/build/passing").await;
    let c01_override = render_svg(
        state.clone(),
        "/badge/foundational/c01-01/build/passing?extra2=zzz",
    )
    .await;
    assert_eq!(c01, c01_override, "extra2 must be inert without the marker");

    // over-long extra2 is a 400, same contract as extra
    let long: String = "x".repeat(65);
    let uri = format!("/badge/slab/c17-08/a/d?extra2={long}");
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri(&uri)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn stacked_and_stat_collections_render_through_the_api() {
    let state = test_state(60).await;

    // the two newest collections ride the same slug routing, slot
    // substitution and cache headers as every other collection
    for (slug, idx) in [("stacked", "c33-01"), ("stat", "c34-01")] {
        let uri = format!("/badge/{slug}/{idx}/uptime/99.9%25?format=svg");
        let res = app(state.clone())
            .oneshot(Request::builder().uri(&uri).body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK, "{idx} must render");
        assert_eq!(res.headers().get("x-variant").unwrap(), idx);
        let body = axum::body::to_bytes(res.into_body(), usize::MAX)
            .await
            .unwrap();
        let svg = String::from_utf8(body.to_vec()).unwrap();
        assert!(svg.contains("<svg"), "{idx}: not an svg");
        assert!(!svg.contains("__VX_"), "{idx}: slot marker leaked");

        // takumi outlines text as paths, so substitution shows up as
        // geometry: a long value must widen the same badge
        let long = format!("/badge/{slug}/{idx}/uptime/99.9%25-and-climbing?format=svg");
        let long_res = app(state.clone())
            .oneshot(Request::builder().uri(&long).body(Body::empty()).unwrap())
            .await
            .unwrap();
        let long_body = axum::body::to_bytes(long_res.into_body(), usize::MAX)
            .await
            .unwrap();
        let long_svg = String::from_utf8(long_body.to_vec()).unwrap();
        let width = |s: &str| -> u32 {
            s.split("width=\"").nth(1).unwrap()
                .split('"').next().unwrap().parse().unwrap()
        };
        assert!(
            width(&long_svg) > width(&svg),
            "{idx}: longer value must widen the badge (slot substitution)"
        );
    }

    // seed2 re-themes the value side of the stat collection too — the
    // generated templates carry the vx-v-* dual-seed token family
    let plain = render_svg(
        state.clone(),
        "/badge/stat/c34-06/score/42?seed=3b82f6&format=svg",
    )
    .await;
    let duo = render_svg(
        state,
        "/badge/stat/c34-06/score/42?seed=3b82f6&seed2=ec4899&format=svg",
    )
    .await;
    assert_ne!(plain, duo, "seed2 must re-theme the stat value side");
}

/// Renders a badge URI to its SVG body text.
async fn render_svg(state: Arc<AppState>, uri: &str) -> String {
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri(uri)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK, "{uri}");
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    String::from_utf8(body.to_vec()).expect("svg is utf8")
}

#[tokio::test]
async fn collection_slug_and_index_routing() {
    // /badge/foundational/01/build/passing → c01-01
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/01/build/passing")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(res.headers().get("x-variant").unwrap(), "c01-01");
}

#[tokio::test]
async fn unknown_variant_is_rfc7807_404() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/fnd99/a/b")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "application/problem+json"
    );
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], 404);
    assert_eq!(json["title"], "Unknown variant");
    assert!(json["type"].as_str().unwrap().contains("unknown-variant"));
}

#[tokio::test]
async fn animated_format_requires_payment_for_anonymous() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=gif")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::PAYMENT_REQUIRED);
}

#[tokio::test]
async fn path_extension_sets_format_and_stays_tier_gated() {
    // the README convention: the trailing extension is the format contract
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing.png")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "image/png"
    );

    // an animated extension on the path hits the same paid gate as ?format=
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing.gif")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::PAYMENT_REQUIRED);

    // an explicit ?format= wins over the path extension
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing.png?format=svg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "image/svg+xml"
    );

    // a suffix that is not a format stays part of the value: the render of
    // `v1.2.3` is byte-identical to an explicit svg request of the same path
    assert_eq!(
        etag_of("/badge/foundational/c01-01/version/v1.2.3").await,
        etag_of("/badge/foundational/c01-01/version/v1.2.3?format=svg").await,
        "dotted value is not mangled by extension parsing",
    );
    // and a stripped extension renders exactly like the explicit ?format= form
    assert_eq!(
        etag_of("/badge/foundational/c01-01/build/passing.png").await,
        etag_of("/badge/foundational/c01-01/build/passing?format=png").await,
        "path extension and ?format= agree",
    );
}

async fn etag_of(uri: &str) -> String {
    let res = app(test_state(60).await)
        .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK, "{uri}");
    res.headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string()
}

async fn provision_key(
    state: &AppState,
    tier: Tier,
    label: &str,
    customer: Option<&str>,
) -> String {
    provision_key_with_origins(state, tier, label, customer, &[]).await
}

async fn provision_key_with_origins(
    state: &AppState,
    tier: Tier,
    label: &str,
    customer: Option<&str>,
    origins: &[&str],
) -> String {
    let auth = state.auth.as_ref().unwrap();
    let plaintext = vexillum_auth::generate_key("live");
    auth.put_record(&vexillum_auth::ApiKey {
        key_hash: vexillum_auth::key_hash(&plaintext),
        label: label.into(),
        tier,
        customer_id: customer.map(str::to_string),
        allowed_origins: origins.iter().map(|s| s.to_string()).collect(),
        created_ms: 0,
        env: "live".into(),
        owner_id: None,
    })
    .await
    .unwrap();
    plaintext
}

#[tokio::test]
async fn pro_key_unlocks_gif() {
    let state = test_state(60).await;
    let key = provision_key(&state, Tier::Pro, "test-pro", Some("cus_pro")).await;
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=gif")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "image/gif"
    );
    assert_eq!(res.headers().get("x-tier").unwrap(), "pro");
}

#[tokio::test]
async fn animated_formats_are_pro_gated() {
    let state = test_state(60).await;
    // free key → every animated format is 402 problem+json
    for fmt in ["gif", "webp", "apng"] {
        let key = provision_key(&state, Tier::Free, "free-anim", None).await;
        let res = app(state.clone())
            .oneshot(
                Request::builder()
                    .uri(&format!(
                        "/badge/foundational/c01-01/build/passing?format={fmt}&key={key}"
                    ))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(
            res.status(),
            StatusCode::PAYMENT_REQUIRED,
            "{fmt} must be Pro-gated"
        );
        assert_eq!(
            res.headers().get(header::CONTENT_TYPE).unwrap(),
            "application/problem+json"
        );
    }
    // pro key → every animated format renders
    for fmt in ["gif", "webp", "apng"] {
        let key = provision_key(&state, Tier::Pro, "pro-anim", None).await;
        let res = app(state.clone())
            .oneshot(
                Request::builder()
                    .uri(&format!(
                        "/badge/foundational/c01-01/build/passing?format={fmt}&key={key}"
                    ))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK, "{fmt} must render on Pro");
    }
}

/// `GET /v1/stats/popular` ranks by real demand, cache hits included.
#[tokio::test]
async fn popular_stats_ranks_variants_by_demand() {
    let state = test_state(60).await;
    // two requests for c01-01, one for c01-02 (cache hits count as demand)
    for uri in [
        "/badge/foundational/c01-01/build/passing",
        "/badge/foundational/c01-01/build/passing",
        "/badge/foundational/c01-02/build/passing",
    ] {
        let res = app(state.clone())
            .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK, "{uri}");
    }
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/v1/stats/popular?limit=10")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["total"], 3);
    assert_eq!(json["trackedVariants"], 2);
    let rows = json["variants"].as_array().unwrap();
    assert_eq!(rows.len(), 2);
    assert_eq!(rows[0]["variant"], "c01-01");
    assert_eq!(rows[0]["renders"], 2);
    assert_eq!(rows[1]["variant"], "c01-02");
    // a bad variant must NOT pollute the ranking
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/nope-99/build/passing")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri("/v1/stats/popular")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["trackedVariants"], 2);
}

/// `GET /v1/meta` — the agent-facing catalog overview.
#[tokio::test]
async fn meta_endpoint_documents_the_surface() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/v1/meta")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["service"], "vexillum");
    assert_eq!(json["variants"]["count"], 544);
    assert_eq!(json["collections"]["count"], 34);
    // seed2 is a first-class documented param
    assert!(json["params"]["seed2"]
        .as_str()
        .unwrap()
        .contains("VALUE segment"));
    assert_eq!(json["formats"]["animated"], serde_json::json!(["gif", "apng"]));
    assert!(json["discovery"]["popular"]
        .as_str()
        .unwrap()
        .starts_with("/v1/stats/popular"));
}

#[tokio::test]
async fn rate_limit_returns_429() {
    let state = test_state(3).await;
    let uri = "/badge/foundational/c01-04/build/passing?format=svg";
    for i in 0..3 {
        let res = app(state.clone())
            .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK, "request {i} should pass");
    }
    let res = app(state)
        .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::TOO_MANY_REQUESTS);
}

#[tokio::test]
async fn anonymous_metering_is_per_ip_isolated() {
    async fn state_with_trust_proxy(rpm: u32) -> Arc<AppState> {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().to_path_buf();
        std::mem::forget(dir);
        AppState::builder()
            .cache(vexillum_cache::RenderCache::open(&path.join("cache.redb"), 64).unwrap())
            .auth(AuthStore::open(&path.join("vexillum.db")).await.unwrap())
            .billing(BillingStore::open(&path.join("vexillum.db")).await.unwrap())
            .icons(vexillum_icons::store::IconStore::open(&path.join("icons")).unwrap())
            .config(StateConfig {
                anonymous_rpm: rpm,
                trust_proxy: true,
                ..Default::default()
            })
            .build()
    }
    let state = state_with_trust_proxy(1).await;
    let uri = "/badge/foundational/c01-04/build/passing";
    let get = |ip: &str| {
        app(state.clone())
            .oneshot(
                Request::builder()
                    .uri(uri)
                    .header("x-forwarded-for", ip)
                    .body(Body::empty())
                    .unwrap(),
            )
    };
    assert_eq!(get("10.0.0.1").await.unwrap().status(), StatusCode::OK);
    // same bucket → limited
    assert_eq!(
        get("10.0.0.1").await.unwrap().status(),
        StatusCode::TOO_MANY_REQUESTS
    );
    // different ip → own bucket
    assert_eq!(get("10.0.0.2").await.unwrap().status(), StatusCode::OK);
}

#[tokio::test]
async fn xff_ignored_without_trust_proxy() {
    // with trust_proxy=false (default) a spoofable XFF header must NOT
    // create per-IP buckets — all anonymous traffic shares the fallback
    let state = test_state(1).await;
    let uri = "/badge/foundational/c01-04/build/passing";
    let get = |xff: &str| {
        app(state.clone())
            .oneshot(
                Request::builder()
                    .uri(uri)
                    .header("x-forwarded-for", xff)
                    .body(Body::empty())
                    .unwrap(),
            )
    };
    assert_eq!(get("10.0.0.1").await.unwrap().status(), StatusCode::OK);
    // no trust_proxy → XFF ignored → same (fallback) bucket → 429
    assert_eq!(
        get("10.0.0.2").await.unwrap().status(),
        StatusCode::TOO_MANY_REQUESTS
    );
}

#[tokio::test]
async fn usage_endpoint_counts() {
    let state = test_state(60).await;
    let app_router = app(state.clone());
    app_router
        .clone()
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-04/a/b")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let res = app_router
        .oneshot(
            Request::builder()
                .uri("/v1/usage")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert!(json["requestsThisWindow"].as_u64().unwrap() >= 1);
}

#[tokio::test]
async fn dynamic_json_end_to_end() {
    let server = wiremock::MockServer::start().await;
    wiremock::Mock::given(wiremock::matchers::method("GET"))
        .and(wiremock::matchers::path("/data.json"))
        .respond_with(
            wiremock::ResponseTemplate::new(200)
                .set_body_json(serde_json::json!({ "stats": { "count": 8500 } })),
        )
        .mount(&server)
        .await;
    let state = test_state(60).await;
    let uri = format!(
        "/badge/dynamic/json?url={}/data.json&query=stats.count&label=total&format=svg",
        server.uri()
    );
    let res = app(state)
        .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK, "dynamic json must render");
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "image/svg+xml"
    );
}

#[tokio::test]
async fn dynamic_json_https_enforced() {
    let state = test_state(60).await;
    let uri = "/badge/dynamic/json?url=http://insecure.example/x.json&query=a";
    let res = app(state)
        .oneshot(Request::builder().uri(uri).body(Body::empty()).unwrap())
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn dynamic_json_rejects_private_network_targets() {
    let state = test_state(60).await;
    // cloud metadata + RFC1918 literals: never fetched, not even attempted
    for host in ["169.254.169.254", "10.0.0.1", "192.168.1.1", "[fd00::1]"] {
        let uri = format!("/badge/dynamic/json?url=https://{host}/latest&query=a");
        let res = app(state.clone())
            .oneshot(
                Request::builder()
                    .uri(&uri)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::BAD_REQUEST, "{host} must 400");
        let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
        assert!(
            String::from_utf8_lossy(&body).contains("private or reserved"),
            "{host}: rejection names the reason"
        );
    }
}

#[tokio::test]
async fn icon_upload_and_usage() {
    let state = test_state(60).await;
    let key = provision_key(&state, Tier::Pro, "icons", None).await;
    let svg = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l3 7h7z"/></svg>"##;
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/icons")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::CONTENT_TYPE, "image/svg+xml")
                .body(Body::from(svg))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    let hash = json["hash"].as_str().unwrap().to_string();
    assert_eq!(hash.len(), 64);

    // use it in a badge
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri(&format!(
                    "/badge/foundational/c01-01/build/passing?format=svg&icon=upload:{hash}"
                ))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn icon_color_default_is_themed_ink_brand_is_opt_in() {
    let state = test_state(60).await;
    // the default: brand icons ride the badge's themed ink (currentColor) —
    // a fixed brand hex (GitHub #181717) would go black on dark segments
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg&icon=github")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let svg = String::from_utf8(body.to_vec()).unwrap();
    assert!(
        !svg.contains("#181717"),
        "the brand hex must not be the default"
    );
    // takumi resolves currentColor against the icon's inherited CSS color:
    // c01-01's icon sits in the label segment, so it inherits the label's
    // themed ink (oklch(0.4105 0.0542 259.75) → #394b68) — one occurrence is
    // the label text, the second the icon. The icon rides the badge ink and
    // re-themes with it (that's the feature); brand hex is the opt-in below.
    assert!(
        svg.matches("#394b68").count() >= 2,
        "icon must inherit the segment's themed ink, not a fixed brand hex"
    );

    // explicit opt-in: icon.color=brand restores the brand hex
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg&icon=github&icon.color=brand")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let svg = String::from_utf8(body.to_vec()).unwrap();
    assert!(svg.contains("#181717"), "brand must opt back into #181717");
}

#[tokio::test]
async fn icon_upload_requires_auth() {
    let state = test_state(60).await;
    let evil = r#"<svg viewBox="0 0 10 10"><script>alert(1)</script><path d="M0 0"/></svg>"#;
    let res = app(state)
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/icons")
                .body(Body::from(evil))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn brand_theme_with_key_creates_guarded_theme() {
    let state = test_state(60).await;
    let key = provision_key(&state, Tier::Free, "theme", None).await;
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/themes")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r##"{"brand": "#7a7a7a"}"##))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    // semantic model: mid-gray slightly favors white → not "corrected"
    assert_eq!(json["colorCorrected"], false);
    // the full semantic palette resolves (accent + text + surfaces)
    assert!(
        json["colors"]["vx-a"]
            .as_str()
            .unwrap()
            .starts_with("oklch(")
    );
    assert!(
        json["colors"]["vx-t-heading"]
            .as_str()
            .unwrap()
            .starts_with("oklch(")
    );
    assert!(
        json["colors"]["vx-s-white"]
            .as_str()
            .unwrap()
            .starts_with("oklch(")
    );

    // a near-white seed forces dark text on the accent → corrected
    let key2 = provision_key(&state, Tier::Free, "theme2", None).await;
    let res = app(state)
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/themes")
                .header(header::AUTHORIZATION, format!("Bearer {key2}"))
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r##"{"seed": "#fefefe", "mode": "dark"}"##))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["colorCorrected"], true);
    assert_eq!(json["source"], "brand:#fefefe");
}

#[tokio::test]
async fn unknown_service_is_404_problem() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/nosuch/v/pkg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "application/problem+json"
    );
}

#[tokio::test]
async fn theme_query_changes_render() {
    let state = test_state(60).await;
    let plain = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-07/build/passing?format=png")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let themed = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-07/build/passing?format=png&theme=rose")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let a = axum::body::to_bytes(plain.into_body(), usize::MAX)
        .await
        .unwrap();
    let b = axum::body::to_bytes(themed.into_body(), usize::MAX)
        .await
        .unwrap();
    assert_ne!(a.as_ref(), b.as_ref(), "theme must change rendered pixels");
}

#[tokio::test]
async fn extra_query_changes_render_and_etag() {
    let state = test_state(60).await;
    let plain = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/minimal/c16-11/build/passing?format=svg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let extra = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/minimal/c16-11/build/passing?format=svg&extra=since%2009:41")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(extra.status(), StatusCode::OK);
    let etag_plain = plain
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    let etag_extra = extra
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    assert_ne!(
        etag_plain, etag_extra,
        "extra must enter the structural cache key / ETag"
    );
    let a = axum::body::to_bytes(plain.into_body(), usize::MAX)
        .await
        .unwrap();
    let b = axum::body::to_bytes(extra.into_body(), usize::MAX)
        .await
        .unwrap();
    let sa = String::from_utf8(a.to_vec()).unwrap();
    let sb = String::from_utf8(b.to_vec()).unwrap();
    assert_ne!(sa, sb, "extra must change the rendered output");
    // the 5th path segment is equivalent to ?extra=
    let pathed = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/minimal/c16-11/build/passing/since%2009:41?format=svg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(pathed.status(), StatusCode::OK);
    let c = axum::body::to_bytes(pathed.into_body(), usize::MAX)
        .await
        .unwrap();
    assert_eq!(
        sb,
        String::from_utf8(c.to_vec()).unwrap(),
        "path segment and query param agree"
    );
}

#[tokio::test]
async fn font_query_changes_render_and_etag() {
    let state = test_state(60).await;
    let plain = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let fonted = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg&font=space-mono")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(fonted.status(), StatusCode::OK);
    let etag_plain = plain
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    let etag_font = fonted
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    assert_ne!(
        etag_plain, etag_font,
        "font must enter the structural cache key / ETag"
    );

    let a = axum::body::to_bytes(plain.into_body(), usize::MAX)
        .await
        .unwrap();
    let b = axum::body::to_bytes(fonted.into_body(), usize::MAX)
        .await
        .unwrap();
    assert_ne!(a.as_ref(), b.as_ref(), "font must change rendered bytes");

    // cache: the same ?font= request shares the key → conditional hit → 304
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg&font=space-mono")
                .header(header::IF_NONE_MATCH, &etag_font)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_MODIFIED);
}

#[tokio::test]
async fn unknown_font_is_400_problem() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?font=bogus")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "application/problem+json"
    );
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], 400);
    assert_eq!(json["title"], "Invalid font");
    assert!(json["type"].as_str().unwrap().ends_with("invalid-font"));
    assert!(json["detail"].as_str().unwrap().contains("bogus"));
}

#[tokio::test]
async fn empty_font_param_means_no_override() {
    let state = test_state(60).await;
    let plain = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let empty = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg&font=")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(empty.status(), StatusCode::OK);
    let etag_plain = plain
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    let etag_empty = empty
        .headers()
        .get(header::ETAG)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    assert_eq!(
        etag_plain, etag_empty,
        "empty font must not perturb the key"
    );
    let a = axum::body::to_bytes(plain.into_body(), usize::MAX)
        .await
        .unwrap();
    let b = axum::body::to_bytes(empty.into_body(), usize::MAX)
        .await
        .unwrap();
    assert_eq!(
        a.as_ref(),
        b.as_ref(),
        "empty font must render byte-identically"
    );
}

// --------------------------------------------- per-key origin pinning

#[tokio::test]
async fn pinned_key_rejects_foreign_origin() {
    let state = test_state(60).await;
    let key = provision_key_with_origins(
        &state,
        Tier::Pro,
        "pinned",
        None,
        &["github.com", "app.acme.dev:8080"],
    )
    .await;

    // foreign Origin header → 403 problem+json
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::ORIGIN, "https://evil.example.com")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::FORBIDDEN);
    assert_eq!(
        res.headers().get(header::CONTENT_TYPE).unwrap(),
        "application/problem+json"
    );
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert!(json["type"].as_str().unwrap().ends_with("forbidden"));
    assert!(
        json["detail"]
            .as_str()
            .unwrap()
            .contains("evil.example.com")
    );
}

#[tokio::test]
async fn pinned_key_accepts_allowlisted_origin_and_referer() {
    let state = test_state(60).await;
    let key = provision_key_with_origins(&state, Tier::Pro, "pinned2", None, &["github.com"]).await;

    // matching Origin → 200
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::ORIGIN, "https://github.com")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);

    // matching Referer (deep path) → 200 — browsers send Referer on <img>
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(
                    header::REFERER,
                    "https://github.com/acme/repo/blob/main/README.md",
                )
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn pinned_key_rejects_headerless_requests() {
    let state = test_state(60).await;
    let key = provision_key_with_origins(&state, Tier::Pro, "pinned3", None, &["github.com"]).await;

    // a keyed request with NO Origin/Referer cannot prove its origin → 403
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn unpinned_key_works_from_anywhere() {
    let state = test_state(60).await;
    let key = provision_key(&state, Tier::Pro, "unpinned", None).await;
    // unpinned keys work with, without, or from any origin
    for origin in [None, Some("https://anything.example")] {
        let mut req = Request::builder()
            .uri("/badge/foundational/c01-01/build/passing?format=svg")
            .header(header::AUTHORIZATION, format!("Bearer {key}"));
        if let Some(o) = origin {
            req = req.header(header::ORIGIN, o);
        }
        let res = app(state.clone())
            .oneshot(req.body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK);
    }
}

#[tokio::test]
async fn keyless_readme_render_never_touches_origin_checks() {
    let state = test_state(60).await;
    // the README flow: a plain <img> URL with no key and no headers
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
}

#[tokio::test]
async fn put_origins_endpoint_updates_allowlist() {
    let state = test_state(60).await;
    let key = provision_key(&state, Tier::Pro, "pin-me", None).await;
    let router = app(state.clone());

    // pin two hosts
    let res = router
        .clone()
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri("/v1/keys/origins")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(
                    r##"{"origins": ["https://GitHub.com/path", "app.acme.dev:8080"]}"##,
                ))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(
        json["allowedOrigins"],
        serde_json::json!(["app.acme.dev:8080", "github.com"]),
        "hosts are normalized (scheme/path stripped, lowercased) and deduped"
    );

    // now requests from github.com pass, others fail
    let res = router
        .clone()
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::ORIGIN, "https://github.com")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let res = router
        .clone()
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-01/build/passing?format=svg")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::ORIGIN, "https://notgithub.com")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::FORBIDDEN);

    // invalid host → 400
    let res = router
        .clone()
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri("/v1/keys/origins")
                .header(header::AUTHORIZATION, format!("Bearer {key}"))
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r##"{"origins": ["not a host"]}"##))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);

    // unauthenticated → 401
    let res = router
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri("/v1/keys/origins")
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r##"{"origins": ["github.com"]}"##))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
}

#[test]
fn origin_host_normalization() {
    use vexillum_api::normalize_origin_host;
    assert_eq!(
        normalize_origin_host("https://github.com"),
        Some("github.com".into())
    );
    assert_eq!(
        normalize_origin_host("https://GitHub.com/some/path?q=1"),
        Some("github.com".into())
    );
    assert_eq!(
        normalize_origin_host("https://app.acme.dev:8080"),
        Some("app.acme.dev:8080".into())
    );
    assert_eq!(
        normalize_origin_host("app.acme.dev"),
        Some("app.acme.dev".into())
    );
    assert_eq!(normalize_origin_host(""), None);
    assert_eq!(normalize_origin_host("nohost"), None);
    assert_eq!(normalize_origin_host("bad host"), None);
}

// ---------------- dashboard auth (GitHub OAuth + session wall) ----------------

async fn oauth_test_state() -> Arc<AppState> {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().to_path_buf();
    std::mem::forget(dir);
    let oauth = std::sync::Arc::new(vexillum_auth::GithubOAuth::new(
        "Iv1.client".into(),
        "secret".into(),
        "http://api.local/v1/auth/github/callback".into(),
        "http://web.local".into(),
    ));
    AppState::builder()
        .cache(vexillum_cache::RenderCache::open(&path.join("cache.redb"), 64).unwrap())
        .auth(AuthStore::open(&path.join("vexillum.db")).await.unwrap())
        .billing(BillingStore::open(&path.join("vexillum.db")).await.unwrap())
        .icons(vexillum_icons::store::IconStore::open(&path.join("icons")).unwrap())
        .oauth(oauth)
        .config(StateConfig {
            frontend_url: "http://web.local".into(),
            ..Default::default()
        })
        .build()
}

#[tokio::test]
async fn oauth_login_reports_503_when_unconfigured() {
    let res = app(test_state(60).await)
        .oneshot(
            Request::builder()
                .uri("/v1/auth/github/login")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::SERVICE_UNAVAILABLE);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    assert!(String::from_utf8_lossy(&body).contains("VX_GITHUB_CLIENT_ID"));
}

#[tokio::test]
async fn oauth_login_redirects_with_state_and_callback_consumes_it_once() {
    let state = oauth_test_state().await;
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/v1/auth/github/login")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::SEE_OTHER);
    let location = res
        .headers()
        .get(header::LOCATION)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
    assert!(location.starts_with("https://github.com/login/oauth/authorize?"));
    assert!(location.contains("client_id=Iv1.client"));
    assert!(location.contains("scope=read:user"));
    let csrf = location.split("state=").nth(1).unwrap().to_string();
    assert!(state.login_states.lock().contains_key(&csrf));

    // an unknown state is rejected and bounces to the frontend login
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/v1/auth/github/callback?code=abc&state=forged")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::SEE_OTHER);
    assert_eq!(
        res.headers().get(header::LOCATION).unwrap(),
        "http://web.local/login?error=github"
    );

    // the real state is consumed exactly once — replay is rejected too
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri(&format!("/v1/auth/github/callback?code=abc&state={csrf}"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::SEE_OTHER);
    assert_eq!(
        res.headers().get(header::LOCATION).unwrap(),
        "http://web.local/login?error=github",
        "code exchange with github.com fails offline, so the flow bounces to the login error"
    );
    assert!(
        !state.login_states.lock().contains_key(&csrf),
        "state consumed"
    );
}

#[tokio::test]
async fn auth_me_is_the_login_wall() {
    let res = app(oauth_test_state().await)
        .oneshot(
            Request::builder()
                .uri("/v1/auth/me")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    assert!(String::from_utf8_lossy(&body).contains("sign in with GitHub"));
}

#[tokio::test]
async fn dashboard_key_management_roundtrip() {
    let state = oauth_test_state().await;
    let auth = state.auth.as_ref().unwrap();

    // provision a user exactly like the OAuth callback would
    auth.upsert_user(&vexillum_auth::User {
        id: "1".into(),
        login: "octocat".into(),
        name: Some("Octo".into()),
        email: None,
        avatar_url: None,
        tier: Tier::Free,
        created_ms: 0,
    })
    .await
    .unwrap();

    let token = auth.create_session("1").await.unwrap();
    let cookie = format!("{}={}", vexillum_auth::SESSION_COOKIE, token);

    // /v1/auth/me with the session cookie: real user + empty keys + usage zeros
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/v1/auth/me")
                .header(header::COOKIE, &cookie)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["user"]["login"], "octocat");
    assert_eq!(json["plan"], "free");
    assert_eq!(json["keys"].as_array().unwrap().len(), 0);
    assert_eq!(json["usage"]["dailyQuota"], 5000);
    assert_eq!(json["usage"]["requestsToday"], 0);

    // create a key through the account route
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/account/keys")
                .header(header::COOKIE, &cookie)
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r#"{"label":"prod","env":"live"}"#))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let created: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert!(
        created["plaintext"]
            .as_str()
            .unwrap()
            .starts_with("vx_live_")
    );
    let key_hash = created["key"]["keyHash"].as_str().unwrap().to_string();

    // me now lists the key with origins + lastUsedAt(null)
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/v1/auth/me")
                .header(header::COOKIE, &cookie)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["keys"].as_array().unwrap().len(), 1);
    assert_eq!(json["keys"][0]["env"], "live");
    assert!(json["keys"][0]["lastUsedAt"].is_null());

    // pin origins through the owner route
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri(format!("/v1/account/keys/{key_hash}/origins"))
                .header(header::COOKIE, &cookie)
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(
                    r#"{"origins":["github.com","https://App.ACME.dev:8080/x"]}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(
        json["allowedOrigins"],
        serde_json::json!(["app.acme.dev:8080", "github.com"])
    );

    // a stranger's session cannot touch the key (404 hides existence)
    auth.upsert_user(&vexillum_auth::User {
        id: "2".into(),
        login: "intruder".into(),
        name: None,
        email: None,
        avatar_url: None,
        tier: Tier::Free,
        created_ms: 0,
    })
    .await
    .unwrap();
    let stranger = auth.create_session("2").await.unwrap();
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri(format!("/v1/account/keys/{key_hash}/origins"))
                .header(
                    header::COOKIE,
                    format!("{}={}", vexillum_auth::SESSION_COOKIE, stranger),
                )
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(r#"{"origins":["evil.dev"]}"#))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NOT_FOUND);

    // revoke through the owner route, then the wall closes again on logout
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri(format!("/v1/account/keys/{key_hash}"))
                .header(header::COOKIE, &cookie)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NO_CONTENT);
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/auth/logout")
                .header(header::COOKIE, &cookie)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::NO_CONTENT);
    let set_cookie = res
        .headers()
        .get(header::SET_COOKIE)
        .unwrap()
        .to_str()
        .unwrap();
    assert!(set_cookie.contains("Max-Age=0"));
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/v1/auth/me")
                .header(header::COOKIE, &cookie)
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(
        res.status(),
        StatusCode::UNAUTHORIZED,
        "session deleted server-side"
    );
}

#[tokio::test]
async fn account_key_usage_is_real_meter_data() {
    let state = oauth_test_state().await;
    let auth = state.auth.as_ref().unwrap();
    auth.upsert_user(&vexillum_auth::User {
        id: "7".into(),
        login: "metered".into(),
        name: None,
        email: None,
        avatar_url: None,
        tier: Tier::Pro,
        created_ms: 0,
    })
    .await
    .unwrap();
    let (key, _plaintext) = auth
        .create_key_for_user(
            &auth.user_by_id("7").await.unwrap().unwrap(),
            "prod",
            "live",
        )
        .await
        .unwrap();
    // simulate real render traffic through the meter
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;
    for _ in 0..3 {
        state.meter.hit(&format!("key:{}", key.key_hash), 600, now);
    }
    let token = auth.create_session("7").await.unwrap();
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/v1/auth/me")
                .header(
                    header::COOKIE,
                    format!("{}={}", vexillum_auth::SESSION_COOKIE, token),
                )
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let body = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["usage"]["requestsToday"], 3);
    assert_eq!(json["usage"]["requestsThisWindow"], 3);
    assert_eq!(json["usage"]["rpm"], 600);
    assert_eq!(json["usage"]["dailyQuota"], 100000);
    assert_eq!(json["plan"], "pro");
}

// ---------------- batch 10: hardening (security + observability) ----------------

/// State with full config override (per-test knobs).
async fn test_state_config(cfg: StateConfig) -> Arc<AppState> {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().to_path_buf();
    std::mem::forget(dir);
    AppState::builder()
        .cache(vexillum_cache::RenderCache::open(&path.join("cache.redb"), 256).unwrap())
        .auth(AuthStore::open(&path.join("vexillum.db")).await.unwrap())
        .billing(BillingStore::open(&path.join("vexillum.db")).await.unwrap())
        .icons(vexillum_icons::store::IconStore::open(&path.join("icons")).unwrap())
        .config(cfg)
        .build()
}

#[tokio::test]
async fn cors_allowlist_blocks_unknown_origins() {
    let state = test_state_config(StateConfig {
        cors_origins: vec!["https://app.example.com".into()],
        ..Default::default()
    })
    .await;
    let req = |origin: &str| {
        app(state.clone())
            .oneshot(
                Request::builder()
                    .uri("/v1/meta")
                    .header(header::ORIGIN, origin)
                    .body(Body::empty())
                    .unwrap(),
            )
    };
    let ok = req("https://app.example.com").await.unwrap();
    assert_eq!(
        ok.headers()
            .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
            .and_then(|v| v.to_str().ok()),
        Some("https://app.example.com"),
        "allowlisted origin is reflected"
    );
    let blocked = req("https://evil.example.org").await.unwrap();
    assert!(
        blocked
            .headers()
            .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
            .is_none(),
        "unknown origin must not be reflected"
    );
}

#[tokio::test]
async fn cors_reflects_anything_when_allowlist_unset() {
    // legacy posture preserved for existing deployments
    let state = test_state(60).await;
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri("/v1/meta")
                .header(header::ORIGIN, "https://anything.example")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(
        res.headers()
            .get(header::ACCESS_CONTROL_ALLOW_ORIGIN)
            .and_then(|v| v.to_str().ok()),
        Some("https://anything.example")
    );
}

#[tokio::test]
async fn security_headers_on_badge_and_json() {
    let state = test_state(60).await;
    let svg = app(state.clone())
        .oneshot(
            Request::builder()
                .uri("/badge/foundational/c01-04/build/passing")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(svg.headers().get("x-content-type-options").unwrap(), "nosniff");
    assert_eq!(
        svg.headers().get("content-security-policy").unwrap(),
        "default-src 'none'; style-src 'unsafe-inline'; object-src 'none'",
        "image payloads carry the script-defusing CSP"
    );
    assert_eq!(svg.headers().get("x-frame-options").unwrap(), "DENY");

    let json = app(state)
        .oneshot(
            Request::builder()
                .uri("/v1/meta")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(json.headers().get("x-content-type-options").unwrap(), "nosniff");
    assert!(
        json.headers().get("content-security-policy").is_none(),
        "CSP sandbox is image-only — JSON APIs stay usable"
    );
    assert_eq!(
        json.headers().get("referrer-policy").unwrap(),
        "strict-origin-when-cross-origin"
    );
}

#[tokio::test]
async fn gzip_compresses_svg_and_json_but_not_raster() {
    use flate2::read::GzDecoder;
    use std::io::Read;

    let state = test_state(60).await;
    let do_get = |uri: &'static str, accept: &'static str| {
        let state = state.clone();
        async move {
            app(state)
                .oneshot(
                    Request::builder()
                        .uri(uri)
                        .header(header::ACCEPT_ENCODING, accept)
                        .body(Body::empty())
                        .unwrap(),
                )
                .await
                .unwrap()
        }
    };

    // SVG with gzip support → gzipped, and the payload round-trips
    let res = do_get("/badge/foundational/c01-04/build/passing", "gzip").await;
    assert_eq!(
        res.headers().get(header::CONTENT_ENCODING).unwrap(),
        "gzip",
        "svg payloads are gzipped when the client opts in"
    );
    assert!(
        res.headers()
            .get_all(header::VARY)
            .iter()
            .any(|v| v.as_bytes().eq_ignore_ascii_case(b"accept-encoding")),
        "caches must key on Accept-Encoding"
    );
    let gzipped = axum::body::to_bytes(res.into_body(), usize::MAX)
        .await
        .unwrap();
    let mut plain = Vec::new();
    GzDecoder::new(&gzipped[..])
        .read_to_end(&mut plain)
        .unwrap();
    let plain = String::from_utf8(plain).unwrap();
    assert!(plain.contains("<svg"), "decompresses back to the svg");

    // identity client → no Content-Encoding at all
    let res = do_get("/badge/foundational/c01-04/build/passing", "identity").await;
    assert!(res.headers().get(header::CONTENT_ENCODING).is_none());

    // PNG stays raw — recompressing raster wastes CPU for ~zero gain
    let res = do_get(
        "/badge/foundational/c01-04/build/passing?format=png&scale=2",
        "gzip",
    )
    .await;
    assert_eq!(res.status(), StatusCode::OK);
    assert!(
        res.headers().get(header::CONTENT_ENCODING).is_none(),
        "png must not be re-compressed"
    );

    // the 544-entry manifest is the big JSON win
    let res = do_get("/v1/variants", "gzip").await;
    assert_eq!(res.headers().get(header::CONTENT_ENCODING).unwrap(), "gzip");
}

#[tokio::test]
async fn oversized_segments_are_rejected() {
    let state = test_state(60).await;
    let long_label = "x".repeat(257);
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri(format!("/badge/foundational/c01-04/{long_label}/v").as_str())
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
    // at the cap → fine
    let ok_label = "x".repeat(256);
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .uri(format!("/badge/foundational/c01-04/{ok_label}/v").as_str())
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    // extra segments cap at 64
    let long_extra = "x".repeat(65);
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri(format!("/badge/foundational/c01-14/a/b/{long_extra}").as_str())
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::BAD_REQUEST);
}

fn stripe_sign(payload: &[u8], ts: u64, secret: &str) -> String {
    let mut signed = ts.to_string().into_bytes();
    signed.push(b'.');
    signed.extend_from_slice(payload);
    let mac = vexillum_billing::webhook::hmac_sha256(secret.as_bytes(), &signed);
    let hexed: String = mac.iter().map(|b| format!("{b:02x}")).collect();
    format!("t={ts},v1={hexed}")
}

#[tokio::test]
async fn stripe_webhook_roundtrip() {
    let secret = "whsec_test_secret";
    let state = test_state_config(StateConfig {
        stripe_webhook_secret: Some(secret.into()),
        ..Default::default()
    })
    .await;
    let payload = serde_json::json!({
        "id": "evt_1",
        "type": "checkout.session.completed",
        "data": { "object": {
            "customer": "cus_42",
            "metadata": { "tier": "pro" }
        }}
    });
    let body = serde_json::to_vec(&payload).unwrap();
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let sig = stripe_sign(&body, now, secret);
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/billing/webhook")
                .header("stripe-signature", sig)
                .header(header::CONTENT_TYPE, "application/json")
                .body(Body::from(body.clone()))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::OK);
    let bytes = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json["applied"], true);

    // the subscription landed
    let sub = state
        .billing
        .as_ref()
        .unwrap()
        .subscription("cus_42")
        .await
        .unwrap()
        .expect("checkout event created a subscription");
    assert_eq!(sub.tier, Tier::Pro);

    // idempotent replay (same event id) is ACKed but not re-applied
    let sig2 = stripe_sign(&body, now, secret);
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/billing/webhook")
                .header("stripe-signature", sig2)
                .body(Body::from(body.clone()))
                .unwrap(),
        )
        .await
        .unwrap();
    let bytes = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json["applied"], false);

    // tampered payload → 401 (valid json, different bytes than signed)
    let mut tampered = body.clone();
    let flip = tampered
        .windows(6)
        .position(|w| w == b"cus_42")
        .expect("payload contains cus_42");
    tampered[flip + 5] = b'3'; // "cus_42" -> "cus_43": payload changes, signature doesn't
    assert_ne!(tampered, body, "tamper must actually change the payload");
    let sig3 = stripe_sign(&body, now, secret); // signature over the ORIGINAL
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/billing/webhook")
                .header("stripe-signature", sig3)
                .body(Body::from(tampered))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::UNAUTHORIZED);

    // unknown event type → ACKed, unhandled
    let other = serde_json::json!({
        "id": "evt_2",
        "type": "invoice.paid",
        "data": { "object": { "customer": "cus_42" } }
    });
    let other_body = serde_json::to_vec(&other).unwrap();
    let sig4 = stripe_sign(&other_body, now, secret);
    let res = app(state.clone())
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/billing/webhook")
                .header("stripe-signature", sig4)
                .body(Body::from(other_body))
                .unwrap(),
        )
        .await
        .unwrap();
    let bytes = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let json: serde_json::Value = serde_json::from_slice(&bytes).unwrap();
    assert_eq!(json["handled"], false);

    // missing secret → 503 service not configured
    let bare = test_state(60).await;
    let res = app(bare)
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/v1/billing/webhook")
                .body(Body::from("{\"id\":\"e\",\"type\":\"x\"}"))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(res.status(), StatusCode::SERVICE_UNAVAILABLE);
}

#[tokio::test]
async fn metrics_exposes_counters() {
    let state = test_state(60).await;
    // one render (miss) + one repeat (hit)
    for _ in 0..2 {
        app(state.clone())
            .oneshot(
                Request::builder()
                    .uri("/badge/foundational/c01-04/build/passing")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
    }
    let res = app(state)
        .oneshot(
            Request::builder()
                .uri("/metrics")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    let body = axum::body::to_bytes(res.into_body(), usize::MAX).await.unwrap();
    let text = String::from_utf8_lossy(&body);
    assert!(text.contains("tbc_variants 544"));
    assert!(text.contains("tbc_badge_requests_total 2"));
    assert!(text.contains("tbc_cache_hits_total 1"));
    assert!(text.contains("tbc_cache_misses_total 1"));
}

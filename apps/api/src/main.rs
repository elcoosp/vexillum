//! `vexillum-server` — the VPS origin binary (spec §12.1).

use anyhow::Context;
use clap::Parser;
use vexillum_api::{AppState, StateConfig, router};
use vexillum_data::ServiceRegistry;

#[derive(Parser, Debug)]
#[command(name = "vexillum-server", version, about = "Vexillum origin server")]
struct Args {
    /// Listen address.
    #[arg(long, default_value = "0.0.0.0:8080")]
    listen: String,
    /// Data directory for the SQLite database (SeaORM), the render cache and
    /// uploaded icons.
    #[arg(long, default_value = "./data")]
    data_dir: String,
    /// GitHub tokens for the shared pool (comma-separated). Env: VX_GITHUB_TOKENS.
    #[arg(long)]
    github_tokens: Option<String>,
    /// Anonymous requests per minute.
    #[arg(long, default_value_t = 60)]
    anonymous_rpm: u32,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,tower_http=warn".into()),
        )
        .init();

    let args = Args::parse();
    let data_dir = std::path::Path::new(&args.data_dir);
    std::fs::create_dir_all(data_dir).context("create data dir")?;

    let github_tokens: Vec<String> = std::env::var("VX_GITHUB_TOKENS")
        .ok()
        .or(args.github_tokens)
        .map(|s| {
            s.split(',')
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .map(String::from)
                .collect()
        })
        .unwrap_or_default();

    // GitHub OAuth for the dashboard login wall (optional — the API reports
    // 503 on /v1/auth/github/login when absent). Env:
    //   VX_GITHUB_CLIENT_ID / VX_GITHUB_CLIENT_SECRET  — the OAuth app
    //   VX_OAUTH_REDIRECT_URI                          — registered callback
    //   VX_PUBLIC_URL                                  — web frontend origin
    let oauth = match (
        std::env::var("VX_GITHUB_CLIENT_ID")
            .ok()
            .filter(|s| !s.is_empty()),
        std::env::var("VX_GITHUB_CLIENT_SECRET")
            .ok()
            .filter(|s| !s.is_empty()),
    ) {
        (Some(client_id), Some(client_secret)) => {
            let public =
                std::env::var("VX_PUBLIC_URL").unwrap_or_else(|_| "http://localhost:5173".into());
            let redirect_uri = std::env::var("VX_OAUTH_REDIRECT_URI")
                .unwrap_or_else(|_| format!("{public}/v1/auth/github/callback"));
            tracing::info!("GitHub OAuth enabled (callback: {redirect_uri})");
            Some(std::sync::Arc::new(vexillum_auth::GithubOAuth::new(
                client_id,
                client_secret,
                redirect_uri,
                public.clone(),
            )))
        }
        _ => {
            tracing::info!("GitHub OAuth not configured — the dashboard login wall stays closed");
            None
        }
    };

    let state = AppState::builder()
        .services(ServiceRegistry::launch_set(github_tokens))
        .cache(vexillum_cache::RenderCache::open(
            &data_dir.join("cache.redb"),
            100_000,
        )?)
        .auth(vexillum_auth::AuthStore::open(&data_dir.join("vexillum.db")).await?)
        .billing(vexillum_billing::BillingStore::open(&data_dir.join("vexillum.db")).await?)
        .icons(vexillum_icons::store::IconStore::open(
            &data_dir.join("icons"),
        )?)
        .oauth(oauth)
        .config(StateConfig {
            anonymous_rpm: args.anonymous_rpm,
            frontend_url: std::env::var("VX_PUBLIC_URL")
                .unwrap_or_else(|_| "http://localhost:5173".into()),
            // Hardening knobs (all optional):
            //   VX_CORS_ORIGINS          — comma-separated origin allowlist;
            //                              empty keeps the legacy reflect-any posture
            //   VX_TRUST_PROXY=1         — meter per client IP from X-Forwarded-For
            //                              (ONLY behind a proxy that overwrites the chain)
            //   VX_STRIPE_WEBHOOK_SECRET — enables POST /v1/billing/webhook
            cors_origins: std::env::var("VX_CORS_ORIGINS")
                .ok()
                .map(|s| {
                    s.split(',')
                        .map(str::trim)
                        .filter(|s| !s.is_empty())
                        .map(String::from)
                        .collect()
                })
                .unwrap_or_default(),
            trust_proxy: std::env::var("VX_TRUST_PROXY")
                .ok()
                .is_some_and(|v| v == "1" || v.eq_ignore_ascii_case("true")),
            stripe_webhook_secret: std::env::var("VX_STRIPE_WEBHOOK_SECRET")
                .ok()
                .filter(|s| !s.is_empty()),
            ..Default::default()
        })
        .build();

    // credential-capable CORS (session cookie) is part of routes::build
    let app = router(state).layer(tower_http::trace::TraceLayer::new_for_http());

    let listener = tokio::net::TcpListener::bind(&args.listen)
        .await
        .with_context(|| format!("bind {}", args.listen))?;
    tracing::info!("vexillum listening on {}", args.listen);
    // with_connect_info gives the per-IP meter the real socket address
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .context("serve")?;
    Ok(())
}

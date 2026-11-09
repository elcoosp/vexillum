//! Shared application state.

use std::sync::Arc;

use vexillum_auth::{AuthStore, GithubOAuth, Meter};
use vexillum_billing::BillingStore;
use vexillum_cache::RenderCache;
use vexillum_data::ServiceRegistry;
use vexillum_theme::Oklch;

/// CSRF state entries live 10 minutes between `/login` and `/callback`.
pub const LOGIN_STATE_TTL_MS: u64 = 10 * 60 * 1000;

/// Runtime configuration knobs (test-friendly).
#[derive(Debug, Clone)]
pub struct StateConfig {
    /// Anonymous rate limit per IP per minute.
    pub anonymous_rpm: u32,
    /// Max pad parameter allowed.
    pub max_pad: u32,
    /// Default theme name when none requested.
    pub default_theme: Option<String>,
    /// Frontend origin the OAuth callback bounces to (dashboard URL base).
    pub frontend_url: String,
    /// CORS origin allowlist (hosts like `app.example.com` or full origins).
    /// Empty = legacy behavior (reflect any origin with credentials — fine
    /// while the session cookie stays SameSite=Lax, dangerous if a same-site
    /// sibling subdomain is ever compromised). Set `VX_CORS_ORIGINS` in
    /// production for a strict allowlist.
    pub cors_origins: Vec<String>,
    /// Trust `X-Forwarded-For` for client-IP metering (set ONLY when the
    /// server sits behind a proxy that overwrites the chain). False = direct
    /// socket address, so a spoofable header can never dodge rate limits.
    pub trust_proxy: bool,
    /// Stripe webhook signing secret (`VX_STRIPE_WEBHOOK_SECRET`). None =
    /// the webhook route reports 503.
    pub stripe_webhook_secret: Option<String>,
}

impl Default for StateConfig {
    fn default() -> Self {
        Self {
            anonymous_rpm: 60,
            max_pad: 64,
            default_theme: None,
            frontend_url: "http://localhost:5173".into(),
            cors_origins: Vec::new(),
            trust_proxy: false,
            stripe_webhook_secret: None,
        }
    }
}

/// Process-lifetime counters exposed on `GET /metrics` (Prometheus style).
#[derive(Default)]
pub struct ApiStats {
    pub badge_requests: std::sync::atomic::AtomicU64,
    pub cache_hits: std::sync::atomic::AtomicU64,
    pub cache_misses: std::sync::atomic::AtomicU64,
    pub rate_limited: std::sync::atomic::AtomicU64,
    pub webhook_events: std::sync::atomic::AtomicU64,
}

pub struct AppState {
    pub services: ServiceRegistry,
    pub cache: RenderCache,
    pub auth: Option<AuthStore>,
    pub billing: Option<BillingStore>,
    pub meter: Meter,
    pub icons: vexillum_icons::store::IconStore,
    pub config: StateConfig,
    /// GitHub OAuth app; None = login route reports 503.
    pub oauth: Option<Arc<GithubOAuth>>,
    /// OAuth CSRF states issued by /login, consumed by /callback.
    pub login_states: parking_lot::Mutex<std::collections::HashMap<String, u64>>,
    /// Custom themes saved via POST /v1/themes (org: name → tokens).
    pub custom_themes:
        parking_lot::Mutex<std::collections::HashMap<String, vexillum_theme::ResolvedTheme>>,
    /// Per-variant demand counters (`GET /v1/stats/popular`). Every static
    /// badge request — cache hit or render — bumps its variant; the ranking
    /// answers "which badges are the most used". In-memory, per process:
    /// honest for a single node, reset on restart.
    pub usage: parking_lot::Mutex<std::collections::HashMap<String, u64>>,
    /// Monotonic counters for `GET /metrics`.
    pub stats: ApiStats,
}

impl AppState {
    pub fn builder() -> AppStateBuilder {
        AppStateBuilder::default()
    }

    /// Base URL of the web frontend (OAuth success target, error bounces).
    pub fn frontend_url(&self) -> &str {
        &self.config.frontend_url
    }

    /// Bumps the demand counter for a variant (static badge requests only).
    pub fn record_variant_render(&self, variant: &str) {
        *self.usage.lock().entry(variant.to_string()).or_insert(0) += 1;
    }

    /// The top-N most-requested variants, descending. Ties break by id for a
    /// deterministic order (tests, stable UI).
    pub fn popular_variants(&self, limit: usize) -> Vec<(String, u64)> {
        let map = self.usage.lock();
        let mut rows: Vec<(String, u64)> = map
            .iter()
            .map(|(k, v)| (k.clone(), *v))
            .collect();
        rows.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
        rows.truncate(limit);
        rows
    }

    /// Total requests across all tracked variants.
    pub fn total_variant_renders(&self) -> u64 {
        self.usage.lock().values().sum()
    }
}

#[derive(Default)]
pub struct AppStateBuilder {
    services: Option<ServiceRegistry>,
    cache: Option<RenderCache>,
    auth: Option<AuthStore>,
    billing: Option<BillingStore>,
    icons: Option<vexillum_icons::store::IconStore>,
    config: Option<StateConfig>,
    oauth: Option<Arc<GithubOAuth>>,
}

impl AppStateBuilder {
    pub fn services(mut self, s: ServiceRegistry) -> Self {
        self.services = Some(s);
        self
    }
    pub fn cache(mut self, c: RenderCache) -> Self {
        self.cache = Some(c);
        self
    }
    pub fn auth(mut self, a: impl Into<Option<AuthStore>>) -> Self {
        self.auth = a.into();
        self
    }
    pub fn billing(mut self, b: impl Into<Option<BillingStore>>) -> Self {
        self.billing = b.into();
        self
    }
    pub fn icons(mut self, i: vexillum_icons::store::IconStore) -> Self {
        self.icons = Some(i);
        self
    }
    pub fn config(mut self, c: StateConfig) -> Self {
        self.config = Some(c);
        self
    }
    pub fn oauth(mut self, o: impl Into<Option<Arc<GithubOAuth>>>) -> Self {
        self.oauth = o.into();
        self
    }
    pub fn build(self) -> Arc<AppState> {
        Arc::new(AppState {
            services: self
                .services
                .unwrap_or_else(|| ServiceRegistry::launch_set(vec![])),
            cache: self.cache.expect("cache is required"),
            auth: self.auth,
            billing: self.billing,
            meter: Meter::new(),
            icons: self.icons.expect("icon store is required"),
            config: self.config.unwrap_or_default(),
            oauth: self.oauth,
            login_states: parking_lot::Mutex::new(std::collections::HashMap::new()),
            custom_themes: parking_lot::Mutex::new(std::collections::HashMap::new()),
            usage: parking_lot::Mutex::new(std::collections::HashMap::new()),
            stats: ApiStats::default(),
        })
    }
}

/// Resolves a theme by name: seed presets, `seed:<hex>`, `brand:<hex>` or a
/// saved custom token map.
///
/// Presets and brand colors all resolve through the semantic ramp — one seed
/// drives the full OKLCH vocabulary (surfaces, borders, text, accents), with
/// `mode` flipping the surface ramps. The returned theme is palette-mode
/// (explicit values), so render-time substitution replaces every
/// `var(--vx-*, fallback)` the templates reference.
pub fn resolve_theme(name: &str) -> Result<vexillum_theme::ResolvedTheme, vexillum_core::Error> {
    resolve_theme_mode(name, vexillum_theme::Mode::Light)
}

/// `resolve_render_theme` with an explicit surface mode (dark mode support).
pub fn resolve_theme_mode(
    name: &str,
    mode: vexillum_theme::Mode,
) -> Result<vexillum_theme::ResolvedTheme, vexillum_core::Error> {
    resolve_theme_mode_with_seed(name, mode).map(|(t, _)| t)
}

/// `resolve_theme_mode` plus the seed the name resolved from — presets,
/// `seed:` and `brand:` all parse a concrete hex, which the dual-seed path
/// needs to mirror the ramp into the value-side token family.
fn resolve_theme_mode_with_seed(
    name: &str,
    mode: vexillum_theme::Mode,
) -> Result<(vexillum_theme::ResolvedTheme, Oklch), vexillum_core::Error> {
    for prefix in ["seed:", "brand:"] {
        if let Some(hex) = name.strip_prefix(prefix) {
            let normalized = if hex.starts_with('#') {
                hex.to_string()
            } else {
                format!("#{hex}")
            };
            let seed = vexillum_theme::parse_seed(&normalized)
                .ok_or_else(|| vexillum_core::Error::BadRequest(format!("invalid seed '{hex}'")))?;
            return Ok((
                vexillum_theme::semantic_theme(&seed, mode, &format!("{prefix}{hex}")),
                seed,
            ));
        }
    }
    let hex = vexillum_theme::preset_seed(name)
        .ok_or_else(|| vexillum_core::Error::UnknownTheme(name.to_string()))?;
    let seed = vexillum_theme::parse_seed(hex).expect("preset seed parses");
    Ok((vexillum_theme::semantic_theme(&seed, mode, name), seed))
}

/// Resolves the render theme for a badge request: `?seed=` wins over
/// `?theme=`, `?mode=` applies to both, and the state default theme fills in
/// when neither is present. `?seed2=` (value-side seed) overlays the
/// `vx-v-*` token family on whatever base theme resolves — with or without
/// an explicit base seed (absent base = the default blue ramp).
pub fn resolve_render_theme(
    query_theme: Option<&str>,
    query_seed: Option<&str>,
    query_mode: Option<vexillum_theme::Mode>,
    default_theme: Option<&str>,
    query_seed2: Option<&str>,
) -> Result<Option<vexillum_theme::ResolvedTheme>, vexillum_core::Error> {
    let mode = query_mode.unwrap_or(vexillum_theme::Mode::Light);
    // The base theme plus the seed it resolved from (always known for seed /
    // preset / brand bases — the dual-seed path needs it to mirror the ramp).
    let base: Option<(vexillum_theme::ResolvedTheme, Oklch)> = if let Some(seed) = query_seed {
        let normalized = if seed.starts_with('#') {
            seed.to_string()
        } else {
            format!("#{seed}")
        };
        let parsed = vexillum_theme::parse_seed(&normalized)
            .ok_or_else(|| vexillum_core::Error::BadRequest(format!("invalid seed '{seed}'")))?;
        Some((
            vexillum_theme::semantic_theme(&parsed, mode, &format!("seed:{seed}")),
            parsed,
        ))
    } else if let Some(name) = query_theme {
        Some(resolve_theme_mode_with_seed(name, mode)?)
    } else {
        match default_theme {
            Some(name) => Some(resolve_theme_mode_with_seed(name, mode)?),
            None => None,
        }
    };
    match query_seed2 {
        None => {
            // No seed2: still overlay the v- family derived from the BASE
            // seed, so the value-side `var(--vx-v-*, …)` references in the
            // templates resolve to the same colors as the base tokens and
            // renders stay byte-identical to the pre-dual-seed output.
            match base {
                None => Ok(None),
                Some((t, seed)) => Ok(Some(vexillum_theme::overlay_value_seed(t, &seed, mode))),
            }
        }
        Some(seed2) => {
            let normalized = if seed2.starts_with('#') {
                seed2.to_string()
            } else {
                format!("#{seed2}")
            };
            let value_seed = vexillum_theme::parse_seed(&normalized).ok_or_else(|| {
                vexillum_core::Error::BadRequest(format!("invalid seed '{seed2}'"))
            })?;
            // seed2 without an explicit base seed rides the default ramp
            let (mut base, _) = base.unwrap_or_else(|| {
                let seed = vexillum_theme::parse_seed(vexillum_theme::DEFAULT_SEED)
                    .expect("default seed parses");
                (
                    vexillum_theme::semantic_theme(&seed, mode, "default"),
                    seed,
                )
            });
            base.source = if base.source == "default" {
                // no explicit base — name the default ramp + the value seed
                format!(
                    "seed:{}+seed2:{seed2}",
                    vexillum_theme::DEFAULT_SEED.trim_start_matches('#')
                )
            } else {
                format!("{}+seed2:{seed2}", base.source)
            };
            Ok(Some(vexillum_theme::overlay_value_seed(base, &value_seed, mode)))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn brand_theme_from_hex() {
        let t = resolve_theme("brand:3b82f6").unwrap();
        assert_eq!(t.source, "brand:3b82f6");
        assert!(t.token("vx-a").is_some());
        assert!(t.token("vx-t-heading").is_some());
        assert!(!t.is_retint(), "semantic themes are palette-mode");
        // seed: prefix resolves identically
        let s = resolve_theme("seed:3b82f6").unwrap();
        assert_eq!(t.colors, s.colors);
    }

    #[test]
    fn presets_resolve_to_seed_ramps() {
        let rose = resolve_theme("rose").unwrap();
        let pink = resolve_theme("pink").unwrap();
        assert_eq!(rose.colors, pink.colors, "v4 alias maps to the pink seed");
        assert_eq!(resolve_theme("bogus").unwrap_err().status(), 404);
        assert_eq!(resolve_theme("brand:nothex").unwrap_err().status(), 400);
    }

    #[test]
    fn render_theme_resolution_order() {
        use vexillum_theme::Mode;
        // seed wins over theme
        let t = resolve_render_theme(Some("rose"), Some("ec4899"), None, None, None)
            .unwrap()
            .unwrap();
        assert_eq!(t.source, "seed:ec4899");
        // mode applies to presets
        let dark = resolve_render_theme(Some("rose"), None, Some(Mode::Dark), None, None)
            .unwrap()
            .unwrap();
        let light = resolve_render_theme(Some("rose"), None, None, None, None)
            .unwrap()
            .unwrap();
        assert_ne!(dark.token("vx-s-white"), light.token("vx-s-white"));
        // default theme fills when neither given
        let d = resolve_render_theme(None, None, None, Some("blue"), None)
            .unwrap()
            .unwrap();
        assert_eq!(d.source, "blue");
        // nothing anywhere = no theme
        assert!(
            resolve_render_theme(None, None, None, None, None)
                .unwrap()
                .is_none()
        );
        // invalid seed errors
        assert_eq!(
            resolve_render_theme(None, Some("zzz"), None, None, None)
                .unwrap_err()
                .status(),
            400
        );
    }

    #[test]
    fn seed2_overlays_value_side_only() {
        use vexillum_theme::Mode;
        // seed2 with a base seed: base tokens untouched, v- family rides seed2
        let t = resolve_render_theme(None, Some("3b82f6"), None, None, Some("ec4899"))
            .unwrap()
            .unwrap();
        let solo = resolve_render_theme(None, Some("3b82f6"), None, None, None)
            .unwrap()
            .unwrap();
        // base tokens are identical
        for (token, css) in &solo.colors {
            if token.starts_with("vx-v-") {
                continue; // value-side family differs by design
            }
            assert_eq!(t.token(token), Some(css.as_str()), "{token} unchanged");
        }
        // without seed2 the v- family mirrors the base seed byte-for-byte
        for (token, css) in &solo.colors {
            if !token.starts_with("vx-v-") {
                continue;
            }
            let base_name = token.replacen("vx-v-", "vx-", 1);
            assert_eq!(
                Some(css.as_str()),
                solo.colors.get(&base_name).map(String::as_str),
                "{token} must mirror {base_name} when no seed2 is given"
            );
        }
        let pink = vexillum_theme::parse_seed("#ec4899").unwrap();
        let want = vexillum_theme::resolve_ramp(pink, Mode::Light);
        assert_eq!(
            t.token("vx-v-a"),
            want.tokens.get("vx-a").map(String::as_str)
        );
        assert!(t.source.ends_with("+seed2:ec4899"), "{}", t.source);

        // seed2 with a preset base
        let p = resolve_render_theme(Some("violet"), None, None, None, Some("22c55e"))
            .unwrap()
            .unwrap();
        assert_eq!(p.source, "violet+seed2:22c55e");
        assert!(p.token("vx-v-s-white").is_some());

        // seed2 with NO base rides the default ramp
        let d = resolve_render_theme(None, None, None, None, Some("f59e0b"))
            .unwrap()
            .unwrap();
        assert!(d.source.starts_with("seed:"), "{}", d.source);
        assert!(d.token("vx-v-a").is_some());
        assert!(d.token("vx-a").is_some());

        // seed2 changes the css root block → distinct cache keys
        let with = resolve_render_theme(None, Some("3b82f6"), None, None, Some("ec4899"))
            .unwrap()
            .unwrap();
        assert_ne!(with.css_root_block(), solo.css_root_block());

        // invalid seed2 errors with 400
        assert_eq!(
            resolve_render_theme(None, Some("3b82f6"), None, None, Some("zzz"))
                .unwrap_err()
                .status(),
            400
        );
    }
}

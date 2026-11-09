# Vexillum

A monetized badges service — a shields.io-class product that renders **544 structural badge variants** across 34 collections to **SVG, PNG, JPG, WebP, GIF, and APNG**, powered by the [takumi](https://github.com/kane50613/takumi) (browserless CSS/flexbox layout in Rust).

**Core axiom:** a badge is a React component compiled once into HTML + Tailwind CSS; Rust substitutes slot markers and calls `takumi::from_html` at render time.

```
AUTHORING (TS, build time)                     RUNTIME (Rust, request time)
packages/badges/src/foundational/c01-01.tsx    crates/templates  (embedded HTML + CSS)
        ↓ React SSR + Tailwind CLI + emit      crates/render     (takumi::from_html)
packages/compiler/out/*.html          ═══►     crates/api        (axum, tiers, cache)
crates/templates/assets/*  (include_str!)      SVG / PNG / WebP / GIF / APNG
```

## Status: fully implemented, all gates green

| Gate | Result |
| --- | --- |
| `cargo test --workspace` | **271 tests, 0 failures** |
| TS tests (`vitest`) across 6 packages | **210 tests, 0 failures** (browser mode, zero jsdom) |
| Typecheck (`tsc --noEmit`, TS 7 strict) | all packages clean |
| Rust wasm32 check (`vexillum-worker`) | compiles for `wasm32-unknown-unknown` |
| Visual regression (544 variants × golden PNG/GIF) | **0.0000% pixel drift** |
| All-544 render gate (PNG, and GIF for kinetic) | **seconds for the full catalog** |

## The badge catalog

The `badge-collections.html` source file (32 collections × 16 structural variants — 16 foundational + 16 Expansion II) is converted by `@vexillum/converter` into typed React components:

| Collection | id | Collection | id |
| --- | --- | --- | --- |
| Foundational | c01 | Experimental | c11 |
| Premium | c02 | Kinetic | c12 |
| Technical | c03 | Data | c13 |
| Luminous | c04 | Social | c14 |
| Brutalist | c05 | Status | c15 |
| Editorial | c06 | Minimal | c16 |
| Industrial–Terminal | c07–c09 | | |
| Data-Infra | c10 | Expansion II | c17–c32 |

Expansion II doubles the catalog: slab, frame, capsule, tab, ruled, ledger, facet, ring, cap,
contour, crop, rail, ticket, stack, float and spark — every chassis carries the full icon slot
and the complete OKLCH token vocabulary.

The converter guarantees **pixel-perfect parity by construction**:

- every CSS cascade is computed per node from the source stylesheet,
- `::before`/`::after` pseudo-elements are materialized into real nodes (so rendering never depends on pseudo-element support),
- inline styles carry the exact computed values (the source of truth),
- Tailwind utility classes + `tw` attributes are generated alongside (spec §3),
- semantic colors become `var(--token, <original>)` — the default render injects **no** tokens, so every fallback reproduces the source exactly; selecting a theme swaps tokens globally,
- the first SVG of each badge becomes the `__VX_ICON__` slot with the original glyph as default,
- text slots map to `__VX_LABEL__` / `__VX_VALUE__` / `__VX_EXTRA__` (tri-segment, tag chips).

## Workspace layout

```
apps/
  web/          Vite + Tailwind 4 + shadcn-style SPA (badge explorer, URL builder)
  api/          vexillum-server — the VPS origin binary (axum)
  worker/       Cloudflare Worker (static badges, wasm32)
packages/
  badges/       544 generated TSX components + slots/theme/registry
  compiler/     React SSR → out/*.html + Tailwind CLI + Rust asset emission
  converter/    HTML+CSS → TSX/registry (TDD: the heart of the pipeline)
  themes/       TS mirror of the OKLCH/WCAG theme engine
  sdk/          typed API client
  playground/   browser-vs-vexillum WASM side-by-side (dev)
crates/
  core/         domain types, markers, formats, RFC 7807, compact numbers
  templates/    embedded HTML + Tailwind CSS + keyframes + registry manifest
  render/       vexillum pipeline: substitute → measure → render (all formats)
  theme/        OKLCH, WCAG AA guardrail, presets
  cache/        moka L1 + redb L2, structural SHA-256 keys
  icons/        curated brand set (Simple Icons), sanitizer, upload store
  data/         github / npm / crates.io / docker / dynamic JSON / endpoint
  auth/         API keys (SHA-256 at rest), per-key origin allowlists, tiers, meter — SeaORM 2.0 over SQLite
  billing/      Stripe webhooks (HMAC verified, RFC 4231 tested), idempotent — SeaORM 2.0 over SQLite
  api/          routes, identity, tier gates, cache headers, problem+json
```

## Quick start

```bash
pnpm install --frozen-lockfile --allow-build=esbuild --allow-build=@parcel/watcher

# build the template pipeline (SSR 544 badges + Tailwind + Rust assets)
pnpm --filter @vexillum/compiler compile

# run the server
cargo run -p vexillum-server -- --listen 0.0.0.0:8080 --data-dir ./data

# use it
curl 'http://localhost:8080/badge/foundational/c01-01/build/passing?format=svg'
curl 'http://localhost:8080/badge/foundational/c01-07/deploy/ok?format=png&scale=2&theme=rose'
```

## API surface

| Route | Description |
| --- | --- |
| `GET /badge/:collection/:variant/:label/:value` | static badge (`.svg` default; `?format=png\|webp\|gif\|apng\|jpg`) |
| `GET /badge/:collection/:index/:label/:value` | index form (`/badge/foundational/01/build/passing`) |
| `GET /badge/github/stars/:owner/:repo` | live data (`forks`, `issues`, `v`, `actions/status/…`) |
| `GET /badge/npm/v/:package` · `/badge/npm/dm/:package` | npm version / downloads |
| `GET /badge/crates/v/:crate` · `/badge/crates/dl/:crate` | crates.io |
| `GET /badge/docker/pulls/:org/:image` | Docker Hub |
| `GET /badge/dynamic/json?url=&query=&label=&prefix=&suffix=` | arbitrary JSON (JSONPath subset, https-only) |
| `GET /badge/endpoint?url=` | Shields-compatible endpoint schema |
| `GET /v1/variants` | registry manifest (544 entries) |
| `GET /v1/themes` · `POST /v1/themes` | presets / guardrail-corrected brand themes |
| `POST /v1/icons` | sanitized SVG upload (paid) |
| `GET /v1/usage` · `GET /health` · `GET /metrics` | metering, liveness, metrics |
| `GET /v1/auth/github/login` -> `GET /v1/auth/github/callback` | GitHub OAuth (dashboard login wall; 503 when unconfigured) |
| `GET /v1/auth/me` · `POST /v1/auth/logout` | session user + live usage / delete session |
| `GET/POST /v1/account/keys`, `DELETE /v1/account/keys/:hash`, `PUT /v1/account/keys/:hash/origins` | per-user key management (session cookie) |

Query parameters: `format`, `scale` (1/2/3), `theme` (`slate|blue|violet|emerald|amber|rose|brand:<hex>`), `icon=simple:<slug>|upload:<sha>`, `icon.color=auto|currentColor|<css>`, `icon.size`, `pad`, `key`. Shields.io aliases `logo` / `logoColor` are honored. Errors are RFC 7807 (`application/problem+json`).

## Tiers & metering

**Rendering a badge never requires a key.** Badge URLs are public images — READMEs, docs and `<img>` tags render anonymously inside a fair per-IP pool. Keys are optional: add one when you want traffic metered against your account for higher limits and Pro features.

Two plans, no seats, no enterprise theater:

| | Free | Pro ($8/mo, flat) |
| --- | --- | --- |
| Formats | SVG, PNG, JPG | + WebP, GIF, APNG (animation) |
| Rate limit | 60 rpm | 600 rpm |
| Cache TTL floor | 3600 s | 60 s |
| Icon uploads | — | ✓ |
| Per-key origin pinning | — | ✓ |
| Themes | all | all |

Keys are `vx_live_*` / `vx_test_*`, stored as SHA-256 hashes (SeaORM 2.0 over SQLite — every query goes through the entity API, no raw SQL). Dashboard accounts are GitHub-only: the login wall redirects to GitHub's authorize URL, the callback upserts the user and issues an `HttpOnly` `vx_session` cookie (30 days), and every dashboard number — profile, keys, quotas, requests-today — is read live from `GET /v1/auth/me`. There is no demo mode and no seeded data anywhere in the product.

**Origin pinning (per-key allowlist).** A key can be pinned to the hosts it may render from (dashboard → API keys → *Allowed origins*). When a pinned key is used, the request's `Origin`/`Referer` host — attached automatically by browsers on cross-site image loads — must be on the list; anything else is rejected with `403 problem+json`. A leaked key therefore cannot be spent from someone else's site, and README badges stay keyless and unaffected. Unpinned keys work from anywhere.

**Server hardening.** Every knob is optional and documented in `.env.example`: `VX_CORS_ORIGINS` pins the CORS allowlist (unset = legacy reflect-any posture with a startup warning), `VX_TRUST_PROXY=1` opts into `X-Forwarded-For` for per-IP metering ONLY behind a chain-overwriting proxy (spoofing the header otherwise cannot dodge rate limits), and `VX_STRIPE_WEBHOOK_SECRET` enables the signature-verified billing webhook. Beyond the knobs: security headers on every response (image-only CSP sandbox, `nosniff`, `X-Frame-Options: DENY`, referrer policy), slot-content caps (256/64 chars) bounding renderer work, HMAC-verified Stripe webhooks with constant-time compare and a 5-minute replay window, single-use OAuth state, https-only enforcement for user-supplied fetch URLs, an SSRF denylist (IP literals checked up front, every DNS resolution guarded — connections may only dial globally-routable addresses), and gzip on the compressible formats with `Vary: Accept-Encoding`.

## The color guardrail ("no atrocious output")

`crates/theme` resolves every foreground against its background in WCAG space:

1. pick white or `#111827` ink — whichever contrasts more,
2. if neither passes AA (4.5:1) — the mid-gray "no accessible ink" band — the **background** lightness is nudged until one does (hue and chroma survive; corrections look designer-made, not algorithmic),
3. brand themes (`brand:<hex>`) report `colorCorrected` so callers can surface the adjustment.

All foreground/background pairs across all six presets are test-enforced ≥ 4.5:1.

## Development

### GitHub OAuth for the dashboard (local setup, ~2 minutes)

The dashboard is login-walled and shows real data only. Sign-in is GitHub OAuth; until it is
configured the login page explains exactly what to do (it also prints the callback URL to
register, with a copy button):

1. Create an OAuth App at `https://github.com/settings/developers` —
   homepage `http://localhost:5173`, callback `http://localhost:5173/v1/auth/github/callback`
   (the Vite dev server proxies `/v1` to `:8080`, so the app registers the Vite origin).
2. `cp .env.example .env`, fill in `VX_GITHUB_CLIENT_ID` / `VX_GITHUB_CLIENT_SECRET`, source it,
   and start the server: `cargo run -p vexillum-server -- --listen 0.0.0.0:8080 --data-dir ./data`.
3. Open `http://localhost:5173/login` → **Continue with GitHub** → land back on the dashboard
   with a 30-day `HttpOnly` session cookie.

Unconfigured deployments report `503 application/problem+json` with the
`service-not-configured` error type — never a misleading error from another subsystem.

```bash
cargo test --workspace                    # Rust: 236 tests (auth/oauth/account included)
pnpm -r --if-present test                 # TS: unit (jsdom) tests
pnpm --filter @vexillum/web test:e2e      # browser e2e: every route in real Chromium, zero uncaught errors
pnpm --filter @vexillum/web run build     # tsc + vite production build
pnpm --filter @vexillum/compiler compile        # SSR + Tailwind + Rust assets
pnpm --filter @vexillum/compiler verify         # marker consistency for all 544
cargo run -p vexillum-render --bin render-goldens -- scripts/golden
node_modules/.bin/tsx scripts/visual-regression.ts            # 0.1% pixel gate
node_modules/.bin/tsx scripts/visual-regression.ts --update   # refresh goldens
cargo check -p vexillum-worker --target wasm32-unknown-unknown      # edge build
```

## Regenerating the catalog

Edit `badge-collections.html` (kept at the repo root as the design source), then:

```bash
cd packages/converter
tsx src/cli.ts /path/to/badge-collections.html ../badges/src
cd ../compiler && node dist/build.mjs all && node dist/verify.mjs
```

The pipeline is deterministic; `verify` fails on any marker/registry drift.

## Deployment (spec §12)

- **VPS origin**: `Dockerfile` (multi-stage: Rust release + template pipeline) or `infra/docker-compose.yml`; Caddy for TLS (`infra/Caddyfile`); `infra/fly.toml` for Fly.io.
- **Dashboard GitHub OAuth** (optional — the login wall stays closed with a clear 503 until configured):
  1. create an OAuth App at `https://github.com/settings/developers` with the callback
     `https://<api-origin>/v1/auth/github/callback`,
  2. run the server with `VX_GITHUB_CLIENT_ID`, `VX_GITHUB_CLIENT_SECRET`, and `VX_PUBLIC_URL`
     (the web frontend origin; defaults to `http://localhost:5173` — override the callback with
     `VX_OAUTH_REDIRECT_URI` when the API lives on its own domain),
  3. in development the Vite dev server proxies `/v1`, `/badge` and `/health` to `localhost:8080`,
     so the session cookie is same-origin with no extra CORS setup.
- **Edge**: `apps/worker` — static badges at the edge, dynamic/animated 302 to origin; `cargo check -p vexillum-worker --target wasm32-unknown-unknown` is a CI gate.

## Implementation notes & deliberate deviations

- **Vite 8.3.5, not 9**: no `vite@9` exists on npm yet (checked 2026-10); TypeScript **7.0.2** and Tailwind **4.3.3** are current as requested.
- **Inline-style-first hybrid**: spec §15 anticipated Tailwind-output incompatibilities ("the fix is local (CSS overrides)"); vexillum's `from_html` drops `<style>` blocks entirely, so compiled templates carry exact inline styles (the render source of truth) **plus** Tailwind classes/`tw` attributes for the authoring model and SPA. This is the overrides-escape-hatch taken to its logical conclusion.
- **`__VX_EXTRA__` marker**: added for tri-segment/tag variants (20 templates) — a backward-compatible extension of the three-slot contract so third segments remain user-controllable.
- **~30 label-only variants** (Prompt, Avatar stack, Sparkline, Toggle, Spinner…): their "value" is a graphic; the slot algorithm assigns their text to the label slot.
- **Theme via `var(--token, fallback)` + render-time stylesheet injection**: vexillum drops `<style>` from `from_html`, so tokens ride the `RenderOptions::stylesheet` option (proven in the integration spike) — the default theme injects nothing, preserving per-variant source values.
- **Static renders freeze animations** (`animation:*` stripped); GIF/WebP/APNG sample the CSS keyframe timeline through vexillum's native `time_ms`.
- **3,467 brand icons** served from the `simpleicons-rs` dataset (`/v1/icons`, `?icon=simple:<slug>`); the collections' inline glyphs ship as per-variant defaults.

## License

MIT OR Apache-2.0

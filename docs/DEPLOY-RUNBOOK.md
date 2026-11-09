# Deploy Runbook — vexillum

Everything a human must decide, register, click or keep secret to take
vexillum from this repository to a running public service. Steps that CAN be
automated already are (the Docker build, the template compile, the test and
visual-regression gates); this document covers the rest, in the order you
will hit it. Every checklist item has a verification step — do not skip
ahead past a red check.

---

## 0. Prerequisites (pin before you touch production)

| Tool | Version | Where it is pinned |
| --- | --- | --- |
| Rust | 1.x channel per `rust-toolchain.toml` | repo root |
| Node | 24 (Dockerfile uses `node:24-slim`) | `Dockerfile` |
| pnpm | 12.x (`packageManager` field, corepack-managed) | root `package.json` |
| Docker | 24+ with BuildKit | build host |

Supply-chain policy is enforced by `pnpm-workspace.yaml`:

- `minimumReleaseAge: 2880` — no dependency younger than 48h can enter the
  lockfile. If `pnpm install` ever fails with
  `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, a freshly-published version
  slipped past the lockfile — pin the previous version instead of waiting.
- `permissions` — packages that request build scripts or "agent skills"
  must be approved. If `pnpm install` fails with
  `ERR_PNPM_NO_AGENT_SKILLS_DIR` (or an "awaiting approval" notice), decide
  explicitly and record the decision in `pnpm-workspace.yaml`:

  ```sh
  pnpm approve '<pkg>'        # allow
  pnpm approve '!<pkg>'       # deny (records build/skills: false)
  ```

  The committed decision travels with the repo; nobody re-decides per host.

**Check:** `pnpm install && pnpm -r test && cargo test --workspace` are green
on the commit you are about to deploy. The browser e2e suite
(`pnpm --filter @vexillum/web test`) must show `zero uncaught errors` for
every route — it is the crash gate.

---

## 1. GitHub OAuth application (manual — GitHub has no API for this)

The dashboard login wall stays closed (friendly setup hint, HTTP 503 with
`errors/service-not-configured`) until this exists. Registering it is the
only step that cannot be scripted.

1. Sign in to GitHub as the account that owns the production org.
2. Open <https://github.com/settings/developers> → **New OAuth App**.
3. Fill in:
   - **Application name**: `vexillum` (or your brand).
   - **Homepage URL**: the public web origin, e.g. `https://vexillum.dev`.
   - **Authorization callback URL**:
     `https://<web-origin>/v1/auth/github/callback`
     — in development the Vite dev server proxies `/v1` to the API, so the
     dev app registers the *Vite* origin (`http://localhost:5173`), not the
     API port. Register **two** apps (one dev, one prod) rather than editing
     one back and forth.
4. After creation, click **Generate a new client secret**. The secret is
   shown exactly once.

**Check:** you now hold three strings that will never live in git:
client id (public), client secret (secret), callback URL (public).

---

## 2. Secrets (manual — secret managers do not take PRs)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VX_GITHUB_CLIENT_ID` | for login | OAuth app id |
| `VX_GITHUB_CLIENT_SECRET` | for login | OAuth app secret |
| `VX_PUBLIC_URL` | for login | web frontend origin; the callback is derived from it |
| `VX_OAUTH_REDIRECT_URI` | only when API is on its own domain | overrides the derived callback |
| `VX_GITHUB_TOKENS` | optional | comma-separated PAT pool for `github/*` data badges; without it those badges stay rate-limited-but-working |
| `RUST_LOG` | recommended | `info` in prod, `debug` to diagnose |
| `VX_LISTEN` | platform-specific | fly.toml sets `0.0.0.0:8080`; the CLI flag `--listen` also works |

Load them per platform:

- **docker compose** (self-hosted): `infra/docker-compose.yml` reads
  `VX_GITHUB_TOKENS` from the shell env; extend the `environment:` block for
  the OAuth pair. Keep the real values in a `.env` next to the compose file
  with `chmod 600` — `.env` is git-ignored.
- **Fly.io**: `fly secrets set VX_GITHUB_CLIENT_ID=… VX_GITHUB_CLIENT_SECRET=…`
  (`fly secrets list` shows names, never values).
- **Systemd / bare metal**: an `EnvironmentFile=/etc/vexillum.env`, root-owned,
  `chmod 600`.

**Check:** with secrets set and the server restarted, `curl -sI
https://<api-origin>/v1/auth/github/login` returns `302` (Found → GitHub).
Without them it returns `503` with
`errors/service-not-configured` — that is the designed closed-wall state,
not an outage.

---

## 3. Domain, DNS and TLS (manual — registrars have no taste for automation)

1. Register/pick the domain. Badge URLs are forever — choose the shortest
   credible origin (`vexillum.dev`, not `vexillum-badges.example.io`).
2. Point DNS at the edge:
   - **Caddy (self-hosted)**: edit `infra/Caddyfile`, replace
     `badge.example.com` with your hostname, point an `A/AAAA` record at the
     host. Caddy obtains and renews the ACME certificate automatically; the
     only manual part is DNS and opening ports 80/443.
   - **Fly.io**: `fly certs add <domain>` and create the `_acme-challenge`
     CNAME it prints. fly.toml already sets `force_https = true`.
3. Decide the web/API topology NOW, because the OAuth callback depends on it:
   - same origin (API behind the same domain, `/v1` path) — simplest, and
     the dev proxy already matches this shape;
   - separate API origin — then set `VX_OAUTH_REDIRECT_URI` and make sure
     the web app's `VITE_API_BASE` build arg points at it.

**Check:** `curl -sI https://<domain>/health` → `200`;
`curl -sI "https://<domain>/badge/c01-01.svg?label=a&value=b"` → `200` with
`image/svg+xml`; the browser padlock shows a valid certificate.

---

## 4. Build and ship the image

The multi-stage `Dockerfile` needs no arguments:

- stage 1 builds `vexillum-server` (release) with the pinned toolchain;
- stage 2 runs the template compiler (`pnpm --filter @vexillum/compiler
  compile`) so the 544 templates embedded in the binary are rebuilt from the
  TSX sources — never ship a container whose `crates/templates/assets` are
  stale;
- stage 3 is a slim runtime with the binary only.

```sh
docker build -t vexillum:$(git rev-parse --short HEAD) .
docker tag vexillum:$(git rev-parse --short HEAD) <registry>/vexillum:latest
docker push <registry>/vexillum:latest        # or: fly deploy (builds remotely)
```

**Check:** `docker run --rm vexillum:<sha> vexillum-server --help` prints the
CLI; the image contains no `.env`, no OAuth secrets, no node_modules.

---

## 5. Persistent state (manual — volume creation is a platform click)

The server keeps everything in `--data-dir` (default `./data`):

- `vexillum.db` — SQLite: accounts, API keys, usage counters, plans;
- `cache.redb` — render cache (safe to delete; rebuilt lazily).

- **docker compose**: the `vexillum-data` named volume is already wired to
  `/data`. Creating the volume is automatic; *backups* are not.
- **Fly.io**: `fly volumes create vexillum_data --size 3 --region fra`
  and reference it in `fly.toml` `[mounts]` (`source="vexillum_data"`,
  `destination="/data"`). Volumes live in ONE region — pick the region your
  users are closest to; `fra` is the committed default.

Establish the backup habit on day one (this is the part everyone forgets):

```sh
# compose host, nightly:
docker run --rm -v vexillum-data:/data -v $PWD/backups:/out alpine \
  sh -c 'apk add sqlite >/dev/null && sqlite3 /data/vexillum.db ".backup /out/vexillum-$(date +%F).db"'
```

(Fly: `fly postgres` is NOT used — the database is the SQLite file on the
volume; snapshot the volume with `fly volumes snapshots create`.)

**Check:** after first boot, `ls /data` shows both files; a test signup (see
§6) writes a row and survives `docker compose restart`.

---

## 6. First provisioning (manual clicks + one CLI)

1. Deploy, open `https://<domain>/login`, and complete a GitHub OAuth round
   trip yourself. Your account is now the first real row in SQLite.
2. Provision any manual/API keys with the one-off CLI (a separate binary in
   the same image; runs against the same data dir):

   ```sh
   docker run --rm -it -v vexillum-data:/data --entrypoint create-key \
     vexillum:<sha> --data-dir /data --tier pro --label ops \
     --origin https://example.com
   ```

3. Enter the origin allowlist for each key in the dashboard (Settings → API
   keys). Badges rendered by READMEs do NOT need keys — keyless rendering is
   the default contract — but origin pinning protects dashboard-issued keys
   from being lifted out of a page.

**Check:** `/login` round-trips; `/dashboard` shows your handle and live
usage counters (`data-origin: live`, never a seeded demo); a badge URL from
the playground renders through the live API.

---

## 7. Release gates that need a human decision

These are automated *checks* with human *verdicts* — do not wire them into
"pass = deploy":

1. **Visual regression** — `pnpm tsx scripts/visual-regression.ts` re-renders
   all 544 variants through the Rust engine and diffs against
   `scripts/golden/`. A diff > 0.1% fails the run. If the change is
   INTENDED, run with `--update`, review the golden diff in review, and
   commit it. A golden update is a design decision, not a build artifact.
2. **Browser e2e** — `pnpm --filter @vexillum/web test` (real Chromium,
   every route × signed-out/signed-in/API-down). Any uncaught error fails
   the suite. There is no "flaky retry" policy here: a red run is a bug.
3. **Workspace suites** — `pnpm -r test` (converter, sdk, badges, themes,
   web) and `cargo test --workspace`.
4. **Icon library refresh cadence** — brands change logos. `data/` +
   `crates/icons` embed a Simple Icons snapshot
   (`brands-index.json`). Refreshing is a scripted but DECIDED upgrade:
   bump the simpleicons-rs version, re-run the dump bin, review the icon
   diff (renames/removals break user URLs — announce deprecations).

**Check:** all four verdicts recorded (even as "no change") in the release
note before tagging.

---

## 8. Operations checklist (the eternal list)

- **Monitoring**: health endpoint is `/health`. Wire an uptime probe
  (external — Better Uptime/Healthchecks.io) to it; alert on 5-minute
  failure. The server logs via `tracing` at `RUST_LOG=info`.
- **Render cache**: `cache.redb` grows with unique (variant × theme × slot)
  tuples. If disk pressure appears, stop the server, delete the file, start
  — it rebuilds lazily; origin load spikes once during the rebuild window.
- **Rate limits**: GitHub-backed badges degrade gracefully when the token
  pool empties (stale-with-notice, not broken). Top up `VX_GITHUB_TOKENS`
  when the logs show repeated secondary-rate messages.
- **Rollback**: images are immutable and tagged by SHA; roll back = redeploy
  the previous tag. SQLite migrations ship inside the binary and are
  forward-only — never run a newer binary against a volume and then expect
  an older binary to read it. Snapshot the volume BEFORE every deploy
  (one command, §5).
- **Secret rotation**: GitHub OAuth secrets do not expire, but rotate on
  offboarding: generate a new client secret in the GitHub app settings,
  `fly secrets set` (or compose `.env`), restart — old secret invalidates on
  restart, in-flight OAuth handshakes re-start at the login button.
- **Key compromise**: revoke in Dashboard → API keys (deletes the row), or
  straight in SQLite if the dashboard is unavailable. Keyless badge URLs are
  unaffected by any key revocation.

---

## 9. What is deliberately NOT in this runbook

- CI pipeline YAML — the repo's checks are one command each; your CI runner
  choice is a house preference, not a vexillum decision.
- Autoscaling policy — the default fly.toml (`shared-cpu-2x`, 1 machine,
  soft limit 200 req) serves a launch traffic pattern; revisit when real
  numbers exist, not before.
- CDN for badge images — badges are cache-friendly (`Cache-Control` headers
  ship from the origin); add a CDN when origin bandwidth demands it, not
  before.


## Security env matrix (batch 10)

| Variable | Effect | When to set |
|---|---|---|
| `VX_CORS_ORIGINS` | Strict CORS allowlist (origin reflection only for the listed hosts, credentials allowed) | Production with a known dashboard origin. Without it the API reflects any origin — safe while the session cookie is `SameSite=Lax`, but a compromised sibling subdomain could read authed responses. |
| `VX_TRUST_PROXY=1` | Anonymous rate-limit buckets key on the client IP from `X-Forwarded-For` (first hop, sanity-checked) | ONLY behind a proxy that overwrites the chain. Without it buckets key on the direct socket address (all anonymous traffic shares one bucket per node). |
| `VX_STRIPE_WEBHOOK_SECRET` | Enables `POST /v1/billing/webhook`: HMAC-verified Stripe events drive subscription state (checkout completed / subscription updated / deleted) | When Stripe billing is live. Register the webhook endpoint `{VX_PUBLIC_URL}/v1/billing/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. |

Response hardening is always on: `x-content-type-options: nosniff` and
`referrer-policy: strict-origin-when-cross-origin` on every reply; image
payloads additionally carry `content-security-policy: default-src 'none';
style-src 'unsafe-inline'; object-src 'none'` and `x-frame-options: DENY`
(directly navigated SVGs cannot run script). Free-text slots are capped
(label/value 256 chars, extra 64) so oversized path segments fail with 400
before rendering work happens. `GET /metrics` now exposes
`tbc_badge_requests_total`, `tbc_cache_{hits,misses}_total`,
`tbc_rate_limited_total`, `tbc_webhook_events_total` for capacity watching.

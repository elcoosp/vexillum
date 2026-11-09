# Worklog

## 2026-10-30 (latest) — quad badges get their fourth segment: `?extra2=` end-to-end, Explore "Fourth segment" filter

The report was that "the quad badges filter extra2 feature is missing" — a
stale-snapshot suspicion. A full audit against this worklog found every other
shipped feature present (seed2, usage stats, SSRF guard, SVG scale, auto-trim,
virtualization, scrollbars, batch mode, authed dashboard tests, …), but the
quad/extra2 capability had indeed never landed in the tree: c17-08 "quad" —
the one four-segment slab in the catalog (a|b|c|d) — shipped its two middle
segments as STATIC text, there was no fourth slot anywhere in the stack, and
the Explore feature-chip row stopped at "Third segment". Rebuilt end-to-end:

- **Registry** — `hasExtra2` / `defaultExtra2` on every variant (source
  `packages/badges/src/registry.json` + the emitted
  `crates/templates/assets/registry.json` copy); c17-08 flips to
  `hasExtra: true, defaultExtra: "b"` + `hasExtra2: true, defaultExtra2: "c"`
  — its middle segments are now REAL slots.
- **Rust** — `__VX_EXTRA2__` marker (`crates/core::markers`, MarkerSet.detect),
  `BadgeData.extra2` + `SlotValues::extra2`, `SlotInput.extra2` substitution,
  `prepare_html` resolves request → registry default, cache key grew an
  `extra2` arm (quad renders can never collide), data services carry the new
  optional field.
- **API** — `?extra2=` parses and validates exactly like `?extra=` (≤ 64
  chars, absent = design default, empty = none, over-long → 400); wired
  through the static, named-service, `dynamic` and `endpoint` paths;
  `/v1/meta` documents it.
- **Templates** — compiler passes `EXTRA2_MARKER` for `hasExtra2` variants and
  `verify.ts` pins the marker set (544/544 verified). The React source
  c17-08 renders `{extra ?? "b"}` / `{extra2 ?? "c"}`.
- **Web** — playground gains the "Extra 2 (fourth segment)" input (quad
  variants only), `?extra2=` deep links + share-link persistence (defaults
  stay out of the link, same contract as every slot), SDK `BadgeUrlOptions`
  + `badgeUrl` carry `extra2`; Explore's filter tray gains the **"Fourth
  segment"** chip (Layers icon, dashed family like its siblings) that
  isolates the quad badge — "1 of 544 variants" — plus a "Fourth segment"
  row in the detail panel; docs params table documents `extra2`.
- **Tests** — Rust: markers quad detection, extra2 params parsing/validation,
  cache-key sensitivity, and an API integration test (defaults render
  marker-free; extra vs extra2 drive different segments; a longer fourth
  segment widens the badge; `?extra2=` is inert without the marker; 65-char
  → 400). Web: 4 playground quad contracts (input gating + URL feeding,
  deep-link restore, share-link default-omission, non-quad variant hides the
  input), the Explore filter isolating c17-08 (unit + browser e2e), and a
  browser e2e of the full quad workbench flow.

Gates: `cargo test --workspace` 283 green · `pnpm -r typecheck` clean ·
`pnpm -r test` 253 unit+browser (35 converter / 5 sdk / 6 badges / 50 themes /
157 web incl. e2e) · `pnpm compile` 544 markers verified · visual regression
544/544 (worst drift 0.0000% — the quad default render is pixel-identical to
the old static template) · production build green.

## 2026-10-30 (later) — batch mode first-class, scrollbar pinning, authed dashboard test coverage

### Playground batch mode: discoverable, and the icon editor no longer vanishes

The multi-selection engine (shared-appearance stack, `?variants=` persistence,
per-row URLs) already existed but was effectively undiscoverable — and worse, it
had a hole that read as "batch icon editing is completely missing":

- **The gating bug.** The Icon section rendered only when the *focused* variant
  carried an icon slot (`variant.hasIcon &&`). 133 of 544 registry variants are
  text-only; focus one, add icon-bearing badges to the batch, and the entire
  icon editor (mode pills, picker, color overrides) disappeared — there was no
  way to change any icon. The section now renders when the focused badge has an
  icon slot OR a batch is active, and batch mode shows an explicit hint
  (`data-testid="icon-batch-hint"`): "this icon applies to all N selected
  badges — badges without an icon slot ignore it."
- **Batch, by name.** The UI now says batch everywhere: "Add to batch" pill,
  "Clear batch (N)", "Batch selection" chips, a "Batch mode" notice, and
  testids (`batch-add`, `batch-clear`, `batch-chips`, `batch-notice`).
- **Multi-select at the source.** `VariantCombobox` option rows gained a per-row
  **+/✓ batch toggle** (`batchIds`/`onToggleBatch` props) — you can assemble a
  batch of many badges without round-tripping through the focused variant. The
  option hit area shrinks beside the toggle (a button can't nest in a button);
  the toggle flips between "Add c09-01 to batch" / "Remove c09-01 from batch"
  with `aria-pressed`, and committing a variant still works exactly as before.

### Landing code-card scrollbars pinned to the card's bottom edge

Reported with a screenshot: on the quick-start cards the horizontal scrollbar
floated mid-card with a dead band of canvas below it. Two stacked causes: Shiki
emits `<pre style="overflow-x:auto">` (already beaten by
`[&_pre]:overflow-visible!`), and — the missing piece — grid stretch. Sibling
cards stretch to the tallest one, but the scroll div kept its *content* height,
so its scrollbar landed right after the last code line. `CodeBlock` is now a
`flex flex-col` figure whose scroller is `flex-1 min-h-0`: the bar hugs the
card's bottom edge no matter how short the snippet is. Locked by a layout e2e
that measures `getBoundingClientRect` — the scroller's bottom edge must sit
within 3px of the figure's for all three cards.

### Test coverage: the authed dashboard and the batch flow, unit + e2e

- **`src/test/dashboard.test.tsx` (new, 10 tests)** — signed-in Overview stats
  (live usage, quota line from `PLANS`, data origin), the `?tab=` deep links,
  tab-strip navigation into Keys/Icons/Themes/Settings, the key table with a
  real `/v1/auth/me` key shape (label/env/revoke/origins affordances), the Icons
  tab honestly locked on Free and unlocked on Pro, the upgrade CTA routing to
  the public `/billing`, refresh re-querying the session API, the malformed
  payload regression lock, and the API-unavailable explainer.
- **Batch mode unit tests** — the renamed chips/notice contract, combobox-row
  add/remove (scoped inside the listbox — the chip's remove button shares the
  accessible name), `?variants=` dedupe + unknown-id filtering, the text-only
  focus regression lock, and end-to-end icon application (focused URL + share
  link both carry `?icon=`).
- **Browser e2e (51 total)** — authed dashboard sections against a realistic
  `DASH_BODY` (parseMe drops keyless entries, so the shared fixture renders an
  empty table by design), the icons→billing routing click-through, the full
  batch flow (type → + → + → chips/notice/stack → icon → share link), batch
  clear returning to single-badge editing, and the scrollbar-pinning layout
  assertion above.

Gates: `pnpm -r typecheck` clean · `pnpm -r test` 246 unit (150 web / 35
converter / 5 sdk / 6 badges / 50 themes) + 51 browser e2e · `pnpm -r build`
green · Rust workspace untouched (no `crates/` diffs; last `cargo test
--workspace` 280 green stands).

## 2026-10-30 — batches 16+17: TanStack Virtual everywhere, fluid interaction fixes, auth-aware nav, public billing, designed 404, global scrollbars, animated landing

### TanStack Virtual across Explore, the icon library and the variant combobox

Three surfaces used to mount hundreds/thousands of DOM nodes at once and re-render
them on every keystroke/drag:

- **Explore gallery** — `useWindowVirtualizer` over rows of `cols` cards
  (2/3/4 columns by container width, ResizeObserver-driven). Cards are
  `memo`ized with a stable `onSelect`, so a seed drag re-renders the themed
  subtree once instead of 544 cards. Rows are absolutely positioned by the
  virtualizer and carry their own `paddingBottom: ROW_GAP` — the margin
  between rows is part of the measured item, so the rhythm of the old
  `gap-3` grid survives virtualization exactly (the "missing margin between
  rows of badges" fix). `scrollMargin` tracks the sticky filter bar's
  content-dependent height; the entrance animation lives on the container,
  not on rows (rows mount/unmount while scrolling and must not re-animate).
- **IconPicker** — the 3,400+ brand grid and dense per-set pages are
  virtualized rows of tiles; `ROW_H = tile + gap` bakes the inter-row gap
  into the measured size. Opening the picker scrolls the selection into
  view only when it is off-screen (a `didInitialScroll` ref keyed by
  `scope:value` keeps a fresh click from yanking the grid).
- **VariantCombobox** — the 544-option listbox is a fixed-30px-row
  virtualizer with keyboard reach-through (`scrollToIndex` keeps unmounted
  rows reachable).

### Playground interaction fixes (no more unfocus/refocus, no more scroll-to-top)

- **Dropdown opens on click, always.** The combobox only opened on a focus
  *event* — clicking an already-focused input fired none, so the list
  stayed closed until the user unfocused and refocused. It now opens on
  `onMouseDown` too, plus a chevron toggle; commit() refocuses through a
  `suppressFocusReopen` guard so the programmatic focus can't reopen it.
- **Batch icon selection keeps your scroll.** The playground mirrors every
  state change into the URL with `navigate({ replace: true })` — TanStack's
  default `resetScroll` snapped the page to the top on each synced change,
  which read as "picking an icon re-scrolls to the top" in multi-selection.
  That navigation now passes `resetScroll: false`.

### Billing left the login-walled dashboard (`/billing`, public)

Every upgrade nudge ("Open billing →" on locked playground formats, the
icons-upload CTA, landing pricing) links to `/billing`, a public route. The
dashboard-embedded tab sent signed-out visitors into the login wall — or,
with the API down, an error screen. Signed in, the page is the full billing
surface (live plan pill, today's usage meter, plan grid, invoice ledger);
signed out, it degrades to the same plan grid with a "Start free with
GitHub" CTA and a sign-in panel — pricing is public, only the meter needs a
session. The dashboard drops the Billing tab (tabs: Overview, API keys,
Icons, Themes, Settings) and its upgrade CTA navigates to `/billing`.

### Auth-aware navigation

`navLinks(isSignedIn)` — the Dashboard link only exists for a live session
(top bar, mobile menu and footer all share it); anonymous visitors get
Log in / Continue with GitHub instead. No dead-end tap into a login wall.

### A 404 worth landing on

`notFoundComponent` on the root route renders the new `NotFoundPage`:
oversized gradient "404", aurora blobs, four drifting real badge renders as
decor, the engine filing the miss as a badge (`404 · not found`), and three
wired exits (Explore / Playground / Home) plus a docs link. Direct-imported
(never lazy) so it renders instantly while other chunks load.

### Beautiful scrollbars, everywhere

One inherited rule on `:root` (Firefox `scrollbar-width/color`) plus the
webkit geometry set — a floating hairline pill thumb with transparent
border, trackless gutter, accent tint on hover — styles the page scroller
AND every nested overflow pane. Dark surfaces (`pre`, `.vx-scroll`) opt
into a white-at-low-alpha variant; light panes can use `.vx-scroll-light`.

### The landing page performs

Aurora hero (three drifting gradient blobs over a dot grid), a live
two-direction badge marquee (edge-faded, hover-paused), IntersectionObserver
scroll reveals with per-card stagger, count-up stats band (544 variants ·
34 collections · 33,987 icons · 1,959 fonts · 6 formats), sheen-swept CTAs,
press/lift micro-interactions. Every effect is transform/opacity only and
collapses under `prefers-reduced-motion` (`.vx-*` utilities in index.css,
`Reveal` component, `useCountUp`).

### Gates

`cargo test --workspace` 280 green · `pnpm -r test` 129 web (incl. browser
e2e over every route signed-in/out/API-down, plus the new public-billing
contracts) + all package suites green · typecheck clean · `pnpm compile`
544 templates verified · visual regression 544/544 (worst drift 0.0000%) ·
production build green.

## 2026-10-29 — batch 13: SVG scale, adaptive padding, server transparency, docs truth, shareable workbench, multi-selection

### `?scale=` now really scales SVG output

The SVG arm ignored `scale` entirely ("vector scales client-side") — so
`?format=svg&scale=2` produced a 1×-sized root (`width="176"`) and every
`<img>` embed stayed small. takumi's SVG writer emits
`width/height + viewBox` in the same user space, so the fix is surgical:
`scale_svg_display_size()` rewrites ONLY the root's `width`/`height` to
`scale ×` (viewBox untouched) after `render_svg`. Scaled SVGs display 2×/3×
larger in `<img>` and remain vector-crisp; inline embeds are unaffected.

### Padding is now content-adaptive (auto-trim)

A flat badge like c01-01 shipped with the fixed 18 px transparent frame on
all sides (painted margins 16/16/17/15 — pure waste); glows/shadow variants
needed it. Static output now renders with `AUTO_TRIM_PAD_PX = 32` of room,
scans the alpha bounding box and crops to it:

- **PNG/WebP** — bitmap cropped post-render (`alpha_bbox` + `crop_bitmap`),
  so flat badges hug their pixels and glow variants keep exactly the room
  their shadows use (c29-01 trims to 142×28 — its glow stays inside the box).
- **SVG** — one extra 1× raster pass yields the bbox; the root `viewBox` is
  cropped to it (`crop_svg_view_box`) with width/height synced. No reflow,
  vector geometry untouched.
- **JPEG** — has no alpha; takumi encoded RGBA straight into the JPEG
  (transparent → BLACK). Now flattened onto white (`flatten_onto_white`) and
  trimmed the same way.
- **Animated containers** (GIF/APNG/kinetic WebP) keep `DEFAULT_PAD_PX = 18`:
  `write_animation` encodes frames internally and cannot be cropped after.
- **`?pad=` semantics**: explicit values render exactly as asked (no trim);
  omitted = auto-trim. Cache key grew a `pad: Option<u32>` arm so the two
  modes never collide.
- Guard test `auto_trim_never_clips` sweeps ALL 544 variants and fails if
  any painted pixel reaches the generous viewport edge (i.e. an overhang
  > 32 px would ship clipped) — currently green, margins ≥ 1 px everywhere.

`RenderRequest.pad` became `Option<u32>` (None = auto); routes pass
`?pad=` through (clamped to `max_pad` as before). Transparency verified at
the pixel level: PNG corners are `[0,0,0,0]` (takumi already kept alpha);
JPEG now comes out white-backed instead of black.

### Docs de-staled (Team plan deleted long ago; numbers re-verified)

DocsPage still sold a deleted "Team" tier: cache-floor comment
("Team 1s"), format gating ("Team adds apng"), uploads ("Pro and Team"),
and a whole Team rate-limit row (3,000 rpm / 500,000 / 4 / 1s). The
authoritative `crates/auth::Tier` has exactly two plans (Free/Pro) — docs
now match, and the Free daily quota row was wrong too (2,000 → 5,000 per
`daily_quota()` / `plans.ts` / the integration tests). While auditing every
docs claim against the code: `/v1/*` route list ✓, error type URIs ✓,
1,959 Google Fonts ✓, 3,467 Simple Icons ✓, 33,987 icondata across 19 sets
✓, github actions path ✓. The formats section now also documents SVG-scale
semantics and the transparency/trim behavior; `docs.test.tsx` asserts the
stale numbers are gone.

### Playground state lives in the URL

The route gained a whitelisting `validateSearch` (variant, variants, label,
value, extra, theme, seed, seed2, mode, font, icon, icon.color, format,
scale, api). The page reads all of them on mount (new: slots, format,
scale, icon color, api mode, selection) and a replace-navigation keeps the
address bar canonical on every change — defaults are omitted, so links stay
short. "Copy playground link" copies `origin + /playground?<state>`.
Gotcha fixed along the way: TanStack's JSON-first parser turns `?scale=2`
into the NUMBER 2 — `validateSearch` now coerces primitives back to
strings, or numeric params silently vanish.

### Multi-badge selection ("set the seed once, apply it everywhere")

"Add to selection" collects variants as removable chips; the preview turns
into a stack where EVERY picked badge renders with the shared appearance
(theme/seed/seed2/mode/font/icon/format/scale) and its own default slots,
each with its own copy button plus "Copy all URLs". Slot inputs yield to a
selection-mode hint (defaults per badge); removing/clearing returns single-
badge editing. State persists via `?variants=c01-01,c09-02`, so a styled
selection is shareable as one link. `?icon=none` now also reaches the API
URL (preview/URL parity for the "none" icon mode).

Tests: +6 playground contracts (share-link persistence, deep-link restore,
selection stack/chips/add-dedupe); full web suite 120 green.

## 2026-10-29 — batch 11: phosphor seeds, playground workbench, picker/affordance polish

### Phosphor family now follows the seed (c04-11, c04-13, c09-12)

"Phosphor CRT" ignored seeds entirely: the whole badge was built on the
FIXED status token `vx-ok` (green by design, never seed-derived) plus
`m-ok-*` mixes of it — so every `?seed=`/preset left it stubbornly green.
A token audit of all 544 variants (referenced vars vs the emitted core +
46 semantic-mixes formulas) confirmed the base-token coverage is complete
and the `vx-v-*` overlay set mirrors it — the phosphor trio was the one
family abusing status color as aesthetic accent. Rewired to the seed
family (phosphor green survives only as the no-theme fallbacks):

- **c04-11 Phosphor CRT** — bg `m-ok-75-000000` → `a-deep`, border/icon/
  label `ok` → `a`, glow `m-ok-30-t`/`m-ok-60-t` → `m-a-30-t`/`m-a-60-t`,
  separator `m-ok-60-000000` → `a-muted`.
- **c04-13 Glow stick** — same disease: bg gradient now `a → a-bright`,
  glow `m-a-50-t`, ink `a-deep`, value side rides `vx-v-a-deep` (dual-seed
  aware).
- **c09-12 Phosphor** (terminal) — green text/glow on the dark chrome →
  `a` + `m-a-60-t`, separator → `a-muted`; dark surface + heading border
  unchanged.
- Recompiled (544/544 markers verified), goldens regenerated, visual
  regression PASSED; playground proof shots show violet Phosphor CRT.

### Playground — one-viewport workbench

The 5 floating cards felt random; controls now live in ONE dense sectioned
card (Content → Appearance → Icon → Output, tiny uppercase section heads,
2-col slot grid) on the left, with the live preview + snippets STICKY on
the right (`lg:grid-cols-[5fr_7fr]`, `lg:top-[72px]`) — the whole tool
reads without scrolling. Test contracts preserved (`@2x`, format chips,
tabs, "Font" label, bundled-fonts hint copy, combobox, e2e selectors).

### Scale @2x/@3x is now visible

It previously only bumped the API URL's pixel density — the live SVG
preview never changed size. The preview wrapper now carries `zoom: scale`
(plus overflow-safe surface), so @2x/@3x visibly multiplies the badge on
screen; the readout says "2× preview", the URL still carries `scale=2`
for the real bytes.

### Custom SVG: honest sanitize story + Pro nudge

Verified the server side: `POST /v1/icons` runs uploads through
`crates/icons sanitize_svg` (strips scripts/event handlers/external refs,
32 KB cap) and 402s Free tier — so the panel copy now says both halves:
preview sanitizes client-side, the API re-sanitizes server-side before
storing. The "(Pro+)" footnote became an actual nudge for Free users: a
PRO chip by the label, an upgrade banner ("upload once, reuse everywhere
via ?icon=upload:hash") with an "Upgrade to Pro →" CTA to the billing tab;
Pro users get the plain API hint instead.

### Value-seed picker opens from the whole chip

The value-seed chip was a `<span>` — only the 14px color rectangle opened
the OS picker. Now it's a `<label>` wrapping the input: clicking anywhere
on the chip opens the picker; the × clear button preventDefaults so it
doesn't trigger the input.

### Explore filter bar: animated Clear + distinct feature chips

- The "Clear (N)" chip mounting/unmounting made the flex-1 search bar
  jump. It now lives in a collapsing slot (`max-w` + opacity, 200ms
  ease-out) so the bar resizes smoothly; tabIndex/aria-hidden track
  visibility.
- Feature filters (Animated / Icon / Third segment) were the same pill as
  collection chips. They now render as a different family: a dashed
  "FILTER" tray with SlidersHorizontal label, squarer icon-led chips
  (Zap / Image / Columns3), dashed borders when idle, solid accent +
  tint when active — unmistakable from the solid collection pills below.

### Verification

- `cargo test --workspace` — 271 passed, 0 failed (embedded assets
  re-embedded).
- `pnpm -r test` — 35 + 5 + 6 + 50 + 114 (web incl. browser e2e) — green.
- `pnpm -r typecheck` — 7/7 clean.
- `visual-regression.ts --update` then verify — PASSED 544/544.
- Eyeball shots (shots/batch11/): workbench default + icon open + custom
  SVG nudge + @2x growth, explore filter tray idle/active/clear
  transition, phosphor default vs violet seed.

## 2026-10-29 — full dependency audit: every npm + crates.io dep updated to latest (majors included)

Registry sweep of every manifest (8 package.json + 13 Cargo.toml) against
npm and crates.io, honoring the repo's 48h `minimumReleaseAge` supply-chain
guard on the npm side (the newest version ≥48h old; pnpm 12.16.1 and
lucide-react 1.64.0 shipped inside the window and were deliberately skipped
for 12.15.0 / 1.62.0) and absolute latest on crates.io.

### Rust (Cargo.toml requirements + cargo update on the lock)

- **redb 2 → 4.4.0** (two majors): `begin_read` moved to the
  `ReadableDatabase` trait — cache crate imports it now.
- **reqwest 0.12 → 0.13.5**: `rustls-tls` feature renamed `rustls`.
- **tower-http 0.6 → 0.7.1**, **parking_lot 0.12 → 0.13.0** (no code churn).
- **takumi 2.18.1 → 2.18.2**; `cargo update` pulled every semver-compatible
  latest (axum 0.8.9, tokio 1.54.1, clap 4.6.7, serde 1.0.229, serde_json
  1.0.154, thiserror 2.0.21, sqlx 0.9.0, …). sea-orm 2.0.4 and
  simpleicons-rs 16.36.0 were already latest.
- Dockerfile runtime base `debian:12-slim` → `debian:13-slim` (bookworm is
  oldstable); rust/node base tags already float on latest majors.

### npm (package.json ranges + lockfile refresh)

- **lucide-react 0.550 → 1.62.0** (major): 1.x removed the deprecated
  `Github` brand icon — replaced with a shared inline `GithubMark` octicon
  component (`apps/web/src/components/GithubMark.tsx`) used by the login
  page and dashboard login wall; every other icon import verified against
  1.x type defs.
- **@vitejs/plugin-react 5 → 6.1.2** (major, no config changes needed),
  **@types/node 24 → 26.6.5** (major), parse5 ^8.0.1,
  tailwind-merge ^3.7.0, @testing-library/react ^16.3.3,
  @types/react(+dom) ^19.3.0, @takumi-rs/wasm ^2.18.2.
- Already-latest (verified against registry): typescript 7.0.2, vite
  8.3.5, vitest 5.0.5, tailwindcss 4.3.3, react 19.3.1, shiki 4.5.0,
  @tanstack/react-router 1.170.46, playwright 1.64.1, turbo 2.11.10,
  esbuild 0.28.2, tsx, pngjs, pixelmatch, clsx.

### Security scan (OSV over both lockfiles)

`scripts/scan-cargo-osv.py` now also parses pnpm-lock.yaml (338 npm
packages) alongside Cargo.lock (504 crates) and batch-queries OSV. One hit:
`block-buffer 0.10.4` GHSA-qwgh-2vcv-g2f7 (panic-corrupts-position), via
sqlx-core 0.9.0 → sha2 ^0.10 → digest 0.10 → block-buffer 0.10.x. No fixed
0.10.x exists and sqlx-core 0.9.0 (latest) still requires sha2 ^0.10 —
unfixable upstream today; the path is unreachable at runtime (we ship
sqlx-sqlite only, the sha2 code belongs to MySQL/Postgres auth) and the
advisory is panic-severity, not memory unsafety. Accepted and documented.

### Verification

- `cargo check --workspace --all-targets` — clean.
- `cargo test --workspace` — 271 passed, 0 failed.
- `pnpm -r typecheck` — clean across all 8 packages.
- `pnpm -r test` — converter 35, sdk 5, themes 50, badges 6, web 114
  (unit + zero-jsdom browser e2e) — all green.
- `pnpm compile` — 544 templates recompiled with the upgraded toolchain,
  markers verified; `visual-regression.ts` — PASSED, 544/544, worst drift
  0.0512% (c23-14), so takumi 2.18.2 is render-neutral vs the goldens.
- Production builds: web + playground (rolldown chunk-size note is
  informational).
- Fresh-environment note: rustup + pnpm reinstalled; Playwright chromium
  headless shell re-downloaded for the browser-mode suite.

## 2026-10-29 — batch 10: stacked + stat collections, gzip, code-split web, SSRF guard, coverage

### c33 Stacked + c34 Stat — the catalog is now 544 variants / 34 collections

Two new structural collections generated by `scripts/gen-collections/` (c33-
stacked.mjs, c34-stat.mjs + shared.mjs/main.mjs harness):

- **c33 Stacked** — physical depth by construction: offset layers, ghost
  copies, rims and inset panels give badges a paper-stack presence.
- **c34 Stat** — dashboard-grade KPIs: deltas, ranks, rates, odometers and
  receipt totals with tabular figures and trend semantics.

Both ship as TSX sources (packages/badges/src/stacked|stat), compiled HTML
assets, registry entries (packages/badges + crates/templates — both copies),
value-side `vx-v-*` dual-seed tokens (so `?seed2=` re-themes them like every
other collection), and are covered end-to-end: badges-package render tests
(markers + takumi-safe construction), render-crate SVG sanity, and a new
API integration test (`stacked_and_stat_collections_render_through_the_api`)
that exercises slug routing, slot substitution (takumi outlines text as
paths, so substitution is asserted via width growth) and seed2 re-theming.
Web: explore pills, variant combobox, docs and landing all reflect 34/544
(the stale "512" copy in the 404 page is fixed too).

### Performance

- **gzip compression layer** on the API (tower-http `compression-gzip`,
  default predicate): SVG/JSON/HTML are compressed, raster formats and
  bodies < 32 bytes are skipped, `Vary: Accept-Encoding` handled. New
  integration test proves gzip round-trips an SVG, identity requests stay
  raw, PNG is never re-compressed, and the 544-entry manifest compresses.
- **Route-level code splitting** (TanStack Router `lazyRouteComponent` +
  hover-preload) and a **dynamic `import("shiki")`** inside CodeBlock
  (memoized module promise, plain-text fallback unchanged). Production
  build: main chunk 1,842 kB → **303 kB** (gzip 269 → 97 kB); every page is
  its own 5–40 kB chunk; shiki loads only when a code block first renders.
  The e2e harness now waits for the mounted chrome (route chunks load
  async) — all 114 web tests pass in the browser.
- Goldens re-baselined for 544 (render-goldens: full catalog in 1.0s
  release; visual regression gate: 544/544 PASSED, worst drift 0.0000%).

### Security

- **SSRF guard for user-supplied fetch URLs** (`?url=` on dynamic/endpoint):
  new `crates/data/src/ssrf.rs` with a full non-routable denylist (loopback,
  RFC1918, link-local incl. 169.254.169.254, ULA, CGNAT 100.64/10, benchmark
  198.18/15, multicast, documentation, reserved 240/4, v4-mapped and NAT64
  embeds). Two layers: IP-literal hosts are checked up front
  (`assert_url_host_is_public`), and every hostname resolves through
  `PublicHostDns` plugged into the shared reqwest client — the connection
  dials exactly the verified addresses, so there is no check-then-connect
  gap for DNS rebinding to race. Debug builds allow loopback only (wiremock
  tests); release never. Unit tests pin every range; an integration test
  proves metadata/RFC1918 targets 400 with a named reason.
- **cargo-audit / OSV scan** against Cargo.lock: `pnpm audit --prod` clean;
  the one RustSec hit (GHSA-qwgh-2vcv-g2f7, block-buffer < 0.12.1 "panic
  corrupts inline buffer position") is resolved for all first-party code by
  upgrading sha2 0.10 → 0.11.1 (same Digest API, 271 tests green). The
  residual 0.10.4 copy is pinned upstream by sqlx-mysql/postgres (^0.10,
  no 0.11-compatible sqlx release yet) and is accepted: the bug needs a
  panic *inside* sha2's compress callback — pure input-independent
  arithmetic — followed by reuse of the corrupted buffer; no such path
  exists here, and the DB it would apply to is our own trusted one.
- Warning audit: zero compiler warnings across the workspace (removed a
  stale temporary probe test, an unused import, and re-enabled a lost
  `#[tokio::test]` on the font ETag test).

### Verification

- `cargo test --workspace` — 271 passed, 0 failed, zero warnings.
- `pnpm -r test` — converter 35, sdk 5, badges 6, themes 50, web 114 — 210
  green, browser mode, zero jsdom.
- `pnpm -r typecheck` — clean.
- `pnpm audit --prod` — no known vulnerabilities; `cargo audit` — clean at
  build time (advisory DB as of 2026-10-29).
- visual-regression.ts — PASSED, 544/544, worst drift 0.0000%.

## 2026-10-29 — retina stroke-icon fix, c29 white-stripe kill, 4 badge design repairs, wrapper width snap

### takumi DPR>1 stroke-width inflation (render pipeline fix, affects all icons)

takumi's raster path applies the DPR transform to svg `stroke-width` without
dividing by it — probed at DPR 3: `stroke-width="2.5"` paints ~7.5 px and
blobs thin glyphs (the X in "build failing" collapsed into a filled diamond),
while `stroke-width="0.83"` paints the intended 2.5 px. DPR 1 is always
correct, so every 2x/3x PNG/WebP of a stroke-icon badge (c09/c14/c15/c03/c02
redesign set) shipped mangled icons. `prepare_html` now divides every svg
stroke-width (attribute + inline-style forms) by the scale for scaled raster
output; SVG output (vector, DPR 1) is untouched. +3 unit tests.

Second engine defect found by the same probe: `<circle>`, `<line>`, `<rect>`
primitives rasterize as partial arcs/slivers even at DPR 1, while `<path>` and
`<polyline>` are correct. 37 default icons rewritten to geometrically-equivalent
`<path>` elements (`scripts/sanitize-icons.py`, both registry.json copies) —
c32's styled spark primitives are intentionally untouched (no viewBox there;
paths mis-scale without one).

### c29 Ticket — "white stripe on the right before the hole" (all 16 variants)

Pixel-audited 784 renders (16 variants x 49 content lengths, `probe-ticket-sweep`
+ a from-scratch PNG decoder audit). The stripe is takumi flooring background
position while keeping fractional tile sizes: a 22.05px cap tile anchored at
`100%` paints up to floor(W-22.05)+22.05 = W-0.95 — a full unpainted column
before the right border. Fix is two-layered:
- `scripts/gen-c29.mjs`: cap/middle tiles now use INTEGER px sizes/positions
  (fractional geometry only inside gradient centers/radii, which anti-alias);
  caps still overlap the middle fill by 6px so seams can't open;
- `padded_wrapper_sized`: the renderer snaps the badge root to its measured
  (ceiling'd) integer width, making every percentage/calc background
  resolution integer-exact for ALL 512 variants.
Audit result after both fixes: 0/784 flagged (was 784/784).

### Four reported badge repairs

- **c14-16 Instagram**: the compiled template had lost the designed white
  inner card — dark text sat directly on the gradient and the icon chip was a
  same-gradient blob (plus a doubled icon wrapper). Rebuilt per the design
  source: gradient ring -> white inner pill -> gradient icon chip -> dark bold
  label. Shadow moved to literal rgba (oklch-alpha box-shadows render at full
  opacity on the DPR>1 path — the c04-15 rule).
- **c15-13 Info tint** (and c15-12/14 + the whole 23-template set): the 2026-10
  redesign doubled the icon wrapper (`<div class=icon><div class=icon>` with
  identical styles), doubling margins and breaking flex layout in takumi
  (c09-06 wrapped vertically). `scripts/unnest-icons.py` unwrapped all 23
  templates in BOTH the compiled HTML assets and the React TSX sources.
- **c07-14 Half fill**: the filled left half was a fixed 50% overlay, so any
  label longer than the value spilled white text onto the white right half
  ("STATUS" lost its last letter). Restructured into two real flex children —
  the dark block hugs icon+label, so white-on-white is structurally
  impossible; divider and paddings preserved.
- **c26-09 Stadium**: value background was a 2px-radius rectangle inside a
  999px pill. Now border-radius:999px (HTML asset + TSX + tailwind class).

### Verification

cargo test --workspace 205 green; pnpm -r test 204 green (converter 35, badges 5,
sdk 5, themes 46, web 113 — browser mode, zero jsdom); pnpm -r typecheck clean;
render-goldens re-baselined (512/512); explore-page eyeball shots confirm all
five repaired groups in the real UI at DPR 2.

## 2026-10-29 — c29 punched-paper rebuild, seeded readouts, unique halo, zero-jsdom browser e2e, deploy runbook

### c29 Ticket — "border not applied to clipped zones" (whole collection rebuild)

Root cause: the collection cut its edge notches with `mask-image` and drew its
border with an inset box-shadow. In Chrome the mask sheared the border off the
clipped zones (raw unbordered cuts); takumi has no mask support at all, so
SVG/PNG output lost the notches entirely — two different badges from one
template. A 16-case probe matrix (Rust `probe-html` + Chromium) established
which constructions are engine-safe:

- punched holes = transparent radial-gradient layers at fixed px positions;
- each hole traced by a rim layer, paper fill split into dodge layers so holes
  stay transparent (page background shows through);
- **px-anchored gradient centers only** — %-centers inside sized sub-boxes
  disagree between takumi and Chrome (takumi resolves them against the full
  element);
- real `border` property for the frame (interior punches never touch it).

All 16 variants regenerated by `scripts/gen-c29.mjs` (twin/fine/solid/deep/
pill/sharp/large/small/keyed knobs preserved per title). Render-identical in
Chrome and takumi at 1x/2x/3x.

### takumi DPR>1 containing-block bug (render pipeline fix)

Probing c04-15's nested halo exposed a takumi `from_html` bug: a `class`
attribute anywhere on the ancestor chain mis-resolves containing blocks for
absolutely-positioned descendants at devicePixelRatio > 1 — the decoration
sized itself to the badge root (probed: zero-inset halo in a relative
inline-flex parent). Since `class`/`tw` are browser-preview hooks and the
renderer loads no stylesheet that uses them, `prepare_html` now strips them
(`strip_layout_inert_attributes`, +2 unit tests). This alone fixed every
previously-glitching glow badge (c02-14 verified clean at 3x post-strip).
Template CSS rule of thumb recorded in c04-15: glow shadows use `rgba()`
colors — oklch-alpha box-shadows render at full opacity on the DPR>1 path.

### c03-06 / c03-13 — "not styled with the seed"

Both readouts painted their screens with the fixed neutral heading ink
(`--vx-t-heading`). Re-seeded: screen = `--vx-a-deep`, instrument marks =
`--vx-a-bright` with the accent-bright glow token, labels ride `--vx-s-200`,
values in `--vx-s-white`. The whole badge now re-themes with the seed.

### c04-15 "Rotating halo" — duplicate of c02-14

The old build was c02-14's conic sweep verbatim (different token, same 8s
rotate). New design keeps the proven rotating-layer placement but is its own
badge: two opposite comet arcs (70°–150° / 250°–330°) orbit the pill every 4s
(`vx-rot`), over a calm body with a ringed icon core. Registry animation
metadata updated (`rotate/8000` → `vx-rot/4000`).

### Zero jsdom — everything runs in Vitest browser mode

The user was explicit (vitest.dev/guide/comparisons.html): no jsdom. Now:

- one config (`vite.config.ts`) runs ALL unit + e2e tests in real Chromium
  via `@vitest/browser-playwright`; `vite.e2e.config.ts` deleted;
- `jsdom` removed from devDependencies and the lockfile importers;
- `keyframes.test.ts` converted from `node:fs` scans to Vite raw-import
  bundles (`?raw` + `import.meta.glob`) so it runs in the browser;
- `pnpm-workspace.yaml` records the `@tanstack/react-router` permissions
  decision (`build: false, skills: false`) — pnpm 12's agent-skills gate
  would otherwise fail every fresh `pnpm install` with
  `ERR_PNPM_NO_AGENT_SKILLS_DIR`;
- packages/sdk + packages/themes got the tsconfig.json their `typecheck`
  script assumed existed.

### e2e coverage — 113 browser tests

The suite now covers every route × every session state (signed-out /
signed-in / API-down = 24 mounts) plus deep interactions: explore search,
collection pills, theme picker, card detail; playground variant/label/format;
docs shiki blocks; dashboard tabs + malformed-payload regression lock (the
old dailyQuota crash); login configured + unconfigured (asserting no
dev-only command text leaks); nav flows; 404 exits. Any uncaught error or
crash boundary fails the run. `pnpm --filter @vexillum/web test` = 113/113.

### Deploy runbook

`docs/DEPLOY-RUNBOOK.md` — everything that cannot be automated: OAuth app
registration, secret loading per platform, DNS/TLS, volume + backup habit,
first provisioning (`create-key` now ships in the image — Dockerfile builds
it), the human-verdict release gates (visual regression, browser e2e), icon
refresh cadence, rotation/rollback ops.

### Verification

- `cargo test --workspace` — 40 suites, all green.
- `pnpm -r test` — converter 35, sdk 5, badges 5, themes 46, web 113 — all
  pass in the browser.
- `pnpm -r typecheck` — clean (sdk/themes now actually typecheck).
- `visual-regression.ts --update` (intended design changes) then the gate:
  PASSED, worst drift 0.0000% across 512 variants.
- Eyeball pass in the real UI with the violet seed: c29 punches + rims, c03
  seeded screens, c04-15 comet orbit — all correct in Chrome; golden PNGs
  match at 1x/3x.


## 2026-10-28 — layout-shift kill, OAuth error surface, micro-interaction pass, badge fixes

### Explore layout shift (the "constantly trashing screen" bug)

Root causes found by probing cards with Playwright while the page ran:

- `c12-06` (waveform) and `c12-05` (typewriter) animate **layout** properties
  (`height`, `width`), so the badge's own box breathed every frame.
- `BadgeFrame` is auto-height in explore cards (`min-h-14`), so every badge
  growth changed card height → **30 distinct card heights** across the grid and
  constant reflow while animated variants were visible.

Fixes:

- `packages/badges/src/kinetic/c12-06.tsx` — wave bars carry a `height: 4px`
  base inside the fixed 14px rail (also gives static SVG/PNG renders visible
  bars instead of zero-height spans).
- `packages/badges/src/kinetic/c12-05.tsx` — the typing span now plays inside a
  fixed-width (86px) stage, so the badge box never changes width.
- `apps/web/src/pages/ExplorePage.tsx` — every card preview is a fixed-height
  (`h-24`) centered stage; oversized badges zoom-fit inside it. Grid measured
  **uniform 144px cards** after the fix (was 107–194px, 30 distinct values);
  c12-05 went from 17 distinct states per 3s to 1. Entrance stagger keyed on
  the collection (search typing never re-triggers it).

### Badge fixes

- `c09-06` (Violet accent, stacked terminal): the design's fixed `height: 34px`
  could not fit 3 rows of real font metrics — text painted outside/over the box
  in both Chrome and takumi. Now height-free with `padding: 6px 10px`; the box
  hugs content in every renderer. `whiteSpace: normal` on the value was a
  conversion artifact → `nowrap`.
- `c17-05` (right-pill): the converted markup invented an overlap hack
  (`margin-left: -14px`, full `999px` radius on the value, `zIndex` on the
  label) that neither the design source nor takumi agreed on — the value edge
  rendered as a hard square. Rewritten to the design spec: container radius 0,
  value `border-radius: 0 999px 999px 0`, no z-games. SVG/PNG output verified.
- Goldens re-rendered (`visual-regression.ts --update`), gate passes at 0.0000%
  worst drift.

### Dev-only copy removed from user-facing UI

- `session.tsx` "run the API (cargo run -p vexillum-server)" /
  "keep VITE_API_BASE pointed at it" → plain-language service-unavailable
  states ("The dashboard service isn't available on this deployment…").
- Playground "Set VITE_API_BASE to render through the live API…" →
  "Live API rendering isn't wired up on this deployment — SVG previews run
  entirely in your browser…".

### GitHub OAuth

- The unconfigured-login error previously rode the **font** error variant
  (`errors/font-unavailable`, "Font source unavailable") — bizarre and wrong.
  Added `Error::NotConfigured` (503, `errors/service-not-configured`, title
  "Service not configured") in `crates/core/src/error.rs` and used it in
  `auth_routes.rs::github_login`.
- Dashboard login wall now routes through `/login` (which probes the login
  route) instead of navigating straight into a raw problem+json response.
- `/login` unconfigured card now gives the exact 3-step setup with a click-to-
  copy callback URL (`{origin}/v1/auth/github/callback`).
- `.env.example` added (OAuth vars documented); README gained a "GitHub OAuth
  for the dashboard (local setup)" section; docs' Authentication section points
  at it.

### UI/UX micro-interaction pass (interior.dev school, zero new deps)

`index.css` defines the timing system — one spring (`--vx-spring`), one snap
(`--vx-snap`), everything transform/opacity-only, everything disabled under
`prefers-reduced-motion`:

- `.vx-press` — compress-while-held on every Button, nav links, chips, scale
  pills, the GitHub button.
- `.vx-lift` — cards float 2px with a soft shadow on hover (explore cards,
  value props, pricing, stat cards).
- `.vx-enter` / `.vx-enter-stagger` — fade-up entrances (dialog, dashboard
  login wall, mobile menu, landing hero badges, value grid, explore grid on
  collection switch).
- `.vx-pop` — copy-success burst (icon pops green on the Check swap).
- `.vx-skeleton` — shimmer sweep placeholders (dashboard loading state).
- Dashboard `Tabs` is now a segmented control with a **sliding thumb** that
  glides between tabs (absolute-positioned, measured, wrap-aware; zero layout
  shift). Meters animate their width with the spring.
- Overview stats count up/down (`useCountUp`, rAF, reduced-motion aware,
  tabular-nums so digits don't jitter).
- Landing hero badges render side-by-side (`w-auto` override — they were
  stacked full-width before).

### Verification

- `cargo test --workspace` — all green (templates rebuilt + `touch embedded.rs`
  required; the render cache also masks template edits — cleared when
  re-rendering).
- `pnpm -r test` — converter 35, sdk 5, badges 5, themes 46, web 90 — all pass.
- Browser e2e (`pnpm --filter @vexillum/web test:e2e`) — 14/14, zero uncaught
  errors on every route.
- `visual-regression.ts` — PASSED, worst drift 0.0000% after golden refresh.
- Manual Playwright sweep of /, /explore, /playground, /docs, /dashboard,
  /login + scrolled explore (sticky bar) — all clean.

## 2026-10-29 — batch 9: dual-seed (?seed2=), usage stats, playground deck, codeblock scroll, brand quick-options

### Markdown codeblock scrollbar floated mid-block (landing + docs)

Shiki emits `<pre style="overflow-x:auto">` — the bar mounted on the pre ABOVE its own
padding-bottom instead of hugging the card edge (user screenshot: white bar ~20px above the
bottom). `CodeBlock` now makes the outer padding-less div the sole scroll container
(`[&_pre]:overflow-visible!` beats shiki's inline style); the fallback branch got the same
structure. The Playground snippet `<pre>` too. Verified by DOM probe: scroller overflowX=auto,
pre overflowX=visible.

### Explore detail rows cramped

`dl` rows had zero gap — long labels/values could touch. `Row` is now
`flex justify-between gap-4` with `shrink-0` dt + `min-w-0 truncate text-right` dd; rows spaced
`space-y-1.5`.

### Dual seed end-to-end: `?seed2=` (value-side palette)

The feature the earlier session claimed but never shipped — now real, all the way down:

- `crates/theme` — `semantic_theme_duo(seed, seed2, mode, source)` + `overlay_value_seed(base,
  value_seed, mode)`: the second ramp merges under `vx-` → `vx-v-` prefixed keys. Unit tests pin
  base-token preservation + same-seed mirroring.
- API — `BadgeQuery.seed2` (validated like `seed`), `resolve_render_theme` now ALWAYS overlays
  the `vx-v-*` family: from `seed2` when given, else a mirror of the base seed (preset, brand,
  seed or default). Custom token-map themes keep source fallbacks. Cache keys move automatically
  (theme hash covers the merged map).
- Templates — codemod (`scripts/seed2-value-tokens.mjs`) remapped 585 value-segment tokens in
  440/512 components to `var(--vx-v-*, fallback)` (paren-preserving, class-token `value` scoped,
  label sides untouched); recompiled via `@vexillum/compiler` (verify: 512/512 markers
  consistent). Visual regression: **512/512 PASSED at 0.0000%** — renders without seed2 are
  pixel-identical.
- Web — themes pkg `semanticVarsDuo` (+4 tests, 50 green), `SemanticThemeSpec.valueSeed`,
  `ThemePicker` "value seed" chip (clearable, rides presets too), Explore + Playground wiring,
  `?seed2=` deep links, `badgeUrl(seed2)`.
- Integration test `seed2_recants_the_value_segment_only`: seed2==seed renders byte-identical to
  plain; seed2=ec4899 swaps the value-side gradient to the pink ramp while label ink stays blue;
  invalid seed2 → 400.

### Usage stats — which badges are the most used

- API — `AppState.usage` per-variant demand counters (every valid static badge request bumps its
  variant, cache hits included) + public `GET /v1/stats/popular?limit=`
  (`{ total, trackedVariants, variants: [{variant, renders}] }`). In-memory per process —
  documented honestly.
- Explore — `fetchPopular()` (graceful null without API), "Most used" sort (hidden without
  data), per-card flame chip with formatted counts, "Requests" row in the detail panel.

### Explore filter bar upgrade

Search moved into the sticky bar (icon + clear button), feature filter chips (Animated / Icon /
Third segment — multi-toggle with a Clear chip), sort segmented control (Registry / A–Z / Most
used), live "N of 512 variants" status line.

### Playground restructured — controls ABOVE the badge

The 360px sticky side rail is gone. A responsive control deck (md:2 / xl:3 columns) holds
Badge content (variant + slots), Icon, Theme, Font, and a merged Output card (format + scale +
render-via-API); the preview + snippets read top-down below it. Variant picker is now a real
searchable combobox (`VariantCombobox`: filter by id/title/collection, ↑↓/Enter/Esc, ARIA
combobox pattern, 60-row cap); the e2e was rewritten for it (found + fixed a focus-reopen race
that blanked the input).

### Brand icon color quick options (gated to brand icons)

With a brand slug selected (known hex), the icon panel shows "brand icon color" (icon painted
in the brand hex — the old hidden `brand` keyword, now visible + one click) and "brand badge
seed" (whole palette re-derived from the brand color). Both hidden for icondata/custom icons —
they have no canonical color; the hint copy says so.

### `GET /v1/meta` + docs sync

Agent-facing catalog overview (URL grammar, all params incl. seed2, formats, presets, discovery
links). Docs page: params table gained seed/seed2/mode rows, ThemingSection explains the
dual-seed contract, endpoint list covers meta/stats/icons/fonts.

### Verification

- `cargo test --workspace` — 257 passed (16 theme incl. duo, 36 api incl. seed2/stats/meta
  integration, …), 0 failed.
- `pnpm -r test` — converter 35, sdk 5, badges 5, themes 50, web 113 (unit + browser e2e, zero
  jsdom) — all green.
- `pnpm -r typecheck` — clean.
- `visual-regression.ts` — PASSED, 512/512, worst drift 0.0000% (seed2 codemod is
  output-neutral without the param).
- Eyeball screenshots (shots/batch9/): codeblock, explore bar, playground deck, combobox open +
  searching, brand options — all verified.

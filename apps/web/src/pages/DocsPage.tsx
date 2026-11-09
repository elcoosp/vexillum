import { useEffect, useState, type ReactElement } from "react";
import { BookOpen } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { SEMANTIC_PRESETS } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface DocSection {
  id: string;
  title: string;
  body: () => ReactElement;
}

const AUTH_EXAMPLE = `# README badges need NO key at all — public URLs, keyless forever:
<img src="https://vexillum.dev/badge/foundational/c01-01/build/passing.svg" />

# Keys are only for metered, higher-limit requests. Pin each key to the
# hosts it may render from (dashboard → API keys → Allowed origins):
Authorization: Bearer vx_live_9f2Kx8mQ4vT1cP7wLzB3nR6y

# a pinned key requested from a non-allowlisted site is rejected 403,
# so a leaked key cannot be spent from someone else's pages`;

const STATIC_EXAMPLES = [
  {
    title: "static badge — collection / variant / label / value",
    code: `GET /badge/foundational/c01-01/build/passing

# semantic theming — one seed drives the whole palette; dark flips surfaces:
GET /badge/foundational/c01-01/build/passing?theme=pink&scale=2&format=png
GET /badge/foundational/c01-01/build/passing?seed=ec4899&mode=dark

# collection-qualified ids and bare numeric variants both resolve:
GET /badge/foundational/01/build/passing   # c01-01
GET /badge/terminal/c09-02/deploy/prod     # full id works anywhere`,
  },
  {
    title: "github",
    code: `GET /badge/github/stars/{owner}/{repo}      →  "stars  12.3k"
GET /badge/github/forks/{owner}/{repo}
GET /badge/github/issues/{owner}/{repo}
GET /badge/github/v/{owner}/{repo}          →  latest release tag
GET /badge/github/actions/status/{owner}/{repo}/{workflow}`,
  },
  {
    title: "npm",
    code: `GET /badge/npm/v/{package}       →  latest version
GET /badge/npm/dm/{package}      →  downloads / month
GET /badge/npm/dw/{package}      →  downloads / week
GET /badge/npm/dl/{package}      →  downloads / last month (compact)`,
  },
  {
    title: "crates (crates.io)",
    code: `GET /badge/crates/v/{crate}      →  max stable version
GET /badge/crates/dl/{crate}     →  total downloads`,
  },
  {
    title: "docker",
    code: `GET /badge/docker/pulls/{namespace}/{image}   →  "docker pulls  4.1M"`,
  },
  {
    title: "dynamic JSON — any jq-able source",
    code: `GET /badge/dynamic/json?url=https://api.example.com/status
        &query=$.uptime.seconds
        &prefix=up%20
        &suffix=s
        &label=uptime`,
  },
  {
    title: "endpoint — a service that already speaks the badge protocol",
    code: `GET /badge/endpoint?url=https://status.example.com/badge.json

# badge.json: { "label": "coverage", "value": "87%", "color": "green" }
# override the label: &label=cov`,
  },
];

const QUERY_PARAMS: Array<[string, string]> = [
  ["format", "svg (default) · png · jpg · webp · gif · apng — gated per tier"],
  ["scale", "1 (default) · 2 · 3 — real size: raster re-renders at 2×/3× pixel density, SVG multiplies its intrinsic display size (viewBox untouched — still vector-crisp)"],
  ["theme", "preset name (slate, blue, violet, emerald, amber, rose) or custom token map"],
  ["seed", "custom hex — the whole OKLCH palette (surfaces, borders, ink, accents) re-derives from it; overrides theme"],
  ["seed2", "second, independent hex for the VALUE segment — the value side re-derives from it while label/icon keep the base seed; rides any base (preset or seed)"],
  ["mode", "light (default) · dark — flips the surface ramps, accents ride the seed"],
  ["font", "font family: a bundled slug (inter · jetbrains-mono · instrument-serif · space-mono) or any of the 1,959 Google Fonts slugs — e.g. font=roboto, font=playfair-display; unknown slugs are 400 invalid-font"],
  ["extra", "third-segment text for suffix/tri-segment badges (e.g. ?extra=since%2009:41) — absent keeps the design default; also accepted as a 5th path segment"],
  ["extra2", "fourth-segment text for quad badges (c17-08 slab — e.g. ?extra2=c) — absent keeps the design default; the badge then renders label · extra · extra2 · value"],
  ["icon", "brand slug (e.g. github), icondata slug (e.g. mdi-account, si-github), or upload:{hash}"],
  ["icon.color", "override icon color; the default is currentColor — icons ride the badge's themed ink (white on dark, dark on light) — and `brand` keeps the brand's own hex"],
  ["icon.size", "icon box in px (default 14)"],
  ["pad", "transparent padding in px (0–64); omitted = auto — output is cropped tight to the painted content, so flat badges carry no dead margins while glows and shadows keep exactly the room they use"],
  ["key", "API key when headers are impossible (browser <img> tags)"],
  ["no_icon", "any value — suppress the icon slot"],
];

const THEME_QUERY_EXAMPLE = `# custom token map — any of the 9 frozen tokens:
GET /badge/foundational/c01-01/deploy/prod
    ?theme=value-bg:0b1220,value-fg:e2e8f0,accent:f43f5e

# the guardrail still applies: unreadable pairs are corrected and the
# response carries X-Color-Corrected: corrected|unchanged`;

const BRAND_EXAMPLE = `curl -X POST https://api.vexillum.dev/v1/themes \\
  -H "Authorization: Bearer vx_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{"brand": "#8b5cf6"}'

# 201 Created
# {
#   "source": "#8b5cf6",
#   "colors": { "label-bg": "#4c1d95", "value-bg": "#8055e2", … },
#   "colorCorrected": true
# }

# violet at native lightness has no accessible ink (neither white nor
# near-black clears 4.5:1), so the guardrail darkened value-bg until the
# pair is readable — the X-Color-Corrected header on badge renders
# reports the same decision.`;

const CACHE_EXAMPLE = `GET /badge/foundational/c01-01/build/passing
200 OK
Cache-Control: public, max-age=3600
ETag: "9f2cab11…"          # SHA-256 of the structural cache key

GET /badge/foundational/c01-01/build/passing
If-None-Match: "9f2cab11…"
304 Not Modified           # no body, no re-render

# Cache-Control floors per tier (your renders are never cached shorter than):
#   Free 3600s · Pro 60s`;

const ERRORS_EXAMPLE = `HTTP/1.1 402 Payment Required
Content-Type: application/problem+json

{
  "type": "https://vexillum.dev/errors/payment-required",
  "title": "Payment required",
  "status": 402,
  "detail": "format 'apng' requires a paid plan"
}

# stable type URIs: unknown-variant · unknown-collection · unknown-theme
# unknown-icon · unknown-service · bad-request · unauthorized
# payment-required · rate-limited · render-failure · upstream · invalid-icon`;

const USAGE_EXAMPLE = `GET /v1/meta            # one-shot catalog: URL grammar, params, formats, discovery links
GET /v1/variants        # the full registry manifest (544 variants, 34 collections)
GET /v1/themes          # preset list with resolved token maps
POST /v1/themes         # brand color → guardrailed theme (authenticated)
GET /v1/icons?q=        # icon catalog: Simple Icons brands + icondata sets
GET /v1/fonts           # bundled + Google Fonts catalog slugs
GET /v1/stats/popular   # the most-requested badges: { variant, renders } ranking
POST /v1/icons          # sanitized SVG upload → { "hash", "reference": "upload:…" }
GET /v1/usage           # Authorization: Bearer <key> → { "requestsThisWindow", "rpm" }
POST /v1/billing/webhook # Stripe-signed subscription events (VX_STRIPE_WEBHOOK_SECRET)
GET /health             # { "ok": true }
GET /metrics            # Prometheus text exposition (request/cache/ratelimit counters)`;

const EDGE_EXAMPLE = `// Static badges never touch the origin: apps/worker serves the frozen
// registry from the Cloudflare edge and redirects dynamic services home.
addEventListener("fetch", (event) => {
  event.respondWith(handle(event.request));
});
// /badge/<collection>/<variant>/<label>/<value>.svg  → rendered at the edge
// /badge/github/… , /badge/dynamic/json, /badge/endpoint              → origin`;

function AuthenticationSection() {
  return (
    <>
      <p>
        Rendering a badge never requires a key. Badge URLs are public images — your README, your
        docs, any <code className="font-mono">&lt;img&gt;</code> tag just works, anonymously, inside
        a fair per-IP pool. Keys exist for one reason: when you want your traffic metered against
        your account for higher limits (and Pro features like animated formats or icon uploads).
        Keys are stored server-side as SHA-256 hashes — the dashboard shows the plaintext exactly
        once at creation.
      </p>
      <CodeBlock title="authentication" code={AUTH_EXAMPLE} />
      <p className="mt-3">
        Identity resolution order: <code className="font-mono">Authorization: Bearer</code> header,
        then the <code className="font-mono">?key=</code> query parameter (for{" "}
        <code className="font-mono">&lt;img&gt;</code> embeds), then anonymous with a small
        per-IP pool. The response carries <code className="font-mono">X-Tier</code> telling you
        which tier served the request.
      </p>
      <p className="mt-3">
        Keys are <strong>origin-pinned</strong>. Pin a key to the hosts it may render from
        (dashboard → API keys → <em>Allowed origins</em>); requests that carry an{" "}
        <code className="font-mono">Origin</code> / <code className="font-mono">Referer</code>{" "}
        outside that list are rejected with <code className="font-mono">403</code>, so a leaked key
        cannot be spent from someone else's site. Browsers attach those headers to cross-site
        image loads automatically — no code changes on your side. Unpinned keys (and README
        badges) work from anywhere.
      </p>
      <p className="mt-3">
        The dashboard sits behind a <strong>GitHub OAuth login wall</strong> — there are no
        passwords and no demo accounts. Signing in navigates to{" "}
        <code className="font-mono">/v1/auth/github/login</code>, GitHub calls back to{" "}
        <code className="font-mono">/v1/auth/github/callback</code>, and the API issues an{" "}
        <code className="font-mono">HttpOnly</code> <code className="font-mono">vx_session</code>{" "}
        cookie (30 days, <code className="font-mono">SameSite=Lax</code>). Everything the dashboard
        shows — profile, keys, quotas, usage — comes live from{" "}
        <code className="font-mono">GET /v1/auth/me</code>; signing out deletes the session
        server-side. Enable it on the server with{" "}
        <code className="font-mono">VX_GITHUB_CLIENT_ID</code> +{" "}
        <code className="font-mono">VX_GITHUB_CLIENT_SECRET</code> (copy{" "}
        <code className="font-mono">.env.example</code> in the repo root — it walks through the
        whole setup); without them the login route answers{" "}
        <code className="font-mono">503</code> with the{" "}
        <code className="font-mono">service-not-configured</code> error type, and the login page
        says so honestly — with the exact callback URL to register.
      </p>
    </>
  );
}

function BadgeEndpointsSection() {
  return (
    <>
      <p>
        One catch-all route (<code className="font-mono">/badge/{"{ *path }"}</code>) dispatches by
        shape: four segments render a static variant; a known service id first means a live data
        badge; <code className="font-mono">dynamic/json</code> and{" "}
        <code className="font-mono">endpoint</code> are the shields-style generic sources.
      </p>
      {STATIC_EXAMPLES.map((ex) => (
        <div className="mt-4" key={ex.title}>
          <p className="mb-1.5 text-xs font-semibold">{ex.title}</p>
          <CodeBlock title={ex.title} code={ex.code} />
        </div>
      ))}
      <p className="mt-4">
        Every route accepts the shared query parameters:
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Shared badge query parameters</caption>
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Parameter</th>
              <th scope="col" className="px-3 py-2 font-semibold">Values</th>
            </tr>
          </thead>
          <tbody>
            {QUERY_PARAMS.map(([k, v]) => (
              <tr key={k} className="border-t border-border">
                <td className="px-3 py-1.5 font-mono">{k}</td>
                <td className="px-3 py-1.5 text-muted-foreground">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FormatsSection() {
  return (
    <>
      <p>
        <code className="font-mono">scale=2</code> makes the badge genuinely larger: raster formats
        re-render at 2× pixel density (a 2× render is not an upscaled 1× bitmap — vexillum
        re-rasterizes the full layout), and SVG multiplies its intrinsic display size while the
        viewBox stays in user space, so scaled SVGs remain vector-crisp. Raster output comes in
        PNG, WebP, GIF and APNG; SVG is always available. Format availability is tier-gated and
        enforced server-side: Free svg·png·jpg, Pro adds webp·gif·apng. Requests for a gated
        format return <code className="font-mono">402</code> problem+json, never a downgraded
        render.
      </p>
      <p className="mt-3">
        Backgrounds are transparent wherever the format allows it: PNG, WebP, GIF and APNG carry
        real alpha (only the painted badge pixels are opaque), and SVG has no background rect at
        all — JPEG has no alpha channel, so it is flattened onto white instead of black. Static
        renders are also trimmed to their painted bounding box by default;{" "}
        <code className="font-mono">pad=0</code> is flush to the badge box and any other{" "}
        <code className="font-mono">pad</code> adds exactly that much transparent room.
      </p>
    </>
  );
}

function ThemingSection() {
  return (
    <>
      <p>
        Semantic theming: one <code className="font-mono">?seed=</code> hex drives the entire OKLCH
        vocabulary — surfaces, borders, text, accents, status hues — coherently, and{" "}
        <code className="font-mono">?mode=dark</code> flips the surface ramps. Seed presets:{" "}
        {SEMANTIC_PRESETS.map((p) => p.name).join(", ")} — or pass any custom hex.{" "}
        <code className="font-mono">?theme=&lt;preset&gt;</code> (v4 names still resolve) and{" "}
        <code className="font-mono">?theme=brand:&lt;hex&gt;</code> both resolve through the same
        ramp.
      </p>
      <p className="mt-3">
        Two-tone badges: <code className="font-mono">?seed2=&lt;hex&gt;</code> derives a second,
        independent palette for the <strong>value segment</strong> (the{" "}
        <code className="font-mono">vx-v-*</code> token family). The label and icon sides keep the
        base seed; the value side re-derives — and <code className="font-mono">seed2</code> rides
        any base: a preset (<code className="font-mono">?theme=violet&amp;seed2=22c55e</code>), a
        custom seed, or the default ramp. Without it, value segments render exactly as they always
        have.
      </p>
      <CodeBlock title="custom tokens" code={THEME_QUERY_EXAMPLE} />
      <p className="mt-3">
        The WCAG guardrail: a background/foreground pair below 4.5:1 contrast is corrected — the
        ink is flipped, or (in the “no accessible ink” band, e.g. violet at native lightness) the
        background itself is nudged until readable. Corrections are honest:{" "}
        <code className="font-mono">X-Color-Corrected: corrected</code> on the render, and{" "}
        <code className="font-mono">colorCorrected: true</code> on{" "}
        <code className="font-mono">POST /v1/themes</code>.
      </p>
      <CodeBlock title="brand theme" code={BRAND_EXAMPLE} />
    </>
  );
}

function IconsSection() {
  return (
    <>
      <p>
        Three icon sources. The <strong>brand set</strong> — every Simple Icon (3,400+), served from
        the <code className="font-mono">simpleicons-rs</code> crate with each brand’s official hex —
        is available on every tier via <code className="font-mono">?icon=github</code>. The{" "}
        <strong>icondata catalog</strong> — 33,987 icons across 19 sets (Material Design Icons,
        Tabler, Lucide, Font Awesome, Remix, Bootstrap, Ant Design, Octicons, …) — is addressed as{" "}
        <code className="font-mono">?icon=&lt;set&gt;-&lt;name&gt;</code>: icondata::MdiAccount renders
        as <code className="font-mono">?icon=mdi-account</code>, icondata::LuGitBranch as{" "}
        <code className="font-mono">?icon=lu-git-branch</code>. Browse everything in the playground’s
        icon library, or discover sets via <code className="font-mono">GET /v1/icons</code>.{" "}
        Icons inherit the badge’s <strong>themed ink</strong> by default — <code className="font-mono">currentColor</code>{" "}
        — so they stay readable on every surface and in dark mode; pass{" "}
        <code className="font-mono">icon.color=brand</code> (or any color) when you want the brand’s
        own hex back.{" "}
        <strong>Uploaded SVGs</strong> (Pro) are sanitized server-side (script/iframe/event
        handler stripping), content-hashed, and referenced as{" "}
        <code className="font-mono">?icon=upload:hash</code> forever after.
      </p>
      <CodeBlock
        title="icon upload"
        code={`curl -X POST https://api.vexillum.dev/v1/icons \\
  -H "Authorization: Bearer vx_live_…" \\
  --data-binary @logo.svg

# 201 Created
# { "hash": "9f2c11ab", "bytes": 1284, "reference": "upload:9f2c11ab" }

GET /badge/foundational/c02-08/deploy/prod?icon=upload:9f2c11ab`}
      />
      <CodeBlock
        title="icon catalog"
        code={`GET /v1/icons
# { "brands": { "count": 3467, "source": "simpleicons-rs", "entries": [...] },
#   "icondata": { "count": 33987,
#     "sets": [ { "id": "mdi", "label": "Material Design Icons", "count": 7441 }, ... ] } }

GET /badge/foundational/c02-08/deploy/prod?icon=mdi-account
GET /badge/github/stars/vercel/next.js?icon=lu-git-branch`}
      />
      <p className="mt-3">
        Malicious upload markup is rejected with <code className="font-mono">400 invalid-icon</code>;
        the upload store keeps only the sanitized bytes. Free accounts can browse the full library in
        the playground but cannot upload.
      </p>
    </>
  );
}

function CachingSection() {
  return (
    <>
      <p>
        Cache keys are structural: variant + slots + theme hash + icon hash + format + scale + pad,
        hashed with SHA-256. The same key is the ETag, so revalidation is exact — a 304 guarantees
        byte-identical output.
      </p>
      <CodeBlock title="etag flow" code={CACHE_EXAMPLE} />
    </>
  );
}

function RateLimitsSection() {
  return (
    <>
      <p>
        Fixed-window meters per identity (anonymous meters key on IP). Exceeding the window returns{" "}
        <code className="font-mono">429 rate-limited</code> as problem+json — the dashboard
        surfaces your 429 count so you can see throttling coming.
      </p>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Rate limits per tier</caption>
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Tier</th>
              <th scope="col" className="px-3 py-2 font-semibold">Rate limit</th>
              <th scope="col" className="px-3 py-2 font-semibold">Daily quota</th>
              <th scope="col" className="px-3 py-2 font-semibold">Concurrent renders</th>
              <th scope="col" className="px-3 py-2 font-semibold">Cache floor</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-t border-border">
              <td className="px-3 py-1.5">Free</td><td className="px-3 py-1.5">60 rpm</td>
              <td className="px-3 py-1.5">5,000</td><td className="px-3 py-1.5">1</td><td className="px-3 py-1.5">3600s</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-3 py-1.5">Pro</td><td className="px-3 py-1.5">600 rpm</td>
              <td className="px-3 py-1.5">100,000</td><td className="px-3 py-1.5">2</td><td className="px-3 py-1.5">60s</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function ErrorsSection() {
  return (
    <>
      <p>
        Every failure — 400 to 502 — is{" "}
        <code className="font-mono">application/problem+json</code> (RFC 7807) with a stable{" "}
        <code className="font-mono">type</code> URI you can branch on, never a bare string.
      </p>
      <CodeBlock title="problem+json" code={ERRORS_EXAMPLE} />
    </>
  );
}

function ApiReferenceSection() {
  return (
    <>
      <p>
        The registry, themes and meters are first-class endpoints — the SPA itself is built on them
        via the <code className="font-mono">@vexillum/sdk</code> client.
      </p>
      <CodeBlock title="v1 surface" code={USAGE_EXAMPLE} />
    </>
  );
}

function EdgeSection() {
  return (
    <>
      <p>
        Static badges are served by a Cloudflare Worker compiled from the same Rust core
        (<code className="font-mono">apps/worker</code>, wasm32). The worker renders at the edge and
        redirects dynamic services (github/npm/crates/docker/dynamic/endpoint) to the origin API, so
        README traffic never costs you a server render unless data is actually involved.
      </p>
      <CodeBlock title="worker" code={EDGE_EXAMPLE} />
    </>
  );
}

const SECTIONS: DocSection[] = [
  { id: "authentication", title: "Authentication", body: AuthenticationSection },
  { id: "badge-endpoints", title: "Badge endpoints", body: BadgeEndpointsSection },
  { id: "formats", title: "Formats & scale", body: FormatsSection },
  { id: "theming", title: "Theming & guardrails", body: ThemingSection },
  { id: "icons", title: "Icons", body: IconsSection },
  { id: "caching", title: "Caching & ETags", body: CachingSection },
  { id: "rate-limits", title: "Rate limits", body: RateLimitsSection },
  { id: "errors", title: "Errors (RFC 7807)", body: ErrorsSection },
  { id: "api", title: "v1 API reference", body: ApiReferenceSection },
  { id: "edge", title: "Edge worker", body: EdgeSection },
];

/** Docs — sidebar-navigated API reference derived from the real routes.rs contract. */
export function DocsPage() {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-72px 0px -60% 0px" },
    ) : null;
    if (observer) {
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      }
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <BookOpen className="h-5 w-5 text-accent" aria-hidden />
        API documentation
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        The complete surface of the badge API — every example below is derived from the live
        contract (<code className="font-mono">routes.rs</code> +{" "}
        <code className="font-mono">@vexillum/sdk</code>).
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Docs sections" className="lg:sticky lg:top-20 lg:self-start">
          <ol className="flex gap-1 overflow-x-auto lg:flex-col">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "block whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                    active === s.id
                      ? "bg-muted font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="mr-2 font-mono text-[10px] text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24">
              <h2 id={`${s.id}-h`} className="text-base font-bold tracking-tight">
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[12px] [&_:not(pre)>code]:text-foreground [&_strong]:text-foreground">
                <s.body />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

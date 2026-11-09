import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Gauge,
  Globe2,
  ImageDown,
  Palette,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "@/components/CodeBlock";
import { BadgeFrame } from "@/components/BadgeFrame";
import { Reveal } from "@/components/Reveal";
import { renderVariant, variantById } from "@/lib/badge";
import { PLANS, PLAN_ORDER, formatCount, formatPrice, type Plan } from "@/lib/plans";
import { useSession } from "@/lib/session";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";

/**
 * Landing — the product's front door.
 *
 * Design language: an aurora hero (drifting gradient blobs over a faint dot
 * grid), a live badge marquee that proves the engine by rendering real
 * variants, a count-up stats band, and scroll-revealed sections. Every
 * effect is transform/opacity CSS (see `.vx-*` in index.css) gated behind
 * prefers-reduced-motion — the page stays fast while feeling alive.
 */

const MARQUEE_ROWS = [
  ["c01-01", "c02-08", "c04-02", "c05-03", "c09-02", "c13-13", "c17-04", "c33-01"],
  ["c12-04", "c20-08", "c23-02", "c26-06", "c29-01", "c31-10", "c34-02", "c03-11"],
];

function MarqueeRow({ ids, reverse }: { ids: string[]; reverse?: boolean }) {
  const doubled = [...ids, ...ids];
  return (
    <div className="vx-marquee vx-marquee-mask overflow-hidden">
      <div
        className={cn("vx-marquee-track flex w-max items-center gap-3 py-1.5", reverse && "reverse")}
      >
        {doubled.map((id, i) => {
          const v = variantById(id);
          if (!v) return null;
          return (
            <BadgeFrame key={`${id}-${i}`} className="w-auto shrink-0">
              {renderVariant({ variant: v, icon: "default" })}
            </BadgeFrame>
          );
        })}
      </div>
    </div>
  );
}

/** One animated number in the stats band — counts up when it first appears. */
function Stat({ target, format, label }: { target: number; format: (n: number) => string; label: string }) {
  const [reached, setReached] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setReached(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReached(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const text = useCountUp(reached ? target : 0, format);
  return (
    <div ref={ref} className="text-center">
      <p className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{text}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

const STATS: Array<{ target: number; format: (n: number) => string; label: string }> = [
  { target: 544, format: (n) => n.toLocaleString("en-US"), label: "Structural variants" },
  { target: 34, format: (n) => String(n), label: "Collections" },
  { target: 33987, format: (n) => n.toLocaleString("en-US"), label: "Icons" },
  { target: 1959, format: (n) => n.toLocaleString("en-US"), label: "Google fonts" },
  { target: 6, format: (n) => String(n), label: "Output formats" },
];

const VALUE_PROPS = [
  {
    icon: ImageDown,
    title: "Six output formats",
    body: "SVG, PNG, JPG, WebP, GIF and APNG from one structural engine — plus @1x/2x/3x scale for crisp retina embeds.",
  },
  {
    icon: Boxes,
    title: "544 variants, 34 collections",
    body: "Foundational splits to kinetic marquees — every variant is a real template with label/value/extra/icon slots.",
  },
  {
    icon: Palette,
    title: "OKLCH theming + WCAG guardrails",
    body: "Six presets, custom token maps, and a guardrail that refuses unreadable contrast (and tells you via X-Color-Corrected).",
  },
  {
    icon: Zap,
    title: "Edge-cached, ETag'd",
    body: "Structural SHA-256 cache keys, Cache-Control floors per tier, and 304 Not Modified revalidation built in.",
  },
  {
    icon: Globe2,
    title: "Live data services",
    body: "GitHub, npm, crates.io, Docker pulls, dynamic JSON and your own endpoint — rendered into any variant.",
  },
  {
    icon: ShieldCheck,
    title: "Honest API errors",
    body: "RFC 7807 problem+json on every failure, sanitized SVG uploads, and per-tier rate limits you can actually read.",
  },
];

const COMPARISON: Array<{ feature: string; vexillum: string; shields: string }> = [
  { feature: "Badge catalog", vexillum: "544 curated structural variants, one render engine", shields: "Thousands of one-off community services" },
  { feature: "Output formats", vexillum: "SVG · PNG · WebP · GIF · APNG", shields: "SVG + limited raster endpoints" },
  { feature: "Theming", vexillum: "9-token presets, custom maps, OKLCH, WCAG guardrail", shields: "Per-badge hex colors" },
  { feature: "Caching", vexillum: "SHA-256 structural ETag + 304 revalidation", shields: "CDN-dependent, no revalidation contract" },
  { feature: "Errors", vexillum: "RFC 7807 application/problem+json", shields: "Plain-text 404s" },
  { feature: "Scale control", vexillum: "@1x/2x/3x on every badge", shields: "None" },
  { feature: "Self-hosting", vexillum: "Open Rust core + Cloudflare worker for static badges", shields: "Hosted only" },
  { feature: "Price", vexillum: "Free · Pro $8/mo", shields: "Free (donation)" },
];

const MATRIX_ROWS: Array<{ label: string; value: (plan: Plan) => string }> = [
  { label: "Daily requests", value: (p) => formatCount(PLANS[p].dailyQuota) },
  { label: "Rate limit", value: (p) => `${PLANS[p].rpm} rpm` },
  { label: "Formats", value: (p) => PLANS[p].formats.join(" · ") },
  { label: "Animated GIF / APNG", value: (p) => (PLANS[p].formats.includes("gif") ? "Included" : "—") },
  { label: "Icon uploads", value: (p) => (PLANS[p].iconUploads ? "Included" : "Curated set only") },
  { label: "Key origin allowlist", value: (p) => (PLANS[p].originAllowlist ? "Pin keys to your domains" : "—") },
  { label: "Cache-control floor", value: (p) => `${PLANS[p].cacheFloorSecs}s` },
  { label: "Support", value: (p) => PLANS[p].support },
];

const CURL_SNIPPET = `# no API key needed — badges are public
curl -s "https://api.vexillum.dev/badge/foundational/c01-01/build/passing?theme=blue" \\
  -o badge.svg`;

const MARKDOWN_SNIPPET = `<!-- README.md -->
![build](https://api.vexillum.dev/badge/foundational/c01-01/build/passing.svg?theme=emerald&scale=2)`;

const HTML_SNIPPET = `<img
  src="https://api.vexillum.dev/badge/github/stars/vercel/next.js.svg"
  alt="GitHub stars for vercel/next.js"
  height="20">`;

export function LandingPage() {
  const session = useSession();
  const navigate = useNavigate();
  const signedIn = session.isSignedIn;

  return (
    <div>
      {/* ------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* aurora: two slow-drifting blobs + a faint dot grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: "radial-gradient(circle, rgb(24 24 27 / 0.06) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="vx-aurora-blob absolute -top-32 left-[12%] h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
          <div
            className="vx-aurora-blob absolute -bottom-40 right-[8%] h-[28rem] w-[28rem] rounded-full bg-violet-500/12 blur-3xl"
            style={{ animationDelay: "-9s" }}
          />
          <div
            className="vx-aurora-blob absolute right-[35%] top-[20%] h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
            style={{ animationDelay: "-4s" }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-16 text-center sm:pt-24">
          <p className="vx-enter mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 font-mono text-[11px] text-muted-foreground shadow-sm backdrop-blur">
            <Gauge className="h-3.5 w-3.5 text-accent" aria-hidden />
            544 curated variants · 34 collections · 6 output formats
          </p>
          <h1 className="vx-enter text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ animationDelay: "60ms" }}>
            Badges that survive
            <span className="bg-gradient-to-r from-accent to-violet-500 bg-clip-text text-transparent">
              {" "}
              design review
            </span>
          </h1>
          <p
            className="vx-enter mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base"
            style={{ animationDelay: "120ms" }}
          >
            The badge standard. Vexillum renders structurally distinct badges — not a thousand
            one-offs — through one OKLCH-themed, WCAG-guardrailed engine, cached at the edge with
            ETags.
          </p>
          <div
            className="vx-enter mt-7 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "180ms" }}
          >
            {signedIn ? (
              <Button size="lg" className="vx-sheen" onClick={() => navigate({ to: "/dashboard" })}>
                Open dashboard <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            ) : (
              <Button size="lg" className="vx-sheen" onClick={() => navigate({ to: "/login" })}>
                Start free — 5,000 req/day <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            )}
            <Button size="lg" variant="outline" onClick={() => navigate({ to: "/explore" })}>
              Explore all 544 variants
            </Button>
          </div>

          {/* live badge marquee — the engine, rendering for real, in both directions */}
          <div className="vx-enter mx-auto mt-10 max-w-4xl space-y-1" style={{ animationDelay: "240ms" }} aria-label="Live rendered badge samples">
            <MarqueeRow ids={MARQUEE_ROWS[0]} />
            <MarqueeRow ids={MARQUEE_ROWS[1]} reverse />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ stats band */}
      <section aria-label="Registry scale" className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ value props */}
      <section aria-labelledby="value-props" className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <h2 id="value-props" className="text-center text-2xl font-bold tracking-tight">
            One engine, every badge you ship
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUE_PROPS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 90}>
              <Card className="vx-lift h-full">
                <CardContent className="pt-4">
                  <p.icon className="mb-2 h-5 w-5 text-accent" aria-hidden />
                  <h3 className="text-sm font-semibold">{p.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ quick start */}
      <section aria-labelledby="quickstart" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <Reveal>
            <h2 id="quickstart" className="text-2xl font-bold tracking-tight">
              Shipping a badge takes 30 seconds
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every badge is a URL. Point it at any variant in the registry, add{" "}
              <code className="rounded bg-muted px-1 font-mono text-[11px]">?theme=</code>,{" "}
              <code className="rounded bg-muted px-1 font-mono text-[11px]">?scale=</code> or{" "}
              <code className="rounded bg-muted px-1 font-mono text-[11px]">?format=</code>, embed it anywhere.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <CodeBlock title="curl" language="bash" code={CURL_SNIPPET} />
            <CodeBlock title="markdown" language="markdown" code={MARKDOWN_SNIPPET} />
            <CodeBlock title="html" language="html" code={HTML_SNIPPET} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ pricing */}
      <section aria-labelledby="pricing" className="mx-auto max-w-7xl px-6 py-16">
        <Reveal>
          <h2 id="pricing" className="text-center text-2xl font-bold tracking-tight">
            Free for your README. $8 when you need more.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
            Badges are public URLs — no key, no signup, no per-render billing. Pro is one flat fee
            that unlocks animated formats, icon uploads, metering and per-key origin pinning.
            No seats, no enterprise tier, no sales call.
          </p>
        </Reveal>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 lg:grid-cols-2">
          {PLAN_ORDER.map((planId, i) => {
            const plan = PLANS[planId];
            const current = signedIn && session.plan === planId;
            const highlight = planId === "pro";
            return (
              <Reveal key={planId} delay={i * 90}>
                <Card
                  className={cn(
                    "vx-lift relative h-full",
                    highlight ? "border-accent shadow-lg shadow-accent/10" : "",
                  )}
                >
                  {highlight && (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                      Most popular
                    </span>
                  )}
                  <CardContent className="flex h-full flex-col pt-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider">{plan.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
                    <p className="mt-4">
                      <span className="text-3xl font-extrabold tracking-tight">{formatPrice(plan.priceUsd)}</span>
                      <span className="text-xs text-muted-foreground"> {plan.priceNote}</span>
                    </p>
                    <dl className="mt-4 flex-1 space-y-1.5 border-t border-border pt-4 text-xs">
                      {MATRIX_ROWS.map((row) => (
                        <div key={row.label} className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">{row.label}</dt>
                          <dd className="text-right font-medium">{row.value(planId)}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-5">
                      <Button
                        className={cn("w-full", highlight && "vx-sheen")}
                        variant={highlight ? "default" : "outline"}
                        // the Pro card lands on the PUBLIC billing page (plan
                        // grid + checkout); the free card goes to the dashboard
                        onClick={() =>
                          navigate({ to: signedIn ? (planId === "pro" ? "/billing" : "/dashboard") : "/login" })
                        }
                      >
                        {current ? "Current plan" : planId === "free" ? (signedIn ? "Included in your plan" : "Start free") : signedIn ? "Upgrade to Pro" : `Choose ${plan.name}`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------ comparison */}
      <section aria-labelledby="comparison" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Reveal>
            <h2 id="comparison" className="text-2xl font-bold tracking-tight">
              How we compare
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              shields.io is the category default — here is where a purpose-built, structural engine differs.
            </p>
          </Reveal>
          <Reveal delay={90}>
            <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full text-left text-xs">
                <caption className="sr-only">Feature comparison: Vexillum vs shields.io</caption>
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th scope="col" className="px-4 py-2.5 font-semibold">Capability</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold text-accent">Vexillum</th>
                    <th scope="col" className="px-4 py-2.5 font-semibold text-muted-foreground">shields.io</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-b border-border last:border-0">
                      <th scope="row" className="px-4 py-2.5 font-medium">{row.feature}</th>
                      <td className="px-4 py-2.5">{row.vexillum}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.shields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ final CTA */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-muted/50 to-white px-6 py-12">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="vx-aurora-blob absolute -bottom-24 left-[15%] h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
              <div
                className="vx-aurora-blob absolute -top-20 right-[12%] h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"
                style={{ animationDelay: "-6s" }}
              />
            </div>
            <div className="relative">
              <BarChart3 className="mx-auto mb-3 h-6 w-6 text-accent" aria-hidden />
              <h2 className="text-2xl font-bold tracking-tight">Ready to badge everything?</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                The free tier is the whole registry, every theme and SVG/PNG/JPG — keyless, forever.
                Pro is $8/mo flat for animation, uploads, metering and origin pinning. No credit card,
                no sales call.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button size="lg" className="vx-sheen" onClick={() => navigate({ to: signedIn ? "/dashboard" : "/login" })}>
                  {signedIn ? "Go to dashboard" : "Create your free account"}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: "/playground" })}>
                  Try the playground
                </Button>
              </div>
              <p className="mt-5 text-[11px] text-muted-foreground">
                Prefer to look around first?{" "}
                <Link to="/docs" className="font-semibold text-accent hover:underline">
                  Read the API docs
                </Link>{" "}
                — every endpoint is public.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Check, CreditCard } from "lucide-react";
import { GithubMark } from "@/components/GithubMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlanPill } from "@/components/LockedPanel";
import { BillingSection } from "@/dashboard/BillingSection";
import { useSession } from "@/lib/session";
import { PLANS, PLAN_ORDER, formatCount, formatPrice, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

/**
 * Billing — a PUBLIC page, deliberately outside the login-walled dashboard.
 * Every upgrade nudge in the product (locked formats in the Playground,
 * icon uploads, usage walls) links here, including taps from anonymous
 * visitors — the old dashboard-embedded tab sent them into the login wall
 * (or, with the API down, an error screen) instead of a usable page.
 *
 * Signed in, it is the full billing surface: live plan from the session,
 * today's usage meter, the plan grid and the (honest) empty invoice ledger.
 * Signed out, the same plan grid renders with a sign-in panel — pricing is
 * public information; only the usage meter needs a session.
 */

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: ["5,000 req/day · 60 rpm — keyless", "SVG · PNG · JPG", "All themes, full 544-variant registry", "Community support"],
  pro: ["100,000 req/day · 600 rpm", "All formats incl. WebP · GIF · APNG", "Icon uploads + key origin allowlists", "Email support, next business day"],
};

function PlanGrid({ currentPlan, signedIn }: { currentPlan: Plan | null; signedIn: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {PLAN_ORDER.map((id) => {
        const p = PLANS[id];
        const isCurrent = currentPlan === id;
        return (
          <Card key={id} className={cn(isCurrent && "border-accent shadow-lg shadow-accent/10")}>
            <CardContent className="flex h-full flex-col pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider">{p.name}</h3>
                {isCurrent ? (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                    current
                  </span>
                ) : id === "pro" ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    most popular
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-2xl font-extrabold tracking-tight">
                {formatPrice(p.priceUsd)}
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-3 flex-1 space-y-1.5 text-xs">
                {PLAN_FEATURES[id].map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 flex-none text-success" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current plan
                  </Button>
                ) : !signedIn && id === "free" ? (
                  // anonymous free card = sign up, not checkout
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <GithubMark className="h-4 w-4" /> Start free with GitHub
                  </Link>
                ) : (
                  <a
                    className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    href="https://github.com/sponsors"
                    target="_blank"
                    rel="noreferrer"
                    data-testid="upgrade-to-pro"
                  >
                    Upgrade via Stripe checkout
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SignInPanel() {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <div>
          <p className="text-sm font-bold tracking-tight">Your usage, invoices and subscription</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            Sign in with GitHub to see today's request meter against your plan's quota and manage
            your subscription. Rendering badges never requires an account.
          </p>
        </div>
        <Link
          to="/login"
          className="inline-flex h-10 flex-none items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <GithubMark className="h-4 w-4" /> Continue with GitHub
        </Link>
      </CardContent>
    </Card>
  );
}

function LoadingBilling() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10" aria-busy="true" aria-live="polite">
      <div className="vx-skeleton h-7 w-40 rounded" />
      <div className="vx-skeleton mt-4 h-24 rounded-lg border border-border" />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="vx-skeleton h-64 rounded-lg border border-border" />
        <div className="vx-skeleton h-64 rounded-lg border border-border" />
      </div>
    </div>
  );
}

export function BillingPage() {
  const session = useSession();

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <CreditCard className="h-5 w-5 text-accent" aria-hidden />
            Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Flat plans, no per-render billing — badges are public URLs.
          </p>
        </div>
        {session.isSignedIn && <PlanPill plan={session.plan ?? "free"} dataTestId="billing-plan-pill" />}
      </div>

      {session.status === "loading" ? (
        <LoadingBilling />
      ) : session.isSignedIn && session.user ? (
        <BillingSection
          plan={session.plan ?? "free"}
          requestsToday={session.usage?.requestsToday ?? 0}
          dailyQuota={session.usage?.dailyQuota ?? PLANS[session.plan ?? "free"].dailyQuota}
        />
      ) : (
        <div className="space-y-6">
          <SignInPanel />
          <PlanGrid currentPlan={null} signedIn={false} />
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <h3 className="mb-1 font-semibold text-foreground">How upgrades work</h3>
            <p>
              Pro is a flat $8/mo, billed through Stripe. Completing checkout emits{" "}
              <code className="font-mono">checkout.completed</code> to the billing webhook, the
              server flips your account tier, and this page reflects it on the next refresh. See{" "}
              <Link to="/docs" className="font-semibold text-accent hover:underline">
                the API docs
              </Link>{" "}
              for what each tier unlocks.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

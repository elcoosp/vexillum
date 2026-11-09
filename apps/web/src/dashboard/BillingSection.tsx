import { Check, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Meter } from "@/components/ui/tabs";
import { PLANS, PLAN_ORDER, formatCount, formatPrice, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: ["5,000 req/day · 60 rpm — keyless", "SVG · PNG · JPG", "All themes, full 544-variant registry", "Community support"],
  pro: ["100,000 req/day · 600 rpm", "All formats incl. WebP · GIF · APNG", "Icon uploads + key origin allowlists", "Email support, next business day"],
};

/**
 * Billing — the real plan from the session, the live usage meter, and an
 * honest upgrade path. There is no mock checkout: Pro unlocks through the
 * Stripe webhook the server already speaks (see crates/billing), and this
 * panel links to the docs instead of pretending money moved.
 */
export function BillingSection({
  plan,
  requestsToday,
  dailyQuota,
}: {
  plan: Plan;
  requestsToday: number;
  dailyQuota: number;
}) {
  const current = PLANS[plan];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current plan</p>
            <p className="mt-1 text-lg font-bold tracking-tight">
              {current.name} — {formatPrice(current.priceUsd)}
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {current.dailyQuota.toLocaleString()} req/day · {current.rpm} rpm · synced from the API
            </p>
          </div>
          <CreditCard className="h-8 w-8 text-muted-foreground/40" aria-hidden />
        </CardContent>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Today</span>
            <span className="font-mono">
              {formatCount(requestsToday)} / {formatCount(dailyQuota)}
            </span>
          </div>
          <Meter className="mt-1.5" value={requestsToday} max={dailyQuota} label={`${current.name} usage today`} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const isCurrent = id === plan;
          return (
            <Card key={id} className={cn(isCurrent && "border-accent shadow-lg shadow-accent/10")}>
              <CardContent className="flex h-full flex-col pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider">{p.name}</h3>
                  {isCurrent && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                      current
                    </span>
                  )}
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

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <h3 className="mb-1 font-semibold text-foreground">How upgrades work</h3>
        <p>
          Pro is a flat $8/mo, billed through Stripe. Completing checkout emits{" "}
          <code className="font-mono">checkout.completed</code> to the billing webhook, the server
          flips your account tier, and this page reflects it on the next refresh — usually within
          seconds. Invoices appear here once Stripe is wired to this deployment; until then the
          ledger below stays honestly empty.
        </p>
      </div>

      <div className="vx-scroll-light overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Invoices</caption>
          <thead className="bg-muted/50 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-2.5">Invoice</th>
              <th scope="col" className="px-4 py-2.5">Date</th>
              <th scope="col" className="px-4 py-2.5">Plan</th>
              <th scope="col" className="px-4 py-2.5">Amount</th>
              <th scope="col" className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground" data-testid="invoices-empty">
                No invoices yet{plan === "free" ? " — the Free plan doesn't generate any" : " — Stripe billing isn't wired to this deployment"}.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

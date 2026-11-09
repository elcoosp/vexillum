import { Activity, Database, Gauge, KeyRound, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Meter } from "@/components/ui/tabs";
import { PLANS, formatCount, type Plan } from "@/lib/plans";
import { useSession } from "@/lib/session";
import { useCountUp } from "@/lib/useCountUp";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  testId,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  sub?: string;
  testId?: string;
}) {
  return (
    <Card className="vx-lift">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-accent" aria-hidden />
        </div>
        <p className="mt-1.5 font-mono text-2xl font-bold tracking-tight tabular-nums" data-testid={testId}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Overview — live numbers only: requests today (the API's UTC-day counter
 * summed across your keys), the current rate window, active keys and the
 * quota meter. Every figure comes from `/v1/auth/me`; there is no simulated
 * history anywhere in this dashboard.
 */
export function OverviewSection({ plan }: { plan: Plan }) {
  const session = useSession();
  const planDef = PLANS[plan];
  const usage = session.usage;
  const requestsToday = usage?.requestsToday ?? 0;
  const requestsThisWindow = usage?.requestsThisWindow ?? 0;
  const rpm = usage?.rpm ?? planDef.rpm;
  const dailyQuota = usage?.dailyQuota ?? planDef.dailyQuota;
  const activeKeys = session.keys.filter((k) => k.env).length;
  const pinnedKeys = session.keys.filter((k) => k.allowedOrigins.length > 0).length;

  // stats tick up/down instead of hard-swapping on refresh
  const todayLabel = useCountUp(requestsToday, formatCount);
  const windowLabel = useCountUp(requestsThisWindow, formatCount);
  const keysLabel = useCountUp(activeKeys, formatCount);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Activity}
          label="Requests today"
          value={todayLabel}
          sub="live UTC-day counter from the API"
          testId="stat-requests-today"
        />
        <StatCard
          icon={Gauge}
          label="Current window"
          value={windowLabel}
          sub={`of ${rpm} rpm across ${session.keys.length} key${session.keys.length === 1 ? "" : "s"}`}
          testId="stat-window"
        />
        <StatCard
          icon={KeyRound}
          label="API keys"
          value={keysLabel}
          sub={
            pinnedKeys > 0
              ? `${pinnedKeys} pinned to specific origins`
              : "none pinned to origins yet"
          }
          testId="stat-keys"
        />
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-accent" aria-hidden />
              <h3 className="text-sm font-semibold">Daily quota</h3>
              <span
                className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                data-testid="data-origin"
              >
                live — /v1/auth/me
              </span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {formatCount(requestsToday)} / {formatCount(dailyQuota)} · {rpm} rpm ·{" "}
              {planDef.formats.length} formats
            </p>
          </div>
          <Meter
            className="mt-3"
            value={requestsToday}
            max={dailyQuota}
            label={`${planDef.name} plan utilization`}
          />
          <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-success" aria-hidden />
            Keyless badge renders (READMEs, docs) don't count against this quota — it meters keyed
            traffic only. The counter resets at 00:00 UTC.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

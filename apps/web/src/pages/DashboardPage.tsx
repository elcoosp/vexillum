import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FlaskConical, Info, RefreshCw } from "lucide-react";
import { GithubMark } from "@/components/GithubMark";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlanPill } from "@/components/LockedPanel";
import { OverviewSection } from "@/dashboard/OverviewSection";
import { KeysSection } from "@/dashboard/KeysSection";
import { IconsSection } from "@/dashboard/IconsSection";
import { ThemesSection } from "@/dashboard/ThemesSection";
import { SettingsSection } from "@/dashboard/SettingsSection";
import { useSession } from "@/lib/session";
import { PLANS, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

const DASH_TABS = [
  { id: "overview", label: "Overview" },
  { id: "keys", label: "API keys" },
  { id: "icons", label: "Icons" },
  { id: "themes", label: "Themes" },
  { id: "settings", label: "Settings" },
];

function LoginWall() {
  const navigate = useNavigate();
  return (
    <div className="vx-enter mx-auto max-w-md px-6 py-20 text-center">
      <FlaskConical className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden />
      <h1 className="text-xl font-bold tracking-tight">Your dashboard lives here</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in with GitHub to manage keys, quotas and billing. Everything on the other side is
        real: your keys, your usage, your plan — nothing is simulated.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        {/* route through /login: it probes whether OAuth is configured on this
            deployment and degrades to a setup hint instead of a raw error */}
        <Button onClick={() => navigate({ to: "/login" })}>
          <GithubMark className="h-4 w-4" /> Continue with GitHub
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Rendering badges never requires an account — see{" "}
        <Link to="/docs" className="font-semibold text-accent hover:underline">
          the docs
        </Link>
        .
      </p>
    </div>
  );
}

function LoadingDash() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8" aria-busy="true" aria-live="polite">
      <div className="vx-skeleton h-7 w-44 rounded" />
      <div className="vx-skeleton mt-4 h-10 w-72 rounded" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="vx-skeleton h-28 rounded-lg border border-border" />
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Checking your session…</p>
    </div>
  );
}

function UnavailableDash({ reason }: { reason: string }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <Info className="mx-auto mb-3 h-8 w-8 text-warning" aria-hidden />
      <h1 className="text-xl font-bold tracking-tight">The dashboard needs its API</h1>
      <p className="mt-2 text-sm text-muted-foreground">{reason}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        This page shows live data only — there is no demo mode to fall back on.
      </p>
    </div>
  );
}

/** Dashboard — the login-walled product surface, driven by the live API. */
export function DashboardPage() {
  const session = useSession();
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/dashboard" });
  const activeTab = tab && DASH_TABS.some((t) => t.id === tab) ? tab : "overview";

  if (session.status === "loading") return <LoadingDash />;
  if (session.status === "unavailable") return <UnavailableDash reason={session.unavailableReason ?? ""} />;
  if (!session.isSignedIn || !session.user) return <LoginWall />;

  // normalizePlan guards stale/unknown tiers — PLANS[plan] can never be undefined
  const plan: Plan = session.plan ?? "free";
  const planDef = PLANS[plan];

  const setTab = (id: string) => {
    void navigate({ to: "/dashboard", search: id === "overview" ? {} : { tab: id }, replace: true });
  };
  // upgrade nudges leave the dashboard for the PUBLIC billing page — the
  // plan grid lives there now (it also serves signed-out visitors)
  const goBilling = () => void navigate({ to: "/billing" });

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
            {session.user.avatarUrl && (
              <img
                src={session.user.avatarUrl}
                alt=""
                className="h-5 w-5 rounded-full border border-border"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="font-medium text-foreground">@{session.user.login}</span>
            <PlanPill plan={plan} />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] text-muted-foreground">
            {planDef.dailyQuota.toLocaleString()} req/day · {planDef.rpm} rpm · {planDef.formats.join("/")}
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Refresh dashboard data"
            data-testid="refresh-session"
            onClick={() => void session.refresh()}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <Tabs tabs={DASH_TABS} active={activeTab} onChange={setTab} ariaLabel="Dashboard sections" className="mb-5 border-b border-border pb-2" />

      {activeTab === "overview" && <OverviewSection plan={plan} />}
      {activeTab === "keys" && <KeysSection />}
      {activeTab === "icons" && <IconsSection plan={plan} onUpgrade={goBilling} />}
      {activeTab === "themes" && <ThemesSection plan={plan} />}
      {activeTab === "settings" && <SettingsSection plan={plan} />}

      <p className={cn("mt-8 text-center text-[11px] text-muted-foreground")}>
        Signed in as @{session.user.login} — session verified against the API on every load.
      </p>
    </div>
  );
}

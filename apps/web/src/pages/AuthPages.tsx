import { useEffect, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { Boxes, Info, ShieldCheck } from "lucide-react";
import { githubLoginUrl } from "@/lib/session";
import { writeClipboard } from "@/components/CopyButton";
import { GithubMark } from "@/components/GithubMark";

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <div className="mb-6 text-center">
        <Boxes className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden />
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">{children}</div>
      <div className="mt-4 text-center text-xs text-muted-foreground">{footer}</div>
    </div>
  );
}

/**
 * Login = GitHub OAuth. There are no passwords and no demo accounts: the
 * button navigates to the API's authorize route, GitHub comes back to
 * `/v1/auth/github/callback`, and the API bounces here with a session
 * cookie. When the API hasn't been configured (no client id/secret), the
 * page says exactly that instead of pretending.
 */
export function LoginPage() {
  const { error } = useSearch({ from: "/login" });
  const [configError, setConfigError] = useState(false);
  const oauthError = error === "github";
  // the OAuth app's callback must point at the origin serving this page (the
  // dev server proxies /v1 to the API, so one URL covers both)
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = `${origin}/v1/auth/github/callback`;

  // a HEAD to the login route tells us whether OAuth is configured (302 →
  // opaque via redirect:manual) vs 503/unreachable so the button can degrade
  // gracefully instead of bouncing into a closed flow
  useEffect(() => {
    let alive = true;
    fetch(`${githubLoginUrl()}`, { method: "HEAD", redirect: "manual" })
      .then((res) => {
        if (alive && (res.status === 503 || res.status === 404 || res.status >= 500)) setConfigError(true);
      })
      .catch(() => {
        if (alive) setConfigError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const disabled = configError;

  return (
    <AuthShell
      title="Sign in to vexillum"
      subtitle="One click, no passwords — your GitHub account is your dashboard."
      footer={
        <>
          Rendering badges needs no account at all —{" "}
          <Link to="/docs" className="font-semibold text-accent hover:underline">
            the docs
          </Link>{" "}
          start keyless.
        </>
      }
    >
      <div className="space-y-4">
        {oauthError && (
          <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-xs font-medium text-danger" data-testid="oauth-error">
            GitHub returned an error for that sign-in attempt (denied consent, expired flow, or an
            API hiccup). Try again — if it persists, check the API's OAuth env config.
          </p>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            window.location.href = githubLoginUrl();
          }}
          data-testid="github-login"
          className="vx-press flex w-full items-center justify-center gap-2.5 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md hover:opacity-95 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GithubMark className="h-4.5 w-4.5" />
          Continue with GitHub
        </button>

        {disabled && (
          <div
            className="space-y-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
            data-testid="oauth-unconfigured"
          >
            <p className="flex gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
              <span>
                GitHub sign-in isn't configured on this deployment yet. Three steps, about two
                minutes:
              </span>
            </p>
            <ol className="ml-6 list-decimal space-y-1.5">
              <li>
                Create an OAuth app at{" "}
                <a
                  href="https://github.com/settings/developers"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline decoration-amber-400 underline-offset-2"
                >
                  github.com/settings/developers
                </a>{" "}
                — homepage: <code className="font-mono">{origin}</code>
              </li>
              <li>
                Callback URL:{" "}
                <button
                  type="button"
                  onClick={() => void writeClipboard(callbackUrl)}
                  className="break-all rounded bg-amber-100 px-1 py-0.5 text-left font-mono underline decoration-amber-400 underline-offset-2 hover:bg-amber-200"
                  title="Copy callback URL"
                >
                  {callbackUrl}
                </button>
              </li>
              <li>
                Run the server with{" "}
                <code className="font-mono">VX_GITHUB_CLIENT_ID</code> +{" "}
                <code className="font-mono">VX_GITHUB_CLIENT_SECRET</code> from the app you just
                created (see <code className="font-mono">.env.example</code>), then reload here.
              </li>
            </ol>
          </div>
        )}

        <div className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-success" aria-hidden />
          <p>
            The session lives in an <code className="font-mono">HttpOnly</code> cookie scoped to the
            API origin — JavaScript never touches it, and signing out deletes it server-side. Vexillum
            only requests your <code className="font-mono">read:user</code> scope: profile, no repos,
            no emails beyond the public one.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Boxes, LogOut, Menu, X } from "lucide-react";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/**
 * Public routes are always visible; the Dashboard link only exists for a
 * signed-in session — there is no reason to advertise a login-walled page
 * (and no dead-end tap for anonymous visitors). Computed per render from
 * the live session state, so sign-in/sign-out updates the bar instantly.
 */
function navLinks(isSignedIn: boolean) {
  return [
    { to: "/explore", label: "Explore" },
    { to: "/playground", label: "Playground" },
    { to: "/docs", label: "Docs" },
    // Billing is public (plan grid + upgrade path); the Dashboard link only
    // exists for a signed-in session — there is no reason to advertise a
    // login-walled page to anonymous visitors.
    { to: "/billing", label: "Billing" },
    ...(isSignedIn ? [{ to: "/dashboard", label: "Dashboard" }] : []),
  ];
}

/** Top navigation — the avatar/sign-out cluster reflects the live session. */
export function TopNav() {
  const session = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const NAV_LINKS = useMemo(() => navLinks(session.isSignedIn), [session.isSignedIn]);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-accent">
          <Boxes className="h-5 w-5 text-accent" aria-hidden />
          <span className="text-sm">vexillum</span>
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "vx-press rounded-md px-2.5 py-1.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-accent",
                pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to))
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {session.isSignedIn ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex items-center gap-2 rounded-full border border-border py-0.5 pl-0.5 pr-2.5" data-testid="nav-session">
                {session.user?.avatarUrl ? (
                  <img
                    src={session.user.avatarUrl}
                    alt=""
                    className="h-6 w-6 rounded-full border border-border"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold uppercase text-accent">
                    {(session.user?.login ?? "?").slice(0, 2)}
                  </span>
                )}
                <span className="max-w-32 truncate text-xs font-medium">{session.user?.login}</span>
              </span>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => void session.signOut()}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                to="/login"
                className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Continue with GitHub
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Primary mobile"
          className="vx-enter border-t border-border px-4 py-2 md:hidden"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {session.isSignedIn ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void session.signOut();
              }}
              className="block w-full rounded-md px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Sign out ({session.user?.login})
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Log in with GitHub
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-xs text-muted-foreground sm:grid-cols-3">
        <div>
          <p className="mb-2 font-bold text-foreground">vexillum</p>
          <p>544 structural badge variants · SVG / PNG / JPG / WebP / GIF / APNG · rendered by vexillum at the edge.</p>
        </div>
        <FooterProductLinks />
        <nav aria-label="Footer resources" className="flex flex-col gap-1.5">
          <span className="font-semibold text-foreground">Resources</span>
          <a href="/docs#authentication" className="hover:text-foreground">Authentication</a>
          <a href="/docs#rate-limits" className="hover:text-foreground">Rate limits</a>
          <a href="/docs#errors" className="hover:text-foreground">Errors (RFC 7807)</a>
          <a href="/health" className="hover:text-foreground">Service health</a>
        </nav>
      </div>
      <div className="border-t border-border py-3 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} vexillum — badges are public URLs; dashboards are real sessions.
      </div>
    </footer>
  );
}

/** Footer product links mirror the top nav: Dashboard only when signed in. */
function FooterProductLinks() {
  const session = useSession();
  return (
    <nav aria-label="Footer product" className="flex flex-col gap-1.5">
      <span className="font-semibold text-foreground">Product</span>
      <Link to="/explore" className="hover:text-foreground">Explore variants</Link>
      <Link to="/playground" className="hover:text-foreground">Playground</Link>
      <Link to="/docs" className="hover:text-foreground">API docs</Link>
      {session.isSignedIn && (
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
      )}
    </nav>
  );
}

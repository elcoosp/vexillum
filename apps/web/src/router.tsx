import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  createMemoryHistory,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { lazyRouteComponent } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Route-level code splitting: every page is its own async chunk, preloaded
// on link hover (`defaultPreload: "intent"` + lazyRouteComponent's
// `.preload()`), so the landing page ships the app shell + hero only and
// heavy pages (playground icon data, docs shiki, dashboard) load on demand.
// The 404 page is a direct import — it must render instantly, even while
// other chunks are in flight.

interface RouterContext {}

/** Root: persistent chrome + the route-level crash guard. */
const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <ErrorBoundary>
      <Layout />
    </ErrorBoundary>
  ),
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("@/pages/LandingPage"), "LandingPage"),
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: lazyRouteComponent(() => import("@/pages/ExplorePage"), "ExplorePage"),
});

/**
 * The playground's shareable state — every key the page reads on a deep link
 * and writes back on change, so the address bar always carries a link that
 * reproduces the exact workbench. Values are opaque strings; the page
 * validates them (unknown variant/font/format fall back to defaults there).
 */
const PLAYGROUND_SEARCH_KEYS = [
  "variant",
  "variants",
  "label",
  "value",
  "extra",
  "extra2",
  "theme",
  "seed",
  "seed2",
  "mode",
  "font",
  "icon",
  "icon.color",
  "format",
  "scale",
  "api",
] as const;

const playgroundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/playground",
  validateSearch: (search: Record<string, unknown>) => {
    const out: Record<string, string | undefined> = {};
    for (const key of PLAYGROUND_SEARCH_KEYS) {
      const v = search[key];
      // TanStack's JSON-first parser hands back numbers/booleans for
      // numeric-looking params (?scale=2 parses as 2) — coerce primitives
      out[key] =
        typeof v === "string" && v !== ""
          ? v
          : typeof v === "number" || typeof v === "boolean"
            ? String(v)
            : undefined;
    }
    return out;
  },
  component: lazyRouteComponent(() => import("@/pages/PlaygroundPage"), "PlaygroundPage"),
});

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/docs",
  component: lazyRouteComponent(() => import("@/pages/DocsPage"), "DocsPage"),
});

/**
 * Billing is a PUBLIC route — every upgrade nudge in the product links here,
 * including taps from anonymous visitors. The dashboard-embedded tab it
 * replaced sat behind the login wall, so a signed-out user following the
 * "Open billing" nudge landed on the login screen (or an API-unavailable
 * error) instead of the plans. Plan/pricing info is public; only the live
 * usage meter needs a session (BillingPage degrades to a sign-in panel).
 */
const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing",
  component: lazyRouteComponent(() => import("@/pages/BillingPage"), "BillingPage"),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  component: lazyRouteComponent(() => import("@/pages/DashboardPage"), "DashboardPage"),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search: Record<string, unknown>): { error?: string } => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: lazyRouteComponent(() => import("@/pages/AuthPages"), "LoginPage"),
});

/** GitHub OAuth made signup implicit — /signup lands on the login page. */
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  beforeLoad: () => {
    throw redirect({ to: "/login", replace: true });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  exploreRoute,
  playgroundRoute,
  docsRoute,
  billingRoute,
  dashboardRoute,
  loginRoute,
  signupRoute,
]);

export function createAppRouter(history?: ReturnType<typeof createMemoryHistory>) {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    history,
  });
}

/** The app singleton (browser history). */
export const router = createAppRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/** Current pathname (react-router's useLocation().pathname replacement). */
export function usePathname(): string {
  return useRouterState({ select: (s) => s.location.pathname });
}

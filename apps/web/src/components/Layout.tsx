import { useEffect } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { TopNav, Footer } from "@/components/Nav";

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hashStr = useRouterState({ select: (s) => s.location.hash });
  useEffect(() => {
    if (hashStr) {
      const el = document.getElementById(hashStr);
      if (el) {
        el.scrollIntoView({ block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hashStr]);
  return null;
}

/** Persistent chrome: top nav + footer around every routed page. */
export function Layout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // The Playground is a full-height tool shell on lg+: nav + panes fill the
  // viewport exactly and each pane scrolls internally, so the controls stay
  // anchored at the top at every scroll position. The footer would give the
  // page scrollable height and let the shell drift — hide it there (lg only;
  // mobile keeps the normal stacked flow with the footer).
  const isToolRoute = pathname.startsWith("/playground");
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Hidden at every width on the tool route: the playground's sticky
          controls need the content root to span the whole document — a footer
          below it would end their containing block early and push the pinned
          controls off near the bottom of the scroll. */}
      <div className={isToolRoute ? "hidden" : undefined}>
        <Footer />
      </div>
    </div>
  );
}

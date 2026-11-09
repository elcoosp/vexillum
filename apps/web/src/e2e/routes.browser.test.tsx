import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, cleanup, screen, waitFor, within, fireEvent } from "@testing-library/react";
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { SessionProvider } from "@/lib/session";
import { createAppRouter } from "@/router";

/**
 * Browser e2e — the no-crash guarantee. Real Chromium, real route tree, real
 * styles, ZERO jsdom in this repo (every test in the app runs in this browser
 * via Vitest browser mode).
 *
 * A route fails this suite when ANY of the following happen:
 *   1. the route-level ErrorBoundary catches a render error
 *      (`[data-testid="app-crash"]` mounts),
 *   2. an `error`/`unhandledrejection` event reaches window,
 *   3. the route's landmark content never appears.
 *
 * The API is stubbed per test (signed-out by default, one signed-in pass for
 * the dashboard) so the suite is hermetic — no Rust server required.
 */

interface CapturedError {
  kind: "error" | "unhandledrejection";
  message: string;
}

let captured: CapturedError[] = [];

beforeEach(() => {
  captured = [];
  window.addEventListener("error", (e) => {
    captured.push({ kind: "error", message: String((e as ErrorEvent).message ?? e) });
  });
  window.addEventListener("unhandledrejection", (e) => {
    captured.push({ kind: "unhandledrejection", message: String((e as PromiseRejectionEvent).reason) });
  });
  // signed-out session for every route unless a test overrides
  stubMe({ status: 401, body: {} });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type StubHandler = (url: string, init?: RequestInit) => Response | undefined;

function stubFetch(handler: StubHandler): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const hit = handler(url, init);
      if (hit) return hit;
      return new Response("{}", { status: 404, headers: { "Content-Type": "application/json" } });
    }),
  );
}

function stubMe(response: { status: number; body: unknown }, extra: Record<string, unknown> = {}): void {
  const { status, body } = response;
  stubFetch((url, init) => {
    if (url.includes("/v1/auth/me")) {
      return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
    }
    if (url.includes("/v1/auth/github/login") && init?.method === "HEAD") {
      return new Response(null, { status: 302 });
    }
    if (extra[url] !== undefined) {
      return new Response(JSON.stringify(extra[url]), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return undefined;
  });
}

function stubNoApi(): void {
  stubFetch(() => {
    throw new TypeError("Failed to fetch");
  });
}

const SIGNED_IN_BODY = {
  user: { id: "1", login: "octocat", name: "The Octocat", email: null, avatarUrl: null, tier: "free", createdAt: 1_700_000_000_000 },
  plan: "free",
  keys: [{ id: "k1", name: "README", prefix: "vx_live_read", originAllowlist: ["https://example.com"], createdAt: 1_700_000_000_000, lastUsedAt: null }],
  usage: { requestsToday: 1284, requestsThisWindow: 3, rpm: 60, dailyQuota: 5000 },
};

async function visit(path: string): Promise<void> {
  const history = createMemoryHistory({ initialEntries: [path] });
  const router = createAppRouter(history);
  render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
  // let async session resolution + lazy chunks settle. Route-level code
  // splitting means the matched page mounts asynchronously — wait for the
  // persistent chrome (nav renders inside Layout, before any lazy page) and
  // for the crash guard to stay silent.
  await waitFor(
    () => expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy(),
    { timeout: 15_000 },
  );
  await waitFor(
    () => expect(document.querySelector("[data-testid='app-crash']")).toBeNull(),
    { timeout: 15_000 },
  );
}

function expectHealthy(where: string): void {
  expect(captured, `uncaught errors on ${where}`).toEqual([]);
  expect(document.querySelector("[data-testid='app-crash']")).toBeNull();
  // the chrome (nav + footer) always exists around a routed page
  expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
}

/** Sets a React controlled input's value through the native setter. */
function typeValue(el: HTMLInputElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

const ROUTES = ["/", "/explore", "/playground", "/docs", "/billing", "/dashboard", "/login", "/signup", "/definitely-not-a-route"];

describe("every route renders in a real browser without crashing", () => {
  for (const route of ROUTES) {
    it(`${route} mounts signed-out with zero uncaught errors`, async () => {
      await visit(route);
      expectHealthy(route);
    });

    it(`${route} mounts signed-in with zero uncaught errors`, async () => {
      stubMe({ status: 200, body: SIGNED_IN_BODY });
      await visit(route);
      expectHealthy(`${route} (signed-in)`);
    });

    it(`${route} survives the API being down with zero uncaught errors`, async () => {
      stubNoApi();
      await visit(route);
      await waitFor(
        () => expect(document.querySelector("[data-testid='app-crash']")).toBeNull(),
        { timeout: 15_000 },
      );
      expectHealthy(`${route} (api down)`);
    });
  }
});

describe("landing", () => {
  it("shows the hero, quick-start blocks and pricing without errors", async () => {
    await visit("/");
    await waitFor(() => screen.getByRole("heading", { level: 1, name: /badges that survive/i }));
    expect(screen.getAllByText("Copy").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByRole("table", { name: /vexillum vs shields\.io/i })).toBeTruthy();
    expectHealthy("/");
  });

  it("code-card horizontal scrollbars sit flush with the card's bottom edge", async () => {
    // regression lock for the floating-scrollbar report (2026-10-30): the
    // scroll div must stretch to the figure's bottom edge even when its
    // snippet is shorter than the tallest sibling card in the grid
    await visit("/");
    await waitFor(() => screen.getByRole("heading", { name: /shipping a badge/i }), { timeout: 15_000 });
    // data-code-block carries the card's title, which on the landing is the
    // tool name ("curl"), not the shiki language
    for (const block of ["curl", "markdown", "html"]) {
      const figure = document.querySelector<HTMLElement>(`figure[data-code-block="${block}"]`);
      expect(figure, `${block} code card`).toBeTruthy();
      const scroller = figure!.querySelector<HTMLElement>(".vx-scroll");
      expect(scroller, `${block} scroll container`).toBeTruthy();
      // the snippet overflows horizontally → the bar actually renders
      expect(scroller!.scrollWidth).toBeGreaterThanOrEqual(scroller!.clientWidth);
      const gap = Math.abs(
        scroller!.getBoundingClientRect().bottom - figure!.getBoundingClientRect().bottom,
      );
      expect(gap, `${block} scrollbar pinned to card bottom`).toBeLessThan(3);
    }
    expectHealthy("/ (scrollbar pinning)");
  });
});

describe("dashboard (authed sections, live data)", () => {
  /** A session whose keys match the real /v1/auth/me shape — parseMe drops
   * entries without a keyHash, so the e2e SIGNED_IN_BODY renders an empty
   * table on purpose; this body exercises the populated table. */
  const DASH_BODY = {
    user: { id: "1", login: "octocat", name: "The Octocat", email: null, avatarUrl: null, tier: "free", createdAt: 1_700_000_000_000 },
    plan: "free",
    keys: [{
      id: "k1ab", keyHash: "a".repeat(64), label: "README", env: "live", tier: "free",
      allowedOrigins: ["https://example.com"], createdAt: 1_700_000_000_000, lastUsedAt: null,
    }],
    usage: { requestsToday: 1284, requestsThisWindow: 3, rpm: 60, dailyQuota: 5000 },
  };

  it("overview renders live stats for a signed-in session", async () => {
    stubMe({ status: 200, body: DASH_BODY });
    await visit("/dashboard");
    await screen.findAllByText(/@octocat/, {}, { timeout: 15_000 });
    expect(screen.getByTestId("stat-requests-today").textContent).toMatch(/1[,.]?284|1\.3K|1,284/);
    expect(screen.getByTestId("data-origin").textContent).toContain("live");
    expect(screen.getByText(/5,000 req\/day/)).toBeTruthy();
    expectHealthy("/dashboard overview (authed)");
  });

  it("API keys tab lists real keys with edit + revoke affordances", async () => {
    stubMe({ status: 200, body: DASH_BODY });
    await visit("/dashboard?tab=keys");
    await screen.findAllByText(/@octocat/, {}, { timeout: 15_000 });
    await waitFor(() => expect(screen.getByTestId("key-row")).toBeTruthy(), { timeout: 15_000 });
    expect(screen.getByTestId("key-row").textContent).toContain("README");
    expect(screen.getByTestId("create-key")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Revoke key README" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit allowed origins for key README" })).toBeTruthy();
    expectHealthy("/dashboard keys (authed)");
  });

  it("Icons tab is locked on Free and its upgrade CTA routes to /billing", async () => {
    stubMe({ status: 200, body: DASH_BODY });
    await visit("/dashboard?tab=icons");
    await screen.findAllByText(/@octocat/, {}, { timeout: 15_000 });
    await waitFor(
      () => expect(screen.getByRole("region", { name: /locked — requires pro/i })).toBeTruthy(),
      { timeout: 15_000 },
    );
    (screen.getByTestId("upgrade-cta") as HTMLButtonElement).click();
    await waitFor(() => screen.getByRole("heading", { name: /billing/i }), { timeout: 15_000 });
    expectHealthy("icons upgrade → /billing");
  });

  it("Themes and Settings tabs render their content crash-free", async () => {
    stubMe({ status: 200, body: DASH_BODY });
    await visit("/dashboard?tab=themes");
    await screen.findAllByText(/@octocat/, {}, { timeout: 15_000 });
    await waitFor(() => expect(screen.getByTestId("theme-card-blue")).toBeTruthy(), { timeout: 15_000 });
    expectHealthy("/dashboard themes (authed)");

    (screen.getByRole("tab", { name: "Settings" }) as HTMLButtonElement).click();
    await waitFor(() => expect(screen.getByTestId("profile-rows")).toBeTruthy(), { timeout: 15_000 });
    expect(screen.getByTestId("profile-rows").textContent).toContain("octocat");
    expect(screen.getByTestId("save-settings")).toBeTruthy();
    expectHealthy("/dashboard settings (authed)");
  });
});

describe("playground batch mode", () => {
  it("assembles a batch from the combobox rows and applies one icon to every badge", async () => {
    await visit("/playground");
    await waitFor(() => screen.getByRole("heading", { name: /playground/i }), { timeout: 15_000 });

    // open the picker, narrow to the terminal collection, tick two rows
    const input = screen.getByRole("combobox", { name: /variant/i }) as HTMLInputElement;
    input.focus();
    await waitFor(() => expect(input.getAttribute("aria-expanded")).toBe("true"));
    typeValue(input, "c09");
    fireEvent.click(screen.getByRole("button", { name: "Add c09-01 to batch" }));
    fireEvent.click(screen.getByRole("button", { name: "Add c09-02 to batch" }));

    // batch mode engages: chips, notice and the shared-appearance stack
    await waitFor(() =>
      expect(screen.getByTestId("batch-chips").textContent).toContain("c09-01"),
    );
    expect(screen.getByTestId("batch-chips").textContent).toContain("c09-02");
    expect(screen.getByTestId("batch-notice").textContent).toContain("Batch mode");
    await waitFor(() =>
      expect(screen.getByTestId("selection-stack").textContent).toContain("c09-01"),
    );
    expect(screen.getByTestId("selection-stack").textContent).toContain("c09-02");

    // the icon editor is reachable in batch mode with the batch hint
    expect(screen.getByTestId("icon-section")).toBeTruthy();
    expect(screen.getByTestId("icon-batch-hint").textContent).toContain("all 2 selected badges");

    // pick an icon — it flows into the shared workbench state
    fireEvent.click(screen.getByRole("button", { name: "curated" }));
    const search = screen.getByLabelText(/icon library/i) as HTMLInputElement;
    typeValue(search, "rust");
    const grid = await waitFor(() => {
      const g = screen.getByRole("group", { name: "Icon library" });
      if (g.querySelectorAll("button").length === 0) throw new Error("no icons yet");
      return g;
    });
    (grid.querySelectorAll("button")[0] as HTMLButtonElement).click();

    // the shareable link restores the whole batch + the icon choice
    await waitFor(() => {
      const share = screen.getByRole("button", { name: "Copy playground link" });
      const url = share.getAttribute("title")!;
      if (!/icon=/.test(url) || !/variants=c09-01%2Cc09-02/.test(url)) {
        throw new Error(`link not synced yet: ${url}`);
      }
      expect(url).toMatch(/variants=c09-01%2Cc09-02/);
      expect(url).toMatch(/icon=/);
    }, { timeout: 15_000 });
    expectHealthy("playground batch flow");
  });

  it("clearing the batch returns to the single-badge workbench", async () => {
    await visit("/playground?variants=c01-01,c09-02");
    await waitFor(() => screen.getByTestId("selection-stack"), { timeout: 15_000 });
    (screen.getByTestId("batch-clear") as HTMLButtonElement).click();
    await waitFor(() => expect(screen.queryByTestId("selection-stack")).toBeNull());
    expect(screen.getByLabelText("Label")).toBeTruthy();
    expect(screen.queryByTestId("batch-notice")).toBeNull();
    expectHealthy("playground batch clear");
  });
});

describe("quad badge fourth segment (?extra2=)", () => {
  it("deep-links into the quad workbench, applies the fourth segment and shares it", async () => {
    await visit("/playground?variant=c17-08");
    await waitFor(() => screen.getByRole("heading", { name: /playground/i }), { timeout: 15_000 });
    // the quad slab exposes BOTH trailing segment inputs
    expect(screen.getByLabelText("Extra (third segment)")).toBeTruthy();
    const input = screen.getByLabelText("Extra 2 (fourth segment)") as HTMLInputElement;
    typeValue(input, "mid");

    // the shareable link carries the override (and stays free of defaults)
    await waitFor(() => {
      const url = screen.getByRole("button", { name: "Copy playground link" }).getAttribute("title")!;
      if (!/extra2=mid/.test(url)) throw new Error(`link not synced yet: ${url}`);
      expect(url).toMatch(/variant=c17-08/);
      expect(url).toMatch(/extra2=mid/);
    }, { timeout: 15_000 });
    expectHealthy("playground quad flow");
  });

  it("the explore Fourth-segment filter isolates c17-08 without crashing", async () => {
    await visit("/explore");
    await waitFor(() => screen.getByText(/544 of 544 variants/), { timeout: 15_000 });
    fireEvent.click(screen.getByRole("button", { name: "Fourth segment" }));
    await waitFor(() => expect(screen.getByText(/1 of 544 variants/)).toBeTruthy());
    expectHealthy("explore quad filter");
  });
});

describe("dashboard", () => {
  it("signed-out visitors get the login wall, not a crash", async () => {
    await visit("/dashboard");
    await waitFor(() => screen.getByRole("heading", { name: /your dashboard lives here/i }));
    expect(screen.queryByTestId("demo-banner")).toBeNull();
    expectHealthy("/dashboard");
  });

  it("a signed-in session renders real-data sections and every tab is crash-free", async () => {
    stubMe({ status: 200, body: SIGNED_IN_BODY });
    await visit("/dashboard");
    await screen.findAllByText(/@octocat/, {}, { timeout: 15_000 });
    expect(screen.getByTestId("stat-requests-today").textContent).toMatch(/1[,.]?284|1\.3K|1,284/);
    expect(screen.getByTestId("data-origin").textContent).toContain("live");
    for (const tab of ["API keys", "Icons", "Themes", "Settings"]) {
      (screen.getByRole("tab", { name: tab }) as HTMLButtonElement).click();
      await waitFor(() => expect(document.querySelector("[data-testid='app-crash']")).toBeNull());
      expect(captured, `tab ${tab}`).toEqual([]);
    }
    // billing left the dashboard: the tab is gone, the plan grid lives on the
    // public /billing route now
    expect(screen.queryByRole("tab", { name: "Billing" })).toBeNull();
  });

  it("a malformed session payload (no usage, no keys) renders with plan defaults, never a crash", async () => {
    // regression lock for the dailyQuota crash: parseMe must normalize every
    // field, so even `{ user: … }` alone cannot blow up the overview meters
    stubMe({ status: 200, body: { user: { id: "1", login: "octocat", name: "The Octocat", email: null, avatarUrl: null, tier: "free", createdAt: 1_700_000_000_000 }, plan: "free" } });
    await visit("/dashboard");
    await screen.findAllByText(/@octocat/, {}, { timeout: 15_000 });
    expect(screen.getByTestId("stat-requests-today").textContent).toMatch(/0|5,000/);
    expectHealthy("/dashboard (malformed payload)");
  });
});

describe("billing (public)", () => {
  it("signed-out visitors get the plan grid + sign-in panel, never a login wall", async () => {
    await visit("/billing");
    await screen.findByText(/Your usage, invoices and subscription/i, {}, { timeout: 15_000 });
    expect(screen.getByTestId("upgrade-to-pro")).toBeTruthy();
    expect(screen.queryByText(/your dashboard lives here/i)).toBeNull();
    expectHealthy("/billing");
  });

  it("a signed-in session sees the live usage meter and current plan", async () => {
    stubMe({ status: 200, body: SIGNED_IN_BODY });
    await visit("/billing");
    await screen.findByTestId("billing-plan-pill", {}, { timeout: 15_000 });
    expect(screen.getByTestId("billing-plan-pill").textContent).toBe("free");
    expectHealthy("/billing (signed-in)");
  });
});

describe("login", () => {
  it("renders the GitHub OAuth entry when the API reports it configured", async () => {
    await visit("/login");
    await screen.findByTestId("github-login", {}, { timeout: 15_000 });
    const button = screen.getByTestId("github-login");
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(screen.queryByTestId("oauth-unconfigured")).toBeNull();
    expectHealthy("/login");
  });

  it("explains the setup in plain language when OAuth is not configured", async () => {
    stubFetch((url, init) => {
      if (url.includes("/v1/auth/me")) {
        return new Response("{}", { status: 401, headers: { "Content-Type": "application/json" } });
      }
      if (url.includes("/v1/auth/github/login") && init?.method === "HEAD") {
        return new Response("{}", { status: 404, headers: { "Content-Type": "application/json" } });
      }
      return undefined;
    });
    await visit("/login");
    await screen.findByTestId("oauth-unconfigured", {}, { timeout: 15_000 });
    expect(screen.getByTestId("github-login").hasAttribute("disabled")).toBe(true);
    // no dev-only commands leak into the user-facing explainer
    expect(document.body.textContent).not.toContain("cargo run");
    expect(document.body.textContent).not.toContain("VITE_API_BASE");
    expectHealthy("/login (unconfigured)");
  });
});

describe("explore", () => {
  /** The virtualized gallery mounts only near-viewport rows; assert the
   * registry scope through the status line, and DOM rows through frames. */
  const statusLine = () => screen.getByText(/of 544 variants/).textContent;

  it("search filters, collection pills switch, theme picker restyles — all crash-free", async () => {
    await visit("/explore");
    await waitFor(() => expect(document.querySelectorAll("[data-vx-frame]").length).toBeGreaterThan(8), { timeout: 15_000 });
    expect(statusLine()).toContain("544 of 544");

    // search narrows the gallery without crashing
    const search = screen.getByLabelText("Search variants") as HTMLInputElement;
    search.focus();
    typeValue(search, "halo");
    await waitFor(() => expect(statusLine()).not.toContain("544 of 544"));
    await waitFor(() => expect(document.querySelectorAll("[data-vx-frame]").length).toBeLessThan(60));
    expectHealthy("explore search");

    // a collection pill re-scopes the gallery
    const pill = screen.getAllByRole("button", { name: "Ticket" })[0] as HTMLButtonElement;
    pill.click();
    await waitFor(() => expect(document.querySelectorAll("[data-vx-frame]").length).toBeGreaterThan(0));
    expect(captured, "explore collection switch").toEqual([]);

    // the theme picker applies a seed preset
    const theme = screen.getByRole("group", { name: "Theme" });
    const rose = within(theme).getByRole("button", { name: /rose|pink/i }) as HTMLButtonElement;
    rose.click();
    await waitFor(() => expect(document.querySelector("[data-vx-frame]")).toBeTruthy());
    expectHealthy("explore theme");

    // back to All + clearing search restores the full registry
    const allPill = screen.getAllByRole("button", { name: "All" })[0] as HTMLButtonElement;
    allPill.click();
    typeValue(search, "");
    await waitFor(() => expect(statusLine()).toContain("544 of 544"));
    expectHealthy("explore reset");
  });

  it("selecting a card opens the detail panel with a playground hand-off", async () => {
    await visit("/explore");
    await waitFor(() => expect(document.querySelectorAll("[data-vx-frame]").length).toBeGreaterThan(8), { timeout: 15_000 });
    const cards = document.querySelectorAll<HTMLElement>("[data-vx-frame]");
    (cards[3] as HTMLElement).click();
    await waitFor(() => screen.getByRole("complementary", { name: "Variant detail" }));
    expect(screen.getByText(/Icon slot/)).toBeTruthy();
    expectHealthy("explore detail");
  });

  it("the stacked and stat collections scope to their own 16 variants", async () => {
    await visit("/explore");
    await waitFor(() => expect(document.querySelectorAll("[data-vx-frame]").length).toBeGreaterThan(8), { timeout: 15_000 });

    for (const collection of ["Stacked", "Stat"]) {
      const pill = screen.getAllByRole("button", { name: collection })[0] as HTMLButtonElement;
      pill.click();
      // the status line is the exact filter check; the virtualized grid shows
      // those 16 cards near the viewport (the detail panel adds at most one)
      await waitFor(() =>
        expect(screen.getByText(/16 of 544 variants/)).toBeTruthy(),
      );
      expect(document.querySelectorAll("[data-vx-frame]").length).toBeLessThan(30);
      expect(captured, `explore ${collection} filter`).toEqual([]);
      screen.getAllByRole("button", { name: "All" })[0].click();
      await waitFor(() =>
        expect(screen.getByText(/544 of 544 variants/)).toBeTruthy(),
      );
    }
    expectHealthy("explore stacked+stat");
  });
});

describe("playground", () => {
  it("variant combobox search, label typing and output-format tabs all stay crash-free", async () => {
    await visit("/playground");
    await waitFor(() => screen.getByRole("heading", { name: /playground/i }), { timeout: 15_000 });

    // the variant picker is a searchable combobox: type → pick → applied
    const variantInput = screen.getByRole("combobox", { name: /variant/i }) as HTMLInputElement;
    expect(variantInput.value).toBeTruthy();
    typeValue(variantInput, "c29");
    const option = await waitFor(() => {
      const hit = screen
        .getAllByRole("option")
        .find((o) => o.id.endsWith("c29-01") || (o as HTMLElement).textContent?.startsWith("c29-01"));
      if (!hit) throw new Error("c29-01 option not listed yet");
      return hit as HTMLElement;
    });
    option.click();
    await waitFor(() => expect(variantInput.value).toContain("c29-01"));
    expectHealthy("playground variant");

    // typing a label updates the preview without a crash
    const labelInput = screen.getByLabelText(/^label$/i) as HTMLInputElement;
    typeValue(labelInput, "deploy");
    await waitFor(() => expect(document.body.textContent).toContain("deploy"));
    expectHealthy("playground label");

    // output format chips are aria-pressed toggles
    const formats = screen.getByRole("group", { name: "Output format" });
    const svgTab = within(formats).getByRole("button", { name: /svg/i }) as HTMLButtonElement;
    svgTab.click();
    await waitFor(() => expect(svgTab.getAttribute("aria-pressed")).toBe("true"));
    expectHealthy("playground format");
  });
});

describe("docs", () => {
  it("sidebar navigation and code blocks render highlighted with no leaked fences", async () => {
    await visit("/docs");
    await waitFor(() => screen.getByRole("heading", { name: /api documentation/i }), { timeout: 15_000 });
    await waitFor(
      () => expect(document.querySelectorAll("figure").length).toBeGreaterThan(5),
      { timeout: 15_000 },
    );
    expect(document.body.textContent).not.toContain("```");
    // sidebar links are anchors into the same page
    const links = screen.getAllByRole("link", { name: /authentication/i });
    expect(links.length).toBeGreaterThan(0);
    expectHealthy("/docs");
  });
});

describe("navigation", () => {
  it("clicks move between routes without reloads or errors", async () => {
    await visit("/");
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    (nav.getByRole("link", { name: "Explore" }) as HTMLAnchorElement).click();
    await waitFor(() => screen.getByRole("heading", { name: /explore the registry/i }), { timeout: 15_000 });
    (nav.getByRole("link", { name: "Docs" }) as HTMLAnchorElement).click();
    await waitFor(() => screen.getByRole("heading", { name: /api documentation/i }), { timeout: 15_000 });
    (nav.getByRole("link", { name: "Playground" }) as HTMLAnchorElement).click();
    await waitFor(() => screen.getByRole("heading", { name: /playground/i }), { timeout: 15_000 });
    expectHealthy("nav clicks");
  });

  it("hides the Dashboard link from signed-out visitors (header + footer)", async () => {
    stubMe({ status: 401, body: { title: "unauthorized" } });
    await visit("/explore");
    await waitFor(() => expect(screen.getByRole("link", { name: "Log in" })).toBeTruthy(), { timeout: 15_000 });
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(nav.queryByRole("link", { name: "Dashboard" })).toBeNull();
    const footer = screen.getByRole("navigation", { name: "Footer product" });
    expect(within(footer).queryByRole("link", { name: "Dashboard" })).toBeNull();
    // the public surface is all still there
    expect(nav.getByRole("link", { name: "Explore" })).toBeTruthy();
    expect(nav.getByRole("link", { name: "Docs" })).toBeTruthy();
    expectHealthy("signed-out nav");
  });

  it("shows the Dashboard link once a session is live", async () => {
    stubMe({ status: 200, body: SIGNED_IN_BODY });
    await visit("/explore");
    await waitFor(() => expect(screen.getByTestId("nav-session")).toBeTruthy(), { timeout: 15_000 });
    const nav = within(screen.getByRole("navigation", { name: "Primary" }));
    expect(nav.getByRole("link", { name: "Dashboard" })).toBeTruthy();
    const footer = screen.getByRole("navigation", { name: "Footer product" });
    expect(within(footer).getByRole("link", { name: "Dashboard" })).toBeTruthy();
    expectHealthy("signed-in nav");
  });

  it("the 404 page offers working exits", async () => {
    await visit("/definitely-not-a-route");
    expect(screen.getByRole("heading", { name: /404 — off the registry/i })).toBeTruthy();
    // the designed page: oversized 404 + a real broken-badge motif
    expect(document.body.textContent).toContain("not found");
    const link = screen.getAllByRole("link", { name: "Explore variants" })[0] as HTMLAnchorElement;
    link.click();
    await waitFor(() => screen.getByRole("heading", { name: /explore the registry/i }), { timeout: 15_000 });
    expectHealthy("404 exit");
  });
});

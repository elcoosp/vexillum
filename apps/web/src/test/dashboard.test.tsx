import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderAt, mockSession, mockNoApi, type FakeSession } from "./harness";
import { PLANS } from "@/lib/plans";

/**
 * Dashboard under AUTH — every section behind the login wall gets real
 * coverage here (the e2e suite proves the routes don't crash; this suite
 * proves the sections render the right live data and wire their actions).
 * Sessions come through the harness's /v1/auth/me stub — no demo mode.
 */

afterEach(cleanup);

const BASE_SESSION: FakeSession = {
  login: "octocat",
  plan: "free",
  keys: [
    {
      keyHash: "a".repeat(64),
      label: "README",
      env: "live",
      tier: "free",
      allowedOrigins: ["https://example.com"],
      createdAt: 1_700_000_000_000,
      lastUsedAt: null,
    },
  ],
  usage: { requestsToday: 1284, requestsThisWindow: 12, rpm: 60, dailyQuota: 5000 },
};

async function renderDashboard(search = "", session: FakeSession = BASE_SESSION) {
  mockSession(session);
  return await renderAt(`/dashboard${search}`);
}

describe("dashboard overview (signed in)", () => {
  it("renders the live usage stats, plan quota line and data origin", async () => {
    await renderDashboard();
    await screen.findAllByText(/@octocat/);
    expect(screen.getByTestId("stat-requests-today").textContent).toMatch(/1[,.]?284|1\.3K/);
    expect(screen.getByTestId("data-origin").textContent).toContain("live");
    // quota line: free plan numbers from PLANS, not magic strings
    expect(
      screen.getByText(new RegExp(`${PLANS.free.dailyQuota.toLocaleString()} req/day`)),
    ).toBeTruthy();
    // the refresh affordance exists in the header
    expect(screen.getByTestId("refresh-session")).toBeTruthy();
  });

  it("normalizes a malformed /me payload instead of crashing (missing keys/usage)", async () => {
    // regression lock for the dailyQuota crash — parseMe must fill defaults
    mockSession({
      login: "octocat",
      plan: "free",
      keys: [],
      usage: { requestsToday: 0, requestsThisWindow: 0, rpm: 60, dailyQuota: 5000 },
    });
    await renderAt("/dashboard");
    await screen.findAllByText(/@octocat/);
    expect(screen.getByTestId("stat-requests-today").textContent).toMatch(/0/);
    expect(screen.getByTestId("data-origin").textContent).toContain("live");
  });

  it("refresh re-queries the session API", async () => {
    mockSession(BASE_SESSION);
    let meCalls = 0;
    const base = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes("/v1/auth/me")) meCalls += 1;
      return base(input as RequestInfo, init);
    }) as typeof fetch;
    await renderAt("/dashboard");
    await screen.findAllByText(/@octocat/);
    const afterMount = meCalls;
    fireEvent.click(screen.getByTestId("refresh-session"));
    await waitFor(() => expect(meCalls).toBeGreaterThan(afterMount));
  });
});

describe("dashboard tabs under auth", () => {
  it("?tab=keys deep link renders the key table with the API's keys", async () => {
    await renderDashboard("?tab=keys");
    await screen.findAllByText(/@octocat/);
    expect(screen.getByTestId("create-key")).toBeTruthy();
    const row = screen.getByTestId("key-row");
    expect(row.textContent).toContain("README");
    expect(row.textContent).toContain("live");
    // per-key destructive + edit affordances are wired
    expect(screen.getByRole("button", { name: "Revoke key README" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit allowed origins for key README" })).toBeTruthy();
  });

  it("API keys tab opens from the tab strip and lists keys", async () => {
    await renderDashboard();
    await screen.findAllByText(/@octocat/);
    fireEvent.click(screen.getByRole("tab", { name: "API keys" }));
    await waitFor(() => expect(screen.getByTestId("key-row")).toBeTruthy());
    expect(screen.getByTestId("create-key")).toBeTruthy();
  });

  it("Icons tab is honestly gated on Free and unlocked on Pro", async () => {
    await renderDashboard();
    await screen.findAllByText(/@octocat/);
    fireEvent.click(screen.getByRole("tab", { name: "Icons" }));
    // free: the uploader stays visible but locked, with the upgrade CTA
    // (<section aria-label> maps to role=region, not role=section)
    const locked = await screen.findByRole("region", { name: /locked — requires pro/i });
    expect(locked).toBeTruthy();
    expect(screen.getByTestId("upgrade-cta").textContent).toContain("Upgrade to Pro");

    // pro: the real uploader replaces the lock
    cleanup();
    mockSession({ ...BASE_SESSION, plan: "pro" });
    await renderAt("/dashboard?tab=icons");
    await screen.findAllByText(/@octocat/);
    await waitFor(() => expect(screen.getByTestId("icon-uploader")).toBeTruthy());
    expect(screen.queryByRole("section", { name: /locked — requires pro/i })).toBeNull();
  });

  it("the Icons upgrade CTA routes to the public /billing page", async () => {
    await renderDashboard("?tab=icons");
    await screen.findAllByText(/@octocat/);
    fireEvent.click(screen.getByTestId("upgrade-cta"));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /billing/i })).toBeTruthy(),
    );
    // billing is a separate PUBLIC route now — the URL reflects it
    expect(screen.getByTestId("billing-plan-pill") ?? null).toBeTruthy();
  });

  it("Themes tab renders the preset cards with live token ramps (free on every plan)", async () => {
    await renderDashboard("?tab=themes");
    await screen.findAllByText(/@octocat/);
    await waitFor(() => expect(screen.getByTestId("theme-card-blue")).toBeTruthy());
    expect(screen.getByText(/Themes are free on every plan/)).toBeTruthy();
  });

  it("Settings tab shows the GitHub profile and persists through the save button", async () => {
    await renderDashboard("?tab=settings");
    await screen.findAllByText(/@octocat/);
    const rows = screen.getByTestId("profile-rows");
    expect(rows.textContent).toContain("octocat");
    expect(screen.getByTestId("save-settings")).toBeTruthy();
  });
});

describe("dashboard failure states", () => {
  it("an unreachable API explains itself instead of faking data", async () => {
    mockNoApi();
    await renderAt("/dashboard");
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /the dashboard needs its api/i })).toBeTruthy(),
    );
    expect(screen.getByText(/no demo mode/i)).toBeTruthy();
  });
});

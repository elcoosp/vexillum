import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { SessionProvider, normalizePlan, maskKey, useSession } from "@/lib/session";

/**
 * The session store is the dashboard's only data source — no demo simulator
 * exists anymore. These tests pin the load-bearing behaviors: the stale-tier
 * crash guard (the reported `dailyQuota` TypeError), the signed-out wall, the
 * unreachable-API state, and live session parsing.
 */

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
});

describe("normalizePlan — the dailyQuota crash guard", () => {
  it("maps unknown and legacy tiers to null so PLANS[plan] is never undefined", () => {
    expect(normalizePlan("free")).toBe("free");
    expect(normalizePlan("pro")).toBe("pro");
    // the old simulator persisted 'team' — reading PLANS['team'].dailyQuota crashed
    expect(normalizePlan("team")).toBeNull();
    expect(normalizePlan("vip")).toBeNull();
    expect(normalizePlan(undefined)).toBeNull();
    expect(normalizePlan(null)).toBeNull();
  });

  it("maskKey never exposes more than head+tail", () => {
    expect(maskKey(null)).toBe("vx_live_••••••••••••••••");
    expect(maskKey("vx_live_ABCDEFGHIJKLMNOPQRSTUVWX")).toMatch(/^vx_live_•{16}UVWX$/);
  });
});

function Probe() {
  const session = useSession();
  return (
    <div>
      <p data-testid="status">{session.status}</p>
      <p data-testid="plan">{session.plan ?? "none"}</p>
      <p data-testid="quota">{session.usage?.dailyQuota ?? "n/a"}</p>
      <p data-testid="keys">{session.keys.length}</p>
    </div>
  );
}

function mountAt(_path = "/dashboard") {
  // the session provider is router-independent — mount the probe directly
  return render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );
}

describe("SessionProvider against the real API contract", () => {
  it("signed-out: 401 from /v1/auth/me closes the wall", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 401 })),
    );
    mountAt();
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signedOut"));
    expect(screen.getByTestId("plan").textContent).toBe("none");
  });

  it("signed-in: parses user, keys, usage — never a crash on odd shapes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            user: { id: "1", login: "octocat", tier: "pro", createdAt: 1 },
            plan: "pro",
            keys: [
              {
                keyHash: "a".repeat(64),
                label: "prod",
                env: "live",
                allowedOrigins: ["github.com"],
                createdAt: 2,
                lastUsedAt: 3,
              },
              // malformed entry (no keyHash) is dropped, not fatal
              { label: "broken" },
            ],
            usage: { requestsToday: 42, requestsThisWindow: 1, rpm: 600, dailyQuota: 100000 },
          }),
          { status: 200 },
        ),
      ),
    );
    mountAt();
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signedIn"));
    expect(screen.getByTestId("plan").textContent).toBe("pro");
    expect(screen.getByTestId("quota").textContent).toBe("100000");
    expect(screen.getByTestId("keys").textContent).toBe("1");
  });

  it("a stale unknown tier from the server degrades to free instead of crashing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            user: { id: "1", login: "legacy", tier: "team" },
            plan: "team",
            usage: { requestsToday: 0 },
          }),
          { status: 200 },
        ),
      ),
    );
    mountAt();
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signedIn"));
    expect(screen.getByTestId("plan").textContent).toBe("free");
    expect(screen.getByTestId("quota").textContent).toBe("5000");
  });

  it("unreachable API renders 'unavailable' with an actionable reason", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );
    mountAt();
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("unavailable"));
  });
});

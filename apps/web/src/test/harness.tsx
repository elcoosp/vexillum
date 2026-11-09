import { render } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";
import { createMemoryHistory } from "@tanstack/react-router";
import { SessionProvider } from "@/lib/session";
import { createAppRouter } from "@/router";

/**
 * Test harness: the real session provider + real route tree, mounted on an
 * in-memory history at `path`. `/v1/auth/me` is pre-stubbed signed-out so
 * pages render deterministically; tests that need a live session re-stub
 * fetch via `mockSession`. Await the returned promise — TanStack Router
 * resolves its initial matches asynchronously.
 */
export async function renderAt(path: string) {
  ensureDefaultSessionStub();
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  await router.load();
  return render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
}

export const SIGNED_OUT_ME = { status: 401, body: { title: "unauthorized" } };

export interface FakeSession {
  login?: string;
  plan?: "free" | "pro";
  keys?: Array<Record<string, unknown>>;
  usage?: Record<string, number>;
}

let fetchStubbed = false;

/** Installs a fetch stub that answers /v1/auth/me with a live session. */
export function mockSession(session: FakeSession = {}): void {
  fetchStubbed = true;
  const body = {
    user: {
      id: "17583541",
      login: session.login ?? "octocat",
      name: "The Octocat",
      email: "octo@example.dev",
      avatarUrl: null,
      tier: session.plan ?? "free",
      createdAt: 1_700_000_000_000,
    },
    plan: session.plan ?? "free",
    keys: session.keys ?? [],
    usage: session.usage ?? {
      requestsToday: 1284,
      requestsThisWindow: 12,
      rpm: 60,
      dailyQuota: 5000,
    },
  };
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/v1/auth/me")) {
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.includes("/v1/auth/github/login")) {
      return new Response(null, { status: 302 });
    }
    return new Response("{}", { status: 404, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

/** Installs a fetch stub that reports the session API as unreachable. */
export function mockNoApi(): void {
  fetchStubbed = true;
  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;
}

/** Default: a signed-out session (401) so pages render their visitor states. */
function ensureDefaultSessionStub(): void {
  if (fetchStubbed) return;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/v1/auth/me")) {
      return new Response("{}", { status: 401, headers: { "Content-Type": "application/json" } });
    }
    if (url.includes("/v1/auth/github/login")) {
      return new Response(null, { status: 302 });
    }
    return new Response("{}", { status: 404, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
}

export { cleanup } from "@testing-library/react";

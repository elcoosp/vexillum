/**
 * Real session store for the Vexillum dashboard.
 *
 * The dashboard is backed by the live API only — there is no demo simulator.
 * `GET /v1/auth/me` (HttpOnly `vx_session` cookie, set by the GitHub OAuth
 * callback) returns the signed-in user, their owned API keys and live usage
 * aggregates. Signed-out visitors hit the login wall; an unreachable or
 * unconfigured API surfaces as `status: "unavailable"` so the UI can explain
 * what to run instead of faking numbers.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Plan } from "@/lib/plans";
import { API_BASE } from "@/lib/api";

export interface SessionUser {
  id: string;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  tier: Plan;
  createdAt: number;
}

export interface SessionKey {
  /** first 12 hash chars — display identity */
  id: string;
  /** full SHA-256 hex; the dashboard needs it for owner-scoped mutations */
  keyHash: string;
  label: string;
  env: "live" | "test";
  tier: Plan;
  allowedOrigins: string[];
  createdAt: number;
  lastUsedAt: number | null;
}

export interface SessionUsage {
  requestsToday: number;
  requestsThisWindow: number;
  rpm: number;
  dailyQuota: number;
}

export type SessionStatus =
  | /** checking the cookie */ "loading"
  | /** live session from /v1/auth/me */ "signedIn"
  | /** no valid session — login wall */ "signedOut"
  | /** API unreachable or not configured */ "unavailable";

export interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  keys: SessionKey[];
  usage: SessionUsage | null;
  /** message accompanying "unavailable" (why real data isn't reachable) */
  unavailableReason: string | null;
}

export interface SessionApi extends SessionState {
  /** null when signed out; unknown tiers normalize to free (never crashes) */
  plan: Plan | null;
  isSignedIn: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  /** mutates a key in the local cache after a successful API call */
  patchKey: (keyHash: string, patch: Partial<SessionKey>) => void;
  removeKey: (keyHash: string) => void;
  upsertKey: (key: SessionKey) => void;
}

/** Masks a plaintext key the way the API dashboard shows it after reveal. */
export function maskKey(plaintext: string | null): string {
  if (!plaintext) return "vx_live_••••••••••••••••";
  const head = plaintext.slice(0, 8);
  return `${head}${"•".repeat(16)}${plaintext.slice(-4)}`;
}

/** Normalizes any plan-ish value into the two-plan model — the crash guard. */
export function normalizePlan(value: unknown): Plan | null {
  return value === "pro" ? "pro" : value === "free" ? "free" : null;
}

interface MePayload {
  user?: {
    id?: string;
    login?: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    tier?: string;
    createdAt?: number;
  };
  plan?: string;
  keys?: Array<{
    id?: string;
    keyHash?: string;
    label?: string;
    env?: string;
    tier?: string;
    allowedOrigins?: string[];
    createdAt?: number;
    lastUsedAt?: number | null;
  }>;
  usage?: Partial<SessionUsage>;
}

function parseMe(json: MePayload): { user: SessionUser; keys: SessionKey[]; usage: SessionUsage } | null {
  const u = json.user;
  if (!u?.id || !u?.login) return null;
  const plan = normalizePlan(json.plan ?? u.tier) ?? "free";
  const user: SessionUser = {
    id: u.id,
    login: u.login,
    name: u.name ?? null,
    email: u.email ?? null,
    avatarUrl: u.avatarUrl ?? null,
    tier: plan,
    createdAt: u.createdAt ?? 0,
  };
  const keys: SessionKey[] = (json.keys ?? [])
    .filter((k) => typeof k.keyHash === "string" && k.keyHash.length > 0)
    .map((k) => ({
      id: k.id ?? k.keyHash!.slice(0, 12),
      keyHash: k.keyHash!,
      label: k.label ?? "key",
      env: k.env === "test" ? "test" : "live",
      tier: normalizePlan(k.tier) ?? plan,
      allowedOrigins: Array.isArray(k.allowedOrigins) ? k.allowedOrigins : [],
      createdAt: k.createdAt ?? 0,
      lastUsedAt: k.lastUsedAt ?? null,
    }));
  const usage: SessionUsage = {
    requestsToday: json.usage?.requestsToday ?? 0,
    requestsThisWindow: json.usage?.requestsThisWindow ?? 0,
    rpm: json.usage?.rpm ?? 60,
    dailyQuota: json.usage?.dailyQuota ?? 5_000,
  };
  return { user, keys, usage };
}

const SessionContext = createContext<SessionApi | null>(null);

const EMPTY: SessionState = {
  status: "loading",
  user: null,
  keys: [],
  usage: null,
  unavailableReason: null,
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(EMPTY);

  const refresh = useCallback(async () => {
    // Same-origin by default (the dev server proxies /v1 to the API) or
    // VITE_API_BASE when the dashboard is hosted away from the API origin.
    try {
      const res = await fetch(`${API_BASE}/v1/auth/me`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (res.status === 401) {
        setState({ ...EMPTY, status: "signedOut" });
        return;
      }
      if (res.status === 404) {
        setState({
          ...EMPTY,
          status: "unavailable",
          unavailableReason:
            "The dashboard service isn't available on this deployment right now. Rendering badges still works everywhere — check back soon.",
        });
        return;
      }
      if (!res.ok) {
        setState({
          ...EMPTY,
          status: "unavailable",
          unavailableReason: `The dashboard service answered with an error (HTTP ${res.status}). It may be restarting — try again in a moment.`,
        });
        return;
      }
      const parsed = parseMe(await res.json());
      if (!parsed) {
        setState({ ...EMPTY, status: "unavailable", unavailableReason: "Malformed /v1/auth/me payload." });
        return;
      }
      setState({ status: "signedIn", ...parsed, unavailableReason: null });
    } catch {
      setState({
        ...EMPTY,
        status: "unavailable",
        unavailableReason:
          "We couldn't reach the dashboard service. It may be down or unreachable from your network — try again in a moment.",
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/v1/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // the cookie is cleared client-side regardless
    }
    setState({ ...EMPTY, status: "signedOut" });
  }, []);

  const patchKey = useCallback((keyHash: string, patch: Partial<SessionKey>) => {
    setState((prev) => ({
      ...prev,
      keys: prev.keys.map((k) => (k.keyHash === keyHash ? { ...k, ...patch } : k)),
    }));
  }, []);

  const removeKey = useCallback((keyHash: string) => {
    setState((prev) => ({ ...prev, keys: prev.keys.filter((k) => k.keyHash !== keyHash) }));
  }, []);

  const upsertKey = useCallback((key: SessionKey) => {
    setState((prev) => ({
      ...prev,
      keys: [key, ...prev.keys.filter((k) => k.keyHash !== key.keyHash)],
    }));
  }, []);

  const api = useMemo<SessionApi>(
    () => ({
      ...state,
      plan: state.user ? (normalizePlan(state.user.tier) ?? "free") : null,
      isSignedIn: state.status === "signedIn" && state.user !== null,
      refresh,
      signOut,
      patchKey,
      removeKey,
      upsertKey,
    }),
    [state, refresh, signOut, patchKey, removeKey, upsertKey],
  );

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}

/** URL of the API's GitHub authorize route (top-level navigation, not fetch). */
export function githubLoginUrl(): string {
  return `${API_BASE || ""}/v1/auth/github/login`;
}

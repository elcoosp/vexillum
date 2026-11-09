import { useState } from "react";
import { Globe2, KeyRound, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { CopyButton } from "@/components/CopyButton";
import { maskKey, useSession, type SessionKey } from "@/lib/session";
import { API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";

function formatDate(ts: number | null): string {
  if (!ts) return "never";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Normalizes a user-typed origin to `host[:port]`: strips scheme, path,
 * query and whitespace so entries compare cleanly against the request's
 * Origin/Referer host server-side. Returns null for unparsable input.
 */
export function normalizeOrigin(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  const host = v.replace(/^https?:\/\//, "").replace(/^[a-z0-9.+-]+:\/\//, "").split(/[/?#]/)[0];
  if (!/^[a-z0-9.-]+(:[0-9]{1,5})?$/.test(host) || !host.includes(".")) return null;
  return host;
}

type CreateResult = { key: SessionKey; plaintext: string };

/**
 * API keys — fully wired to the live API: create (POST /v1/account/keys),
 * reveal-once, revoke (DELETE /v1/account/keys/:hash) and pin origins
 * (PUT /v1/account/keys/:hash/origins). Every call rides the session cookie.
 */
export function KeysSection() {
  const session = useSession();
  const [label, setLabel] = useState("");
  const [env, setEnv] = useState<"live" | "test">("live");
  const [revealed, setRevealed] = useState<CreateResult | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<SessionKey | null>(null);
  const [editingOrigins, setEditingOrigins] = useState<SessionKey | null>(null);
  const [originsDraft, setOriginsDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/v1/account/keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || (env === "live" ? "production" : "sandbox"), env }),
      });
      if (!res.ok) {
        const problem = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? `the API rejected the request (${res.status})`);
      }
      const data = (await res.json()) as CreateResult;
      session.upsertKey(data.key);
      setLabel("");
      setRevealed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Creating the key failed.");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (key: SessionKey) => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/v1/account/keys/${key.keyHash}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok || res.status === 404) session.removeKey(key.keyHash);
      else throw new Error(`revoke failed (${res.status})`);
      setConfirmRevoke(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revoking the key failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveOrigins = async () => {
    if (!editingOrigins) return;
    const origins = Array.from(
      new Set(
        originsDraft
          .split("\n")
          .map(normalizeOrigin)
          .filter((h): h is string => h !== null),
      ),
    );
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/v1/account/keys/${editingOrigins.keyHash}/origins`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origins }),
      });
      if (!res.ok) {
        const problem = await res.json().catch(() => null);
        throw new Error(problem?.detail ?? `the API rejected the list (${res.status})`);
      }
      const updated = (await res.json()) as SessionKey;
      session.patchKey(updated.keyHash, { allowedOrigins: updated.allowedOrigins });
      setEditingOrigins(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saving origins failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Plus className="h-4 w-4 text-accent" aria-hidden /> Create a key
        </h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
          <div>
            <Label htmlFor="key-label">Label</Label>
            <Input
              id="key-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="acme-ci"
              maxLength={40}
            />
          </div>
          <div>
            <Label htmlFor="key-env">Environment</Label>
            <Select id="key-env" value={env} onChange={(e) => setEnv(e.target.value as "live" | "test")}>
              <option value="live">vx_live_ (production)</option>
              <option value="test">vx_test_ (sandbox)</option>
            </Select>
          </div>
          <Button onClick={() => void create()} disabled={busy} data-testid="create-key">
            Generate key
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Keys are hashed server-side (SHA-256) — the plaintext is shown once, right here. A key is
          never required to render a badge: it only unlocks Pro quotas, animated formats and
          metering, so it never needs to live inside a README.
        </p>
        {error && (
          <p role="alert" className="mt-2 text-xs font-medium text-danger" data-testid="keys-error">
            {error}
          </p>
        )}
      </div>

      <div className="vx-scroll-light overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">API keys</caption>
          <thead className="bg-muted/50 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-2.5">Label</th>
              <th scope="col" className="px-4 py-2.5">Key</th>
              <th scope="col" className="px-4 py-2.5">Created</th>
              <th scope="col" className="px-4 py-2.5">Last used</th>
              <th scope="col" className="px-4 py-2.5">Allowed origins</th>
              <th scope="col" className="px-4 py-2.5"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {session.keys.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No keys yet — generate your first vx_live_ key above.
                </td>
              </tr>
            )}
            {session.keys.map((k) => {
              return (
                <tr key={k.keyHash} className="border-t border-border" data-testid="key-row">
                  <td className="px-4 py-2.5 font-medium">{k.label}</td>
                  <td className="px-4 py-2.5 font-mono">
                    <span className="mr-2 inline-flex items-center rounded border border-border px-1 py-0.5 text-[9px] uppercase">
                      {k.env}
                    </span>
                    {maskKey(null).slice(0, 8)}…{k.keyHash.slice(-4)}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(k.createdAt)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(k.lastUsedAt)}</td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingOrigins(k);
                        setOriginsDraft(k.allowedOrigins.join("\n"));
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                        k.allowedOrigins.length > 0
                          ? "border-success/30 bg-success/5 text-success hover:border-success"
                          : "border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-500",
                      )}
                      data-testid="origins-pill"
                      aria-label={`Edit allowed origins for key ${k.label}`}
                    >
                      <Globe2 className="h-3 w-3" aria-hidden />
                      {k.allowedOrigins.length > 0 ? `${k.allowedOrigins.length} pinned` : "any origin"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => setConfirmRevoke(k)}
                      aria-label={`Revoke key ${k.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Revoke
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* reveal-once */}
      <Dialog
        open={revealed !== null}
        onClose={() => setRevealed(null)}
        title="Your new API key"
        description="Copy it now — we show the plaintext exactly once, then store only the hash."
        footer={
          <Button onClick={() => setRevealed(null)} data-testid="reveal-done">
            <KeyRound className="h-4 w-4" aria-hidden /> I've stored it
          </Button>
        }
      >
        {revealed && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {revealed.key.label} · {revealed.key.env === "live" ? "production quotas" : "sandbox"}
            </p>
            <code className="block break-all rounded-md bg-zinc-950 p-3 font-mono text-[11px] text-zinc-100" data-testid="revealed-key">
              {revealed.plaintext}
            </code>
            <CopyButton text={revealed.plaintext} label="Copy key" variant="default" />
          </div>
        )}
      </Dialog>

      {/* per-key origin allowlist editor */}
      <Dialog
        open={editingOrigins !== null}
        onClose={() => setEditingOrigins(null)}
        title={`Allowed origins — ${editingOrigins?.label ?? ""}`}
        description="One host per line. Keyed requests carrying an Origin/Referer outside this list are rejected with 403, so a leaked key can't be spent from someone else's site. Empty = allowed from anywhere."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingOrigins(null)}>
              Cancel
            </Button>
            <Button onClick={() => void saveOrigins()} disabled={busy} data-testid="save-origins">
              Save origins
            </Button>
          </>
        }
      >
        {editingOrigins && (
          <div className="space-y-3">
            <textarea
              className="w-full rounded-md border border-border bg-white p-3 font-mono text-[11px] leading-relaxed"
              rows={5}
              value={originsDraft}
              onChange={(e) => setOriginsDraft(e.target.value)}
              placeholder={"github.com\ngitlab.com\napp.acme.dev:8080"}
              aria-label="Allowed origins, one per line"
              data-testid="origins-input"
            />
            <p className="text-[10px] text-muted-foreground">
              Browsers send <code className="font-mono">Origin</code>/<code className="font-mono">Referer</code> headers on
              cross-site image loads, so the API can pin a key to your domains. Plain README images
              stay keyless — pinning only guards metered, keyed traffic.
            </p>
          </div>
        )}
      </Dialog>

      {/* revoke confirm */}
      <Dialog
        open={confirmRevoke !== null}
        onClose={() => setConfirmRevoke(null)}
        title={`Revoke “${confirmRevoke?.label ?? ""}”?`}
        description="Embeds using this key start failing immediately with 401 unauthorized. This cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmRevoke(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-danger text-white hover:opacity-90"
              onClick={() => confirmRevoke && void revoke(confirmRevoke)}
              disabled={busy}
              data-testid="confirm-revoke"
            >
              Revoke key
            </Button>
          </>
        }
      />
    </div>
  );
}

import { useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LockedPanel } from "@/components/LockedPanel";
import { CopyButton } from "@/components/CopyButton";
import { sanitizeSvg } from "@/lib/badge";
import { useSession } from "@/lib/session";
import { API_BASE } from "@/lib/api";
import { PLANS, type Plan } from "@/lib/plans";
import { formatDate } from "@/dashboard/format";

interface UploadRecord {
  name: string;
  hash: string;
  bytes: number;
  createdAt: number;
}

const UPLOADS_KEY = "vexillum.uploads.v1";

/**
 * Upload history lives in this browser only: the server keeps uploads
 * content-addressed (hash → svg), not per-user, so this list is a local
 * record of what THIS session uploaded. The hashes themselves are real and
 * work on any badge URL immediately.
 */
function loadUploads(): UploadRecord[] {
  try {
    const raw = localStorage.getItem(UPLOADS_KEY);
    if (raw) return JSON.parse(raw) as UploadRecord[];
  } catch {
    // fall through to empty
  }
  return [];
}

function bytes(n: number): string {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

function Uploader() {
  const session = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadRecord[]>(loadUploads);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ingest = (name: string, text: string) => {
    if (!/\.svg$/i.test(name)) {
      setError("Only .svg files are accepted (the API sanitizer rejects everything else).");
      return;
    }
    const { svg, error: sanitizeError } = sanitizeSvg(text);
    if (!svg) {
      setError(sanitizeError ?? "Rejected SVG.");
      return;
    }
    setError(null);
    setBusy(true);
    fetch(`${API_BASE}/v1/icons`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "image/svg+xml" },
      body: svg,
    })
      .then(async (res) => {
        if (!res.ok) {
          const problem = await res.json().catch(() => null);
          throw new Error(problem?.detail ?? `upload rejected (${res.status})`);
        }
        return res.json() as Promise<{ hash: string; bytes: number; reference: string }>;
      })
      .then((data) => {
        const record: UploadRecord = {
          name,
          hash: data.hash,
          bytes: data.bytes,
          createdAt: Date.now(),
        };
        const next = [record, ...uploads];
        setUploads(next);
        localStorage.setItem(UPLOADS_KEY, JSON.stringify(next));
        setLastHash(data.hash);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Upload failed.");
      })
      .finally(() => setBusy(false));
  };

  const removeLocal = (hash: string) => {
    const next = uploads.filter((u) => u.hash !== hash);
    setUploads(next);
    localStorage.setItem(UPLOADS_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-4" data-testid="icon-uploader">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload SVG icon: drag and drop or press Enter to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (!file) return;
          void file.text().then((t) => ingest(file.name, t));
        }}
        className={
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-2 focus-visible:outline-accent " +
          (dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50")
        }
      >
        <UploadCloud className="h-6 w-6 text-accent" aria-hidden />
        <p className="text-sm font-semibold">{busy ? "Uploading…" : "Drop an SVG here"}</p>
        <p className="max-w-sm text-[11px] text-muted-foreground">
          POSTed to <code className="font-mono">/v1/icons</code> with your session — sanitized
          server-side (no scripts, no event handlers), content-hashed, and referenced as{" "}
          <code className="font-mono">?icon=upload:hash</code>.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void f.text().then((t) => ingest(f.name, t));
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-danger" data-testid="upload-error">
          {error}
        </p>
      )}

      {uploads.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted/30 p-6 text-center text-xs text-muted-foreground">
          <FileUp className="mx-auto mb-1 h-4 w-4" aria-hidden />
          No uploads from this browser yet. Brand icons you upload appear here with their stable
          hash reference.
        </p>
      ) : (
        <div className="vx-scroll-light overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">Uploaded icons</caption>
            <thead className="bg-muted/50 font-semibold">
              <tr>
                <th scope="col" className="px-4 py-2.5">File</th>
                <th scope="col" className="px-4 py-2.5">Hash</th>
                <th scope="col" className="px-4 py-2.5">Size</th>
                <th scope="col" className="px-4 py-2.5">Uploaded</th>
                <th scope="col" className="px-4 py-2.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.hash} className="border-t border-border" data-testid="upload-row">
                  <td className="px-4 py-2.5 font-medium">{u.name}</td>
                  <td className="px-4 py-2.5 font-mono">{u.hash.slice(0, 12)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{bytes(u.bytes)}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="mr-1 inline-block align-middle">
                      <CopyButton text={`upload:${u.hash}`} label="Copy ref" variant="ghost" size="sm" />
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:bg-danger/10"
                      onClick={() => removeLocal(u.hash)}
                      aria-label={`Forget upload ${u.name}`}
                    >
                      Forget
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {lastHash && (
        <p className="text-[11px] text-muted-foreground" data-testid="upload-success">
          Stored server-side as <code className="font-mono">upload:{lastHash}</code> — usable on any
          badge URL immediately.
        </p>
      )}
      <p className="text-[10px] text-muted-foreground">
        Uploads are content-addressed, not billed to your quota. This list is a local record —
        {session.user?.login ? ` signed in as @${session.user.login}` : ""}, your hashes keep working
        from any browser that knows them.
      </p>
    </div>
  );
}

/** Icon uploads — Pro only. Free sees the (blurred) panel + upgrade CTA. */
export function IconsSection({ plan, onUpgrade }: { plan: Plan; onUpgrade: () => void }) {
  const gated = !PLANS[plan].iconUploads;
  if (gated) {
    return (
      <LockedPanel
        title="SVG icon uploads are a Pro feature"
        description="Free accounts use the 3,467-brand Simple Icons catalog. Upload your own brand SVGs on Pro — sanitized, hashed, and referenceable as upload:{hash}."
        requiredPlan="pro"
        onUpgrade={onUpgrade}
        className="min-h-64"
      >
        <div className="p-6">
          <div className="h-24 rounded-md border border-dashed border-border" />
          <div className="mt-3 space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-8 rounded-md border border-border bg-white" />
            ))}
          </div>
        </div>
      </LockedPanel>
    );
  }
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Icon uploads</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Brand SVGs are sanitized (vexillum-icons sanitizer contract), content-hashed server-side,
          and permanently referenceable. Available on Pro.
        </p>
      </div>
      <Uploader />
    </div>
  );
}

/**
 * Dev playground (spec §2): renders a badge through the real DOM and — when
 * the WASM engine is available — through vexillum's own renderer, side by side.
 */
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { registry } from "@vexillum/badges";

const VARIANT = "c01-01";

function App() {
  const [wasmStatus, setWasmStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [wasmPngUrl, setWasmPngUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setWasmStatus("loading");
      try {
        // Optional WASM path: same engine as the Rust render service.
        const mod = await import("@takumi-rs/wasm");
        const html = buildSampleHtml();
        // API differs across wasm builds; probe for the html render entry.
        const renderFn =
          (mod as unknown as Record<string, unknown>).render ??
          (mod as unknown as Record<string, unknown>).renderHtml ??
          (mod as unknown as Record<string, unknown>).default;
        if (typeof renderFn !== "function") throw new Error("no render entry");
        const result = await (renderFn as (h: string, o?: unknown) => Promise<Uint8Array | string>)(html);
        if (cancelled) return;
        if (result instanceof Uint8Array) {
          setWasmPngUrl(URL.createObjectURL(new Blob([result as BlobPart], { type: "image/png" })));
        } else {
          setWasmPngUrl(`data:image/svg+xml;base64,${btoa(result as string)}`);
        }
        setWasmStatus("ready");
      } catch {
        if (!cancelled) setWasmStatus("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const Component = registry[VARIANT];
  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 40, display: "grid", gap: 24 }}>
      <h1 style={{ fontSize: 20, margin: 0 }}>Vexillum Playground — {VARIANT}</h1>
      <section>
        <h2 style={{ fontSize: 13, color: "#6b7280" }}>Browser DOM</h2>
        <Component label="build" value="passing" />
      </section>
      <section>
        <h2 style={{ fontSize: 13, color: "#6b7280" }}>
          vexillum WASM {wasmStatus === "ready" ? "" : `(${wasmStatus})`}
        </h2>
        {wasmPngUrl ? <img src={wasmPngUrl} alt="vexillum wasm render" /> : <p style={{ fontSize: 12, color: "#9ca3af" }}>
          WASM render unavailable in this build — run the API server for the authoritative engine.
        </p>}
      </section>
    </main>
  );
}

function buildSampleHtml(): string {
  return `<!DOCTYPE html><html><body style="margin:0;background:transparent">
    <div style="display:inline-flex;align-items:center;height:24px;border-radius:6px;font-family:Inter,sans-serif">
      <span style="background:#f3f4f6;color:#374151;padding:0 10px;font-size:12px;font-weight:600">build</span>
      <span style="background:#111827;color:#fff;padding:0 12px;font-size:12px;font-weight:700">passing</span>
    </div>
  </body></html>`;
}

createRoot(document.getElementById("root")!).render(<App />);

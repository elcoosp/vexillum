import { useEffect, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

/** Languages the docs actually use — keeps the lazy shiki chunk focused. */
export type CodeLanguage = "bash" | "http" | "json" | "typescript" | "html" | "markdown";

/** one-dark-pro's canvas — the container matches it so highlighting blends. */
const SHIKI_BG = "#282c34";

/** Module-level cache: repeated blocks (and HMR) highlight exactly once. */
const cache = new Map<string, string>();

/**
 * Shiki is code-split behind a dynamic `import()` — the ~1 MB grammar bundle
 * only downloads when a code block first renders, and never for the landing
 * hero's instant paint (the plain-text fallback shows immediately). The
 * module promise is memoized so concurrent blocks share one load.
 */
let shikiPromise: Promise<typeof import("shiki")> | null = null;
function loadShiki() {
  shikiPromise ??= import("shiki");
  return shikiPromise;
}

async function highlight(code: string, lang: CodeLanguage): Promise<string> {
  const key = `${lang}\u0000${code}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const { codeToHtml } = await loadShiki();
  const html = await codeToHtml(code, { lang, theme: "one-dark-pro" });
  cache.set(key, html);
  return html;
}

/**
 * Docs code block — Shiki-highlighted (async, cached, plain-text fallback
 * while the chunk loads) with a chrome bar: language chip, title, copy.
 * Visual contract with the rest of the docs: same radius/border family,
 * dark canvas, and a slim dark horizontal scrollbar that hugs the bottom
 * edge only when a line truly overflows (see `.vx-scroll` in index.css).
 *
 * Scroll ownership: ONLY the outer `.vx-scroll` div may scroll. Shiki emits
 * `<pre style="overflow-x:auto">` — left alone, the bar mounts on the pre
 * ABOVE its own padding-bottom, floating mid-block (reported on the landing
 * markdown card). `[&_pre]:overflow-visible!` beats that inline style, the
 * long line then overflows the (padding-less) wrapper, and the bar renders
 * flush with the card's bottom edge.
 *
 * Vertical stretch: grids stretch sibling cards to the tallest one, so the
 * figure is a flex column and the scroll div is `flex-1 min-h-0` — without
 * it the div keeps its content height, the bar lands right after the last
 * line and a dead band of canvas shows below it (reported on the landing
 * bash/markdown cards, 2026-10-30). With the stretch the bar is pinned to
 * the card's bottom edge no matter how short the snippet is.
 */
export function CodeBlock({
  title,
  code,
  language = "bash",
  className,
  maxHeight,
  "data-code-block": dataCodeBlock,
}: {
  title?: string;
  code: string;
  language?: CodeLanguage;
  className?: string;
  maxHeight?: number;
  "data-code-block"?: string;
}) {
  const cacheKey = `${language}\u0000${code}`;
  const [html, setHtml] = useState<string | null>(() => cache.get(cacheKey) ?? null);

  useEffect(() => {
    let alive = true;
    highlight(code, language)
      .then((out) => {
        if (alive) setHtml(out);
      })
      .catch(() => {
        // highlighter failure keeps the plain fallback readable
      });
    return () => {
      alive = false;
    };
  }, [code, language]);

  return (
    <figure
      className={cn("flex flex-col overflow-hidden rounded-lg border border-white/10 shadow-sm", className)}
      style={{ background: SHIKI_BG }}
      data-code-block={dataCodeBlock ?? title ?? language}
    >
      <figcaption className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-300">
            {language}
          </span>
          <span className="truncate font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            {title ?? language}
          </span>
        </span>
        <CopyButton text={code} variant="ghost" size="sm" className="text-zinc-300 hover:bg-white/10 hover:text-white" />
      </figcaption>
      {html ? (
        <div
          className="vx-scroll min-h-0 flex-1 overflow-auto [&_pre]:m-0 [&_pre]:overflow-visible! [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[12px] [&_pre]:leading-relaxed [&_code]:bg-transparent! [&_code]:p-0! [&_code]:whitespace-pre!"
          style={maxHeight ? { maxHeight } : undefined}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div
          className="vx-scroll min-h-0 flex-1 overflow-auto"
          style={maxHeight ? { maxHeight } : undefined}
        >
          <pre className="p-3 font-mono text-[12px] leading-relaxed text-zinc-100">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </figure>
  );
}

import { Link } from "@tanstack/react-router";
import { Compass, FlaskConical, Home, Search } from "lucide-react";
import { BadgeFrame } from "@/components/BadgeFrame";
import { renderVariant, variantById } from "@/lib/badge";
import { cn } from "@/lib/utils";

/**
 * 404 — "off the registry". The missing route is treated as a first-class
 * page: an oversized gradient 404 with an aurora glow, a real broken-badge
 * motif (the render engine claiming the miss, on brand), drifting badge
 * decorations and three wired exits. Decoration is transform/opacity only
 * and folds away under prefers-reduced-motion (see index.css).
 */

/** Ambient badges floating behind the content — pure decoration. */
const FLOATERS: Array<{ id: string; className: string; tilt: string }> = [
  { id: "c04-02", className: "left-[6%] top-[16%] hidden sm:block", tilt: "-8deg" },
  { id: "c09-02", className: "right-[8%] top-[24%] hidden sm:block", tilt: "6deg" },
  { id: "c13-13", className: "left-[12%] bottom-[18%] hidden md:block", tilt: "5deg" },
  { id: "c12-04", className: "right-[14%] bottom-[22%] hidden md:block", tilt: "-6deg" },
];

export function NotFoundPage() {
  const lost = variantById("c01-08");
  return (
    <div className="relative overflow-hidden">
      {/* aurora glow — two blurred, slowly drifting blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="vx-aurora-blob absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div
          className="vx-aurora-blob absolute right-1/4 -bottom-24 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl"
          style={{ animationDelay: "-9s" }}
        />
      </div>

      {/* floating badge decorations */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {FLOATERS.map(({ id, className, tilt }, i) => {
          const v = variantById(id);
          if (!v) return null;
          return (
            <div
              key={id}
              className={cn("vx-float absolute opacity-30", className)}
              style={{ "--vx-tilt": tilt, animationDelay: `${i * -1.7}s` } as React.CSSProperties}
            >
              <BadgeFrame className="w-auto">{renderVariant({ variant: v, icon: "default" })}</BadgeFrame>
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto max-w-xl px-6 py-20 text-center sm:py-28">
        {/* oversized gradient 404 */}
        <p
          aria-hidden
          className="bg-gradient-to-br from-accent via-violet-500 to-accent bg-clip-text text-[7rem] font-black leading-none tracking-tighter text-transparent sm:text-[9rem]"
        >
          404
        </p>

        <h1 className="flex items-center justify-center gap-2 text-xl font-bold tracking-tight">
          <Compass className="h-5 w-5 text-accent" aria-hidden />
          404 — off the registry
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          That route isn't in the manifest — no variant, no collection, no page. The registry
          itself is intact: 544 structural variants are one click away.
        </p>

        {/* the engine files the miss as a badge — a real render, not an image */}
        {lost && (
          <div className="mt-6 flex justify-center" aria-hidden>
            <BadgeFrame className="w-auto shadow-lg shadow-accent/10">
              {renderVariant({ variant: lost, label: "404", value: "not found", icon: "default" })}
            </BadgeFrame>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            to="/explore"
            className="vx-sheen inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-transform hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Search className="h-4 w-4" aria-hidden />
            Explore variants
          </Link>
          <Link
            to="/playground"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent"
          >
            <FlaskConical className="h-4 w-4" aria-hidden />
            Playground
          </Link>
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Home className="h-4 w-4" aria-hidden />
            Home
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Or browse the{" "}
          <Link to="/docs" className="font-semibold text-accent hover:underline">
            API docs
          </Link>{" "}
          — every badge is just a URL.
        </p>
      </div>
    </div>
  );
}

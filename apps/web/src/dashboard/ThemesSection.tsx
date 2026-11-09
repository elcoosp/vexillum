import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/select";
import { BadgeFrame } from "@/components/BadgeFrame";
import { renderVariant, variantById } from "@/lib/badge";
import { contrastRatio, normalizeSeed, semanticVars, SEMANTIC_PRESETS, type SemanticThemeSpec } from "@/lib/theme";
import { valueToRgb } from "@vexillum/themes";
import type { Plan } from "@/lib/plans";

const SAMPLE_VARIANT = variantById("c01-04")!; // has label/value + icon anatomy

function ThemeCard({ name, seed }: { name: string; seed: string }) {
  const spec: SemanticThemeSpec = { seed, mode: "light" };
  const ramp = semanticVars(seed, "light") ?? {};
  return (
    <div
      className="relative rounded-lg border border-border bg-white p-4 hover:border-accent/60"
      data-testid={`theme-card-${name}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs font-semibold">{name}</p>
      </div>
      <BadgeFrame className="rounded border border-dashed border-border bg-muted/30 p-3" ariaLabel={`${name} theme sample`}>
        {renderVariant({
          variant: SAMPLE_VARIANT,
          label: "theme",
          value: name,
          icon: "default",
          semantic: spec,
        })}
      </BadgeFrame>
      <div className="mt-3 flex items-center gap-1.5" aria-hidden>
        {(["vx-a", "vx-t-heading", "vx-s-white", "vx-b-100", "vx-ok"] as const).map((tk) => (
          <span
            key={tk}
            title={`${tk}: ${ramp[tk] ?? ""}`}
            className="h-4 w-4 rounded-[4px] border border-black/10"
            style={{ background: ramp[tk] ?? "#fff" }}
          />
        ))}
        <span className="ml-auto text-[9px] text-muted-foreground">34-token ramp</span>
      </div>
      <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span className="h-2 w-2 rounded-full" style={{ background: seed }} aria-hidden />
        seed {seed}
      </p>
    </div>
  );
}

/**
 * Theme gallery — every preset renders unlocked: theming is part of the free
 * core (the API resolves the same ramp server-side for any caller). The
 * sample badge re-renders through the live component per preset, so each
 * card shows the actual themed result, not a swatch.
 */
export function ThemesSection({ plan }: { plan: Plan }) {
  const [brand, setBrand] = useState("#8b5cf6");

  // The semantic preview of an arbitrary brand color: every token derives
  // from the seed; "corrected" is whether white-on-seed (the on-accent ink)
  // is the better naive pick.
  const seedPreview = useMemo(() => {
    const seed = normalizeSeed(brand);
    if (!seed) return null;
    const ramp = semanticVars(seed, "light");
    if (!ramp) return null;
    const accent = ramp["vx-a"];
    const accentRgb = valueToRgb(accent);
    const whiteRatio = accentRgb ? contrastRatio([255, 255, 255], accentRgb) : 0;
    const darkRatio = accentRgb ? contrastRatio([17, 24, 39], accentRgb) : 0;
    const corrected = darkRatio > whiteRatio;
    return { seed, ramp, accent, corrected, sample: { background: accent, color: ramp["vx-a-on"] } };
  }, [brand]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Theme presets</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Every seed preset, resolved to the full 34-token OKLCH ramp client-side and rendered live
          on the sample badge — byte-identical to what <code className="font-mono">?theme=</code>{" "}
          returns from the API.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SEMANTIC_PRESETS.map((p) => (
          <ThemeCard key={p.name} name={p.name} seed={p.seed} />
        ))}
      </div>

      <section aria-labelledby="brand-guardrail" className="rounded-lg border border-border bg-white p-4">
        <h3 id="brand-guardrail" className="flex items-center gap-2 text-sm font-semibold">
          <Palette className="h-4 w-4 text-accent" aria-hidden /> Brand seed ramp
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          What <code className="font-mono">POST /v1/themes</code> does with a brand hex: the seed
          drives the entire OKLCH vocabulary — surfaces, borders, text, accents — coherently. Try
          any color.
        </p>
        <div className="mt-3 grid items-end gap-3 sm:grid-cols-[160px_1fr]">
          <div>
            <Label htmlFor="brand-color">Brand color</Label>
            <Input id="brand-color" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={9} className="font-mono" />
          </div>
          <div className="flex items-center gap-3">
            {seedPreview && (
              <span
                className="inline-flex h-10 items-center rounded-md px-3 font-mono text-xs"
                style={seedPreview.sample}
                data-testid="guardrail-sample"
              >
                value
              </span>
            )}
            <p className="text-[11px] text-muted-foreground" data-testid="guardrail-result">
              seed <code className="font-mono">{seedPreview?.seed ?? "—"}</code> · accent{" "}
              <code className="font-mono">{seedPreview?.accent ?? "—"}</code> ·{" "}
              <span>every token re-derives from it</span>
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          The same ramp powers <code className="font-mono">?seed=</code> on the API and{" "}
          <code className="font-mono">?mode=dark</code> flips the surfaces. See{" "}
          <a href="/docs#theming" className="font-semibold text-accent hover:underline">
            theming docs
          </a>
          .
        </p>
      </section>

      <p className="text-[11px] text-muted-foreground">
        Themes are free on every plan{plan === "pro" ? "" : " — including this one"}; the ramp is
        resolved by the SPA's typed shim and the API resolves the authoritative ramp server-side.
      </p>
    </div>
  );
}

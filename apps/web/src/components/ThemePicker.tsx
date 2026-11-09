import { SEMANTIC_PRESETS } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Semantic theme picker shared by Explore / Playground / dashboard settings.
 *
 * One seed drives the entire OKLCH vocabulary (`?seed=`), the mode flips the
 * surface ramps (`?mode=dark`). The chips show the preset seeds; the color
 * input takes any custom seed; the toggle flips dark mode. `value` is a
 * preset name or `"custom"` (with `customSeed` set).
 *
 * When `onSeed2` is provided a second color chip appears: an independent
 * VALUE-segment seed (`?seed2=`) that re-colors the value side on top of any
 * base — preset or custom. Clicking the active chip clears it.
 */
export function ThemePicker({
  value,
  customSeed,
  customSeed2,
  dark,
  onChange,
  onCustomSeed,
  onSeed2,
  onDarkChange,
  className,
}: {
  value: string;
  /** The current custom seed hex (`#…`) when value === "custom". */
  customSeed?: string;
  /** The current value-segment seed hex (`#…`), when one is picked. */
  customSeed2?: string;
  dark: boolean;
  onChange: (name: string) => void;
  onCustomSeed: (hex: string) => void;
  onSeed2?: (hex: string | null) => void;
  onDarkChange: (dark: boolean) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {SEMANTIC_PRESETS.map((p) => (
        <ThemeChip
          key={p.name}
          label={p.name}
          hint={`Seed ${p.seed} — the whole palette derives from it`}
          active={value === p.name}
          onClick={() => onChange(p.name)}
          swatch={p.seed}
        />
      ))}
      <label
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors",
          value === "custom"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
        )}
        title="Any custom seed — the full palette re-derives from it"
      >
        <input
          type="color"
          aria-label="Custom seed"
          value={customSeed ?? "#3b82f6"}
          onChange={(e) => onCustomSeed(e.target.value)}
          className="h-3.5 w-4 cursor-pointer appearance-none rounded-sm border-0 bg-transparent p-0"
        />
        custom
      </label>
      {onSeed2 && (
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors",
            customSeed2
              ? "border-accent bg-accent/10 text-foreground"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
          )}
          title="Optional second seed — recolors the value segment only, on top of any base (click anywhere to pick)"
        >
          {customSeed2 && (
            <button
              type="button"
              aria-label="Clear value-segment seed"
              onClick={(e) => {
                // keep the label from forwarding this click to the color input
                e.preventDefault();
                onSeed2(null);
              }}
              className="-ml-0.5 flex h-3 w-3 items-center justify-center rounded-full text-[9px] leading-none text-muted-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
            >
              ×
            </button>
          )}
          <input
            type="color"
            aria-label="Value-segment seed (seed2)"
            value={customSeed2 ?? "#111827"}
            onChange={(e) => onSeed2(e.target.value)}
            className={cn(
              "h-3.5 w-4 cursor-pointer appearance-none rounded-sm border-0 bg-transparent p-0",
              !customSeed2 && "opacity-60",
            )}
          />
          value seed
        </label>
      )}
      <label
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        title="Dark mode — the surface ramps flip, accents ride the seed"
      >
        <input
          type="checkbox"
          aria-label="Dark mode"
          checked={dark}
          onChange={(e) => onDarkChange(e.target.checked)}
          className="h-3 w-3 cursor-pointer accent-violet-600"
        />
        dark
      </label>
    </div>
  );
}

export function ThemeChip({
  label,
  hint,
  swatch,
  swatchFg,
  active,
  onClick,
}: {
  label: string;
  hint?: string;
  swatch?: string;
  swatchFg?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={hint}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-accent",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
      )}
    >
      {swatch && (
        <span
          className="inline-flex h-3.5 w-6 items-center justify-center rounded-[3px] text-[7px] font-bold"
          style={{ background: swatch, color: swatchFg ?? "#fff" }}
          aria-hidden
        >
          Aa
        </span>
      )}
      {label}
    </button>
  );
}

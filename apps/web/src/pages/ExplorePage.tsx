import { memo, useCallback, useEffect, useMemo, useRef, useState, useTransition, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Columns3, Flame, FlaskConical, Image as ImageIcon, Layers, Search, SlidersHorizontal, Sparkles, X, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/CopyButton";
import { BadgeFrame } from "@/components/BadgeFrame";
import { ThemePicker } from "@/components/ThemePicker";
import {
  collections,
  previewSurfaceStyle,
  renderVariant,
  variants as allVariants,
  type VariantMeta,
} from "@/lib/badge";
import { type SemanticPresetState, semanticSpecFor } from "@/lib/theme";
import { apiClient, fetchPopular, type PopularStats } from "@/lib/api";
import { formatCount } from "@/lib/plans";
import { cn } from "@/lib/utils";

type SelectedTheme = SemanticPresetState;

/** Builds the API query for the current picker state. */
function themeQueryFor(theme: SelectedTheme): {
  theme?: string;
  seed?: string;
  seed2?: string;
  mode?: "light" | "dark";
} {
  const base =
    theme.name === "custom" && theme.customSeed
      ? { seed: theme.customSeed, ...(theme.dark ? { mode: "dark" as const } : {}) }
      : { theme: theme.name, ...(theme.dark ? { mode: "dark" as const } : {}) };
  // the value-segment seed rides ANY base — preset or custom (`?seed2=`)
  return {
    ...base,
    ...(theme.customSeed2 ? { seed2: theme.customSeed2 } : {}),
  };
}

/** How the gallery is ordered. "used" needs live stats — hidden without them. */
type SortMode = "registry" | "az" | "used";

/** Feature filters (multi-toggle): structural facts from the registry. */
interface FeatureFilters {
  animated: boolean;
  icon: boolean;
  extra: boolean;
  extra2: boolean;
}

const FEATURE_META: Array<{
  key: keyof FeatureFilters;
  label: string;
  hint: string;
  icon: typeof Zap;
}> = [
  { key: "animated", label: "Animated", hint: "Variants that move (GIF / APNG renders)", icon: Zap },
  { key: "icon", label: "Icon", hint: "Variants that can carry an icon", icon: ImageIcon },
  { key: "extra", label: "Third segment", hint: "Variants with an extra trailing segment", icon: Columns3 },
  { key: "extra2", label: "Fourth segment", hint: "Quad variants with a fourth dynamic segment (?extra2=)", icon: Layers },
];

/**
 * Explore — the registry gallery. Search + collection/feature filters + theme
 * picker + live usage stats. Cards show badges inside the shared BadgeFrame
 * (the same 18 px pad the API renders); oversized badges zoom-fit their card
 * instead of scrolling. The detail panel shows the badge plus the API URL and
 * a jump into the Playground.
 *
 * Theme changes (dragging the custom-seed color input included) run inside
 * `startTransition`: the input stays live while the ~544 card re-render
 * happens at transition priority, and the ramp caches (themes pkg + style
 * map) mean the OKLCH math runs once per (seed, mode), not per card.
 */
export function ExplorePage() {
  const [collection, setCollection] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<SelectedTheme>({ name: "blue", dark: false });
  const [selected, setSelected] = useState<VariantMeta>(allVariants[0]);
  const [features, setFeatures] = useState<FeatureFilters>({ animated: false, icon: false, extra: false, extra2: false });
  const [sort, setSort] = useState<SortMode>("registry");
  const [popular, setPopular] = useState<PopularStats | null>(null);
  const [, startTransition] = useTransition();

  // live demand data: which badges are actually used. Null (API missing) →
  // the usage sort + per-card render chips simply don't render.
  useEffect(() => {
    let alive = true;
    fetchPopular().then((stats) => {
      if (alive && stats) setPopular(stats);
    });
    return () => {
      alive = false;
    };
  }, []);

  // The pinned filter bar overlays the page while the gallery scrolls; the
  // detail rail must stick BELOW it. The bar's height is content-dependent
  // (collection chips wrap), so measure it and publish it as a CSS variable.
  const filterBarRef = useRef<HTMLDivElement>(null);
  const [filterBarH, setFilterBarH] = useState(0);
  useEffect(() => {
    const bar = filterBarRef.current;
    if (!bar || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setFilterBarH(bar.offsetHeight));
    ro.observe(bar);
    setFilterBarH(bar.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const pickTheme = (name: string) => {
    startTransition(() => {
      setTheme((t) => ({
        ...t,
        name,
        // leaving custom mode drops the picked hex so presets visibly win
        customSeed: name === "custom" ? (t.customSeed ?? "#3b82f6") : undefined,
      }));
    });
  };
  const pickCustomSeed = (hex: string) => {
    startTransition(() => {
      setTheme((t) => ({ ...t, name: "custom", customSeed: hex }));
    });
  };
  const pickSeed2 = (hex: string | null) => {
    startTransition(() => {
      setTheme((t) => ({ ...t, customSeed2: hex ?? undefined }));
    });
  };
  const pickDark = (dark: boolean) => {
    startTransition(() => {
      setTheme((t) => ({ ...t, dark }));
    });
  };
  const selectVariant = useCallback((v: VariantMeta) => setSelected(v), []);

  const toggleFeature = (key: keyof FeatureFilters) => {
    startTransition(() => setFeatures((f) => ({ ...f, [key]: !f[key] })));
  };
  const pickSort = (mode: SortMode) => {
    startTransition(() => setSort(mode));
  };
  const activeFeatureCount = (Object.keys(features) as Array<keyof FeatureFilters>).filter(
    (k) => features[k],
  ).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = allVariants.filter((v) => {
      if (collection !== "all" && v.collection !== collection) return false;
      if (features.animated && v.animations.length === 0) return false;
      if (features.icon && !v.hasIcon) return false;
      if (features.extra && !v.hasExtra) return false;
      if (features.extra2 && !v.hasExtra2) return false;
      if (!q) return true;
      return (
        v.id.includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.defaultLabel.toLowerCase().includes(q) ||
        v.defaultValue.toLowerCase().includes(q)
      );
    });
    if (sort === "az") {
      return [...rows].sort((a, b) => a.id.localeCompare(b.id));
    }
    if (sort === "used" && popular) {
      return [...rows].sort(
        (a, b) =>
          (popular.variants[b.id] ?? 0) - (popular.variants[a.id] ?? 0) || a.id.localeCompare(b.id),
      );
    }
    return rows;
  }, [collection, search, features, sort, popular]);

  // ------------------------------------------------------------ gallery grid.
  // 544 cards used to mount in one CSS grid — heavy paint, heavy re-render on
  // every theme drag. The gallery is now virtualized with TanStack Virtual's
  // window virtualizer: only the rows near the viewport exist in the DOM
  // (cards stay memoized, so a seed change re-renders ~a dozen badges, not
  // 544). Rows are chunks of `cols` cards; each virtual row carries its own
  // bottom padding (ROW_GAP) so the margin between rows is part of the
  // measured item — the visual rhythm of a gap-3 grid survives
  // virtualization exactly.
  const listRef = useRef<HTMLDivElement>(null);
  const [listW, setListW] = useState(0);
  // distance from the top of the document to the first row — the window
  // virtualizer needs it to translate scroll offsets into row indices
  const [scrollMargin, setScrollMargin] = useState(0);
  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setListW(el.clientWidth);
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    });
    ro.observe(el);
    setListW(el.clientWidth);
    setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
    return () => ro.disconnect();
  }, []);
  // the sticky filter bar's height is content-dependent and shifts the grid —
  // re-derive the document offset whenever it changes
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    setScrollMargin(el.getBoundingClientRect().top + window.scrollY);
  }, [filterBarH]);

  const cols = listW >= 720 ? 4 : listW >= 420 ? 3 : 2;
  const ROW_GAP = 12; // must match gap-3 below
  const vrows = useMemo(() => {
    const out: Array<VariantMeta[]> = [];
    for (let i = 0; i < filtered.length; i += cols) out.push(filtered.slice(i, i + cols));
    return out;
  }, [filtered, cols]);

  const rowVirt = useWindowVirtualizer({
    count: vrows.length,
    estimateSize: () => 160, // card ≈148px + one ROW_GAP
    overscan: 4,
    scrollMargin,
    getItemKey: (i) => vrows[i]?.[0]?.id ?? i,
  });

  const selectedCollection = collections.find((c) => c.id === selected.collection);
  const url = apiClient.badgeUrl(
    selectedCollection?.slug ?? selected.collection,
    selected.id,
    selected.defaultLabel || "label",
    selected.defaultValue || "value",
    { format: "svg", ...themeQueryFor(theme) },
  );

  return (
    <div
      className="mx-auto max-w-7xl px-6 py-8"
      style={{ "--vx-filterbar-h": `${filterBarH}px` } as CSSProperties}
    >
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden />
          Explore the registry
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {allVariants.length} structural variants across {collections.length} collections. Cards
          scale oversized badges to fit; open one to edit it.
        </p>
      </div>

      {/* controls bar pinned under the nav while the gallery scrolls */}
      <div ref={filterBarRef} className="sticky top-14 z-20 -mx-6 mb-6 border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
        {/* row 1 — search, feature filters, sort */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52 flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${allVariants.length} variants — id, title, label, value…`}
              aria-label="Search variants"
              className="pl-8 pr-8"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            )}
          </div>

          {/* feature filters — visually a different family from the
              collection chips below: squarer, dashed when idle, icon-led,
              wrapped in a labelled "Filter" tray */}
          <div
            className="flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-border bg-muted/30 px-2 py-1"
            role="group"
            aria-label="Feature filters"
          >
            <span className="inline-flex items-center gap-1 pl-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              <SlidersHorizontal className="h-3 w-3" aria-hidden />
              Filter
            </span>
            {FEATURE_META.map((f) => {
              const Icon = f.icon;
              const active = features[f.key];
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleFeature(f.key)}
                  title={f.hint}
                  className={cn(
                    "vx-press inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                    active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                  {f.label}
                </button>
              );
            })}
            {/* collapsing slot — Clear animates in/out so the flex-1 search
                bar resizes smoothly instead of jumping */}
            <span
              className={cn(
                "inline-block overflow-hidden whitespace-nowrap transition-all duration-200 ease-out",
                activeFeatureCount > 0 ? "max-w-24 opacity-100" : "max-w-0 opacity-0",
              )}
              aria-hidden={activeFeatureCount === 0}
            >
              <button
                type="button"
                tabIndex={activeFeatureCount > 0 ? 0 : -1}
                onClick={() => startTransition(() => setFeatures({ animated: false, icon: false, extra: false, extra2: false }))}
                className="vx-press inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
              >
                Clear ({activeFeatureCount})
              </button>
            </span>
          </div>

          <div
            className="ml-auto flex overflow-hidden rounded-full border border-border"
            role="group"
            aria-label="Sort variants"
          >
            {(
              [
                ["registry", "Registry"],
                ["az", "A–Z"],
                ...(popular ? [["used", "Most used"] as const] : []),
              ] as Array<[SortMode, string]>
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={sort === mode}
                onClick={() => pickSort(mode)}
                title={mode === "used" ? "Ordered by live request counts" : undefined}
                className={cn(
                  "vx-press inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                  sort === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {mode === "used" && <Flame className="h-3 w-3" aria-hidden />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* row 2 — collection chips */}
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Collections">
          <Chip label="All" active={collection === "all"} onClick={() => setCollection("all")} />
          {collections.map((c) => (
            <Chip
              key={c.id}
              label={c.title}
              active={collection === c.id}
              onClick={() => setCollection(c.id)}
              title={c.description}
            />
          ))}
        </div>

        {/* row 3 — theme */}
        <div className="mt-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Theme
          </p>
          <ThemePicker
            value={theme.name}
            customSeed={theme.customSeed}
            customSeed2={theme.customSeed2}
            dark={theme.dark}
            onChange={pickTheme}
            onCustomSeed={pickCustomSeed}
            onSeed2={pickSeed2}
            onDarkChange={pickDark}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-label="Badge gallery" aria-live="polite">
          <p className="mb-3 text-xs text-muted-foreground" role="status">
            {filtered.length} of {allVariants.length} variants
            {popular && sort === "used" ? " — hottest first" : ""}
          </p>
          {/*
            * The virtualized gallery: rows are absolutely positioned by the
            * window virtualizer, sized by measureElement (so the fixed-height
            * card stage keeps every row equal) and spaced by the row's own
            * bottom padding — the margin between rows is part of the item.
            * The one-shot entrance animation lives on the container (keyed by
            * collection), NOT on rows: rows mount/unmount while scrolling and
            * must not re-animate under the pointer.
            */}
          <div key={collection} className="vx-enter">
            <div ref={listRef} className="relative" style={{ height: rowVirt.getTotalSize() }}>
              {rowVirt.getVirtualItems().map((vi) => {
                const row = vrows[vi.index];
                if (!row) return null;
                return (
                  <div
                    key={vi.key}
                    data-index={vi.index}
                    ref={rowVirt.measureElement}
                    className="grid gap-3"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vi.start - scrollMargin}px)`,
                      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                      paddingBottom: ROW_GAP,
                    }}
                  >
                    {row.map((v) => (
                      <VariantCard
                        key={v.id}
                        variant={v}
                        theme={theme}
                        selected={selected.id === v.id}
                        onSelect={selectVariant}
                        renders={popular?.variants[v.id]}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No variants match “{search}”.
            </p>
          )}
        </section>

        <aside aria-label="Variant detail">
          <div
            className="space-y-4 rounded-lg border border-border bg-white p-5 lg:sticky lg:max-h-[calc(100dvh-5rem-var(--vx-filterbar-h,0px))] lg:overflow-y-auto"
            style={{ top: "calc(3.5rem + var(--vx-filterbar-h, 0px) + 1rem)" }}
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {selected.collection} · {selected.id}
              </p>
              <h2 className="text-lg font-bold tracking-tight">{selected.title}</h2>
              {selectedCollection && (
                <p className="mt-1 text-xs text-muted-foreground">{selectedCollection.description}</p>
              )}
            </div>

            {/* fits-to-width detail view (1:1 when the badge fits) */}
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Preview
              </p>
              <BadgeFrame
                style={previewSurfaceStyle(semanticSpecFor(theme))}
                className="bg-muted/30"
              >
                {renderVariant({
                  variant: selected,
                  icon: "default",
                  semantic: semanticSpecFor(theme),
                })}
              </BadgeFrame>
            </div>

            <dl className="space-y-1.5 text-xs text-muted-foreground">
              <Row label="Icon slot" value={selected.hasIcon ? "yes" : "no"} />
              <Row label="Third segment" value={selected.hasExtra ? "yes" : "no"} />
              <Row label="Fourth segment" value={selected.hasExtra2 ? "yes" : "no"} />
              <Row
                label="Animation"
                value={selected.animations.length > 0 ? selected.animations[0].name : "static"}
              />
              <Row label="Theme" value={theme.name} />
              {popular && popular.variants[selected.id] != null && (
                <Row label="Requests" value={formatCount(popular.variants[selected.id])} />
              )}
            </dl>

            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Embed URL
              </p>
              <code className="block break-all rounded-md bg-muted p-2 font-mono text-[10px] leading-relaxed">
                {url}
              </code>
              <div className="mt-2 flex flex-wrap gap-2">
                <CopyButton text={url} label="Copy URL" />
                <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
                  Open render
                </Button>
                <Link
                  to="/playground"
                  search={{ variant: selected.id, ...(themeQueryFor(theme) as Record<string, string>) }}
                  aria-label={`Edit ${selected.id} in the Playground`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <FlaskConical className="h-3.5 w-3.5" aria-hidden />
                  Edit in Playground
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * One gallery card, memoized: with a stable `onSelect` and primitive-only
 * props, only the cards whose (variant, theme, selected) tuple changed
 * re-render — theme transitions re-render just the themed subtree once.
 * Height is FIXED (h-24 zoom-fit stage): virtual rows measure once and stay
 * equal, so the virtualizer never re-measures on scroll.
 */
const VariantCard = memo(function VariantCard({
  variant,
  theme,
  selected,
  onSelect,
  renders,
}: {
  variant: VariantMeta;
  theme: SelectedTheme;
  selected: boolean;
  onSelect: (v: VariantMeta) => void;
  /** Live demand count from /v1/stats/popular — absent when no API data. */
  renders?: number;
}) {
  const semantic = semanticSpecFor(theme);
  return (
    <button
      type="button"
      onClick={() => onSelect(variant)}
      aria-pressed={selected}
      className={cn(
        "vx-lift group relative flex flex-col justify-between gap-2 rounded-lg border p-3 text-left focus-visible:outline-2 focus-visible:outline-accent",
        selected
          ? "border-accent ring-2 ring-accent/30"
          : "border-border hover:border-muted-foreground/40",
      )}
    >
      {renders != null && (
        <span
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground"
          title={`${formatCount(renders)} requests served for this badge`}
        >
          <Flame className="h-2.5 w-2.5 text-accent" aria-hidden />
          {formatCount(renders)}
        </span>
      )}
      {/*
        * Fixed-height preview stage (h-24): tall badges zoom-fit instead of
        * stretching the card, so every card shares one height — virtual rows
        * measure identically and the grid can never shift.
        */}
      <BadgeFrame
        style={previewSurfaceStyle(semantic)}
        className="h-24 items-center"
        ariaLabel={`${variant.title} preview`}
      >
        {renderVariant({ variant, icon: "default", semantic })}
      </BadgeFrame>
      <span className="truncate font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {variant.id} · {variant.title}
      </span>
    </button>
  );
});

function Chip({
  label,
  active,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={cn(
        "vx-press rounded-full border px-3 py-1 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-accent",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    // gap guarantees label and value never touch, even when both run long;
    // min-w-0 + truncate keep long animation names from wrapping the row
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

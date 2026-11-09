/**
 * IconPicker — visual selector for the Vexillum icon library:
 * - `brands` scope: ALL Simple Icons (3,400+, from the same simpleicons-rs
 *   dataset the API renders) with brand hexes (bare slugs);
 * - per-set scopes: the icondata catalog (33,987 icons across 19 sets,
 *   `<set>-<slug>` slugs) with path data loaded from per-set lazy chunks;
 * - `all`: cross-set search over the slug index (results capped; the sets
 *   needed by the visible tiles are loaded on demand).
 *
 * Chunks are cached module-side (see `@/lib/icon-library`), so switching
 * scopes never re-downloads. Brand metadata/paths ship in two tiers: an
 * eager popular core (icon-catalog / icon-paths, parent-loaded) and a full
 * lazy chunk that this picker pulls in when it opens.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/select";
import { CURATED_ICONS } from "@/lib/icon-catalog";
import { iconNodeFromEntry, curatedIconNode } from "@/lib/badge";
import {
  SET_META,
  loadBrandCatalog,
  loadBrandPathsFull,
  loadIconSet,
  loadSlugSets,
  setOfSlug,
  unprefixedSlug,
  type IconEntry,
  type IconMeta,
} from "@/lib/icon-library";
import { cn } from "@/lib/utils";

export type IconScope = "brands" | "all" | string;

/** Hard cap for cross-set results — 34k icons never render in one grid. */
const ALL_SCOPE_CAP = 240;
/** Max set chunks auto-loaded for one cross-set result page. */
const ALL_SCOPE_MAX_SETS = 6;
/** Tile geometry: h-9 button + gap-1 — one virtual row height, margins included. */
const TILE = 36;
const GAP = 4;
const ROW_H = TILE + GAP;

export interface IconPickerProps {
  value: string;
  onChange: (slug: string) => void;
  /** Brand path data (parent loads the lazy `icon-paths` chunk); null while loading. */
  brandPaths: Record<string, string> | null;
}

export function IconPicker({ value, onChange, brandPaths }: IconPickerProps) {
  const [scope, setScope] = useState<IconScope>("brands");
  const [query, setQuery] = useState("");
  const [slugSets, setSlugSets] = useState<Record<string, string> | null>(null);
  const [entries, setEntries] = useState<Record<string, Record<string, IconEntry>>>({});
  // full brand library (lazy chunks, loaded when the picker opens)
  const [brandCatalog, setBrandCatalog] = useState<IconMeta[] | null>(null);
  const [brandPathsFull, setBrandPathsFull] = useState<Record<string, string> | null>(null);

  const q = query.trim().toLowerCase();
  const brandCount = brandCatalog?.length ?? CURATED_ICONS.length;
  const totalLibrary = brandCount + SET_META.reduce((n, s) => n + s.count, 0);
  const mergedBrandPaths = useMemo(
    () => (brandPathsFull ? { ...brandPaths, ...brandPathsFull } : brandPaths),
    [brandPaths, brandPathsFull],
  );

  // the picker is the one place that needs the whole library — pull both
  // lazy brand chunks once on mount (module-cached afterwards)
  useEffect(() => {
    let alive = true;
    loadBrandCatalog().then((c) => alive && setBrandCatalog(c));
    loadBrandPathsFull().then((p) => alive && setBrandPathsFull(p));
    return () => {
      alive = false;
    };
  }, []);

  // cross-set search needs the slug → set index (small, loaded once)
  useEffect(() => {
    if (scope !== "all" || slugSets) return;
    let alive = true;
    loadSlugSets().then((idx) => {
      if (alive) setSlugSets(idx);
    });
    return () => {
      alive = false;
    };
  }, [scope, slugSets]);

  // per-set path data for the active scope
  useEffect(() => {
    const set = scope === "brands" || scope === "all" ? null : setOfSlug(scope) ?? scope;
    if (!set || entries[set]) return;
    let alive = true;
    loadIconSet(set).then((data) => {
      if (alive) setEntries((prev) => ({ ...prev, [set]: data }));
    });
    return () => {
      alive = false;
    };
  }, [scope, entries]);

  const brandResults = useMemo(() => {
    if (scope !== "brands") return [];
    return (brandCatalog ?? CURATED_ICONS).filter(
      (i) => !q || i.slug.includes(q) || i.title.toLowerCase().includes(q),
    );
  }, [scope, q, brandCatalog]);

  const setResults = useMemo(() => {
    if (scope === "brands") return [];
    if (scope !== "all") {
      const data = entries[scope];
      if (!data) return null; // chunk still loading
      // chunk keys are UNPREFIXED — qualify with the set id to match the
      // URL/API contract (?icon=mdi-ab-testing)
      return Object.keys(data)
        .filter((slug) => !q || slug.includes(q))
        .map((slug) => ({ slug: `${scope}-${slug}`, entry: data[slug] }));
    }
    if (!slugSets) return null; // index still loading
    const hits = Object.keys(slugSets)
      .filter((slug) => !q || slug.includes(q))
      .slice(0, ALL_SCOPE_CAP);
    return hits.map((slug) => ({
      slug,
      entry: entries[slugSets[slug]]?.[unprefixedSlug(slug)],
    }));
  }, [scope, q, entries, slugSets]);

  // cross-set scope: pull in the chunks backing the first page of results
  useEffect(() => {
    if (scope !== "all" || !slugSets || !setResults) return;
    const needed = new Map<string, number>();
    for (const r of setResults) {
      const set = slugSets[r.slug];
      if (set && !r.entry) needed.set(set, (needed.get(set) ?? 0) + 1);
    }
    [...needed.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, ALL_SCOPE_MAX_SETS)
      .forEach(([set]) => {
        if (!entries[set]) {
          loadIconSet(set).then((data) =>
            setEntries((prev) => (prev[set] ? prev : { ...prev, [set]: data })),
          );
        }
      });
  }, [scope, slugSets, setResults, entries]);

  const loading =
    (scope === "brands" && mergedBrandPaths === null) ||
    (scope !== "brands" && setResults === null);

  // ------------------------------------------------------------------ grid.
  // The picker renders up to 3,400+ brand tiles (and dense per-set pages),
  // so the grid is virtualized with TanStack Virtual: rows of `cols` tiles
  // positioned absolutely by the virtualizer, each row carrying its own
  // bottom gap (ROW_H = tile + gap) so the rhythm between rows survives
  // virtualization. Columns follow the PANEL width (not the viewport) —
  // the picker lives in a fixed-width control rail.
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridW, setGridW] = useState(0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setGridW(el.clientWidth));
    ro.observe(el);
    setGridW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const cols = gridW >= 560 ? 8 : gridW >= 400 ? 6 : 4;

  const tiles = useMemo(() => {
    if (scope === "brands") {
      return brandResults.map((icon) => ({
        slug: icon.slug,
        label: `${icon.title} (${icon.slug})`,
        hex: icon.hex,
        entry: undefined as IconEntry | undefined,
      }));
    }
    return (setResults ?? []).map(({ slug, entry }) => ({
      slug,
      label: `${slug} (${SET_META.find((s) => s.id === slug.split("-")[0])?.label ?? "brand"})`,
      hex: undefined,
      entry,
    }));
  }, [scope, brandResults, setResults]);

  const rows = useMemo(() => {
    const out: Array<typeof tiles> = [];
    for (let i = 0; i < tiles.length; i += cols) out.push(tiles.slice(i, i + cols));
    return out;
  }, [tiles, cols]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => gridRef.current,
    estimateSize: () => ROW_H,
    overscan: 6,
    getItemKey: (i) => rows[i]?.[0]?.slug ?? i,
  });

  // opening the picker (or switching scope) brings the currently selected
  // icon into view — the visible page always includes your choice, instead
  // of a blank grid with the selection somewhere below the fold. If the
  // selection is already on screen (e.g. the user just clicked it) the
  // scroll position is left alone.
  const selectedIdx = tiles.findIndex((t) => t.slug === value);
  const didInitialScroll = useRef<string>("");
  useEffect(() => {
    if (loading || selectedIdx < 0) return;
    const target = Math.floor(selectedIdx / cols);
    const first = rowVirtualizer.getVirtualItems()[0]?.index ?? 0;
    const last = rowVirtualizer.getVirtualItems().at(-1)?.index ?? -1;
    if (target >= first && target <= last) return;
    const key = `${scope}:${value}`;
    if (didInitialScroll.current === key) return;
    didInitialScroll.current = key;
    rowVirtualizer.scrollToIndex(target, { align: "center" });
  }, [loading, selectedIdx, scope, value, cols, rowVirtualizer]);

  return (
    <div className="mt-3">
      <Label htmlFor="pg-icon-search">
        Icon library — {totalLibrary.toLocaleString()} icons ({brandCount.toLocaleString()} brands +{" "}
        {SET_META.reduce((n, s) => n + s.count, 0).toLocaleString()} icondata)
      </Label>
      <Select
        id="pg-icon-set"
        aria-label="Icon set"
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        className="mt-1.5"
      >
        <option value="brands">{`Brands (${brandCount.toLocaleString()} · brand colors)`}</option>
        <option value="all">{`All sets (${totalLibrary.toLocaleString()})`}</option>
        {SET_META.map((s) => (
          <option key={s.id} value={s.id}>
            {`${s.label} (${s.count.toLocaleString()})`}
          </option>
        ))}
      </Select>
      <Input
        id="pg-icon-search"
        type="search"
        placeholder={
          scope === "brands"
            ? "Search brands by name or slug…"
            : scope === "all"
              ? `Search all ${totalLibrary.toLocaleString()} icons by slug…`
              : `Search ${SET_META.find((s) => s.id === scope)?.label ?? scope}…`
        }
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        className="mt-1.5"
      />
      {loading ? (
        <p role="status" className="mt-2 text-[11px] text-muted-foreground">
          Loading icon library…
        </p>
      ) : tiles.length === 0 ? (
        <p className="mt-2 px-1 py-3 text-center text-[11px] text-muted-foreground" role="status">
          No icons match “{query}”{scope === "all" ? ` — refine (showing first ${ALL_SCOPE_CAP})` : ""}.
        </p>
      ) : (
        <div
          ref={gridRef}
          role="group"
          aria-label="Icon library"
          className="vx-scroll-light mt-2 max-h-56 overflow-y-auto rounded-md border border-border bg-muted/30 p-1.5"
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((vi) => (
              <div
                key={vi.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: vi.size,
                  transform: `translateY(${vi.start}px)`,
                  // the row IS the grid: columns + the horizontal gap live
                  // here, and ROW_H's trailing 4px is the margin to the next
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gap: GAP,
                }}
              >
                {rows[vi.index].map((tile) => {
                  const selected = tile.slug === value;
                  return (
                    <Tile
                      key={tile.slug}
                      label={tile.label}
                      selected={selected}
                      onClick={() => onChange(tile.slug)}
                    >
                      {tile.entry ? (
                        iconNodeFromEntry(tile.entry, 16)
                      ) : tile.hex ? (
                        mergedBrandPaths?.[tile.slug] ? (
                          curatedIconNode(mergedBrandPaths[tile.slug], 16, `#${tile.hex}`)
                        ) : (
                          <Monogram text={tile.slug.slice(0, 2)} />
                        )
                      ) : (
                        <Monogram
                          text={
                            tile.slug.split("-").slice(1, 2).join("")?.slice(0, 2) ||
                            tile.slug.slice(0, 2)
                          }
                        />
                      )}
                    </Tile>
                  );
                })}
              </div>
            ))}
          </div>
          {scope === "all" && tiles.length >= ALL_SCOPE_CAP && (
            <p className="px-1 py-1.5 text-center text-[10px] text-muted-foreground">
              Showing the first {ALL_SCOPE_CAP} matches — type to refine.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Tile({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex h-9 w-full items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-accent",
        selected
          ? "border-accent bg-white ring-2 ring-accent ring-offset-1"
          : "border-transparent hover:border-border hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

function Monogram({ text }: { text: string }) {
  return (
    <span className="text-[8px] leading-none text-muted-foreground" aria-hidden>
      {text}
    </span>
  );
}

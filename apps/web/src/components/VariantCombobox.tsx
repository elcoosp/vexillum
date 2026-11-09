/**
 * VariantCombobox — searchable variant selector for the Playground.
 *
 * A `role="combobox"` input over the 544-variant registry: type an id,
 * title or collection to filter; ↑/↓ to move, Enter to select, Esc to
 * close. The option list is virtualized with TanStack Virtual (a fixed
 * row height over a max-height scroller) so even the unfiltered registry
 * mounts a handful of rows, not hundreds.
 *
 * Opening is intuitive by construction: clicking the input ALWAYS opens
 * the list — whether focus is fresh or the input was already focused —
 * and a chevron affordance toggles it. (The old build only opened on a
 * focus *event*, so selecting a variant and clicking the input again
 * left the list closed until the user unfocused and refocused.)
 *
 * Selection always writes a canonical registry id — the value the URL and
 * the API see is exactly what the caller passed back through `onChange`.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { collections, variants as allVariants } from "@/lib/badge";
import { cn } from "@/lib/utils";

const MAX_OPTIONS = 60;
/** Fixed option row height — matches the rendered row exactly. */
const ROW_H = 30;

export function VariantCombobox({
  value,
  onChange,
  batchIds,
  onToggleBatch,
}: {
  /** The selected registry id (c01-01 …). */
  value: string;
  onChange: (id: string) => void;
  /** Batch mode: ids currently in the playground batch. */
  batchIds?: ReadonlySet<string>;
  /** Batch mode: toggle a variant's batch membership from its option row. */
  onToggleBatch?: (id: string) => void;
}) {
  const listboxId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // commit() refocuses the input for keyboard flow — the resulting focus
  // event must NOT reopen the list (it blanked the display: open + empty query)
  const suppressFocusReopen = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = allVariants.find((v) => v.id === value) ?? allVariants[0];
  const collectionTitle = useMemo(
    () => new Map(collections.map((c) => [c.id, c.title])),
    [],
  );

  // text shown while closed = the canonical selection; typing opens the list
  const display = open ? query : `${selected.id} — ${selected.title}`;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allVariants.slice(0, MAX_OPTIONS);
    const hits = allVariants.filter(
      (v) =>
        v.id.includes(q) ||
        v.title.toLowerCase().includes(q) ||
        v.collection.includes(q) ||
        (collectionTitle.get(v.collection) ?? "").toLowerCase().includes(q),
    );
    return hits.slice(0, MAX_OPTIONS);
  }, [query, collectionTitle]);

  // the virtual list over the dropdown scroller — fixed row estimate, no
  // measurement pass needed (every row is one 30px option line)
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_H,
    overscan: 8,
    getItemKey: (i) => results[i]?.id ?? i,
  });

  // reopen resets the query + active row; keep active in range
  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const commit = (id: string) => {
    onChange(id);
    setQuery("");
    setOpen(false);
    // refocus only when focus was lost (mouse selection); the programmatic
    // focus must not re-trigger the open-on-focus handler
    if (document.activeElement !== inputRef.current) {
      suppressFocusReopen.current = true;
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        setActive((a) => Math.min(a + 1, results.length - 1));
        e.preventDefault();
        break;
      case "ArrowUp":
        setActive((a) => Math.max(a - 1, 0));
        e.preventDefault();
        break;
      case "Home":
        setActive(0);
        e.preventDefault();
        break;
      case "End":
        setActive(Math.max(results.length - 1, 0));
        e.preventDefault();
        break;
      case "Enter": {
        const hit = results[active];
        if (hit) commit(hit.id);
        e.preventDefault();
        break;
      }
      case "Escape":
        setQuery("");
        setOpen(false);
        e.preventDefault();
        break;
    }
  };

  // keep the active option in view — through the virtualizer so rows that
  // aren't mounted yet are still reachable by keyboard
  useEffect(() => {
    if (!open) return;
    if (results.length === 0) return;
    virtualizer.scrollToIndex(Math.min(active, results.length - 1));
  }, [active, open, virtualizer, results.length]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          id="pg-variant"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && results[active] ? `${listboxId}-${results[active].id}` : undefined}
          aria-autocomplete="list"
          aria-label="Variant"
          autoComplete="off"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-14 py-1 font-mono text-[13px] shadow-sm transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent",
          )}
          value={display}
          placeholder={`Search ${allVariants.length} variants — id, title, collection…`}
          onFocus={() => {
            if (suppressFocusReopen.current) {
              suppressFocusReopen.current = false;
              return;
            }
            setOpen(true);
          }}
          // THE fix: a click on an ALREADY-focused input fires no focus
          // event — open explicitly so the dropdown never needs the
          // unfocus/refocus dance
          onMouseDown={() => {
            if (!open) setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {/* clear + chevron affordances inside the field */}
        {open && query ? (
          <button
            type="button"
            aria-label="Clear variant search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-9 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      </div>
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Variants"
          className="vx-scroll absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-white p-1 shadow-lg"
          style={
            results.length > 0
              ? { height: Math.min(288, results.length * ROW_H + 8) }
              : undefined
          }
        >
          {results.length > 0 && (
            <div
              style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((vi) => {
                const v = results[vi.index];
                const i = vi.index;
                const inBatch = batchIds?.has(v.id) ?? false;
                return (
                  <li
                    key={v.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: vi.size,
                      transform: `translateY(${vi.start}px)`,
                    }}
                  >
                    {/* the row is option (commit focus) + batch toggle side
                        by side — a button can't nest in a button, so the
                        option hit area shrinks instead */}
                    <div className="flex h-full w-full items-stretch gap-0.5">
                      <button
                        type="button"
                        role="option"
                        id={`${listboxId}-${v.id}`}
                        data-index={i}
                        aria-selected={v.id === value}
                        onClick={() => commit(v.id)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex min-w-0 flex-1 items-baseline justify-between gap-2 rounded px-2 py-1 text-left text-[12px] transition-colors",
                          i === active ? "bg-accent/10" : "hover:bg-muted/60",
                          v.id === value && "font-semibold",
                        )}
                      >
                        <span className="min-w-0 truncate font-mono">
                          {v.id} <span className="font-sans text-muted-foreground">— {v.title}</span>
                        </span>
                        <span className="shrink-0 text-[9px] uppercase tracking-widest text-muted-foreground">
                          {collectionTitle.get(v.collection) ?? v.collection}
                        </span>
                      </button>
                      {onToggleBatch && (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label={`${inBatch ? "Remove" : "Add"} ${v.id} ${inBatch ? "from" : "to"} batch`}
                          aria-pressed={inBatch}
                          title={inBatch ? `Remove ${v.id} from the batch` : `Add ${v.id} to the batch`}
                          onClick={() => onToggleBatch(v.id)}
                          className={cn(
                            "my-0.5 flex w-7 shrink-0 items-center justify-center rounded transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                            inBatch
                              ? "text-primary hover:bg-muted"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {inBatch ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Plus className="h-3.5 w-3.5" aria-hidden />}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </div>
          )}
          {results.length === 0 && (
            <li className="px-2 py-3 text-center text-[11px] text-muted-foreground" role="status">
              No variants match “{query}”.
            </li>
          )}
          {results.length >= MAX_OPTIONS && (
            <li className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">
              Showing the first {MAX_OPTIONS} — type to narrow.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

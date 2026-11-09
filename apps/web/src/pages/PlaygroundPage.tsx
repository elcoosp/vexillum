import { useEffect, useMemo, useRef, useState, useTransition, type CSSProperties, type ReactElement } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FlaskConical, Info, Layers, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/select";
import { CopyButton } from "@/components/CopyButton";
import { BadgeFrame } from "@/components/BadgeFrame";
import { IconPicker } from "@/components/IconPicker";
import { ThemePicker } from "@/components/ThemePicker";
import { VariantCombobox } from "@/components/VariantCombobox";
import { Tabs } from "@/components/ui/tabs";
import {
  CURATED_ICONS,
  collections,
  curatedIconNode,
  iconNodeFromEntry,
  previewSurfaceStyle,
  renderVariant,
  sanitizeSvg,
  variantById,
  variants as allVariants,
} from "@/lib/badge";
import { isIcondataSlug, loadBrandCatalog, loadBrandPathsFull, loadIconSet, unprefixedSlug, type IconEntry } from "@/lib/icon-library";
import { semanticSpecFor, type SemanticPresetState } from "@/lib/theme";
import { BUNDLED_FONTS, badgeFontFamily, badgeUrl, hasApiBase } from "@/lib/api";
import {
  ensureGoogleFontLoaded,
  loadGoogleFonts,
  resolveFontChoice,
  type FontChoice,
  type GoogleFontInfo,
} from "@/lib/google-fonts";
import { FORMATS, PLANS, formatCount, planAllowsFormat, type Format } from "@/lib/plans";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { ThemeTokens } from "@vexillum/badges";
import type { VariantMeta } from "@/lib/badge";

const OUTPUT_TABS = [
  { id: "url", label: "URL" },
  { id: "markdown", label: "Markdown" },
  { id: "html", label: "HTML" },
  { id: "img", label: "<img>" },
];

type IconMode = "default" | "curated" | "custom" | "none";

/**
 * Resolves the icon-color override input to a preview fill. The default
 * (empty / `auto` / `currentColor`) is `undefined` → the node's
 * `currentColor` — the badge's themed ink, exactly what the API renders
 * since `icon.color` defaults to `currentColor` too. `brand` opts into the
 * brand's own hex (via `brandHexFor` — eager catalog first, full lazy
 * catalog on a miss); anything else is a raw CSS color. (The catalog's
 * `hex` field is stored without `#`, so it must be prefixed here.)
 */
function previewIconColor(
  iconColor: string,
  slug: string,
  brandHexFor: (s: string) => string | undefined,
): string | undefined {
  const c = iconColor.trim().toLowerCase();
  if (!c || c === "auto" || c === "current" || c === "currentcolor") return undefined;
  if (c === "brand") return brandHexFor(slug);
  return iconColor.trim();
}

const isBundledSlug = (slug: string | null | undefined): slug is string =>
  !!slug && BUNDLED_FONTS.some((f) => f.slug === slug);

/**
 * Playground — interactive badge editor. SVG previews render live through the
 * React registry components; other formats expose the API URL (rasterization
 * happens server-side / at the edge). "Render via API" switches the preview
 * to a real <img> hit against VITE_API_BASE when configured.
 */
export function PlaygroundPage() {
  const session = useSession();
  const params = useSearch({ strict: false }) as Record<string, string | undefined>;
  const get = (key: string) => params[key] ?? null;
  // visitors experience the Free tier surface honestly
  const plan = session.plan ?? "free";

  const [variantId, setVariantId] = useState(() => {
    const v = get("variant");
    return v && variantById(v) ? v : "c01-01";
  });
  const [theme, setTheme] = useState<SemanticPresetState>(() => {
    const seedParam = get("seed");
    const seed2Param = get("seed2");
    const dark = get("mode") === "dark";
    return {
      name: seedParam
        ? "custom"
        : (() => {
            // a stale ?theme=source deep link maps to the blue default —
            // "source" (the unthemed design) is no longer a picker option
            const requested = get("theme");
            return !requested || requested === "source" ? "blue" : requested;
          })(),
      customSeed: seedParam
        ? seedParam.startsWith("#")
          ? seedParam
          : `#${seedParam}`
        : undefined,
      customSeed2: seed2Param
        ? seed2Param.startsWith("#")
          ? seed2Param
          : `#${seed2Param}`
        : undefined,
      dark,
    };
  });
  const themeName = `${theme.name === "custom" ? `seed:${theme.customSeed ?? ""}` : theme.name}${
    theme.customSeed2 ? " + value seed" : ""
  }`;
  // theme changes (the color input fires per drag tick) transition: the
  // input stays live while the preview re-derives at lower priority
  const [, startTransition] = useTransition();
  const setThemeName = (name: string) =>
    startTransition(() =>
      setTheme((t) => ({
        ...t,
        name,
        // leaving custom mode drops the picked hex so presets visibly win;
        // entering custom keeps the last picked seed as a starting point
        customSeed: name === "custom" ? (t.customSeed ?? "#3b82f6") : undefined,
      })),
    );
  // ?font= deep link: bundled slugs resolve synchronously; Google slugs are
  // validated + resolved once the catalog chunk loads (unknown → source)
  const [font, setFont] = useState<string>(() => {
    const f = get("font");
    return f && f !== "source" ? f : "source";
  });
  const [fontLabel, setFontLabel] = useState<string>(() => {
    const f = get("font");
    return f && f !== "source" ? f : "Source (badge design)";
  });
  const [fontFamily, setFontFamily] = useState<string | null>(() => {
    const f = get("font");
    return isBundledSlug(f) ? badgeFontFamily(f) : null;
  });
  const [googleFonts, setGoogleFonts] = useState<GoogleFontInfo[] | null>(null);
  // the catalog effect reads the latest selection without re-subscribing
  const fontRef = useRef(font);
  fontRef.current = font;
  // catalog chunk loads once; resolves a pending Google ?font= deep link
  // (family + stylesheet link) and resets an unknown slug to source
  useEffect(() => {
    let cancelled = false;
    loadGoogleFonts().then((catalog) => {
      if (cancelled) return;
      setGoogleFonts(catalog);
      const current = fontRef.current;
      if (current === "source" || isBundledSlug(current)) return;
      const choice = resolveFontChoice(current, catalog, BUNDLED_FONTS);
      if (!choice || choice === "source") {
        setFont("source");
        setFontLabel("Source (badge design)");
        setFontFamily(null);
        return;
      }
      ensureGoogleFontLoaded(choice.family);
      setFontFamily(choice.family);
      setFontLabel(choice.family);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const [label, setLabel] = useState(() => get("label") ?? "build");
  const [value, setValue] = useState(() => get("value") ?? "passing");
  const [extra, setExtra] = useState(() => get("extra") ?? "since 09:41");
  const [extra2, setExtra2] = useState(() => get("extra2") ?? "");
  // deep links: ?icon=<slug> opens the picker in curated mode with that slug
  const [iconMode, setIconMode] = useState<IconMode>(() => {
    const icon = get("icon");
    if (icon === "none") return "none";
    return icon ? "curated" : "default";
  });
  const [iconSlug, setIconSlug] = useState(() => {
    const icon = get("icon");
    return icon && icon !== "none" ? icon : "github";
  });
  const [iconColor, setIconColor] = useState(() => get("icon.color") ?? "");
  const [customSvg, setCustomSvg] = useState("");
  const [format, setFormat] = useState<Format>(() => {
    const f = get("format") as Format | undefined;
    return f && FORMATS.includes(f) ? f : "svg";
  });
  const [scale, setScale] = useState<1 | 2 | 3>(() => {
    const s = Number(get("scale"));
    return s === 2 || s === 3 ? (s as 2 | 3) : 1;
  });
  const [apiMode, setApiMode] = useState(() => get("api") === "1");
  // multi-selection: every id here renders in the preview stack with the
  // shared appearance (theme/font/icon/format/scale) and its own default slots
  const [selection, setSelection] = useState<string[]>(() => {
    const raw = get("variants");
    if (!raw) return [];
    return [...new Set(raw.split(",").map((s) => s.trim()).filter((s) => !!variantById(s)))];
  });
  const [outputTab, setOutputTab] = useState("url");
  const [iconPaths, setIconPaths] = useState<Record<string, string> | null>(null);
  // full Simple Icons library (lazy chunks): loaded when a selected brand
  // slug misses the eager chunk — hexes back the `brand` color mode too
  const [fullBrandPaths, setFullBrandPaths] = useState<Record<string, string> | null>(null);
  const [fullBrandHexes, setFullBrandHexes] = useState<Record<string, string> | null>(null);
  const [libEntry, setLibEntry] = useState<IconEntry | null>(null);
  const [formatNotice, setFormatNotice] = useState<string | null>(null);

  const variant = variantById(variantId) ?? allVariants[0];
  const semantic = semanticSpecFor(theme);

  // switching variants resets the slots to that variant's defaults — unless
  // the first mount carries deep-linked slots (?label=/?value=/?extra=/?extra2=)
  const urlSlotsAtMount = useRef(!!(get("label") || get("value") || get("extra") || get("extra2")));
  const firstSlotEffect = useRef(true);
  useEffect(() => {
    if (firstSlotEffect.current) {
      firstSlotEffect.current = false;
      if (urlSlotsAtMount.current) return;
    }
    setLabel(variant.defaultLabel || "label");
    setValue(variant.defaultValue || "value");
    setExtra(variant.defaultExtra ?? "");
    setExtra2(variant.defaultExtra2 ?? "");
  }, [variant.id, variant.defaultLabel, variant.defaultValue, variant.defaultExtra, variant.defaultExtra2]);

  // curated icon path data ships as a lazy chunk (~100 KB) — load on demand
  useEffect(() => {
    if (iconMode !== "curated" || iconPaths) return;
    let alive = true;
    import("@/lib/icon-paths")
      .then((m) => {
        if (alive) setIconPaths(m.ICON_PATHS);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [iconMode, iconPaths]);

  // a brand slug outside the eager core pulls the FULL library chunks (paths
  // for the preview node, hexes for the `brand` color mode)
  useEffect(() => {
    if (iconMode !== "curated" || isIcondataSlug(iconSlug)) return;
    if (iconPaths && iconPaths[iconSlug]) return;
    if (fullBrandPaths && fullBrandHexes) return;
    let alive = true;
    Promise.all([loadBrandPathsFull(), loadBrandCatalog()])
      .then(([paths, meta]) => {
        if (!alive) return;
        const hexes: Record<string, string> = {};
        for (const m of meta) hexes[m.slug] = m.hex;
        setFullBrandPaths(paths);
        setFullBrandHexes(hexes);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [iconMode, iconSlug, iconPaths, fullBrandPaths, fullBrandHexes]);

  // icondata slugs (<set>-<name>) load their set chunk for the live preview —
  // deep links (?icon=mdi-account) resolve without touching the picker
  useEffect(() => {
    if (iconMode !== "curated" || !isIcondataSlug(iconSlug)) {
      setLibEntry(null);
      return;
    }
    let alive = true;
    // chunk keys are unprefixed: "mdi-ab-testing" lives under "ab-testing"
    loadIconSet(iconSlug.split("-")[0]).then((data) => {
      if (alive) setLibEntry(data[unprefixedSlug(iconSlug)] ?? null);
    });
    return () => {
      alive = false;
    };
  }, [iconMode, iconSlug]);

  // brand hex for the `brand` color mode: eager catalog first, full lazy
  // catalog on a miss (all 3,400+ Simple Icons)
  const brandHexFor = (slug: string): string | undefined => {
    const hex = CURATED_ICONS.find((i) => i.slug === slug)?.hex ?? fullBrandHexes?.[slug];
    return hex ? `#${hex}` : undefined;
  };

  // the brand-color quick options only exist for BRAND icons — icondata and
  // custom SVG have no canonical color to derive from
  const selectedBrandHex =
    iconMode === "curated" && !isIcondataSlug(iconSlug) ? brandHexFor(iconSlug) : undefined;
  const iconColorIsBrand = iconColor.trim().toLowerCase() === "brand";
  const themeIsBrandSeed =
    !!selectedBrandHex &&
    theme.name === "custom" &&
    (theme.customSeed ?? "").toLowerCase() === selectedBrandHex.toLowerCase();

  const sanitizedCustomSvg = useMemo(() => sanitizeSvg(customSvg).svg, [customSvg]);

  /**
   * Builds the icon node for ANY variant — the focused badge and every
   * selection-stack row share one builder so a multi-selection preview is
   * always in lockstep with the single-badge preview.
   */
  const makeIconNode = (v: VariantMeta): ReactElement | null | undefined => {
    if (!v.hasIcon) return null;
    if (iconMode === "default") return undefined; // registry default
    if (iconMode === "none") return null;
    if (iconMode === "curated") {
      if (isIcondataSlug(iconSlug)) {
        // catalog icon — needs its set chunk; null until loaded. "brand"
        // has no meaning per-catalog-entry (their own attrs = currentColor)
        const override = iconColor.trim().toLowerCase() === "brand" ? undefined : iconColor || undefined;
        return libEntry ? iconNodeFromEntry(libEntry, 14, override) : null;
      }
      const path = iconPaths?.[iconSlug] ?? fullBrandPaths?.[iconSlug];
      if (!path) return null;
      // default = themed ink (currentColor) — mirrors the API's icon.color
      // default; "brand" opts into the brand hex, prefixed with #
      return curatedIconNode(path, 14, previewIconColor(iconColor, iconSlug, brandHexFor));
    }
    if (!sanitizedCustomSvg) return null;
    return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: sanitizedCustomSvg }} />;
  };
  const iconNode = makeIconNode(variant);

  const displayBase = hasApiBase ? apiClientUrlBase() : typeof window !== "undefined" ? window.location.origin : "";
  // appearance shared by EVERY badge URL (the focused one and each selection
  // row) — this is exactly the "set the seed once, apply it everywhere" lever
  const sharedQuery = {
    format,
    scale: scale !== 1 ? scale : undefined,
    theme: theme.name === "custom" ? undefined : theme.name,
    seed: theme.name === "custom" && theme.customSeed ? theme.customSeed : undefined,
    seed2: theme.customSeed2 || undefined,
    mode: theme.dark ? ("dark" as const) : undefined,
    icon: iconMode === "curated" ? iconSlug : iconMode === "none" ? "none" : undefined,
    iconColor: iconColor || undefined,
    font: font === "source" ? undefined : font,
  } as const;
  const collectionSlugOf = (v: VariantMeta) =>
    collections.find((c) => c.id === v.collection)?.slug ?? v.collection;
  const url = badgeUrl(
    collectionSlugOf(variant),
    variant.id,
    label || variant.defaultLabel || "label",
    variant.hasValue ? value || "value" : (value || ""),
    { ...sharedQuery, extra: extra || undefined, extra2: extra2 || undefined },
  );
  const absoluteUrl = `${displayBase}${url}`;
  // per-selection-row URL: shared appearance, the row's own default slots
  const variantUrlFor = (v: VariantMeta) =>
    `${displayBase}${badgeUrl(
      collectionSlugOf(v),
      v.id,
      v.defaultLabel || "label",
      v.hasValue ? v.defaultValue || "value" : v.defaultValue || "",
      sharedQuery,
    )}`;

  // ---------------- shareable app URL + address-bar sync ----------------
  // The playground persists its full state in the route search (via a
  // replace-navigation) so any workbench can be resumed or shared by URL.
  const shareSearch = useMemo(() => {
    const s: Record<string, string> = {};
    if (variantId !== "c01-01") s.variant = variantId;
    if (selection.length > 0) s.variants = selection.join(",");
    if (selection.length === 0) {
      // slot overrides only describe the single-badge workbench
      if (label && label !== (variant.defaultLabel || "label")) s.label = label;
      if (value && value !== (variant.defaultValue || "value")) s.value = value;
      if (extra && extra !== (variant.defaultExtra ?? "")) s.extra = extra;
      if (extra2 && extra2 !== (variant.defaultExtra2 ?? "")) s.extra2 = extra2;
    }
    if (theme.name === "custom") {
      if (theme.customSeed) s.seed = theme.customSeed;
    } else if (theme.name !== "blue") {
      s.theme = theme.name;
    }
    if (theme.customSeed2) s.seed2 = theme.customSeed2;
    if (theme.dark) s.mode = "dark";
    if (font !== "source") s.font = font;
    if (iconMode === "curated") s.icon = iconSlug;
    else if (iconMode === "none") s.icon = "none";
    if (iconColor.trim()) s["icon.color"] = iconColor.trim();
    if (format !== "svg") s.format = format;
    if (scale !== 1) s.scale = String(scale);
    if (apiMode && hasApiBase) s.api = "1";
    return s;
  }, [variantId, selection, label, value, extra, extra2, variant.defaultLabel, variant.defaultValue, variant.defaultExtra, variant.defaultExtra2, theme, font, iconMode, iconSlug, iconColor, format, scale, apiMode]);
  const shareQs = new URLSearchParams(shareSearch).toString();
  const appShareUrl = `${displayBase}/playground${shareQs ? `?${shareQs}` : ""}`;
  const navigate = useNavigate();
  useEffect(() => {
    // resetScroll: false — this navigation only mirrors state into the
    // address bar; the user is mid-interaction (e.g. picking an icon in the
    // library during a multi-selection). TanStack's default resetScroll
    // snapped the page to the top on EVERY synced change, which read as the
    // picker "re-scrolling to the top" after each icon tap.
    navigate({ to: ".", search: shareSearch, replace: true, resetScroll: false }).catch(
      () => undefined,
    );
    // the canonical string is the true dependency — shareSearch is its source
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareQs]);

  // ---------------- batch actions ----------------
  const batchSet = useMemo(() => new Set(selection), [selection]);
  /** Batch membership toggle — shared by the combobox rows and the pill. */
  const toggleBatchMember = (id: string) =>
    setSelection((sel) => (sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]));
  const removeFromSelection = (id: string) =>
    setSelection((sel) => sel.filter((s) => s !== id));
  const clearSelection = () => setSelection([]);
  const multiMode = selection.length > 0;

  // live preview honors the font override by inheritance; "source" = untouched
  const previewFontStyle: CSSProperties | undefined =
    fontFamily && font !== "source" ? { fontFamily } : undefined;
  /**
   * Resolves a font picker entry to a renderable selection. Bundled slugs
   * and "source" resolve synchronously (keeps the preview + URL instant);
   * Google lookups fall back to the (already loaded) catalog or, on a cold
   * start, to the async loader. Unresolvable input keeps the previous
   * selection — the URL must only ever carry slugs the API accepts.
   */
  const selectFont = (raw: string) => {
    const sync = resolveFontChoice(raw, googleFonts, BUNDLED_FONTS);
    if (sync) {
      applyFontChoice(sync);
      return;
    }
    void loadGoogleFonts().then((catalog) => {
      setGoogleFonts(catalog);
      const async = resolveFontChoice(raw, catalog, BUNDLED_FONTS);
      if (async) applyFontChoice(async);
      else setFontLabel(raw); // keep the typed text; selection unchanged
    });
  };

  function applyFontChoice(choice: FontChoice) {
    if (choice === "source") {
      setFont("source");
      setFontLabel("Source (badge design)");
      setFontFamily(null);
      return;
    }
    setFont(choice.slug);
    setFontLabel(choice.family);
    setFontFamily(choice.family);
    if (!choice.bundled) ensureGoogleFontLoaded(choice.family);
  }


  const embeds = useMemo(
    () => ({
      url: absoluteUrl,
      markdown: `[![${label || variant.defaultLabel}](${absoluteUrl})](${absoluteUrl})`,
      html: `<img src="${absoluteUrl}" alt="${label || variant.defaultLabel}: ${value || ""}" height="20">`,
      img: `<img src="${absoluteUrl}" height="20">`,
    }),
    [absoluteUrl, label, value, variant.defaultLabel],
  );

  const chooseFormat = (f: Format) => {
    setFormatNotice(null);
    if (!planAllowsFormat(plan, f)) {
      setFormatNotice(`Format "${f}" is a Pro format — upgrade on the billing tab.`);
      return;
    }
    setFormat(f);
  };

  const previewIsValidSvg = format === "svg";
  const showLiveComponent = previewIsValidSvg && !(apiMode && hasApiBase);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <FlaskConical className="h-5 w-5 text-accent" aria-hidden />
          Playground
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit slots live, then ship the URL. SVG previews render client-side; raster formats are
          produced by the API/edge worker.
        </p>
      </div>

      {/* ------------------------------------------------- two-column workbench.
          Left: one dense, sectioned control card (Content → Appearance → Icon
          → Output). Right: sticky live preview + snippets — the whole tool
          reads in one viewport with no trapped scroll. */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section
        aria-label="Badge controls"
        className="rounded-xl border border-border bg-white p-4"
      >
          <div>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Content
            </h3>
            <VariantCombobox
              value={variantId}
              onChange={setVariantId}
              batchIds={batchSet}
              onToggleBatch={toggleBatchMember}
            />

            {/* --- batch mode: one workbench, many badges. Appearance
                settings below apply to every picked variant at once — no
                more repeating the seed badge by badge. Members are added
                from the combobox's per-row + toggles or the focused pill. */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleBatchMember(variantId)}
                disabled={selection.includes(variantId)}
                aria-pressed={selection.includes(variantId)}
                data-testid="batch-add"
                className="vx-press inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:cursor-default disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Layers className="h-3 w-3" aria-hidden />
                {selection.includes(variantId) ? `${variantId} in batch` : "Add to batch"}
              </button>
              {selection.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  data-testid="batch-clear"
                  className="vx-press rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-2 focus-visible:outline-accent"
                >
                  Clear batch ({selection.length})
                </button>
              )}
            </div>
            {selection.length > 0 && (
              <ul className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Batch selection" data-testid="batch-chips">
                {selection.map((id) => (
                  <li
                    key={id}
                    className="inline-flex items-center gap-0.5 rounded-full border border-primary/40 bg-primary/5 py-0.5 pl-2.5 pr-1 font-mono text-[11px] text-foreground"
                  >
                    {id}
                    <button
                      type="button"
                      aria-label={`Remove ${id} from batch`}
                      onClick={() => removeFromSelection(id)}
                      className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {multiMode ? (
              <p className="mt-2.5 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground" data-testid="batch-notice">
                <Layers className="mr-1 inline h-3 w-3 align-[-1px]" aria-hidden />
                <span className="font-semibold text-foreground">Batch mode</span> — every picked
                badge renders with its own default slots. The theme, seed, font, icon, format and
                scale settings below apply to the whole batch at once — and each badge keeps its
                own copyable URL on the right.
              </p>
            ) : (
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                {variant.hasLabel && (
                  <div className={variant.hasValue ? "" : "col-span-2"}>
                    <Label htmlFor="pg-label">Label</Label>
                    <Input id="pg-label" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={48} />
                  </div>
                )}
                {variant.hasValue && (
                  <div>
                    <Label htmlFor="pg-value">Value</Label>
                    <Input id="pg-value" value={value} onChange={(e) => setValue(e.target.value)} maxLength={64} />
                  </div>
                )}
                {variant.hasExtra && (
                  <div className="col-span-2">
                    <Label htmlFor="pg-extra">Extra (third segment)</Label>
                    <Input id="pg-extra" value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={64} />
                  </div>
                )}
                {variant.hasExtra2 && (
                  <div className="col-span-2">
                    <Label htmlFor="pg-extra2">Extra 2 (fourth segment)</Label>
                    <Input id="pg-extra2" value={extra2} onChange={(e) => setExtra2(e.target.value)} maxLength={64} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- Icon --- for the focused badge, or — in batch mode — for
              EVERY picked badge that carries an icon slot. Gating on
              `variant.hasIcon` alone hid the whole editor whenever the
              focused badge was text-only (133 of 544), which read as batch
              icon editing being missing entirely. */}
          {(variant.hasIcon || multiMode) && (
            <div className="mt-4 border-t border-border pt-3" data-testid="icon-section">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Icon
              </h3>
              {multiMode && (
                <p className="mb-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] leading-snug text-foreground" data-testid="icon-batch-hint">
                  <Layers className="mr-1 inline h-3 w-3 align-[-1px]" aria-hidden />
                  Batch: this icon applies to all {selection.length} selected badges at once —
                  badges without an icon slot ignore it.
                </p>
              )}
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Icon source">
                {(["default", "curated", "custom", "none"] as IconMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={iconMode === m}
                    onClick={() => setIconMode(m)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                      iconMode === m
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {iconMode === "curated" && (
                <div className="mt-3">
                  <IconPicker
                    value={iconSlug}
                    onChange={setIconSlug}
                    brandPaths={iconPaths}
                  />
                  {selectedBrandHex && (
                    <div
                      className="mt-2 flex flex-wrap gap-1.5"
                      role="group"
                      aria-label="Brand color options"
                    >
                      <button
                        type="button"
                        aria-pressed={iconColorIsBrand}
                        title={`Color the icon with the brand hex ${selectedBrandHex}`}
                        onClick={() => setIconColor(iconColorIsBrand ? "" : "brand")}
                        className={cn(
                          "vx-press inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                          iconColorIsBrand
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-[3px] ring-1 ring-black/10"
                          style={{ background: selectedBrandHex }}
                          aria-hidden
                        />
                        brand icon color
                      </button>
                      <button
                        type="button"
                        aria-pressed={themeIsBrandSeed}
                        title={`Re-derive the whole badge palette from the brand color (${selectedBrandHex})`}
                        onClick={() =>
                          startTransition(() =>
                            setTheme((t) => ({
                              ...t,
                              name: "custom",
                              customSeed: selectedBrandHex,
                            })),
                          )
                        }
                        className={cn(
                          "vx-press inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                          themeIsBrandSeed
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        <span
                          className="inline-block h-3 w-3 rounded-[3px] text-center text-[6px] font-bold leading-[12px] text-white ring-1 ring-black/10"
                          style={{ background: selectedBrandHex }}
                          aria-hidden
                        >
                          Aa
                        </span>
                        brand badge seed
                      </button>
                    </div>
                  )}
                  <div className="mt-2">
                    <Label htmlFor="pg-icon-color">Icon color override</Label>
                    <Input
                      id="pg-icon-color"
                      placeholder="empty = themed ink · brand · #hex"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      maxLength={18}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Icons ride the badge’s themed ink by default (currentColor — white on dark
                    surfaces, dark on light). <code className="font-mono">brand</code> keeps the
                    brand’s own hex — brand-library icons only (icondata sets and custom SVG have
                    no canonical color); any CSS color overrides both.
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    The API resolves the same library via <code className="font-mono">?icon={iconSlug}</code> —
                    brand slugs (bare) and icondata slugs (<code className="font-mono">&lt;set&gt;-&lt;name&gt;</code>,
                    e.g. <code className="font-mono">mdi-account</code>).
                  </p>
                </div>
              )}
              {iconMode === "custom" && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="pg-custom-svg">Custom SVG</Label>
                    {plan === "free" && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent"
                        title="Uploading custom icons to the API is a Pro feature"
                      >
                        <Lock className="h-2.5 w-2.5" aria-hidden />
                        Pro
                      </span>
                    )}
                  </div>
                  <Textarea
                    id="pg-custom-svg"
                    rows={4}
                    placeholder={'<svg viewBox="0 0 24 24">…</svg>'}
                    value={customSvg}
                    onChange={(e) => setCustomSvg(e.target.value)}
                    aria-invalid={!sanitizeSvg(customSvg).svg}
                  />
                  {!sanitizeSvg(customSvg).svg && customSvg.trim() !== "" && (
                    <p role="alert" className="mt-1 text-[10px] text-danger">
                      {sanitizeSvg(customSvg).error}
                    </p>
                  )}
                  {plan === "free" ? (
                    <div className="mt-2 rounded-md border border-accent/30 bg-accent/5 p-2.5">
                      <p className="text-[11px] leading-snug text-foreground">
                        Put your own mark on any badge — upload once, reuse everywhere via{" "}
                        <code className="font-mono text-[10px]">?icon=upload:hash</code>.
                      </p>
                      <Link
                        to="/dashboard"
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                      >
                        Upgrade to Pro →
                      </Link>
                    </div>
                  ) : (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Upload at <code className="font-mono">POST /v1/icons</code> and reference{" "}
                      <code className="font-mono">?icon=upload:hash</code>.
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    The preview sanitizes in your browser; the API re-sanitizes server-side on
                    upload — scripts, event handlers and external references are stripped before
                    anything is stored.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* --- Appearance --- theme, mode and type in one block */}
          <div className="mt-4 border-t border-border pt-3">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Appearance
            </h3>
            <ThemePicker
              value={theme.name}
              customSeed={theme.customSeed}
              customSeed2={theme.customSeed2}
              dark={theme.dark}
              onChange={setThemeName}
              onCustomSeed={(hex) =>
                startTransition(() => setTheme((t) => ({ ...t, name: "custom", customSeed: hex })))
              }
              onSeed2={(hex) =>
                startTransition(() =>
                  setTheme((t) => ({ ...t, customSeed2: hex ?? undefined })),
                )
              }
              onDarkChange={(dark) => startTransition(() => setTheme((t) => ({ ...t, dark })))}
            />
            <div className="mt-2.5">
              <Label htmlFor="pg-font">Font</Label>
              <Input
                id="pg-font"
                list="pg-font-list"
                value={fontLabel}
                autoComplete="off"
                placeholder="Search fonts…"
                onChange={(e) => selectFont(e.target.value)}
              />
              <datalist id="pg-font-list">
                <option value="source">Source (badge design)</option>
                {BUNDLED_FONTS.map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {f.label}
                  </option>
                ))}
                {(googleFonts ?? []).map((f) => (
                  <option key={f.slug} value={f.slug}>
                    {`${f.family} — Google Fonts · ${f.category}`}
                  </option>
                ))}
              </datalist>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Server renders with bundled fonts: {BUNDLED_FONTS.map((f) => f.label).join(" · ")} —
                plus {(googleFonts?.length ?? 0) > 0
                  ? `${googleFonts!.length.toLocaleString()} Google Fonts`
                  : "the full Google Fonts catalog"}
                . Type a name to search.
              </p>
            </div>
          </div>

          {/* --- Output --- format, resolution and render source in one row */}
          <div className="mt-4 border-t border-border pt-3">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Output
            </h3>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Output format">
              {FORMATS.map((f) => {
                const locked = !planAllowsFormat(plan, f);
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={format === f}
                    onClick={() => chooseFormat(f)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                      format === f
                        ? "border-primary bg-primary text-primary-foreground"
                        : locked
                          ? "border-border text-muted-foreground/70 hover:border-danger/40"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                    )}
                  >
                    {locked && <Lock className="h-3 w-3" aria-hidden />}
                    {f}
                  </button>
                );
              })}
            </div>
            {formatNotice && (
              <p role="alert" className="mt-2 flex items-center gap-2 text-[11px] text-danger" data-testid="format-notice">
                {formatNotice}
                <Link to="/billing" className="font-semibold underline">
                  Open billing →
                </Link>
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Scale</span>
                <div className="flex gap-1" role="group" aria-label="Scale">
                  {([1, 2, 3] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={scale === s}
                      onClick={() => setScale(s)}
                      title={`Render at ${s}× pixel density — the preview shows it ${s}× larger`}
                      className={cn(
                        "vx-press rounded-full border px-2 py-0.5 font-mono text-[11px] focus-visible:outline-2 focus-visible:outline-accent",
                        scale === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                      )}
                    >
                      @{s}x
                    </button>
                  ))}
                </div>
              </div>
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
                <span>Render via API</span>
                <input
                  id="pg-api-mode"
                  type="checkbox"
                  role="switch"
                  aria-label="Render preview via the live API"
                  checked={apiMode && hasApiBase}
                  disabled={!hasApiBase}
                  onChange={(e) => setApiMode(e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
              </label>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Free: svg · png · jpg — keyless. Pro adds webp · gif · apng.{" "}
              {hasApiBase
                ? `API preview pulls the real bytes from ${apiClientUrlBase()} — cache headers, ETags and all.`
                : "Live API rendering isn't wired up on this deployment — SVG previews run entirely in your browser."}
            </p>
          </div>
      </section>

      {/* ------------------------------------------------- preview + snippets.
          Sticky on wide screens so the workbench stays one viewport tall. */}
      <section
        aria-label="Preview and output"
        className="min-w-0 space-y-4 lg:sticky lg:top-[72px]"
      >
          <div className="rounded-lg border border-border bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Live preview
              </h2>
              <span className="font-mono text-[10px] text-muted-foreground">
                {variant.id} · {themeName} · {format} @{scale}x · {""}
                {scale === 1 ? "fit" : `${scale}× preview`}
              </span>
            </div>
            {multiMode ? (
              /* --- selection stack: every picked badge with the shared
                  appearance and its own default slots + URL */
              <div className="space-y-3" data-testid="selection-stack">
                {selection.map((id) => {
                  const v = variantById(id);
                  if (!v) return null;
                  return (
                    <div key={id} className="rounded-md border border-border bg-muted/30 p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-semibold text-muted-foreground">
                          {v.id}
                        </span>
                        <CopyButton text={variantUrlFor(v)} label={`Copy ${v.id} URL`} />
                      </div>
                      <div
                        className="overflow-x-auto rounded-md border border-dashed border-border p-4 transition-colors"
                        style={previewSurfaceStyle(semantic)}
                      >
                        <div style={{ ...previewFontStyle, zoom: scale } as CSSProperties}>
                          <BadgeFrame ariaLabel={`${v.id} badge preview`} className="max-h-64">
                            {renderVariant({ variant: v, semantic, iconNode: makeIconNode(v) })}
                          </BadgeFrame>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-muted-foreground">
                    {selection.length} badges share the current appearance — each URL keeps its own
                    default slots.
                  </p>
                  <CopyButton
                    text={selection
                      .map((id) => variantUrlFor(variantById(id)!))
                      .join("\n")}
                    label="Copy all URLs"
                    variant="default"
                  />
                </div>
              </div>
            ) : showLiveComponent ? (
              <div
                className="overflow-x-auto rounded-md border border-dashed border-border bg-muted/40 p-6 transition-colors"
                style={previewSurfaceStyle(semantic)}
              >
                {/* zoom makes @2x/@3x VISIBLY multiply the preview (not just
                    the rendered pixel density that the API bytes carry) */}
                <div style={{ ...previewFontStyle, zoom: scale } as CSSProperties}>
                  <BadgeFrame ariaLabel="Playground badge preview" className="max-h-64">
                    {renderVariant({
                      variant,
                      label,
                      value,
                      extra,
                      semantic,
                      iconNode: iconNode === undefined ? undefined : iconNode,
                    })}
                  </BadgeFrame>
                </div>
              </div>
            ) : format !== "svg" ? (
              <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 p-6 text-center">
                {apiMode && hasApiBase ? (
                  <img src={absoluteUrl} alt={`${label}: ${value} badge preview`} className="max-h-64 max-w-full" />
                ) : (
                  <>
                    <p className="text-xs font-medium">{format.toUpperCase()} renders via the API</p>
                    <p className="max-w-sm text-[11px] text-muted-foreground">
                      Raster formats are produced server-side by vexillum. Copy the URL below, or
                      configure <code className="font-mono">VITE_API_BASE</code> and enable “Render
                      via API” to see it here.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/40 p-6 text-center">
                {apiMode && hasApiBase ? (
                  <img src={absoluteUrl} alt={`${label}: ${value} badge preview`} className="max-h-64 max-w-full" />
                ) : (
                  <>
                    <Info className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <p className="max-w-sm text-[11px] text-muted-foreground">
                      Live component preview unavailable for this state — enable “Render via API” or
                      adjust the icon source.
                    </p>
                  </>
                )}
              </div>
            )}
            <p className="mt-3 text-center font-mono text-[10px] text-muted-foreground">
              {formatCount(PLANS[plan].dailyQuota)} req/day on {plan === "free" ? "Free" : PLANS[plan].name} — this
              preview is local and unmetered.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <Tabs tabs={OUTPUT_TABS} active={outputTab} onChange={setOutputTab} ariaLabel="Output format" />
              <CopyButton text={embeds[outputTab as keyof typeof embeds]} label="Copy snippet" variant="default" />
            </div>
            {/* the div is the sole scroll container so the bar hugs the
                block's bottom edge instead of floating above pre padding */}
            <div className="vx-scroll overflow-auto rounded-md bg-zinc-950">
              <pre className="m-0 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
                <code>{embeds[outputTab as keyof typeof embeds]}</code>
              </pre>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <Button variant="outline" size="sm" onClick={() => window.open(absoluteUrl, "_blank")}>
                Open URL
              </Button>
              {/* the current workbench as a link — the address bar carries the
                  same state, this copies it without leaving the page */}
              <CopyButton text={appShareUrl} label="Copy playground link" title={appShareUrl} />
              <span>
                {outputTab === "url"
                  ? "The canonical badge URL — cacheable, versioned by content hash."
                  : outputTab === "markdown"
                    ? "Paste into README.md — GitHub renders it inline."
                    : outputTab === "html"
                      ? "Accessible alt text included."
                      : "Bare <img> for embedding anywhere."}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function apiClientUrlBase(): string {
  // keep the absolute-origin logic in one place (tests stub window.location)
  return typeof window !== "undefined" && !import.meta.env.VITE_API_BASE
    ? window.location.origin
    : import.meta.env.VITE_API_BASE ?? "";
}

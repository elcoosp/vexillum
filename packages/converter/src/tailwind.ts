/**
 * Maps computed declarations to Tailwind utility classes where a faithful
 * mapping exists. Everything not in the table stays inline-styled — inline
 * styles are the source of truth for rendering; classes are additive DX.
 */
const WEIGHT: Record<string, string> = {
  "400": "font-normal",
  "500": "font-medium",
  "600": "font-semibold",
  "700": "font-bold",
  "800": "font-extrabold",
  "900": "font-black",
};

const FAMILY: Array<{ re: RegExp; cls: string }> = [
  { re: /JetBrains Mono|Space Mono/, cls: "font-mono" },
  { re: /Instrument Serif/, cls: "font-serif" },
  { re: /Inter/, cls: "font-sans" },
];

export interface TailwindMap {
  classes: string[];
  /** properties that were fully expressed by classes (safe to keep inline too) */
  matched: string[];
}

export function toTailwind(decl: Record<string, string>): TailwindMap {
  const out: string[] = [];
  const matched: string[] = [];

  const push = (cls: string, prop: string): void => {
    out.push(cls);
    matched.push(prop);
  };

  if (decl["display"] === "inline-flex") push("inline-flex", "display");
  else if (decl["display"] === "flex") push("flex", "display");
  else if (decl["display"] === "grid") push("grid", "display");

  switch (decl["flex-direction"]) {
    case "column": push("flex-col", "flex-direction"); break;
    case "column-reverse": push("flex-col-reverse", "flex-direction"); break;
    case "row-reverse": push("flex-row-reverse", "flex-direction"); break;
  }

  switch (decl["align-items"]) {
    case "center": push("items-center", "align-items"); break;
    case "flex-start": push("items-start", "align-items"); break;
    case "flex-end": push("items-end", "align-items"); break;
    case "baseline": push("items-baseline", "align-items"); break;
    case "stretch": push("items-stretch", "align-items"); break;
  }

  switch (decl["justify-content"]) {
    case "center": push("justify-center", "justify-content"); break;
    case "space-between": push("justify-between", "justify-content"); break;
    case "flex-end": push("justify-end", "justify-content"); break;
  }

  if (decl["gap"]) push(`gap-[${decl["gap"]}]`, "gap");
  if (decl["overflow"] === "hidden") push("overflow-hidden", "overflow");
  if (decl["position"] === "relative") push("relative", "position");
  if (decl["position"] === "absolute") push("absolute", "position");
  if (decl["white-space"] === "nowrap") push("whitespace-nowrap", "white-space");
  if (decl["flex-shrink"] === "0") push("shrink-0", "flex-shrink");
  if (decl["text-transform"] === "uppercase") push("uppercase", "text-transform");
  if (decl["font-style"] === "italic") push("italic", "font-style");
  if (decl["font-variant-numeric"] === "tabular-nums") push("tabular-nums", "font-variant-numeric");

  const size = decl["font-size"];
  if (size && /^\d+px$/.test(size)) push(`text-[${size}]`, "font-size");

  const weight = decl["font-weight"];
  if (weight && WEIGHT[weight]) push(WEIGHT[weight], "font-weight");

  const radius = decl["border-radius"];
  if (radius) {
    if (radius === "999px" || radius === "9999px") push("rounded-full", "border-radius");
    else if (/^[\d.]+px$/.test(radius)) push(`rounded-[${radius}]`, "border-radius");
  }

  const family = decl["font-family"];
  if (family) {
    for (const f of FAMILY) {
      if (f.re.test(family)) {
        push(f.cls, "font-family");
        break;
      }
    }
  }

  const lh = decl["line-height"];
  if (lh === "1") push("leading-none", "line-height");

  return { classes: out, matched };
}

/** Pads `padding: 0 12px` → `px-[12px] py-0` style classes where clean. */
export function paddingClasses(pad: string): string[] | null {
  const parts = pad.split(/\s+/);
  const px = (v: string) => /^\d+px$/.test(v);
  switch (parts.length) {
    case 1:
      return px(parts[0]) ? [`p-[${parts[0]}]`] : null;
    case 2:
      if (px(parts[0]) && px(parts[1]))
        return [`py-[${parts[0]}]`, `px-[${parts[1]}]`];
      return null;
    case 3:
      if (px(parts[0]) && px(parts[1]) && px(parts[2]))
        return [`pt-[${parts[0]}]`, `px-[${parts[1]}]`, `pb-[${parts[2]}]`];
      return null;
    case 4:
      if (parts.every(px))
        return [`pt-[${parts[0]}]`, `pr-[${parts[1]}]`, `pb-[${parts[2]}]`, `pl-[${parts[3]}]`];
      return null;
    default:
      return null;
  }
}

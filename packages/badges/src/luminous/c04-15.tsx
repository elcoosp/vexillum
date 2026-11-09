// c04-15 · Rotating halo — Luminous
// Redesigned 2026-10: the previous build duplicated c02-14's conic sweep
// behind the whole badge (same structure, same timing). This version keeps
// the proven rotating-layer placement but is visually its own badge: TWO
// opposite comet arcs (70°–150° / 250°–330°) orbit the pill every 4s — a
// halo pair, not c02-14's five ray spokes — over a calm body with a ringed
// icon core. Static renders freeze the arcs at their from-angle; animated
// renders orbit them. Shadows stick to rgba() colors: the Rust renderer's
// DPR>1 path renders oklch-alpha box-shadows at full opacity (probed), so
// glow shadows on templates must stay rgba or drop out.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0415({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-15 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-m-a-38-w, oklch(0.8568 0.0739 259.82))", "borderRadius": "999px", "padding": "0 12px 0 7px", "gap": "8px", "position": "relative", "boxShadow": "0 1px 4px rgba(0,0,0,0.06)" }}>
      <span className="halo absolute rounded-[10px]" tw="absolute rounded-[10px]" style={{ "position": "absolute", "background": "conic-gradient(from 0deg, transparent 0deg, var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15)) 40deg, var(--vx-m-a-80-t, oklch(0.6231 0.1880 259.81 / 0.80)) 70deg, var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15)) 100deg, transparent 140deg, transparent 180deg, var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15)) 220deg, var(--vx-m-a-80-t, oklch(0.6231 0.1880 259.81 / 0.80)) 250deg, var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15)) 280deg, transparent 320deg, transparent 360deg)", "borderRadius": "10px", "zIndex": "-1", "animation": "vx-rot 4s linear infinite", "top": "-5px", "right": "-5px", "bottom": "-5px", "left": "-5px", "boxSizing": "content-box" }} aria-hidden="true"></span>
      <span className="icon-ring inline-flex items-center justify-center relative" tw="inline-flex items-center justify-center relative" style={{ "width": "20px", "height": "20px", "borderRadius": "50%", "border": "1.5px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "position": "relative", "zIndex": "1", "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
        {icon ?? <IconSlot />}
      </span>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}
      </span>
      <span className="sep" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}>
        {"·"}
      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81))", "fontWeight": "700" }}>
        {value}
      </span>
    </div>
  );
}

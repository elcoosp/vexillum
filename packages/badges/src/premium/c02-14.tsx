// c02-14 · Radiant rays — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0214({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-14 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "0 2px 6px rgba(0,0,0,0.06)" }}>
      <span className="absolute rounded-[8px]" tw="absolute rounded-[8px]" style={{ "position": "absolute", "background": "conic-gradient(from 0deg, transparent 0deg, var(--vx-m-a-20-t, oklch(0.6231 0.1880 259.81 / 0.20)) 30deg, transparent 60deg, var(--vx-m-a-20-t, oklch(0.6231 0.1880 259.81 / 0.20)) 120deg, transparent 150deg, var(--vx-m-a-20-t, oklch(0.6231 0.1880 259.81 / 0.20)) 210deg, transparent 240deg, var(--vx-m-a-20-t, oklch(0.6231 0.1880 259.81 / 0.20)) 300deg, transparent 330deg, var(--vx-m-a-20-t, oklch(0.6231 0.1880 259.81 / 0.20)) 360deg)", "borderRadius": "8px", "zIndex": "-1", "animation": "vx-rot 8s linear infinite", "top": "-4px", "right": "-4px", "bottom": "-4px", "left": "-4px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-b-100, oklch(0.8819 0.0331 263.82))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-strong, oklch(0.2596 0.0505 264.08))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}

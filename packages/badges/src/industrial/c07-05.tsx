// c07-05 · Engraved plate — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0705({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-05 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "linear-gradient(180deg, var(--vx-metal-1, oklch(0.9032 0.0204 264.15)) 0%, var(--vx-metal-2, oklch(0.7001 0.0445 261.10)) 100%)", "border": "1px solid var(--vx-metal-3, oklch(0.5669 0.0596 263.36))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.2)" }}>
      <span className="absolute rounded-[2px]" tw="absolute rounded-[2px]" style={{ "position": "absolute", "border": "1px solid rgba(255,255,255,0.4)", "borderRadius": "2px", "pointerEvents": "none", "top": "2px", "right": "2px", "bottom": "2px", "left": "2px", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative uppercase text-[11px] font-bold" tw="relative uppercase text-[11px] font-bold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em", "fontSize": "11px", "textShadow": "0 1px 0 rgba(255,255,255,0.6)" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {"·"}

      </span>
      <span className="value relative font-extrabold" tw="relative font-extrabold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800", "textShadow": "0 1px 0 rgba(255,255,255,0.6)" }}>
        {value}

      </span>

    </div>
  );
}

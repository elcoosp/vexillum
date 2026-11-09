// c04-02 · Holographic sweep — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0402({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-02 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(135deg, var(--vx-a-muted, oklch(0.9623 0.0188 259.81)) 0%, var(--vx-a-soft, oklch(0.9058 0.0470 259.81)) 50%, var(--vx-a-muted, oklch(0.9623 0.0188 259.81)) 100%)", "border": "1px solid var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "boxShadow": "0 2px 8px var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15))", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "background": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)", "transform": "translateX(-100%)", "animation": "vx-shim 3s infinite", "top": "0", "right": "0", "bottom": "0", "left": "0", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))" }}>
        {label}

      </span>
      <span className="sep relative" tw="relative" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}>
        {"·"}

      </span>
      <span className="value relative font-bold" tw="relative font-bold" style={{ "position": "relative", "zIndex": "1", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}

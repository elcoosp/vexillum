// c09-11 · Fiber bottom — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0911({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-11 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-d-surface, oklch(0.2971 0.0301 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "border": "1px solid var(--vx-d-border, oklch(0.4355 0.0700 259.75))", "position": "relative", "overflow": "hidden" }}>
      <span className="absolute" tw="absolute" style={{ "position": "absolute", "left": "0", "right": "0", "bottom": "0", "height": "2px", "background": "linear-gradient(90deg, var(--vx-ok, oklch(0.6959 0.1491 162.48)) 0%, var(--vx-a, oklch(0.6231 0.1880 259.81)) 50%, var(--vx-a, oklch(0.6231 0.1880 259.81)) 100%)", "boxShadow": "0 0 8px var(--vx-m-a-60-t, oklch(0.6231 0.1880 259.81 / 0.60))", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>
      <div className="icon inline-flex items-center relative" tw="inline-flex items-center relative" style={{ "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "display": "inline-flex", "alignItems": "center", "height": "100%", "position": "relative", "zIndex": "1" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label relative text-[11px]" tw="relative text-[11px]" style={{ "color": "var(--vx-d-text, oklch(0.8971 0.0240 264.06))", "position": "relative", "zIndex": "1", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep relative" tw="relative" style={{ "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "position": "relative", "zIndex": "1" }}></div>
      <span className="value relative text-[11px]" tw="relative text-[11px]" style={{ "color": "var(--vx-v-d-text, oklch(0.8971 0.0240 264.06))", "fontSize": "11px", "position": "relative", "zIndex": "1" }}>
        {value}

      </span>

    </div>
  );
}

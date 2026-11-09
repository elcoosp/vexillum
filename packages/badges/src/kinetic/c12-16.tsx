// c12-16 · Indeterminate — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1216({ label }: BadgeProps) {
  return (
    <div className="badge c12-16 inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "overflow": "hidden", "position": "relative" }}>
      <div className="track overflow-hidden relative rounded-[2px]" tw="overflow-hidden relative rounded-[2px]" style={{ "width": "60px", "height": "4px", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "borderRadius": "2px", "overflow": "hidden", "position": "relative" }}>
        <span className="absolute rounded-[2px]" tw="absolute rounded-[2px]" style={{ "position": "absolute", "top": "0", "bottom": "0", "width": "30%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "2px", "animation": "indeterminate 1.5s ease-in-out infinite", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true"></span>

      </div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>

    </div>
  );
}

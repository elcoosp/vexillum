// c12-02 · Progress meter — Kinetic
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1202({ label, value }: BadgeProps) {
  return (
    <div className="badge c12-02 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <div className="meter overflow-hidden relative rounded-[3px]" tw="overflow-hidden relative rounded-[3px]" style={{ "width": "60px", "height": "6px", "background": "var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "3px", "overflow": "hidden", "position": "relative" }}>
        <span className="absolute rounded-[3px]" tw="absolute rounded-[3px]" style={{ "position": "absolute", "left": "0", "top": "0", "bottom": "0", "width": "78%", "background": "linear-gradient(90deg, var(--vx-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-a-bright, oklch(0.7738 0.1128 259.81)) 100%)", "borderRadius": "3px", "animation": "vx-fill 2s ease-out", "boxSizing": "content-box" }} data-pseudo="after" aria-hidden="true"></span>

      </div>
      <span className="value tabular-nums font-bold" tw="tabular-nums font-bold" style={{ "color": "var(--vx-v-t-strong, oklch(0.2596 0.0505 264.08))", "fontWeight": "700", "fontVariantNumeric": "tabular-nums" }}>
        {value}

      </span>

    </div>
  );
}

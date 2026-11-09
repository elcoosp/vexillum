// c01-14 · Tri-segment — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0114({ label, value, extra, icon }: BadgeProps) {
  return (
    <div className="badge c01-14 inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "borderRadius": "6px", "overflow": "hidden", "boxShadow": "0 1px 3px rgba(0,0,0,0.06)" }}>
      <div className="seg seg1 inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "padding": "0 10px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%", "borderRight": "1px solid var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))" }}>
        {icon ?? <IconSlot />}
        <span>
          {label}

        </span>

      </div>
      <div className="seg seg2 inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "padding": "0 10px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%", "borderRight": "1px solid var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))" }}>
        <span>
          {value}

        </span>

      </div>
      <div className="seg seg3 inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "padding": "0 10px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%", "borderRight": "none", "background": "var(--vx-a-soft, oklch(0.9058 0.0470 259.81))", "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))" }}>
        <span>
          {extra}

        </span>

      </div>

    </div>
  );
}

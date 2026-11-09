// c15-04 · Gray dot — Status
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1504({ label, value }: BadgeProps) {
  return (
    <div className="badge c15-04 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "transparent", "border": "1px dashed var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "6px", "padding": "0 10px", "gap": "8px" }}>
      <div className="dot" style={{ "width": "8px", "height": "8px", "borderRadius": "50%", "background": "transparent", "border": "2px solid var(--vx-b-300, oklch(0.6820 0.0783 260.80))" }}></div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-subtle, oklch(0.6937 0.0563 260.99))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}

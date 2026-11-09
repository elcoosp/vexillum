// c13-10 · Stacked bar — Data
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1310({ label, value }: BadgeProps) {
  return (
    <div className="badge c13-10 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="stack flex overflow-hidden rounded-[4px]" tw="flex overflow-hidden rounded-[4px]" style={{ "display": "flex", "width": "60px", "height": "8px", "borderRadius": "4px", "overflow": "hidden" }}>
        <span className="s1" style={{ "height": "100%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "flex": "4" }}></span>
        <span className="s2" style={{ "height": "100%", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "flex": "3" }}></span>
        <span className="s3" style={{ "height": "100%", "background": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "flex": "2" }}></span>
        <span className="s4" style={{ "height": "100%", "background": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "flex": "1" }}></span>

      </div>
      <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {label}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}

// c13-12 · Signal meter — Data
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1312({ label, value }: BadgeProps) {
  return (
    <div className="badge c13-12 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px" }}>
      <div className="meter flex gap-[2px]" tw="flex gap-[2px]" style={{ "display": "flex", "gap": "2px" }}>
        <span className="on rounded-[1px]" tw="rounded-[1px]" style={{ "width": "4px", "height": "12px", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "borderRadius": "1px" }}></span>
        <span className="on rounded-[1px]" tw="rounded-[1px]" style={{ "width": "4px", "height": "12px", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "borderRadius": "1px" }}></span>
        <span className="on rounded-[1px]" tw="rounded-[1px]" style={{ "width": "4px", "height": "12px", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "borderRadius": "1px" }}></span>
        <span className="on rounded-[1px]" tw="rounded-[1px]" style={{ "width": "4px", "height": "12px", "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "borderRadius": "1px" }}></span>
        <span className="warn rounded-[1px]" tw="rounded-[1px]" style={{ "width": "4px", "height": "12px", "background": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "borderRadius": "1px" }}></span>
        <span className="rounded-[1px]" tw="rounded-[1px]" style={{ "width": "4px", "height": "12px", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "borderRadius": "1px" }}></span>
        <span className="rounded-[1px]" tw="rounded-[1px]" style={{ "width": "4px", "height": "12px", "background": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "borderRadius": "1px" }}></span>

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

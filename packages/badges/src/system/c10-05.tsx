// c10-05 · Breadcrumb — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1005({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c10-05 inline-flex items-center gap-[4px] whitespace-nowrap text-[11px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[4px] whitespace-nowrap text-[11px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "11px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 10px", "gap": "4px", "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
      <span className="crumb inline-flex items-center gap-[4px]" tw="inline-flex items-center gap-[4px]" style={{ "display": "inline-flex", "alignItems": "center", "gap": "4px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-s-300, oklch(0.9171 0.0414 259.81))" }}>
        {value}

      </span>
      <span className="crumb inline-flex items-center gap-[4px]" tw="inline-flex items-center gap-[4px]" style={{ "display": "inline-flex", "alignItems": "center", "gap": "4px" }}>
        {extra}

      </span>
      <span className="sep" style={{ "color": "var(--vx-s-300, oklch(0.9171 0.0414 259.81))" }}>
        {"›"}

      </span>
      <span className="crumb active inline-flex items-center gap-[4px] font-semibold" tw="inline-flex items-center gap-[4px] font-semibold" style={{ "display": "inline-flex", "alignItems": "center", "gap": "4px", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "600" }}>
        {"badges"}

      </span>

    </div>
  );
}

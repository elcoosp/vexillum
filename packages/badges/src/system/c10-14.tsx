// c10-14 · Version rail — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1014({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c10-14 inline-flex items-center gap-[6px] whitespace-nowrap text-[11px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[11px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "11px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 10px", "gap": "6px", "fontFamily": "'JetBrains Mono', monospace" }}>
      <span className="from" style={{ "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "textDecoration": "line-through" }}>
        {label}

      </span>
      <span className="arrow" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {value}

      </span>
      <span className="to font-semibold" tw="font-semibold" style={{ "color": "var(--vx-m-ok-60-000000, oklch(0.4175 0.0895 162.48))", "fontWeight": "600" }}>
        {extra}

      </span>

    </div>
  );
}

// c10-02 · Syntax chip — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1002({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c10-02 inline-flex items-center gap-[6px] whitespace-nowrap text-[11px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[11px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "11px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-50, oklch(0.9812 0.0094 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "6px", "padding": "0 10px", "gap": "6px", "fontFamily": "'JetBrains Mono', monospace" }}>
      <span className="kw" style={{ "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))" }}>
        {label}

      </span>
      <span className="var" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}>
        {value}

      </span>
      <span className="op" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {extra}

      </span>
      <span className="num" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}>
        {"1"}

      </span>

    </div>
  );
}

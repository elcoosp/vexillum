// c09-10 · Amber warn — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0910({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-10 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderBottom": "3px solid var(--vx-warn, oklch(0.7686 0.1647 70.08))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep" style={{ "color": "var(--vx-m-warn-60-000000, oklch(0.4612 0.0988 70.08))" }}>
        {"·"}

      </div>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-warn, oklch(0.7686 0.1647 70.08))", "fontSize": "11px" }}>
        {value}

      </span>

    </div>
  );
}

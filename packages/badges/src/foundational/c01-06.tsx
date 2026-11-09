// c01-06 · Outlined — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0106({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c01-06 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "transparent", "border": "1.5px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "6px", "padding": "0 12px 0 8px", "gap": "8px" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))" }}>
        {label}

      </span>
      <div className="sep shrink-0" tw="shrink-0" style={{ "width": "1px", "height": "12px", "background": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "flexShrink": "0" }}></div>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-a-ink, oklch(0.3427 0.1034 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}

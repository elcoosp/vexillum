// c02-01 · Gradient edge — Premium
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0201({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c02-01 inline-flex items-center whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "padding": "1px", "borderRadius": "8px", "background": "linear-gradient(135deg, var(--vx-a, oklch(0.6231 0.1880 259.81)) 0%, var(--vx-a-bright, oklch(0.7738 0.1128 259.81)) 100%)", "boxShadow": "0 2px 8px var(--vx-m-a-15-t, oklch(0.6231 0.1880 259.81 / 0.15))" }}>
      <div className="inner inline-flex items-center gap-[8px] rounded-[7px]" tw="inline-flex items-center gap-[8px] rounded-[7px]" style={{ "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "borderRadius": "7px", "padding": "0 12px 0 8px", "display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "22px" }}>
        <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
          {icon ?? <IconSlot />}

        </div>
        <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
          {label}

        </span>
        <div className="sep shrink-0" tw="shrink-0" style={{ "width": "1px", "height": "12px", "background": "var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "flexShrink": "0" }}></div>
        <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-strong, oklch(0.2596 0.0505 264.08))", "fontWeight": "700" }}>
          {value}

        </span>

      </div>

    </div>
  );
}

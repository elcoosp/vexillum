// c01-13 · Floating label — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0113({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c01-13 inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex flex-col items-start gap-[4px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "gap": "4px", "maxWidth": "326px" }}>
      <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "fontSize": "10px", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "textTransform": "uppercase", "letterSpacing": "0.08em", "fontWeight": "600" }}>
        {label}

      </span>
      <div className="value inline-flex items-center gap-[6px] font-semibold rounded-[4px]" tw="inline-flex items-center gap-[6px] font-semibold rounded-[4px]" style={{ "height": "24px", "background": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 12px", "borderRadius": "4px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "fontWeight": "600", "boxShadow": "0 2px 4px rgba(0,0,0,0.1)" }}>
        {icon ?? <IconSlot />}
        <span style={{ "whiteSpace": "normal" }}>
          {value}

        </span>

      </div>

    </div>
  );
}

// c01-15 · Half-framed — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0115({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c01-15 inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px" }}>
      <div className="main inline-flex items-center gap-[8px]" tw="inline-flex items-center gap-[8px]" style={{ "height": "100%", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-200, oklch(0.8170 0.0486 258.66))", "borderRadius": "13px 4px 4px 13px", "padding": "0 12px 0 8px", "display": "inline-flex", "alignItems": "center", "gap": "8px", "boxShadow": "0 1px 2px rgba(0,0,0,0.03)" }}>
        <span className="label" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
          {label}

        </span>
        <span className="sep" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))" }}>
          {"·"}

        </span>
        <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
          {value}

        </span>

      </div>
      <div className="tag inline-flex items-center uppercase text-[10px] font-bold" tw="inline-flex items-center uppercase text-[10px] font-bold" style={{ "height": "100%", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "borderRadius": "4px 13px 13px 4px", "padding": "0 10px", "display": "inline-flex", "alignItems": "center", "fontSize": "10px", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.08em", "marginLeft": "-4px", "boxShadow": "0 1px 2px var(--vx-m-a-30-t, oklch(0.6231 0.1880 259.81 / 0.30))" }}>
        {extra}

      </div>

    </div>
  );
}

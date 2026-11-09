// c01-08 · Inverted brand — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0108({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c01-08 inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "borderRadius": "4px", "overflow": "hidden", "boxShadow": "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div className="label inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "background": "linear-gradient(180deg, var(--vx-a-deep, oklch(0.6368 0.2078 25.33)) 0%, var(--vx-a-deep, oklch(0.6368 0.2078 25.33)) 100%)", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "padding": "0 10px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.2)" }}>
        {icon ?? <IconSlot />}
        <span>
          {label}

        </span>

      </div>
      <div className="value inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "background": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "color": "var(--vx-v-a-deep, oklch(0.6368 0.2078 25.33))", "padding": "0 12px", "borderLeft": "1px solid rgba(0,0,0,0.06)", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%" }}>
        <span>
          {value}

        </span>

      </div>

    </div>
  );
}

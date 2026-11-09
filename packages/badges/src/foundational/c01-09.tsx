// c01-09 · Monochrome — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0109({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c01-09 inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "borderRadius": "6px", "overflow": "hidden", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
      <div className="label inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "padding": "0 10px", "borderRight": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%" }}>
        {icon ?? <IconSlot />}
        <span>
          {label}

        </span>

      </div>
      <div className="value inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "background": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%" }}>
        <span>
          {value}

        </span>

      </div>

    </div>
  );
}

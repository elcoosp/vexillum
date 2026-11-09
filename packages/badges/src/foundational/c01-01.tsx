// c01-01 · Two-tone split — Foundational
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0101({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c01-01 inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "borderRadius": "6px", "overflow": "hidden", "boxShadow": "0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)" }}>
      <div className="label inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "background": "linear-gradient(180deg, var(--vx-s-100, oklch(0.9661 0.0169 259.81)) 0%, var(--vx-b-100, oklch(0.8819 0.0331 263.82)) 100%)", "color": "var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "padding": "0 10px", "borderRight": "1px solid var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%" }}>
        {icon ?? <IconSlot />}
        <span>
          {label}

        </span>

      </div>
      <div className="value inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "background": "linear-gradient(180deg, var(--vx-v-t-strong, oklch(0.2596 0.0505 264.08)) 0%, var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81)) 100%)", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "100%" }}>
        <span>
          {value}

        </span>

      </div>

    </div>
  );
}

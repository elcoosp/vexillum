// c11-15 · Double chevron — Experimental
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1115({ label, value }: BadgeProps) {
  return (
    <div className="badge c11-15 inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px" }}>
      <div className="step inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "height": "100%", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "clipPath": "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)" }}>
        <span className="label font-semibold" tw="font-semibold" style={{ "fontWeight": "600", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
          {label}

        </span>

      </div>
      <div className="step inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "height": "100%", "background": "var(--vx-t-strong, oklch(0.2596 0.0505 264.08))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "clipPath": "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)", "marginLeft": "-8px" }}>
        <span className="value font-extrabold" tw="font-extrabold" style={{ "fontWeight": "800", "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))" }}>
          {value}

        </span>

      </div>

    </div>
  );
}

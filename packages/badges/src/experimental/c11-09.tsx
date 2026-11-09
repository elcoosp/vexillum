// c11-09 · Diptych pair — Experimental
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1109({ label, value }: BadgeProps) {
  return (
    <div className="badge c11-09 inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px" }}>
      <div className="left inline-flex items-center gap-[6px]" tw="inline-flex items-center gap-[6px]" style={{ "height": "100%", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 12px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "clipPath": "polygon(0 0, 100% 0, 90% 100%, 0 100%)" }}>
        <span className="label">
          {label}

        </span>

      </div>
      <div className="right inline-flex items-center gap-[6px] font-extrabold" tw="inline-flex items-center gap-[6px] font-extrabold" style={{ "height": "100%", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "padding": "0 12px 0 16px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "marginLeft": "-8px", "fontWeight": "800" }}>
        <span className="value">
          {value}

        </span>

      </div>

    </div>
  );
}

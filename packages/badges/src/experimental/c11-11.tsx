// c11-11 · Skewed — Experimental
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1111({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c11-11 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "padding": "0 16px", "gap": "8px", "transform": "skewX(-10deg)" }}>
      <div className="icon" style={{ "transform": "skewX(10deg)", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-bold" tw="font-bold" style={{ "transform": "skewX(10deg)", "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {label}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "transform": "skewX(10deg)", "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}

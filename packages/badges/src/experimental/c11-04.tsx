// c11-04 · Perforated stub — Experimental
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1104({ label, value }: BadgeProps) {
  return (
    <div className="badge c11-04 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px dashed var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "padding": "0 16px", "gap": "8px", "clipPath": "polygon(0 0, 100% 0, 100% 100%, 85% 100%, 85% 85%, 15% 85%, 15% 100%, 0 100%)" }}>
      <span className="label font-bold" tw="font-bold" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}

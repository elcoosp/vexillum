// c05-03 · Thick border — Brutalist
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0503({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c05-03 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "3px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px" }}>
      <div className="icon" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase font-extrabold" tw="uppercase font-extrabold" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800", "textTransform": "uppercase", "letterSpacing": "0.05em" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}

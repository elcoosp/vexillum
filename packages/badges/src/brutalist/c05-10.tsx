// c05-10 · Yellow punch — Brutalist
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0510({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c05-10 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "boxShadow": "3px 3px 0 var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
      <div className="icon" style={{ "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase font-extrabold" tw="uppercase font-extrabold" style={{ "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))", "fontWeight": "800", "textTransform": "uppercase" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-m-a-55-000000, oklch(0.3427 0.1034 259.81))", "opacity": "0.7" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-a-on, oklch(1.0000 0.0000 89.88))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}

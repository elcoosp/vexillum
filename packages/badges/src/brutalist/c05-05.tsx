// c05-05 · Dark offset — Brutalist
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0505({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c05-05 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "border": "2px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "boxShadow": "4px 4px 0 var(--vx-a, oklch(0.6231 0.1880 259.81))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-bold" tw="font-bold" style={{ "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-b-300, oklch(0.6820 0.0783 260.80))" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}

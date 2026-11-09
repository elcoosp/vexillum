// c05-15 · Torn — Brutalist
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0515({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c05-15 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 12px", "gap": "8px", "clipPath": "polygon(0 0, 100% 0, 100% 70%, 95% 100%, 0 100%)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase font-bold" tw="uppercase font-bold" style={{ "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em" }}>
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

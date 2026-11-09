// c11-07 · Elongated octagon — Experimental
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1107({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c11-07 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "28px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 20px", "gap": "8px", "clipPath": "polygon(10% 0, 90% 0, 100% 30%, 100% 70%, 90% 100%, 10% 100%, 0 70%, 0 30%)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label font-semibold" tw="font-semibold" style={{ "fontWeight": "600", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
        {label}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "fontWeight": "800", "color": "var(--vx-v-a-bright, oklch(0.7738 0.1128 259.81))" }}>
        {value}

      </span>

    </div>
  );
}

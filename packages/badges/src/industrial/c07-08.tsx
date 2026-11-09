// c07-08 · Stenciled — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0708({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-08 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontFamily": "'Space Mono', monospace", "letterSpacing": "0.1em" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[10px]" tw="text-[10px]" style={{ "color": "var(--vx-d-text, oklch(0.8971 0.0240 264.06))", "fontSize": "10px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-b-300, oklch(0.6820 0.0783 260.80))" }}>
        {"·"}

      </span>
      <span className="value text-[10px] font-bold" tw="text-[10px] font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700", "fontSize": "10px" }}>
        {value}

      </span>

    </div>
  );
}

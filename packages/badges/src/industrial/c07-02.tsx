// c07-02 · Hazard — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0702({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-02 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "boxShadow": "0 2px 4px rgba(0,0,0,0.2)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase font-extrabold" tw="uppercase font-extrabold" style={{ "fontWeight": "800", "textTransform": "uppercase", "letterSpacing": "0.05em", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))" }}>
        {label}

      </span>
      <span className="sep" style={{ "opacity": "0.5" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "fontWeight": "800", "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))" }}>
        {value}

      </span>

    </div>
  );
}

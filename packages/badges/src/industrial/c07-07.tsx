// c07-07 · Anodized — Industrial
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0707({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c07-07 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(180deg, var(--vx-metal-3, oklch(0.5669 0.0596 263.36)) 0%, var(--vx-metal-4, oklch(0.4430 0.0747 259.76)) 100%)", "border": "1px solid var(--vx-t-body, oklch(0.4105 0.0542 259.75))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "boxShadow": "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase text-[11px] font-bold" tw="uppercase text-[11px] font-bold" style={{ "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700", "textTransform": "uppercase", "letterSpacing": "0.05em", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "opacity": "0.5" }}>
        {"·"}

      </span>
      <span className="value font-extrabold" tw="font-extrabold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "800" }}>
        {value}

      </span>

    </div>
  );
}

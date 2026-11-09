// c03-02 · Chamfered — Technical
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0302({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-02 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(180deg, var(--vx-t-strong, oklch(0.2596 0.0505 264.08)) 0%, var(--vx-t-heading, oklch(0.0935 0.0282 259.81)) 100%)", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "padding": "0 14px", "gap": "8px", "clipPath": "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)", "boxShadow": "0 2px 6px rgba(0,0,0,0.15)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase text-[11px]" tw="uppercase text-[11px]" style={{ "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "fontSize": "11px", "textTransform": "uppercase", "letterSpacing": "0.08em" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-b-strong, oklch(0.4678 0.1167 258.48))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}

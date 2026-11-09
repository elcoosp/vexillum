// c10-10 · Checkbox — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1010({ label, icon }: BadgeProps) {
  return (
    <div className="badge c10-10 inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "6px", "padding": "0 10px", "gap": "6px" }}>
      <div className="check inline-flex items-center justify-center rounded-[4px]" tw="inline-flex items-center justify-center rounded-[4px]" style={{ "width": "16px", "height": "16px", "borderRadius": "4px", "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "color": "var(--vx-a-on, oklch(1.0000 0.0000 89.88))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[12px] font-medium" tw="text-[12px] font-medium" style={{ "color": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "fontSize": "12px", "fontWeight": "500" }}>
        {label}

      </span>

    </div>
  );
}

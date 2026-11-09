// c14-02 · Stars — Social
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1402({ label, icon }: BadgeProps) {
  return (
    <div className="badge c14-02 inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px", "padding": "0 12px 0 8px", "gap": "6px", "boxShadow": "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-strong, oklch(0.2596 0.0505 264.08))", "fontWeight": "700" }}>
        {label}

      </span>

    </div>
  );
}

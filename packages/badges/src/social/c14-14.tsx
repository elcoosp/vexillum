// c14-14 · Reddit — Social
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1414({ label, icon }: BadgeProps) {
  return (
    <div className="badge c14-14 inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "2px dotted var(--vx-warn, oklch(0.7686 0.1647 70.08))", "borderRadius": "999px", "padding": "0 10px", "gap": "6px" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700" }}>
        {label}

      </span>

    </div>
  );
}

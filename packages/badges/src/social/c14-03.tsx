// c14-03 · Forks — Social
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1403({ label, icon }: BadgeProps) {
  return (
    <div className="badge c14-03 inline-flex items-center gap-[0] overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[0] overflow-hidden whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "999px", "padding": "0 10px 0 0", "gap": "0", "boxShadow": "0 1px 2px rgba(0,0,0,0.03)", "overflow": "hidden" }}>
      <div className="icon inline-flex items-center justify-center" tw="inline-flex items-center justify-center" style={{ "width": "24px", "height": "24px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "color": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-t-heading, oklch(0.0935 0.0282 259.81))", "fontWeight": "700", "paddingLeft": "8px" }}>
        {label}

      </span>

    </div>
  );
}

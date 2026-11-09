// c04-09 · Moonbeam — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0409({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-09 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "linear-gradient(135deg, var(--vx-s-200, oklch(0.9435 0.0282 259.81)) 0%, var(--vx-a-bright, oklch(0.7738 0.1128 259.81)) 100%)", "border": "1px solid var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "borderRadius": "999px", "padding": "0 12px", "gap": "8px", "boxShadow": "0 2px 8px var(--vx-m-a-30-t, oklch(0.6231 0.1880 259.81 / 0.30)), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-a-deep, oklch(0.5109 0.1542 259.81))", "fontWeight": "700" }}>
        {value}

      </span>

    </div>
  );
}

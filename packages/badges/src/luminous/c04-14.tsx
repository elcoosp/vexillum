// c04-14 · Radiant rays — Luminous
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0414({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c04-14 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "999px", "padding": "0 14px 0 6px", "gap": "8px", "position": "relative", "backgroundImage": "repeating-linear-gradient(115deg, var(--vx-m-warn-16-t, oklch(0.7686 0.1647 70.08 / 0.16)) 0px, var(--vx-m-warn-16-t, oklch(0.7686 0.1647 70.08 / 0.16)) 2px, transparent 2px, transparent 7px)", "boxShadow": "0 0 14px var(--vx-m-warn-35-t, oklch(0.7686 0.1647 70.08 / 0.35)), inset 0 0 0 1px var(--vx-m-warn-40-t, oklch(0.7686 0.1647 70.08 / 0.40))" }}>
      <div className="icon-ring inline-flex items-center justify-center" tw="inline-flex items-center justify-center" style={{ "width": "18px", "height": "18px", "borderRadius": "50%", "border": "1.5px solid var(--vx-warn, oklch(0.7686 0.1647 70.08))", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "color": "var(--vx-warn, oklch(0.7686 0.1647 70.08))", "boxShadow": "0 0 8px var(--vx-m-warn-70-t, oklch(0.7686 0.1647 70.08 / 0.70)), inset 0 0 6px var(--vx-m-warn-40-t, oklch(0.7686 0.1647 70.08 / 0.40))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase text-[10px]" tw="uppercase text-[10px]" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "letterSpacing": "0.08em", "textTransform": "uppercase", "fontSize": "10px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))" }}>
        {"·"}

      </span>
      <span className="value font-bold" tw="font-bold" style={{ "color": "var(--vx-v-warn, oklch(0.7686 0.1647 70.08))", "fontWeight": "700", "textShadow": "0 0 8px var(--vx-v-m-warn-60-t, oklch(0.7686 0.1647 70.08 / 0.60))" }}>
        {value}

      </span>

    </div>
  );
}

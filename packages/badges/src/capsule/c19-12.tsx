// c19-12 · deep pair — Capsule
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1912({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c19-12 t-caps inline-flex items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" tw="inline-flex items-stretch overflow-hidden relative whitespace-nowrap text-[12px] font-semibold rounded-full leading-none" style={{ "display": "inline-flex", "alignItems": "stretch", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "relative", "height": "28px", "color": "var(--vx-t-heading, oklch(0.2400 0.0200 252.00))", "maxWidth": "100%", "borderRadius": "999px", "overflow": "hidden" }}>
      <span className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium" tw="inline-flex items-center gap-[6px] whitespace-nowrap font-medium" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 13px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-a-on, #ffffff)", "background": "var(--vx-a-deep, oklch(0.4000 0.1200 252.00))", "whiteSpace": "nowrap" }}>
        {icon ?? <IconSlot />}
        {label}

      </span>
      <span className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" tw="inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold" style={{ "boxSizing": "border-box", "margin": "0", "padding": "0 13px", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-on, #ffffff)", "fontVariantNumeric": "tabular-nums", "background": "var(--vx-v-a, oklch(0.5400 0.1600 252.00))", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}

// c13-05 · Pie chart — Data
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1305({ label, value, extra }: BadgeProps) {
  return (
    <div className="badge c13-05 inline-flex flex-col items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" tw="inline-flex flex-col items-center gap-[6px] whitespace-nowrap text-[12px] font-semibold rounded-[8px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "background": "var(--vx-s-white, oklch(0.9925 0.0038 259.81))", "border": "1px solid var(--vx-b-100, oklch(0.8819 0.0331 263.82))", "borderRadius": "8px", "padding": "10px 14px", "gap": "6px", "boxShadow": "0 1px 3px rgba(0,0,0,0.04)", "minWidth": "120px", "maxWidth": "326px" }}>
      <span className="label uppercase text-[10px] font-semibold" tw="uppercase text-[10px] font-semibold" style={{ "fontSize": "10px", "color": "var(--vx-t-subtle, oklch(0.6937 0.0563 260.99))", "textTransform": "uppercase", "letterSpacing": "0.08em", "fontWeight": "600" }}>
        {label}

      </span>
      <div className="pie" style={{ "width": "32px", "height": "32px", "borderRadius": "50%", "background": "conic-gradient(var(--vx-a, oklch(0.6231 0.1880 259.81)) 0deg 140deg, var(--vx-ok, oklch(0.6959 0.1491 162.48)) 140deg 230deg, var(--vx-warn, oklch(0.7686 0.1647 70.08)) 230deg 300deg, var(--vx-err, oklch(0.6368 0.2078 25.33)) 300deg 360deg)" }}></div>
      <div className="legend">
        <span className="legend-item" style={{ "whiteSpace": "normal" }}>
          <span className="dot" style={{ "background": "var(--vx-a, oklch(0.6231 0.1880 259.81))" }}></span>
          {value}

        </span>
        <span className="legend-item">
          <span className="dot" style={{ "background": "var(--vx-ok, oklch(0.6959 0.1491 162.48))" }}></span>
          {extra}

        </span>
        <span className="legend-item">
          <span className="dot" style={{ "background": "var(--vx-warn, oklch(0.7686 0.1647 70.08))" }}></span>
          {"Other"}

        </span>

      </div>

    </div>
  );
}

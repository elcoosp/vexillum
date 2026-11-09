// c09-08 · Red error — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0908({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-08 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "border": "1px solid var(--vx-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "borderRadius": "4px", "padding": "0 6px 0 10px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "display": "inline-flex", "alignItems": "center", "height": "100%" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep" style={{ "display": "none" }}>
        {"·"}

      </div>
      <span className="value text-[11px] font-bold rounded-[3px]" tw="text-[11px] font-bold rounded-[3px]" style={{ "color": "var(--vx-v-err, oklch(0.6368 0.2078 25.33))", "fontSize": "11px", "fontWeight": "700", "background": "var(--vx-v-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "border": "1px solid var(--vx-v-m-err-60-000000, oklch(0.3821 0.1247 25.33))", "borderRadius": "3px", "padding": "2px 8px" }}>
        {value}

      </span>

    </div>
  );
}

// c09-06 · Violet accent — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0906({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-06 inline-flex flex-col items-start justify-center gap-[2px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" tw="inline-flex flex-col items-start justify-center gap-[2px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "flex-start", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderLeft": "3px solid var(--vx-a, oklch(0.6231 0.1880 259.81))", "borderRadius": "4px", "padding": "6px 10px", "gap": "2px", "fontFamily": "'JetBrains Mono', monospace", "flexDirection": "column", "justifyContent": "center", "maxWidth": "326px", "boxSizing": "border-box" }}>
      <div className="icon inline-flex items-center gap-[4px]" tw="inline-flex items-center gap-[4px]" style={{ "color": "var(--vx-a, oklch(0.6231 0.1880 259.81))", "display": "inline-flex", "alignItems": "center", "gap": "4px", "flexShrink": 0 }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label uppercase text-[9px]" tw="uppercase text-[9px]" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))", "fontSize": "9px", "textTransform": "uppercase", "letterSpacing": "0.14em" }}>
        {label}

      </span>
      <div className="sep" style={{ "display": "none" }}>
        {"·"}

      </div>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-a, oklch(0.6231 0.1880 259.81))", "fontSize": "11px", "order": "-1", "whiteSpace": "nowrap" }}>
        {value}

      </span>

    </div>
  );
}

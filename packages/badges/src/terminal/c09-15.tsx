// c09-15 · Neon — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0915({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-15 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[6px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-t-heading, oklch(0.0935 0.0282 259.81))", "borderRadius": "6px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%", "filter": "drop-shadow(0 0 4px var(--vx-m-a-80-t, oklch(0.6231 0.1880 259.81 / 0.80)))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep" style={{ "color": "var(--vx-a-ink, oklch(0.3427 0.1034 259.81))" }}></div>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-d-text, oklch(0.8971 0.0240 264.06))", "fontSize": "11px", "textShadow": "0 0 8px rgba(255,255,255,0.6)" }}>
        {value}

      </span>

    </div>
  );
}

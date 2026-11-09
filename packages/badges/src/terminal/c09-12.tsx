// c09-12 · Phosphor — Terminal
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0912({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c09-12 inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" tw="inline-flex items-center gap-[8px] whitespace-nowrap text-[12px] font-semibold rounded-[4px] font-mono leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "24px", "background": "var(--vx-d-bg, oklch(0.2492 0.0546 265.16))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "fontFamily": "'JetBrains Mono', monospace", "border": "1px solid var(--vx-t-heading, oklch(0.0935 0.0282 259.81))" }}>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a, oklch(0.6959 0.1491 162.48))", "display": "inline-flex", "alignItems": "center", "height": "100%", "textShadow": "0 0 6px var(--vx-m-a-60-t, oklch(0.6959 0.1491 162.48 / 0.60))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-a, oklch(0.6959 0.1491 162.48))", "fontSize": "11px" }}>
        {label}

      </span>
      <div className="sep" style={{ "color": "var(--vx-a-muted, oklch(0.4175 0.0895 162.48))" }}></div>
      <span className="value text-[11px]" tw="text-[11px]" style={{ "color": "var(--vx-v-d-text, oklch(0.8971 0.0240 264.06))", "fontSize": "11px", "textShadow": "0 0 8px rgba(255,255,255,0.4)" }}>
        {value}

      </span>

    </div>
  );
}

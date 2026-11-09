// c03-06 · Coordinate readout — Technical
// Re-seeded 2026-10: the readout screen used the fixed neutral heading ink
// (--vx-t-heading) and a fixed status green, so the seed never reached it.
// The screen is now the seed's deep accent with accent-bright instrument
// marks; only the floating coordinate annotation stays on page text tokens.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C0306({ label, value, icon }: BadgeProps) {
  return (
    <div className="badge c03-06 inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" tw="inline-flex items-center gap-[8px] relative whitespace-nowrap text-[12px] font-semibold rounded-[4px] leading-none" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "12px", "fontWeight": "600", "lineHeight": "1", "textDecoration": "none", "whiteSpace": "nowrap", "height": "26px", "background": "var(--vx-a-deep, oklch(0.5109 0.1542 259.81))", "borderRadius": "4px", "padding": "0 12px", "gap": "8px", "position": "relative", "boxShadow": "0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18)" }}>
      <span className="absolute text-[9px] font-mono" tw="absolute text-[9px] font-mono" style={{ "position": "absolute", "top": "-14px", "left": "0", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "9px", "color": "var(--vx-t-muted, oklch(0.5654 0.0563 263.45))", "letterSpacing": "0.05em", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true">
        {"X:0 Y:0"}

      </span>
      <div className="icon inline-flex items-center" tw="inline-flex items-center" style={{ "color": "var(--vx-a-bright, oklch(0.7738 0.1128 259.81))", "display": "inline-flex", "alignItems": "center", "height": "100%", "textShadow": "0 0 6px var(--vx-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80))" }}>
        {icon ?? <IconSlot />}

      </div>
      <span className="label text-[11px] font-mono" tw="text-[11px] font-mono" style={{ "color": "var(--vx-s-200, oklch(0.9435 0.0282 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px" }}>
        {label}

      </span>
      <span className="sep" style={{ "color": "var(--vx-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80))" }}>
        {"·"}

      </span>
      <span className="value text-[11px] font-bold font-mono" tw="text-[11px] font-bold font-mono" style={{ "color": "var(--vx-v-s-white, oklch(0.9925 0.0038 259.81))", "fontFamily": "'JetBrains Mono', monospace", "fontSize": "11px", "fontWeight": "700", "textShadow": "0 0 8px var(--vx-v-m-a-bright-80-t, oklch(0.7738 0.1128 259.81 / 0.80))" }}>
        {value}

      </span>

    </div>
  );
}

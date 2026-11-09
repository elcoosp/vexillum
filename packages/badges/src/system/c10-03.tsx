// c10-03 · Diff pair — System
// Auto-generated from badge-collections.html by @vexillum/converter — do not hand-edit.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

export function C1003({ label, value }: BadgeProps) {
  return (
    <div className="badge c10-03 inline-flex flex-col items-center whitespace-nowrap text-[11px] font-semibold font-mono" tw="inline-flex flex-col items-center whitespace-nowrap text-[11px] font-semibold font-mono" style={{ "display": "inline-flex", "alignItems": "center", "fontSize": "11px", "fontWeight": "600", "lineHeight": "1.4", "textDecoration": "none", "whiteSpace": "nowrap", "flexDirection": "column", "fontFamily": "'JetBrains Mono', monospace", "maxWidth": "326px" }}>
      <div className="line rem flex" tw="flex" style={{ "display": "flex", "padding": "0 8px", "background": "var(--vx-m-err-10-s-white, oklch(0.9569 0.0242 272.36))", "color": "var(--vx-m-err-60-000000, oklch(0.3821 0.1247 25.33))" }}>
        <span className="font-bold" tw="font-bold" style={{ "marginRight": "6px", "color": "var(--vx-err, oklch(0.6368 0.2078 25.33))", "fontWeight": "700", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true">
          {"−"}

        </span>
        {label}

      </div>
      <div className="line add flex" tw="flex" style={{ "display": "flex", "padding": "0 8px", "background": "var(--vx-m-ok-15-s-white, oklch(0.9480 0.0256 245.21))", "color": "var(--vx-m-ok-60-000000, oklch(0.4175 0.0895 162.48))", "whiteSpace": "normal" }}>
        <span className="font-bold" tw="font-bold" style={{ "marginRight": "6px", "color": "var(--vx-ok, oklch(0.6959 0.1491 162.48))", "fontWeight": "700", "boxSizing": "content-box" }} data-pseudo="before" aria-hidden="true">
          {"+"}

        </span>
        {value}

      </div>

    </div>
  );
}

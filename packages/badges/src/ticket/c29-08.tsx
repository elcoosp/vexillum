// c29 · sharp body — Ticket (punched-paper construction, no CSS masks)
// Hand-tuned 2026-10: mask-image notches could not keep a traced border (the
// browser mask sheared the inset-shadow border off the clipped zones and
// takumi has no mask support at all). Rebuilt as a real border + punched
// holes cut by transparent background layers, each hole traced by a rim
// layer; identical output in Chrome and the Rust renderer.
import { IconSlot } from "../slots";
import type { BadgeProps } from "../types";

const paper = "radial-gradient(circle 6.5px at 11px 50%, transparent 5px, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 5px, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 6.5px, transparent 6.5px), radial-gradient(circle 6.5px at calc(100% - 11px) 50%, transparent 5px, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 5px, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 6.5px, transparent 6.5px), radial-gradient(circle 6.5px at 11px 50%, transparent 6.5px, var(--vx-a-soft, oklch(0.9100 0.0450 252.00)) 6.5px) 0 0 / 24px 100% no-repeat, linear-gradient(var(--vx-a-soft, oklch(0.9100 0.0450 252.00)), var(--vx-a-soft, oklch(0.9100 0.0450 252.00))) 18px 0 / calc(100% - 36px) 100% no-repeat, radial-gradient(circle 6.5px at 13px 50%, transparent 6.5px, var(--vx-a-soft, oklch(0.9100 0.0450 252.00)) 6.5px) 100% 0 / 24px 100% no-repeat";

export function C2908({ label, value, icon }: BadgeProps) {
  return (
    <div
      className="badge c29-08 t-tik inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold leading-none"
      tw="inline-flex items-center relative whitespace-nowrap text-[12px] font-semibold leading-none"
      style={{
        "display": "inline-flex",
        "alignItems": "center",
        "fontSize": "12px",
        "fontWeight": "600",
        "lineHeight": "1",
        "textDecoration": "none",
        "whiteSpace": "nowrap",
        "boxSizing": "border-box",
        "margin": "0",
        "position": "relative",
        "height": "28px",
        "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))",
        "maxWidth": "100%",
        "minWidth": "112px",
        "padding": "0 20px",
        "border": "1px solid var(--vx-b-200, oklch(0.8200 0.0180 252.00))",
        "borderRadius": "0",
        "background": paper,
      }}
    >
      <span
        className="l label inline-flex items-center gap-[6px] whitespace-nowrap font-medium"
        style={{ "boxSizing": "border-box", "margin": "0", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "500", "color": "var(--vx-m-seed-12-111827, oklch(0.2553 0.0626 263.50))", "whiteSpace": "nowrap", "padding": "0 9px 0 2px" }}
      >
        {icon ?? <IconSlot />}
        {label}
      </span>
      <span
        className="sm absolute whitespace-nowrap"
        style={{ "boxSizing": "border-box", "margin": "0", "padding": "0", "position": "absolute", "left": "50%", "top": "5px", "bottom": "5px", "width": "1px", "transform": "translateX(-.5px)", "backgroundImage": "repeating-linear-gradient(180deg, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 0, var(--vx-b-200, oklch(0.8200 0.0180 252.00)) 2px, transparent 2px, transparent 7px)", "backgroundRepeat": "no-repeat", "whiteSpace": "nowrap" }}
      ></span>
      <span
        className="v value inline-flex items-center gap-[6px] whitespace-nowrap tabular-nums font-semibold"
        style={{ "boxSizing": "border-box", "margin": "0", "display": "inline-flex", "alignItems": "center", "gap": "6px", "minWidth": "0", "fontWeight": "600", "color": "var(--vx-v-a-deep, oklch(0.4000 0.1200 252.00))", "fontVariantNumeric": "tabular-nums", "whiteSpace": "nowrap", "padding": "0 2px 0 9px" }}
      >
        {value}
      </span>
    </div>
  );
}

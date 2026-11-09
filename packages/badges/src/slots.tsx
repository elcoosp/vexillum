/**
 * Slot primitives (spec §3.2). The icon slot renders the marker as bare text
 * so the compiled template contains it verbatim where the source SVG sat —
 * no wrapper element, zero DOM delta versus the source collections. At
 * render time Rust substitutes the marker with the resolved inline SVG.
 */
import type { ReactElement } from "react";
import { ICON_MARKER } from "./types";

export function IconSlot(): ReactElement {
  return <>{ICON_MARKER}</>;
}

/** Parses CSS `animation` shorthands into structured metadata. */

export interface ParsedAnimation {
  name: string;
  durationMs: number;
  timing: string;
  iteration: string;
}

const TIMING_RE =
  /^(linear|ease|ease-in|ease-out|ease-in-out|steps?\([^)]*\)|cubic-bezier\([^)]*\))$/;
const DURATION_RE = /^([\d.]+)(m?s)$/;
const FILL_FLAGS = new Set([
  "alternate", "reverse", "both", "forwards", "backwards",
  "none", "running", "paused", "normal",
]);

export function parseAnimationShorthand(value: string): ParsedAnimation | null {
  const tokens = value.match(/[^\s(),]+(?:\([^)]*\))?/g);
  if (!tokens || tokens.length === 0) return null;
  let name = tokens[0];
  let durationMs = 0;
  let timing = "ease";
  let iteration = "1";
  let sawName = false;

  for (const tok of tokens) {
    const dur = tok.match(DURATION_RE);
    if (dur) {
      durationMs = dur[2] === "ms" ? parseFloat(dur[1]) : parseFloat(dur[1]) * 1000;
      // per CSS grammar the duration comes right before (optional) timing;
      // the name is the first token that is not a duration/time/timing/flag
      continue;
    }
    if (TIMING_RE.test(tok)) {
      timing = tok;
      continue;
    }
    if (tok === "infinite" || /^\d+$/.test(tok)) {
      iteration = tok;
      continue;
    }
    if (FILL_FLAGS.has(tok)) continue;
    if (!sawName) {
      name = tok;
      sawName = true;
    }
  }
  return { name, durationMs, timing, iteration };
}

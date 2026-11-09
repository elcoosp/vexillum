#!/usr/bin/env python3
"""Replaces structurally-duplicate badges with new, structurally-different
designs that keep each collection's language and every variant's slots/icons.

Groups (from scripts/find-duplicates.py):
  c04-14, c05-02, c05-07, c09-06/08/09/10, c14-02..16 (minus 01/07), c15-02/03/04, c15-12/13/14
First member of each group stays canonical; the rest are redesigned here.
"""

import re
import sys
from pathlib import Path

SRC = Path("badge-collections.html")
src = SRC.read_text()

# ---------------------------------------------------------------- helpers

def extract_icon(vid: str) -> str:
    m = re.search(
        r'<div class="badge ' + vid + r'">(<div class="icon">.*?</div>)',
        src,
        flags=re.S,
    )
    if m:
        return m.group(1)
    return ""  # dot-style variants carry no icon slot


def replace_css(vid: str, new_css: str) -> None:
    """Replaces the CSS block: the `.vid {` root rule plus its descendant rules,
    up to (not including) the next blank line followed by a non-`.vid` rule."""
    global src
    pat = re.compile(
        r"(?ms)^  \." + vid + r" \{.*?\}(?:\n  \." + vid + r" [^\n{]*\{[^}]*\})*"
    )
    m = pat.search(src)
    if not m:
        raise SystemExit(f"css block not found for {vid}")
    src = src[: m.start()] + new_css.rstrip("\n") + src[m.end():]


def replace_body(vid: str, new_body: str) -> None:
    global src
    pat = re.compile(
        r'(<div class="variant"><div class="variant-title">[^<]*</div><div class="badge '
        + vid + r'">).*?(</div></div>)',
        flags=re.S,
    )
    m = pat.search(src)
    if not m:
        raise SystemExit(f"markup not found for {vid}")
    src = src[: m.start()] + m.group(1) + new_body + m.group(2) + src[m.end():]


def css(vid: str, rules: list[str]) -> str:
    return "\n".join(f"  {r}" for r in rules) + "\n"

R = []  # report

def redesign(vid: str, new_css: str, new_body: str, note: str):
    icon = extract_icon(vid)
    body = new_body.replace("{ICON}", icon)
    replace_css(vid, css(vid, [l for l in new_css.strip().splitlines()]))
    replace_body(vid, body.strip())
    R.append(f"  {vid}: {note}")

# ======================================================================
# c04 · Luminous — c04-10 Refraction stays canonical
# ======================================================================
redesign(
    "c04-14",
    """
.c04-14 { height: 26px; background: #1c1917; border-radius: 999px; padding: 0 14px 0 6px; gap: 8px; position: relative; background-image: repeating-linear-gradient(115deg, rgba(245,158,11,0.16) 0px, rgba(245,158,11,0.16) 2px, transparent 2px, transparent 7px); box-shadow: 0 0 14px rgba(245,158,11,0.35), inset 0 0 0 1px rgba(245,158,11,0.4); }
.c04-14 .icon-ring { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #fbbf24; display: inline-flex; align-items: center; justify-content: center; color: #fbbf24; box-shadow: 0 0 8px rgba(251,191,36,0.7), inset 0 0 6px rgba(251,191,36,0.4); }
.c04-14 .icon-ring svg { width: 10px; height: 10px; }
.c04-14 .label { color: #d6d3d1; letter-spacing: 0.08em; text-transform: uppercase; font-size: 10px; }
.c04-14 .sep { color: #78716c; }
.c04-14 .value { color: #fde68a; font-weight: 700; text-shadow: 0 0 8px rgba(253,230,138,0.6); }
""",
    """
<div class="icon-ring">{ICON}</div><span class="label">reward</span><span class="sep">·</span><span class="value">gold</span>
""",
    "dark ray-textured pill with glowing icon ring",
)

# ======================================================================
# c05 · Brutalist — c05-01 Hard shadow stays canonical
# ======================================================================
redesign(
    "c05-02",
    """
.c05-02 { height: 26px; background: #fde047; border: 2px solid #111827; border-radius: 0; padding: 0; gap: 0; box-shadow: 5px 5px 0 #111827; overflow: hidden; }
.c05-02 .icon { color: #111827; display: inline-flex; align-items: center; height: 100%; padding: 0 4px 0 10px; border-right: 2px solid #111827; }
.c05-02 .label { color: #111827; font-weight: 800; text-transform: uppercase; padding: 0 8px; border-right: 2px solid #111827; height: 100%; display: inline-flex; align-items: center; }
.c05-02 .sep { display: none; }
.c05-02 .value { color: #111827; font-weight: 800; padding: 0 12px 0 8px; }
""",
    """
<div class="icon">{ICON}</div><span class="label">warning</span><div class="sep">·</div><span class="value">active</span>
""",
    "yellow segmented slab with hard offset shadow (cells, not a card)",
)

redesign(
    "c05-07",
    """
.c05-07 { height: 26px; background: #ffffff; border: none; border-top: 2px dotted #111827; border-bottom: 2px dotted #111827; border-radius: 0; padding: 0 14px; gap: 8px; position: relative; }
.c05-07 .icon { color: #111827; display: inline-flex; align-items: center; height: 100%; }
.c05-07 .label { color: #111827; font-weight: 700; }
.c05-07 .sep { color: #9ca3af; }
.c05-07 .value { color: #111827; font-weight: 800; background: #111827; color: #ffffff; padding: 2px 8px; }
""",
    """
<div class="icon">{ICON}</div><span class="label">pending</span><span class="sep">·</span><span class="value">review</span>
""",
    "perforated ticket edges with an inverted value block",
)

# ======================================================================
# c09 · Terminal — c09-05 Pink accent stays canonical
# ======================================================================
redesign(
    "c09-06",
    """
.c09-06 { height: 34px; background: #0f172a; border: 1px solid #1e293b; border-left: 3px solid #a78bfa; border-radius: 4px; padding: 0 10px; gap: 2px; font-family: 'JetBrains Mono', monospace; flex-direction: column; justify-content: center; align-items: flex-start; }
.c09-06 .icon { color: #a78bfa; display: inline-flex; align-items: center; gap: 4px; }
.c09-06 .icon svg { width: 11px; height: 11px; }
.c09-06 .sep { display: none; }
.c09-06 .value { color: #a78bfa; font-size: 11px; order: -1; }
.c09-06 .label { color: #64748b; font-size: 9px; text-transform: uppercase; letter-spacing: 0.14em; }
""",
    """
<div class="icon">{ICON}</div><span class="label">test</span><div class="sep">·</div><span class="value">142 passed</span>
""",
    "two-row stacked layout with violet rail (vs single-row canonical)",
)

redesign(
    "c09-08",
    """
.c09-08 { height: 26px; background: #0f172a; border: 1px solid #7f1d1d; border-radius: 4px; padding: 0 6px 0 10px; gap: 8px; font-family: 'JetBrains Mono', monospace; }
.c09-08 .icon { color: #f87171; display: inline-flex; align-items: center; height: 100%; }
.c09-08 .label { color: #fca5a5; font-size: 11px; }
.c09-08 .sep { display: none; }
.c09-08 .value { color: #fecaca; font-size: 11px; font-weight: 700; background: #7f1d1d; border: 1px solid #b91c1c; border-radius: 3px; padding: 2px 8px; }
""",
    """
<div class="icon">{ICON}</div><span class="label">err</span><div class="sep">·</div><span class="value">ECONNREFUSED</span>
""",
    "value boxed in its own bordered chip (no divider)",
)

redesign(
    "c09-09",
    """
.c09-09 { height: 26px; background: #0f172a; border: 1px solid #164e63; border-radius: 999px; padding: 0 8px 0 12px; gap: 8px; font-family: 'JetBrains Mono', monospace; flex-direction: row-reverse; }
.c09-09 .icon { color: #22d3ee; display: inline-flex; align-items: center; height: 100%; order: 10; }
.c09-09 .label { color: #67e8f9; font-size: 11px; order: 1; }
.c09-09 .sep { color: #155e75; order: 2; }
.c09-09 .value { color: #a5f3fc; font-size: 11px; order: 3; }
""",
    """
<div class="icon">{ICON}</div><span class="label">info</span><div class="sep">·</div><span class="value">listening :3000</span>
""",
    "trailing icon (row-reverse pill), cyan",
)

redesign(
    "c09-10",
    """
.c09-10 { height: 26px; background: #0f172a; border: 1px solid #1e293b; border-bottom: 3px solid #f59e0b; border-radius: 4px; padding: 0 12px; gap: 8px; font-family: 'JetBrains Mono', monospace; }
.c09-10 .icon { color: #fbbf24; display: inline-flex; align-items: center; height: 100%; }
.c09-10 .label { color: #fde68a; font-size: 11px; }
.c09-10 .sep { color: #78350f; }
.c09-10 .value { color: #fde68a; font-size: 11px; }
""",
    """
<div class="icon">{ICON}</div><span class="label">warn</span><div class="sep">·</div><span class="value">deprecated</span>
""",
    "amber underline bar (border-bottom) accent",
)

# ======================================================================
# c14 · Social — c14-01 GitHub pill stays canonical (c14-07 already distinct)
# ======================================================================
social = {
    "c14-02": ("Stars", """
.c14-02 { height: 26px; background: #ffffff; border: 1px solid #fde68a; border-radius: 8px; padding: 0 10px 0 4px; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.c14-02 .icon { width: 18px; height: 18px; border-radius: 5px; background: #fef3c7; color: #d97706; display: inline-flex; align-items: center; justify-content: center; }
.c14-02 .icon svg { width: 11px; height: 11px; }
.c14-02 .value { color: #111827; font-weight: 700; }
""", "icon in amber rounded-square chip"),
    "c14-03": ("Forks", """
.c14-03 { height: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 999px; padding: 0 10px 0 0; gap: 0; box-shadow: 0 1px 2px rgba(0,0,0,0.03); overflow: hidden; }
.c14-03 .icon { width: 24px; height: 24px; background: #111827; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; }
.c14-03 .icon svg { width: 12px; height: 12px; }
.c14-03 .value { color: #111827; font-weight: 700; padding-left: 8px; }
""", "dark icon cell + white value cell (split pill)"),
    "c14-04": ("Watchers", """
.c14-04 { height: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-left: 3px solid #8b5cf6; border-radius: 4px; padding: 0 10px; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.c14-04 .icon { color: #8b5cf6; display: inline-flex; align-items: center; height: 100%; }
.c14-04 .value { color: #111827; font-weight: 700; }
""", "violet left accent bar card"),
    "c14-05": ("Issues", """
.c14-05 { height: 24px; background: #111827; border: 1px solid #111827; border-radius: 4px; padding: 0 10px; gap: 6px; font-family: 'JetBrains Mono', monospace; }
.c14-05 .icon { color: #f97316; display: inline-flex; align-items: center; height: 100%; }
.c14-05 .value { color: #ffffff; font-weight: 700; font-size: 11px; }
""", "dark mono terminal card, orange icon"),
    "c14-06": ("Contributors", """
.c14-06 { height: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 999px; padding: 0 8px 0 3px; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.c14-06 .icon { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #10b981; color: #10b981; display: inline-flex; align-items: center; justify-content: center; }
.c14-06 .icon svg { width: 10px; height: 10px; }
.c14-06 .value { color: #111827; font-weight: 700; }
""", "ring-circle icon, avatar-like pill"),
    "c14-08": ("Downloads", """
.c14-08 { height: 26px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0 10px 5px; gap: 6px; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.c14-08 .bar { position: absolute; left: 6px; right: 6px; bottom: 3px; height: 3px; border-radius: 999px; background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 70%, #e5e7eb 70%); }
.c14-08 .icon { color: #3b82f6; display: inline-flex; align-items: center; height: 100%; }
.c14-08 .value { color: #111827; font-weight: 700; }
""", "progress bar under content"),
    "c14-09": ("RSS", """
.c14-09 { height: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 999px; padding: 0 10px 0 0; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
.c14-09 .icon { width: 24px; height: 24px; border-radius: 50%; background: #f97316; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px #ffffff, 0 1px 3px rgba(249,115,22,0.4); }
.c14-09 .icon svg { width: 11px; height: 11px; }
.c14-09 .value { color: #111827; font-weight: 700; }
""", "solid orange circle badge (medallion)"),
    "c14-10": ("Twitter", """
.c14-10 { height: 24px; background: #ffffff; border: 1px solid #bae6fd; border-radius: 8px 8px 8px 0; padding: 0 10px; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.c14-10 .icon { color: #0284c7; display: inline-flex; align-items: center; height: 100%; }
.c14-10 .value { color: #111827; font-weight: 700; }
""", "speech-bubble notch radius"),
    "c14-11": ("YouTube", """
.c14-11 { height: 26px; background: #ffffff; border: 2px solid #111827; border-radius: 6px; padding: 0 10px 0 4px; gap: 6px; box-shadow: 3px 3px 0 #ef4444; }
.c14-11 .icon { width: 20px; height: 16px; border-radius: 5px; background: #ef4444; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; }
.c14-11 .icon svg { width: 10px; height: 10px; }
.c14-11 .value { color: #111827; font-weight: 700; }
""", "red play-chip with hard shadow card"),
    "c14-12": ("LinkedIn", """
.c14-12 { height: 26px; background: #ffffff; border: 1px solid #e5e7eb; border-top: 3px solid #0a66c2; border-radius: 4px; padding: 0 10px; gap: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.c14-12 .icon { color: #0a66c2; display: inline-flex; align-items: center; height: 100%; }
.c14-12 .value { color: #111827; font-weight: 700; }
""", "linkedin top accent bar"),
    "c14-13": ("Discord", """
.c14-13 { height: 26px; background: linear-gradient(135deg, #5865f2 0%, #7c3aed 100%); border-radius: 8px; padding: 0 12px; gap: 6px; box-shadow: 0 2px 8px rgba(88,101,242,0.4), inset 0 1px 0 rgba(255,255,255,0.25); }
.c14-13 .icon { color: #ffffff; display: inline-flex; align-items: center; height: 100%; }
.c14-13 .value { color: #ffffff; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
""", "blurple gradient card, white content"),
    "c14-14": ("Reddit", """
.c14-14 { height: 24px; background: #ffffff; border: 2px dotted #ff4500; border-radius: 999px; padding: 0 10px; gap: 6px; }
.c14-14 .icon { color: #ff4500; display: inline-flex; align-items: center; height: 100%; }
.c14-14 .value { color: #111827; font-weight: 700; }
""", "dotted brand-border pill"),
    "c14-15": ("Spotify", """
.c14-15 { height: 26px; background: #191414; border-radius: 999px; padding: 0 12px 0 5px; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
.c14-15 .icon { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #1db954; color: #1db954; display: inline-flex; align-items: center; justify-content: center; }
.c14-15 .icon svg { width: 10px; height: 10px; }
.c14-15 .value { color: #1db954; font-weight: 700; }
""", "black card with green ring icon"),
    "c14-16": ("Instagram", """
.c14-16 { height: 26px; background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%); border-radius: 8px; padding: 1px; box-shadow: 0 2px 6px rgba(236,72,153,0.35); }
.c14-16 .inner { height: 100%; background: #ffffff; border-radius: 7px; padding: 0 10px 0 4px; gap: 6px; display: inline-flex; align-items: center; }
.c14-16 .icon { width: 18px; height: 18px; border-radius: 6px; background: linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%); color: #ffffff; display: inline-flex; align-items: center; justify-content: center; }
.c14-16 .icon svg { width: 11px; height: 11px; }
.c14-16 .value { color: #111827; font-weight: 700; }
""", "gradient frame with white inner card"),
}
for vid, (title, block, note) in social.items():
    redesign(vid, block, '<div class="icon">{ICON}</div><span class="value">' +
             re.search(r'<span class="value">([^<]*)</span>',
                       re.search(r'<div class="badge ' + vid + r'">(.*?)</div></div>', src, flags=re.S).group(1)).group(1)
             + "</div>", note)

# ======================================================================
# c15 · Status — c15-01 Green dot & c15-10 Success tint stay canonical
# ======================================================================
redesign(
    "c15-02",
    """
.c15-02 { height: 24px; background: #ffffff; border: 1px solid #fde68a; border-left: 3px solid #f59e0b; border-radius: 4px; padding: 0 10px; gap: 8px; }
.c15-02 .dot { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.25); }
.c15-02 .label { color: #92700c; font-style: italic; }
.c15-02 .value { color: #111827; font-weight: 700; }
""",
    """
<div class="dot"></div><span class="label">status</span><span class="value">degraded</span>
""",
    "amber halo-ring dot + italic label + left rail",
)

redesign(
    "c15-03",
    """
.c15-03 { height: 26px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 999px; padding: 0 12px; gap: 8px; }
.c15-03 .dot { width: 10px; height: 10px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; box-shadow: 0 1px 3px rgba(239,68,68,0.5); }
.c15-03 .label { color: #991b1b; text-transform: uppercase; font-size: 9px; letter-spacing: 0.1em; }
.c15-03 .value { color: #7f1d1d; font-weight: 700; }
""",
    """
<div class="dot"></div><span class="label">status</span><span class="value">down</span>
""",
    "red alert pill with white-cored dot, uppercase label",
)

redesign(
    "c15-04",
    """
.c15-04 { height: 24px; background: transparent; border: 1px dashed #d1d5db; border-radius: 6px; padding: 0 10px; gap: 8px; }
.c15-04 .dot { width: 8px; height: 8px; border-radius: 50%; background: transparent; border: 2px solid #9ca3af; }
.c15-04 .label { color: #6b7280; }
.c15-04 .value { color: #9ca3af; font-weight: 700; }
""",
    """
<div class="dot"></div><span class="label">status</span><span class="value">unknown</span>
""",
    "hollow dot on dashed ghost card",
)

redesign(
    "c15-12",
    """
.c15-12 { height: 26px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 999px; padding: 0 10px 0 3px; gap: 6px; }
.c15-12 .icon { width: 20px; height: 20px; border-radius: 50%; background: #ef4444; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; }
.c15-12 .icon svg { width: 11px; height: 11px; }
.c15-12 .label { color: #991b1b; font-weight: 600; }
.c15-12 .value { color: #7f1d1d; font-weight: 700; }
""",
    """
<div class="icon">{ICON}</div><span class="label">build</span><span class="value">failing</span>
""",
    "white icon on solid red medallion, full pill",
)

redesign(
    "c15-13",
    """
.c15-13 { height: 26px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 0 10px 0 0; gap: 0; overflow: hidden; }
.c15-13 .icon { width: 26px; height: 100%; background: #3b82f6; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; margin-right: 8px; }
.c15-13 .icon svg { width: 12px; height: 12px; }
.c15-13 .label { color: #1e40af; font-weight: 600; }
.c15-13 .value { color: #1e3a8a; font-weight: 700; }
""",
    """
<div class="icon">{ICON}</div><span class="label">info</span><span class="value">v2.18.1</span>
""",
    "solid blue icon rail (edge-to-edge block)",
)

redesign(
    "c15-14",
    """
.c15-14 { height: 26px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; padding: 0 10px 0 14px; gap: 8px; position: relative; }
.c15-14 .corner { position: absolute; left: -1px; top: -1px; width: 8px; height: 8px; background: #a855f7; border-radius: 6px 0 6px 0; }
.c15-14 .icon { color: #a855f7; display: inline-flex; align-items: center; height: 100%; }
.c15-14 .icon svg { width: 14px; height: 14px; }
.c15-14 .label { color: #6b21a8; font-weight: 600; }
.c15-14 .value { color: #581c87; font-weight: 700; }
""",
    """
<div class="corner"></div><div class="icon">{ICON}</div><span class="label">rating</span><span class="value">5.0</span>
""",
    "purple corner-notch accent card",
)

SRC.write_text(src)
print("\n".join(R))
print(f"\nredesigned {len(R)} badges")

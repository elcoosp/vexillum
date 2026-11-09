#!/usr/bin/env python3
"""Finds structurally identical badge variants.

Two variants are structural duplicates when their compiled DOM has the same
tag tree, the same style-property sets, and the same structural values
(everything except colors, shadows, text content and ids). Reports groups
per collection so duplicates can be redesigned.
"""

import html.parser
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

TEMPLATES = Path("crates/templates/assets/html")

COLOR_PROPS = {
    "color", "background", "background-color", "background-image",
    "border-top-color", "border-right-color", "border-bottom-color",
    "border-left-color", "border-color", "box-shadow", "text-decoration",
    "outline", "fill", "stroke",
}
COLOR_VALUE_RE = re.compile(r"#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\(|var\(--")


class P(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.sigs = []

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        style = d.get("style", "")
        props = []
        for decl in style.split(";"):
            decl = decl.strip()
            if not decl or ":" not in decl:
                continue
            k, v = decl.split(":", 1)
            k = k.strip().lower()
            v = v.strip()
            if k in COLOR_PROPS or COLOR_VALUE_RE.search(v):
                props.append(k)  # property name only — colors ignored
            else:
                # structural value kept, but strip ids and text content
                v = re.sub(r"url\([^)]*\)", "url(..)", v)
                props.append(f"{k}={v}")
        props.sort()
        cls = d.get("class", "")
        # collapse variant-specific classes
        cls = re.sub(r"\bc\d\d-\d\d\b", "", cls)
        marker = ""
        for m in ("__VX_ICON__", "__VX_LABEL__", "__VX_VALUE__", "__VX_EXTRA__"):
            if m in (d.get("data-slot", "") or ""):
                marker = m
        self.stack.append((tag, cls, tuple(props)))
        self.sigs.append((len(self.stack), tag, cls, tuple(props)))
        # children text markers handled in handle_data

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()


def fingerprint(path: Path):
    html_src = path.read_text()
    # normalize slot markers to their identity so text content doesn't matter
    norm = html_src
    for i, m in enumerate(["ICON", "LABEL", "VALUE", "EXTRA"]):
        norm = norm.replace(f"__VX_{m}__", f"§{i}§")
    # strip text between > and < that contains no marker
    norm = re.sub(r">([^<§]*)<", "><", norm)
    p = P()
    p.feed(norm)
    body = (p.sigs, tuple(x for x in re.findall(r"§\d§", norm)))
    return json.dumps([body], sort_numbers=False, default=str) if False else repr(body)


def main():
    groups = defaultdict(list)
    for f in sorted(TEMPLATES.glob("c*.html")):
        vid = f.stem
        col = vid.split("-")[0]
        groups[(col, fingerprint(f))].append(vid)

    dups = {k: v for k, v in groups.items() if len(v) > 1}
    total_dup_variants = sum(len(v) for v in dups.values())
    print(f"variants scanned: {len(list(TEMPLATES.glob('c*.html')))}")
    print(f"duplicate groups: {len(dups)} covering {total_dup_variants} variants\n")
    for (col, _), vids in sorted(dups.items()):
        names = []
        for v in vids:
            title = ""
            reg = json.loads(Path("packages/badges/src/registry.json").read_text())
            for var in reg["variants"]:
                if var["id"] == v:
                    title = var["title"]
                    break
            names.append(f"{v} ({title})")
        print(f"  c{col[1:]}: {' | '.join(names)}")


if __name__ == "__main__":
    sys.exit(main())

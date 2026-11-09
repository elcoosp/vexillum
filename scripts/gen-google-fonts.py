#!/usr/bin/env python3
"""Generates the Google Fonts catalog consumed by the renderer and the SPA.

Fetches the google-webfonts-helper index (a stable mirror of the Google Fonts
catalog with ready slugs), and emits:
  - crates/render/assets/google-fonts.json   (embedded via include_str)
  - apps/web/src/lib/google-fonts-catalog.json (lazy-loaded by the picker)

Run from the repo root:  python3 scripts/gen-google-fonts.py
"""

import json
import re
import sys
import urllib.request
from pathlib import Path

METADATA_URL = "https://gwfh.mranftl.com/api/fonts"
REPO = Path(__file__).resolve().parent.parent


def slugify(family: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", family.lower()).strip("-")
    return slug


def main() -> int:
    req = urllib.request.Request(METADATA_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read().decode("utf-8")
    listing = json.loads(raw)

    families = []
    seen: dict[str, str] = {}
    dups = []
    for entry in listing:
        family = entry.get("family", "").strip()
        if not family:
            continue
        category = entry.get("category", "").strip() or "unknown"
        slug = entry.get("id", "").strip() or slugify(family)
        if slug in seen:
            dups.append((slug, seen[slug], family))
            continue
        seen[slug] = family
        families.append([slug, family, category])

    families.sort(key=lambda f: f[0])

    if not families:
        print("no families parsed — metadata shape changed?", file=sys.stderr)
        return 1

    payload = {"count": len(families), "families": families}

    rust_out = REPO / "crates/render/assets/google-fonts.json"
    rust_out.parent.mkdir(parents=True, exist_ok=True)
    rust_out.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")

    web_out = REPO / "apps/web/src/lib/google-fonts-catalog.json"
    web_out.parent.mkdir(parents=True, exist_ok=True)
    web_out.write_text(json.dumps(families, separators=(",", ":")), encoding="utf-8")

    cats: dict[str, int] = {}
    for _, _, c in families:
        cats[c] = cats.get(c, 0) + 1
    print(f"families: {len(families)}")
    print("categories:", json.dumps(cats, sort_keys=True))
    if dups:
        print(f"slug collisions skipped: {dups}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())

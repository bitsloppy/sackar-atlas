#!/usr/bin/env python3
"""
zotero-enrich-extras.py — Enrich Zotero Extra fields for the sackar-atlas group library.

Reads ZOTERO_API_KEY and ZOTERO_GROUP_ID from environment variables.
Safe to run multiple times — only adds missing fields, never overwrites existing content.

What it fixes:
  - 3 items in old pipe-separated Extra format → normalised to newlines, sackar-atlas-id → sackar_atlas_id
  - 16 ABC News items missing series_id: abc
  - 5 Bondi Badlands episodes missing spotify_url
  - 1 Deep Water item missing series_id + runtime
  - 1 tag typo: person:sam-coolling → person:sam-cooling

Usage:
  ZOTERO_API_KEY=xxx ZOTERO_GROUP_ID=6623153 python3 scripts/zotero-enrich-extras.py
"""

import os
import re
import sys
import json
import time
import urllib.request
import urllib.error

# ── Config ────────────────────────────────────────────────────────────────────

API_KEY  = os.environ.get("ZOTERO_API_KEY", "").strip()
GROUP_ID = os.environ.get("ZOTERO_GROUP_ID", "6623153").strip()
BASE_URL = f"https://api.zotero.org/groups/{GROUP_ID}/items"

if not API_KEY:
    print("❌  ZOTERO_API_KEY environment variable not set.", file=sys.stderr)
    sys.exit(1)

HEADERS = {
    "Zotero-API-Version": "3",
    "Zotero-API-Key":     API_KEY,
}

SPOTIFY_BB = "https://open.spotify.com/show/5aEiYdw9FjLPNr9XOJZPdh"

# ── Items to update ───────────────────────────────────────────────────────────
#
# Format: (zotero_key, human_label, extra_additions, needs_reformat, tag_fixes)
#
#   extra_additions  — dict of fields to add if not already present
#   needs_reformat   — True when the item uses old pipe-separated Extra format;
#                      will normalise the whole Extra field to newlines and
#                      fix 'sackar-atlas-id:' → 'sackar_atlas_id:'
#   tag_fixes        — list of (old_tag, new_tag) pairs

UPDATES = [
    # ── 3 items with old pipe-separated Extra format ──────────────────────────
    ("D7JM9JYX", "Sunday Brunch: Garry Wotherspoon",
     {"sackar_atlas_id": "wotherspoon-abc-radio-sunday-brunch-2024", "series_id": "abc"},
     True, []),
    ("U6GM2UQY", "Shining a light on injustice",
     {"sackar_atlas_id": "the-conversation-2023-shining-light-injustice"},
     True, []),
    ("MTUEH8F5", "Preserving LGBTQIA+ history (Sam Cooling)",
     {"sackar_atlas_id": "sam-cooling-abc-rn-sunday-extra-2026", "series_id": "abc"},
     True, [("person:sam-coolling", "person:sam-cooling")]),

    # ── 16 ABC News items missing series_id: abc ──────────────────────────────
    ("PJVD4U5Y", "abc-news-2018-05-28-rosendale-acon",         {"series_id": "abc"}, False, []),
    ("LPU3IVWD", "abc-news-2019-05-03-hate-crime-laws",        {"series_id": "abc"}, False, []),
    ("CI4PWT8F", "abc-news-2020-05-13-scott-johnson-arrest",   {"series_id": "abc"}, False, []),
    ("3UX5LGC3", "abc-news-2020-05-16-four-other-cases",       {"series_id": "abc"}, False, []),
    ("FRHI922A", "abc-news-2020-05-17-hate-crime-reform",      {"series_id": "abc"}, False, []),
    ("G8ASZMPP", "abc-news-2021-08-19-raymond-keam",           {"series_id": "abc"}, False, []),
    ("J49FFU9F", "abc-news-2021-10-22-rise-memorial",          {"series_id": "abc"}, False, []),
    ("AQKWUSL5", "abc-news-2021-11-04-nsw-announces-inquiry",  {"series_id": "abc"}, False, []),
    ("5Q3NVU53", "abc-news-2022-04-16-sackar-appointed",       {"series_id": "abc"}, False, []),
    ("9TNBUB97", "abc-news-2022-11-02-scoi-hearings-open",     {"series_id": "abc"}, False, []),
    ("9EQIBASV", "abc-news-2023-02-21-neiwand-reversals",      {"series_id": "abc"}, False, []),
    ("BNVW2DX6", "abc-news-2023-04-12-yellow-socks",           {"series_id": "abc"}, False, []),
    ("QWIGJHS2", "abc-news-2023-06-28-lack-of-investigation",  {"series_id": "abc"}, False, []),
    ("2U4DVUIJ", "abc-news-2023-08-22-crispin-dye",            {"series_id": "abc"}, False, []),
    ("JJKV8I8C", "abc-news-2025-03-17-oxford-street-heritage", {"series_id": "abc"}, False, []),
    ("F57F68TT", "abc-news-2025-10-19-surry-hills-mural",      {"series_id": "abc"}, False, []),

    # ── 5 Bondi Badlands episodes missing spotify_url ────────────────────────
    ("AXST7FT9", "bondi-badlands-ep1-ross-warren",                     {"spotify_url": SPOTIFY_BB}, False, []),
    ("HXHZ3YHA", "bondi-badlands-ep2-john-russell",                    {"spotify_url": SPOTIFY_BB}, False, []),
    ("Z57FGTRQ", "bondi-badlands-ep3-kritchikorn-rattanjurathaporn",   {"spotify_url": SPOTIFY_BB}, False, []),
    ("MAI57Q2Z", "bondi-badlands-ep4-the-inquest",                     {"spotify_url": SPOTIFY_BB}, False, []),
    ("HDAZURFY", "bondi-badlands-ep5-scott-johnson",                   {"spotify_url": SPOTIFY_BB}, False, []),

    # ── Deep Water: series_id + runtime ──────────────────────────────────────
    ("WW52YWEU", "deep-water-documentary-2016",
     {"series_id": "deep-water-documentary", "runtime": "1h 27m"},
     False, []),
]

# ── Extra field helpers ───────────────────────────────────────────────────────

PREFERRED_KEY_ORDER = [
    "sackar_atlas_id", "significance", "source_type", "series_id",
    "show_title", "episode_number", "spotify_url", "apple_podcasts_url",
    "runtime", "trove_id", "related_cases", "related_locations",
    "related_people", "related_events",
]

def parse_extra(extra_str):
    """
    Parse an Extra field in either newline or pipe-separated format.
    Returns an ordered list of (normalised_key, original_key, value) tuples.
    Normalised key: lowercase, hyphens → underscores.
    """
    lines = [l.strip() for l in extra_str.split("\n") if l.strip()]
    if len(lines) == 1 and "|" in lines[0]:
        # Old pipe-separated format
        lines = [p.strip() for p in lines[0].split("|") if p.strip()]

    result = []
    seen = set()
    for line in lines:
        m = re.match(r'^([A-Za-z][A-Za-z0-9_\-]*):\s*(.+)$', line)
        if m:
            raw_key = m.group(1)
            norm    = raw_key.lower().replace("-", "_")
            value   = m.group(2).strip()
            if norm not in seen:
                result.append((norm, raw_key, value))
                seen.add(norm)
    return result

def build_extra(current_str, additions, reformat=False):
    """
    Return (new_extra_str, changed: bool).

    - Always uses underscore keys (normalises on reformat or when adding new fields).
    - Appends missing keys from `additions`.
    - On reformat: rebuilds whole field in preferred order with underscore keys.
    - Without reformat: appends to existing string as-is.
    """
    parsed = parse_extra(current_str)
    existing_norm = {norm: val for norm, _, val in parsed}

    missing = {
        k: v for k, v in additions.items()
        if k.lower().replace("-", "_") not in existing_norm
    }

    if not missing and not reformat:
        return current_str, False

    if reformat:
        # Rebuild the whole field with normalised keys in preferred order
        merged = dict(existing_norm)
        merged.update({k.lower().replace("-","_"): v for k, v in missing.items()})
        lines = []
        for k in PREFERRED_KEY_ORDER:
            if k in merged:
                lines.append(f"{k}: {merged[k]}")
        for k, v in merged.items():
            if k not in PREFERRED_KEY_ORDER:
                lines.append(f"{k}: {v}")
        return "\n".join(lines), True
    else:
        # Append missing fields to existing string
        lines = [l for l in current_str.split("\n") if l.strip()]
        for k, v in missing.items():
            lines.append(f"{k}: {v}")
        return "\n".join(lines), True

# ── API helpers ───────────────────────────────────────────────────────────────

def api_get(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        total = int(r.headers.get("Total-Results", 0))
        data  = json.loads(r.read())
    return data, total

def api_patch(key, version, patch):
    url  = f"{BASE_URL}/{key}"
    body = json.dumps(patch).encode()
    h    = dict(HEADERS)
    h["If-Unmodified-Since-Version"] = str(version)
    h["Content-Type"] = "application/json"
    req  = urllib.request.Request(url, data=body, headers=h, method="PATCH")
    with urllib.request.urlopen(req) as r:
        return r.status

def fetch_all_items():
    items, start = [], 0
    while True:
        url = f"{BASE_URL}/top?format=json&limit=100&start={start}"
        batch, total = api_get(url)
        items.extend(batch)
        start += len(batch)
        if start >= total or not batch:
            break
    return items

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"Fetching items from Zotero group {GROUP_ID}…")
    all_items = fetch_all_items()
    by_key = {item["key"]: item for item in all_items}
    print(f"  {len(all_items)} items loaded\n")

    success = skipped = errors = 0

    for zkey, label, additions, reformat, tag_fixes in UPDATES:
        item = by_key.get(zkey)
        if not item:
            print(f"  ⚠️  {zkey} ({label}) — not found in library, skipping")
            errors += 1
            continue

        d             = item["data"]
        current_extra = d.get("extra", "")
        current_tags  = d.get("tags", [])
        version       = item["version"]

        new_extra, extra_changed = build_extra(current_extra, additions, reformat)

        # Tag fixes
        new_tags     = list(current_tags)
        tags_changed = False
        for old_tag, new_tag in tag_fixes:
            updated = []
            for t in new_tags:
                if t["tag"] == old_tag:
                    updated.append({"tag": new_tag})
                    tags_changed = True
                    print(f"    tag: {old_tag} → {new_tag}")
                else:
                    updated.append(t)
            new_tags = updated

        if not extra_changed and not tags_changed:
            print(f"  ✓  {label} — already up to date")
            skipped += 1
            continue

        patch = {"version": version}
        if extra_changed:
            patch["extra"] = new_extra
        if tags_changed:
            patch["tags"] = new_tags

        try:
            status = api_patch(zkey, version, patch)
            added_fields = list(additions.keys()) if extra_changed else []
            detail = ", ".join(f"+{k}" for k in added_fields) if added_fields else "reformat"
            if tag_fixes and tags_changed:
                detail += ", tag fix"
            print(f"  ✅  {label} [{detail}] (HTTP {status})")
            success += 1
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:200]
            print(f"  ❌  {label}: HTTP {e.code} {e.reason} — {body}")
            errors += 1

        time.sleep(0.25)  # stay within Zotero rate limits

    print()
    print(f"Done — {success} updated, {skipped} already current, {errors} errors")
    if errors:
        sys.exit(1)

if __name__ == "__main__":
    main()

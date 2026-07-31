#!/usr/bin/env python3
"""
zotero-fix-tags.py — Fix malformed tags in the sackar-atlas Zotero group library.

Reads ZOTERO_API_KEY and ZOTERO_GROUP_ID from environment variables.
Safe to run multiple times — idempotent.

Fixes applied:
  - people:slug        → person:slug  (wrong plural prefix)
  - case:stephen-page  → person:stephen-page  (wrong collection prefix)
  - year:YYYY          → YYYY  (bogus prefix; plain tag)
  - location:<non-slug>→ <non-slug>  (location used for place names, not dataset slugs)
  - location:rise-memorial → event:rise-memorial-marks-park  (event slug exists)
  - event:<non-slug>   → <non-slug>  (event used for keywords, no matching event file)

Usage:
  ZOTERO_API_KEY=*** ZOTERO_GROUP_ID=6623153 python3 scripts/zotero-fix-tags.py
"""

import os, sys, json, time, re
import urllib.request, urllib.error

API_KEY  = os.environ.get("ZOTERO_API_KEY","").strip()
GROUP_ID = os.environ.get("ZOTERO_GROUP_ID","6623153").strip()
BASE_URL = f"https://api.zotero.org/groups/{GROUP_ID}/items"
HEADERS  = {"Zotero-API-Version":"3","Zotero-API-Key":API_KEY}

if not API_KEY:
    print("❌  ZOTERO_API_KEY not set.", file=sys.stderr)
    sys.exit(1)

# ── Tag transformation rules ──────────────────────────────────────────────────
#
# Key:   (old_prefix_or_None, old_slug)  — prefix is None for plain tags
# Value: (new_prefix_or_None, new_slug)  — None prefix = plain tag (no colon)
#
# All comparisons are case-sensitive (Zotero tags are case-sensitive).

TAG_TRANSFORMS = {
    # people: → person: (wrong plural prefix)
    ("people", "david-elliot"):    ("person", "david-elliot"),
    ("people", "neville-wran"):    ("person", "neville-wran"),
    ("people", "norman-allan"):    ("person", "norman-allan"),
    ("people", "peter-ryan"):      ("person", "peter-ryan"),
    ("people", "john-avery"):      ("person", "john-avery"),
    ("people", "scott-white"):     ("person", "scott-white"),

    # case: used for a person
    ("case", "stephen-page"):      ("person", "stephen-page"),

    # year: prefix → plain tag (year is not a Zotero namespace)
    ("year", "1976"): (None, "1976"),
    ("year", "1977"): (None, "1977"),
    ("year", "1978"): (None, "1978"),
    ("year", "1980"): (None, "1980"),
    ("year", "1985"): (None, "1985"),
    ("year", "1986"): (None, "1986"),
    ("year", "1987"): (None, "1987"),
    ("year", "1988"): (None, "1988"),
    ("year", "1989"): (None, "1989"),
    ("year", "1990"): (None, "1990"),
    ("year", "1993"): (None, "1993"),
    ("year", "1995"): (None, "1995"),
    ("year", "1996"): (None, "1996"),
    ("year", "2005"): (None, "2005"),
    ("year", "2014"): (None, "2014"),
    ("year", "2016"): (None, "2016"),
    ("year", "2018"): (None, "2018"),
    ("year", "2019"): (None, "2019"),
    ("year", "2020"): (None, "2020"),
    ("year", "2021"): (None, "2021"),
    ("year", "2022"): (None, "2022"),
    ("year", "2023"): (None, "2023"),
    ("year", "2025"): (None, "2025"),
    ("year", "2026"): (None, "2026"),

    # location: used for place names that aren't in data/locations/
    # → strip prefix, keep as plain descriptive tag
    ("location", "bondi-cliffs"):    (None, "bondi-cliffs"),
    ("location", "bondi"):           (None, "bondi"),
    ("location", "tamarama"):        (None, "tamarama"),
    ("location", "sydney"):          (None, "sydney"),
    ("location", "albury"):          (None, "albury"),
    ("location", "surry-hills"):     (None, "surry-hills"),
    ("location", "midnight-shift"):  (None, "midnight-shift"),
    ("location", "oxford-hotel"):    (None, "oxford-hotel"),
    ("location", "blue-fish-point"): (None, "blue-fish-point"),
    # Special: rise-memorial IS in the dataset — but as an event, not a location
    ("location", "rise-memorial"):   ("event", "rise-memorial-marks-park"),

    # event: used for keywords/topics that have no matching event file
    # → strip prefix, keep as plain descriptive tag
    ("event", "scoi-inquiry"):          (None, "scoi-inquiry"),
    ("event", "scoi-hearings"):         (None, "scoi-hearings"),
    ("event", "arrests"):               (None, "arrests"),
    ("event", "coronial-reversal"):     (None, "coronial-reversal"),
    ("event", "operation-taradale"):    (None, "operation-taradale"),
    ("event", "strike-force-macnamir"): (None, "strike-force-macnamir"),
}


def parse_tag(tag_str):
    """Split 'prefix:slug' into (prefix, slug); plain tags return (None, tag_str)."""
    if ":" in tag_str:
        prefix, slug = tag_str.split(":", 1)
        return prefix, slug
    return None, tag_str

def build_tag(prefix, slug):
    return f"{prefix}:{slug}" if prefix else slug

def transform_tags(tags):
    """
    Apply TAG_TRANSFORMS to a list of Zotero tag dicts.
    Returns (new_tags, changed: bool, log: list[str]).
    Deduplicates after transformation.
    """
    new_tags = []
    seen     = set()
    changed  = False
    log      = []

    for t in tags:
        raw     = t["tag"]
        prefix, slug = parse_tag(raw)
        key     = (prefix, slug)

        if key in TAG_TRANSFORMS:
            new_prefix, new_slug = TAG_TRANSFORMS[key]
            new_raw = build_tag(new_prefix, new_slug)
            if new_raw != raw:
                log.append(f"    {raw!r} → {new_raw!r}")
                changed = True
                raw = new_raw
        
        if raw not in seen:
            seen.add(raw)
            new_tags.append({"tag": raw})

    return new_tags, changed, log


def fetch_all():
    items, start = [], 0
    while True:
        url = f"{BASE_URL}/top?format=json&limit=100&start={start}"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as r:
            total = int(r.headers.get("Total-Results",0))
            batch = json.loads(r.read())
        items.extend(batch)
        start += len(batch)
        if start >= total or not batch:
            break
    return items

def patch_item(key, version, patch):
    url  = f"{BASE_URL}/{key}"
    body = json.dumps(patch).encode()
    h    = dict(HEADERS)
    h["If-Unmodified-Since-Version"] = str(version)
    h["Content-Type"] = "application/json"
    req  = urllib.request.Request(url, data=body, headers=h, method="PATCH")
    with urllib.request.urlopen(req) as r:
        return r.status

def main():
    print(f"Fetching items from Zotero group {GROUP_ID}…")
    items = fetch_all()
    print(f"  {len(items)} items loaded\n")

    success = skipped = errors = 0

    for item in sorted(items, key=lambda x: x["data"].get("title","")[:40]):
        d       = item["data"]
        key     = item["key"]
        version = item["version"]
        title   = d.get("title","?")[:60]
        tags    = d.get("tags", [])

        new_tags, changed, log = transform_tags(tags)

        if not changed:
            skipped += 1
            continue

        print(f"  [{key}] {title}")
        for line in log:
            print(line)

        try:
            status = patch_item(key, version, {"version": version, "tags": new_tags})
            print(f"  → ✅  updated (HTTP {status})\n")
            success += 1
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:200]
            print(f"  → ❌  HTTP {e.code}: {body}\n")
            errors += 1

        time.sleep(0.25)

    print(f"Done — {success} updated, {skipped} unchanged, {errors} errors")
    if errors:
        sys.exit(1)

if __name__ == "__main__":
    main()

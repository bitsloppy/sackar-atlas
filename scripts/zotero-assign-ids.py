#!/usr/bin/env python3
"""
zotero-assign-ids.py — Assign sackar_atlas_id to the 24 remaining Zotero items
and delete 2 empty placeholder entries.

Reads ZOTERO_API_KEY and ZOTERO_GROUP_ID from environment.
Idempotent — skips items that already have sackar_atlas_id set.

Usage:
  ZOTERO_API_KEY=*** ZOTERO_GROUP_ID=6623153 python3 scripts/zotero-assign-ids.py
"""

import os, sys, json, time, re
import urllib.request, urllib.error

API_KEY  = os.environ.get("ZOTERO_API_KEY", "").strip()
GROUP_ID = os.environ.get("ZOTERO_GROUP_ID", "6623153").strip()
BASE_URL = f"https://api.zotero.org/groups/{GROUP_ID}/items"
HEADERS  = {"Zotero-API-Version": "3", "Zotero-API-Key": API_KEY}

if not API_KEY:
    print("❌  ZOTERO_API_KEY not set.", file=sys.stderr)
    sys.exit(1)

# ── Items to assign IDs ───────────────────────────────────────────────────────
#
# (zotero_key, sackar_atlas_id, extra_additions)
# extra_additions: fields to append to Extra if not already present.
# significance defaults assumed: secondary for news/web, tertiary for reference/wiki,
# primary-source-quality for archival/primary documents.

ASSIGN = [
    # ── Substantive news sources ──────────────────────────────────────────────
    ("KSUZ5Z8L", "abc-news-2023-12-16-inquiry-trigger-more-inquests", {
        "significance": "secondary",
        "series_id": "abc",
    }),
    ("5LL9LKFA", "guardian-2024-01-01-families-police-response", {
        "significance": "secondary",
    }),
    ("96SQEVPM", "guardian-2018-06-27-twenty-seven-men", {
        "significance": "secondary",
    }),
    ("Z29FRSQG", "nine-2022-11-02-scoi-probe-begins", {
        "significance": "secondary",
    }),
    ("2UG5HXLA", "abc-radio-2022-01-13-scott-johnson-brother", {
        "significance": "secondary",
        "series_id": "abc",
    }),
    ("M4NBVRX9", "abc-radio-2016-12-15-scott-johnson-third-inquest", {
        "significance": "secondary",
        "series_id": "abc",
    }),

    # ── Archival ──────────────────────────────────────────────────────────────
    ("YBCNKLLD", "state-library-1978-tribune-negatives-gay-liberation", {
        "significance": "primary-source-quality",
    }),

    # ── SCOI primary documents ────────────────────────────────────────────────
    ("QMIM5EPI", "scoi-2023-volume-1", {
        "significance": "primary-source-quality",
    }),
    ("NXE37UWY", "scoi-2023-volume-2", {
        "significance": "primary-source-quality",
    }),
    ("QNEBRX56", "scoi-2023-volume-3", {
        "significance": "primary-source-quality",
    }),
    ("DFIEAA2P", "scoi-2023-annexures", {
        "significance": "primary-source-quality",
    }),
    ("MTVLXE5R", "nsw-gov-scoi-landing-page", {
        "significance": "secondary",
    }),
    ("NYJYM23Q", "nswpf-scoi-landing-page", {
        "significance": "secondary",
    }),
    ("3LH99LTN", "nswpf-parrabell-landing-page", {
        "significance": "secondary",
    }),

    # ── Editorial reference ───────────────────────────────────────────────────
    ("95Y5QRKF", "meaa-code-of-ethics", {
        "significance": "tertiary",
    }),
    ("MIJDTYK5", "meaa-lgbtqia-reporting-guidelines", {
        "significance": "tertiary",
    }),

    # ── Wikipedia — bibliographic reference for people records ────────────────
    ("JAPYLHY4", "wikipedia-andrew-scipione",  {"significance": "tertiary"}),
    ("EBY94MKC", "wikipedia-cecil-abbott",     {"significance": "tertiary"}),
    ("QR3XN68W", "wikipedia-david-elliott",    {"significance": "tertiary"}),
    ("2M32AWDF", "wikipedia-john-avery",       {"significance": "tertiary"}),
    ("8EDYT8FX", "wikipedia-neville-wran",     {"significance": "tertiary"}),
    ("2J6Z6TBK", "wikipedia-norman-allan",     {"significance": "tertiary"}),
    ("UCGIV3D3", "wikipedia-peter-ryan",       {"significance": "tertiary"}),
    ("46MN47PK", "wikipedia-gay-gang-murders", {"significance": "tertiary"}),
]

# ── Items to delete (empty placeholders) ──────────────────────────────────────
DELETE = [
    ("M3DV8ERE", "Bondi Badlands (show-level stub, no URL/date/episode)"),
    ("KKIFYXKF", "Resources (generic MEAA page, no content)"),
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def has_sal_id(extra):
    return bool(re.search(r'sackar.atlas.id:', extra, re.IGNORECASE))

def parse_extra(s):
    out = {}
    for line in s.split("\n"):
        m = re.match(r'^([A-Za-z][A-Za-z0-9_\-]*):\s*(.+)$', line.strip())
        if m:
            out[m.group(1).lower().replace("-","_")] = m.group(2).strip()
    return out

def append_extra(current, sal_id, additions):
    """Append sackar_atlas_id + any missing additions to current Extra string."""
    lines   = [l for l in current.split("\n") if l.strip()]
    existing = parse_extra(current)
    # sackar_atlas_id first if not present
    if "sackar_atlas_id" not in existing:
        lines.insert(0, f"sackar_atlas_id: {sal_id}")
    for k, v in additions.items():
        if k.lower().replace("-","_") not in existing:
            lines.append(f"{k}: {v}")
    return "\n".join(lines)

def fetch_all():
    items, start = [], 0
    while True:
        url = f"{BASE_URL}/top?format=json&limit=100&start={start}"
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as r:
            total = int(r.headers.get("Total-Results", 0))
            batch = json.loads(r.read())
        items.extend(batch)
        start += len(batch)
        if start >= total or not batch:
            break
    return items

def api_patch(key, version, patch):
    url  = f"{BASE_URL}/{key}"
    body = json.dumps(patch).encode()
    h    = dict(HEADERS)
    h["If-Unmodified-Since-Version"] = str(version)
    h["Content-Type"] = "application/json"
    req  = urllib.request.Request(url, data=body, headers=h, method="PATCH")
    with urllib.request.urlopen(req) as r:
        return r.status

def api_delete(key, version):
    url = f"{BASE_URL}/{key}"
    h   = dict(HEADERS)
    h["If-Unmodified-Since-Version"] = str(version)
    req = urllib.request.Request(url, headers=h, method="DELETE")
    with urllib.request.urlopen(req) as r:
        return r.status

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"Fetching items from Zotero group {GROUP_ID}…")
    all_items = fetch_all()
    by_key    = {item["key"]: item for item in all_items}
    print(f"  {len(all_items)} items loaded\n")

    success = skipped = errors = 0

    # ── Assign IDs ────────────────────────────────────────────────────────────
    print("=== Assigning sackar_atlas_id ===\n")
    for zkey, sal_id, additions in ASSIGN:
        item = by_key.get(zkey)
        if not item:
            print(f"  ⚠️   [{zkey}] not found — skipping")
            errors += 1
            continue

        d       = item["data"]
        version = item["version"]
        current = d.get("extra", "")
        title   = d.get("title", "?")[:60]

        if has_sal_id(current):
            print(f"  ✓   {title} — already has ID")
            skipped += 1
            continue

        new_extra = append_extra(current, sal_id, additions)
        try:
            status = api_patch(zkey, version, {"version": version, "extra": new_extra})
            print(f"  ✅  [{zkey}] {title}")
            print(f"       sackar_atlas_id: {sal_id} (HTTP {status})")
            success += 1
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:200]
            print(f"  ❌  [{zkey}] {title}: HTTP {e.code} — {body}")
            errors += 1

        time.sleep(0.25)

    # ── Delete placeholders ───────────────────────────────────────────────────
    print(f"\n=== Deleting placeholder items ===\n")
    for zkey, reason in DELETE:
        item = by_key.get(zkey)
        if not item:
            print(f"  ⚠️   [{zkey}] not found — already deleted?")
            continue
        version = item["version"]
        title   = item["data"].get("title","?")[:60]
        try:
            status = api_delete(zkey, version)
            print(f"  🗑️   [{zkey}] {title} (HTTP {status})")
            print(f"       Reason: {reason}")
            success += 1
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:200]
            print(f"  ❌  [{zkey}] {title}: HTTP {e.code} — {body}")
            errors += 1
        time.sleep(0.25)

    print(f"\nDone — {success} changes, {skipped} already current, {errors} errors")
    if errors:
        sys.exit(1)

if __name__ == "__main__":
    main()

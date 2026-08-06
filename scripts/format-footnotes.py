#!/usr/bin/env python3
"""
format-footnotes.py — Format footnotes in cleaned SCOI case files.

Expects a ## Footnotes section at the bottom of the file with entries like:

    189. Exhibit 26, Tab 1, Statement of Helen Colman...
    190. Exhibit 26, Tab 2, ...

What it does:
  1. Converts footnote definitions to proper Markdown:
         189. Exhibit 26, Tab 1, ...
       → [^189]: Exhibit 26, Tab 1, ...

  2. Converts inline footnote references in the body text:
         "...in Manly.190 Ms Colman..."
       → "...in Manly.[^190] Ms Colman..."

Inline detection: looks for the footnote number immediately after sentence-ending
punctuation (. , ; : ! ? " ' ) ]) and followed by whitespace or end of line.
This matches how the SCOI PDFs embed footnote numbers inline.

Safe to rerun: skips definitions already in [^N]: format, skips inline
references already in [^N] format.

Usage:
    python3 scripts/format-footnotes.py <file> [--dry-run]
    python3 scripts/format-footnotes.py sources/SCOI-V2-*.md --dry-run
"""

import re
import sys
import argparse

# Matches a footnotes section heading: # Footnotes / ## Footnotes / ### Footnotes
FOOTNOTE_HEADING_RE = re.compile(r'^#{1,4}\s+footnotes?\s*$', re.IGNORECASE)

# Matches a plain numbered footnote definition: 189. Text here
PLAIN_DEF_RE = re.compile(r'^(\d+)\.?\s+(.+)$')  # period after number is optional

# Matches an already-formatted Markdown footnote: [^189]: Text here
MD_DEF_RE = re.compile(r'^\[\^(\d+)\]:\s+(.+)$')


def find_footnote_section(lines):
    """Return index of the footnotes heading line, or None."""
    for i, line in enumerate(lines):
        if FOOTNOTE_HEADING_RE.match(line.rstrip()):
            return i
    return None


def parse_footnote_ids(lines, section_start):
    """
    Collect footnote IDs from the footnotes section.
    Handles both plain (189. Text) and already-formatted ([^189]: Text) entries.
    Returns a set of ID strings.
    """
    ids = set()
    for line in lines[section_start + 1:]:
        m = PLAIN_DEF_RE.match(line.rstrip())
        if m:
            ids.add(m.group(1))
            continue
        m = MD_DEF_RE.match(line.rstrip())
        if m:
            ids.add(m.group(1))
    return ids


def build_inline_patterns(fid):
    """
    Build regex patterns that match a bare footnote number in body text.

    Returns a list of (compiled_pattern, replacement_string) pairs covering
    all separator styles found in SCOI extracted text:

      Separator  Example               Result
      ---------  --------------------  ----------------------
      period     Manly.190             Manly.[^190]
      semicolon  gay;338               gay;[^338]
      colon      conclusion:213        conclusion:[^213]
      comma      family,316            family,[^316]
      none       disorder"277          disorder"[^277]  <- only after closing quote/bracket

    Rules to avoid false positives:
      - Separator patterns: require char before separator NOT be a digit,
        so SCOI.02724.190 and year refs like 1977.266 are left alone.
      - No-separator pattern: only fires after " ' ) ] — not bare letters —
        so ordinary words adjacent to numbers are not touched.
      - Never followed by another digit (avoids matching 19 inside 190).
    """
    num = re.escape(fid)
    suffix = r'(?!\d)(?=[\s\[<]|$)'
    return [
        # period, semicolon, colon, comma — after letter or closing punct (not digit)
        (re.compile(r'(?<=[a-zA-Z"\'\]\)])([.:;,])' + num + suffix),
         r'\1[^' + fid + r']'),
        # no separator — only after closing quote or bracket (not bare letter)
        (re.compile(r'(?<=["\'\]\)])' + num + suffix),
         '[^' + fid + ']'),
    ]


def format_body_line(line, sorted_ids):
    """Replace bare footnote numbers with [^N] in a body text line."""
    for fid, pat_list in sorted_ids:
        for pattern, repl in pat_list:
            line = pattern.sub(repl, line)
    return line

def process_file(path, dry_run=False):
    with open(path, encoding='utf-8') as f:
        lines = f.readlines()

    section_start = find_footnote_section(lines)
    if section_start is None:
        print(f"⚠  No Footnotes section found in {path} — add a '## Footnotes' heading first")
        return 0

    ids = parse_footnote_ids(lines, section_start)
    if not ids:
        print(f"⚠  Footnotes section found but no entries parsed in {path}")
        return 0

    id_range = f"{min(ids, key=int)}–{max(ids, key=int)}" if ids else "none"
    print(f"  Found {len(ids)} footnote ID(s): {id_range}")

    # Pre-build patterns sorted longest-first to avoid partial matches
    # (e.g. avoid replacing 19 inside 190 — the (?!\d) handles this too, but
    # longest-first is belt-and-suspenders and makes the output deterministic)
    sorted_ids = sorted(
        [(fid, build_inline_patterns(fid)) for fid in ids],
        key=lambda x: -len(x[0])
    )

    out = []
    body_changed = 0
    fn_changed = 0
    examples = []

    for i, line in enumerate(lines):
        if i < section_start:
            # Body text — replace inline references
            new_line = format_body_line(line, sorted_ids)
            if new_line != line:
                body_changed += 1
                if len(examples) < 4:
                    examples.append((line.rstrip(), new_line.rstrip()))
            out.append(new_line)

        elif i == section_start:
            # The heading itself — keep as-is
            out.append(line)

        else:
            # Footnotes section — convert plain definitions to Markdown
            m = PLAIN_DEF_RE.match(line.rstrip())
            if m:
                new_line = f'[^{m.group(1)}]: {m.group(2)}\n'
                if new_line != line:
                    fn_changed += 1
                out.append(new_line)
            else:
                out.append(line)

    if dry_run:
        print(f"  [dry-run] Would update {body_changed} inline reference(s) in body text")
        print(f"  [dry-run] Would reformat {fn_changed} footnote definition(s)")
        if examples:
            print("  Examples:")
            for old, new in examples:
                print(f"    - {old}")
                print(f"    + {new}")
    else:
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(out)
        print(f"  ✓ Updated {body_changed} inline reference(s), reformatted {fn_changed} definition(s)")

    return body_changed + fn_changed


def main():
    parser = argparse.ArgumentParser(
        description="Format SCOI footnotes: convert plain-numbered definitions to Markdown "
                    "and match inline references in body text."
    )
    parser.add_argument('files', nargs='+', help='Markdown file(s) to process')
    parser.add_argument('--dry-run', action='store_true', help='Preview without writing')
    args = parser.parse_args()

    total = 0
    for path in args.files:
        print(path)
        total += process_file(path, args.dry_run)

    if len(args.files) > 1:
        verb = "Would change" if args.dry_run else "Changed"
        print(f"\n{verb} {total} item(s) across {len(args.files)} file(s)")


if __name__ == '__main__':
    main()

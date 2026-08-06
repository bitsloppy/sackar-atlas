#!/usr/bin/env python3
"""
add-para-anchors.py — Insert <span id="N.N."></span> anchors before SCOI paragraph numbers,
and join wrapped continuation lines into a single line per paragraph.

Matches lines starting with SCOI-style paragraph numbers (e.g. 5.96. or 13.12.),
collects all continuation lines until a blank line, heading, or new paragraph number,
joins them into one line, then prepends the span anchor.

Unsure paragraphs — where the first line ends with a colon + optional footnote number
(likely introducing a block quote or structured content) — are left unchanged and
listed for manual review.

Skips paragraphs that already have a span anchor.

Usage:
    python3 scripts/add-para-anchors.py <file> [--dry-run]
    python3 scripts/add-para-anchors.py sources/*.md --dry-run

Options:
    --dry-run    Preview changes without writing anything
"""

import re
import sys
import argparse

# Matches SCOI paragraph numbers at line start: 5.96.  5.100.  6.5.  13.1.
# Requires the trailing dot and at least one space/char after.
PARA_RE = re.compile(r'^(\d+\.\d+\.)\s')

# Paragraph intro lines ending with colon + optional footnote number.
# These likely introduce block quotes or structured content — flag as unsure.
COLON_INTRO_RE = re.compile(r':\d*$')


def process_file(path, dry_run=False):
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()

    out = []
    changed = 0
    skipped = []  # paragraph IDs left unchanged for review
    examples = []

    i = 0
    while i < len(lines):
        line = lines[i]

        # Skip lines that already have a span anchor
        if line.startswith("<span id="):
            out.append(line)
            i += 1
            continue

        m = PARA_RE.match(line)
        if m:
            para_id = m.group(1)
            first_stripped = line.rstrip('\n').rstrip()

            # Collect continuation lines (raw for possible passthrough, stripped for joining)
            raw_continuation = []
            parts = [first_stripped]
            i += 1
            while i < len(lines):
                next_line = lines[i]
                # Stop at: blank line, heading, new paragraph number, existing span
                if (next_line.strip() == '' or
                        next_line.startswith('#') or
                        PARA_RE.match(next_line) or
                        next_line.startswith('<span id=')):
                    break
                raw_continuation.append(next_line)
                parts.append(next_line.strip())
                i += 1

            # Unsure: multi-line paragraph whose first line ends with colon + optional
            # footnote number — likely introduces a block quote or structured content.
            if raw_continuation and COLON_INTRO_RE.search(first_stripped):
                out.append(line)
                out.extend(raw_continuation)
                skipped.append(para_id.rstrip('.'))
            else:
                # Confident: join all parts into one line
                joined = ' '.join(parts)
                new_line = f'<span id="{para_id.rstrip(".")}"></span>{joined}\n'
                out.append(new_line)
                changed += 1
                if len(examples) < 4:
                    examples.append(new_line.rstrip())
        else:
            out.append(line)
            i += 1

    if dry_run:
        print(f"[dry-run] {path}")
        print(f"  Would add {changed} span anchor(s) with line joining")
        for ex in examples:
            print(f"  → {ex[:120]}")
        if changed > len(examples):
            print(f"  … and {changed - len(examples)} more")
        if skipped:
            print(f"  Unsure (left unchanged) — {len(skipped)} paragraph(s) to review:")
            for pid in skipped:
                print(f"    ⚠️  {pid}")
    else:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(out)
        print(f"✓ {path} — added {changed} span anchor(s) with line joining")
        if skipped:
            print(f"  Unsure (left unchanged) — {len(skipped)} paragraph(s) to review:")
            for pid in skipped:
                print(f"    ⚠️  {pid}")

    return changed, skipped


def main():
    parser = argparse.ArgumentParser(
        description="Add SCOI paragraph span anchors to cleaned case MD files."
    )
    parser.add_argument("files", nargs="+", help="One or more Markdown files to process")
    parser.add_argument(
        "--dry-run", action="store_true", help="Preview changes without writing"
    )
    args = parser.parse_args()

    total_changed = 0
    total_skipped = []
    for path in args.files:
        changed, skipped = process_file(path, args.dry_run)
        total_changed += changed
        total_skipped.extend(skipped)

    if len(args.files) > 1:
        verb = "Would add" if args.dry_run else "Added"
        print(f"\n{verb} {total_changed} span anchor(s) across {len(args.files)} file(s)")
        if total_skipped:
            print(f"Total unsure paragraphs to review: {len(total_skipped)}")


if __name__ == "__main__":
    main()

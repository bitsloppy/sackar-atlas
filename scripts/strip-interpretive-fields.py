#!/usr/bin/env python3
"""
strip-interpretive-fields.py — Remove interpretive/analytical YAML fields from case files.

This project populates only verifiable lookup fields — values traceable directly to a
named primary source. Interpretive fields (analytical judgments applied by the project
rather than looked up from a source) are removed.

See docs/workflow-source-documents.md for the boundary definition.

Usage:
    python3 scripts/strip-interpretive-fields.py [--dry-run] [files...]
    python3 scripts/strip-interpretive-fields.py data/cases/*.md --dry-run
    python3 scripts/strip-interpretive-fields.py data/cases/*.md
"""

import re
import sys
import argparse
from pathlib import Path

# ---------------------------------------------------------------------------
# Fields to remove
# ---------------------------------------------------------------------------

# Top-level single-line fields: match "^field: anything"
SINGLE_LINE_FIELDS = [
    'motive_bias_assessment',
    'killing_location_context',
    'group_attack',
    'estimated_perpetrator_count',
    'perpetrator_groups',
    'police_misconduct_level',
    'police_misconduct_summary',
    'accountability_status',
]

# Top-level block-sequence fields: match "^field:\n" followed by "  - ...\n" lines
BLOCK_SEQUENCE_FIELDS = [
    'motive_factors',
    'perpetrator_groups',   # also here in case it has block form
]

# Indented sub-fields (2-space indent inside parent object)
INDENTED_FIELDS = [
    'confidence',     # inside sexuality:
    'display_note',   # inside sexuality:
    'site_status',    # inside manner_findings:
]


def strip_frontmatter_fields(text):
    """
    Strip target YAML fields from the frontmatter of a markdown file.
    Preserves the markdown body unchanged.
    Returns (new_text, list_of_removed_fields).
    """
    # Split into frontmatter and body
    # Frontmatter is between the first two '---' lines
    fm_match = re.match(r'^(---\n)(.*?)(^---\n)', text, re.DOTALL | re.MULTILINE)
    if not fm_match:
        return text, []

    prefix = fm_match.group(1)
    frontmatter = fm_match.group(2)
    suffix = text[fm_match.end():]  # everything after closing ---

    removed = []
    original_frontmatter = frontmatter

    # 1. Remove block-sequence fields (field:\n  - item\n  - item\n)
    for field in BLOCK_SEQUENCE_FIELDS:
        pattern = re.compile(
            rf'^{re.escape(field)}:\s*\n(?:  - .*\n)*',
            re.MULTILINE
        )
        new_fm, count = pattern.subn('', frontmatter)
        if count:
            removed.append(field)
            frontmatter = new_fm

    # 2. Remove top-level single-line fields (field: value\n)
    for field in SINGLE_LINE_FIELDS:
        pattern = re.compile(
            rf'^{re.escape(field)}:.*\n',
            re.MULTILINE
        )
        new_fm, count = pattern.subn('', frontmatter)
        if count:
            if field not in removed:
                removed.append(field)
            frontmatter = new_fm

    # 3. Remove indented sub-fields (  field: value\n)
    for field in INDENTED_FIELDS:
        pattern = re.compile(
            rf'^  {re.escape(field)}:.*\n',
            re.MULTILINE
        )
        new_fm, count = pattern.subn('', frontmatter)
        if count:
            removed.append(field)
            frontmatter = new_fm

    # Clean up any double-blank-lines left by removals (max one blank line between blocks)
    frontmatter = re.sub(r'\n{3,}', '\n\n', frontmatter)

    new_text = prefix + frontmatter + '---\n' + suffix
    return new_text, removed


def process_file(path, dry_run=False):
    text = Path(path).read_text(encoding='utf-8')
    new_text, removed = strip_frontmatter_fields(text)

    if not removed:
        print(f'  {path}: nothing to remove')
        return 0

    if dry_run:
        print(f'  [dry-run] {path}: would remove → {", ".join(removed)}')
    else:
        Path(path).write_text(new_text, encoding='utf-8')
        print(f'  ✓ {path}: removed → {", ".join(removed)}')

    return len(removed)


def main():
    parser = argparse.ArgumentParser(
        description='Strip interpretive YAML fields from case markdown files.'
    )
    parser.add_argument(
        'files', nargs='*',
        default=['data/cases/*.md'],
        help='Files to process (default: data/cases/*.md)'
    )
    parser.add_argument(
        '--dry-run', action='store_true',
        help='Preview changes without writing'
    )
    args = parser.parse_args()

    # Expand globs if needed
    files = []
    for pattern in args.files:
        matches = list(Path('.').glob(pattern)) if '*' in pattern else [Path(pattern)]
        files.extend(matches)

    if not files:
        print('No files found.')
        sys.exit(1)

    print(f'{"[dry-run] " if args.dry_run else ""}Processing {len(files)} file(s)...\n')
    total = 0
    for f in sorted(files):
        total += process_file(f, dry_run=args.dry_run)

    verb = 'Would remove' if args.dry_run else 'Removed'
    print(f'\n{verb} {total} field instance(s) across {len(files)} file(s).')


if __name__ == '__main__':
    main()

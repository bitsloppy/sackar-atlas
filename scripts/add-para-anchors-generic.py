#!/usr/bin/env python3
"""
add-para-anchors-generic.py — Insert <span id="DOC_ID.N"></span> anchors before body
paragraphs in source documents that do not have native paragraph numbering.

Assigns sequential IDs across the whole document (DOC_ID.1, DOC_ID.2, ...).
Skips: headings, blank lines, list items, code blocks, blockquotes,
       HTML comments, existing span anchors, and table rows.

These IDs are an editorial addition. They are not present in the original document.
The source file header should note: para_ids_note: Paragraph IDs are an editorial
addition by Anna Roberts. Sequential numbering. Format: [DOC_ID].[N].

Usage:
    python3 scripts/add-para-anchors-generic.py <file> --doc-id <ID> [--dry-run]
    python3 scripts/add-para-anchors-generic.py sources/201806-Strike-Force-Parrabell-Final-report.md --doc-id PFR --dry-run

Options:
    --doc-id     Document ID prefix (e.g. PFR, R58, IPTJ). Required.
    --dry-run    Preview changes without writing anything.
    --start-at   Start sequential numbering at this value (default: 1).
                 Use when processing a chunk of a larger document.
"""

import re
import sys
import argparse


def is_skippable(line):
    """Return True for lines that should not receive a paragraph anchor."""
    stripped = line.strip()

    # Blank line
    if not stripped:
        return True

    # Heading
    if stripped.startswith('#'):
        return True

    # List item (unordered or ordered)
    if re.match(r'^[-*+]\s', stripped) or re.match(r'^\d+\.\s', stripped):
        return True

    # Blockquote
    if stripped.startswith('>'):
        return True

    # Code block fence
    if stripped.startswith('```') or stripped.startswith('~~~'):
        return True

    # HTML comment
    if stripped.startswith('<!--'):
        return True

    # Existing span anchor
    if stripped.startswith('<span id='):
        return True

    # Table row
    if stripped.startswith('|'):
        return True

    # Horizontal rule
    if re.match(r'^[-*_]{3,}$', stripped):
        return True

    # HTML tag line
    if stripped.startswith('<') and not stripped.startswith('<span id='):
        return True

    return False


def in_code_block(state):
    return state.get('in_code', False)


def process_file(path, doc_id, dry_run=False, start_at=1):
    with open(path, encoding='utf-8') as f:
        lines = f.readlines()

    out = []
    changed = 0
    skipped_existing = 0
    counter = start_at - 1
    examples = []
    in_code = False

    for line in lines:
        stripped = line.strip()

        # Track code block state
        if stripped.startswith('```') or stripped.startswith('~~~'):
            in_code = not in_code
            out.append(line)
            continue

        if in_code:
            out.append(line)
            continue

        # Already has a span anchor — skip (don't double-add)
        if stripped.startswith('<span id='):
            out.append(line)
            skipped_existing += 1
            continue

        if is_skippable(line):
            out.append(line)
            continue

        # This is a body paragraph — assign the next ID
        counter += 1
        span_id = f'{doc_id}.{counter}'
        new_line = f'<span id="{span_id}"></span>{line.rstrip()}\n'
        out.append(new_line)
        changed += 1

        if len(examples) < 5:
            examples.append(new_line.rstrip())

    if dry_run:
        print(f'[dry-run] {path}')
        print(f'  doc_id prefix: {doc_id}')
        print(f'  Would add {changed} span anchor(s), numbered {doc_id}.{start_at}–{doc_id}.{counter}')
        if skipped_existing:
            print(f'  Skipped {skipped_existing} line(s) already having a span anchor')
        print(f'  Examples:')
        for ex in examples:
            print(f'    → {ex[:120]}')
        if changed > len(examples):
            print(f'    … and {changed - len(examples)} more')
    else:
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(out)
        print(f'✓ {path}')
        print(f'  Added {changed} span anchor(s): {doc_id}.{start_at}–{doc_id}.{counter}')
        if skipped_existing:
            print(f'  Skipped {skipped_existing} line(s) already having a span anchor')

    return changed, counter


def main():
    parser = argparse.ArgumentParser(
        description='Add sequential paragraph span anchors to unnumbered source documents.'
    )
    parser.add_argument('file', help='Markdown file to process')
    parser.add_argument(
        '--doc-id', required=True,
        help='Document ID prefix (e.g. PFR, R58, IPTJ)'
    )
    parser.add_argument(
        '--dry-run', action='store_true',
        help='Preview changes without writing'
    )
    parser.add_argument(
        '--start-at', type=int, default=1,
        help='Start numbering at this value (default: 1; use for chunks)'
    )
    args = parser.parse_args()

    doc_id = args.doc_id.upper()
    process_file(args.file, doc_id, dry_run=args.dry_run, start_at=args.start_at)


if __name__ == '__main__':
    main()

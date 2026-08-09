#!/usr/bin/env python3
"""
join-paragraphs.py — join hard-wrapped markdown paragraphs into single lines.

Hard-wrapped text (PDF-to-markdown style, ~60-char lines) gets joined into
single long lines per paragraph. Headings, list items, blockquotes, HTML
comment blocks, code fences, and blank lines are all preserved as-is.

Usage:
    python3 join-paragraphs.py input.md              # preview to stdout
    python3 join-paragraphs.py input.md -o out.md   # write to output file
    python3 join-paragraphs.py input.md --in-place  # edit in place (.bak backup)

Options:
    -o, --output FILE   Write result to FILE instead of stdout
    --in-place          Overwrite input file (saves .bak backup first)
    --no-backup         With --in-place: skip the backup
"""

import re
import sys
import argparse
from pathlib import Path


# Lines that should NEVER be merged with adjacent lines.
# Matched against the stripped line.
PRESERVE_PREFIXES = (
    '#',    # headings
    '>',    # blockquotes
    '- ',   # unordered list (space after dash required to avoid em-dash etc.)
    '* ',   # unordered list (asterisk)
    '+ ',   # unordered list (plus)
    '-- ',  # sub-list (-- style, as in this file)
    '<!--', # HTML comment open
    '-->',  # HTML comment close
    '|',    # table rows
    '```',  # code fences
    '~~~',  # alt code fences
    '---',  # setext h2 / horizontal rule
    '===',  # setext h1
    '***',  # horizontal rule
    '___',  # horizontal rule
)

ORDERED_LIST_RE = re.compile(r'^\d+[.)]\s')


def is_preserve(stripped: str) -> bool:
    """Return True if this line must not be joined with its neighbours."""
    if not stripped:
        return True
    if ORDERED_LIST_RE.match(stripped):
        return True
    return stripped.startswith(PRESERVE_PREFIXES)


def join_paragraphs(text: str) -> str:
    lines = text.splitlines(keepends=True)
    output = []
    buffer: list[str] = []   # accumulates consecutive joinable plain-text lines
    in_comment = False        # inside a <!-- ... --> block
    in_code = False           # inside a ``` or ~~~ fence

    def flush():
        if buffer:
            output.append(' '.join(buffer) + '\n')
            buffer.clear()

    for raw_line in lines:
        line = raw_line.rstrip('\r\n')
        stripped = line.strip()

        # ── Code fence tracking ──────────────────────────────────────────────
        if stripped.startswith(('```', '~~~')):
            in_code = not in_code
            flush()
            output.append(raw_line)
            continue

        if in_code:
            output.append(raw_line)
            continue

        # ── HTML comment block tracking ──────────────────────────────────────
        if '<!--' in stripped and not in_comment:
            in_comment = True

        if in_comment:
            flush()
            output.append(raw_line)
            if '-->' in stripped:
                in_comment = False
            continue

        # ── Blank line → flush buffer, emit blank ────────────────────────────
        if not stripped:
            flush()
            output.append(raw_line)
            continue

        # ── Preserved line (heading, list, blockquote, …) ───────────────────
        if is_preserve(stripped):
            flush()
            output.append(raw_line)
            continue

        # ── Plain paragraph text → accumulate ────────────────────────────────
        buffer.append(stripped)

    flush()
    return ''.join(output)


def main():
    parser = argparse.ArgumentParser(
        description='Join hard-wrapped markdown paragraphs into single lines.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split('Usage:')[1] if 'Usage:' in __doc__ else '',
    )
    parser.add_argument('input', help='Input markdown file')
    parser.add_argument('-o', '--output', help='Output file (default: stdout)')
    parser.add_argument('--in-place', action='store_true',
                        help='Edit file in place (creates .bak backup)')
    parser.add_argument('--no-backup', action='store_true',
                        help='Skip .bak backup when using --in-place')
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(f'Error: {input_path} not found', file=sys.stderr)
        sys.exit(1)

    original = input_path.read_text(encoding='utf-8')
    result = join_paragraphs(original)

    if args.in_place:
        if not args.no_backup:
            backup = input_path.with_suffix(input_path.suffix + '.bak')
            backup.write_text(original, encoding='utf-8')
            print(f'Backup → {backup}', file=sys.stderr)
        input_path.write_text(result, encoding='utf-8')
        print(f'Done → {input_path}', file=sys.stderr)
    elif args.output:
        out_path = Path(args.output)
        out_path.write_text(result, encoding='utf-8')
        print(f'Written → {out_path}', file=sys.stderr)
    else:
        sys.stdout.write(result)


if __name__ == '__main__':
    main()

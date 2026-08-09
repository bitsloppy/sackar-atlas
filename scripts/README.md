# Scripts

Data ingestion tools, build utilities, and helpers.

**Licence:** MIT — see [../LICENSE-code](../LICENSE-code)

---

## Markdown formatting

### `join-paragraphs.py`

Joins hard-wrapped markdown paragraphs into single lines. Useful for PDF-to-markdown
conversions where each line is ~60 chars and sentences run across multiple lines.

**What it joins:** consecutive plain-text lines within a paragraph.

**What it preserves untouched:**
- `#` headings, `>` blockquotes
- `- / * / +` unordered lists, `-- ` sub-lists, `1.` ordered lists
- `<!-- ... -->` HTML comment blocks (including multi-line)
- ` ``` ` / `~~~` code fences
- `---` / `===` / `***` horizontal rules and setext headings
- Blank lines (paragraph separators)

Already-single-line paragraphs pass through unchanged — safe to run on mixed files.

```bash
# Preview to stdout
python3 scripts/join-paragraphs.py sources/some-file.md | less

# Write to new file
python3 scripts/join-paragraphs.py sources/some-file.md -o sources/some-file-joined.md

# Edit in place (auto-saves .bak backup)
python3 scripts/join-paragraphs.py sources/some-file.md --in-place

# In-place without backup
python3 scripts/join-paragraphs.py sources/some-file.md --in-place --no-backup
```

### `add-para-anchors.py`

Inserts `<span id="N.N."></span>` anchors before SCOI paragraph numbers, and joins
wrapped continuation lines into a single line per paragraph. Used when processing
raw SCOI volume markdown.

### `format-footnotes.py`

Formats footnotes in cleaned SCOI case files. Expects a `## Footnotes` section at
the bottom of the file.

---

## QA / review

### `qa-card.py`

Generates a human-readable QA review card for a case file.

---

## Zotero

These scripts use the Zotero Web API and require `ZOTERO_API_KEY` and `ZOTERO_GROUP_ID`
environment variables. All are idempotent — safe to run multiple times.

Group library: `https://www.zotero.org/groups/6623153`

### `zotero-assign-ids.py`

Assigns `sackar_atlas_id` to Zotero items that are missing it. Skips items already
tagged. Also deletes empty placeholder entries.

```bash
ZOTERO_API_KEY=*** ZOTERO_GROUP_ID=6623153 python3 scripts/zotero-assign-ids.py
```

### `zotero-enrich-extras.py`

Enriches Zotero `Extra` fields — normalises old pipe-separated format, adds missing
`series_id`, `spotify_url`, `runtime` fields, and fixes a tag typo.

```bash
ZOTERO_API_KEY=*** ZOTERO_GROUP_ID=6623153 python3 scripts/zotero-enrich-extras.py
```

### `zotero-fix-tags.py`

Fixes malformed tags in the Zotero group library (wrong prefixes, wrong collection
keys, bogus `year:` prefix, misrouted location/event tags).

```bash
ZOTERO_API_KEY=*** ZOTERO_GROUP_ID=6623153 python3 scripts/zotero-fix-tags.py
```

---

## Planned scripts

| Script | Purpose |
|--------|---------|
| `trove-ingest.sh` | Fetch articles from the Trove API and scaffold journalism entries |
| `build-db.js` | Generate `sackar-atlas.db` from markdown data files at build time |
| `validate-data.js` | Lint data files against schema |
| `export-data.js` | Generate `cases.json`, `cases.csv` open data exports |

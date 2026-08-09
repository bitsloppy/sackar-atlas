# Workflow: Source Document Corpus

How we handle the primary source documents — converting, cleaning up, applying paragraph
IDs, documenting editorial decisions, and feeding into Zotero and the referencing pipeline.

---

## The corpus concept

The Sackar Atlas source corpus is a collection of human-verified primary source documents.
It is designed to be:

- **Rescrapeable** — clean MD files that any AI tool can read and use
- **Transparent** — every editorial decision documented inline
- **Permanently referenceable** — paragraph IDs that don't change once assigned
- **Self-describing** — each file's header says what it is and where it fits
- **One source of truth** — each piece of information lives in exactly one place;
  citation comments tell you where to find the rest

**Anna Roberts** reads every source document, cross-references with the PDF, and is the
sole content maintainer. AI tools assist with scripts, structure, and identifying
cross-references. Anna verifies everything before it is committed.

---

## Source document IDs (doc_id)

Each document has a short identifier used in paragraph IDs, source headers, and Zotero.
The full registry is in `sources/PARA-ID-REGISTRY.md`.

| doc_id   | Document                                          | sackar-atlas-id |
|----------|---------------------------------------------------|-----------------|
| SCOI-V1  | SCOI Volume 1                                     | `scoi-2023-volume-1` |
| SCOI-V2  | SCOI Volume 2                                     | `scoi-2023-volume-2` |
| SCOI-V3  | SCOI Volume 3                                     | `scoi-2023-volume-3` |
| SCOI-ANN | SCOI Annexures                                    | `scoi-2023-annexures` |
| PFR      | Strike Force Parrabell Final Report               | `nswpf-parrabell-final-report-2018` |
| R58      | Report No. 58 (NSW Parliament)                    | `nsw-parliament-report-58-2021` |
| IPTJ     | In Pursuit of Truth & Justice                     | `acon-phg-2018-in-pursuit-of-truth-and-justice` |

---

## Standard source header format

Every source file has a `<!-- sackar-atlas-source -->` comment block immediately after
the title heading. This is the machine-readable identity of the file.

### Whole document

```markdown
# Title of Document

<!-- sackar-atlas-source
doc_id: SCOI-V2
title: NSW Special Commission of Inquiry into LGBTIQ Hate Crimes — Volume 2
citation: Sackar J (2023), NSW Government
zotero_key: [key from Zotero Library]
para_id_format: native — [chapter].[para] e.g. 5.18
para_ids_note: Native SCOI paragraph numbering. Spans added by add-para-anchors.py.
scripts_applied: add-para-anchors.py
maintained_by: Anna Roberts / Sackar Atlas
corrections: [email or URL]
last_reviewed: YYYY-MM-DD
-->
```

### Chunk file (document split into sections)

Add these fields to the standard header:

```
chunk: true
chunk_section: "Chapter 5 — Mark Stewart"
para_range: 5.1–5.87
part_of: 20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-2.md
```

### Editorially-added IDs (documents without native numbering)

Replace the `para_ids_note` field with:

```
para_ids_note: Paragraph IDs are an editorial addition by Anna Roberts. They are not
  present in the original document. Sequential numbering within this document.
  Format: PFR.[N].
```

---

## Paragraph ID system

### The key principle

**Paragraph IDs belong to the source document, not the file.**

When a document is chunked, IDs do not restart or change. `SCOI-V2.5.551` refers to
that paragraph regardless of which file it lives in. The `para_range` in the chunk
header tells you which IDs are in that file.

### Documents with native numbering (SCOI volumes)

The SCOI volumes have native paragraph numbers (`5.551.`). The `add-para-anchors.py`
script detects and wraps these.

Span format in the file:
```
<span id="5.551"></span>5.551. The text of the paragraph...
```

Cross-document reference: `SCOI-V2.5.551`

```bash
# Dry-run first — always
python3 scripts/add-para-anchors.py sources/file.md --dry-run
python3 scripts/add-para-anchors.py sources/file.md
```

### Documents without native numbering (PFR, R58, IPTJ)

Use `add-para-anchors-generic.py`. Assigns sequential IDs across the whole document.

Span format in the file:
```
<span id="PFR.247"></span>The text of the paragraph...
```

Cross-document reference: `PFR.247`

```bash
# Dry-run first — always
python3 scripts/add-para-anchors-generic.py sources/file.md --doc-id PFR --dry-run
python3 scripts/add-para-anchors-generic.py sources/file.md --doc-id PFR
```

For a chunk starting mid-document (e.g. chapter 3 starts at para 180):
```bash
python3 scripts/add-para-anchors-generic.py sources/chunk.md --doc-id PFR --start-at 180 --dry-run
```

### Citing a paragraph

In prose: `(Sackar J, 2023, SCOI-V2.5.551)` or `(NSW Police Force, 2018, PFR.247)`

In Zotero: use the paragraph ID as the **locator** field when citing a specific passage.
This ties the Zotero citation directly to the span anchor in the MD file.

To find a paragraph:
```bash
grep -n 'id="PFR.247"' sources/201806-Strike-Force-Parrabell-Final-report.md
```

---

## Editorial decision comments

When preparing source documents, document non-trivial editorial decisions as HTML
comments inline in the file — immediately before or after the affected content.

Six types:

```markdown
<!-- ed-format: [description of formatting change] -->
<!-- ed-correct: [original] → [corrected] — [reason/source] -->
<!-- ed-omit: [what was omitted] — [reason] -->
<!-- ed-struct: [description of structural decision] -->
<!-- ed-note: [general editorial note] -->
<!-- ed-uncertain: [uncertain reading; flag for review] -->
```

### Examples

```markdown
<!-- ed-format: Converted embedded image to markdown table. Original: 3-column table of case outcomes on PDF p.87 -->

<!-- ed-correct: "tbe" → "the" — OCR error confirmed against PDF p.247 -->

<!-- ed-omit: NSW Parliament Library cataloguing block omitted — formatting artefact, not substantive content -->

<!-- ed-struct: Split chapter at this point. Content continues from PDF p.112. See part_of in header for parent file. -->

<!-- ed-note: Section heading appears mid-paragraph in PDF; rendered as ## heading here for navigability -->

<!-- ed-uncertain: Word illegible in PDF scan — best read as "Neiwand" but confirm against PDF p.183 -->
```

These comments are invisible to readers, grep-extractable, and form the basis of the
auto-generated register at `sources/EDITORIAL-DECISIONS.md`.

### Regenerating the register

```bash
python3 scripts/extract-editorial-decisions.py sources/ > sources/EDITORIAL-DECISIONS.md
```

Run after any source file is edited. Commit the updated register alongside the change.

---

## Step-by-step: adding a new source document

1. **Convert PDF**
   ```bash
   npx @pspdfkit/pdf-to-markdown sources/pdf/File.pdf > sources/YYYYMMDD-Title.md
   ```

2. **Manual cleanup** — fix the title heading, OCR garble, stray page numbers, broken
   line wraps. Add `<!-- ed-correct: ... -->` comments for significant corrections.

3. **Register** — add a row to `sources/PARA-ID-REGISTRY.md`. Assign a `doc_id`.

4. **Source header** — add `<!-- sackar-atlas-source -->` comment block (see above).

5. **Paragraph IDs** — dry-run first, review, then apply:
   - Native numbered: `python3 scripts/add-para-anchors.py sources/file.md --dry-run`
   - Unnumbered: `python3 scripts/add-para-anchors-generic.py sources/file.md --doc-id [ID] --dry-run`

6. **Editorial decisions** — add `<!-- ed-[type]: ... -->` comments for any non-trivial
   formatting, structural, or omission decisions.

7. **Zotero** — add/verify item; add `doc_id` to the Extra field alongside `sackar_atlas_id`.

8. **REFERENCES.md** — add author-date citation (Australian Government Style Manual).

9. **SOURCES.md** — add row to index table.

10. **Regenerate register**
    ```bash
    python3 scripts/extract-editorial-decisions.py sources/ > sources/EDITORIAL-DECISIONS.md
    ```

11. **Commit**
    ```bash
    git add sources/ REFERENCES.md
    git commit -m "sources: add [Document Name]"
    ```
    PDFs are gitignored — never commit them.

---

## Step-by-step: chunking a large document

1. Identify natural chunk boundaries (chapters, sections, per-case)
2. Create chunk files with naming pattern:
   - SCOI: `SCOI-V2-CAT-A-[case-slug].md`
   - Other: `[DOC_ID]-[section-slug].md`
3. Add chunk header including `chunk: true`, `chunk_section`, `para_range`, `part_of`
4. **Keep paragraph IDs unchanged** — do NOT renumber. IDs are permanent.
5. Update `sources/PARA-ID-REGISTRY.md`: add chunk files to the doc's file(s) column.
6. Commit chunks. The monolithic file may be retained or retired — Anna decides.

---

## Handling omitted content

When sections are deliberately omitted (reference lists, appendices, catalogue blocks),
replace with a comment:

```markdown
## References

<!-- ed-omit: Reference list omitted from this file — canonical references are in Zotero.
  For the full reference list, see the source document:
  Author A (Year) Title. Publisher. URL -->
```

**When to omit:**
- Reference lists / bibliographies: always — canonical reference is in Zotero
- Appendices with large tables or datasets: omit if not useful for grepping
- Appendices with narrative content (e.g. Parrabell Appendix A — ACON data): keep

**When NOT to use a reference-omitted comment:**
- Documents that use inline footnotes only (SCOI volumes). Footnotes stay inline.

---

## Scripts reference

| Script | Purpose |
|--------|---------|
| `scripts/add-para-anchors.py` | Add spans to SCOI-format native paragraph numbers |
| `scripts/add-para-anchors-generic.py` | Add sequential paragraph IDs to unnumbered documents |
| `scripts/extract-editorial-decisions.py` | Scan source files; generate EDITORIAL-DECISIONS.md |

---

## Current state of source documents

| Document | doc_id | In Zotero | In REFERENCES.md | Source header | Para IDs |
|----------|--------|:---------:|:----------------:|:-------------:|:--------:|
| SCOI Vol 1 | SCOI-V1 | ✅ | ✅ | ❌ | ✅ |
| SCOI Vol 2 | SCOI-V2 | ✅ | ✅ | ❌ | ✅ (chunking in progress) |
| SCOI Vol 3 | SCOI-V3 | ✅ | ✅ | ❌ | ✅ |
| SCOI Annexures | SCOI-ANN | ✅ | ✅ | ❌ | ✅ |
| Parrabell Final Report | PFR | ✅ | ✅ | ❌ | ❌ |
| In Pursuit of Truth & Justice | IPTJ | ✅ | ✅ | ✅ | ❌ |
| Report No. 58 | R58 | ✅ | ✅ | ✅ | ❌ |

**Source header ❌ on SCOI files:** low priority since SOURCES.md covers it; will be
added when files are chunked (each chunk gets its own header).

---

*Last updated: 2026-08-09*

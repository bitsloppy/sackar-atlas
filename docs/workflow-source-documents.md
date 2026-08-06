# Workflow: Large Source Documents

How we handle the big primary source documents — converting, cleaning up, referencing,
and deciding what gets full processing versus lightweight treatment.

---

## Two types of source documents

### 1. Working research files (SCOI volumes)

The four SCOI volumes and annexures are the core research corpus. We grep them, read them,
extract from them. They stay whole. They are not fully processed through the anchor+footnote
pipeline — they're too large, and the case-specific sections have already been extracted
into individual files (see **Source MD Files Progress** in the Lab).

**Treatment:**
- File sits in `sources/` committed to the repo
- PDF sits in `sources/pdf/` (gitignored)
- Cited in `REFERENCES.md`
- Zotero entry: per-volume (`scoi-2023-volume-1` etc.)
- No reference comment needed (footnotes are inline throughout; no separate bibliography)

### 2. Thematic/background documents (Parrabell, IPTJ, Report 58)

These are reference documents for context, methodology, and accountability framing.
We read whole sections, extract key arguments, document our research in lab notes.
We don't need the full anchor+footnote pipeline on these.

**Treatment:**
- File sits in `sources/` committed to the repo
- PDF sits in `sources/pdf/` (gitignored)
- Cited in `REFERENCES.md`
- Zotero entry with `sackar-atlas-id` in Extra field
- **Reference comment:** if the document has a formal bibliography at the end that we
  have omitted from the markdown, add a comment pointing back to the PDF (see below)
- Source header comment at the top of the file (see below)

---

## Step-by-step: processing a new large document

### Step 1 — Convert PDF to markdown

Use `@pspdfkit/pdf-to-markdown`. Fast, accurate for digital-born PDFs (0.004s/page).

```bash
npx @pspdfkit/pdf-to-markdown sources/pdf/MyDocument.pdf > sources/YYYYMMDD-MyDocument.md
```

### Step 2 — Pre-script cleanup

Manual pass to fix PDF conversion artifacts:
- Garbled title page text (common — fix the `#` heading to the correct title)
- Stray characters, mid-sentence line breaks, table formatting issues
- Page numbers appearing as standalone lines

### Step 3 — Add source header comment

At the top of the file (after the corrected title heading), add a source comment:

```markdown
# Full Title of the Document

<!-- 
    Source: Author A and Author B (Year)
    Full Title of the Document: Subtitle
    Publisher, Location. Published Day Month Year.
    sackar-atlas-id: slug-for-this-source
    PDF: sources/pdf/filename.pdf
    URL: https://...
-->
```

This ensures anyone reading the file knows exactly what it is, who published it,
and where the PDF lives — without having to check SOURCES.md.

### Step 4 — Handle omitted sections (if applicable)

If a document has sections we've deliberately omitted from the markdown (references,
appendices, data tables), replace the section with a comment:

```markdown
# References

<!-- 
    References omitted from this file.
    For the full reference list, see the source document:

    Author A and Author B (Year) Title of Document.
    Publisher. URL
-->
```

```markdown
# Appendix B

<!-- 
    Omitted from this file.
    Refer to the source document:

    Author A and Author B (Year) Title of Document.
    Publisher. URL
-->
```

**When to omit a section:**
- Reference list / bibliography: always omit — the canonical reference is in Zotero,
  not embedded in the markdown
- Appendices with large tables or datasets: omit if not useful for grepping
- Appendices with narrative content (e.g. Parrabell Appendix A — ACON data): keep

**When NOT to add a "references omitted" comment:**
- Documents that use only footnotes throughout (SCOI volumes, for example). The footnotes
  are embedded inline in the text and are the primary citation mechanism.

### Step 5 — Add to SOURCES.md

```markdown
| `YYYYMMDD-filename.md` | Description | [Publisher](URL) |
```

PDF filename goes in the notes below the table.

### Step 6 — Add to Zotero

Open Zotero → sackar-atlas group library. Add item (Report type for government reports).
Fill in author, title, publisher, year, URL.

In the **Extra** field, add at minimum:
```
sackar-atlas-id: slug-for-this-source
significance: primary
```

Then export the library as RIS and replace `sources/sackar-atlas-sources.ris`
(or append the new entry manually).

See `docs/zotero-sources.md` for the full Extra field reference.

### Step 7 — Add to REFERENCES.md

Add the full author-date citation to the appropriate section of `REFERENCES.md`.
Follow the Australian Government Style Manual author-date format:
<https://www.stylemanual.gov.au/referencing-and-attribution/author-date>

For government reports:
```
Author A (Year) *Title of report: subtitle*, Name of Agency, Name of Government.
Available: <URL>
```

### Step 8 — Commit

```bash
git add sources/YYYYMMDD-filename.md docs/ REFERENCES.md
git commit -m "sources: add [Document Name] markdown file"
```

PDFs are gitignored — never commit them.

---

## Reference comment format (canonical)

This is the agreed format, as used in the Parrabell report (June 2018):

```markdown
<!-- 
    References omitted from this file.
    For the full reference list, see the source document:

    Author A and Author B (Year). Title of Document.
    Publisher. URL
-->
```

For omitted appendices:

```markdown
<!-- 
    Omitted from this file.
    Refer to the source document:

    Author A and Author B (Year). Title of Document.
    Publisher. URL
-->
```

---

## Current state of big documents

| Document | sackar-atlas-id | In Zotero/RIS | In REFERENCES.md | Source header | Ref comment |
|---|---|:---:|:---:|:---:|:---:|
| SCOI Vol 1 | `scoi-2023-volume-1` | ✅ | ✅ | ❌ | n/a |
| SCOI Vol 2 | `scoi-2023-volume-2` | ✅ | ✅ | ❌ | n/a |
| SCOI Vol 3 | `scoi-2023-volume-3` | ✅ | ✅ | ❌ | n/a |
| SCOI Annexures | `scoi-2023-annexures` | ✅ | ✅ | ❌ | n/a |
| Parrabell Final Report | `nswpf-parrabell-final-report-2018` | ✅ | ✅ | ❌ | ✅ |
| In Pursuit of Truth & Justice | `acon-phg-2018-in-pursuit-of-truth-and-justice` | ✅ | ✅ | ✅ | n/a |
| Report No. 58 | `nsw-parliament-report-58-2021` | ✅ | ✅ | ✅ | n/a |

**"n/a" in Ref comment:** document uses inline footnotes, not a separate bibliography.
**"❌" in Source header for SCOI:** SCOI files start mid-document due to PDF extraction;
adding a source header is low-priority since SOURCES.md covers it.
**"❌" in Source header for Parrabell:** the title heading is correct; source header 
could be added but is not blocking anything.

---

*Last updated: 2026-08-06*

# Sackar Atlas — Paragraph ID Registry

The authoritative namespace for paragraph IDs across the entire source document corpus.

Every source document has a short `doc_id`. Paragraph IDs are formed by combining the
`doc_id` with a paragraph reference — for example `SCOI-V2.5.551` or `PFR.247`. These
IDs are **permanent**: once assigned they do not change.

When a document is chunked into multiple files, paragraph IDs stay the same across all
chunks. The `para_range` field in each chunk's `<!-- sackar-atlas-source -->` header
tells you which IDs are in that file.

See `docs/workflow-source-documents.md` for the full workflow.

---

## Registry

| doc_id | Title | ID format | Example | File(s) | Status |
|--------|-------|-----------|---------|---------|--------|
| SCOI-V1 | SCOI Vol 1 — Executive summary, context, methodology | native `[ch].[para]` | `3.12` | `20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-1.md` | IDs applied |
| SCOI-V2 | SCOI Vol 2 — Category A and B deaths | native `[ch].[para]` | `5.551` | `20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-2.md` + `SCOI-V2-CAT-A-*.md` + `SCOI-V2-CAT-B-*.md` | IDs applied; chunking in progress |
| SCOI-V3 | SCOI Vol 3 — Strike forces, institutional failures, recommendations | native `[ch].[para]` | `8.4` | `20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-3.md` | IDs applied |
| SCOI-ANN | SCOI Annexures | native `[ch].[para]` | `A.14` | `20231218-SCOI-LGBTIQ-Hate-Crimes-Annexures.md` | IDs applied |
| PFR | Strike Force Parrabell Final Report (June 2018) | sequential `PFR.[N]` | `PFR.247` | `201806-Strike-Force-Parrabell-Final-report.md` | IDs not yet applied |
| R58 | Report No. 58 — Gay and Transgender Hate Crimes Between 1970 and 2010 | sequential `R58.[N]` | `R58.156` | `20210-Report-58-Committee-on-Social-Issues-Gay-and-Transgender-hate-crimes-between-1970-and-2010.md` | IDs not yet applied |
| IPTJ | In Pursuit of Truth & Justice (ACON/PHG, 2018) | sequential `IPTJ.[N]` | `IPTJ.83` | `20180522-In-Pursuit-of-Truth-and-Justice-Report.md` | IDs not yet applied |

---

## How to cite a paragraph

In running prose, cite as a standard author-date reference with a paragraph locator:

- SCOI: `(Sackar J, 2023, SCOI-V2.5.551)`
- PFR: `(NSW Police Force, 2018, PFR.247)`
- R58: `(NSW Parliament, 2021, R58.156)`
- IPTJ: `(ACON/PHG, 2018, IPTJ.83)`

In data files and cross-reference notes, the bare ID is sufficient: `SCOI-V2.5.551`

**In Zotero:** use the paragraph ID as the locator field when citing a specific passage.
This directly links the Zotero citation to the span anchor in the MD file.

**To locate a paragraph in the MD file:**
```bash
grep -n 'id="PFR.247"' sources/201806-Strike-Force-Parrabell-Final-report.md
```

---

## How to add a new document

1. Assign a short `doc_id` — uppercase, no spaces, typically 2–6 characters
2. Decide the ID format:
   - **Native** — if the document has its own paragraph/section numbers (use those)
   - **Sequential** — if unnumbered (use `[DOC_ID].[N]` sequential within the document)
3. Add a row to this table
4. Apply paragraph IDs using the appropriate script (see `docs/workflow-source-documents.md`)
5. Update this table's Status column to "IDs applied"

---

*Last updated: 2026-08-09*

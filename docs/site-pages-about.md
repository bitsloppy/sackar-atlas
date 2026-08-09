# Site Page Briefs — About / AI Use / Corrections

Content and implementation briefs for the three new pages added 2026-08-09.
These are required for launch, not optional extras.

---

## 1. About the data — `/about/`

### Purpose

Explains what this project is and how to use it. Audience: researchers, journalists,
community members, historians. Written for people who might want to use or cite the data,
not just browse the site.

### Content outline

**What this is**
Sackar Atlas is a curated, human-verified corpus of primary source documents about LGBTIQ
hate crime deaths in NSW, built around the 2023 Special Commission of Inquiry (Sackar J).
It is an online reference book — designed to be used by people and AI tools alike.

**The sources**
The project draws on seven primary source documents: SCOI Volumes 1–3 and Annexures,
Strike Force Parrabell Final Report, Report No. 58 (NSW Parliament), and In Pursuit of
Truth & Justice (ACON/PHG 2018). All are publicly available. All are reproduced here as
clean Markdown files. PDFs are available via the links in `sources/SOURCES.md`.

**How the source documents are prepared**
- PDFs are converted to Markdown and manually reviewed against the original
- Paragraph IDs are added to enable precise cross-referencing (e.g. `SCOI-V2.5.551`)
- Editorial decisions (formatting, corrections, omissions) are documented inline
- Scripts are used only for cleanup and adding reference IDs — not for content
- The source files are the source of truth; the data YAML is derived from them

**How to use the data**
- Source documents: `sources/` directory in the GitHub repo
- Paragraph reference format: `(Sackar J, 2023, SCOI-V2.5.551)`
- Data schema: described in `docs/ai-instructions.md` and `llms.txt`
- Corrections: see `/corrections/`

**Citation**
Suggest citing as: Roberts A (2026) *Sackar Atlas*, available at [URL].

### Design notes

- Simple, readable prose page — no data cards, no complex layout
- One `<wa-callout>` at the top with the GitHub repo link
- A short table listing the seven source documents with download links (pull from `sources/SOURCES.md`)
- Footer link: "Something wrong? Submit a correction →"

---

## 2. AI use policy — `/about/ai/`

### Purpose

Transparent, specific statement about how AI tools were used in building this project.
Required for journalistic credibility. Written in plain language, not legalese.

### Content outline

**The short version**
AI tools (Claude, via OpenClaw) were used throughout this project. Anna Roberts oversaw
and verified everything. No AI-generated content appears on this site without human review.

**What AI did**
- Infrastructure: schema design, site build, scripts. Built collaboratively; not user-facing content.
- Research assistance: scanning source documents, extracting structured data, suggesting
  cross-references. AI proposes; Anna verifies from the primary source.
- Prose drafting: case narratives and analysis were drafted with AI assistance from the
  source documents, then reviewed and edited by Anna.

**What AI did not do**
- AI did not make editorial judgments that appear unchecked on the site.
- AI did not generate facts. Every factual claim is sourced to a primary document.
- AI did not access sources other than the documents provided.

**How we distinguish AI contribution from primary source**
The data schema uses an uncertainty ladder: "SCOI confirms" → "probable" → "possible" →
"AI inference." Fields labelled "AI inference" are explicitly flagged as unverified
interpretive suggestions, not findings. The source documents themselves are human-maintained.

**Corrections**
If you find an error that may be the result of AI misreading or misrepresenting a source,
please submit a correction at `/corrections/`.

### Design notes

- Prose page, similar layout to `/about/`
- No need for a table — just clear section headings
- Keep it under 400 words — brevity signals confidence

---

## 3. Corrections — `/corrections/`

### Purpose

Two functions: (1) show submitted corrections to maintain public trust; (2) give readers
a clear mechanism to submit their own. This is a standard journalism practice.

### Content outline

**How to submit a correction**
Email [corrections email — Anna to provide] with:
- The URL of the page with the error
- What it currently says
- What it should say
- Your source (document, page/paragraph number if available)

All submissions are reviewed by Anna Roberts. Corrections are applied to the data files
and noted here with a date.

**What counts as a correction**
- Factual errors (wrong name, wrong date, wrong location)
- Misquotation of a source document
- Misidentification of a person

**What doesn't**
- Disagreement with SCOI findings or coronial conclusions — those are the primary source
- Requests to remove information — see the privacy policy [link if exists]

**Corrections register**
_(Initially empty. When corrections are made, they appear here.)_

Format when populated:
```
[Date] [Page URL] — [Brief description of correction] — Source: [citation]
```

### Implementation notes

- The corrections register is a simple static list, hand-maintained by Anna
- No database, no form — email submission is correct for this project's scale
- The register can be a Markdown file (`data/corrections.md`) rendered at build time,
  or hardcoded in the page — Anna's call
- Start with an empty register with a clear "No corrections on record" state
- Add a link to this page from the footer on every page

---

## Implementation order

Build in this order:
1. `/corrections/` — simplest; no data dependency; needed for other pages to link to
2. `/about/ai/` — mostly prose; no data dependency
3. `/about/` — needs the sources table; slightly more complex

All three should be in the footer. Suggested footer links:
```
About the data | AI use | Corrections | GitHub ↗
```

---

*Brief written: 2026-08-09*

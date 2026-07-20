# Sackar Atlas

A navigable public record of the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar Inquiry, December 2023) — connecting cases, places, people, and institutions from the public record.

---

## What this is

A public data project making a dense government inquiry accessible to anyone. The SCOI report is a PDF — a formal, correct, important document that makes all its connections invisible. This project takes the public record and makes those connections legible: real people, real places, an interconnected institutional system, all drawn from primary sources.

**Scope:** Individual cases examined by the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar Inquiry, December 2023), plus the broader historical context: activism, legal milestones, cultural events, and significant places, from the 1960s to the present.

**Framing:** Public interest data journalism. Built on primary sources — the SCOI report, Hansard, coronial records, police annual reports, Trove press archives — synthesised and made navigable. Oral history and community memory are beyond this project's scope; the infrastructure is built to support that work by others.

---

## Repository structure

| Folder | Contents | Licence |
|--------|----------|---------|
| `site/` | Astro static site (public-facing website) | MIT |
| `data/sydney/` | Structured historical data — cases, locations, events, people | CC-BY 4.0 |
| `journalism/` | Original writing and archival journalism | © Anna Roberts |
| `scripts/` | Data ingestion tools, Trove helper, build utilities | MIT |

→ Full licence details: [LICENSING.md](LICENSING.md)

---

## Open data

All structured data is published as open data under CC-BY 4.0. On every build, the site publishes:
- `cases.json` / `cases.csv` — individual case records
- `queer-sydney.db` — full relational SQLite database

---

## Citing this project

### The dataset (AGSM author–date)

> Roberts A (2026) *Sackar Atlas: A Public Record of the NSW LGBTIQ Hate Crimes Inquiry* [data set], GitHub, https://github.com/bitsloppy/sackar-atlas, accessed [Day Month Year].

A `CITATION.cff` file is included — GitHub renders this as a **Cite this repository** button in the sidebar.

### An individual record

> Roberts A (2026) '[Record title]', *Sackar Atlas* [data set record], https://github.com/bitsloppy/sackar-atlas/blob/main/data/sydney/[collection]/[slug].md, accessed [Day Month Year].

Example:
> Roberts A (2026) 'Mark Stewart', *Sackar Atlas* [data set record], https://github.com/bitsloppy/sackar-atlas/blob/main/data/sydney/cases/mark-stewart.md, accessed 17 July 2026.

Once the site is live on a domain, use the site URL instead of the GitHub file path. Each record page will include a pre-formatted citation string.

### Licence requirement

All data under `data/sydney/` is published under **CC-BY 4.0**. Attribution is a licence condition — please cite as above. Original journalism under `journalism/` is © Anna Roberts, all rights reserved.

→ Full licence details: [LICENSING.md](LICENSING.md)  
→ Methodology and project bibliography: [REFERENCES.md](REFERENCES.md)

---

## Accessibility

This site targets **WCAG 2.1 Level AA** compliance. The subject matter documents the lives of people failed by institutions — the site should not itself be exclusionary.

**Current status (2026-07-19):** AA compliant on all published pages.

**Standing commitments:**
- Text contrast ≥ 4.5:1 on all backgrounds (3:1 for large text / UI components)
- All interactive elements keyboard-navigable with visible focus indicator
- Semantic HTML landmarks on every page (`<header>`, `<main>`, `<nav>`, `<footer>`)
- Skip-to-content link on every page
- Decorative SVGs / icons marked `aria-hidden="true"`; meaningful images have `alt` text
- Colour is never the sole differentiator — icons, labels, or patterns accompany colour coding
- Map is an enhancement, not the only path to information — every pin links to a full text page

**For contributors:** run a contrast check before merging any new colour. The WCAG AA threshold is 4.5:1 for body text.

---

## Status

🟢 Active development — 3 cases published, full interactivity layer live, WCAG AA compliant.

---

## Acknowledgements

This project draws on the work of the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar Inquiry, 2023). It is an independent journalistic and open research project.

Data and project by [Anna Roberts](https://github.com/bitsloppy).

# Queer Heritage

A historical record of queer Sydney — documenting LGBTIQ hate crime deaths, activism, legal milestones, cultural moments, and places across six decades.

Built in response to Justice Sackar's 2023 findings and call for a lasting public heritage record.

---

## What this is

This is not just a crime database. The violence sits alongside activism, law reform, and culture. This project maps what it can as open data anyone can use.

**Scope:** Individual cases examined by the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar Inquiry, December 2023), plus the broader historical context: activism, legal milestones, cultural events, and significant places, from the 1960s to the present.

**Framing:** Journalistic and open-research. Built to connect with oral history projects and archival institutions from the start.

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

> Roberts A (2026) *Queer Heritage: Historical LGBTIQ Hate Crimes in Sydney* [data set], GitHub, https://github.com/bitsloppy/queer-heritage, accessed [Day Month Year].

A `CITATION.cff` file is included — GitHub renders this as a **Cite this repository** button in the sidebar (look for it under "About").

### An individual record

> Roberts A (2026) '[Record title]', *Queer Heritage* [data set record], https://github.com/bitsloppy/queer-heritage/blob/main/data/sydney/[collection]/[slug].md, accessed [Day Month Year].

Example:
> Roberts A (2026) 'Mark Stewart', *Queer Heritage* [data set record], https://github.com/bitsloppy/queer-heritage/blob/main/data/sydney/cases/mark-stewart.md, accessed 17 July 2026.

Once the site is live, use the site URL instead of the GitHub file path. Each record page will include a pre-formatted citation string.

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

**For contributors:** run a contrast check before merging any new colour. The WCAG AA threshold is 4.5:1 for body text — use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or the browser DevTools accessibility panel.

---

## Status

🟢 Active development — 3 cases published, full interactivity layer live, WCAG AA compliant.

---

## Acknowledgements

This project draws on the work of the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar Inquiry, 2023). It is an independent journalistic and open research project.

Data and project by [Anna Roberts](https://github.com/bitsloppy).

# Sackar Atlas

Making the findings of the 2023 NSW Special Commission of Inquiry into LGBTIQ Hate Crimes navigable to a general audience — cases, locations, people, and events, cross-referenced from the public record.

**Live site:** https://sackar-atlas.bitsloppy.com

---

## Why this exists

Between 1976 and 2000, at least 30 people were killed in New South Wales in circumstances the Inquiry found were consistent with anti-LGBTIQ bias. The Inquiry — led by Justice John Sackar AO KC — is the definitive public examination of those deaths: what happened, who was responsible, and what the NSW Police failed to do.

Its findings fill three volumes and over 3,000 pages of PDF.

What a PDF cannot show is that two deaths happened at the same clifftop thirteen months apart. Or that the same Strike Force investigated — and failed to prosecute — cases across three suburbs over a decade. Or that the same investigative failures appear, case after case, across thirty years.

A relational dataset can. That's what this project is.

**Framing:** Public interest research, not community heritage. Built on primary sources — the SCOI report, Hansard, coronial records, police annual reports, Trove press archives — synthesised and made navigable. Oral history and community memory are beyond this project's scope; the infrastructure is built to support that work by others.

---

## Repository structure

| Folder | Contents | Licence |
|--------|----------|---------|
| `site/` | Astro static site (public-facing website) | MIT |
| `data/` | Structured historical data — cases, locations, events, people | CC-BY 4.0 |
| `journalism/` | Original writing and archival journalism | © Anna Roberts |
| `scripts/` | Data ingestion tools, Trove helper, build utilities | MIT |

→ Full licence details: [LICENSING.md](LICENSING.md)

---

## Open data

All structured data is published as open data under CC-BY 4.0. On every build, the site publishes:
- `cases.json` / `cases.csv` — individual case records
- `sackar-atlas.db` — full relational SQLite database

---

## Citing this project

### The dataset (AGSM author–date)

> Roberts A (2026) *Sackar Atlas: A Public Record of the NSW LGBTIQ Hate Crimes Inquiry* [data set], GitHub, https://github.com/bitsloppy/sackar-atlas, accessed [Day Month Year].

A `CITATION.cff` file is included — GitHub renders this as a **Cite this repository** button in the sidebar.

### An individual record

> Roberts A (2026) '[Record title]', *Sackar Atlas*, https://sackar-atlas.bitsloppy.com/cases/[slug]/, accessed [Day Month Year].

Example:
> Roberts A (2026) 'Mark Stewart', *Sackar Atlas*, https://sackar-atlas.bitsloppy.com/cases/mark-stewart/, accessed 19 August 2026.

### Licence requirement

All data under `data/` is published under **CC-BY 4.0**. Attribution is a licence condition — please cite as above. Original journalism under `journalism/` is © Anna Roberts, all rights reserved.

→ Full licence details: [LICENSING.md](LICENSING.md)  
→ Methodology and project bibliography: [REFERENCES.md](REFERENCES.md)

---

## Accessibility

This site targets **WCAG 2.1 Level AA** compliance. The subject matter documents the lives of people failed by institutions — the site should not itself be exclusionary.

**Current status (2026-08-19):** AA compliant on all published pages.

**Standing commitments:**
- Text contrast ≥ 4.5:1 on all backgrounds (3:1 for large text / UI components)
- All interactive elements keyboard-navigable with visible focus indicator
- Semantic HTML landmarks on every page (`<header>`, `<main>`, `<nav>`, `<footer>`)
- Skip-to-content link on every page
- Decorative SVGs / icons marked `aria-hidden="true"`; meaningful images have `alt` text
- Colour is never the sole differentiator — icons, labels, or patterns accompany colour coding

**For contributors:** run a contrast check before merging any new colour. The WCAG AA threshold is 4.5:1 for body text.

---

## Status

🟢 Active development — 11 cases published, live at https://sackar-atlas.bitsloppy.com.

---

## Acknowledgements

This project draws on the work of the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar Inquiry, 2023). It is an independent research and public interest project.

Data and project by [Anna Roberts](https://github.com/bitsloppy).

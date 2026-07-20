# Data — Sydney

Structured historical data for queer heritage in Sydney.

**Licence:** CC-BY 4.0 — see [../../LICENSE-data](../../LICENSE-data)

---

## Folders

| Folder | Contents |
|--------|----------|
| `cases/` | Individual hate crime cases examined by the Sackar Inquiry |
| `locations/` | Significant places — crime scenes, venues, meeting points, memorials |
| `events/` | Historical events — activism, legal milestones, cultural moments |
| `people/` | Individuals — victims, activists, witnesses, perpetrators (where named) |
| `recommendations/` | The 19 formal Sackar Inquiry recommendations + the heritage call |

---

## Format

Each record is a markdown file with YAML frontmatter (source of truth for the data layer).
A SQLite database (`sackar-atlas.db`) is generated from these files at build time.

Data schema: see `../../site/src/schema/` (once built).

---

## Attribution and citation

**Licence:** CC-BY 4.0. Attribution is a licence condition.

### Citing the full dataset

> Roberts A (2026) *Queer Heritage: Historical LGBTIQ Hate Crimes in Sydney* [data set], GitHub, https://github.com/bitsloppy/queer-heritage, accessed [Day Month Year].

### Citing an individual record

Each record file is independently citable. Use the GitHub file URL until the site is live, then use the site URL.

**Format:**
> Roberts A (2026) '[Record title]', *Queer Heritage* [data set record], https://github.com/bitsloppy/queer-heritage/blob/main/data/sydney/[collection]/[slug].md, accessed [Day Month Year].

**Example — a case record:**
> Roberts A (2026) 'Mark Stewart', *Queer Heritage* [data set record], https://github.com/bitsloppy/queer-heritage/blob/main/data/sydney/cases/mark-stewart.md, accessed 17 July 2026.

**Example — a location record:**
> Roberts A (2026) 'Fairy Bower Headland', *Queer Heritage* [data set record], https://github.com/bitsloppy/queer-heritage/blob/main/data/sydney/locations/fairy-bower-headland.md, accessed 17 July 2026.

Once the site is live, the site will generate a ready-to-copy citation string on every record page.

→ Full citation guidance and methodology bibliography: [REFERENCES.md](../../REFERENCES.md)

### Machine-readable citation

A `CITATION.cff` file in the repository root provides machine-readable citation metadata. GitHub renders this as a **Cite this repository** button in the sidebar.

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
A SQLite database (`queer-sydney.db`) is generated from these files at build time.

Data schema: see `../../site/src/schema/` (once built).

---

## Attribution

If you use this data, please credit:

> Queer Heritage / Anna Roberts — https://github.com/bitsloppy/queer-heritage — CC-BY 4.0

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

## Status

🔧 Early development — data model and first cases in progress.

---

## Acknowledgements

This project draws on the work of the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar Inquiry, 2023). It is an independent journalistic and open research project.

Data and project by [Anna Roberts](https://github.com/bitsloppy).

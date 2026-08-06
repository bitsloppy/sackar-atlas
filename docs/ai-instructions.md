# Sackar Atlas — AI Instructions

How to work with this dataset. Modular — delete any section you don't need.

> **Status: bare bones (pre-launch).** This document covers schema and cross-referencing.
> Sections on editorial standards, use cases, and responsible AI use will be built out
> before public launch. Do not treat placeholder headings as guidance.

---

## What this is

The Sackar Atlas is a structured open dataset documenting historical anti-LGBTIQ hate crimes
in Sydney, derived primarily from the 2023 NSW Special Commission of Inquiry into LGBTIQ
Hate Crimes (the SCOI, Commissioner: Justice John Sackar AO KC).

- **Repo:** https://github.com/bitsloppy/sackar-atlas
- **Live site:** https://sackar-atlas.soft-hill-5225.workers.dev
- **Licence:** CC-BY 4.0 (data), see `LICENSE-data`
- **Citation:** Roberts A (2026) *Queer Heritage: Historical LGBTIQ Hate Crimes in Sydney*
  [data set], GitHub, https://github.com/bitsloppy/sackar-atlas

The primary source for every case is the SCOI report. Secondary sources are managed in
a Zotero group library; the RIS export lives at `data/sources/zotero-export/sackar-atlas-sources.ris`.

---

## Data schema

All data lives under `data/`. Each record is a markdown file: YAML frontmatter (structured
data) + narrative prose below the `---` separator.

```
data/
  cases/            One file per victim
  locations/        Physical places — beats, crime scenes, memorials, PAC stations
  events/           Strike forces, inquiries, raids, memorials, legal milestones
  people/           Victims, perpetrators, witnesses, commissioners, politicians
  recommendations/  The 19 SCOI formal recommendations + the heritage call
  source-collections/ Per-institution licence/access notes
  sources/          Source metadata (migrating to Zotero; see zotero-export/)
  testimonies/      Witness and survivor testimony records
```

### File naming

All slugs are lowercase, hyphenated, no subdirectory nesting:
- `data/cases/mark-stewart.md`
- `data/locations/marks-park.md`
- `data/events/strike-force-parrabell.md`
- `data/people/stanley-early.md`

The slug is the stable identifier used for all cross-references.

### Cases

The spine of the dataset. Key frontmatter fields:

```yaml
name:                   # Full name of victim
date_of_death:          # ISO 8601 — YYYY-MM-DD
date_of_death_uncertain: # true/false
scoi_category:          # "A" (confirmed hate crime) | "B" (probable) | null
location_id:            # slug → data/locations/
related_people:         # list of slugs → data/people/
related_events:         # list of slugs → data/events/
related_sources:        # list of sackar-atlas-id values → Zotero
published:              # true | false — only true after QA sign-off
```

### Locations

```yaml
name:
location_type:          # park | cliff | venue | street | institution | etc.
location_roles:         # list: beat | crime-scene | memorial | pac-station | etc.
first_nations_country:  # Required. Custodianship is primary geographic identity.
suburb:
lat:
lng:
related_cases:          # list of slugs
```

### Events

```yaml
title:
event_type:             # inquiry | strike-force | inquest | memorial | legislation | etc.
date:                   # ISO 8601 or year only
related_cases:          # list of slugs
related_people:         # list of slugs
related_locations:      # list of slugs
```

### People

```yaml
name:
role:                   # victim | perpetrator | witness | commissioner | detective | politician | etc.
sexuality:
  identity:             # stated identity or null
  confidence:           # confirmed | probable | possible | unknown
  source:               # what the confidence is based on
```

### Sources (Zotero)

Sources are managed in Zotero. The stable identifier is `sackar-atlas-id` — a slug in the
Extra field of each Zotero record, and in the `N1` field of the RIS export.

```
sackar-atlas-id: mark-stewart-scoi-2023
significance:    primary | primary-source-quality | secondary | tertiary
related_cases:   comma-separated slugs
```

Primary source documents and their Zotero IDs:

| Document | sackar-atlas-id |
|---|---|
| SCOI Vol 1 (2023) | `scoi-2023-volume-1` |
| SCOI Vol 2 (2023) | `scoi-2023-volume-2` |
| SCOI Vol 3 (2023) | `scoi-2023-volume-3` |
| SCOI Annexures (2023) | `scoi-2023-annexures` |
| Strike Force Parrabell Final Report (2018) | `nswpf-parrabell-final-report-2018` |
| In Pursuit of Truth & Justice (2018) | `acon-phg-2018-in-pursuit-of-truth-and-justice` |
| Report No. 58 (2021) | `nsw-parliament-report-58-2021` |

---

## Cross-referencing

Everything links by slug. Follow the chain from any record to find related records.

### From a case

```
case/mark-stewart
  → location_id: shelley-headland          → data/locations/shelley-headland.md
  → related_people: [alan-rosendale, ...]  → data/people/alan-rosendale.md
  → related_events: [strike-force-parrabell] → data/events/strike-force-parrabell.md
  → related_sources: [scoi-2023-volume-2]  → Zotero / RIS
```

### From a location

```
location/marks-park
  → related_cases: [gilles-mattaini, ross-warren, john-russell]
```

### From an event

```
event/strike-force-parrabell
  → related_cases: [mark-stewart, paul-rath, raymond-keam, ...]
  → related_people: [linda-iles, ...]
```

### Finding connections

To find shared patterns across cases, query across collections:

- **Shared location:** find all cases where `location_id` = same slug
- **Shared officer/detective:** find all cases where `related_people` includes same person slug
- **Shared event:** find all cases where `related_events` includes same event slug (e.g. all Parrabell cases)
- **Shared time period:** filter by `date_of_death` range
- **Shared SCOI category:** filter by `scoi_category`

---

## Source hierarchy and uncertainty

When working with this data, always track where a claim comes from and express uncertainty precisely.

| Level | Label | Meaning |
|---|---|---|
| 1 | `SCOI confirms` | The SCOI report makes an explicit finding |
| 2 | `coronial finds` | A coronial inquest finding |
| 3 | `probable` | Strong evidence, no explicit official finding |
| 4 | `possible` | Some evidence, not established |
| 5 | `AI inference` | Reasoned from data — must be labelled as such |

Never collapse these categories. An AI inference is not a finding.

---

## Referencing

All citations use the Australian Government Style Manual (AGSM) author-date system.
Reference: https://www.stylemanual.gov.au/referencing-and-attribution/author-date

In-text format: `(Sackar 2023, vol. 2)` or `SCOI (2023)` using the short form.

Full citation format for the SCOI:
```
NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (2023)
Report of the Special Commission of Inquiry into LGBTIQ Hate Crimes,
3 vols + annexures, NSW Government, Sydney.
```

See `REFERENCES.md` for full citations of all primary sources.
See `docs/workflow-source-documents.md` for how source documents are processed and cited.

---

## Pre-launch sections (not yet written)

The following sections will be added before public launch:

- **Editorial standards** — victims are people, accuracy as care, living persons policy,
  LGBTQIA+ terminology, First Nations Country custodianship
- **Use cases** — case research, cross-referencing, journalism, data analysis, building
  a new project on top of this data
- **What not to do** — fabricate sources, collapse uncertainty levels, out living persons,
  treat AI inference as confirmed fact
- **Responsible AI use** — how to apply these instructions to your own tool or workflow

---

*This document is a living reference. Updated as the schema evolves.*
*Last updated: 2026-08-06*

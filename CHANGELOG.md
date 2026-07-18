# Changelog

Human-readable record of what data exists in this project, when it was added,
and what changed. Newest entries at the top.

For technical change history, see `git log`. This file focuses on **data content**
— what cases, sources, and records are available and when they arrived.

---

## How to read this

**Cases** are the core of the project — each is a documented death or assault
examined by the SCOI or related inquiries.

**Stubs** are placeholder records created to support cross-referencing — they
have a slug and basic data but are marked for further research.

**Schema changes** that affect how existing records should be read are noted.
Routine additions of optional fields are not.

---

## 2026-07-18

### Cases added

**David Lloyd-Williams** (SCOI Category A)
- Born 20 June 1946, Barnhurst, England. Died 24 August 1978, age 32.
- Location: North Head, Manly (south-eastern point, Scenic Drive area — not the beat area).
- Sackar finding: *"On the evidence available to the Inquiry, there is objectively no reason to
  suspect that LGBTIQ bias was a factor in the death of Mr Lloyd-Williams."* Confirmed suicide.
- Sexuality: unknown. No evidence of LGBTIQ membership.
- No recommendations. `inquiry_finding: excluded` (new schema value).
- Source: SCOI Vol 2, Ch 5, paras 5.462–5.549, pp 283–297.
- **Note:** Case reached the Inquiry via Sue Thompson's spreadsheet after a hearsay account
  (naked body, folded clothes) was confused with the Scott Johnson case. Parrabell searched
  under 'David Williams', found nothing, and left it 'unsolved and not reviewed'. Sackar
  found Parrabell's treatment 'not adequate or satisfactory'.

---

### Cases added (earlier this session)

**Mark Stewart** (SCOI Category A)
- Born 18 July 1957, Port Moresby PNG. Died 10 or 11 May 1976, age 18.
- Location: Shelley Headland (Fairy Bower), Manly.
- Sackar finding: *"There is objectively reason to suspect that LGBTIQ bias
  was a factor in his death."* Cause of fall cannot be determined.
- Sexuality: unknown (Inquiry could not determine).
- No recommendations arising from this case.
- Source: SCOI Vol 2, Ch 5, paras 5.96–5.281, pp 219–252.

**Paul Rath** (SCOI Category A)
- Born 18 January 1950, Sydney. Died 15 or 16 June 1977, age 27.
- Location: Shelley Headland (Fairy Bower), Manly — same site as Mark Stewart.
- Sackar finding: *"There is objectively reason to suspect both that the death
  of Mr Rath was a homicide and that LGBTIQ bias was a factor."*
- Sexuality: probable (told his brother Gregory he was gay, c.1976).
- **Recommendation 1**: Commissioner of NSWPF to apply for a fresh inquest.
- Source: SCOI Vol 2, Ch 5, paras 5.282–5.461, pp 253–282.

### Locations added (full records)

- **Shelley Headland** (`shelley-headland`) — Manly; beat + crime scene;
  Gayamaygal Country; physical marker proposed (Sackar Ch. 16).
  Related cases: mark-stewart, paul-rath.

### Locations added (stubs)

- `chevron-hotel` — Potts Point; Quarter Deck Bar; known gay venue 1960–1985;
  possible connection to Mark Stewart case (contested).
- `city-morgue-glebe` — institutional; post-mortems for mark-stewart, paul-rath
  and will appear in all subsequent cases.
- `hilton-hotel-sydney` — George St CBD; Mark Stewart's last confirmed location.
- `manly-district-hospital` — Paul Rath pronounced dead here.
- `marks-park` — Tamarama/Bondi headland; beat + crime scene; Bidjigal Country;
  2003 Waverley Council memorial plaque. Related to 4 cases not yet entered.
- `moore-park` — Alan Rosendale attack site (1989, survived).
- `north-head` — Manly; beat; Scott Johnson death site. Related case not yet entered.
- `oxford-street` — Darlinghurst; community hub + nightlife; heritage listing
  assessment underway (2025).

### Police Area Command location records

Seven PAC records covering the project's geographic scope:
`eastern-beaches-pac`, `eastern-suburbs-pac`, `inner-west-pac`,
`kings-cross-pac`, `northern-beaches-pac`, `surry-hills-pac`, `sydney-city-pac`.

### People added (victims)

- **Mark Stewart** (`mark-stewart`) — born 1957-07-18; victim record.
- **Paul Rath** (`paul-rath`) — born 1950-01-18; victim record.

### People added (stubs — investigators and legal)

OIC and coronial records created; will recur across multiple cases:
- `keith-thoms` — OIC, Mark Stewart investigation (1976)
- `john-goldrick` — City Coroner; Mark Stewart inquest (1976)
- `ross-parry` — OIC, Paul Rath investigation (1977)
- `ray-henry` — Coroner; Paul Rath inquest (1977)
- `helen-colman` — Paul Rath's sister; last person to see him alive;
  gave crucial 2023 testimony to the Inquiry (46 years after his death).

### People added (stubs — witnesses and community figures)

- `alan-rosendale` — survivor; Moore Park 1989; primary-source-quality ABC article.
- `sam-cooling` — State Library NSW Queerbrarian; oral history holdings contact.

### People added (institutional figures)

14 NSW Police Commissioners (`colin-delaney` through `mal-lanyon`);
6 political figures across law reform:
`clover-moore`, `david-elliott`, `fred-nile`, `greg-smith`,
`neville-wran`, `nick-greiner`.

### Testimonies added

Three named testimonies extracted from Report 58 (NSW Parliamentary Committee, 2021):
- `stewart-south` — survivor; 3 attacks across 20 years; PTSD, career destroyed.
- `witness-a` — gay doctor bashed; anonymous; police and hospital gaslighting.
- `knight-family` — parents of missing person Simon Knight (2005).

### Sources added (25 individual source records)

16 ABC News online articles (SCOI coverage 2022–23; individual cases; Oxford Street heritage);
2 ABC Radio segments (Wotherspoon, Sam Cooling);
5 Bondi Badlands podcast episodes (Callaghan G, 2021);
1 Deep Water documentary (2016);
1 The Conversation SCOI overview article (2023).

All 18 ABC sources linked to `source-collections/abc.md` via `series_id: abc`.

### Source collections added (7 records)

Archives and series tracked with conditions of use and citation formats:
`abc`, `aqua`, `bondi-badlands`, `deep-water-documentary`,
`pride-history-group`, `star-observer`, `state-library-nsw`.

### Schema changes of note

- `stub` field added to cases, locations, people, events (boolean; drives
  'research needed' indicator on site; enables backlog filtering).
- `born_date` + `born_place` added to cases schema.
- `born_date`, `died_date`, `died_date_uncertain` added to people schema
  (ISO 8601 precision; alongside existing `birth_year`/`death_year`).
- `source_collections` collection added — tracks archives/repositories with
  conditions of use, permission status, and citation format overrides.
- `testimonies` collection added — survivor accounts and family witness statements.
- `MediaSource` sub-schema added (podcasts, documentaries, radio segments).
- `ReportSource` sub-schema added (community, government, parliamentary reports).
- `historical_commands[]` added to locations (maps predecessor PAC names to
  current jurisdiction records for investigation cross-referencing).

---

## 2026-07-17

### Foundation

- GitHub repo created: https://github.com/bitsloppy/queer-heritage
- Folder structure scaffolded: `site/`, `data/sydney/{cases,locations,events,
  people,recommendations,source-collections,sources,testimonies}/`
- Licence framework: MIT (code), CC-BY 4.0 (data), © All Rights Reserved (journalism).
- `CITATION.cff` added — enables "Cite this repository" button on GitHub.
- `REFERENCES.md` — project methodology bibliography (AGSM author-date format).
- `LICENSING.md` — maps every folder to its applicable licence.
- Initial schema drafted in `site/src/content/config.ts` (Zod/Astro).

---

## How to cite this dataset

```
Roberts A (2026) Queer Heritage — Historical LGBTIQ Hate Crime Documentation
[dataset], GitHub, accessed [Day Month Year],
<https://github.com/bitsloppy/queer-heritage>.
```

See `CITATION.cff` for machine-readable citation metadata.

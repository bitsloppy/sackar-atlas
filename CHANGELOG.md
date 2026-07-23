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

## 2026-07-23

### Data — Ross Warren (1989) and Scott Johnson (1988)

Two new cases entered, completing the Marks Park cluster (Warren) and the North Head cluster (Johnson).

**Ross Warren** — SCOI Category A, 1989. Television presenter at WIN4 Wollongong. Disappeared from near Marks Park, Tamarama, in the early hours of 22 July 1989. His car and keys were found at the park. His body has never been found. Deputy State Coroner Milledge (2005) found he was a victim of homicide; Sackar J confirmed this and found objectively reason to suspect LGBTIQ bias. OIC DS Kenneth Bowditch found to have made false claims about investigative steps — active misconduct. No accountability.

**Scott Johnson** — examined in Vol. 3, Ch. 11 (Strike Force Macnamir). American mathematics PhD student. Found naked at foot of cliff, Blue Fish Point, North Head, 10 December 1988. Three inquests over 29 years: suicide (1989), open (2012), homicide (Barnes, 2017). Sackar J examined institutional resistance by Strike Force Macnamir to a homicide finding. Scott White convicted of manslaughter, 2023 (*R v White* [2023] NSWSC 611).

**New records:**
- `data/cases/ross-warren.md` (published)
- `data/people/ross-warren.md`
- `data/cases/scott-johnson.md` (published)
- `data/people/scott-johnson.md`
- `data/people/kenneth-bowditch.md` (stub — OIC Paddington, active misconduct)
- `data/people/scott-white.md` (stub — convicted of manslaughter)
- `data/people/doreen-cruickshank.md` (stub — OIC Manly 1989)
- `data/people/stephen-page.md` (stub — led Operation Taradale)

**Updated:**
- `data/events/strike-force-neiwand.md` — corrected dates (October 2015 – January 2018), added related_cases (warren, russell, mattaini)
- `resources/trove-todo.md` — added Daily Telegraph 1989-07-26 (Warren press source)

---

## 2026-07-19

### Site — major interactivity + linking layer

This session built the relational layer of the site — making the connections between
cases, locations, people, and events visible and navigable rather than implied.

**Cross-linking architecture:**
- All `related_*` arrays now render as clickable links throughout the site
- Cases → Locations: `location_name` links to location page via `location_id`;
  `location_suburb` links to suburb filter
- Cases → Events: `police_investigations[].event_id` renders investigation name as link
- Cases → PAC: `police_investigations[].command_id` links to PAC jurisdiction page
- Cases: `last_seen_location` now rendered in header (was invisible)
- Schema additions: `related_cases[]` on cases; `event_id` on `police_investigations[]`;
  `related_locations[]` + `related_people[]` on locations, events, people collections

**New content:**
- Events: Strike Force Parrabell (full narrative — three cases, three critical errors);
  Strike Force Neiwand; Rise Memorial at Marks Park (2021); 1978 Mardi Gras baton charges;
  Oxford Street Pride Month raids (June 2026); Oxford Street heritage listing proposal (2025)
- Neighbourhood location records: Potts Point, Manly Headland Beat Precinct, Darlinghurst
- All existing data files: `related_*` arrays populated with correct cross-references

**New pages:**
- `/locations/` — browse all locations, grouped by category
- `/locations/[slug]/` — individual location detail pages
- `/locations/region/[region]/` — region map pages with NSW suburb boundaries + location pins
- `/events/` — browse all events chronologically
- `/events/[slug]/` — individual event detail pages
- `/people/` — browse all people, grouped by role
- `/people/[slug]/` — individual person detail pages
- Case pages updated: related content chips, investigation name links

**Map (major rebuild):**
- Multi-layer Leaflet map: cases, beats, nightlife venues, police jurisdictions,
  institutions, neighbourhoods, historical events — each independently toggleable
- Font Awesome Pro icons baked as inline SVGs at build time (no runtime CDN call)
  - Beats: `fa-people-pants`; venues: `fa-martini-glass`; police: `fa-shield-halved`
  - Events: `fa-hand-fist` (activism), `fa-candle-holder` (memorial), `fa-siren-on` (raids)
  - Cases: `fa-location-dot` colour-coded by SCOI finding
- Legend updated: actual mini-pin icons matching map markers exactly
- Layer control (top-right): toggle each layer independently
- All map popups link to relevant detail pages

**PAC jurisdiction maps:**
- All 7 PAC location pages now include a Leaflet map of their jurisdiction
- Suburb boundaries fetched at build time from NSW Spatial Portal
  (Geoscape Administrative Boundaries, CC-BY 4.0, no API key required)
- Structured `suburbs_covered[]` and `stations[]` arrays added to all PAC files:
  Surry Hills, Eastern Suburbs, Eastern Beaches, Northern Beaches, Kings Cross,
  Sydney City, Inner West
- Station pins (shield icon) show address + phone + hours in popup

**Region map pages:**
- `/locations/region/inner-sydney/` and others derive suburb list from location records
  and fetch polygon boundaries from NSW Spatial Portal at build time
- Map shows suburb outlines + all location pins for that region
- Clicking region link on any location page now goes to rich region map page

**Accessibility (WCAG 2.1 AA):**
- All contrast failures fixed: `--muted` lightened (#7878a0 → #8585af) for 5.24:1
  on surface; badge-homicide text fixed (3.48:1 → 4.77:1); badge-open fixed
- Skip-to-content link added sitewide
- `:focus-visible` styles added (gold outline, keyboard navigation)
- Nav `aria-label`, `<main id="main-content">`, map `role="application"` + `aria-label`
- All decorative SVGs: `aria-hidden="true"`
- WCAG AA compliance added to project goals in README and `_project-status.md`

**Suburb filter:**
- Location detail pages: suburb and region text are now clickable meta-links
- Locations index: client-side `?suburb=` / `?region=` filtering with active filter banner

**Build:**
- Font Awesome Pro: switched from kit CDN to `@fortawesome/pro-solid-svg-icons` npm package
- `build.sh` added: reliable FA Pro auth for Cloudflare Pages CI
  (writes token to .npmrc at build time; Cloudflare build command: `bash build.sh`)
- 74 static pages building cleanly

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

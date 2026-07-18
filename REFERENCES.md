# References

Project methodology bibliography — sources that inform *how* this project is built
(referencing standards, First Nations protocols, primary source, comparable projects).

**Individual source records** (articles, podcasts, documentaries) live in
[`data/sydney/sources/`](data/sydney/sources/) as first-class data files with full
citation metadata, significance ratings, and cross-references to cases, locations,
and people.

**Archive and repository conditions of use** are tracked in
[`data/sydney/source-collections/`](data/sydney/source-collections/) —
one file per institution, covering licence type, permission status, and citation
format overrides.

All citations use the Australian Government Style Manual (AGSM) author–date system:
<https://www.stylemanual.gov.au/referencing-and-attribution/author-date>

---

## How to cite this project

### The dataset

Roberts A (2026) *Queer Heritage: Historical LGBTIQ Hate Crimes in Sydney* [data set],
GitHub, https://github.com/bitsloppy/queer-heritage, accessed [Day Month Year].

### An individual record

Roberts A (2026) '[Record title]', *Queer Heritage* [data set record],
https://github.com/bitsloppy/queer-heritage/blob/main/data/sydney/[collection]/[slug].md,
accessed [Day Month Year].

**Example:**
Roberts A (2026) 'Mark Stewart', *Queer Heritage* [data set record],
https://github.com/bitsloppy/queer-heritage/blob/main/data/sydney/cases/mark-stewart.md,
accessed 18 July 2026.

### Original journalism

Roberts A ([Day Month Year]) '[Article title]', *Queer Heritage*,
https://[domain]/journalism/[slug], accessed [Day Month Year].

### Licence

All data under `data/sydney/` is published under **CC-BY 4.0**. Attribution is a
licence condition. A machine-readable `CITATION.cff` is included in the repository
root. At v1.0, a DOI will be minted via [Zenodo](https://zenodo.org).

---

## Primary source

NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (2023) *Report of the
Special Commission of Inquiry into LGBTIQ Hate Crimes* (Sackar J, Commissioner),
3 vols + annexures, NSW Government, Sydney.

- Volume 1 (18 December 2023) — Executive summary, overview, introductory chapters
- Volume 2 (19 December 2023) — Category A and B deaths
- Volume 3 (19 December 2023) — Strike Forces, institutional failures, recommendations
- Annexures (18 December 2023)

Available: <https://www.nsw.gov.au/departments-and-agencies/cabinet-office/resources/special-commissions-of-inquiry/lgbtiq-hate-crimes>

### Government response

NSW Government (23 October 2024) *NSW Government supports all recommendations of
Special Commission into Historical LGBTIQ+ Hate Crimes* [media release], NSW
Government, accessed 17 July 2026.

---

## Methodology

### Referencing and attribution

APSC (Australian Public Service Commission) (2026) 'Author–date',
*Australian Government Style Manual*, <https://www.stylemanual.gov.au/referencing-and-attribution/author-date>,
accessed 17 July 2026.

### First Nations cultural protocols

Local Contexts (n.d.) *Local Contexts: Indigenous cultural property, rights, and
protocols*, <https://localcontexts.org>, accessed 17 July 2026.

AIATSIS (n.d.) *AIATSIS Map of Indigenous Australia*,
<https://aiatsis.gov.au/explore/map-indigenous-australia>, accessed 17 July 2026.

AIATSIS (n.d.) *AIATSIS Code of Ethics for Aboriginal and Torres Strait Islander
Research*, <https://aiatsis.gov.au/research/ethical-research/code-ethics>,
accessed 17 July 2026.

---

## Source collections

Conditions of use, permission status, and citation format overrides are tracked
per institution. See [`data/sydney/source-collections/`](data/sydney/source-collections/).

| File | Institution | Access |
|---|---|---|
| `abc.md` | ABC (Australian Broadcasting Corporation) | Open — fair dealing for research |
| `aqua.md` | Australian Queer Archives | Item-dependent — permission required |
| `bondi-badlands.md` | Bondi Badlands podcast (SMH/The Age, 2021) | © all rights; cite with AGSM |
| `deep-water-documentary.md` | Deep Water (SBS/Blackfella Films, 2016) | © all rights; cite with AGSM |
| `pride-history-group.md` | Pride History Group Oral History Collection | Restricted — permission required before publication |
| `star-observer.md` | Star Observer Archive (1979–present) | Restricted — permission required for reproduction |
| `state-library-nsw.md` | State Library of NSW | Item-dependent — check per record |

---

## Secondary sources

Wotherspoon G (2016) *Gay Sydney: A History*, New South Printing, Sydney.
*[Cited in the SCOI report; key source for queer venue and beat geography. Primary-source-quality oral history segments in associated ABC Radio interview — see `data/sydney/sources/wotherspoon-abc-radio-sunday-brunch-2024.md`.]*

---

## Comparable projects

Regan A and Gonzaba E (n.d.) *Mapping the Gay Guides*, <https://www.mappingthegayguides.org>,
accessed 17 July 2026.
*[Closest parallel: temporal geographic mapping of queer life from historical records.]*

Femicide Census (n.d.) *Femicide Census*, <https://www.femicidecensus.org>,
accessed 17 July 2026.
*[Victim-centred documentation at scale; methodology transparency.]*

Robertson SR (n.d.) *Digital Harlem: Everyday Life 1915–1930*, <https://digitalharlem.org>,
accessed 17 July 2026.
*[Legal/institutional records turned inside-out to document a surveilled community.]*

Slave Voyages (n.d.) *Slave Voyages*, <https://www.slavevoyages.org>,
accessed 17 July 2026.
*[Gold standard for historical open data: collaborative, downloadable, built for longevity.]*

Marshall Project (n.d.) *The Marshall Project*, <https://www.themarshallproject.org>,
accessed 17 July 2026.
*[Data + journalism as one project; open data gives journalism credibility and staying power.]*

---

## Notes

**On the heritage call:** Sackar's call for a comprehensive queer heritage project
(Chapter 16, paras 16.15–16.19) was a narrative recommendation, not one of the 19
formally numbered recommendations. The NSW Government has no formal accountability
to implement it. This project is a direct response to that call.

**On Trove:** Digitised Australian newspaper content at <https://trove.nla.gov.au>.
Coverage of 1970s–2000s material is uneven. A Trove API key is needed for the
ingestion helper script. Outstanding press stubs needing Trove IDs are tracked in
[`resources/trove-todo.md`](resources/trove-todo.md).

---
name: "ABC (Australian Broadcasting Corporation)"
short_name: "ABC"
url: "https://www.abc.net.au"

# The ABC holds full copyright over its content but makes it publicly
# accessible for reading, viewing, listening, and research. Fair dealing
# applies. Reproduction of substantial portions requires ABC Legal approval.
license_type: copyright-all-rights

conditions_summary: >
  ABC content is publicly accessible online for reading, viewing, and listening.
  Copyright is held by the Australian Broadcasting Corporation under Commonwealth
  law. Fair dealing applies for research, criticism, and journalism — linking and
  quoting in analysis does not require permission. Reproduction of substantial
  portions (e.g. republishing full articles) requires permission from ABC Legal.

conditions_verbatim: null

requires_permission_for_publication: false
requires_notification_before_publication: false

# No custom citation format — AGSM author-date applies throughout.
# See body text for format by content type (news / radio / TV).
citation_format_override: null
citation_example: null

our_permission_status: not-applicable

our_notes: >
  The ABC is our primary source for contemporaneous news coverage of the SCOI
  (2022–2023), for the Alan Rosendale 2018 article (primary-source quality —
  includes Paul Simes as an eyewitness and the unmarked police car allegation),
  and for radio programs on queer history (Wotherspoon interview, Sam Cooling
  "Queerbrarian" interview).

  Online news articles (2000–present) are directly accessible and stable.
  Older radio content (pre-2005) is best accessed via the National Film and
  Sound Archive (NFSA) or the ABC institutional archive (not public).
  Older TV content (Four Corners, 7.30 pre-2015) similarly.

  In data files: ABC online news articles → PressSource, type: online-news.
  ABC radio programs → MediaSource, type: radio-segment.
  ABC TV journalism → MediaSource, type: documentary.

planned_use: >
  Two tracks:
  1. Online news articles: search abc.net.au/news for victim names, case
     references, SCOI coverage, community and political responses. Cite as
     PressSource (type: online-news).
  2. Radio and TV programs: Background Briefing, AM/PM, Four Corners, 7.30,
     Earshot. Check ABC Listen for radio; NFSA for older material. Cite as
     MediaSource (type: radio-segment or documentary).
  Priority: SCOI 2022–2023 coverage; Alan Rosendale 2018; Raymond Keam 2021;
  Crispin Dye 2023; Sam Cooling and Wotherspoon radio interviews.

tags:
  - news
  - radio
  - television
  - journalism
  - public-broadcaster
  - open-access
---

The ABC (Australian Broadcasting Corporation) is Australia's national public
broadcaster. It is one of the primary sources for this project across three
formats: online news journalism, radio documentary and investigative programs,
and TV current affairs. Unlike archive collections with restricted access, ABC
content is publicly accessible — no permission is required for research use and
linking.

## In data files: which sub-schema to use

| ABC content type | Data file field | Schema type value |
|---|---|---|
| abc.net.au/news articles | `sources.press[]` | `PressSource`, type: `online-news` |
| Radio programs (Background Briefing, AM, etc.) | `sources.media_sources[]` | `MediaSource`, type: `radio-segment` |
| TV programs (Four Corners, 7.30) | `sources.media_sources[]` | `MediaSource`, type: `documentary` |
| Archived ABC material at NFSA | `sources.archives[]` | `ArchiveSource`, institution: `nfsa` |

## Programs relevant to this project

**ABC News** — online news service; primary coverage of SCOI 2022–23; case-level
reporting on findings, victim families, and police responses.

**Background Briefing** — Radio National's long-form investigative journalism.
Relevant for historical coverage of police accountability and LGBTIQ rights.

**Earshot** (formerly 360documentaries) — Radio National documentary strand.
May hold programs on LGBTIQ history and community experience.

**Four Corners** — ABC TV's flagship investigative program. Has covered LGBTIQ
issues and police conduct over decades.

**7.30 / The 7.30 Report** — TV news magazine. Likely covered SCOI findings and
individual cases during the inquiry period (2022–23).

## Citation formats (AGSM author-date)

**Online news article** (`PressSource`, type: `online-news`):
```
Author A (Day Month Year) 'Article title', ABC News, ABC,
viewed Day Month Year, <https://www.abc.net.au/news/...>.
```
If no byline: use `ABC News` as author field.

**Radio segment** (`MediaSource`, type: `radio-segment`):
```
Presenter A (Day Month Year) 'Segment title', Program Name
[radio], ABC Radio National, viewed Day Month Year, <URL>.
```

**TV program** (`MediaSource`, type: `documentary`):
```
Program Name (Day Month Year) 'Episode title', Program Name
[television], ABC, viewed Day Month Year, <URL if on iview>.
```

## Accessing older content

| Period | News | Radio | TV |
|--------|------|-------|----|
| 2015–present | abc.net.au/news ✅ | ABC Listen ✅ | ABC iview ✅ |
| 2005–2015 | abc.net.au/news ✅ | ABC Listen (partial) | ABC iview (partial) |
| 1995–2005 | Wayback Machine | NFSA / ABC Archive | NFSA / ABC Archive |
| Pre-1995 | Not online | NFSA | NFSA |

## Already referenced in this project

| Source | Type | Notes |
|--------|------|-------|
| Alan Rosendale (2018) — "The men who got away with it" | online-news | Primary-source quality; Paul Simes eyewitness; unmarked police car allegation |
| SCOI findings coverage (2022–23) | online-news | Multiple articles across inquiry period |
| Raymond Keam / Stan Early arrest (2021) | online-news | One of the few cases with a subsequent charge |
| Crispin Dye — DNA findings (2023) | online-news | DNA match 30 years later |
| Oxford Street heritage articles | online-news | Various |
| Surry Hills mural removal (2025) | online-news | October 2025; sourced for surry-hills-pac.md |
| Garry Wotherspoon radio interview | radio-segment | Program and date need research |
| Sam Cooling ("Queerbrarian") radio interview | radio-segment | Program and date need research |

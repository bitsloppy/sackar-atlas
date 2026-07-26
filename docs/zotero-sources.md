# Adding sources to Zotero

Sources in the Zotero group library at https://www.zotero.org/groups/sackar-atlas automatically
appear on the sackar-atlas Sources page at the next build.

## The short version

1. Add the item in Zotero normally (fill in title, URL, author, date, publication)
2. Paste any site-specific metadata into the **Extra** field (see below)
3. Push to trigger a build — your source will appear

---

## Zotero item type → source_type mapping

Zotero's item types map automatically to the site's `source_type` values:

| Zotero item type   | Site source_type     |
|--------------------|----------------------|
| Webpage            | online-news          |
| Blog Post          | online-news          |
| Newspaper Article  | newspaper            |
| Magazine Article   | magazine-feature     |
| Radio Broadcast    | radio-segment        |
| Audio Recording    | podcast-episode      |
| Film               | documentary          |
| Video Recording    | documentary          |
| TV Broadcast       | tv-segment           |
| Book               | book                 |
| Book Section       | book-chapter         |
| Journal Article    | academic-article     |
| Conference Paper   | academic-article     |

If the automatic mapping is wrong, override it with `source_type:` in the Extra field (see below).

For community press (Star Observer, Campaign, SX) — use **Newspaper Article** and add
`source_type: community-press` in Extra.

---

## The Extra field

Zotero's **Extra** field accepts `key: value` lines. The site reads these for
metadata Zotero doesn't have built-in fields for.

Paste these lines into Extra as needed:

```
source_type: podcast-episode
significance: primary-source-quality
show_title: Bondi Badlands
episode_title: Ross Warren
episode_number: 1
series_id: bondi-badlands
related_cases: ross-warren, john-russell
related_locations: marks-park, eastern-suburbs-pac
related_people: garry-wotherspoon
related_events: sfp-parrabell
related_recommendations: rec-17
related_sources: abc-news-2021-bondi
tags: bondi-cliffs, gay-hate-crimes, 1989
spotify_url: https://open.spotify.com/show/5aEiYdw9FjLPNr9XOJZPdh
apple_podcasts_url: https://podcasts.apple.com/au/podcast/bondi-badlands/id1585916975
trove_id: 12345678
trove_url: https://trove.nla.gov.au/newspaper/article/12345678
runtime: 42m
timestamp: 14:32
```

### Field reference

| Field | Type | Notes |
|-------|------|-------|
| `source_type` | string | Override automatic type mapping (see table above) |
| `significance` | enum | `primary-source-quality` · `secondary` (default) · `tertiary` |
| `show_title` | string | Series/show name for AV items (e.g. "Bondi Badlands") |
| `episode_title` | string | Episode title (distinct from the item title field) |
| `episode_number` | integer | Episode number within the series |
| `series_id` | string | Slug of a `source_collections/` entry (links to series notes) |
| `related_cases` | csv | Case slugs — e.g. `ross-warren, john-russell` |
| `related_locations` | csv | Location slugs — e.g. `marks-park` |
| `related_people` | csv | People slugs — e.g. `garry-wotherspoon` |
| `related_events` | csv | Event slugs |
| `related_recommendations` | csv | Recommendation slugs — e.g. `rec-17` |
| `related_sources` | csv | Other source item keys (for companion pieces) |
| `tags` | csv | Free tags — merged with any Zotero tags on the item |
| `spotify_url` | url | Podcast Spotify link |
| `apple_podcasts_url` | url | Podcast Apple Podcasts link |
| `trove_id` | string | NLA Trove persistent ID |
| `trove_url` | url | Full Trove URL |
| `runtime` | string | e.g. `42m`, `1h 27m` |
| `timestamp` | string | Cited moment — e.g. `14:32`, `1:05:10` |

### Significance levels

- **`primary-source-quality`** — eyewitness testimony, primary documents, key first-hand interviews
  (e.g. Alan Rosendale; David McMahon; Det. Sgt. Page; family testimony at inquest)
- **`secondary`** (default) — journalism, documentary, commentary about the events
- **`tertiary`** — overview, aggregation, background context

---

## Migrating the existing 26 source files

The 26 existing flat-file sources in `data/sources/` need to be added to Zotero.
They're not automatically imported. Work through them one by one:

1. Open `data/sources/<filename>.md`
2. Create the matching Zotero item
3. Copy the `related_*`, `tags`, `significance`, and any Extra-field values from the frontmatter
4. Once Zotero is populated, the flat files can be archived (they're kept in the repo for reference)

---

## Cloudflare Pages environment variables

For production builds, add both variables in the Cloudflare dashboard:

**Pages → sackar-atlas → Settings → Environment variables**

| Variable | Value |
|----------|-------|
| `ZOTERO_GROUP_ID` | Your numeric group ID |
| `ZOTERO_API_KEY` | Your read-only API key |

Set them for both **Production** and **Preview** environments.

---

## Local development

Create `site/.env` (gitignored) with:

```
ZOTERO_GROUP_ID=1234567
ZOTERO_API_KEY=your_key_here
```

Then `npm run build` or `npm run dev` will fetch live from Zotero.

> **Note:** `npm run dev` fetches sources once at startup. To pick up new Zotero items
> during dev, restart the dev server.

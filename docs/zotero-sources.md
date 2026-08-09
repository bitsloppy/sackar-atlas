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
| **Artwork**        | **photograph**       |

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
| `sackar_atlas_id` | string | Stable human-readable slug for this source. Used as the content collection ID. Required for sources referenced from case files. Format: `publication-YYYY-MM-DD-keyword` |
| `source_type` | string | Override automatic type mapping (see table above) |
| `significance` | enum | `primary-source-quality` · `secondary` (default) · `tertiary` |
| `show_title` | string | Series/show name for AV items (e.g. "Bondi Badlands") |
| `episode_title` | string | Episode title (distinct from the item title field) |
| `episode_number` | integer | Episode number within the series |
| `series_id` | string | Slug of a `source_collections/` entry (links to series notes) |
| `related_sources` | csv | Other source item keys (for companion pieces) — keep in Extra, no tag equivalent |

**Cross-references — use namespaced Zotero tags instead of Extra fields:**

| Tag prefix | Maps to | Example |
|------------|---------|----------|
| `case:<slug>` | related\_cases | `case:john-russell` |
| `location:<slug>` | related\_locations | `location:marks-park` |
| `event:<slug>` | related\_events | `event:strike-force-parrabell` |
| `person:<slug>` | related\_people | `person:garry-wotherspoon` |
| `rec:<slug>` | related\_recommendations | `rec:rec-17` |

All other tags are plain and appear in the site's tag list. During migration, existing `related_*` Extra fields still work and are merged with tag-sourced values — they can be removed from Extra once you've moved them to tags.
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

## Photographs and archival images

Use the **Artwork** item type in Zotero for photographs, press photos, and archival images.
This maps automatically to `source_type: photograph` on the site.

### Standard Zotero fields to fill in

| Zotero field | What to put there |
|---|---|
| Title | Descriptive title for the image (e.g. "1978 Mardi Gras march, Oxford Street") |
| Artist | Photographer or creator credit (family name, given name) |
| Archive | Holding repository (e.g. "State Library of NSW", "Trove / NLA") |
| Archive Location | Folder, box, series, or call number within the archive |
| Rights | Rights statement (e.g. "Public domain", "CC BY 4.0", "© Fairfax Media") |
| Date | Date the image was taken or published (ISO 8601 or year) |
| URL | Direct URL to the archival record if available |

### Required Extra fields

```
sackar_atlas_id: trove-1978-mardi-gras-photo
source_type: photograph
significance: primary-source-quality
related_events: mardi-gras-1978
```

Use namespaced tags for cross-references (same as all other source types):
```
event:mardi-gras-1978
case:mark-stewart
```

### Linking an image to an event

Once the Zotero item is added, tell Web Ninja:
- The **event slug** (e.g. `mardi-gras-1978`)
- The **sackar_atlas_id** from the Extra field (e.g. `trove-1978-mardi-gras-photo`)

Web Ninja will:
1. Create `site/public/images/events/{slug}/`
2. Add the `image:` block to the event YAML:
   ```yaml
   image:
     path: events/mardi-gras-1978/hero.jpg
     source_id: trove-1978-mardi-gras-photo
     alt: "Crowd of protesters march along Oxford Street at night, police visible at edges"
   ```
3. Tell you where to drop the file

The attribution line on the page (artist, archive, rights) is rendered automatically
from the Zotero record — you do not need to duplicate it in the YAML.

### Image file guidelines

- Location: `site/public/images/events/{event-slug}/hero.jpg`
- Max ~1200px on longest edge, <300KB, JPEG quality ~85
- Prefer originals from Trove, State Library NSW, NAA, or other open archives
- Check rights carefully before committing — most archival press photos are not public domain
- See `site/public/images/events/README.md` for the full workflow

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

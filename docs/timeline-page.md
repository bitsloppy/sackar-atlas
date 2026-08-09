# Timeline page — design and data model

The `/timeline` page is a custom WA-styled interactive timeline driven directly
from the `events/` content collection. No third-party timeline library (no TimelineJS,
no external dependencies).

---

## Why custom, not TimelineJS

We evaluated [Knight Lab TimelineJS](https://timeline.knightlab.com/) (open-source,
MPL 2.0) before committing to a custom build.

**TimelineJS strengths:**
- Quick to set up — Google Sheets or JSON as data source
- Good slide-based UX with a scrubber bar
- Handles rich media (images, video, maps) out of the box
- Free for commercial use

**Why we didn't use it:**
- Renders into an `<iframe>` — sits outside the WA design system entirely
- Distinct visual style (slides + scrubber) that won't match the site
- Google Sheets dependency for the easy path; JSON instantiation for custom installs
  adds complexity without giving us more than a custom build would
- No filter bar — we want the same tag/type/year filtering we have on every other
  index page
- Image attribution: TimelineJS handles credits in slide text; we need Zotero-sourced
  attribution rendered consistently
- Update path for images: TimelineJS doesn't connect to Zotero; our custom build does

**What we're replicating from TimelineJS:**
- Chronological narrative with year group anchors
- Event cards with date, headline, body text, and hero image
- Scrubber/navigation → replaced with sticky filter bar + year group headings
- Deep-linkable events

**Decision:** Custom WA build. More work upfront, but fully integrated with the design
system, the filter bar pattern, and the Zotero image pipeline.

---

## Goals

- One central place to navigate the full chronological sweep of events
- Filter by tag, year, or event type — same filter bar pattern used on all index pages
- Deep-linkable anchors per event (`/timeline#mardi-gras-1978`)
- Hero images where available, with proper attribution
- Fully under the WA design system — no external visual style

---

## Data source

`events/` collection only. No intermediate JSON transform — Astro loads it directly
at build time via the glob loader in `content.config.ts`.

**Relevant event fields for the timeline:**

| Field | Purpose |
|---|---|
| `title` | Event card headline |
| `event_type` | Drives colour/icon and type filter chips |
| `date` | Sort order + year grouping |
| `date_display` | Human-readable date on the card |
| `decade` | Year group headings (fallback if year can't be inferred from `date`) |
| `tags` | Tag filter chips |
| `image.path` | Hero image (rendered if present) |
| `image.source_id` | Zotero `sackar_atlas_id` → drives attribution |
| `image.alt` | Alt text |
| `related_cases` | "See also" case links on the card |
| `location_name` | Displayed on the card |

---

## Layout

```
/timeline
  ├── Sticky filter bar (event_type chips, tag chips, year range)
  ├── Year group heading (e.g. "1970s", "1978")
  │    └── Event card
  │         ├── Date + event_type badge
  │         ├── Hero image (if image: is set)
  │         ├── Title (h2 with anchor id = event slug)
  │         ├── Body (first paragraph of markdown body)
  │         ├── Attribution line (if image — from Zotero source record)
  │         └── Related cases / locations chips
  └── Empty state
```

---

## Filter bar

Same pattern as every other index page:

- Sticky: `position: sticky; top: var(--header-height, 4rem); z-index: 4`
- Event type chips (left group) — AND logic between groups
- Tag chips (right group) — OR within group
- `data-type`, `data-tags`, `data-year` attributes on each `<article>`
- Live count: `<span id="timeline-count">` updated via JS
- Empty state: `<p hidden>` revealed when 0 results match

---

## Image attribution

At build time, for each event with an `image:` field:

```ts
const imgSource = image?.source_id
  ? await getEntry('sources', image.source_id)
  : null;
```

Rendered caption:
```
{imgSource.data.title} · {imgSource.data.artist} · {imgSource.data.rights}
```

If `image.caption` is set in the event YAML, use that instead.

If `imgSource` is null (Zotero item not found), render the image without a caption
and log a build warning — do not fail the build.

---

## Tags vocabulary

Tags are free-form strings on each event. The following are established and used
across the current event set:

```
mardi-gras        activism          78ers
oxford-street     police-violence   1970s
inquiry           scoi              strike-force
parrabell         neiwand           legislation
memorial          vigil             community
media             1980s             1990s
```

New tags are fine — just keep them lowercase and hyphenated.

---

## Status

**Not yet built.** Schema and data pipeline are ready (2026-08-09).

Next steps:
1. Build `site/src/pages/timeline.astro`
2. WA component: check `wa-timeline` in WA docs before building from scratch
3. Image component: render hero + attribution from Zotero record
4. Filter bar JS (reuse pattern from events/index.astro)
5. Test with a handful of seeded images

---

## Related docs

- `docs/zotero-sources.md` — how to add photograph items to Zotero
- `docs/ai-instructions.md` — images section
- `site/public/images/events/README.md` — image file workflow
- `site/src/loaders/zotero.ts` — Zotero loader (photograph fields added 2026-08-09)
- `site/src/content.config.ts` — events schema (`image:` field), sources schema (photograph type)

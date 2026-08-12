# Notion Content System

> Agent reference — read this before touching anything Notion-related.

The Notion content system manages all narrative prose for the sackar-atlas site.
It is the source of truth for human-reviewed text. The data files (`data/`) remain
the source of truth for structured data (dates, slugs, relationships, findings).

---

## Architecture

```
data/*.md          → structured data (YAML frontmatter, slug, dates, relationships)
Notion database    → prose content (narrative sections, site pages)
                   ↓ build-time fetch (status=Live only)
notion_content     → Astro content collection
                   ↓ getEntry('notion_content', 'cases/scott-johnson')
page templates     → render HTML in place of static prose
```

## Notion workspace

- **Workspace:** Sackar Atlas (`luminous-magpie-945.notion.site`)
- **Content database:** `https://app.notion.com/p/45e67c11b52144aea227ceef18269740`
- **Database ID:** `45e67c11-b521-44ae-a227-ceef18269740`
- **Data source ID:** `058114d5-55e8-4c5e-9aba-2ef8ceafcb11`
- **API token:** `NOTION_API_KEY` in `site/.env`

## Database schema

| Property | Type   | Values                                            |
|----------|--------|---------------------------------------------------|
| Name     | title  | Display name (e.g. "Scott Johnson")               |
| slug     | text   | Matches data file slug (e.g. `scott-johnson`)     |
| type     | select | `cases` `locations` `events` `people` `pages`     |
| status   | select | `Draft` `Review` `Live`                           |

Page body = Notion blocks (H2 headings, paragraphs, lists, quotes, tables, etc.)

## Collection ID format

```
{type}/{slug}
```

Examples:
- `cases/scott-johnson`
- `locations/marks-park`
- `people/doreen-cruickshank`
- `pages/about`
- `pages/about-ai`
- `pages/corrections`

## Fetching in Astro templates

```astro
---
import { getEntry } from 'astro:content';

// In a case page template:
const prose = await getEntry('notion_content', `cases/${slug}`);
// prose?.data.html — the rendered HTML string, or undefined if not Live
---

{prose && (
  <div class="notion-prose" set:html={prose.data.html} />
)}
```

## Status gate

Only `status = Live` records are fetched at build time.

- **Draft** — in Notion, not fetched by build
- **Review** — in Notion, not fetched by build  
- **Live** — fetched, converted to HTML, available via `getEntry`

To publish a record: flip status to Live in Notion → trigger a build.

## Supported block types

| Notion block         | HTML output                          |
|---------------------|--------------------------------------|
| paragraph           | `<p>`                                |
| heading_2           | `<h2>`                               |
| heading_3           | `<h3>`                               |
| heading_4           | `<h4>`                               |
| bulleted_list_item  | `<ul><li>` (consecutive grouped)     |
| numbered_list_item  | `<ol><li>` (consecutive grouped)     |
| quote               | `<blockquote>`                       |
| callout             | `<div class="notion-callout">`       |
| divider             | `<hr>`                               |
| code                | `<pre><code class="language-*">`     |
| table               | `<table class="notion-table">`       |

Rich text annotations: bold, italic, code, strikethrough, underline, links.

## Inline ID markers

Two special markers can be embedded in Notion prose. They are **passed through
as-is** by the loader — resolution happens at render time in page templates.

### Short inline reference (chip + link)

```
{{ref:person:scott-johnson}}
{{ref:location:marks-park}}
{{ref:case:ross-warren}}
{{ref:event:mardi-gras-1978}}
```

Renders as: a styled name chip linking to the entity page.
Colour follows the content-type palette (cases=rose, locations=teal, etc.).

### Block embed (full paragraph transclusion)

```
{{embed:testimony:scoi-vol-3:p45}}
{{embed:source:parrabell-report:p123}}
```

Renders as: the full text of the referenced paragraph, in a styled blockquote
with attribution, pulled from the data files at build time.

**Status: both are not yet implemented in page templates.** The markers are
preserved in HTML output — nothing breaks, they just render as literal text.
See upcoming work below.

## File locations

| File | Purpose |
|------|---------|
| `site/src/loaders/notion.ts` | Astro content loader — fetches, converts |
| `site/src/lib/notion-blocks.ts` | Notion block → HTML converter |
| `site/src/content.config.ts` | Collection registration (`notion_content`) |
| `scripts/migrate-to-notion.mjs` | One-off migration script (YAML → Notion) |

## Rate limits

Notion API: ~3 req/s. Loader uses 350ms between calls.

Per Live record: 1 block fetch + 1 per table (for child rows).
At 100 Live records with no tables: ~35s additional build time.
At current state (0 Live): 1 query call only — negligible.

## Upcoming work

### 1. Wire Notion content into page templates

The loader is built and the collection is registered. Page templates
(`[slug].astro` for cases, locations, events, people; static pages for about/ai/corrections)
need to be updated to:

1. `getEntry('notion_content', \`{type}/{slug}\`)` 
2. If found, render `prose.data.html` using `set:html`
3. If not found, fall back to existing static prose / nothing

For entity pages (cases, locations, etc.): the HTML replaces the current
Markdown body sections (the accordion prose). The `sections[]` YAML metadata
(heading, type, open state) may need to be derived from the Notion H2 headings
rather than the YAML array — or kept in YAML as structural metadata with Notion
providing body text only.

For site pages (about, about-ai, corrections): the HTML replaces hardcoded
prose in the Astro template. Structural elements (tables of sources, CTAs,
nav links) remain in Astro; prose sections come from Notion.

### 2. Inline ref chip renderer

Resolve `{{ref:type:slug}}` markers in Notion HTML to styled inline chips.

Implementation options:
- **Post-process in the loader** (before storing HTML): regex replace with
  entity lookups from other collections. Requires loader to import/query other
  collections — possible in Astro loaders but adds coupling.
- **Astro component** (`<NotionProse html={html} />`): processes the HTML
  string client-side or at render time, replacing markers with components.
- **Rehype plugin**: add a remark/rehype step that parses the HTML and replaces
  markers with rich HTML nodes before the template renders.

Recommended: Astro component approach. The component receives the raw HTML,
does a regex pass to find `{{ref:...}}` markers, fetches entity data for each
(using `getEntry`), and replaces them with styled `<a>` chips.

Chip design: follows the existing type pill pattern — `--site-cases`, 
`--site-locations`, `--site-people`, `--site-events` colours. Small, inline,
with the entity name and a link.

### 3. Block embed renderer

Resolve `{{embed:type:slug:para-id}}` markers to full rendered paragraph blocks.

This is more complex than inline refs because:
- `para-id` references a specific paragraph within a testimony/source file
- Testimony files have para IDs in their Markdown (format: `SCOI-V2.5.551`)
- The embed needs to fetch the paragraph text from the data file at build time
- Rendered output: styled blockquote with attribution (source title, para ID)

Implementation: extend the same component/plugin approach as inline refs,
but for block-level replacement. The `{{embed:...}}` marker should appear on
its own line in Notion prose; the rendered blockquote replaces the whole paragraph.

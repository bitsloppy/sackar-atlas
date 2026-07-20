# Brief: CSV Data Export Endpoints

**Status:** Not yet built — aspirational in README, needs implementing  
**Repo:** `~/code/queer-heritage` → `https://github.com/bitsloppy/sackar-atlas`  
**Goal:** Publish downloadable CSV files from the site at build time, so non-technical users (journalists, researchers, academics) can access the structured data without needing Git.

---

## What to build

Three Astro static endpoints that generate CSV files at build time:

| Endpoint | Output URL | Priority |
|---|---|---|
| `site/src/pages/data/cases.csv.ts` | `/data/cases.csv` | ⭐ do this first |
| `site/src/pages/data/locations.csv.ts` | `/data/locations.csv` | nice to have |
| `site/src/pages/data/people.csv.ts` | `/data/people.csv` | nice to have |

---

## How Astro static endpoints work

Create a `.ts` file in `site/src/pages/`. Export a `GET` function that returns a `Response`. Astro builds it as a static file at deploy time.

```ts
// site/src/pages/data/cases.csv.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const cases = await getCollection('cases', ({ data }) => data.published === true);
  
  // build CSV string
  const csv = [ headerRow, ...dataRows ].join('\n');
  
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sackar-atlas-cases.csv"',
    },
  });
};
```

Note: Astro static endpoints need `export const prerender = true` if the site is in SSR mode — check `site/astro.config.mjs` to confirm. If it's a fully static site (output: 'static'), this isn't needed.

---

## cases.csv — fields to include

Flatten the most useful fields. Skip deeply nested objects (sexuality record, full manner_findings) — they don't CSV cleanly. Output the key conclusions only.

| CSV column | Source field | Notes |
|---|---|---|
| `slug` | file slug | stable identifier |
| `victim_name` | `data.title` | |
| `date_of_death` | `data.date_of_death` | ISO 8601 |
| `date_of_death_display` | `data.date_of_death_display` | human-readable |
| `age_at_death` | `data.age_at_death` | may be null |
| `born_date` | `data.born_date` | may be null |
| `born_place` | `data.born_place` | may be null |
| `location_id` | `data.location_id` | links to locations |
| `scoi_category` | `data.scoi_category` | A / B / null |
| `case_outcome` | `data.case_outcome` | death / missing / assault-survived |
| `inquiry_finding` | `data.manner_findings?.inquiry_finding` | possible-hate-crime etc |
| `parrabell_finding` | `data.manner_findings?.parrabell_finding` | may be null |
| `site_status` | `data.manner_findings?.site_status` | possible / confirmed / null |
| `police_misconduct_level` | `data.police_misconduct_level` | |
| `conviction` | derived: true if `manner_findings.conviction` exists | boolean |
| `convicted_person` | `data.manner_findings?.conviction?.convicted_person` | name if convicted |
| `source_lists` | `data.source_lists?.join('; ')` | acon-88 / scoi-category-a etc |
| `published` | `data.published` | boolean |

**Escape rule for CSV:** wrap every field in double quotes; escape internal double quotes as `""`.

---

## locations.csv — fields to include

| CSV column | Source field |
|---|---|
| `slug` | file slug |
| `name` | `data.name` |
| `suburb` | `data.suburb` |
| `location_region` | `data.location_region` |
| `country` | `data.first_nations?.country_name` |
| `lat` | `data.coordinates?.lat` |
| `lng` | `data.coordinates?.lng` |
| `location_roles` | `data.location_roles?.join('; ')` |
| `pac_slug` | `data.police_jurisdiction` |

---

## people.csv — fields to include

| CSV column | Source field |
|---|---|
| `slug` | file slug |
| `name` | `data.name` |
| `role` | `data.role` |
| `institutional_role` | `data.institutional_role` |
| `born_date` | `data.born_date` |
| `died_date` | `data.died_date` |
| `political_party` | `data.political_party` |
| `government_level` | `data.government_level` |

---

## Add download links to the site

Once the endpoints are built and confirmed in the build, add a "Download data" section to the homepage (`site/src/pages/index.astro`) — below the nav cards, above the methodology section:

```html
<div class="data-download">
  <h2>Download the data</h2>
  <p>All structured data is published under <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a>. Download for use in research, journalism, or your own analysis.</p>
  <ul>
    <li><a href="/data/cases.csv">cases.csv</a> — one row per published case</li>
    <li><a href="/data/locations.csv">locations.csv</a> — significant places</li>
    <li><a href="/data/people.csv">people.csv</a> — individuals in the dataset</li>
  </ul>
  <p>Full source data with complete field detail: <a href="https://github.com/bitsloppy/sackar-atlas">GitHub</a>.</p>
</div>
```

---

## Verification steps

1. Run `cd site && npm run build` locally — confirm no build errors
2. Check `site/dist/data/cases.csv` exists and looks right (open in a text editor)
3. Open in Excel/Numbers — confirm it imports cleanly with correct columns
4. Push → confirm deploy succeeds → hit `https://sackar-atlas.soft-hill-5225.workers.dev/data/cases.csv` in browser
5. Confirm `Content-Disposition: attachment` header triggers a download (not inline render)

---

## Resume prompt for fresh session

> "Sackar Atlas — build the CSV export endpoints. Brief is at `~/code/queer-heritage/docs/csv-export-brief.md`. Start with cases.csv, verify the build, then do locations and people if time allows. Push when done."

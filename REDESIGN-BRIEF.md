# Sackar Atlas — WA Redesign Brief

_For a new session picking up the rebuild. Last updated: 2026-07-24._

---

## What this project is

**Sackar Atlas** is a public data project making the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar J, 2023) navigable. It documents 30 hate crime deaths in Sydney — the people, places, institutions, and failures — and makes the connections between them visible in a way a PDF cannot.

It is a research project by Anna Roberts. All data is drawn from public records (SCOI report, Hansard, coronials, Trove). It is not a community heritage project; it is a cartographer's project.

- **Repo:** `~/code/sackar-atlas` → https://github.com/bitsloppy/sackar-atlas
- **Live site:** https://sackar-atlas.soft-hill-5225.workers.dev
- **Git identity:** Bit Sloppy / hello@bitsloppy.com

---

## Current state of the rebuild

### What's done ✅

- Fresh Astro minimal scaffold at `site/` (Astro 7.1.3)
- Web Awesome `^3.10.0` installed
- `src/layouts/Layout.astro` created with correct WA CSS wiring
- Test page confirmed working (styled button renders)
- Baseline committed

### What still exists for reference

- **`site-v1/`** — the full old site with all pages, components, and styles. Use this as a reference for logic and content, not for CSS
- **`git tag v0.1-archive`** — the old site as a git tag, recoverable any time
- **`data/`** — all content data (flat, outside `site/`). This is the source of truth for all cases, locations, events, people, etc.

---

## Technical setup (already done — don't redo)

**WA CSS imports** in `src/layouts/Layout.astro` frontmatter:
```js
import '@awesome.me/webawesome/dist/styles/layers.css';
import '@awesome.me/webawesome/dist/styles/themes/default.css';
```
- `layers.css` first, always
- `themes/default.css` for design tokens
- **Never import `webawesome.css`** — it bundles `native.css` which fights custom styles

**HTML class setup:**
```html
<html lang="en" class="wa-theme-default wa-palette-default wa-light">
```

**Component imports** go in the `<script>` block of the layout (or page file):
```js
import '@awesome.me/webawesome/dist/components/button/button.js';
```
Import only what's used — WA is tree-shaken.

---

## Data collections

All data lives in `~/code/sackar-atlas/data/` (flat structure). The Astro content config will need to point here from `site/`.

| Collection | Path | Count |
|---|---|---|
| Cases | `data/cases/` | 7 files (5 published, 1 held, 1 excluded) |
| Locations | `data/locations/` | 21 files |
| Events | `data/events/` | 6 files |
| People | `data/people/` | ~42 files |
| Sources | `data/sources/`, `data/source-collections/` | several |
| Recommendations | `data/recommendations/` | stub |
| Testimonies | `data/testimonies/` | 3 |

The old content config is at `site-v1/src/content/config.ts` — copy and adapt it. The glob paths need to point at `../../data/` from `site/src/`.

**Important:** `paul-rath.md` is `published: false` — do not show on public listing. `david-lloyd-williams.md` is excluded (no LGBTIQ connection).

---

## Pages to build

### Already existed in v1 — rebuild with WA

| Page | Route | Notes |
|---|---|---|
| Home | `/` | Hero, about text, nav cards to each section, source note |
| Cases index | `/cases/` | List of published cases as cards |
| Case detail | `/cases/[slug]/` | Full case record — the most complex page |
| Locations index | `/locations/` | List of locations as cards |
| Location detail | `/locations/[slug]/` | Location record with related cases |
| Locations by region | `/locations/region/[region]/` | Filter by region |
| Events index | `/events/` | List of events |
| Event detail | `/events/[slug]/` | Event record |
| People index | `/people/` | List of people |
| Person detail | `/people/[slug]/` | Person record |
| Map | `/map/` | Leaflet map (this is custom, not a WA component) |

### Key components from v1 to rebuild

| Old component | What it does | WA equivalent |
|---|---|---|
| `SectionCard.astro` | Expandable accordion section | `<wa-details>` |
| `FindingBox.astro` | SCOI finding highlighted block | `<wa-callout>` |
| `BadgeTag.astro` | Status/category badge | `<wa-tag>` or `<wa-badge>` |
| Hand-rolled nav cards (home) | Grid of section links | `<wa-card>` in a `wa-grid` |
| Custom tab group (related content) | Tabs for related cases/locations/people/events | `<wa-tab-group>` + `<wa-tab>` + `<wa-tab-panel>` |
| Stub warning | Yellow warning for incomplete records | `<wa-callout variant="warning">` |
| Dividers | Horizontal rules | `<wa-divider>` |

---

## Design direction

The old site had hand-rolled CSS that accumulated over time. The goal of this rebuild is to let WA's design system do the heavy lifting — tokens for colour, spacing, typography; WA components for UI patterns; custom CSS only where genuinely needed.

**Key aesthetic decisions to make** (in order):
1. **Brand colour** — add a single class to `<html>` (e.g. `wa-brand-blue`, `wa-brand-teal`) to re-brand the whole UI. The old nav was NSW Aboriginal billabong blue (`#00405E`) — worth keeping or adapting.
2. **Theme** — `wa-theme-default` is the starting point. Free themes available.
3. **Typography** — old site used Outfit (UI) + Special Elite (display). Decide whether to keep or go with WA's built-in type scale.
4. **Content-type colours** — old site used red for cases, teal for locations, purple for people, orange for events. Can be layered on top of WA tokens with targeted CSS.

---

## WA workflow rules (read before writing any WA code)

WA ships machine-readable docs in the npm package. **Always read the relevant skill file before writing component code.**

**Skill paths** (from `site/`):
- `node_modules/@awesome.me/webawesome/dist/skills/webawesome/SKILL.md` — component reference overview
- `node_modules/@awesome.me/webawesome/dist/skills/webawesome/references/choosing-components.md` — decision tree
- `node_modules/@awesome.me/webawesome/dist/skills/webawesome/references/components/[name].md` — specific component API
- `node_modules/@awesome.me/webawesome/dist/skills/webawesome-design/SKILL.md` — design/layout overview
- `node_modules/@awesome.me/webawesome/dist/skills/webawesome-design/references/getting-started.md` — default skeleton
- `node_modules/@awesome.me/webawesome/dist/skills/webawesome-design/references/composition.md` — spacing, type, surfaces

**Rules:**
1. Full page shell → use `<wa-page>`. Sections → use `wa-stack`, `wa-cluster`, `wa-grid`, `wa-split`, `wa-flank`, `wa-frame`
2. Pick components from user intent — read `choosing-components.md` when unsure
3. WA design system first; custom CSS only when WA can't do it
4. Pro-only (don't use): `wa-combobox`, `wa-file-input`, `wa-toast`, all charts, video
5. Import only components that are used

---

## Suggested build order

1. **Content config** — port `site-v1/src/content/config.ts` into `site/src/content/config.ts`, fix glob paths to point at `../../data/`
2. **Layout shell** — expand `Layout.astro` with `<wa-page>` (nav, header, footer, Country acknowledgement)
3. **Home page** — hero + about text + nav cards using `<wa-card>` in `wa-grid`
4. **Cases index** — list of published cases as `<wa-card>` grid
5. **Case detail** — the big one; rich record with `<wa-details>` accordions, `<wa-callout>` findings, `<wa-tab-group>` for related content
6. **Locations, Events, People** — simpler; follow same pattern as cases
7. **Map** — Leaflet, largely custom; port from `site-v1/src/pages/map.astro`
8. **Styling pass** — brand colour, typography, content-type colours

---

## Reference files

- Old layout: `site-v1/src/layouts/Base.astro`
- Old home page: `site-v1/src/pages/index.astro`
- Old case detail: `site-v1/src/pages/cases/[slug].astro`
- Old content config: `site-v1/src/content/config.ts` ← doesn't exist yet, check `site-v1/src/`
- QA card script: `scripts/qa-card.py`
- Case entry skill: `~/.openclaw/workspace/skills/sackar-atlas-case-entry/SKILL.md`
- WA setup skill: check `skill_workshop(action=list)` for `sackar-atlas-wa-setup`

---

## What to say in the new session

> "Sackar Atlas redesign — new WA site. Read REDESIGN-BRIEF.md in ~/code/sackar-atlas/ first, then let's start with [step]."

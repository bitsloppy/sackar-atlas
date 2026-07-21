# Sackar Atlas — Design System

*Last updated: 2026-07-20*

This doc covers the two reusable visual conventions that can be dropped into any detail page:
section accordion cards and suburb view maps. Both are schema-driven and pull from the
central icon registry at `site/src/lib/icons.ts`.

---

## 1. Section Accordion Cards

### What they are

Each section of a detail page's narrative body is wrapped in an expandable card — a
`<details>/<summary>` element with a typed icon in the header. Zero JS required; the
accordion is native HTML. Icon and colour are driven by the section `type`.

### How to use them — location pages

Add a `sections:` block to the location's frontmatter (e.g. `shelley-headland.md`).
Each entry maps a heading to a section type.

```yaml
sections:
  - heading: "The beat"          # must match the h2 text exactly (case-sensitive)
    type: beat
    open: true                   # start expanded? default false
  - heading: "Deaths at this site"
    type: deaths
    open: true
  - heading: "First Nations Country"
    type: first-nations
    open: false
  - heading: "Proposed memorial"
    type: memorial
    open: false
```

The client-side script in `locations/[slug].astro` finds the h2s in the rendered
markdown, matches them by text, and wraps each one (plus its content) in a styled
`<details>` card with the right icon.

**Headings not listed in `sections[]` are not wrapped** — they render as plain prose.
This is intentional: not every h2 needs to be a card.

### Section types and icons

| `type` | Icon | Colour | Use for |
|---|---|---|---|
| `beat` | `peoplePants` | teal | Beat history, how the site was used |
| `deaths` | `locationDot` | grey | Deaths that occurred at or near this site |
| `first-nations` | `earthOceania` | muted green | Country acknowledgement, Traditional Custodians |
| `memorial` | `candleHolder` | gold | Proposed or existing memorials, markers |
| `investigation` | `magnifyingGlass` | grey | Police investigations, Strike Force activity |
| `legal` | `scaleBalanced` | teal | Coronial findings, prosecutions, law reform |
| `cultural` | `masksTheater` | purple | Cultural history, nightlife, community life |
| `sources` | `newspaper` | dim | Primary source summary, research notes |
| `people` | `peopleGroup` | green | Key individuals connected to this place/case |
| `events` | `handFist` | amber | Historical events connected to this entry |
| `cases` | `locationDot` | grey | Related cases (usually handled by the template) |
| `locations` | `city` | blue | Related locations |
| `general` | `star` | dim | Anything that doesn't fit a specific type |

All types, colours, and icon keys live in `site/src/lib/icons.ts` → `SECTION_TYPE_MAP`.
Edit that file to add new types or adjust colours — the change propagates everywhere.

### Using SectionCard directly in Astro templates

For structured data sections (not rendered markdown), import and use the component:

```astro
---
import SectionCard from '../../components/SectionCard.astro';
---

<SectionCard type="investigation" heading="Police investigation" open={false}>
  <p>Manly Police investigated in 1976...</p>
</SectionCard>
```

This is how to wrap the structured template sections (physical markers, related cases,
sources) in future — the component accepts a `<slot />`.

### Defaults

- `open: false` — sections start collapsed by default. Set `open: true` for content
  that should be visible on load (the most important 1–2 sections per page).
- Headings not in `sections[]` — rendered as plain h2 prose, no card.
- `type: general` — fallback for any heading; uses star icon, dim colour.

---

## 2. Suburb View Maps

### What they are

A small embedded Leaflet map showing one or more Sydney suburbs outlined as polygons,
fetched from the NSW Spatial Portal at build time (same data source as the PAC
jurisdiction maps). Used to give spatial context — "where is this?" — without navigating
away to the full map.

Suburb boundaries come from Geoscape Administrative Boundaries (CC-BY 4.0, no API key).

### How to use them

Drop `<SuburbMap>` into any Astro page. Pass one or more suburb names exactly as they
appear in the NSW Spatial dataset (title case, as shown on street signs).

```astro
---
import SuburbMap from '../../components/SuburbMap.astro';
---

<SuburbMap suburbs={["Manly", "Balgowlah"]} height={300} />
```

Or trigger one by telling Good Buddy: **"whack a suburb view map here"** with the
relevant suburb name(s). I'll add the `<SuburbMap>` component call to the right spot
in the template.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `suburbs` | `string[]` | required | Suburb names (title case) |
| `height` | `number` | `280` | Map height in px |
| `label` | `string` | auto | Accessible aria-label (auto-generated from suburb list) |
| `caption` | `string` | — | Optional caption shown below the map |
| `showPins` | `boolean` | `false` | Overlay location pins from this suburb's location records |

### Where suburb names come from

- Check `l.data.suburb` on any location record — that's the suburb name as stored
- NSW Spatial Portal is queried with `suburbname IN ('MANLY', 'BALGOWLAH')` — the
  component uppercases automatically
- If a suburb has no boundary data (e.g. a historical name no longer in the dataset),
  the map renders without that polygon and logs a warning at build time

### Visual style

- Matches the site's dark CartoDB tile base
- Suburb polygons: steel blue outline (`#4a7faa`), low-opacity fill
- Falls back gracefully if the NSW Spatial API is unavailable at build time (shows
  a text note, no broken map)
- Attribution: Geoscape + OSM/CARTO as per licence

---

## 3. Icon Registry Reference

All icons live at `site/src/lib/icons.ts`. The full set currently available:

| Key | Font Awesome icon | Used for |
|---|---|---|
| `locationDot` | `faLocationDot` | Death sites (case pins), deaths sections |
| `peoplePants` | `faPeoplePants` | Beat locations, beat sections |
| `martiniGlass` | `faMartiniGlass` | Nightlife venues |
| `shieldHalved` | `faShieldHalved` | Police jurisdictions, station pins |
| `building` | `faBuilding` | Institutions |
| `city` | `faCity` | Neighbourhoods |
| `handFist` | `faHandFist` | Activism events, events sections |
| `candleHolder` | `faCandleHolder` | Memorials |
| `sirenOn` | `faSirenOn` | Police action events |
| `scaleBalanced` | `faScaleBalanced` | Legal milestones, coronial findings |
| `magnifyingGlass` | `faMagnifyingGlass` | Investigations, inquiry events |
| `masksTheater` | `faMasksTheater` | Cultural events |
| `landmark` | `faLandmark` | Political events |
| `peopleGroup` | `faPeopleGroup` | Community events, people sections |
| `newspaper` | `faNewspaper` | Media events, sources sections |
| `star` | `faStar` | General / fallback |
| `earthOceania` | `faEarthOceania` | First Nations Country |

### Adding a new icon

1. Find it at [fontawesome.com/search](https://fontawesome.com/search) — check it's in the Pro kit
2. Verify it's installed: `ls site/node_modules/@fortawesome/pro-solid-svg-icons/ | grep fa<Name>`
3. Add to `icons.ts`: import + add to `ICONS` object
4. Add to the relevant map (e.g. `SECTION_TYPE_MAP`) if it needs a section type

---

## 4. Colour Reference — NSW Design System

The NSW Government Design System (MIT licence) is the canonical source for colours on
this site. When adding a new colour, pick from there first.

Full palette: https://designsystem.nsw.gov.au/core/colour/index.html

Both palettes are available in `site/src/lib/tokens.ts` as `NSW_PALETTE` and
`NSW_ABORIGINAL_PALETTE`.

### Which palette to use

| Context | Palette | Notes |
|---|---|---|
| Location/event categories | NSW Gov palette | Draw from the 02 shades for icons/borders on dark bg |
| Data visualisation | NSW Gov palette | 8+ distinct hues from 02 shades — good categorical set |
| First Nations / Country content | Aboriginal palette | Marshland Lime, Billabong Blue, Bushland Green |
| Finding colours (homicide/probable/possible) | Custom (keep) | Deliberately muted; WCAG-checked badge pairs |
| Brand accent, site backgrounds | Custom (keep) | Dark archival theme |

### How the 4-stop ramp works on a dark theme

Each NSW hue has four stops: 01 (darkest) → 04 (lightest).

On this dark-background site:
- **01** — badge/chip background (dark tint of the hue)
- **02** — border, icon, main colour identifier
- **03** — text on a 01 background (check contrast before using)
- **04** — too light; avoid on dark bg

Example — beat (teal):
```
bg:     NSW_PALETTE.teal01  #0B3F47
border: NSW_PALETTE.teal02  #2E808E
text:   NSW_PALETTE.teal03  #8CDBE5   (4.9:1 on teal01 ✓)
```

### Aboriginal palette — usage note

The Aboriginal palette is published for "content relating to Aboriginal audiences or
content." First Nations Country acknowledgments and custodianship sections on this
site qualify. Don't use it as general decoration.

Current site usage:
- `firstNations` section card icon/label → Marshland Lime `#78A146` (6.25:1 on surface ✓)

### Saying "I want something like X"

When you want to add a new badge, map layer, or category colour, reference the NSW
palette by name: "something like NSW teal" or "a green in the legal milestone family".
Look up the exact hex at designsystem.nsw.gov.au, pick the right stop for dark-theme
use (usually 02 for borders/icons), add to `tokens.ts`.

---

## 5. The Central Registry Rule

> **Never** redeclare colours or icon mappings in individual page files.
> Import from `site/src/lib/icons.ts` everywhere.

**For Astro server-side** (templates, components):
```ts
import { ICONS, COLOURS, SECTION_TYPE_MAP } from '../lib/icons';
```

**For Leaflet (client-side JavaScript)**:
```ts
// In the Astro frontmatter:
import { ICONS, COLOURS } from '../lib/icons';
const faIconsJson = JSON.stringify(ICONS);
// Then in the <script define:vars={{ faIconsJson }}> block:
const FA = JSON.parse(faIconsJson);
```

Any new page that needs icons for a Leaflet map follows this pattern — no local
`iconData()` helper, no local colour object.

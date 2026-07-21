# Page Structure Reference

*The canonical section order and names for each page type. Use this to audit
inconsistencies and decide what to change — then ask Good Buddy to implement.*

---

## Quick audit: inconsistencies to resolve

| Issue | Current state | Decision needed |
|---|---|---|
| **Sources section name** | Cases: "Primary sources" · Locations/Events: "Sources" | Pick one |
| **Related items layout** | Cases: one bundled "Related content" section · Locations/Events/People: separate section per type | Pick one |
| **Count in related headings** | "Related cases (N)" has count · "Related events", "Related people" etc. do not | Always show count, or never? |
| **People — no Sources section** | People pages have no Sources block at all | Intentional or missing? |

---

## Section map (all page types)

✅ = present | — = not present | ⚠️ = present but name/style differs from others

| Section | Cases | Locations | Events | People |
|---|---|---|---|---|
| Stub warning | ✅ | ✅ | ✅ | ✅ |
| Content warning | ✅ | — | — | ✅ (victims only) |
| Header (name, badges) | ✅ | ✅ | ✅ | ✅ |
| Key facts grid | ✅ | ✅ | — | ✅ |
| SCOI finding blockquote | ✅ | — | — | — |
| Acknowledgement of Country | — | ✅ (all) | — | — |
| PAC jurisdiction map | — | ✅ (PAC type only) | — | — |
| Narrative body (h2s → accordions) | ✅ | ✅ | ✅ | ✅ |
| Official determinations | ✅ | — | — | — |
| Police investigations | ✅ | — | — | — |
| Physical markers | — | ✅ | — | — |
| Related cases | ⚠️ bundled | ✅ separate | ✅ separate | ✅ separate |
| Related events | ⚠️ bundled | ✅ separate | — | ✅ separate |
| Related people | ⚠️ bundled | ✅ separate | ✅ separate | ✅ separate |
| Related locations | ⚠️ bundled | ✅ separate | ✅ separate | ✅ separate |
| Sources | ⚠️ "Primary sources" | ✅ "Sources" | ✅ "Sources" | — missing |
| Back link | ✅ | ✅ | ✅ | ✅ |

---

## Cases page — full section order

```
1.  [Stub warning]              — conditional: stub: true
2.  [Content warning]           — always shown
3.  Header                      — name, date, location, SCOI category badge, site status badge
4.  Key facts grid              — born, sexuality, SCOI finding, accountability, police conduct, reward
5.  [SCOI finding blockquote]   — conditional: scoi_finding field present
6.  Narrative body              — markdown content; h2s become accordion SectionCards
    └─ Each h2 maps to a sections[] entry in the data file (type, open/closed)
7.  [Official determinations]   — conditional: manner_findings present; inquests + Parrabell
8.  [Police investigations]     — conditional: police_investigations[] not empty
9.  Sources                     ← currently "Primary sources" — ⚠️ inconsistent
    └─ Sub-sections: SCOI report · Press · Coronial · Archival
10. Related content             ← currently bundled — ⚠️ inconsistent with others
    └─ Sub-sections: Related cases · Related locations · Related people · Related events
11. Back link                   — ← All cases
```

---

## Locations page — full section order

```
1.  [Stub warning]              — conditional: stub: true
2.  Header                      — name, type badge, suburb, region, First Nations country
3.  Key facts grid              — type, suburb, region, country, PAC jurisdiction, active dates
4.  Acknowledgement of Country  — always shown; Country name from data
5.  [PAC jurisdiction map]      — conditional: location_type=police-jurisdiction + suburbs_covered[]
6.  Narrative body              — markdown content; h2s become accordion SectionCards
7.  [Physical markers]          — conditional: physical_markers[] not empty
8.  [Related cases (N)]         — conditional
9.  [Related events]            — conditional
10. [Related people]            — conditional
11. [Related locations]         — conditional
12. Sources                     — always shown (may be sparse for stubs)
13. Back link                   — ← All locations
```

---

## Events page — full section order

```
1.  [Stub warning]              — conditional: stub: true
2.  Header                      — title, date, type badge
3.  Narrative body              — markdown content
4.  [Related cases (N)]         — conditional
5.  [Related people]            — conditional
6.  [Related locations]         — conditional
7.  Sources                     — always shown
8.  Back link                   — ← All events
```

Note: Events has no key facts grid and no related events (events don't link to other events).

---

## People page — full section order

```
1.  [Stub warning]              — conditional: stub: true
2.  [Content warning]           — conditional: person is a victim
3.  Header                      — name, role badge, dates
4.  Key facts grid              — role, born/died, affiliation, tenure etc.
5.  Narrative body              — markdown content
6.  [Related cases (N)]         — conditional
7.  [Related events]            — conditional
8.  [Related locations]         — conditional
9.  [Related people]            — conditional
10. Sources                     ← currently MISSING — ⚠️
11. Back link                   — ← All people
```

---

## How to request changes

To change a section name, reorder sections, or add a missing section, tell Good Buddy:
- **"Rename X to Y on [page type]"** — changes the `heading=` prop in the template
- **"Move Sources above Related on all pages"** — reorders SectionCard blocks
- **"Add Sources section to People pages"** — adds the block (needs schema + data thought first)
- **"Unify Related — use separate sections on Cases too"** — aligns Cases with the other 3 pages

To add a new section type to the icon registry, see `site/src/lib/icons.ts` →
`SECTION_TYPE_MAP`. Each type has an icon, colour, and display name.

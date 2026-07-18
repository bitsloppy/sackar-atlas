# Cross-Reference Pass

> **This pass is now embedded in the case entry workflow.**
> See `docs/workflow-case-entry.md` — Step 2D covers stub creation as part of drafting.
> The checklist below still applies; use it to verify completeness after drafting.

After each case file is drafted, scan for named entities,
check for existing records, and create stubs for anything new.

The goal is to build the relational graph incrementally. A well-linked dataset is
more useful than a set of isolated case files — locations, people, and sources that
appear across multiple cases become visibly significant.

---

## When to run it

After committing a new case file (or a batch of case files). Takes 15–30 minutes
per case for a thorough pass; can be done as a subagent task.

---

## What to look for

### 1. Locations

Scan the case file and SCOI section for every named place:

| Category | Examples from Mark Stewart |
|---|---|
| Death site | Shelley Headland → `shelley-headland.md` ✅ (created) |
| Last seen / hotel | Hilton Hotel, George Street → **STUB NEEDED** |
| Possible connection | Chevron Hotel, Macleay Street → **STUB NEEDED** |
| Beat (if distinct from death site) | — |
| Police station | Manly Police → `northern-beaches-pac.md` ✅ |
| Court / morgue | City Morgue, Glebe → **STUB NEEDED** (appears across many cases) |

For each: check `data/sydney/locations/` → create stub if absent.

**Stub minimum fields:**
```yaml
name: "..."
location_type: hotel   # or pub / headland / etc.
location_roles: [...]
suburb: "..."
location_region: ...
still_exists: true/false
stub: true
related_cases:
  - case-slug
sources:
  scoi:
    volume: 2
    paragraph: "5.xxx"
```

### 2. People (non-victims)

Named individuals in the case who don't yet have people records:

| Category | Examples from Mark Stewart |
|---|---|
| Original investigating officer | Senior Constable Keith Thoms → **STUB NEEDED** |
| Coroner | City Coroner John Goldrick → **STUB NEEDED** |
| Expert witness | Dr Linda Iles (forensic pathologist) → **STUB NEEDED** |
| Witness (named) | Patricia Cupitt (Hilton Hotel receptionist) → probably not needed |
| Family (named) | John Spanswick (father) → probably not needed |
| Perpetrators | None identified in this case |

Threshold question: **does this person appear in, or are they likely to appear in, multiple cases?** If yes → stub. If one-off witness unlikely to recur → skip.

- Coroners and police officers almost always recur → stub
- Expert witnesses (pathologists, historians) often recur → stub
- Hotel receptionists, fishermen who found bodies → skip

**Stub minimum fields:**
```yaml
name: "..."
role: police   # or legal / community / etc.
institutional_role: "Senior Constable"
institution: "NSW Police Force"
tenure_start: "1975"   # approximate
stub: true
related_cases:
  - case-slug
```

### 3. Press sources → Trove backfill

Any press source entered as `trove_id: null` → add to `resources/trove-todo.md`.

See that file for the current backlog and instructions.

### 4. Cross-case connections

After entering several cases, look for:

- **Shared locations** — multiple deaths at the same beat or venue
- **Shared investigators** — same officer investigated multiple cases (significant)
- **Shared perpetrator groups** — "Bondi Boys", named gangs across cases
- **Temporal clusters** — multiple deaths in the same suburb within 12 months
- **Jurisdiction clusters** — all the Eastern Suburbs PAC cases together

When you spot a cluster, add cross-links:
- Add the new case to `related_cases[]` on the location/person record
- Add the location/person to `related_locations[]` / `related_people[]` on the case

### 5. Source material stubs

If the case references a known published source not yet in `source-collections/`:
- Academic paper, documentary, podcast episode → check if a `source-collections/` record exists
- If not, create a stub

---

## Output checklist per case

```
[ ] Death site → location record exists or stub created
[ ] Last seen location → location record exists or stub created
[ ] Named venues / connecting places → stubs created
[ ] OIC → people record exists or stub created
[ ] Coroner → people record exists or stub created
[ ] Expert witnesses (if recurring) → people record exists or stub created
[ ] Press sources → added to trove-todo.md
[ ] Cross-case links checked → existing records updated if applicable
[ ] Source collections → any new sources flagged
```

---

## Stub conventions

- Set `stub: true` in frontmatter — this is machine-readable and drives site rendering
- Body text: one or two sentences max — just enough to explain why this record exists
  and what research is needed. Don't pad stubs.
- Tags: always include `stub` in the tags array as well (for human scanning)
- Do not leave stubs with blank bodies — even a single line like
  *"Stub — appears in the Mark Stewart case (1976). Research needed."* is better than nothing.

---

## Stub → full record

When a stub gets fleshed out:
- Set `stub: false`
- Remove `stub` from tags array
- Fill in sources, body, relationships
- Run the cross-reference pass again (a richer record may surface new links)

---

## Who runs this

Either Anna or a subagent. Good task for a Haiku subagent with the case file and
SCOI text section as context: extract named entities, check existing records,
draft stubs. Anna reviews and commits.

Prompt template for subagent:
> "Cross-reference pass for [case slug]. The case file is at data/sydney/cases/[slug].md.
> The SCOI section is Vol 2 Ch 5 paras [x]–[y]. Extract all named locations and
> non-victim people. Check data/sydney/locations/ and data/sydney/people/ for
> existing records. Draft stub files for any missing. List press sources to add to
> trove-todo.md. Do not create records for one-off witnesses unlikely to recur."

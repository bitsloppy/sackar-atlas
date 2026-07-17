# Adding Sources to the Project

Two kinds of source to track:

| Type | What it is | Where it goes |
|---|---|---|
| **Repository / archive** | An organisation that *holds* a collection (PHG, AQuA, State Library) | `data/sydney/source-collections/<id>.md` + REFERENCES.md |
| **Reading item** | A specific book, article, report, exhibition, website to read/use | `data/reading-list.md` |

These are not mutually exclusive — an oral history repository might also produce books, in which case the org goes in source-collections and its books go in the reading list.

---

## Workflow A — New repository or archive

Use this when you've found an organisation that *holds materials* relevant to the project (oral history collections, archival records, photographs, institutional records, etc.).

### Steps

1. **Fetch their access/conditions page** — look for: who holds copyright, what you can use freely, what requires permission or notification, what their citation format is.

2. **Check whether they're already in the schema** — `site/src/content/config.ts` has an `institution` enum in `ArchiveSource`. If they're listed there but don't have a source-collections entry yet, they need one.

3. **Create `data/sydney/source-collections/<slug>.md`** with this frontmatter:

```yaml
---
name: Full institutional name
short_name: Common abbreviation
url: https://...
conditions_url: https://... (their access/conditions page)
contact_url: https://... (contact or permissions page)

license_type: # one of:
  # open-cc-by | open-cc-by-sa | open-cc-by-nc | open-public-domain
  # restricted-research | restricted-permission | copyright-all-rights
  # government-open | item-dependent | unknown

conditions_summary: >
  Plain English summary for researchers. Rendered on the site.

conditions_verbatim: >
  Exact verbatim text from their conditions page (quote it in full).

requires_permission_for_publication: true/false
requires_notification_before_publication: true/false

# Reciprocal obligations: what you owe BACK to the archive in return for access.
# e.g. deposit a copy of completed work, acknowledge in publications.
# Leave blank if none beyond standard copyright responsibility.
researcher_obligations: >
  Describe any obligations here.

# Only needed if they use a non-AGSM citation format:
citation_format_override: "[tokens] showing their required format"
citation_example: "Concrete example using real-looking data"

our_permission_status: not-sought  # start here; update as contact progresses
planned_use: >
  What we intend to use from this collection.
our_notes: >
  Any caveats, access restrictions, notes on the collection.

tags: []
---

Prose description of the collection and its relevance to the project.
```

4. **Add to REFERENCES.md** under the "Source collections" section, AGSM format:

```
Organisation (Year) *Collection Name*, Institution website, accessed Day Month Year.
*[Conditions summary. Status: not yet contacted / permission granted / etc.]*
```

5. **Update `site/src/content/config.ts`** — if the institution isn't in the `ArchiveSource.institution` enum yet, add it.

6. **Commit and push.**

---

## Workflow B — New reading item

Use this when you've found a specific book, article, report, exhibition, or website you want to read and potentially use as a source.

### Steps

1. **Add an entry to `data/reading-list.md`** in the appropriate section. Minimum required:
   - Title and author
   - Year (if known)
   - URL (if online)
   - Where you found it (`found_via`)
   - Why it's relevant (`relevance`)

   Template:
   ```markdown
   ### Title
   - **Author:** Last, First
   - **Year:** YYYY
   - **Type:** book / article / report / exhibition / website
   - **URL:** https://...
   - **Found via:** e.g. PHG reading list, 2026-07-18
   - **Status:** to-read
   - **Relevance:** One or two sentences on why this matters to the project.
   ```

2. **If the item has been read and is useful**, update `status` to `read` and add a `notes` field with key takeaways.

3. **When a reading item becomes a source in a data file**, update `status` to `incorporated` and add a note pointing to where it's cited.

4. **If reading the item surfaces a new repository** (e.g. a book mentions an archive), loop back to Workflow A.

---

## Quick reference — license types

| `license_type` value | What it means |
|---|---|
| `open-cc-by` | Creative Commons Attribution — use freely, credit the source |
| `open-cc-by-sa` | CC Attribution ShareAlike — use freely, same licence on derivatives |
| `open-cc-by-nc` | CC Attribution NonCommercial — free for non-commercial use |
| `open-public-domain` | Public domain / no known rights — use freely |
| `restricted-research` | Personal and research use only; publication requires permission |
| `restricted-permission` | All use requires explicit permission |
| `copyright-all-rights` | Full © All Rights Reserved |
| `government-open` | Government open data (APS Open Access Policy) |
| `item-dependent` | Conditions vary per item — depends on age, donor agreement, etc. Check the catalogue record for each item before use |
| `unknown` | Conditions unclear or not publicly stated — investigate before using |

---

## Quick reference — permission status workflow

```
not-sought → contact-made → permission-granted
                          → permission-denied
                          → under-negotiation
not-applicable  (open license — no permission needed)
```

Update `our_permission_status` in the source-collections file whenever the relationship progresses.

---

## Citation format note

Most sources use AGSM author-date. Some repositories mandate their own format — when `citation_format_override` is set in their source-collections file, always use that instead of AGSM for items from that collection. The Pride History Group is the current example.

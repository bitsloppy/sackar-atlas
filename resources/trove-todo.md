# Trove Press Source Backfill

Press sources that have been entered with `trove_id: null` and need Trove IDs
(or confirmation they're not on Trove / available elsewhere).

Work through these systematically at [trove.nla.gov.au](https://trove.nla.gov.au).
- Search by publication + date + keywords from the title
- Once found, add the Trove persistent ID (the number in the URL after `/article/`)
  and the full URL to the relevant data file
- Mark the row `done` when complete

---

## How to update a source once found

In the relevant `.md` file, replace:
```yaml
trove_id: null
url: null
```
with:
```yaml
trove_id: "123456789"
url: "https://trove.nla.gov.au/newspaper/article/123456789"
accessed_date: "YYYY-MM-DD"
```

If the article is **not** on Trove but is available elsewhere (library microfilm,
digitised archive, etc.), replace:
```yaml
trove_id: null
url: null
```
with:
```yaml
trove_id: null
url: "https://..."     # if directly accessible
held_by: "Mitchell Library / State Library NSW / ..."
```

---

## Outstanding stubs

### Ross Warren (1989)

| Status | Publication | Date | Title | Page | Notes |
|--------|------------|------|-------|------|-------|
| ☐ | The Daily Telegraph | 1989-07-26 | "Murder Fears for TV Weatherman" | — | Rod Mori byline; first public report on Warren's disappearance; cited in SCOI as Exhibit 2, Tab 61 (SCOI.76851) |

**Priority:** Only known contemporary press source for Ross Warren. Likely on Trove; search 'Ross Warren' + 'WIN4' or 'Marks Park' + July 1989, Daily Telegraph.

---


### cases/david-lloyd-williams.md

| Status | Publication | Date | Title | Page | Notes |
|--------|------------|------|-------|------|-------|
| ☐ | The Manly Daily | 1978-08-25 | "Cliff Death Fall" | 1 | First report; describes cliff as south-eastern point of North Head, ~300ft; white VW with keys in ignition; Robert Steele found body while looking for fishing spot |
| ☐ | The Manly Daily | 1978-08-26 | "Victim named" | 1 | Second report; identifies the deceased |

---

### cases/paul-rath.md

| Status | Publication | Date | Title | Page | Notes |
|--------|------------|------|-------|------|-------|
| ☐ | The Manly Daily | 1977-06-17 | "Man, 27, Dies in Cliff Plunge" | 1 | First report; same Fairy Bower location as Mark Stewart |

---

### cases/mark-stewart.md

| Status | Publication | Date | Title | Page | Notes |
|--------|------------|------|-------|------|-------|
| ☐ | The Manly Daily | 1976-05-12 | "Mystery boy dies in cliff plunge" | 1 | First report; body unidentified |
| ☐ | The Manly Daily | 1976-05-13 | "Body not identified" | — | Photographs/fingerprints to be circulated |
| ☐ | The Manly Daily | 1976-05-14 | "No clue to dead youth" | — | Fell from "50m cliff at 8am" speculation |
| ☐ | The Manly Daily | 1976-05-18 | "Cliff body identified" | 1 | "Staying at a Kings Cross hotel" — significant |
| ☐ | Sydney Morning Herald | 1976-05-12 | "Body found" | 14 | Described as "boy aged about 15" |

**Priority:** The 1976-05-18 Manly Daily article is significant — it records police telling the press that Mark was "staying at a Kings Cross hotel" (i.e., the Chevron, in Potts Point / Kings Cross), which is a key piece of the Hilton/Chevron evidentiary question. Worth finding first.

### locations/chevron-hotel.md

| Status | Publication | Date | Title | Page | Notes |
|--------|------------|------|-------|------|-------|
| ☐ | The Bulletin | 1965-02-20 | "Chevron Hotel advertisement" | — | Documents change from 'Chevron Hilton' to 'Chevron Hotel' branding |
| ☐ | The Bulletin | 1965-09-11 | "Chevron Hotel advertisement" | — | Second ad confirming rebrand |

---

### locations/shelley-headland.md

| Status | Publication | Date | Title | Page | Notes |
|--------|------------|------|-------|------|-------|
| ☐ | The Manly Daily | 1976-05-12 | "Mystery boy dies in cliff plunge" | 1 | Shared with case above |
| ☐ | The Manly Daily | 1977-04-27 | "90 arrested by new police beach unit" | 1 | "Busted homosexual activities at North Head" — documents beat awareness |

**Priority:** The April 1977 beach patrol article is historically significant — it's contemporaneous evidence that Manly Police knew about the North Head beat within 12 months of Mark Stewart's death.

---

## Completed

*(Move rows here when done, with Trove ID)*

| Source file | Publication | Date | Title | Trove ID | Completed |
|-------------|------------|------|-------|----------|-----------|
| — | — | — | — | — | — |

---

## Notes

- **Manly Daily** digitisation coverage on Trove: check what years are available.
  The paper ran from 1906 onward; 1970s coverage may be partial.
- **SMH** 1976 is likely on Trove (Fairfax papers have good historical coverage).
- When searching Manly Daily: try "Fairy Bower" or "cliff" + May 1976 as keywords.
- SCOI exhibit references (e.g. `SCOI.82452`) are the inquiry's internal exhibit numbers,
  not Trove IDs — they can't be searched on Trove directly.
- The SCOI cited the 18 May 1976 Manly Daily as SCOI.82454 — this is the exhibit number
  in the inquiry record, confirming the article exists.

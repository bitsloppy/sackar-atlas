# testimonies/

A catch-all for **primary source content** — any record where a real person
speaks in their own voice, formally documented, with a traceable provenance chain.

## What belongs here

| Source type | Examples |
|---|---|
| `parliamentary-submission` | Written submissions to Report 58, interim report |
| `parliamentary-evidence` | Oral evidence at parliamentary hearings |
| `scoi-submission` | Written submissions to the Sackar Inquiry (2023) |
| `scoi-evidence` | Oral evidence at SCOI hearings |
| `coronial-testimony` | Sworn evidence at coronial inquests (inquest into Scott Johnson etc.) |
| `oral-history` | PHG recordings, AQuA interviews, City of Sydney oral histories |
| `documentary-interview` | On-camera interviews for Deep Water (SBS), Four Corners etc. |
| `media-interview` | Press and broadcast interviews with survivors, families, advocates |
| `memoir` | Published memoir or autobiography passages |
| `letter` | Letters to newspapers, open letters, public correspondence |

## Key distinction from cases/

The `cases/` collection records **individual incidents** (deaths, missing persons,
assaults). A testimony record holds a **person's full account** — which may span
multiple incidents across years, document institutional responses, and capture
ongoing impact.

One person can have three attacks across twenty years → one testimony record,
three `incidents[]` entries. (See `stewart-south.md`.)

## The stub record pattern

The `access_status` field supports **stub records** for oral histories and other
held material we know exists but cannot yet access:

```yaml
access_status: held-restricted   # or held-public, permission-required
collection_id: pride-history-group
held_by: Pride History Group
audio_url: null                   # not yet accessible
transcript_url: null
source_reference: null            # fill in when we've accessed it
```

Stub records are genuinely useful before permission is obtained:

- They **map the oral evidence landscape** — which cases have testimony somewhere?
- They link cases to evidence that EXISTS even if it is not yet accessible
- They provide a concrete agenda for institutional contact conversations
  ("we've already identified these interviews as relevant to our cases")
- When permission is granted, the stub becomes a full record

See `phg-stub-template.md` for a worked example of the PHG holdings placeholder.

## Access status model

| Status | Meaning |
|---|---|
| `public` | Freely accessible online — cite and quote freely (with attribution) |
| `held-public` | Held by institution; accessible on-site or by standard request |
| `held-restricted` | Held but requires permission from institution to access |
| `permission-required` | Accessible, but explicit permission needed to cite/publish |
| `inaccessible` | Known to exist; currently not accessible by any route |
| `unknown` | Access status not yet determined |

## Attribution

Every testimony must be attributed. The `source_reference` field uses AGSM
author-date format with the most precise citation available:

```
# Parliamentary submission:
South S (2021) Submission 31, in NSW Legislative Council Standing Committee
on Social Issues, Gay and Transgender hate crimes between 1970 and 2010,
Report 58, NSW Parliament, Sydney, May 2021, pp 12–13.

# PHG oral history (once accessed):
[Subject surname] [Initials] ([year of interview]) [Interview title if any]
[interview recording/transcript], Pride History Group, Sydney,
accessed [date].
```

For stub records where the item has not yet been accessed, `source_reference`
may be omitted until the interview is identified and obtained.

## Current records

| File | Person | Type | Access | Period |
|------|--------|------|--------|--------|
| `stewart-south.md` | Mr Stewart South | parliamentary-submission | public | late 1970s–mid-1990s |
| `witness-a.md` | Witness A (name suppressed) | parliamentary-evidence | public | early 1990s |
| `knight-family.md` | Robert Knight & Robyn Conlan | parliamentary-submission | public | 2005–2020 |
| `phg-stub-template.md` | [PHG holdings placeholder] | oral-history | held-restricted | TBC |

## Future additions

**Priority oral history contacts:**
- Pride History Group — 100+ Sydney recordings; first contact for beats era testimony
- AQuA (Australian Queer Archives) — national collection
- City of Sydney Oral Histories — community interviews

**SCOI primary sources (2023):**
- Family evidence submitted to the Sackar Inquiry
- Community and survivor submissions
- SCOI hearing transcripts for publicly identified witnesses

**Documentary/media:**
- Deep Water (SBS) — on-camera interviews with survivors and families
- Four Corners coverage — interviews from the 1990s–2000s
- Rick Feneley's SMH investigation (2013 series) — interviews with survivors

**Coronial testimony:**
- Evidence given at the three Scott Johnson inquests (1989, 2012, 2017)
- Evidence at the inquest into Ross Warren and John Russell (Milledge, 2005)

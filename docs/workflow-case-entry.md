# Case Entry Workflow

The single pipeline for adding a victim to the project — from source material
to committed data, with a QA gate before anything is published to GitHub.

---

## Principles

- **Victims are people first.** Every case gets a `people/` record, not just a `cases/` record.
- **Network builds as you go.** Cross-referencing is not a later step — it happens in the same turn as drafting.
- **One human gate.** Anna reviews a QA card before every commit. Nothing goes to `main` without approval.
- **Stubs are first-class citizens.** A stub is better than a broken link. Create them freely.
- **Honest uncertainty.** If we don't know something (sexuality, manner of death, First Nations identity), say so clearly. Never fill a gap with a guess.

---

## The pipeline

```
SCOI text → RESEARCH → DRAFT (case + person + stubs) → QA CARD → Anna reviews → COMMIT
```

### Step 1 — Research

Read the SCOI section for this case. For Category A cases this is always Vol 2, Chapter 5.

```bash
grep -n "[Name]" SCOI-Vol2-text.txt   # find paragraph numbers
# then: read with offset to pull the full section
```

Extract:
- Key biographical facts (born, age, nationality, background)
- Movements prior to death (last seen, where, when)
- Death location (precise description + beat/location context)
- Post-mortem / cause of death
- Original inquest (coroner, date, finding, verbatim text)
- Parrabell review finding and any errors documented
- SCOI examination steps and Sackar's formal findings
- Police conduct findings
- Sexuality evidence (what was known, what was unknown)
- Named people: OIC, coroner, expert witnesses, family, witnesses
- Named places: death site, last seen, venues, beats, police station
- Press sources cited in footnotes

### Step 2 — Draft (all in one turn)

Write **all of the following simultaneously**:

#### A. `data/sydney/cases/{slug}.md`

Core fields to get right — these are the analytical decisions:

| Field | Decision required |
|---|---|
| `sexuality.confidence` | What evidence exists? Be conservative. |
| `motive_bias_assessment` | What did Sackar actually find, not what we might infer? |
| `killing_location_context` | beat / private-home / gay-social-space / public-space / unknown |
| `police_misconduct_level` | Match exactly to Sackar's graduated findings |
| `accountability_status` | What is the current state, not the historical state |
| `scoi_finding` | Verbatim or close paraphrase of Sackar's formal finding |
| `manner_findings.inquiry_finding` | One of: confirmed-homicide / probable-hate-crime / possible-hate-crime / open / undetermined |

#### B. `data/sydney/people/{slug}.md` — always

Same slug as the case. Key fields:
- `role: victim`
- `born_date` (ISO 8601 if known from coronial/family evidence)
- `died_date` + `died_date_uncertain` (matching case record)
- `sexuality` (same assessment as case, from same evidence)
- Brief biographical narrative in the body

#### C. `data/sydney/locations/{death-site-slug}.md` — always if absent

Death site always gets a location record. Check `data/sydney/locations/` first.
If the location exists (e.g. `shelley-headland.md`): add the new case to its `related_cases[]`.
If not: create it. Minimum: name, location_type, location_roles, suburb, Country, stub: true.

#### D. Stubs — as needed, same turn

For each named entity extracted in Step 1:

**Locations** (create if absent):
- Last-seen location — but **only if not a private residential address**.
  Hotels, boarding houses, shared venues → stub. Private homes → note in narrative only.
- Significant venues (bars, beats distinct from death site)
- Police station (check if PAC record covers it)
- **Institutional/procedural locations** — morgue, hospital, court. These recur across
  nearly every case and are high-value stubs. If `city-morgue-glebe` doesn't exist, create
  it; if it does, add the new case to `related_cases[]`.

**People** (create if absent, only if likely to recur):
- OIC of original investigation → always stub (officers appear in multiple cases)
- Coroner → always stub (coroners appear in multiple cases)
- Expert witnesses (pathologists, historians) → stub if they appear elsewhere
- Named family → skip unless they testified publicly in multiple matters
- One-off witnesses → skip

**Press sources** → add to `resources/trove-todo.md`

**Update existing stubs** → add the new case slug to `related_cases[]` on any location or person that applies

### Step 3 — QA card

Generate the QA card:

```bash
cd ~/code/queer-heritage
python3 scripts/qa-card.py {slug}
```

This produces a structured summary — not the raw YAML — covering:
- Identity and biographical facts
- What happened (2–3 sentences)
- Official findings timeline
- Key analytical decisions with brief reasoning
- Network additions (new stubs, cross-links, forward refs)
- Files written, ready to commit

**Present this card to Anna.** She reviews and either:
- Approves → `git add . && git commit && git push`
- Asks a question → answer, adjust if needed, re-present
- Requests a change → edit file(s), re-run qa-card.py, re-present

### Step 4 — Commit

On Anna's approval, commit with a descriptive message:

```bash
git add data/sydney/cases/{slug}.md \
        data/sydney/people/{slug}.md \
        data/sydney/locations/... \
        [any stubs] \
        resources/trove-todo.md
git commit -m "data: add {Name} — SCOI Category {A/B}, {year}

{2-3 line summary of what's in it and what was created}"
git push
```

Then update two files:

**`CHANGELOG.md`** (repo root) — add an entry under today's date:
```markdown
**[Name]** (SCOI Category [A/B])
- Born [date], [place]. Died [date], age [N].
- Location: [location name].
- Sackar finding: *"[verbatim]"*
- Sexuality: [confidence + brief reason].
- [Any recommendations].
- Source: SCOI Vol 2, Ch 5, paras [x–y], pp [start]–[end].
```
Also note any new location records, people stubs, or schema changes.

**`_project-status.md`** (Obsidian vault) — project-level tracking:
- Move the case from "Next" to "Done"
- Add any new research gaps to the ‘Research gaps’ section
- Keep the priority list current

---

## Network-building rules

These apply to every case, without exception:

| Entity type | Always | If absent create | If present update |
|---|---|---|---|
| Victim people record | ✅ | create | n/a |
| Death site location | ✅ | create stub | add to related_cases[] |
| Last-seen location | ✅ | create stub | add to related_cases[] |
| OIC people record | ✅ | create stub | add to related_cases[] |
| Coroner people record | ✅ | create stub | add to related_cases[] |
| Press sources | ✅ | add to trove-todo.md | — |
| Named venues (beat context) | if significant | create stub | add to related_cases[] |
| Institutional locations (morgue, hospital, court) | always | create stub | add to related_cases[] |
| Expert witnesses | if recurring | create stub | add to related_cases[] |
| Named perpetrators/groups | if documented | create stub | add to related_cases[] |
| Private residential addresses | never | — note in prose only | — |

### Entity threshold question

> Does this person or place appear in more than one case, OR is it inherently significant to the history?

Yes → always create a record or stub.
No → skip (one-off hotel receptionist, single fisherman who found a body).

**Special cases:**
- Private residential addresses → never a location record, even if significant to the case.
  Capture the address in case narrative prose only.
- Institutional procedural locations (morgue, hospital, coroner's court) → always stub,
  even if they appear in only one case so far — they will recur.

### Sexuality assessment rules

The sexuality fields are the most sensitive analytical decisions. Apply consistently:

| Evidence level | `confidence` value |
|---|---|
| Self-identified publicly, or confirmed by close family/community (recent, direct) | `confirmed` |
| Self-identified to family, relayed via statement with significant time elapsed — use Sackar's own framing | `probable` |
| Frequented known gay venues; found at beat; coroner/SCOI notes probable | `probable` |
| Present at beat OR one ambiguous factor | `possible` |
| Nothing | `unknown` |

Never infer sexuality from gender nonconformity, body type, occupation, or family estrangement alone.
If Sackar said "cannot be determined" → `unknown`.
If Sackar said "reason to suspect" without establishing it → `possible` at most.

**Third-party recall with time elapsed:** Where a family member relays a person's self-identification
but the statement was made decades later (e.g. Rath: Gregory's 2023 recall of a c.1976 conversation),
follow Sackar's own framing. If he used cautious language ("raises the possibility"), use `probable`
not `confirmed`, and capture the nuance in `display_note`.

### Police misconduct levels — apply Sackar's own tiering

| Level | Sackar's framing | Examples |
|---|---|---|
| `inadequate-investigation` | Era-level systemic failure; no individual criticism | Mark Stewart (1976) |
| `bias-affected` | Conscious or unconscious bias found | — |
| `active-misconduct` | Specific identified officer conduct | Scott Johnson (Young/Lateline; Willing) |
| `institutional-misconduct` | Coordinated institutional bad faith | Neiwand cases (Warren, Russell, Mattaini) |

---

## QA checklist (Anna's review)

When reviewing the QA card, check:

- [ ] Name is correct (preferred name, not dead name or record name)
- [ ] `sexuality.confidence` — does the reasoning match the evidence?
- [ ] `motive_bias_assessment` — does this match Sackar's actual finding?
- [ ] `manner_findings.inquiry_finding` — correct enum value?
- [ ] `police_misconduct_level` — is this Sackar's finding or our inference?
- [ ] `scoi_finding` — verbatim or close paraphrase? No editorialising?
- [ ] Death site location record exists and is linked
- [ ] Victim people record exists
- [ ] `born_date` populated if known — if SCOI text contains an apparent transcription
  error (e.g. a birth year that makes no sense given age at death), use the corrected value
  but add an inline YAML comment explaining the discrepancy and **flag it as a research gap**
  in `_project-status.md` for verification against the primary source (death certificate, BDM record)
- [ ] First Nations fields on all new location records are honest (`null` if unknown)
- [ ] No speculation presented as fact anywhere
- [ ] Any sensitive representation issues (sexuality, mental health, family privacy) flagged
  as `community_verification_status: not-assessed` on the relevant records, and added as
  a research gap in `_project-status.md` if verification is needed before publication

---

## Case priority order

Entered so far:
- [x] Mark Stewart (1976, Shelley Headland, Manly)
- [x] Paul Rath (1977, Shelley Headland, Manly) — Recommendation 1 (fresh inquest)

Recommended next (based on source readiness and cross-reference density):
1. **David Lloyd-Williams** (1978) — North Head; next in SCOI Ch 5 sequence; connects
   Manly cluster geographically
2. **Ross Warren** (1989) — most-referenced case in sources; 5+ sources waiting;
   marks-park.md already exists
3. **Scott Johnson** (1988) — most prominent case; Bondi Badlands ep. 5 + Deep Water;
   north-head.md already exists
4. **John Russell** (1989) — linked to Warren; same Marks Park geography
5. **Raymond Keam** (1987) — one of the few with a subsequent arrest (Stan Early, 2021)
6. **Crispin Dye** (1993) — forensic breakthrough (DNA match 30 years later)
7. **Ernest Head** (1976) — same year as Stewart; POI identified

Bulk entry (after 5–6 individual cases to prove the pattern):
- Remaining Category A cases (SCOI Vol 2, Chapter 5)
- Category B cases (SCOI Vol 2, Chapter 6)

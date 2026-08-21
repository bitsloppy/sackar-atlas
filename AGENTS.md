# Sackar Atlas — AGENTS.md

Build operations guide for AI agents working on this project.
This is an internal doc. For external researchers and data consumers, see `docs/ai-instructions.md`.

---

## ⚠️ Current phase: Phase 1 — Complete the corpus

**Do not enter new case data. Do not edit case YAML. Do not run AI extraction.**

Phase 5 (AI extraction + data migration) has not started. Work is only permitted within the
scope of the current phase — see the Build Plan table below.

**Update this block when the phase changes.**

---

## What this project is

A public data project making the NSW Special Commission of Inquiry into LGBTIQ Hate Crimes
(SCOI, Commissioner: Justice John Sackar AO KC, 2023) navigable as structured, cross-linked data.
Journalistic synthesis of public records: SCOI report, Hansard, coronial records, Parrabell Final
Report, PAC data, Trove press archives.

Out of scope: oral history (community to lead), advocacy, representing the LGBTIQ community's voice.

- **Repo:** `~/code/sackar-atlas` → https://github.com/bitsloppy/sackar-atlas
- **Live site:** https://sackar-atlas.bitsloppy.com
- **Vault:** `/Users/anna/Obsidian/Lab/Projects/sackar-atlas/`
- **Git identity:** always use Bit Sloppy / hello@bitsloppy.com (local repo config already set)

---

## Agent roles

| Agent | Role | Active phase |
|---|---|---|
| Good Buddy 🦉 | Orchestration, site code, planning, memory | All phases |
| Spider 🕷️ | AI extraction + case entry pipeline | **Phase 5+ only** |
| Web Ninja 🥷 | Images, Zotero source records, attribution | As needed |

**Before starting any work:** read this file and check `_plan.md` in the vault to confirm the
current phase and what's in scope. If you're Spider, stop here if the current phase is not 5+.

---

## Architecture (summary)

Three layers. See `docs/ai-instructions.md` for the full public schema and cross-referencing reference.

```
CORPUS  (sources/)
  Primary source documents with permanent paragraph IDs.
  e.g. SCOI-V2-CAT-A-mark-stewart#5.102
  Served as a navigable document library at /sources/[slug]/
         ↕  field-level citations
DERIVED DATA  (data/)
  YAML records: every finding field carries { value: ..., ref: [slug]#[anchor] }
  AI-generated from corpus; Anna audits every record before publishing.
         ↕
SITE UI  (site/)
  Corpus reader + reference overlay (wa-dialog) + cross-links.
  Clicking a ref shows the source paragraph in context, one click from full reader.
```

**The trust model:** the corpus is the authority. Every factual claim in the derived data cites
the exact corpus paragraph it came from. Readers can verify any claim in one click.

---

## Build plan

| Phase | Task | Status |
|---|---|---|
| **1** | Complete the corpus (para IDs on PFR, R58, IPTJ) | 🔄 In progress |
| 2 | Schema redesign (update `config.ts` + document extraction prompt) | ⬜ Not started |
| 3 | Site architecture (corpus reader + reference overlay) | ⬜ Not started |
| 4 | Cross-links (remark/rehype plugin) | ⬜ Not started |
| 5 | Data migration (AI extraction — re-extract 11 + new cases) | ⬜ Not started |
| 6 | Editorial layer + launch | ⬜ Not started |

See `_plan.md` in the vault for full phase detail.

**Do not skip phases.** The corpus reader must exist before case data entry resumes —
data without auditable references defeats the purpose of this project.

---

## Key invariants (never break these)

1. **Every finding field has a `ref`.** Identity/admin fields (name, slug, published) are exempt. Everything else must cite a corpus paragraph.
2. **One human gate.** Anna reviews every record before anything is committed to `main`.
3. **Corpus files are read-only during case work.** Don't edit `sources/` unless you're doing corpus build work (Phase 1).
4. **Slugs are permanent.** Once used in a cross-reference or published URL, a slug cannot change.
5. **First Nations Country is primary geographic identity.** `first_nations_country` is required on all location records.
6. **Uncertainty must be expressed precisely.** Never collapse source hierarchy levels. An AI inference is not a finding.
7. **Git identity.** Always commit as Bit Sloppy / hello@bitsloppy.com.

---

## Key file paths

| Resource | Path |
|---|---|
| Repo root | `~/code/sackar-atlas/` |
| Corpus | `sources/` (repo root) |
| Paragraph ID registry | `sources/PARA-ID-REGISTRY.md` |
| Cases | `data/cases/` |
| Locations | `data/locations/` |
| Events | `data/events/` |
| People | `data/people/` |
| Site code | `site/` |
| Content schema | `site/src/content/config.ts` |
| Public AI instructions | `docs/ai-instructions.md` |
| Source doc workflow | `docs/workflow-source-documents.md` |
| AI extraction workflow | `docs/workflow-corpus-extraction.md` *(to be written — Phase 2)* |
| Case entry skill (Spider) | `~/.openclaw/workspace/skills/sackar-atlas-case-entry/SKILL.md` |
| Project plan (full phases) | `/Users/anna/Obsidian/Lab/Projects/sackar-atlas/_plan.md` |
| Project status (session log) | `/Users/anna/Obsidian/Lab/Projects/sackar-atlas/_project-status.md` |
| SCOI text files | `/Users/anna/Obsidian/Lab/Projects/sackar-atlas/SCOI-Vol{1,2,3}-text.txt` |

SCOI text files: always grep the `.txt` files, not the PDFs.
`grep -n "[name]" SCOI-Vol2-text.txt` then `read` with offset. Vol 2 = Category A/B deaths.

---

## Data state

### Entered (11 cases — old schema, no field-level refs, all need re-extraction in Phase 5)

| Victim | Year | Location | Category | Notes |
|---|---|---|---|---|
| Mark Stewart | 1976 | Shelley Headland | A | |
| Paul Rath | 1977 | Shelley Headland | A | held |
| David Lloyd-Williams | 1978 | North Head | A | excluded |
| Gilles Mattaini | 1985 | Marks Park | A | |
| Ernest Head | 1976 | Summer Hill | B | |
| Bill Rooney | 1986 | Crown Lane, Wollongong | A | |
| Raymond Keam | 1987 | Alison Park, Randwick | A | convicted |
| Scott Johnson | 1988 | North Head | — | Vol 3, convicted |
| Ross Warren | 1989 | Marks Park | A | |
| John Russell | 1989 | Marks Park | A | |
| Crispin Dye | 1993 | Darlinghurst | A | |

### Next (Phase 5, after extraction workflow is built)

Re-extract all 11 (pilot: Mark Stewart first) → then:
Graham Paynter (1989) · James Meek (1995) · Kenneth Brennan (1995) · Carl Stockton (1996)

---

## Corpus status (Phase 1 checklist)

- ✅ SCOI Vols 1, 2, 3, Annexures — paragraph IDs applied
- ✅ 28 SCOI Vol 2 case sections chunked (`sources/SCOI-V2-CAT-*.md`)
- ✅ `PARA-ID-REGISTRY.md` — namespace documented
- ❌ Parrabell Final Report — paragraph IDs not yet applied
- ❌ Report 58 (NSW Parliament) — paragraph IDs not yet applied
- ❌ In Pursuit of Truth & Justice (ACON/PHG) — paragraph IDs not yet applied

---

*Update the Current Phase block and Build Plan table when phases change.*
*Last updated: 2026-08-21*

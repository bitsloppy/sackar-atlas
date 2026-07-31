#!/usr/bin/env python3
"""
qa-card.py — Generate a human-readable QA review card for a case file.

Usage:
    python3 scripts/qa-card.py <case-slug>
    python3 scripts/qa-card.py mark-stewart

Output: a structured markdown summary for Anna's review, covering identity,
official findings, analytical decisions, sources, and network state.
Does NOT commit anything — read-only diagnostic tool.
"""

import sys
import re
from pathlib import Path

BASE   = Path(__file__).parent.parent
CASES  = BASE / "data/cases"
PEOPLE = BASE / "data/people"
LOCATIONS = BASE / "data/locations"
# Sources are managed in Zotero; the RIS export is the local reference.
ZOTERO_RIS = BASE / "data/sources/zotero-export/sackar-atlas-sources.ris"


# ─── File helpers ──────────────────────────────────────────────────────────────

def read_file(path):
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None


# ─── Frontmatter parsers ───────────────────────────────────────────────────────

def extract_fm(content):
    """Return the raw frontmatter string from a markdown file."""
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    return m.group(1) if m else ""

def clean_val(v):
    """Strip quotes, inline YAML comments, and whitespace from a scalar value."""
    v = v.strip()
    v = re.sub(r'\s+#.*$', '', v)
    v = v.strip().strip('"').strip("'")
    return None if v in ('null', '~', '') else v

def get_scalar(fm, key):
    """Get a simple top-level scalar value from frontmatter text."""
    m = re.search(rf'^{re.escape(key)}:\s*(.+)$', fm, re.MULTILINE)
    return clean_val(m.group(1)) if m else None

def get_list(fm, key):
    """Get a top-level YAML list value."""
    m = re.search(rf'^{re.escape(key)}:\n((?:  - .+\n?)*)', fm, re.MULTILINE)
    if not m:
        return []
    items = []
    for line in m.group(1).strip().split('\n'):
        line = line.strip()
        if line.startswith('- '):
            v = clean_val(line[2:])
            if v:
                items.append(v)
    return items

def get_nested(fm, parent, child):
    """Get a child key within a named parent block (single level)."""
    m = re.search(rf'^{re.escape(parent)}:\n((?:  .+\n?)*)', fm, re.MULTILINE)
    if not m:
        return None
    block = m.group(1)
    cm = re.search(rf'^\s+{re.escape(child)}:\s*(.+)$', block, re.MULTILINE)
    return clean_val(cm.group(1)) if cm else None

def field_present(fm, key):
    """True if the field key appears at the top level in frontmatter."""
    return bool(re.search(rf'^{re.escape(key)}:', fm, re.MULTILINE))

def get_sections_count(fm):
    """Count entries in the sections[] array."""
    m = re.search(r'^sections:\n((?:  - .+\n(?:    .+\n)*)*)', fm, re.MULTILINE)
    if not m:
        return 0
    return len(re.findall(r'^\s+- heading:', m.group(1), re.MULTILINE))

def count_body_h2s(body):
    """Count ## headings in the markdown body."""
    return len(re.findall(r'^## ', body, re.MULTILINE))


# ─── Zotero RIS source count ───────────────────────────────────────────────────

def count_zotero_sources(slug):
    """
    Count source items in the Zotero RIS export that reference this case slug.

    Looks for the slug in:
      - N1 field: "Related cases: slug1, slug2" (pipe-separated metadata block)
      - KW field: "case:slug" (namespaced tag)

    Returns (count, ris_found) where ris_found is False if the export is missing.
    """
    if not ZOTERO_RIS.exists():
        return 0, False

    content = ZOTERO_RIS.read_text(encoding='utf-8')
    # Split into individual records at ER  -
    records = re.split(r'\nER\s+-\s*\n', content)

    count = 0
    for record in records:
        # Check N1 field: "Related cases: slug1, slug2"
        n1_m = re.search(r'^N1\s+-\s+(.+)$', record, re.MULTILINE)
        if n1_m:
            n1_text = n1_m.group(1)
            cases_m = re.search(r'Related cases?:\s*([^|]+)', n1_text, re.IGNORECASE)
            if cases_m:
                linked = [s.strip() for s in cases_m.group(1).split(',')]
                if slug in linked:
                    count += 1
                    continue

        # Check KW fields: "case:slug"
        kw_lines = re.findall(r'^KW\s+-\s+(.+)$', record, re.MULTILINE)
        for kw in kw_lines:
            if kw.strip() == f'case:{slug}':
                count += 1
                break

    return count, True


# ─── Reference checks ─────────────────────────────────────────────────────────

def check_ref(collection_path, slug):
    return (collection_path / f"{slug}.md").exists()

def ref_status(slug, collection_path):
    exists = check_ref(collection_path, slug)
    stub_flag = False
    if exists:
        content = read_file(collection_path / f"{slug}.md")
        if content:
            stub_flag = 'stub: true' in content
    if exists and not stub_flag:
        return f"{slug} ✅"
    elif exists and stub_flag:
        return f"{slug} 🔶 stub"
    else:
        return f"{slug} ❌ missing"


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/qa-card.py <case-slug>")
        sys.exit(1)

    slug = sys.argv[1].lower().strip()
    case_path = CASES / f"{slug}.md"

    if not case_path.exists():
        print(f"❌ Case file not found: {case_path}")
        sys.exit(1)

    content = read_file(case_path)
    fm = extract_fm(content)

    # Pull body text (after second ---)
    body_m = re.match(r'^---\n.*?\n---\n(.*)', content, re.DOTALL)
    body = body_m.group(1).strip() if body_m else ""

    # ── Key fields ────────────────────────────────────────────────────────────
    name         = get_scalar(fm, 'name') or slug
    born_date    = get_scalar(fm, 'born_date')
    born_year    = get_scalar(fm, 'born_year')
    born_place   = get_scalar(fm, 'born_place')
    died_display = get_scalar(fm, 'date_of_death_display') or get_scalar(fm, 'date_of_death')
    age          = get_scalar(fm, 'age_at_death')
    case_outcome = get_scalar(fm, 'case_outcome') or 'death'
    scoi_cat     = get_scalar(fm, 'scoi_category')
    decade       = get_scalar(fm, 'decade')

    location_name = get_scalar(fm, 'location_name')
    location_id   = get_scalar(fm, 'location_id')
    last_seen     = get_scalar(fm, 'last_seen_location')

    sexuality_conf = get_nested(fm, 'sexuality', 'confidence')
    sexuality_note = get_nested(fm, 'sexuality', 'display_note')

    motive        = get_scalar(fm, 'motive_bias_assessment')
    killing_ctx   = get_scalar(fm, 'killing_location_context')
    group_attack  = get_scalar(fm, 'group_attack')
    misconduct    = get_scalar(fm, 'police_misconduct_level')
    misconduct_sum = get_scalar(fm, 'police_misconduct_summary')
    accountability = get_scalar(fm, 'accountability_status')
    apology        = get_scalar(fm, 'nswpf_apology_to_family')
    scoi_finding   = get_scalar(fm, 'scoi_finding')

    judicial_noted = get_scalar(fm, 'judicial_bias_noted')

    inquiry_finding = get_nested(fm, 'manner_findings', 'inquiry_finding')
    site_status     = get_nested(fm, 'manner_findings', 'site_status')
    parrabell       = get_nested(fm, 'manner_findings', 'parrabell_finding')

    related_locations = get_list(fm, 'related_locations')
    related_people_list = get_list(fm, 'related_people')
    related_recommendations = get_list(fm, 'related_recommendations')
    source_lists = get_list(fm, 'source_lists')

    sections_count = get_sections_count(fm)
    body_h2_count  = count_body_h2s(body)

    zotero_count, ris_found = count_zotero_sources(slug)

    # ── Cross-reference state ─────────────────────────────────────────────────
    loc_status = []
    if location_id:
        loc_status.append(ref_status(location_id, LOCATIONS))
    for loc in related_locations:
        if loc != location_id:
            loc_status.append(ref_status(loc, LOCATIONS))

    people_status = [ref_status(slug, PEOPLE)]  # victim record always first
    for p in related_people_list:
        if p != slug:
            people_status.append(ref_status(p, PEOPLE))

    # ── Output ────────────────────────────────────────────────────────────────
    w = []
    def ln(s=""): w.append(s)

    # ── Header ────────────────────────────────────────────────────────────────
    cat_label = f"SCOI Category {scoi_cat}" if scoi_cat else "No SCOI category"
    ln(f"# QA Card — {name}")
    ln(f"*{cat_label} · {decade or '?'} · case_outcome: {case_outcome}*")
    ln()

    # ── Identity ──────────────────────────────────────────────────────────────
    ln("## Identity")
    born_str = born_date or (f"c. {born_year}" if born_year else None)
    if born_str:
        place_str = f' — {born_place}' if born_place else ''
        ln(f"- **Born:** {born_str}{place_str}")
    else:
        ln("- **Born:** *not set*")
    ln(f"- **Died:** {died_display or '(not set)'}{(' · age ' + age) if age else ''}")
    co_b = get_scalar(fm, 'country_of_birth')
    cb   = get_scalar(fm, 'cultural_background')
    if co_b: ln(f"- **Country of birth:** {co_b}")
    if cb:   ln(f"- **Background:** {cb}")
    ln()

    # ── Sexuality assessment ──────────────────────────────────────────────────
    ln("## Sexuality assessment")
    ln(f"- **Confidence:** `{sexuality_conf or '(not set)'}`")
    if sexuality_note:
        note_short = sexuality_note.strip()[:300].rstrip()
        ln(f"- **Reasoning:** {note_short}{'…' if len(sexuality_note) > 300 else ''}")
    ln()

    # ── What happened ─────────────────────────────────────────────────────────
    ln("## What happened")
    first_lines = [l for l in body.split('\n') if l.strip() and not l.startswith('#')][:3]
    for l in first_lines:
        ln(f"> {l.strip()[:120]}{'…' if len(l.strip()) > 120 else ''}")
    ln()

    # ── Location ──────────────────────────────────────────────────────────────
    ln("## Location")
    ln(f"- **Death site:** {location_name or '(not set)'}")
    ln(f"  - location_id: `{location_id or 'null ⚠️'}`")
    if last_seen:
        ln(f"- **Last seen:** {last_seen}")
    ln(f"- **Context:** `{killing_ctx or '(not set)'}`")
    ln()

    # ── Official findings ─────────────────────────────────────────────────────
    ln("## Official findings")
    ln("| Stage | Finding |")
    ln("|---|---|")

    inquest_m = re.search(r'inquests:\n((?:    .+\n?)*)', fm)
    if inquest_m:
        iq_block    = inquest_m.group(1)
        iq_finding  = re.search(r'finding:\s+"?(\S+?)"?\s*$', iq_block, re.MULTILINE)
        iq_coroner  = re.search(r'coroner:\s+"([^"]+)"', iq_block)
        iq_date     = re.search(r'date:\s+"([^"]+)"', iq_block)
        finding_str = iq_finding.group(1).strip('"') if iq_finding else '?'
        coroner_str = iq_coroner.group(1) if iq_coroner else '?'
        date_str    = iq_date.group(1) if iq_date else '?'
        ln(f"| Original inquest ({date_str}) | `{finding_str}` — {coroner_str} |")
    else:
        ln("| Original inquest | *not set* |")

    ln(f"| Strike Force Parrabell | `{parrabell or '(not set)'}` |")
    ln(f"| Sackar Inquiry | `{inquiry_finding or '(not set)'}` — site_status: `{site_status or '?'}` |")
    ln()

    if scoi_finding:
        ln("**Sackar's formal finding:**")
        ln(f"> {scoi_finding[:400]}{'…' if len(scoi_finding) > 400 else ''}")
        ln()

    # ── Police conduct & accountability ───────────────────────────────────────
    ln("## Police conduct & accountability")
    ln(f"- **Misconduct level:** `{misconduct or '(not set)'}`")
    if misconduct_sum:
        short = misconduct_sum.strip()[:250].rstrip()
        ln(f"- **Summary:** {short}{'…' if len(misconduct_sum) > 250 else ''}")
    ln(f"- **Accountability status:** `{accountability or '(not set)'}`")
    ln(f"- **Apology to family:** `{apology or 'null'}`")
    ln(f"- **Motive bias assessment:** `{motive or '(not set)'}`")
    ln(f"- **Group attack:** `{group_attack or 'null'}`")
    if judicial_noted and judicial_noted != 'false':
        judicial_notes = get_scalar(fm, 'judicial_bias_notes')
        ln(f"- **Judicial bias noted:** `{judicial_noted}`")
        if judicial_notes:
            ln(f"  - {judicial_notes[:200]}")
    else:
        ln(f"- **Judicial bias noted:** `{judicial_noted or 'false'}`")
    ln()

    # ── Sources (Zotero) ──────────────────────────────────────────────────────
    ln("## Sources")
    if ris_found:
        zotero_label = f"{zotero_count} source(s) linked in Zotero" if zotero_count else "⚠️  0 sources linked in Zotero — check tagging"
        ln(f"- **Zotero:** {zotero_label}")
    else:
        ln(f"- **Zotero:** RIS export not found at `{ZOTERO_RIS.relative_to(BASE)}`")
    if source_lists:
        ln(f"- **Source lists:** {', '.join(source_lists)}")
    if related_recommendations:
        ln(f"- **Recommendations linked:** {', '.join(related_recommendations)}")
    ln()

    # ── Narrative structure ───────────────────────────────────────────────────
    ln("## Narrative structure")
    ln(f"- **Body h2 headings:** {body_h2_count}")
    ln(f"- **sections[] entries:** {sections_count}")
    ln()

    # ── Network state ─────────────────────────────────────────────────────────
    ln("## Network state")
    ln()
    ln("**Locations:**")
    for s in loc_status:
        ln(f"  - {s}")
    if not loc_status:
        ln("  - ⚠️ No location_id set and no related_locations")
    ln()
    ln("**People:**")
    for s in people_status:
        ln(f"  - {s}")
    ln()

    # ── Warnings ──────────────────────────────────────────────────────────────
    warnings = []

    # Duplicate name check
    same_name = [
        f.stem for f in CASES.glob('*.md')
        if f.stem != slug and
        get_scalar(extract_fm(read_file(f) or ''), 'name') == name
    ]
    if same_name:
        warnings.append(f"⚠️  Another case has the same name '{name}': {', '.join(same_name)} — check for duplicate")

    # Location
    if not location_id:
        warnings.append("⚠️  `location_id` is null — death site has no location record")

    # Victim people record
    if not check_ref(PEOPLE, slug):
        warnings.append(f"⚠️  No people record for victim: `people/{slug}.md`")

    # Born date / year — warn only if both are absent
    if case_outcome == 'death' and not born_date and not born_year:
        warnings.append("⚠️  `born_date` and `born_year` both missing — check coronial / SCOI records")

    # Parrabell finding — must be a valid value, never null or absent
    if not parrabell:
        warnings.append("⚠️  `manner_findings.parrabell_finding` is not set — must be a valid enum value; use `not-assessed` if Parrabell didn't review this case")

    # Police misconduct and accountability
    if not misconduct:
        warnings.append("⚠️  `police_misconduct_level` is null")
    if not accountability:
        warnings.append("⚠️  `accountability_status` is null")

    # content_warnings must include 'deceased-person' for death cases
    if case_outcome == 'death' and 'deceased-person' not in fm:
        warnings.append("⚠️  `content_warnings` is missing 'deceased-person' — required for all death cases")

    # source_lists must be non-empty for SCOI cases
    if scoi_cat and not source_lists:
        warnings.append(f"⚠️  `source_lists` is empty for a SCOI Category {scoi_cat} case — add 'scoi-category-{scoi_cat.lower()}'")

    # scoi_category: null is invalid — it should be omitted entirely for non-A/B cases
    scoi_cat_raw = re.search(r'^scoi_category:\s*(.+)$', fm, re.MULTILINE)
    if scoi_cat_raw and clean_val(scoi_cat_raw.group(1)) is None:
        warnings.append("⚠️  `scoi_category: null` — omit the field entirely for non-Category-A/B cases (null is not a valid enum value)")

    # first_nations must be set explicitly
    fn_present = field_present(fm, 'first_nations')
    fn_val     = get_scalar(fm, 'first_nations')
    if not fn_present:
        warnings.append("⚠️  `first_nations` field missing — add explicitly (null = not yet assessed)")
    elif fn_val is None:
        warnings.append("ℹ️  `first_nations: null` — not yet assessed; note if research has confirmed no FN identity")

    # sections[] should be populated when body has h2 headings
    if body_h2_count > 0 and sections_count == 0:
        warnings.append(f"⚠️  Body has {body_h2_count} h2 heading(s) but `sections[]` is empty — populate sections[] to enable accordion rendering")
    elif body_h2_count > 0 and sections_count != body_h2_count:
        warnings.append(f"ℹ️  Body has {body_h2_count} h2 heading(s) but sections[] has {sections_count} entries — check all headings are mapped")

    # judicial_bias_noted — informational if not set
    if not field_present(fm, 'judicial_bias_noted'):
        warnings.append("ℹ️  `judicial_bias_noted` not set — check ACON/SCOI for any documented judicial remarks; set `false` if none found")

    # Zotero — warn if no sources linked
    if ris_found and zotero_count == 0:
        warnings.append("ℹ️  No Zotero sources linked to this case — check RIS export tags (case:{slug} or 'Related cases: {slug}')".format(slug=slug))

    if warnings:
        ln("**Flags:**")
        for w_item in warnings:
            ln(f"  - {w_item}")
        ln()

    # ── Files summary ─────────────────────────────────────────────────────────
    ln("---")
    ln()
    ln("**Files:**")
    ln(f"  - `data/cases/{slug}.md` ✅")
    ln(f"  - `data/people/{slug}.md` {'✅' if check_ref(PEOPLE, slug) else '❌ MISSING'}")
    if location_id:
        loc_exists = check_ref(LOCATIONS, location_id)
        ln(f"  - `data/locations/{location_id}.md` {'✅' if loc_exists else '❌ MISSING'}")
    ln()
    ln("*Review the above. If happy: flip `published: true`, then `git add data/ CHANGELOG.md && git commit && git push`.*")

    print('\n'.join(w))


if __name__ == '__main__':
    main()

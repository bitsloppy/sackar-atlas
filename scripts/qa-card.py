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
import os
import re
from pathlib import Path

BASE = Path(__file__).parent.parent
CASES = BASE / "data/sydney/cases"
PEOPLE = BASE / "data/sydney/people"
LOCATIONS = BASE / "data/sydney/locations"
SOURCES = BASE / "data/sydney/sources"

def read_file(path):
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None

def extract_fm(content):
    """Extract frontmatter as a dict of raw string values (no full YAML parse needed)."""
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        return {}
    return m.group(1)

def clean_val(v):
    """Strip quotes, inline YAML comments, and whitespace from a scalar value."""
    v = v.strip()
    # Remove inline comments (# ...)
    v = re.sub(r'\s+#.*$', '', v)
    v = v.strip().strip('"').strip("'")
    return None if v in ('null', '~', '') else v

def get_scalar(fm, key):
    """Get a simple scalar value from frontmatter text."""
    m = re.search(rf'^{re.escape(key)}:\s*(.+)$', fm, re.MULTILINE)
    if not m:
        return None
    return clean_val(m.group(1))

def get_list(fm, key):
    """Get a YAML list value (top-level only)."""
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
    if not cm:
        return None
    return clean_val(cm.group(1))

def get_sources_scoi(fm):
    """Extract SCOI citation fields from the nested sources.scoi block."""
    # Find the sources: block
    sources_m = re.search(r'^sources:\n((?:  .+\n|(?:    .+\n)|(?:\n))*)', fm, re.MULTILINE)
    if not sources_m:
        return {}
    sources_block = sources_m.group(1)
    # Find scoi: sub-block within it
    scoi_m = re.search(r'^  scoi:\n((?:    .+\n?)*)', sources_block, re.MULTILINE)
    if not scoi_m:
        return {}
    scoi_block = scoi_m.group(1)
    result = {}
    for field in ['volume', 'chapter', 'paragraph', 'page_start', 'page_end']:
        fm2 = re.search(rf'^\s+{re.escape(field)}:\s*(.+)$', scoi_block, re.MULTILINE)
        if fm2:
            result[field] = clean_val(fm2.group(1))
    return result

def count_press_sources(fm):
    """Count press sources in the sources.press[] array."""
    # Find sources block, then press sub-block
    sources_m = re.search(r'^sources:\n((?:  .+\n|(?:    .+\n)|(?:\n))*)', fm, re.MULTILINE)
    if not sources_m:
        return 0
    sb = sources_m.group(1)
    press_m = re.search(r'^  press:\n((?:    .+\n?)*)', sb, re.MULTILINE)
    if not press_m:
        return 0
    return len(re.findall(r'^\s+- type:', press_m.group(1), re.MULTILINE))

def check_ref(collection_path, slug):
    """Check if a data file exists for a slug."""
    return (collection_path / f"{slug}.md").exists()

def count_sources(fm, source_type):
    """Count entries of a given type in sources block."""
    # Simple heuristic: count occurrences of the type within the sources block
    sources_m = re.search(r'^sources:\n((?:  .+\n|(?:    .+\n))*)', fm, re.MULTILINE | re.DOTALL)
    if not sources_m:
        return 0
    block = sources_m.group(1)
    return len(re.findall(rf'^\s+- type: {re.escape(source_type)}', block, re.MULTILINE))

def get_press_count(fm):
    sources_m = re.search(r'^sources:.*?(?=^\w|\Z)', fm, re.MULTILINE | re.DOTALL)
    if not sources_m:
        return 0
    return fm.count('trove_id:')

def get_trove_null_count(fm):
    return fm.count('trove_id: null')

def ref_status(slug, collection_path, label):
    exists = check_ref(collection_path, slug)
    stub_flag = False
    if exists:
        content = read_file(collection_path / f"{slug}.md")
        if content:
            stub_flag = 'stub: true' in content
    icon = "✅" if (exists and not stub_flag) else ("🔶 stub" if (exists and stub_flag) else "❌ missing")
    return f"{slug} {icon}"

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

    # --- Key fields ---
    name = get_scalar(fm, 'name') or slug
    born_date = get_scalar(fm, 'born_date')
    born_place = get_scalar(fm, 'born_place')
    died_display = get_scalar(fm, 'date_of_death_display') or get_scalar(fm, 'date_of_death')
    age = get_scalar(fm, 'age_at_death')
    case_outcome = get_scalar(fm, 'case_outcome') or 'death'
    scoi_cat = get_scalar(fm, 'scoi_category')
    decade = get_scalar(fm, 'decade')

    location_name = get_scalar(fm, 'location_name')
    location_id = get_scalar(fm, 'location_id')
    last_seen = get_scalar(fm, 'last_seen_location')

    sexuality_conf = get_nested(fm, 'sexuality', 'confidence')
    sexuality_note = get_nested(fm, 'sexuality', 'display_note')

    motive = get_scalar(fm, 'motive_bias_assessment')
    killing_ctx = get_scalar(fm, 'killing_location_context')
    misconduct = get_scalar(fm, 'police_misconduct_level')
    misconduct_summary = get_scalar(fm, 'police_misconduct_summary')
    accountability = get_scalar(fm, 'accountability_status')
    apology = get_scalar(fm, 'nswpf_apology_to_family')
    scoi_finding = get_scalar(fm, 'scoi_finding')

    inquiry_finding = get_nested(fm, 'manner_findings', 'inquiry_finding')
    site_status = get_nested(fm, 'manner_findings', 'site_status')
    parrabell = get_nested(fm, 'manner_findings', 'parrabell_finding')

    related_locations = get_list(fm, 'related_locations')
    related_people_list = get_list(fm, 'related_people')
    related_recommendations = get_list(fm, 'related_recommendations')
    source_lists = get_list(fm, 'source_lists')

    trove_nulls = get_trove_null_count(fm)
    press_count = count_press_sources(fm)
    scoi_fields = get_sources_scoi(fm)

    # --- Cross-reference state ---
    loc_status = []
    if location_id:
        loc_status.append(ref_status(location_id, LOCATIONS, 'death site'))
    for loc in related_locations:
        if loc != location_id:
            loc_status.append(ref_status(loc, LOCATIONS, ''))

    people_status = []
    # Victim record
    people_status.append(ref_status(slug, PEOPLE, 'victim record'))
    for p in related_people_list:
        if p != slug:
            people_status.append(ref_status(p, PEOPLE, ''))

    # Dangling case refs (forward refs)
    all_case_refs = []
    sources_dir_files = list(SOURCES.glob("*.md"))
    for sf in sources_dir_files:
        sc = read_file(sf)
        if sc and slug in sc:
            fm_s = extract_fm(sc)
            for ref in get_list(fm_s, 'related_cases'):
                if not check_ref(CASES, ref) and ref not in all_case_refs:
                    all_case_refs.append(ref)

    # --- Output ---
    w = []
    def ln(s=""): w.append(s)

    ln(f"# QA Card — {name}")
    ln(f"*SCOI Category {scoi_cat} · {decade or '?'} · case_outcome: {case_outcome}*")
    ln()

    ln("## Identity")
    if born_date:
        ln(f"- **Born:** {born_date}{(' — ' + born_place) if born_place else ''}")
    elif born_place:
        ln(f"- **Born:** {born_place} (date unknown)")
    ln(f"- **Died:** {died_display}{(' · age ' + age) if age else ''}")
    co_b = get_scalar(fm, 'country_of_birth')
    cb = get_scalar(fm, 'cultural_background')
    if co_b: ln(f"- **Country of birth:** {co_b}")
    if cb: ln(f"- **Background:** {cb}")
    ln()

    ln("## Sexuality assessment")
    ln(f"- **Confidence:** `{sexuality_conf}`")
    if sexuality_note:
        # Trim long notes
        note_short = sexuality_note.strip()[:300].rstrip()
        ln(f"- **Reasoning:** {note_short}{'…' if len(sexuality_note) > 300 else ''}")
    ln()

    ln("## What happened")
    # Pull first 3 lines of body as summary
    first_lines = [l for l in body.split('\n') if l.strip() and not l.startswith('#')][:3]
    for l in first_lines:
        ln(f"> {l.strip()[:120]}{'…' if len(l.strip()) > 120 else ''}")
    ln()

    ln("## Location")
    ln(f"- **Death site:** {location_name or '(not set)'}")
    ln(f"  - location_id: `{location_id or 'null ⚠️'}`")
    if last_seen:
        ln(f"- **Last seen:** {last_seen}")
    ln(f"- **Context:** `{killing_ctx or '(not set)'}`")
    ln()

    ln("## Official findings")
    ln(f"| Stage | Finding |")
    ln(f"|---|---|")

    # Get inquest finding
    inquest_m = re.search(r'inquests:\n((?:    .+\n?)*)', fm)
    if inquest_m:
        iq_block = inquest_m.group(1)
        iq_finding = re.search(r'finding: (\S+)', iq_block)
        iq_coroner = re.search(r'coroner: "([^"]+)"', iq_block)
        iq_date = re.search(r'date: "([^"]+)"', iq_block)
        finding_str = iq_finding.group(1) if iq_finding else '?'
        coroner_str = iq_coroner.group(1) if iq_coroner else '?'
        date_str = iq_date.group(1) if iq_date else '?'
        ln(f"| Original inquest ({date_str}) | `{finding_str}` — {coroner_str} |")

    ln(f"| Strike Force Parrabell | `{parrabell or '(not set)'}` |")
    ln(f"| Sackar Inquiry | `{inquiry_finding or '(not set)'}` — site_status: `{site_status or '?'}` |")
    ln()

    if scoi_finding:
        ln(f"**Sackar's formal finding:**")
        ln(f"> {scoi_finding[:400]}{'…' if len(scoi_finding) > 400 else ''}")
        ln()

    ln("## Police conduct & accountability")
    ln(f"- **Misconduct level:** `{misconduct or '(not set)'}`")
    if misconduct_summary:
        short = misconduct_summary.strip()[:250].rstrip()
        ln(f"- **Summary:** {short}{'…' if len(misconduct_summary) > 250 else ''}")
    ln(f"- **Accountability status:** `{accountability or '(not set)'}`")
    ln(f"- **Apology to family:** `{apology or 'null'}`")
    ln(f"- **Motive bias assessment:** `{motive or '(not set)'}`")
    ln()

    ln("## Sources")
    scoi_ref = f"Vol {scoi_fields.get('volume','?')}, Ch {scoi_fields.get('chapter','?')}, paras {scoi_fields.get('paragraph','?')}, pp {scoi_fields.get('page_start','?')}–{scoi_fields.get('page_end','?')}"
    ln(f"- **SCOI:** {scoi_ref}")
    ln(f"- **Press:** {press_count} article(s) — {trove_nulls} needing Trove IDs")
    archives_c = fm.count('institution:')
    if archives_c:
        ln(f"- **Archives:** {archives_c} record(s)")
    coronial_c = fm.count('deceased:')
    if coronial_c:
        ln(f"- **Coronial:** {coronial_c} inquest record(s)")
    if source_lists:
        ln(f"- **Source lists:** {', '.join(source_lists)}")
    if related_recommendations:
        ln(f"- **Recommendations linked:** {', '.join(related_recommendations)}")
    ln()

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

    # Check for any missing that should exist
    warnings = []
    if not location_id:
        warnings.append("⚠️  `location_id` is null — death site has no location record")
    if not check_ref(PEOPLE, slug):
        warnings.append(f"⚠️  No people record for victim: `people/{slug}.md`")
    if not born_date and case_outcome == 'death':
        warnings.append("⚠️  `born_date` is missing — check coronial / SCOI records")
    if not misconduct:
        warnings.append("⚠️  `police_misconduct_level` is null")
    if not accountability:
        warnings.append("⚠️  `accountability_status` is null")
    if trove_nulls > 0:
        warnings.append(f"ℹ️  {trove_nulls} press source(s) need Trove IDs — check resources/trove-todo.md")

    if warnings:
        ln("**Flags:**")
        for w_item in warnings:
            ln(f"  - {w_item}")
        ln()

    ln("---")
    ln()
    ln("**Files written:**")
    ln(f"  - `data/sydney/cases/{slug}.md` ✅")
    ln(f"  - `data/sydney/people/{slug}.md` {'✅' if check_ref(PEOPLE, slug) else '❌ MISSING'}")
    if location_id:
        loc_exists = check_ref(LOCATIONS, location_id)
        ln(f"  - `data/sydney/locations/{location_id}.md` {'✅' if loc_exists else '❌ MISSING'}")
    ln()
    ln("*Review the above. If happy: `git add . && git commit && git push`. If changes needed: edit and re-run.*")

    print('\n'.join(w))

if __name__ == '__main__':
    main()

---
name: "Australian Queer Archives"
also_known_as:
  - "AQuA"
  - "Australian Queer Archives (AQuA)"
collection_id: aqua
slug: aqua

institution_type: community-archive
url: "https://queerarchives.org.au/"
location: "Melbourne, VIC (national scope)"

# ArchiveSource institution slug: 'aqua'
# Use this collection_id on ArchiveSource records:
#   collection_id: "aqua"

contact: "Via website: https://queerarchives.org.au/"
access_conditions: "Accessible via arrangement. Some materials digitised. Contact AQuA for research access. Some items also accessible via State Library of NSW."
permission_required_for_publication: true

licence: "Varied by item — contact AQuA. Community archive with mixed copyright status."

# AGSM citation format:
# AQuA (Australian Queer Archives) (Year) *Title of item* [format], AQuA, Melbourne,
# accessed Day Month Year, <https://queerarchives.org.au/>.
---

The **Australian Queer Archives (AQuA)** is a community archive dedicated to collecting, preserving, and providing access to Australia's LGBTIQ+ history. Based in Melbourne with a national collection scope.

AQuA holds oral history recordings, personal papers, organisational records, photographs, ephemera, and other materials documenting Australian LGBTIQ+ communities and history.

## Relevance to this project

- **Oral history collection** — AQuA holds recorded interviews with community members, activists, and witnesses to the period documented in this project (1970s–2010s)
- **Organisational records** — may include records from NSW LGBTIQ+ organisations active during the peak period of hate crimes
- **National scope** — covers stories and people from across Australia, including Sydney-based materials

AQuA is one of the primary oral history holdings to investigate before designing the `oral_history_status` field for case records. See: [deferred schema note in project status file].

## Access

AQuA is accessible via:
- Direct contact: queerarchives.org.au
- **State Library of NSW** — AQuA materials are accessible via State Library NSW for NSW-based researchers (per Sam Cooling, State Library NSW "Queerbrarian", ABC Radio Sunday Extra, 2026)

## Citation guidance

For specific items, use the `ArchiveSource` schema field with `institution: 'aqua'` and `collection_id: 'aqua'`. AQuA's own citation format should be followed where specified; otherwise use AGSM author-date adapted for archival sources.

## Research priority

Before building out the `oral_history_status` field on case records, contact AQuA to map what interviews they hold relevant to:
- The Bondi/Marks Park cases (Warren, Russell, Mattaini, Rattanjurathaporn)
- The North Head/Manly cases (Scott Johnson era)
- Survivors and community witnesses from the 1980s–1990s

*Source: queerarchives.org.au (accessed 18 July 2026); Sam Cooling (ABC Radio Sunday Extra, 2026).*

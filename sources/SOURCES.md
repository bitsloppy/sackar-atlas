# Primary Sources

Primary source documents for the Sackar Atlas project. Text/Markdown extracts are committed to the repo and used for research. PDFs are stored locally in `sources/pdf/` (gitignored — too large to commit; all are publicly available).

---

## How to use

**Grepping for a name:**
```bash
grep -n "Paynter" sources/SCOI-Vol2-text.txt
```

**Converting PDFs to Markdown** (once you've run pdf-to-markdown):
```bash
npm install -g @pspdfkit/pdf-to-markdown
pdf-to-markdown sources/pdf/SCOI-LGBTIQ-Hate-Crimes-Volume-2-191223.pdf > sources/SCOI-Vol2.md
```
Replace the `.txt` file with the resulting `.md` for better structure (headings, chapters, footnotes).

---

## SCOI — Special Commission of Inquiry into LGBTIQ Hate Crimes

Commissioner: the Hon. Justice John Sackar AO KC  
Published: December 2023

| File | Description | Download |
|------|-------------|----------|
| `SCOI-Vol1-text.txt` | Volume 1 — Executive summary, context, methodology | [NSW Government](https://www.nsw.gov.au/departments-and-agencies/the-cabinet-office/resources/special-commissions-of-inquiry/lgbtiq-hate-crimes) |
| `SCOI-Vol2-text.txt` | Volume 2 — Chapter 5 (Category A deaths), Chapter 6 (Category B deaths) | as above |
| `SCOI-Vol3-text.txt` | Volume 3 — Strike Forces, institutional failures, recommendations | as above |
| `SCOI-Annexures-text.txt` | Annexures | as above |

PDF filenames (in `sources/pdf/`):
- `SCOI-LGBTIQ-Hate-Crimes-Volume-1-181223.pdf`
- `SCOI-LGBTIQ-Hate-Crimes-Volume-2-191223.pdf`
- `SCOI-LGBTIQ-Hate-Crimes-Volume-3-191223.pdf`
- `SCOI-LGBTIQ-Hate-Crimes-Annexures-181223.pdf`

---

## Strike Force Parrabell — Final Report

| File | Description | Download |
|------|-------------|----------|
| *(text extract pending)* | Strike Force Parrabell Final Report | Obtained via GIPA / held locally |

PDF filename: `Strike_Force_Parrabell_-_FINAL_REPORT.pdf`

---

## In Pursuit of Truth and Justice

Report by the LGBTIQ+ community on anti-LGBTIQ+ hate crimes, 2018.

| File | Description | Download |
|------|-------------|----------|
| `In-Pursuit-of-Truth-and-Justice-Report-FINAL-220518.txt` | Full report text extract | [ACON / Pride History Group](https://www.pridehistory.org.au/) |

PDF filename: `In-Pursuit-of-Truth-and-Justice-Report-FINAL-220518.pdf`

---

## Report No. 58 — NSW Legislative Council Committee on Social Issues

*Gay and Transgender Hate Crimes Between 1970 and 2010*, NSW Parliament, 2013.

| File | Description | Download |
|------|-------------|----------|
| `Report-58-Gay-Transgender-Hate-Crimes.txt` | Full report text extract | [NSW Parliament](https://www.parliament.nsw.gov.au/committees/inquiries/Pages/inquiry-details.aspx?pk=1874) |

PDF filename: `Report No 58 - Committee on Social Issues - Gay and Transgender hate crimes between 1970 and 2010.pdf`

---

## NSW Police Annual Reports / PAC Reports

Police Area Command reports (Eastern Suburbs, Eastern Beaches, Kings Cross, Surry Hills, Northern Beaches, Inner West, Sydney City). Stored in `sources/pdf/police/`. Used for cross-referencing staffing, command structures, and accountability timelines.

PDF filenames (in `sources/pdf/police/`):
- `Eastern Beaches PAC - NSW Police Public Site.pdf`
- `Eastern Suburbs PAC - NSW Police Public Site.pdf`
- `Kings Cross PAC - NSW Police Public Site.pdf`
- `Surry Hills PAC - NSW Police Public Site.pdf`
- `Northern Beaches PAC - NSW Police Public Site.pdf`
- `Inner West PAC - NSW Police Public Site.pdf`
- `Sydney City PAC - NSW Police Public Site.pdf`

Source: [NSW Police Force Public Site](https://www.police.nsw.gov.au/)

---

## Notes

- Text files (`.txt`) are plain text extracts made from the PDFs before Markdown conversion was available. They are grep-friendly but lack heading structure.
- As PDFs are converted to Markdown using `pdf-to-markdown`, the `.txt` files will be replaced with `.md` files. Update grep commands accordingly.
- The `sources/pdf/` directory is gitignored. If you clone this repo fresh, download the PDFs from the links above and place them in `sources/pdf/`.

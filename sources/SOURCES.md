# Primary Sources

Primary source documents for the Sackar Atlas project. Markdown files are committed to the repo and used for research. PDFs are stored locally in `sources/pdf/` (gitignored — too large to commit; all are publicly available).

---

## How to use

**Grepping for a name:**
```bash
grep -n "Paynter" sources/20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-2.md
```

---

## SCOI — Special Commission of Inquiry into LGBTIQ Hate Crimes

Commissioner: the Hon. Justice John Sackar AO KC  
Published: 18 December 2023

| File | Description | Download |
|------|-------------|----------|
| `20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-1.md` | Volume 1 — Executive summary, context, methodology | [NSW Government](https://www.nsw.gov.au/departments-and-agencies/the-cabinet-office/resources/special-commissions-of-inquiry/lgbtiq-hate-crimes) |
| `20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-2.md` | Volume 2 — Chapter 5 (Category A deaths), Chapter 6 (Category B deaths) | as above |
| `20231218-SCOI-LGBTIQ-Hate-Crimes-Volume-3.md` | Volume 3 — Strike Forces, institutional failures, recommendations | as above |
| `20231218-SCOI-LGBTIQ-Hate-Crimes-Annexures.md` | Annexures | as above |

PDF filenames (in `sources/pdf/`):
- `SCOI-LGBTIQ-Hate-Crimes-Volume-1-181223.pdf`
- `SCOI-LGBTIQ-Hate-Crimes-Volume-2-191223.pdf`
- `SCOI-LGBTIQ-Hate-Crimes-Volume-3-191223.pdf`
- `SCOI-LGBTIQ-Hate-Crimes-Annexures-181223.pdf`

---

## Strike Force Parrabell — Final Report

| File | Description | Download |
|------|-------------|----------|
| `201806-Strike-Force-Parrabell-Final-report.md` | Strike Force Parrabell Final Report, June 2018 | Obtained via GIPA / held locally |

PDF filename: `Strike_Force_Parrabell_-_FINAL_REPORT.pdf`

---

## In Pursuit of Truth and Justice

Report by the LGBTIQ+ community on anti-LGBTIQ+ hate crimes, ACON / Pride History Group, 2018.

| File | Description | Download |
|------|-------------|----------|
| `20180522-In-Pursuit-of-Truth-and-Justice-Report.md` | Full report | [ACON / Pride History Group](https://www.pridehistory.org.au/) |

PDF filename: `In-Pursuit-of-Truth-and-Justice-Report-FINAL-220518.pdf`

---

## Report No. 58 — NSW Legislative Council Committee on Social Issues

*Gay and Transgender Hate Crimes Between 1970 and 2010*, NSW Parliament, 2021.

| File | Description | Download |
|------|-------------|----------|
| `20210-Report-58-Committee-on-Social-Issues-Gay-and-Transgender-hate-crimes-between-1970-and-2010.md` | Full report | [NSW Parliament](https://www.parliament.nsw.gov.au/committees/inquiries/Pages/inquiry-details.aspx?pk=1874) |

PDF filename: `Report No 58 - Committee on Social Issues - Gay and Transgender hate crimes between 1970 and 2010.pdf`

---

## NSW Police PAC Reports

Police Area Command reports (Eastern Suburbs, Eastern Beaches, Kings Cross, Surry Hills, Northern Beaches, Inner West, Sydney City). Used for cross-referencing staffing, command structures, and accountability timelines. Stored in `sources/pdf/police/` (gitignored).

Source: [NSW Police Force Public Site](https://www.police.nsw.gov.au/)

---

## Notes

- PDFs are in `sources/pdf/` (gitignored). If cloning fresh, download from the links above.
- All source documents converted to Markdown via `@pspdfkit/pdf-to-markdown`.
- File naming convention: `YYYYMMDD-Title.md`

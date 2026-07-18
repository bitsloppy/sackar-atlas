/**
 * Queer Heritage — Astro Content Collections Schema
 *
 * Five collections, all loaded from data/sydney/ outside the Astro project root.
 * Requires Astro 5.x (Content Layer API with glob loader for external paths).
 *
 * Collections:
 *   cases      — individual deaths examined by the Sackar Inquiry
 *   locations  — significant places (death sites, venues, meeting points, memorials)
 *   events     — historical events (activism, law reform, cultural moments)
 *   people     — individuals (victims, activists, witnesses, perpetrators)
 *   media      — archival footage, photographs, audio, documents
 *
 * Licence: MIT (site/) — see /LICENSE-code
 *
 * ---------------------------------------------------------------------------
 * Normative references
 * ---------------------------------------------------------------------------
 *
 * Referencing and attribution
 *   Australian Government Style Manual — author–date system
 *   https://www.stylemanual.gov.au/referencing-and-attribution/author-date
 *
 * First Nations cultural protocols
 *   Local Contexts — TK Labels, BC Labels, and Notices for Indigenous heritage
 *   https://localcontexts.org
 *   AIATSIS Map of Indigenous Australia — aiatsis.gov.au/explore/map-indigenous-australia
 *
 * Primary source
 *   NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar J, 2023)
 *   NSW Government landing page and full report volumes:
 *   https://www.nsw.gov.au/departments-and-agencies/cabinet-office/resources/special-commissions-of-inquiry/lgbtiq-hate-crimes
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ---------------------------------------------------------------------------
// Shared sub-schemas (reused across collections)
// ---------------------------------------------------------------------------

/**
 * A name someone was known by — with graduated sensitivity controls.
 *
 * Kinds:
 *   'alias'            — informal name or nickname (display by default)
 *   'dead-name'        — name before gender transition; NEVER render publicly;
 *                        stored for research integrity only
 *   'former-legal-name'— name legally changed for non-transition reasons
 *                        (e.g. deed poll); display with care
 *   'name-in-records'  — name as it appears in police/coronial/press records;
 *                        may differ from preferred name due to error or bias
 *   'nickname'         — informal short form
 */
const AlsoKnownAs = z.object({
  name: z.string(),
  kind: z.enum([
    'alias',
    'dead-name',
    'former-legal-name',
    'name-in-records',
    'nickname',
  ]).default('alias'),
  context: z.string().optional(),  // e.g. "changed by deed poll c.1974–76", "name used in 1976 coronial record"
  /** Whether to render this name on public pages. Dead names always false; others default true. */
  display: z.boolean().default(true),
});

/**
 * Content sensitivity flags.
 * Drives automatic site-level warnings.
 */
const ContentWarning = z.enum([
  'deceased-person',          // any imagery/naming of deceased
  'first-nations-deceased',   // triggers AIATSIS-style warning
  'graphic-violence',         // detailed injury/assault descriptions
  'misgendering-in-sources',  // historical records used wrong pronouns/name
  'family-privacy',           // family has asked for limited information
  'living-perpetrator',       // named suspect is still living
]);

/**
 * A press/newspaper/periodical source.
 * Trove is the primary pipeline for historical Australian press.
 *
 * AGSM author-date format:
 *   Author A (Day Month Year) 'Article title', *Publication*, page, accessed Day Month Year.
 *   e.g. Feneley R (17 March 2013) 'The gay murders', *Sydney Morning Herald*, p. 1.
 */
const PressSource = z.object({
  type: z.enum(['newspaper', 'community_press', 'magazine']),
  /** Journalist byline — family name + initials (e.g. "Feneley R"). null if uncredited. */
  author: z.string().nullable().default(null),
  title: z.string(),
  publication: z.string(),
  /** Full publication date — ISO 8601. AGSM requires day/month/year for news sources. */
  date: z.string().optional(),
  /** Page number(s) for print references (e.g. "1", "A3", "14–15"). */
  page: z.string().nullable().default(null),
  trove_id: z.string().nullable().default(null),   // NLA Trove persistent ID
  trove_url: z.string().nullable().default(null),
  /** Direct URL if available online but not on Trove. */
  url: z.string().nullable().default(null),
  /** Date accessed — required by AGSM for online sources. ISO 8601. */
  accessed_date: z.string().optional(),
  held_by: z.string().optional(),                  // if not on Trove or online
});

/**
 * An archival institution source.
 *
 * AGSM author-date format (NAA follows NAA's own citation guide):
 *   Creator A (Year) *Title of item*, Institution, collection, item_id.
 *   NAA: National Archives of Australia: [Agency]; [Series]; [Item barcode], [Item title].
 */
const ArchiveSource = z.object({
  institution: z.enum([
    'state-library-nsw',
    'mitchell-library',
    'nfsa',             // National Film and Sound Archive
    'abc-archive',
    'aqua',             // Australian Queer Archives
    'pride-history-group',
    'national-archives-australia',
    'nsw-state-archives',
    'other',
  ]),
  /** Creator or author of the item — individual or corporate. */
  creator: z.string().optional(),
  /** Date the item was created — ISO 8601 or year. */
  date: z.string().optional(),
  /** Title of the specific item (document, photograph, recording, etc.). */
  title: z.string().optional(),
  collection: z.string().optional(),
  item_id: z.string().optional(),
  url: z.string().nullable().default(null),
  /** Date accessed — required by AGSM for online sources. ISO 8601. */
  accessed_date: z.string().optional(),
  description: z.string().optional(),
  /**
   * Links to a source_collections/ entry.
   * Drives automatic display of conditions of use + correct citation format.
   */
  collection_id: z.string().optional(),  // e.g. 'aqua', 'pride-history-group'
});

/**
 * A Hansard (parliamentary record) source.
 *
 * AGSM author-date format:
 *   Chamber (Year) *Debates*, volume:page.
 *   e.g. NSW Legislative Assembly (1984) *Debates*, 132:4471.
 */
const HansardSource = z.object({
  chamber: z.string(),           // e.g. "NSW Legislative Assembly"
  /** Title of the debate, bill or matter (e.g. "Crimes Amendment (Homosexual Advance) Bill"). */
  title: z.string().optional(),
  date: z.string(),
  /** Hansard volume number — appears before the colon in citation (e.g. "132"). */
  volume: z.string().optional(),
  /** Page number(s) within the volume — appears after the colon (e.g. "4471"). */
  page: z.string().optional(),
  speaker: z.string().optional(),
  context: z.string().optional(),
  url: z.string().nullable().default(null),
});

/**
 * An oral history source.
 *
 * AGSM author-date format (interview transcript):
 *   Interviewer I (Day Month Year) *Interviewer interviews Subject: Title*
 *   [interview transcript], Publisher, accessed Day Month Year.
 */
const OralHistorySource = z.object({
  interview_id: z.string().optional(),   // links to a people/ record
  subject: z.string().optional(),        // name of interview subject
  /** Interviewer — family name + initials (e.g. "Watson AB"). */
  interviewer: z.string().optional(),
  date_recorded: z.string().optional(),
  held_by: z.string().optional(),        // e.g. aqua, pride-history-group
  /**
   * Links to a source_collections/ entry.
   * Drives automatic display of conditions of use + correct citation format.
   */
  collection_id: z.string().optional(),  // e.g. 'pride-history-group'
  /** Format of the held item. */
  format: z.enum(['audio', 'video', 'transcript', 'summary', 'notes']).optional(),
  url: z.string().nullable().default(null),
  /** Date accessed — required by AGSM for online sources. ISO 8601. */
  accessed_date: z.string().optional(),
  topics: z.array(z.string()).default([]),
  accessible: z.boolean().default(false),
  /** True when the item is held by the repository but NOT publicly available. */
  held_only: z.boolean().default(false),
});

/**
 * A report or formal publication source.
 * For community reports (ACON), government reports (Parrabell), parliamentary
 * committee reports (Report 58), and academic research reports.
 *
 * AGSM author-date format:
 *   Organisation (Year) *Title*, Publisher, place.
 *   e.g. ACON (2018) *In Pursuit of Truth & Justice*, ACON, Sydney.
 */
const ReportSource = z.object({
  type: z.enum([
    'government-report',        // government agency reports (Parrabell final report, etc.)
    'community-report',         // NGO/community reports (ACON In Pursuit of Truth & Justice)
    'academic-report',          // academic/research reports
    'inquiry-report',           // formal inquiry reports (SCOI)
    'parliamentary-committee',  // parliamentary committee reports (Report 58, etc.)
  ]),
  /** Author or lead author — family name + initials. null if corporate authorship only. */
  author: z.string().nullable().default(null),
  organisation: z.string(),
  title: z.string(),
  /** Year of publication (e.g. "2018", "2021"). */
  year: z.string(),
  isbn: z.string().optional(),
  /** Report number — for parliamentary committee reports (e.g. "Report 58"). */
  report_number: z.string().optional(),
  url: z.string().nullable().default(null),
  /** Date accessed — required by AGSM for online sources. ISO 8601. */
  accessed_date: z.string().optional(),
  /** Page number(s) for print references (e.g. "14", "p 14", "pp 14–15"). */
  page: z.string().optional(),
  /** Paragraph or section reference (e.g. "2.81", "Chapter 2"). */
  paragraph: z.string().optional(),
});

/**
 * A coronial record source — the citation entry for a coronial file.
 *
 * AGSM author-date format:
 *   Inquest into the death of Surname Name (Year), Court, Coroner.
 *   e.g. Inquest into the death of Mark Stewart (1976), NSW Coroners Court, Goldrick J.
 */
const CoronialSource = z.object({
  /** Name of deceased — used in AGSM citation: "Inquest into the death of [deceased]". */
  deceased: z.string().optional(),
  finding: z.string().optional(),
  coroner: z.string().optional(),
  date: z.string().optional(),
  /** Coronial matter/file number. */
  inquest_number: z.string().optional(),
  /** Court and location — e.g. "NSW Coroners Court, Glebe". */
  court: z.string().optional(),
  jurisdiction: z.string().default('NSW'),
  accessible: z.boolean().default(false),
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Sub-schemas: manner findings, inquest records, sexuality
// ---------------------------------------------------------------------------

/**
 * One coronial inquest — tracks the official finding at a specific hearing.
 * Cases may have multiple (e.g. Scott Johnson had three).
 */
const InquestRecord = z.object({
  /** Sequence: 1 = original inquest, 2 = second, etc. */
  sequence: z.number().default(1),

  /** Structured finding code for filtering and map rendering. */
  finding: z.enum([
    'open',          // coroner could not determine manner
    'suicide',
    'accidental',
    'homicide',      // unlawfully killed
    'undetermined',  // evidence insufficient to reach any finding
    'not-held',      // no inquest was conducted
  ]),

  /** Verbatim or close paraphrase of the finding text, for display. */
  finding_text: z.string().optional(),

  date: z.string().optional(),            // ISO 8601
  coroner: z.string().optional(),
  court: z.string().optional(),           // e.g. "NSW Coroners Court, Glebe"
  inquest_number: z.string().optional(),  // coronial matter/file number
});

/**
 * Structured manner findings — full record of all official determinations
 * from original inquest through to the SCOI Inquiry's conclusions.
 *
 * Replaces the former free-text `manner_of_death` and the three single
 * `coronial_*` fields. Tracks how the official understanding of each
 * death evolved over decades.
 */
const MannerFindings = z.object({
  /**
   * All coronial inquests, in chronological order (sequence 1, 2, 3...).
   * Most cases have one. Scott Johnson had three.
   */
  inquests: z.array(InquestRecord).default([]),

  /**
   * Strike Force Parrabell BCIF outcome (where applicable).
   * The Inquiry found this methodology was fatally flawed —
   * record for historical completeness, not as an authoritative finding.
   */
  parrabell_finding: z.enum([
    'bias-crime',
    'suspected-bias',
    'insufficient-information',
    'not-assessed',
  ]).optional(),

  /**
   * The SCOI (Sackar) Inquiry's finding or conclusion.
   * The most authoritative classification for this project.
   */
  inquiry_finding: z.enum([
    'confirmed-homicide',          // e.g. Scott Johnson — third inquest found homicide
    'probable-hate-crime',         // e.g. Ross Warren — Milledge finding upheld
    'possible-hate-crime',         // e.g. Mark Stewart — "reason to suspect" but undetermined
    'open',                        // Inquiry left it open; could not determine
    'undetermined',                // Evidence insufficient to reach any finding
    'not-individually-examined',   // Category A/B but not publicly examined at hearing
  ]).optional(),

  /**
   * Working site status — drives map pin colour and filter UI.
   * Set to the most current authoritative understanding.
   */
  site_status: z.enum([
    'confirmed-homicide',
    'probable',
    'possible',
    'open',
    'undetermined',
    'missing',           // person disappeared; no body found; case never reached coronial finding
  ]),

  /**
   * Criminal conviction arising from this death, if any.
   * null = no conviction (the common case for these cold cases).
   */
  conviction: z.object({
    person_id: z.string().optional(),  // ref to a record in data/sydney/people/
    offence: z.string(),               // e.g. "manslaughter", "murder"
    verdict: z.enum(['guilty', 'manslaughter', 'acquitted']).optional(),
    year: z.number(),
    court: z.string().optional(),
    sentence: z.string().optional(),
    notes: z.string().optional(),
    /**
     * Legal defence raised by the perpetrator.
     * The Homosexual Advance Defence (gay panic) was repealed in NSW in 2014.
     * It allowed murder to be reduced to manslaughter on grounds of a same-sex
     * advance — explicitly homophobic law used in multiple cases here.
     */
    defense_raised: z.enum([
      'gay-panic',    // Homosexual Advance Defence / gay panic
      'self-defence',
      'provocation',
      'accident',
      'none',
      'unknown',
    ]).optional(),
    /**
     * Charge originally laid — before any reduction via defence.
     * Captures cases where murder was reduced to manslaughter via gay panic.
     */
    charge_originally_laid: z.enum([
      'murder',
      'manslaughter',
      'grievous-bodily-harm',
      'other',
      'none',
      'unknown',
    ]).optional(),
    /**
     * True if a murder charge was downgraded to manslaughter via the defence.
     * Critical for filtering: how many cases had gay panic applied?
     */
    charge_reduced_from_murder: z.boolean().default(false),
  }).nullable().default(null),
});

/**
 * Structured sexuality record — captures identity, confidence, perceived
 * sexuality, and historical language without imposing fixed categories.
 * Used in both the cases and people collections.
 *
 * These cases span 1970–2010. Language in historical records is often
 * offensive, clinically dehumanising, or outdated ('homosexual', 'deviant').
 * The `historical_record_language` field preserves that for research integrity
 * without ever rendering it publicly without explicit framing.
 */
const SexualityRecord = z.object({
  /**
   * Self-identified sexuality or gender/sexual identity.
   * Use the person's own words where known; otherwise contemporary respectful
   * terminology. null = identity not known.
   * e.g. "gay", "bisexual", "queer", "lesbian"
   */
  identity: z.string().nullable().default(null),

  /**
   * Confidence level for this information.
   * Most victims' sexualities are unknown or uncertain — record honestly.
   */
  confidence: z.enum([
    'confirmed',  // explicitly stated by the person, or confirmed by close family/community
    'probable',   // strong circumstantial evidence (attended known gay venues, beats)
    'possible',   // some evidence but genuinely uncertain
    'unknown',    // no information available
  ]).default('unknown'),

  /**
   * Basis for the confidence determination.
   * e.g. "family evidence at inquest", "frequented known gay venues",
   * "attending police-identified beat", "own testimony"
   */
  source: z.string().nullable().default(null),

  /**
   * How this person was perceived by perpetrators or by society at the time.
   * Distinct from actual identity — hate crimes are often motivated by
   * perceived sexuality regardless of the victim's actual identity.
   * e.g. "perceived as gay", "targeted as homosexual by perpetrators"
   */
  perceived_as: z.string().nullable().default(null),

  /**
   * Language used in historical police, coronial and press records.
   * May be offensive, clinically dehumanising, or outdated.
   * Stored for research integrity. NEVER rendered publicly without context.
   * e.g. "homosexual" (1976 coronial record), "sexual deviant" (police file, 1983)
   */
  historical_record_language: z.string().nullable().default(null),

  /**
   * Contextual note for public display.
   * Use to explain uncertainty, note contested evidence, or provide nuance.
   */
  display_note: z.string().nullable().default(null),
});

// ---------------------------------------------------------------------------
// Sub-schema: PhysicalMarker
// Used in locations.physical_markers[]
// Sackar's Chapter 16 called for physical markers at significant locations
// via local councils. 'proposed' captures that call even where none yet exist.
// ---------------------------------------------------------------------------

const PhysicalMarker = z.object({
  type: z.enum([
    'memorial-plaque',   // commemorative plaque
    'memorial-garden',   // dedicated garden or landscaped space
    'monument',          // freestanding monument or sculpture
    'heritage-marker',   // informational historical marker
    'named-in-honour',   // street, park, or space named for victim(s)
    'proposed',          // called for but not yet installed
  ]),
  name: z.string().optional(),
  description: z.string().optional(),
  /** Date installed or dedicated (ISO 8601 or year). */
  installed: z.string().optional(),
  /** Organisation responsible for the marker (e.g. "Waverley Council"). */
  managed_by: z.string().optional(),
  /** Case IDs this marker commemorates. */
  for_cases: z.array(z.string()).default([]),
  /** People IDs this marker commemorates. */
  for_people: z.array(z.string()).default([]),
  heritage_listed: z.boolean().default(false),
  heritage_listing_ref: z.string().optional(),
});

// ---------------------------------------------------------------------------
// COLLECTION: cases
// Individual deaths examined by the Sackar Inquiry.
// Each record = one person. Joint matters use joint_case_id to link records.
// ---------------------------------------------------------------------------

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/cases' }),
  schema: z.object({

    // --- Identity -----------------------------------------------------------

    /** Preferred name — use correct name, not dead name. */
    name: z.string(),

    /** Preferred pronouns. */
    pronouns: z.string().optional(),

    /** Gender identity in their own words where known. */
    gender_identity: z.string().optional(),

    /** Structured sexuality record — captures identity, confidence, perceived sexuality, and historical language. */
    sexuality: SexualityRecord.optional(),

    /**
     * Other names this person was known by.
     * Use `kind: 'dead-name'` with `display: false` for names before gender transition.
     * Use `kind: 'former-legal-name'` for legal name changes (e.g. deed poll).
     * Use `kind: 'name-in-records'` for names in historical police/coronial/press records.
     * Names with `display: false` are stored for research integrity only.
     */
    also_known_as: z.array(AlsoKnownAs).default([]),

    // --- First Nations ------------------------------------------------------

    /**
     * Whether this person was First Nations.
     * null = unknown. Never assume.
     */
    first_nations: z.boolean().nullable().default(null),

    /** Specific nation/language group if known. */
    first_nations_nation: z.string().nullable().default(null),

    /** How First Nations identity was determined (family, inquiry, community). */
    first_nations_source: z.string().nullable().default(null),

    // --- Cultural / national background ------------------------------------
    //
    // Sackar Chapter 16 explicitly noted the absence of First Nations and CALD
    // people among victims examined by the Inquiry, and called for resources
    // to investigate whether this reflects the crimes or a gap in documentation.
    // Capture what is known; null = not yet assessed. Never assume.
    //
    // CALD = Culturally and Linguistically Diverse (Australian Government
    // definition): people from non-English-speaking backgrounds or born
    // overseas in non-English-speaking countries.

    /** Country of birth. */
    country_of_birth: z.string().nullable().default(null),

    /**
     * Cultural or ethnic background — use the person's own words where known.
     * e.g. "Greek-Australian", "Vietnamese-born", "British expat (PNG-raised)"
     */
    cultural_background: z.string().nullable().default(null),

    /**
     * First or primary language.
     * Relevant where language barriers may have affected police investigation,
     * family engagement, coronial proceedings, or press coverage.
     */
    first_language: z.string().nullable().default(null),

    /**
     * Whether this person's background was CALD.
     * null = not assessed. Never assume.
     */
    cald: z.boolean().nullable().default(null),

    /** How CALD background is known, and any relevance to how the case was investigated. */
    cald_notes: z.string().optional(),

    // --- Case outcome -------------------------------------------------------
    //
    // The cases collection covers deaths (the primary scope), missing persons
    // (body never found), and non-fatal assaults (survivors who are named in
    // formal inquiries and whose cases are part of the documented history).
    // Fields specific to deaths (date_of_death, manner_findings) are optional
    // when case_outcome is 'missing' or 'assault-survived'.

    /**
     * Whether this case resulted in a death, a missing person, or a non-fatal assault.
     *
     * Scope note: the SCOI focused on deaths. The ACON report covers 88 deaths.
     * Report 58 (NSW Parliamentary Committee) explicitly includes non-fatal
     * cases (Alan Rosendale) and missing persons (Simon Knight) as named cases
     * in its terms of reference.
     */
    case_outcome: z.enum([
      'death',             // victim died; the primary scope
      'missing',           // person disappeared; body never found; fate unknown
      'assault-survived',  // victim survived; case documented as part of the history
    ]).default('death'),

    /**
     * Date the person was reported missing or last seen (ISO 8601).
     * For case_outcome='missing' only.
     */
    missing_since: z.string().optional(),

    // --- Death dates --------------------------------------------------------

    /**
     * Date of death in ISO 8601 format (YYYY-MM-DD).
     * Use the earliest date when uncertain (e.g. "10 or 11 May" → 1976-05-10).
     * Used for sorting and map timeline.
     * Optional when case_outcome is 'missing' or 'assault-survived'.
     */
    date_of_death: z.string().optional(),

    /**
     * End of date range if death date is uncertain across multiple days.
     * e.g. "1976-05-11" when death was "10 or 11 May 1976".
     */
    date_of_death_end: z.string().optional(),

    /** True when exact date is not known. */
    date_of_death_uncertain: z.boolean().default(false),

    /**
     * Human-readable date string for display.
     * e.g. "10 or 11 May 1976", "circa 1978", "December 1979"
     * Optional when case_outcome is 'missing' or 'assault-survived'.
     */
    date_of_death_display: z.string().optional(),

    /** Age at time of death. */
    age_at_death: z.number().nullable().default(null),

    // --- Death location -----------------------------------------------------

    /** Name of location where body was found. */
    location_name: z.string(),

    /** Suburb. */
    location_suburb: z.string().optional(),

    /** Latitude for map pin. */
    location_lat: z.number().nullable().default(null),

    /** Longitude for map pin. */
    location_lng: z.number().nullable().default(null),

    /** Reference to a record in data/sydney/locations/ */
    location_id: z.string().nullable().default(null),

    // --- Last known location ------------------------------------------------

    /** Description of where this person was last seen alive. */
    last_seen_location: z.string().optional(),

    last_seen_date: z.string().optional(),

    /** Reference to a record in data/sydney/locations/ */
    last_seen_location_id: z.string().nullable().default(null),

    // --- Cause and manner ---------------------------------------------------

    /**
     * Medical cause of death — the physiological mechanism.
     * Free text from post-mortem report or forensic review.
     * e.g. "multiple injuries sustained in a fall from a height"
     */
    cause_of_death: z.string().optional(),

    /**
     * Structured manner findings — tracks how the official determination of
     * *how* and *why* this person died evolved from original inquest through
     * to the SCOI Inquiry's conclusions.
     *
     * Replaces the former free-text `manner_of_death` and the single
     * `coronial_finding / coronial_inquest_date / coronial_coroner` fields.
     * Multiple inquests (e.g. Scott Johnson's three) are supported via
     * the `inquests` array.
     */
    manner_findings: MannerFindings.optional(),

    // --- SCOI classification ------------------------------------------------

    /**
     * Sackar Inquiry category.
     * A = confirmed hate crime death.
     * B = probable or possible hate crime death.
     * Optional: cases on the ACON 88 list that were NOT examined by SCOI,
     * or non-fatal cases (assault survivors, missing persons), will not have
     * a SCOI category.
     */
    scoi_category: z.enum(['A', 'B']).optional(),

    /**
     * Which source lists this case appears on.
     * Distinct lists: ACON's 88 suspected homicides (1990–2015, compiled by
     * Sue Thompson and Stephen Tomsen), and the SCOI's Category A/B deaths.
     * A case can appear on ACON's list but not in SCOI (the inquiry examined
     * a subset), and vice versa.
     */
    source_lists: z.array(z.enum([
      'scoi-category-a',  // SCOI Volume 2, Chapter 5: confirmed hate crime deaths
      'scoi-category-b',  // SCOI Volume 2, Chapter 6: probable/possible hate crime deaths
      'acon-88',          // ACON / Thompson / Tomsen list of 88 (1990–2015)
    ])).default([]),

    /** The inquiry's own finding/conclusion for this death (1–2 sentences). */
    scoi_finding: z.string().optional(),

    /**
     * True when historical documents (police, coronial, press) used incorrect
     * pronouns or a dead name. Triggers a visible correction note on the page.
     */
    historical_misgendering: z.boolean().default(false),

    /** Explanation to display when historical_misgendering is true. */
    historical_misgendering_note: z.string().optional(),

    /**
     * True when ACON, SCOI, or other reviewed sources document specific
     * judicial homophobia or bias in this case — e.g. a judge's remarks at
     * sentencing describing the victim as a 'predator', calling a sexual
     * advance 'grossly offensive', or similar.
     *
     * Distinct from police_misconduct_level (policing failures).
     * Enables filtering: 'show cases where judicial bias was documented'.
     *
     * ACON documented specific judge quotes across multiple cases.
     */
    judicial_bias_noted: z.boolean().default(false),

    /** Summary of the documented judicial bias for display. */
    judicial_bias_notes: z.string().optional(),

    // Inquest data is now captured in manner_findings.inquests[] above.

    // --- Motive and attack characterisation --------------------------------
    //
    // These fields support the analytical questions at the heart of the project:
    //   - Was bias the motive? (ACON: ~50% of 88 cases had evidence of homophobia)
    //   - What factors were at play? (homophobia, HIV stigma, pack mentality, robbery)
    //   - Where did the attack happen? (home/beat/social space — ACON's typology)
    //   - Solo or group? (shapes both the crime and the accountability picture)
    //
    // ACON: "In Pursuit of Truth & Justice" (2018), pp 13–19.
    // Report 58: NSW Legislative Council Standing Committee on Social Issues (2021), pp 11–19.

    /**
     * Confidence that bias (homophobia/transphobia) was the motive.
     *
     * ACON found homophobia was 'likely involved in approximately 50%' of cases.
     * Distinct from police_misconduct_level (institutional behaviour)
     * and sexuality.confidence (victim's identity).
     */
    motive_bias_assessment: z.enum([
      'confirmed-bias',            // unequivocally established (e.g. perpetrator confession, testimony)
      'probable-bias',             // strong circumstantial evidence
      'possible-bias',             // some evidence but genuinely uncertain
      'bias-not-apparent',         // evidence suggests non-bias motive predominant
      'insufficient-information',  // not enough information to assess
      'not-assessed',              // not yet reviewed for this project
    ]).optional(),

    /**
     * Motive factors documented for this case.
     * Multiple factors can apply — e.g. homophobia + pack-mentality + alcohol.
     * Based on available evidence from coronial records, court judgments, ACON, SCOI.
     */
    motive_factors: z.array(z.enum([
      'homophobia',
      'transphobia',
      'hiv-aids-stigma',          // HIV/AIDS stigma documented as contributing factor
      'robbery',                  // robbery as primary or co-motive
      'pack-mentality',           // gang/group dynamic as amplifier
      'internalised-homophobia',  // perpetrator's own repressed sexuality implicated
      'sexual-advance',           // victim made sexual advance; perpetrator responded violently
      'opportunistic',            // random; victim incidentally perceived as gay
      'unknown',
    ])).default([]),

    /**
     * ACON's threefold location typology for the attack.
     * Denormalised from location_id for direct filtering without joining.
     *
     * ACON found this typology analytically significant:
     *   - Private home: individual attacker; often 'gay panic' defense used
     *   - Beat: group attacks; premeditation; luring tactics
     *   - Gay social space: targeted gay precincts, bars, saunas
     */
    killing_location_context: z.enum([
      'private-home',
      'beat',
      'gay-social-space',  // pub, club, sauna, street in gay precinct
      'public-space',      // non-gay-identified public area
      'unknown',
    ]).optional(),

    /** True when more than one perpetrator was involved in the attack. */
    group_attack: z.boolean().nullable().default(null),

    /**
     * Approximate number of perpetrators where documented.
     * ACON: group attacks (typically beats/social spaces) vs individual attacks (homes).
     */
    estimated_perpetrator_count: z.number().nullable().default(null),

    /**
     * Named perpetrator groups (gangs) linked to this case.
     * ACON names: Bondi Boys, Alexandria Eight, North Narra Boys, Tamarama Three,
     * eastern suburbs baseball bat gang. Multiple cases share perpetrator groups.
     */
    perpetrator_groups: z.array(z.object({
      /** Name as documented in court records, ACON report, or SCOI. */
      name: z.string(),
      notes: z.string().optional(),
    })).default([]),

    // --- Rewards ------------------------------------------------------------
    //
    // Police rewards signal cases where information is actively sought.
    // Scott Johnson: $2M combined ($1M NSWPF + $1M personal, Steve Johnson).
    // Simon Knight: $250K (increased from $100K in 2008, announced 2020).

    /** True if a police reward has been offered for information in this case. */
    reward_offered: z.boolean().default(false),
    /** Current reward amount (e.g. "$2,000,000", "$250,000"). */
    reward_amount: z.string().optional(),
    reward_notes: z.string().optional(),

    // --- Perpetrators -------------------------------------------------------

    perpetrators: z.array(z.object({
      /** Reference to a record in data/sydney/people/ — null if unidentified. */
      person_id: z.string().nullable().default(null),
      status: z.enum([
        'unidentified',
        'named-uncharged',   // named in inquiry but never charged
        'charged',
        'convicted',
      ]),
      notes: z.string().nullable().default(null),
    })).default([]),

    // --- Police conduct and accountability -----------------------------------
    //
    // This section documents two parallel histories:
    //   Layer 1: What happened to this person
    //   Layer 2: What institutions did (and failed to do) about it,
    //            and what obligations remain outstanding
    //
    // The SCOI exposed a gap between official record and actual accountability.
    // Strike Force Neiwand secretly overturned coronial homicide findings and
    // never told families. This schema makes that gap visible and filterable.

    /**
     * All police and UHT investigations of this death, in chronological order.
     *
     * Key type distinction: 'paper-review' vs 'reinvestigation'.
     * Parrabell was condemned specifically for being a paper review only —
     * no reinvestigation of the 116 POIs, no witness contact, BCIFs completed
     * from documentary records alone. That distinction matters here.
     */
    police_investigations: z.array(z.object({
      name: z.string(),                       // e.g. "Manly Police (original)", "Strike Force Parrabell"
      type: z.enum([
        'original-investigation',             // the initial police investigation at time of death
        'cold-case-review',                   // UHT/detective review of old file
        'paper-review',                       // documentary review only — no active reinvestigation
        'reinvestigation',                    // active reinvestigation: witnesses, forensics, POIs
        'strike-force',                       // formal named strike force
        'coronial-investigation',             // investigation by or for Coroner
        'scoi-examination',                   // examined by the Sackar Inquiry itself
      ]),
      years: z.string().optional(),           // e.g. "1976", "2015–2016", "2022–2023"
      lead_officer: z.string().optional(),    // named officer where recorded
      outcome: z.enum([
        'no-further-action',
        'case-suspended',
        'nil-priority',                       // Parrabell/UHT scoring outcome
        'referred-to-coroner',
        'charges-laid',
        'convicted',
        'insufficient-information',           // Parrabell BCIF finding
        'contrary-finding',                   // Neiwand: internally overturned prior coronial finding
        'ongoing',
        'unknown',
      ]).optional(),
      notes: z.string().optional(),
    })).default([]),

    /**
     * Granular police misconduct level — replaces the former boolean.
     *
     * Mapped to SCOI findings:
     *   'none'                    no misconduct finding
     *   'inadequate-investigation' fell short of standards; no individual
     *                             criticism — systemic/era failure
     *                             (e.g. Mark Stewart 1976)
     *   'bias-affected'           conscious or unconscious bias found by Inquiry
     *   'active-misconduct'       specific identified officer conduct
     *                             (e.g. Scott Johnson — Young's Lateline interview;
     *                              Willing found to be an "unreliable historian")
     *   'institutional-misconduct' coordinated institutional bad faith;
     *                             Sackar's "intellectually dishonest" finding
     *                             (e.g. Neiwand — secret reports overturning
     *                              coronial findings, families never told)
     */
    police_misconduct_level: z.enum([
      'none',
      'inadequate-investigation',
      'bias-affected',
      'active-misconduct',
      'institutional-misconduct',
    ]).nullable().default(null),

    /** Case-specific summary of the misconduct finding for display. */
    police_misconduct_summary: z.string().optional(),

    /**
     * Current accountability status — enables the site to surface
     * "how many cases have no accountability at all?"
     * That number is the figure that matters most to Sackar's framing.
     */
    accountability_status: z.enum([
      'no-accountability',          // no outcome, no charges, no conviction
      'scoi-examined',              // SCOI examined; no further criminal action
      'recommendation-pending',     // SCOI recommendation applies; not yet actioned
      'active-investigation',       // currently being investigated post-SCOI
      'inquest-outstanding',        // coronial matter unresolved
      'charges-laid',               // criminal charges before courts
      'convicted',                  // conviction obtained — see manner_findings.conviction
    ]).nullable().default(null),

    /**
     * Tracks Recommendation 17 compliance for cases where Strike Force Neiwand
     * (or any UHT investigation) reached a conclusion contrary to a prior
     * Coroner's finding — requiring the NSWPF to notify the Coroner and family.
     *
     * 'not-applicable' for cases not affected by a contrary UHT finding.
     * Applies directly to Ross Warren, John Russell, and Gilles Mattaini
     * (Neiwand's findings were never disclosed to families or the Coroner).
     */
    coronial_update_post_scoi: z.enum([
      'not-applicable',       // no contrary UHT finding for this case
      'pending',              // Rec 17 applies; NSWPF has not yet notified Coroner
      'notified',             // Coroner notified post-SCOI
      'new-inquest-opened',   // new coronial proceedings opened
      'finding-updated',      // coronial finding formally updated
    ]).default('not-applicable'),

    /**
     * Whether the NSWPF has apologised to this person's family.
     *
     * Sackar: "The absence of an apology from the Commissioner of Police
     * to date was extremely difficult to understand." (Chapter 16)
     * He stopped short of formally recommending it only because a compelled
     * apology would carry little weight.
     *
     * null = not known. false = no apology given. true = apology given.
     * Enables the site to surface: families who have never received an apology.
     */
    nswpf_apology_to_family: z.boolean().nullable().default(null),
    nswpf_apology_notes: z.string().optional(),

    // --- Joint cases --------------------------------------------------------

    /**
     * ID for grouping joint matters (e.g. mattaini-warren-russell).
     * Each victim has their own record; this links them together.
     */
    joint_case_id: z.string().nullable().default(null),

    /** IDs of other case records in the same joint matter. */
    joint_case_members: z.array(z.string()).default([]),

    // --- Relationships ------------------------------------------------------

    related_locations: z.array(z.string()).default([]),
    related_people: z.array(z.string()).default([]),
    related_events: z.array(z.string()).default([]),
    related_media: z.array(z.string()).default([]),
    /**
     * Sackar Inquiry recommendation slugs that apply to this case.
     * e.g. ["rec-16"] for Recommendation 16 (FIGG DNA testing — Brennan, Cawsey, Dye).
     * e.g. ["rec-17"] for Recommendation 17 (UHT must notify Coroner of contrary findings).
     * Slugs are defined in data/sydney/recommendations/.
     */
    related_recommendations: z.array(z.string()).default([]),

    // --- Content sensitivity ------------------------------------------------

    content_warnings: z.array(ContentWarning).default([]),

    /**
     * Whether family members engaged with or testified at the Sackar Inquiry.
     * null = unknown.
     */
    family_engaged_with_inquiry: z.boolean().nullable().default(null),

    /** True if family has made a request for limited public information. */
    family_privacy_request: z.boolean().default(false),

    // --- Community and family verification (this project) ------------------
    //
    // Distinct from family_engaged_with_inquiry (family engagement with SCOI).
    // These fields track this project’s own consultation with families and the
    // LGBTIQ community about how each case is represented here.
    // Modelled on consultation_status in the locations schema.

    /**
     * Status of this project’s consultation with the family and/or LGBTIQ
     * community about how this case is represented.
     */
    community_verification_status: z.enum([
      'not-assessed',   // haven’t yet determined if consultation is needed
      'not-required',   // determined no specific consultation needed
      'pending',        // needed but not yet started
      'in-progress',    // underway
      'completed',      // done — see notes
    ]).default('not-assessed'),

    community_verification_notes: z.string().optional(),

    // --- Sources ------------------------------------------------------------

    sources: z.object({
      /**
       * The Sackar Inquiry report — primary source for every case.
       *
       * AGSM author-date format:
       *   NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar J) (2023)
       *   *Report of the Special Commission of Inquiry*, vol. [volume],
       *   NSW Government, Sydney, pp. [page_start]–[page_end].
       *   In-text: (SCOI 2023:[page]) or (SCOI 2023, para [paragraph])
       */
      scoi: z.object({
        volume: z.number(),
        /** Chapter number within the volume (e.g. 5 for Chapter 5: Category A Deaths). */
        chapter: z.number().optional(),
        /**
         * Paragraph reference for precise legal/report citation.
         * String to handle decimal format (e.g. "5.279", "16.15").
         * Preferred over page numbers for direct quotations.
         */
        paragraph: z.string().optional(),
        page_start: z.number().nullable().default(null),
        page_end: z.number().nullable().default(null),
        /**
         * Internal inquiry exhibit references.
         * Stored for research integrity; not publicly linkable.
         */
        exhibits: z.array(z.object({
          id: z.string(),
          description: z.string(),
        })).default([]),
      }),
      /** Newspaper, community press, magazine sources. Trove-first. */
      press: z.array(PressSource).default([]),
      /** Archival institution sources. */
      archives: z.array(ArchiveSource).default([]),
      /** Parliamentary record sources. */
      hansard: z.array(HansardSource).default([]),
      /** Oral history sources. */
      oral_history: z.array(OralHistorySource).default([]),
      /** Coronial record sources. */
      coronial: z.array(CoronialSource).default([]),
      /**
       * Report and formal publication sources.
       * For community reports (ACON), government reports (Parrabell),
       * parliamentary committee reports (Report 58), academic research.
       */
      reports: z.array(ReportSource).default([]),
    }),

    // --- Filtering / taxonomy -----------------------------------------------

    tags: z.array(z.string()).default([]),
    decade: z.string().optional(),  // e.g. "1970s"

  }),
});

// ---------------------------------------------------------------------------
// COLLECTION: locations
// Significant places — death sites, last seen locations, venues, memorials,
// beats, march waypoints, institutional sites.
// Temporal-aware: pubs open and close, places get renamed, beats shift.
// ---------------------------------------------------------------------------

const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/locations' }),
  schema: z.object({

    name: z.string(),

    /** Former names or alternative names for this place. */
    also_known_as: z.array(z.string()).default([]),

    // --- Place type ---------------------------------------------------------

    location_type: z.enum([
      // Natural / outdoor
      'headland', 'cliff', 'park', 'beach', 'reserve',
      'waterway', 'harbour', 'river',
      // Licensed premises
      'hotel', 'pub', 'nightclub', 'venue', 'club', 'sauna',
      // Public infrastructure
      'street', 'laneway', 'intersection', 'public-toilet',
      // Private
      'home', 'workplace',
      // Institutional
      'police-station', 'court', 'hospital', 'community-space',
      // Heritage / memorial
      'memorial', 'cemetery',
      // Geographic line (march routes, walking paths)
      'route',
      'other',
    ]),

    /**
     * Project-relevant roles this location plays.
     * A place can have multiple roles: a headland can be both a beat and a
     * crime scene. Drives map layer toggles and filtered search views.
     *
     *   beat           — known gay beat (the core missing field this fixes!)
     *   nightlife-venue— pub, club, sauna (complements location_type)
     *   march-route    — documented waypoint on a historical march/procession
     *   crime-scene    — body found here, or crime occurred here
     *   last-seen      — last confirmed location of a victim
     *   memorial       — dedicated memorial site
     *   institutional  — police station, court, hospital
     *   community-hub  — meeting space, organisation HQ
     *   burial-site    — cemetery or grave
     */
    location_roles: z.array(z.enum([
      'beat',
      'nightlife-venue',
      'march-route',
      'crime-scene',
      'last-seen',
      'memorial',
      'institutional',
      'community-hub',
      'burial-site',
    ])).default([]),

    suburb: z.string().optional(),

    /**
     * Broad geographic region within NSW.
     * Useful for filtering and for surfacing the reach of violence beyond inner Sydney.
     * Report 58 documents attacks in Penrith, Collaroy, Northern Beaches, Newcastle,
     * Wollongong — the violence was not confined to the Oxford Street precinct.
     */
    location_region: z.enum([
      'inner-sydney',     // CBD, Darlinghurst, Surry Hills, Woolloomooloo, Kings Cross
      'eastern-suburbs',  // Bondi, Paddington, Randwick, Coogee, Marks Park area
      'inner-west',       // Newtown, Glebe, Leichhardt, Alexandria, Erskineville
      'western-sydney',   // Parramatta, Penrith and west
      'northern-beaches', // Manly, North Head, Fairy Bower, Dee Why, Collaroy
      'north-shore',      // North Sydney, Mosman, Chatswood
      'south-sydney',     // Wollongong, south of Sydney
      'greater-sydney',   // outer suburbs not otherwise categorised
      'regional-nsw',     // outside Sydney metro area
      'other-state',      // cross-border cases
    ]).optional(),

    lat: z.number().nullable().default(null),
    lng: z.number().nullable().default(null),

    // --- Temporal -----------------------------------------------------------

    /** Year/date this place opened or became significant (ISO 8601 or year). */
    active_from: z.string().optional(),

    /** Year/date this place closed, demolished, or was renamed. */
    active_to: z.string().optional(),

    /** True if this place still exists in some form today. */
    still_exists: z.boolean().default(true),

    /** If renamed, what it is called now. */
    current_name: z.string().optional(),

    // --- First Nations ------------------------------------------------------
    //
    // Country custodianship is the PRIMARY identity of every place.
    // Colonial naming, contemporary use, and queer heritage layer on top —
    // not the other way around.
    //
    // Key Countries across Sydney's significant sites:
    //   Gadigal      — CBD, inner south, inner west (Oxford Street strip)
    //   Bidjigal     — Bondi, Randwick, eastern suburbs (Marks Park)
    //   Cadigal      — Botany Bay, south Sydney
    //   Gayamaygal   — Manly, North Head, northern beaches (Fairy Bower)
    //   Darug        — western Sydney
    // Some sites sit on overlapping custodianship — use first_nations_country_additional.
    //
    // See also:
    //   AIATSIS Map: aiatsis.gov.au/explore/map-indigenous-australia
    //   Local Contexts: https://localcontexts.org

    /**
     * Primary First Nations Country this place sits on.
     * Use the community's preferred spelling.
     */
    first_nations_country: z.string().optional(),

    /**
     * Additional Country where custodianship overlaps or is disputed.
     * Sydney's eastern suburbs sit on the Gadigal/Bidjigal boundary.
     */
    first_nations_country_additional: z.string().optional(),

    /**
     * How Country was determined.
     * 'community-confirmed' is the gold standard.
     * Be honest — most initial entries will be 'aiatsis-map' at best.
     */
    country_determination: z.enum([
      'community-confirmed',  // confirmed by the relevant First Nations community
      'local-land-council',   // via the relevant local land council
      'language-centre',      // confirmed by a First Nations language centre
      'aiatsis-map',          // based on the AIATSIS Map of Indigenous Australia
      'researcher-assessed',  // provisional only; needs community verification
    ]).optional(),

    /** Name of the specific community, council, or source that made the determination. */
    country_determination_detail: z.string().optional(),

    /** Traditional name for this place in First Nations language. */
    traditional_name: z.string().nullable().default(null),

    /** Language group of the traditional name. */
    traditional_name_language: z.string().nullable().default(null),

    /** Who provided this traditional name (community authority, source document). */
    traditional_name_source: z.string().optional(),

    /**
     * Has the relevant First Nations community confirmed this traditional name?
     * null = not yet verified. Never publish unconfirmed names without flagging.
     */
    traditional_name_confirmed: z.boolean().nullable().default(null),

    /**
     * Local Contexts TK Labels, BC Labels, or Notices applied to this location.
     * Applied by First Nations communities via https://localcontexts.org.
     *
     * TK Labels: https://localcontexts.org/labels/traditional-knowledge/
     * BC Labels: https://localcontexts.org/labels/biocultural/
     * Notices:   https://localcontexts.org/notices/
     *
     * The project may add Notices (e.g. "Attribution Incomplete") before a
     * community has applied a label, to honestly signal incomplete attribution.
     */
    local_contexts_labels: z.array(z.object({
      /** Label or Notice name from localcontexts.org. */
      label: z.string(),
      label_type: z.enum(['TK', 'BC', 'Notice']),
      /** First Nations community that applied this label (TK/BC labels only). */
      community: z.string().optional(),
      /** URL to the specific project page on localcontexts.org. */
      url: z.string().optional(),
      date_applied: z.string().optional(),
    })).default([]),

    /**
     * Independent cultural significance to First Nations people beyond LGBTIQ history.
     * If present: flag for consultation before publishing.
     */
    first_nations_significance: z.string().optional(),

    /**
     * Consultation status with the relevant First Nations community.
     * This is a research ethics commitment, not decorative metadata.
     *
     * 'not-assessed' is the honest default for new location records.
     * Aim to move every significant location to 'completed' over time.
     */
    consultation_status: z.enum([
      'not-assessed',  // haven't yet determined if consultation is needed
      'not-required',  // determined no specific consultation needed for this record
      'pending',       // consultation needed but not yet started
      'in-progress',   // consultation underway
      'completed',     // completed — see consultation_notes
    ]).default('not-assessed'),

    consultation_notes: z.string().optional(),

    /** Acknowledgement of Country text for display on the location page. */
    acknowledgement: z.string().optional(),

    // --- Physical markers ---------------------------------------------------
    //
    // Sackar Chapter 16 explicitly called for physical markers at significant
    // locations via local councils and LGAs. 'proposed' records that call
    // even where no marker exists yet — making the gap visible.

    physical_markers: z.array(PhysicalMarker).default([]),

    // --- Relationships ------------------------------------------------------

    related_cases: z.array(z.string()).default([]),
    related_events: z.array(z.string()).default([]),
    related_media: z.array(z.string()).default([]),

    // --- Sources ------------------------------------------------------------
    //
    // AGSM author-date referencing:
    // https://www.stylemanual.gov.au/referencing-and-attribution/author-date

    sources: z.object({
      press: z.array(PressSource).default([]),
      archives: z.array(ArchiveSource).default([]),
      oral_history: z.array(OralHistorySource).default([]),
      /**
       * Reference to the SCOI report if this location is explicitly mentioned.
       * NSW Special Commission of Inquiry into LGBTIQ Hate Crimes (Sackar J, 2023).
       * https://www.nsw.gov.au/departments-and-agencies/cabinet-office/resources/special-commissions-of-inquiry/lgbtiq-hate-crimes
       */
      scoi: z.object({
        volume: z.number(),
        chapter: z.number().optional(),
        paragraph: z.string().optional(),
        page_start: z.number().nullable().default(null),
        page_end: z.number().nullable().default(null),
      }).optional(),
      /**
       * Geographic/mapping authority sources.
       * e.g. OpenStreetMap node ID, NSW State Heritage Register listing,
       * Heritage NSW assessment, City of Sydney heritage map.
       */
      geographic: z.array(z.object({
        service: z.string(),              // e.g. "OpenStreetMap", "NSW State Heritage Register"
        reference: z.string().optional(), // e.g. OSM node/way ID, heritage listing number
        url: z.string().optional(),
        accessed_date: z.string().optional(),
      })).default([]),
      reports: z.array(ReportSource).default([]),
    }).default({ press: [], archives: [], oral_history: [], geographic: [], reports: [] }),

    content_warnings: z.array(ContentWarning).default([]),

    tags: z.array(z.string()).default([]),

  }),
});

// ---------------------------------------------------------------------------
// COLLECTION: events
// Historical events — activism, law reform, cultural moments, police actions.
// The resistance, culture, and law that sit alongside the violence.
// ---------------------------------------------------------------------------

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/events' }),
  schema: z.object({

    title: z.string(),

    event_type: z.enum([
      'activism',         // protests, marches, direct action
      'legal-milestone',  // law reform, court decisions, parliamentary votes
      'cultural',         // community gatherings, Mardi Gras, cultural moments
      'political',        // parliamentary debates, policy changes
      'community',        // community organisations, publications, spaces
      'police-action',    // raids, arrests, police operations
      'memorial',         // vigils, memorials, commemorations
      'media',            // significant press coverage, documentaries
      'inquiry',          // formal investigations, commissions
      'other',
    ]),

    // --- Dates --------------------------------------------------------------

    date: z.string(),
    date_end: z.string().optional(),
    date_uncertain: z.boolean().default(false),
    date_display: z.string().optional(),
    decade: z.string().optional(),

    // --- Location -----------------------------------------------------------

    location_id: z.string().nullable().default(null),
    location_name: z.string().optional(),
    location_lat: z.number().nullable().default(null),
    location_lng: z.number().nullable().default(null),

    /**
     * Ordered list of location IDs for events that move through space.
     * Use for march routes, processions, walking tours.
     * route_waypoints[0] = start, route_waypoints[n-1] = end.
     * The primary location_id captures the central or most significant point.
     */
    route_waypoints: z.array(z.string()).default([]),

    // --- Relationships ------------------------------------------------------

    related_cases: z.array(z.string()).default([]),
    related_people: z.array(z.string()).default([]),
    related_media: z.array(z.string()).default([]),
    /** Sackar Inquiry recommendation slugs relevant to this event. */
    related_recommendations: z.array(z.string()).default([]),

    // --- Sources ------------------------------------------------------------

    sources: z.object({
      press: z.array(PressSource).default([]),
      archives: z.array(ArchiveSource).default([]),
      hansard: z.array(HansardSource).default([]),
      oral_history: z.array(OralHistorySource).default([]),
      reports: z.array(ReportSource).default([]),
    }).default({ press: [], archives: [], hansard: [], oral_history: [], reports: [] }),

    content_warnings: z.array(ContentWarning).default([]),
    tags: z.array(z.string()).default([]),

  }),
});

// ---------------------------------------------------------------------------
// COLLECTION: people
// Individuals — victims, activists, witnesses, perpetrators, police, legal.
// ---------------------------------------------------------------------------

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/people' }),
  schema: z.object({

    name: z.string(),
    pronouns: z.string().optional(),
    gender_identity: z.string().optional(),
    /** Structured sexuality record — captures identity, confidence, perceived sexuality, and historical language. */
    sexuality: SexualityRecord.optional(),
    also_known_as: z.array(AlsoKnownAs).default([]),

    // --- First Nations ------------------------------------------------------

    first_nations: z.boolean().nullable().default(null),
    first_nations_nation: z.string().nullable().default(null),

    // --- Cultural / national background ------------------------------------

    country_of_birth: z.string().nullable().default(null),
    cultural_background: z.string().nullable().default(null),
    first_language: z.string().nullable().default(null),
    cald: z.boolean().nullable().default(null),
    cald_notes: z.string().optional(),

    // --- Community verification (this project) -----------------------------
    //
    // Primarily relevant for victims and living witnesses. Tracks whether
    // the relevant community or family has been consulted about how this
    // person is represented here.

    community_verification_status: z.enum([
      'not-assessed',
      'not-required',
      'pending',
      'in-progress',
      'completed',
    ]).default('not-assessed'),

    community_verification_notes: z.string().optional(),

    // --- Role ---------------------------------------------------------------

    /**
     * Primary role in relation to this project's scope.
     * A person can appear in multiple cases with different roles —
     * use the most significant role here; nuance goes in the markdown body.
     */
    role: z.enum([
      'victim',
      'activist',
      'witness',
      'perpetrator',
      'police',
      'legal',        // lawyers, judges, coroners
      'political',    // politicians, officials
      'community',    // community figures, journalists, organisers
      'other',
    ]),

    // --- Dates --------------------------------------------------------------

    birth_year: z.number().nullable().default(null),
    death_year: z.number().nullable().default(null),

    /**
     * Whether this person is believed to be living.
     * Relevant for perpetrators and witnesses — affects what information is published.
     * null = unknown.
     */
    living: z.boolean().nullable().default(null),

    // --- Relationships ------------------------------------------------------

    related_cases: z.array(z.string()).default([]),
    related_events: z.array(z.string()).default([]),

    content_warnings: z.array(ContentWarning).default([]),
    tags: z.array(z.string()).default([]),

  }),
});

// ---------------------------------------------------------------------------
// COLLECTION: media
// Archival footage, photographs, audio recordings, historical documents.
// Geolocatable and period-tagged — feeds the map's historical media layer.
// ---------------------------------------------------------------------------

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/media' }),
  schema: z.object({

    type: z.enum(['video', 'photo', 'audio', 'document']),
    title: z.string(),

    // --- Period -------------------------------------------------------------

    period_start: z.string().optional(),  // ISO 8601
    period_end: z.string().optional(),
    /** Human-readable: "circa 1978", "early 1980s", "July 1983" */
    period_display: z.string().optional(),

    // --- Source -------------------------------------------------------------

    source_institution: z.enum([
      'nfsa',                         // National Film and Sound Archive
      'state-library-nsw',
      'mitchell-library',
      'abc-archive',
      'aqua',                         // Australian Queer Archives
      'pride-history-group',
      'national-archives-australia',
      'nsw-state-archives',
      'private',
      'other',
    ]),
    source_url: z.string().nullable().default(null),
    source_id: z.string().optional(),
    rights: z.string().optional(),    // copyright/usage rights statement

    // --- What it shows ------------------------------------------------------

    location_ids: z.array(z.string()).default([]),
    depicts_cases: z.array(z.string()).default([]),
    depicts_people: z.array(z.string()).default([]),
    depicts_events: z.array(z.string()).default([]),

    // --- Format -------------------------------------------------------------

    format: z.string().optional(),           // e.g. "16mm film", "35mm slide"
    duration_seconds: z.number().optional(), // for video/audio

    // --- Cultural sensitivity -----------------------------------------------

    /**
     * Content warnings — drives automatic site rendering of appropriate notices.
     * 'first-nations-deceased' triggers the AIATSIS-style warning:
     * "Aboriginal and Torres Strait Islander peoples are advised that this
     * material may contain images or names of deceased persons."
     */
    content_warnings: z.array(ContentWarning).default([]),

    /** True if First Nations people are depicted. */
    depicts_first_nations_people: z.boolean().default(false),

    /**
     * Local Contexts label (localcontexts.org).
     * For materials where a First Nations community has applied a
     * Traditional Knowledge (TK) or Biocultural (BC) label.
     */
    local_contexts_label: z.string().nullable().default(null),

    tags: z.array(z.string()).default([]),

  }),
});

// ---------------------------------------------------------------------------
// COLLECTION: testimonies
// Survivor accounts, family witness statements, and community testimony
// formally entered into the public record through parliamentary inquiries,
// the SCOI, oral history programs, and media interviews.
//
// Key distinction from the cases collection:
//   - cases = individual incidents (primarily deaths, some missing/assault-survived)
//   - testimonies = a person's full account, which may document multiple incidents
//     across years, institutional responses, and ongoing impact
//
// Provenance matters here: these are formally cited public records with
// submission numbers, hearing transcripts, or archive accession numbers.
// Attribution to the source document is required on every testimony.
//
// First testimonies extracted from:
//   NSW Legislative Council Standing Committee on Social Issues (2021)
//   Gay and transgender hate crimes between 1970 and 2010, Report 58.
//   Submissions 30, 31, 34.
// ---------------------------------------------------------------------------

const testimonies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/testimonies' }),
  schema: z.object({

    // --- Identity -----------------------------------------------------------

    /**
     * Display name for this person — as they appear in the source document.
     * For anonymous submissions, use the identifier the inquiry used:
     *   e.g. "Witness A", "Name suppressed", "Submission 27"
     * Never invent a name or guess.
     */
    person_display: z.string(),

    /** Reference to a record in data/sydney/people/ — null if anonymous. */
    person_id: z.string().nullable().default(null),

    /** True if the person chose to remain anonymous in the source document. */
    anonymous: z.boolean().default(false),

    // --- Testimony type -----------------------------------------------------

    /**
     * Role in which this person gave testimony.
     *
     * survivor         — directly experienced violence or discrimination
     * family-member    — family of a victim (death, missing, assault survivor)
     * community-witness — witnessed events; community context
     * activist         — gave evidence in their role as an advocate
     */
    testimony_type: z.enum([
      'survivor',
      'family-member',
      'community-witness',
      'activist',
    ]),

    // --- Approximate period -------------------------------------------------

    /**
     * Overall period covered by this testimony.
     * Human-readable — may span decades.
     * e.g. "late 1970s to mid-1990s", "2005–2019", "early 1990s"
     */
    period_display: z.string().optional(),

    /** ISO 8601 year/date for the earliest documented incident — for sorting. */
    period_start: z.string().optional(),

    /** ISO 8601 year/date for the latest documented incident or event. */
    period_end: z.string().optional(),

    // --- Incidents ----------------------------------------------------------
    //
    // A testimony may document multiple separate incidents — e.g. Stewart South
    // describes three distinct attacks across 20 years. Each incident has its
    // own location, period, and police response record.

    incidents: z.array(z.object({

      /** Human-readable period for this incident — e.g. "late 1970s", "1992". */
      period_display: z.string(),

      /** ISO 8601 start of period range (for map timeline). */
      period_start: z.string().optional(),

      /** ISO 8601 end of period range (where a range is given). */
      period_end: z.string().optional(),

      /** Brief description of the incident for structured display. */
      description: z.string(),

      /** Location name as given in testimony — may be vague ("North Sydney park"). */
      location_name: z.string().optional(),

      /** Reference to a record in data/sydney/locations/ — null if not yet linked. */
      location_id: z.string().nullable().default(null),

      location_lat: z.number().nullable().default(null),
      location_lng: z.number().nullable().default(null),

      /**
       * Location region — for map layer filtering.
       * Uses same enum as locations.location_region.
       */
      location_region: z.enum([
        'inner-sydney', 'eastern-suburbs', 'inner-west', 'western-sydney',
        'northern-beaches', 'north-shore', 'south-sydney', 'greater-sydney',
        'regional-nsw', 'other-state',
      ]).optional(),

      /** Was this incident reported to police? */
      reported_to_police: z.boolean().nullable().default(null),

      /**
       * How police responded to the report.
       * 'hostile' = police were actively hostile or dismissive.
       * 'not-reported' = victim chose not to report (fear, distrust, prior experience).
       */
      police_response: z.enum([
        'investigated',
        'dismissed',     // taken but not followed up
        'hostile',       // actively hostile, laughed at, or turned away
        'not-reported',  // victim did not report
        'unknown',
      ]).optional(),

      /** Any other institutional response documented (hospital, employer, etc.). */
      institutional_response: z.string().optional(),

    })).default([]),

    // --- Ongoing impact -----------------------------------------------------

    /**
     * Documented ongoing impacts — for display and to contextualise the
     * long-tail of hate crime beyond the moment of violence.
     * Free text summary drawn from the testimony itself.
     */
    ongoing_impact: z.string().optional(),

    // --- Source and provenance ---------------------------------------------
    //
    // Attribution to the source document is required. These testimonies are
    // public record; we cite them precisely so readers can verify the source.

    // --- Source and provenance ---------------------------------------------
    //
    // Testimonies is a catch-all for any primary source content: any record
    // where a real person speaks in their own voice, formally documented,
    // with a traceable provenance chain.
    //
    // Examples:
    //   parliamentary-submission  — Report 58 case studies (Stewart South etc.)
    //   oral-history             — PHG / AQuA recordings
    //   coronial-testimony       — sworn inquest evidence (families of Warren, Russell)
    //   documentary-interview    — Deep Water (SBS), Four Corners
    //   letter                   — letter to the editor, public correspondence
    //   memoir                   — published autobiography or memoir passage
    //
    // The access_status + collection_id fields support stub records: we can
    // document that an oral history EXISTS and WHERE it is held even before
    // we have permission to quote from it. This maps the evidence landscape
    // and gives us a concrete agenda for institutional contact (PHG, AQuA etc.).

    /**
     * How and where this testimony was captured.
     *
     * parliamentary-submission  — written submission to a parliamentary inquiry
     * parliamentary-evidence   — oral evidence at a parliamentary hearing
     * scoi-submission          — written submission to the Sackar Inquiry
     * scoi-evidence            — oral evidence at a Sackar Inquiry hearing
     * coronial-testimony       — sworn evidence at a coronial inquest
     * oral-history             — recorded oral history (PHG, AQuA, City of Sydney etc.)
     * documentary-interview    — on-camera for a documentary or TV program
     * media-interview          — print/broadcast journalist interview
     * memoir                   — published memoir, autobiography, or personal essay
     * letter                   — letter to the editor, open letter, public correspondence
     * other                    — other formally documented primary source
     */
    source_type: z.enum([
      'parliamentary-submission',
      'parliamentary-evidence',
      'scoi-submission',
      'scoi-evidence',
      'coronial-testimony',
      'oral-history',
      'documentary-interview',
      'media-interview',
      'memoir',
      'letter',
      'other',
    ]),

    /**
     * Precise source reference in AGSM author-date format.
     * Required for any testimony that is published or publicly cited.
     * Optional for stub records where the item is known but not yet accessed
     * (use access_status + collection_id to document location instead).
     *
     * e.g. "South S (2021) Submission 31, in NSW Legislative Council Standing
     * Committee on Social Issues, Gay and Transgender hate crimes between 1970
     * and 2010, Report 58, NSW Parliament, Sydney, May 2021, pp 12–13."
     */
    source_reference: z.string().optional(),

    /** Direct URL to the source document, if publicly accessible. */
    source_url: z.string().optional(),

    // --- Interview / oral history fields ------------------------------------
    //
    // These fields apply when source_type is 'oral-history', 'documentary-interview',
    // 'parliamentary-evidence', 'coronial-testimony', or any recorded format.
    // Optional on written submissions where they don't apply.

    /** Date the interview or recording was made — ISO 8601 or year. */
    interview_date: z.string().optional(),

    /** Name of the interviewer or hearing officer. */
    interviewer: z.string().optional(),

    /** Length of the recording in minutes — for audio/video testimony. */
    duration_minutes: z.number().optional(),

    /**
     * Subject topics covered in this testimony — structured for filtering.
     * Use slug-style values: e.g. 'marks-park', 'beats-era', '1980s-violence',
     * 'police-response', 'scott-johnson', 'oxford-street'.
     * Distinct from tags (which are display labels): topics drive faceted search.
     */
    topics: z.array(z.string()).default([]),

    // --- Access and holdings -----------------------------------------------
    //
    // The access model supports three scenarios:
    //
    //   FULL ACCESS: audio_url + transcript_url populated; access_status 'public'
    //   STUB RECORD: audio_url null; access_status 'held-restricted'; collection_id
    //                set to the holding institution — documents that it EXISTS
    //                and WHERE it is held, pending permission
    //   KNOWN GAP:   access_status 'unknown' or 'inaccessible' — we know testimony
    //                was given somewhere but cannot locate it
    //
    // Stub records are genuinely useful: they map the oral evidence landscape,
    // connect cases to testimony that EXISTS but is not yet accessible, and
    // give us a concrete list to bring to PHG/AQuA contact conversations.

    /**
     * Access status for this testimony.
     *
     * public            — freely accessible online or in person
     * held-public       — held by an institution; accessible on-site or by request
     * held-restricted   — held but requires permission from institution to access
     * permission-required — accessible but explicit permission needed to cite/publish
     * inaccessible      — known to exist; currently not accessible by any route
     * unknown           — access status not yet determined
     */
    access_status: z.enum([
      'public',
      'held-public',
      'held-restricted',
      'permission-required',
      'inaccessible',
      'unknown',
    ]).default('public'),

    /**
     * ID of the holding institution — links to a source_collections/ entry.
     * e.g. 'pride-history-group', 'aqua', 'state-library-nsw'
     * Drives automatic display of conditions of use and contact info on the site.
     */
    collection_id: z.string().optional(),

    /** Human-readable name of the holding institution (for display). */
    held_by: z.string().optional(),

    /**
     * URL or path to the audio file — when publicly accessible.
     * null for stub records or held-restricted items.
     */
    audio_url: z.string().nullable().default(null),

    /**
     * URL or path to the interview transcript — when accessible.
     * null for stub records or items where no transcript exists.
     */
    transcript_url: z.string().nullable().default(null),

    // --- Relationships -----------------------------------------------------

    /** Case IDs this testimony relates to. */
    related_cases: z.array(z.string()).default([]),

    /** People IDs mentioned or relevant. */
    related_people: z.array(z.string()).default([]),

    /** Event IDs (e.g. the parliamentary inquiry itself as an event). */
    related_events: z.array(z.string()).default([]),

    // --- Content sensitivity -----------------------------------------------

    content_warnings: z.array(ContentWarning).default([]),

    tags: z.array(z.string()).default([]),

  }),
});

// ---------------------------------------------------------------------------
// COLLECTION: recommendations
// The 19 formal recommendations of the Sackar Inquiry (Vols 1–3).
//
// Note: Sackar's call for a comprehensive queer heritage project (Chapter 16,
// paras 16.15–16.19) was NOT a formally numbered recommendation. It is
// tracked here as slug 'rec-heritage' for linkage purposes.
//
// Recommendations 1–7 are in Volumes 1–2 (not yet individually extracted).
// Recommendations 8–19 are in Volume 3, Chapter 8–10.
// ---------------------------------------------------------------------------

const recommendations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/recommendations' }),
  schema: z.object({

    /** Formal recommendation number (1–19). null for the heritage call. */
    number: z.number().nullable().default(null),

    title: z.string(),

    /** Volume of the SCOI report in which this recommendation appears. */
    volume: z.number(),

    /** Chapter in which this recommendation appears. */
    chapter: z.number(),

    /** Paragraph reference (e.g. "8.1"). */
    paragraph: z.string().optional(),

    /**
     * Thematic category.
     * Helps group and filter recommendations by type.
     */
    category: z.enum([
      'lgbtiq-training',        // Rec 8: mandatory LGBTIQ training for NSWPF
      'state-records',          // Rec 9: State Records Act amendment
      'cold-case-review',       // Recs 10–13, 15: systematic cold case review
      'forensic-resources',     // Rec 14: FASS/NSWPF adequate resourcing
      'genetic-genealogy',      // Rec 16: FIGG on specific named DNA profiles
      'coronial-notification',  // Rec 17: UHT must notify Coroner of contrary findings
      'bias-crimes-unit',       // Recs 18–19: EHCU/bias crimes capability
      'heritage',               // Chapter 16 narrative call (not a formal rec)
    ]),

    /**
     * NSW Government response (October 2024).
     * The Government accepted all 19 formal recommendations.
     * See REFERENCES.md for the government response document.
     */
    government_response: z.enum([
      'accepted',
      'accepted-in-principle',
      'partially-accepted',
      'rejected',
      'noted',
      'not-applicable',
    ]).optional(),

    government_response_notes: z.string().optional(),

    /**
     * Current implementation status.
     * Track this over time as actions are taken or stall.
     */
    implementation_status: z.enum([
      'not-started',
      'in-progress',
      'completed',
      'not-implemented',
      'unknown',
    ]).default('unknown'),

    implementation_notes: z.string().optional(),

    /** Case IDs explicitly named in this recommendation (e.g. Rec 16 names Brennan, Cawsey, Dye). */
    named_cases: z.array(z.string()).default([]),

    /** People IDs explicitly named in this recommendation. */
    named_people: z.array(z.string()).default([]),

    tags: z.array(z.string()).default([]),

  }),
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Source Collections registry
// ---------------------------------------------------------------------------

/**
 * Tracks archives, repositories, and institutional collections that hold
 * materials relevant to this project — each with their own conditions of use,
 * permission requirements, and citation formats.
 *
 * Purpose:
 *   - Automatic display of conditions of use when a source from this collection
 *     appears on the site
 *   - Track our permission status per repository
 *   - Generate a "Sources & Conditions" page at build time
 *   - Ensure correct citation format (some override AGSM with their own style)
 *
 * File location: data/sydney/source-collections/<id>.md
 * Referenced from: OralHistorySource.collection_id, ArchiveSource.collection_id
 */
const source_collections = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/source-collections' }),
  schema: z.object({

    /** Full institutional name. */
    name: z.string(),

    /** Short name or common abbreviation. */
    short_name: z.string().optional(),

    /** Organisation's website. */
    url: z.string().optional(),

    /** URL for conditions of use / access policy page. */
    conditions_url: z.string().optional(),

    /** URL or email for permission / contact requests. */
    contact_url: z.string().optional(),

    /**
     * How open the collection is.
     *
     * open-cc-by            — Creative Commons Attribution
     * open-cc-by-sa         — CC Attribution ShareAlike
     * open-cc-by-nc         — CC Attribution NonCommercial
     * open-public-domain    — Public domain / no known rights
     * restricted-research   — Personal and research use only; publication requires permission
     * restricted-permission — All use requires explicit permission
     * copyright-all-rights  — Full © All Rights Reserved
     * government-open       — Government open data (APS Open Access Policy)
     * item-dependent        — Conditions vary per item (age, donor agreement, etc.); check each
     * unknown               — Conditions unclear or not publicly stated
     */
    license_type: z.enum([
      'open-cc-by',
      'open-cc-by-sa',
      'open-cc-by-nc',
      'open-public-domain',
      'restricted-research',
      'restricted-permission',
      'copyright-all-rights',
      'government-open',
      'item-dependent',
      'unknown',
    ]),

    /**
     * Plain-English summary of conditions for researchers.
     * Rendered verbatim on the site wherever this collection is referenced.
     */
    conditions_summary: z.string(),

    /** Full verbatim conditions of use text (from the collection's own policy). */
    conditions_verbatim: z.string().optional(),

    /** Must we seek explicit permission before publishing any quoted material? */
    requires_permission_for_publication: z.boolean().default(false),

    /** Must we notify the collection before publishing (even if no explicit approval needed)? */
    requires_notification_before_publication: z.boolean().default(false),

    /**
     * Citation format override.
     * When set, use this instead of AGSM author-date for items from this collection.
     * Use placeholder tokens in brackets: [Last], [First], [Interviewer], [Date], [Institution]
     */
    citation_format_override: z.string().optional(),

    /** Example citation using the format. */
    citation_example: z.string().optional(),

    /**
     * Our current permission/relationship status with this collection.
     *
     * not-applicable    — open license, no permission needed
     * not-sought        — haven't contacted them yet
     * contact-made      — we've reached out, awaiting response
     * permission-granted — they've said yes (attach notes)
     * permission-denied  — they've said no (attach notes)
     * under-negotiation  — in active discussion
     */
    our_permission_status: z.enum([
      'not-applicable',
      'not-sought',
      'contact-made',
      'permission-granted',
      'permission-denied',
      'under-negotiation',
    ]).default('not-sought'),

    /** Date we last made contact or received a response. ISO 8601. */
    last_contact_date: z.string().optional(),

    /** Notes on our relationship, correspondence, or agreed terms. */
    our_notes: z.string().optional(),

    /**
     * Reciprocal obligations — what the researcher owes back to the collection.
     * Distinct from conditions (what you're allowed to do): this is what you
     * must provide in return for access.
     *
     * Examples: deposit a copy of completed work with the archive; acknowledge
     * the collection in publications; provide transcripts or translations.
     */
    researcher_obligations: z.string().optional(),

    /** What we plan to use from this collection. */
    planned_use: z.string().optional(),

    tags: z.array(z.string()).default([]),

  }),
});

export const collections = {
  cases,
  locations,
  events,
  people,
  media,
  testimonies,
  recommendations,
  // eslint-disable-next-line camelcase
  source_collections,
};

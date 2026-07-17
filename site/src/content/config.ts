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
  /** Format of the held item. */
  format: z.enum(['audio', 'video', 'transcript', 'summary', 'notes']).optional(),
  url: z.string().nullable().default(null),
  /** Date accessed — required by AGSM for online sources. ISO 8601. */
  accessed_date: z.string().optional(),
  topics: z.array(z.string()).default([]),
  accessible: z.boolean().default(false),
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

    // --- Death dates --------------------------------------------------------

    /**
     * Date of death in ISO 8601 format (YYYY-MM-DD).
     * Use the earliest date when uncertain (e.g. "10 or 11 May" → 1976-05-10).
     * Used for sorting and map timeline.
     */
    date_of_death: z.string(),

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
     */
    date_of_death_display: z.string(),

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
     */
    scoi_category: z.enum(['A', 'B']),

    /** The inquiry's own finding/conclusion for this death (1–2 sentences). */
    scoi_finding: z.string().optional(),

    /**
     * True when historical documents (police, coronial, press) used incorrect
     * pronouns or a dead name. Triggers a visible correction note on the page.
     */
    historical_misgendering: z.boolean().default(false),

    /** Explanation to display when historical_misgendering is true. */
    historical_misgendering_note: z.string().optional(),

    // Inquest data is now captured in manner_findings.inquests[] above.

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

    // --- Police conduct -----------------------------------------------------

    /**
     * True when the Sackar Inquiry specifically documented police failure or
     * misconduct in this case. Null when not specifically addressed.
     */
    police_misconduct: z.boolean().nullable().default(null),

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

    // --- Content sensitivity ------------------------------------------------

    content_warnings: z.array(ContentWarning).default([]),

    /**
     * Whether family members engaged with or testified at the Sackar Inquiry.
     * null = unknown.
     */
    family_engaged_with_inquiry: z.boolean().nullable().default(null),

    /** True if family has made a request for limited public information. */
    family_privacy_request: z.boolean().default(false),

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
    }),

    // --- Filtering / taxonomy -----------------------------------------------

    tags: z.array(z.string()).default([]),
    decade: z.string().optional(),  // e.g. "1970s"

  }),
});

// ---------------------------------------------------------------------------
// COLLECTION: locations
// Significant places — death sites, last seen locations, venues, memorials.
// Temporal-aware: pubs open and close, places get renamed.
// ---------------------------------------------------------------------------

const locations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: '../data/sydney/locations' }),
  schema: z.object({

    name: z.string(),

    /** Former names or alternative names for this place. */
    also_known_as: z.array(z.string()).default([]),

    location_type: z.enum([
      'headland', 'cliff', 'park', 'beach', 'reserve',
      'hotel', 'pub', 'venue', 'club', 'sauna',
      'street', 'laneway', 'intersection',
      'home', 'workplace',
      'waterway', 'harbour', 'river',
      'memorial', 'cemetery',
      'public-toilet',
      'other',
    ]),

    suburb: z.string().optional(),
    lat: z.number().nullable().default(null),
    lng: z.number().nullable().default(null),

    // --- Temporal -----------------------------------------------------------

    /** Year/date this place opened or became significant (ISO 8601 or year). */
    active_from: z.string().optional(),

    /** Year/date this place closed, demolished, or was renamed. */
    active_to: z.string().optional(),

    /** True if this place still exists in some form today. */
    still_exists: z.boolean().default(true),

    /** If renamed, what is it called now. */
    current_name: z.string().optional(),

    // --- First Nations ------------------------------------------------------

    /**
     * First Nations Country this place sits on.
     * Sydney spans multiple Countries: Gadigal (CBD), Cadigal (south),
     * Gayamaygal (north shore/Manly), Darug (west), and others.
     */
    country: z.string().optional(),

    /** Traditional name for this place in First Nations language. */
    traditional_name: z.string().nullable().default(null),

    /** Language group of the traditional name. */
    traditional_name_language: z.string().nullable().default(null),

    /** Source for Country determination (e.g. "aiatsis", "local-land-council"). */
    country_source: z.string().optional(),

    /** Brief acknowledgement text for display on location page. */
    acknowledgement: z.string().optional(),

    // --- Memorial -----------------------------------------------------------

    is_memorial: z.boolean().default(false),
    memorial_established: z.string().optional(),
    memorial_for: z.array(z.string()).default([]),  // case IDs

    // --- Relationships ------------------------------------------------------

    related_cases: z.array(z.string()).default([]),
    related_events: z.array(z.string()).default([]),
    related_media: z.array(z.string()).default([]),

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

    // --- Relationships ------------------------------------------------------

    related_cases: z.array(z.string()).default([]),
    related_people: z.array(z.string()).default([]),
    related_media: z.array(z.string()).default([]),

    // --- Sources ------------------------------------------------------------

    sources: z.object({
      press: z.array(PressSource).default([]),
      archives: z.array(ArchiveSource).default([]),
      hansard: z.array(HansardSource).default([]),
      oral_history: z.array(OralHistorySource).default([]),
    }).default({ press: [], archives: [], hansard: [], oral_history: [] }),

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
// Export
// ---------------------------------------------------------------------------

export const collections = {
  cases,
  locations,
  events,
  people,
  media,
};

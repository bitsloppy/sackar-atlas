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
 * A name someone was known by — with dead name protection.
 * Dead names are stored for research integrity but never rendered publicly.
 */
const AlsoKnownAs = z.object({
  name: z.string(),
  is_deadname: z.boolean().default(false),
  context: z.string().optional(),  // e.g. "name used in coronial records"
  display: z.boolean().default(true),  // false = never render on public pages
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
 */
const PressSource = z.object({
  type: z.enum(['newspaper', 'community_press', 'magazine']),
  title: z.string(),
  publication: z.string(),
  date: z.string().optional(),
  trove_id: z.string().nullable().default(null),   // NLA Trove persistent ID
  trove_url: z.string().nullable().default(null),
  held_by: z.string().optional(),                  // if not on Trove
});

/**
 * An archival institution source.
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
  collection: z.string().optional(),
  item_id: z.string().optional(),
  url: z.string().nullable().default(null),
  description: z.string().optional(),
});

/**
 * A Hansard (parliamentary record) source.
 */
const HansardSource = z.object({
  chamber: z.string(),           // e.g. "NSW Legislative Assembly"
  date: z.string(),
  speaker: z.string().optional(),
  context: z.string().optional(),
  url: z.string().nullable().default(null),
});

/**
 * An oral history source.
 */
const OralHistorySource = z.object({
  interview_id: z.string().optional(),   // links to a people/ record
  subject: z.string().optional(),        // name of interview subject
  date_recorded: z.string().optional(),
  held_by: z.string().optional(),        // e.g. aqua, pride-history-group
  topics: z.array(z.string()).default([]),
  accessible: z.boolean().default(false),
});

/**
 * A coronial record source.
 */
const CoronialSource = z.object({
  finding: z.string().optional(),
  coroner: z.string().optional(),
  date: z.string().optional(),
  accessible: z.boolean().default(false),
  notes: z.string().optional(),
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

    /** Sexuality where known and relevant. */
    sexuality: z.string().optional(),

    /**
     * Other names this person was known by.
     * Dead names: set is_deadname: true and display: false.
     * They are stored for research integrity (coroner/police records use them)
     * but never rendered on public-facing pages.
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

    /** Medical cause of death (from post-mortem). */
    cause_of_death: z.string().optional(),

    /** Manner of death (how it happened). */
    manner_of_death: z.string().optional(),

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

    // --- Original inquest ---------------------------------------------------

    /** Coronial finding text. */
    coronial_finding: z.string().optional(),

    /** Date of original inquest (ISO 8601). */
    coronial_inquest_date: z.string().optional(),

    /** Name of coroner who presided. */
    coronial_coroner: z.string().optional(),

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
      /** The Sackar Inquiry report — primary source for every case. */
      scoi: z.object({
        volume: z.number(),
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

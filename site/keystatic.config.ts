/**
 * keystatic.config.ts — Sackar Atlas CMS configuration
 *
 * GitHub mode: reads/writes directly to the bitsloppy/sackar-atlas repo.
 * Content is stored in data/{collection}/ alongside the structured YAML.
 * The markdown body of each .md/.mdoc file is the editable prose field.
 *
 * Collections:
 *   cases      — individual deaths (data/cases/)
 *   locations  — significant places (data/locations/)
 *   events     — historical events (data/events/)
 *   people     — individuals (data/people/)
 *
 * Sources are NOT managed here — Zotero is the source database.
 *
 * Schema notes:
 *   Only key editable fields are defined here; the full validation schema
 *   lives in site/src/content.config.ts and runs at build time.
 *   Complex relational fields (manner_findings, police_investigations, etc.)
 *   are best edited directly in the YAML for now.
 */

import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'bitsloppy/sackar-atlas',
  },

  ui: {
    brand: {
      name: 'Sackar Atlas',
    },
  },

  // ---------------------------------------------------------------------------
  // Singletons — one-off site pages managed via Keystatic
  // Each writes a markdown file in data/pages/ which Astro reads via the
  // 'pages' content collection.
  // ---------------------------------------------------------------------------
  singletons: {
    home: singleton({
      label: 'Home page — hero text',
      path: 'data/pages/home',
      format: { contentField: 'content' },
      schema: {
        content: fields.markdoc({
          label: 'Hero body text',
          description: 'The introductory paragraph below the strapline on the home page.',
        }),
      },
    }),

    'home-about': singleton({
      label: 'Home page — About this project',
      path: 'data/pages/home-about',
      format: { contentField: 'content' },
      schema: {
        content: fields.markdoc({
          label: 'About section body',
          description: 'The "About this project" prose section below the nav cards on the home page.',
        }),
      },
    }),

    about: singleton({
      label: 'About the data',
      path: 'data/pages/about',
      format: { contentField: 'content' },
      schema: {
        content: fields.markdoc({
          label: 'Page content',
          description: 'Prose sections: What this is / How sources are prepared / How to use. The sources table and citation block are in the page template.',
        }),
      },
    }),

    'about-ai': singleton({
      label: 'AI use page',
      path: 'data/pages/about-ai',
      format: { contentField: 'content' },
      schema: {
        content: fields.markdoc({
          label: 'Page content',
          description: 'Prose sections: What AI did / What AI did not do / How we distinguish. The intro callout and corrections callout are in the page template.',
        }),
      },
    }),

    'corrections-intro': singleton({
      label: 'Corrections page',
      path: 'data/pages/corrections-intro',
      format: { contentField: 'content' },
      schema: {
        corrections_email: fields.text({
          label: 'Corrections email address',
          description: 'The email address shown on the corrections page.',
          validation: { isRequired: true },
        }),
        content: fields.markdoc({
          label: 'Policy prose',
          description: 'How to submit / What counts / What does not count. The corrections register is managed separately in data/corrections.md.',
        }),
      },
    }),

    'site-settings': singleton({
      label: 'Site settings',
      path: 'data/pages/site-settings',
      format: { contentField: 'content' },
      schema: {
        strapline: fields.text({
          label: 'Site strapline',
          description: 'One-line description shown under "Sackar Atlas" on the home page.',
          validation: { isRequired: true },
        }),
        footer_text: fields.text({
          label: 'Footer attribution text',
          description: 'The descriptive line in the site footer. Does not include the links.',
          multiline: true,
          validation: { isRequired: true },
        }),
        // Dummy content field so Keystatic writes a .md file (required for pages collection)
        content: fields.markdoc({ label: 'Notes (unused)', description: 'Not displayed on the site.' }),
      },
    }),
  },

  collections: {
    // -------------------------------------------------------------------------
    // Cases — individual deaths examined by the Sackar Inquiry
    // -------------------------------------------------------------------------
    cases: collection({
      label: 'Cases',
      slugField: 'name',
      path: 'data/cases/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        name: fields.slug({ name: { label: 'Name (full legal name)' } }),
        content: fields.markdoc({
          label: 'Narrative prose',
          description: 'The case narrative. Use ## headings to define accordion sections. Heading text must match the sections[] field in the YAML.',
        }),

        // Publication gate
        published: fields.checkbox({
          label: 'Published',
          description: 'Shows on the live site. Only flip to true after community verification is complete.',
          defaultValue: false,
        }),
        stub: fields.checkbox({
          label: 'Stub record',
          description: 'Placeholder — has enough data to be linkable but narrative is incomplete.',
          defaultValue: false,
        }),

        // Key identity fields
        pronouns: fields.text({ label: 'Pronouns', validation: { isRequired: false } }),
        date_of_death_display: fields.text({
          label: 'Date of death (display)',
          description: 'Human-readable date. e.g. "10 or 11 May 1976", "circa 1978"',
          validation: { isRequired: false },
        }),
        scoi_category: fields.select({
          label: 'SCOI category',
          description: 'Sackar Inquiry classification',
          options: [
            { value: 'A', label: 'A — confirmed hate crime death' },
            { value: 'B', label: 'B — probable or possible hate crime death' },
          ],
          defaultValue: 'B',
        }),
        scoi_finding: fields.text({
          label: "SCOI finding (1–2 sentences)",
          description: "The inquiry's own conclusion for this death.",
          multiline: true,
          validation: { isRequired: false },
        }),

        // Location
        location_name: fields.text({ label: 'Location name', validation: { isRequired: false } }),
        location_suburb: fields.text({ label: 'Suburb', validation: { isRequired: false } }),

        // Notes
        community_verification_status: fields.select({
          label: 'Community verification status',
          options: [
            { value: 'not-assessed', label: 'Not assessed' },
            { value: 'not-required', label: 'Not required' },
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
          ],
          defaultValue: 'not-assessed',
        }),
        community_verification_notes: fields.text({
          label: 'Community verification notes',
          multiline: true,
          validation: { isRequired: false },
        }),
      },
    }),

    // -------------------------------------------------------------------------
    // Locations — significant places
    // -------------------------------------------------------------------------
    locations: collection({
      label: 'Locations',
      slugField: 'name',
      path: 'data/locations/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        name: fields.slug({ name: { label: 'Location name' } }),
        content: fields.markdoc({
          label: 'Narrative prose',
          description: 'Location history and significance. Use ## headings to define accordion sections.',
        }),

        published: fields.checkbox({ label: 'Published', defaultValue: false }),
        stub: fields.checkbox({ label: 'Stub record', defaultValue: false }),

        location_type: fields.select({
          label: 'Location type',
          options: [
            { value: 'headland', label: 'Headland' },
            { value: 'cliff', label: 'Cliff' },
            { value: 'park', label: 'Park' },
            { value: 'beach', label: 'Beach' },
            { value: 'reserve', label: 'Reserve' },
            { value: 'waterway', label: 'Waterway' },
            { value: 'harbour', label: 'Harbour' },
            { value: 'river', label: 'River' },
            { value: 'hotel', label: 'Hotel' },
            { value: 'pub', label: 'Pub' },
            { value: 'nightclub', label: 'Nightclub' },
            { value: 'venue', label: 'Venue' },
            { value: 'club', label: 'Club' },
            { value: 'sauna', label: 'Sauna' },
            { value: 'street', label: 'Street' },
            { value: 'laneway', label: 'Laneway' },
            { value: 'intersection', label: 'Intersection' },
            { value: 'public-toilet', label: 'Public toilet' },
            { value: 'home', label: 'Home' },
            { value: 'workplace', label: 'Workplace' },
            { value: 'institution', label: 'Institution' },
            { value: 'police-station', label: 'Police station' },
            { value: 'police-jurisdiction', label: 'Police jurisdiction (PAC/PD)' },
            { value: 'court', label: 'Court' },
            { value: 'hospital', label: 'Hospital' },
            { value: 'community-space', label: 'Community space' },
            { value: 'memorial', label: 'Memorial' },
            { value: 'cemetery', label: 'Cemetery' },
            { value: 'route', label: 'Route' },
            { value: 'other', label: 'Other' },
          ],
          defaultValue: 'other',
        }),

        suburb: fields.text({ label: 'Suburb', validation: { isRequired: false } }),
        first_nations_country: fields.text({
          label: 'First Nations Country',
          description: "Primary Country this place sits on. Use the community's preferred spelling.",
          validation: { isRequired: false },
        }),
        acknowledgement: fields.text({
          label: 'Acknowledgement of Country',
          description: 'Acknowledgement text for display on the location page.',
          multiline: true,
          validation: { isRequired: false },
        }),
        still_exists: fields.checkbox({ label: 'Still exists today', defaultValue: true }),
        consultation_status: fields.select({
          label: 'First Nations consultation status',
          options: [
            { value: 'not-assessed', label: 'Not assessed' },
            { value: 'not-required', label: 'Not required' },
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
          ],
          defaultValue: 'not-assessed',
        }),
      },
    }),

    // -------------------------------------------------------------------------
    // Events — activism, law reform, cultural moments, police actions
    // -------------------------------------------------------------------------
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'data/events/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ name: { label: 'Event title' } }),
        content: fields.markdoc({
          label: 'Narrative prose',
          description: 'Event description and significance.',
        }),

        stub: fields.checkbox({ label: 'Stub record', defaultValue: false }),

        event_type: fields.select({
          label: 'Event type',
          options: [
            { value: 'activism', label: 'Activism' },
            { value: 'legal-milestone', label: 'Legal milestone' },
            { value: 'cultural', label: 'Cultural' },
            { value: 'political', label: 'Political' },
            { value: 'community', label: 'Community' },
            { value: 'police-action', label: 'Police action' },
            { value: 'memorial', label: 'Memorial' },
            { value: 'media', label: 'Media' },
            { value: 'inquiry', label: 'Inquiry' },
            { value: 'other', label: 'Other' },
          ],
          defaultValue: 'other',
        }),

        date: fields.date({
          label: 'Date',
          description: 'ISO 8601 (YYYY-MM-DD). Use the start date for date ranges.',
          validation: { isRequired: true },
        }),
        date_display: fields.text({
          label: 'Date (display)',
          description: 'Human-readable. e.g. "24 June 1978", "circa 1982", "1–5 July 2001"',
          validation: { isRequired: false },
        }),
        date_uncertain: fields.checkbox({
          label: 'Date uncertain',
          defaultValue: false,
        }),

        location_name: fields.text({ label: 'Location name', validation: { isRequired: false } }),
      },
    }),

    // -------------------------------------------------------------------------
    // People — victims, activists, witnesses, perpetrators, police, legal
    // -------------------------------------------------------------------------
    people: collection({
      label: 'People',
      slugField: 'name',
      path: 'data/people/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        name: fields.slug({ name: { label: 'Name (display name)' } }),
        content: fields.markdoc({
          label: 'Narrative prose',
          description: 'Biography and role in the project scope.',
        }),

        stub: fields.checkbox({ label: 'Stub record', defaultValue: false }),

        role: fields.select({
          label: 'Primary role',
          options: [
            { value: 'victim', label: 'Victim' },
            { value: 'activist', label: 'Activist' },
            { value: 'witness', label: 'Witness' },
            { value: 'expert-witness', label: 'Expert witness' },
            { value: 'pathologist', label: 'Pathologist' },
            { value: 'coroner', label: 'Coroner' },
            { value: 'perpetrator', label: 'Perpetrator' },
            { value: 'police', label: 'Police' },
            { value: 'legal', label: 'Legal' },
            { value: 'political', label: 'Political' },
            { value: 'community', label: 'Community' },
            { value: 'journalist', label: 'Journalist' },
            { value: 'other', label: 'Other' },
          ],
          defaultValue: 'other',
        }),

        pronouns: fields.text({ label: 'Pronouns', validation: { isRequired: false } }),
        born_date: fields.date({ label: 'Date of birth', validation: { isRequired: false } }),
        died_date: fields.date({ label: 'Date of death', validation: { isRequired: false } }),
        living: fields.checkbox({ label: 'Believed to be living', defaultValue: false }),

        community_verification_status: fields.select({
          label: 'Community verification status',
          options: [
            { value: 'not-assessed', label: 'Not assessed' },
            { value: 'not-required', label: 'Not required' },
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
          ],
          defaultValue: 'not-assessed',
        }),
      },
    }),
  },
});

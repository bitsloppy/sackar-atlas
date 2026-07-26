/**
 * zotero.ts — Astro Content Layer loader for a Zotero Group Library
 *
 * Fetches all top-level items from a public (or keyed private) Zotero group
 * and transforms them into the sackar-atlas `sources` collection schema.
 *
 * Configuration (environment variables):
 *   ZOTERO_GROUP_ID   — numeric group ID from the Zotero group URL
 *   ZOTERO_API_KEY    — read-only API key (optional for public groups, but
 *                       recommended for higher rate limits and future private
 *                       collections)
 *
 * Zotero Extra field — site-specific metadata
 * ─────────────────────────────────────────────
 * Zotero's standard fields cover bibliographic data. Site-specific metadata
 * (significance, cross-references, platform URLs) goes in the item's Extra
 * field as `key: value` lines:
 *
 *   source_type: podcast-episode
 *   significance: primary-source-quality
 *   show_title: Bondi Badlands
 *   episode_title: Ross Warren
 *   series_id: bondi-badlands
 *   related_cases: ross-warren, john-russell
 *   related_locations: marks-park
 *   related_people: garry-wotherspoon
 *   related_events: sfp-parrabell
 *   related_recommendations: rec-17
 *   related_sources: abc-news-2021-bondi
 *   tags: bondi-cliffs, gay-hate-crimes, 1989
 *   spotify_url: https://open.spotify.com/show/5aEiYdw9FjLPNr9XOJZPdh
 *   apple_podcasts_url: https://podcasts.apple.com/au/podcast/bondi-badlands/id1585916975
 *   trove_id: 12345678
 *   trove_url: https://trove.nla.gov.au/newspaper/article/12345678
 *   runtime: 42m
 *   timestamp: 14:32
 *
 * source_type overrides the automatic Zotero itemType mapping.
 * All comma-separated fields (related_*, tags) are split on commas.
 */

import type { Loader, LoaderContext } from 'astro/loaders';

const BASE_URL = 'https://api.zotero.org';
const PAGE_SIZE = 100;

// ── Zotero itemType → source_type ────────────────────────────────────────────

const ITEM_TYPE_MAP: Record<string, string> = {
  webpage:          'online-news',
  blogPost:         'online-news',
  document:         'online-news',
  newspaperArticle: 'newspaper',
  magazineArticle:  'magazine-feature',
  radioBroadcast:   'radio-segment',
  audioRecording:   'podcast-episode',  // podcasts are commonly stored as audioRecording
  film:             'documentary',
  videoRecording:   'documentary',
  tvBroadcast:      'tv-segment',
  book:             'book',
  bookSection:      'book-chapter',
  journalArticle:   'academic-article',
  conferencePaper:  'academic-article',
  report:           'online-news',      // fallback; override with Extra: source_type
  thesis:           'academic-article',
  presentation:     'online-news',
};

const VALID_SOURCE_TYPES = new Set([
  'online-news', 'newspaper', 'community-press', 'magazine-feature',
  'podcast-episode', 'radio-segment', 'documentary', 'tv-segment',
  'book', 'book-chapter', 'academic-article',
]);

const SKIP_TYPES = new Set(['attachment', 'note']);

// ── Extra field parser ────────────────────────────────────────────────────────
// Parses `key: value` lines from Zotero's Extra field.
// Ignores lines that don't match the pattern (e.g. CSL override lines like
// "ISSN: 1234" are fine — they'll just be available as extra.ISSN).

function parseExtra(extra: string = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of extra.split('\n')) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.+)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

// ── Creator formatting ────────────────────────────────────────────────────────
// Returns "Surname I" (AGSM author-date format) or the single-field name.

function formatCreator(c: { name?: string; firstName?: string; lastName?: string }): string {
  if (c.name) return c.name;
  const parts: string[] = [];
  if (c.lastName) parts.push(c.lastName);
  if (c.firstName) parts.push(c.firstName.charAt(0));
  return parts.join(' ');
}

const PRIMARY_CREATOR_TYPES = new Set([
  'author', 'director', 'creator', 'journalist', 'presenter',
  'podcaster', 'performer', 'producer',
]);

function primaryCreator(creators: any[] = []): string | null {
  const primary =
    creators.find(c => PRIMARY_CREATOR_TYPES.has(c.creatorType)) ?? creators[0];
  return primary ? formatCreator(primary) : null;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function splitList(str: string | undefined): string[] {
  return str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
}

function safeInt(val: string | number | undefined): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const n = parseInt(String(val), 10);
  return isNaN(n) ? undefined : n;
}

// ── Zotero API fetch with pagination ─────────────────────────────────────────

async function fetchPage(url: string, headers: Record<string, string>) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw Object.assign(new Error(`${res.status} ${res.statusText}`), { status: res.status });
  return res;
}

async function fetchAllItems(groupId: string, apiKey: string | undefined): Promise<any[]> {
  // Build header sets to try in order: authenticated first, then unauthenticated fallback.
  const headerSets: Record<string, string>[] = [
    { 'Zotero-API-Version': '3', ...(apiKey ? { 'Zotero-API-Key': apiKey } : {}) },
  ];
  if (apiKey) {
    // If an API key is configured but returns 403, fall back to public (unauthenticated) access.
    headerSets.push({ 'Zotero-API-Version': '3' });
  }

  const items: any[] = [];
  let start = 0;
  let activeHeaders = headerSets[0];

  while (true) {
    const url = `${BASE_URL}/groups/${groupId}/items/top?format=json&limit=${PAGE_SIZE}&start=${start}`;
    let res: Response;

    try {
      res = await fetchPage(url, activeHeaders);
    } catch (err: any) {
      if (err.status === 403 && headerSets.length > 1 && activeHeaders === headerSets[0]) {
        // API key rejected — group may be public; retry without auth.
        console.warn(
          `[zotero] ZOTERO_API_KEY returned 403 for group ${groupId}. ` +
          `Retrying without authentication (public group access). ` +
          `Check that the API key has read access to this group.`
        );
        activeHeaders = headerSets[1];
        try {
          res = await fetchPage(url, activeHeaders);
        } catch (fallbackErr: any) {
          throw new Error(
            `[zotero] Unauthenticated access also failed (${fallbackErr.message}). ` +
            `Check that the Zotero group library is set to public read access ` +
            `(Group Settings → Library → Library reading → Anyone).`
          );
        }
      } else {
        throw new Error(`[zotero] API error fetching group ${groupId}: ${err.message}`);
      }
    }

    if (!res.ok) {
      throw new Error(`[zotero] API error ${res.status} ${res.statusText}: ${await res.text()}`);
    }

    const total = parseInt(res.headers.get('Total-Results') ?? '0', 10);
    const batch: any[] = await res.json();

    items.push(...batch);
    start += batch.length;

    if (items.length >= total || batch.length === 0) break;

    // Respect any Backoff header
    const backoff = res.headers.get('Backoff');
    if (backoff) {
      await new Promise(r => setTimeout(r, parseInt(backoff, 10) * 1000));
    }
  }

  return items;
}

// ── Item transformer ──────────────────────────────────────────────────────────
// Maps a Zotero API item to the sackar-atlas sources schema.

function transformItem(item: any): Record<string, unknown> {
  const d = item.data;
  const x = parseExtra(d.extra);

  // source_type: Extra field overrides automatic mapping
  let source_type = x.source_type ?? ITEM_TYPE_MAP[d.itemType] ?? 'online-news';
  if (!VALID_SOURCE_TYPES.has(source_type)) source_type = 'online-news';

  const creator = primaryCreator(d.creators);

  // Merge Zotero tags + Extra tags (deduped)
  const tagSet = new Set([
    ...(d.tags ?? []).map((t: any) => String(t.tag)),
    ...splitList(x.tags),
  ]);

  const significance = VALID_SOURCE_TYPES.has(x.significance ?? '')
    ? x.significance
    : (['primary-source-quality', 'secondary', 'tertiary'].includes(x.significance ?? '')
        ? x.significance
        : 'secondary');

  return {
    title:        d.title ?? 'Untitled',
    source_type,

    // Article fields
    publication:  d.publicationTitle ?? d.blogTitle ?? d.websiteTitle ?? d.publisher ?? null,
    author:       creator,

    // AV / podcast fields
    show_title:   x.show_title ?? d.seriesTitle ?? null,
    creator,
    episode_title: x.episode_title ?? null,
    episode_number: safeInt(d.episodeNumber ?? x.episode_number),
    season:       safeInt(x.season),

    // Series link
    series_id:    x.series_id ?? null,

    // Dates
    date:         d.date ?? null,
    accessed_date: d.accessDate ?? null,

    // URLs
    url:               d.url ?? null,
    spotify_url:       x.spotify_url ?? null,
    apple_podcasts_url: x.apple_podcasts_url ?? null,
    trove_id:          x.trove_id ?? null,
    trove_url:         x.trove_url ?? null,

    // AV metadata
    runtime:   x.runtime ?? null,
    timestamp: x.timestamp ?? null,

    // Significance
    significance,

    // Cross-references (all from Extra)
    related_cases:           splitList(x.related_cases),
    related_locations:       splitList(x.related_locations),
    related_people:          splitList(x.related_people),
    related_events:          splitList(x.related_events),
    related_recommendations: splitList(x.related_recommendations),
    related_sources:         splitList(x.related_sources),

    tags: [...tagSet],
  };
}

// ── Loader export ─────────────────────────────────────────────────────────────

/**
 * Astro Content Layer loader for the sackar-atlas Zotero group library.
 *
 * Usage in content.config.ts:
 *   import { zoteroGroupLoader } from './loaders/zotero';
 *   const sources = defineCollection({ loader: zoteroGroupLoader(), schema: z.object({...}) });
 *
 * Reads ZOTERO_GROUP_ID and ZOTERO_API_KEY from process.env (set via .env or
 * Cloudflare Pages environment variables).
 *
 * If ZOTERO_GROUP_ID is not set, the collection loads as empty with a warning
 * (build still succeeds — sources page shows 0 items).
 */
export function zoteroGroupLoader(): Loader {
  return {
    name: 'zotero-group-loader',

    async load({ store, logger, parseData, generateDigest }: LoaderContext) {
      const groupId = import.meta.env.ZOTERO_GROUP_ID ?? process.env.ZOTERO_GROUP_ID;
      const apiKey  = import.meta.env.ZOTERO_API_KEY ?? process.env.ZOTERO_API_KEY;

      if (!groupId) {
        logger.warn(
          '[zotero] ZOTERO_GROUP_ID is not set. ' +
          'Set it in .env (locally) and in Cloudflare Pages environment variables (production). ' +
          'Sources collection will be empty until this is configured.'
        );
        store.clear();
        return;
      }

      logger.info(`[zotero] Fetching items from group ${groupId}…`);

      const rawItems = await fetchAllItems(groupId, apiKey);
      logger.info(`[zotero] Received ${rawItems.length} items from API`);

      store.clear();

      let loaded = 0;
      let skipped = 0;

      for (const item of rawItems) {
        if (SKIP_TYPES.has(item.data.itemType)) {
          skipped++;
          continue;
        }

        try {
          const rawData = transformItem(item);
          const digest  = generateDigest(rawData);

          // parseData validates + coerces against the collection schema
          const data = await parseData({ id: item.key, data: rawData });

          store.set({ id: item.key, data, digest });
          loaded++;
        } catch (err) {
          logger.warn(`[zotero] Skipping item ${item.key} (${item.data.title ?? 'untitled'}): ${err}`);
        }
      }

      if (skipped > 0) {
        logger.info(`[zotero] Skipped ${skipped} attachments/notes`);
      }
      logger.info(`[zotero] Loaded ${loaded} source entries`);
    },
  };
}

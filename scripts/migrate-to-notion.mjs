#!/usr/bin/env node
/**
 * migrate-to-notion.mjs
 *
 * Reads all case/location/event/people .md files, extracts prose from
 * the Markdown body (below the YAML frontmatter), and creates one Notion
 * page per record in the sackar-atlas content database.
 *
 * Usage:
 *   NOTION_API_TOKEN=secret_xxx node scripts/migrate-to-notion.mjs \
 *     --database-id <db-id> [--dry-run] [--type cases]
 *
 * Options:
 *   --database-id  Notion database ID (required)
 *   --dry-run      Parse and print what would be created, don't call API
 *   --type         Limit to: cases | locations | events | people (default: all)
 *   --slug         Migrate one specific slug only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = path.resolve(__dirname, '../data');
const API_BASE = 'https://api.notion.com/v1';
const API_VERSION = '2026-03-11';

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const DATABASE_ID = getArg('--database-id');
const DRY_RUN = hasFlag('--dry-run');
const TYPE_FILTER = getArg('--type');
const SLUG_FILTER = getArg('--slug');
const TOKEN = process.env.NOTION_API_TOKEN || process.env.NOTION_API_KEY;

if (!DRY_RUN && !DATABASE_ID) {
  console.error('Error: --database-id is required (unless --dry-run)');
  process.exit(1);
}
if (!DRY_RUN && !TOKEN) {
  console.error('Error: NOTION_API_TOKEN env var is required');
  process.exit(1);
}

// ─── Markdown → Notion blocks ────────────────────────────────────────────────

/** Convert a line of markdown inline formatting to Notion rich_text array */
function parseInlineMarkdown(text) {
  const richText = [];
  // Regex: bold, italic, inline code, plain text
  const pattern = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|([^*`]+)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match[1]) {
      // **bold**
      richText.push({ type: 'text', text: { content: match[2] }, annotations: { bold: true } });
    } else if (match[3]) {
      // *italic*
      richText.push({ type: 'text', text: { content: match[4] }, annotations: { italic: true } });
    } else if (match[5]) {
      // `code`
      richText.push({ type: 'text', text: { content: match[6] }, annotations: { code: true } });
    } else if (match[7]) {
      // plain
      richText.push({ type: 'text', text: { content: match[7] } });
    }
  }
  return richText.length ? richText : [{ type: 'text', text: { content: text } }];
}

/** Split long rich_text content that exceeds Notion's 2000 char limit */
function splitRichText(richText) {
  const chunks = [];
  let current = [];
  let currentLen = 0;

  for (const rt of richText) {
    const content = rt.text?.content || '';
    if (currentLen + content.length > 1900) {
      if (current.length) chunks.push(current);
      current = [rt];
      currentLen = content.length;
    } else {
      current.push(rt);
      currentLen += content.length;
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/** Convert a markdown body string to an array of Notion block objects */
function markdownToNotionBlocks(markdown) {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2 heading
    if (line.startsWith('## ')) {
      const headingText = line.slice(3).trim();
      blocks.push({
        type: 'heading_2',
        heading_2: { rich_text: parseInlineMarkdown(headingText) }
      });
      i++;
      continue;
    }

    // H3 heading
    if (line.startsWith('### ')) {
      const headingText = line.slice(4).trim();
      blocks.push({
        type: 'heading_3',
        heading_3: { rich_text: parseInlineMarkdown(headingText) }
      });
      i++;
      continue;
    }

    // Bullet list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.slice(2).trim();
      blocks.push({
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: parseInlineMarkdown(itemText) }
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteText = line.slice(2).trim();
      blocks.push({
        type: 'quote',
        quote: { rich_text: parseInlineMarkdown(quoteText) }
      });
      i++;
      continue;
    }

    // Blank line — skip
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph — accumulate consecutive non-blank, non-heading lines
    const paraLines = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('- ') && !lines[i].startsWith('* ') && !lines[i].startsWith('> ')) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length) {
      const fullText = paraLines.join(' ');
      const richText = parseInlineMarkdown(fullText);

      // Split into multiple paragraph blocks if content exceeds limit
      const chunks = splitRichText(richText);
      for (const chunk of chunks) {
        blocks.push({
          type: 'paragraph',
          paragraph: { rich_text: chunk }
        });
      }
    }
  }

  return blocks;
}

// ─── YAML frontmatter extraction ─────────────────────────────────────────────

/** Extract everything after the closing --- of frontmatter */
function extractBody(fileContent) {
  const lines = fileContent.split('\n');
  let dashCount = 0;
  let bodyStart = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      dashCount++;
      if (dashCount === 2) {
        bodyStart = i + 1;
        break;
      }
    }
  }

  if (bodyStart === -1) return '';
  return lines.slice(bodyStart).join('\n').trim();
}

/** Extract the `name:` field from frontmatter for the Notion page title */
function extractName(fileContent) {
  const match = fileContent.match(/^name:\s*["']?(.+?)["']?\s*$/m);
  return match ? match[1].trim() : null;
}

// ─── File discovery ───────────────────────────────────────────────────────────

const CONTENT_TYPES = ['cases', 'locations', 'events', 'people'];

function getFilesToMigrate() {
  const files = [];
  const types = TYPE_FILTER ? [TYPE_FILTER] : CONTENT_TYPES;

  for (const type of types) {
    const dir = path.join(DATA_ROOT, type);
    if (!fs.existsSync(dir)) continue;

    const mdFiles = fs.readdirSync(dir)
      .filter(f => f.endsWith('.md') && f !== '.gitkeep' && !f.includes('template'));

    for (const filename of mdFiles) {
      const slug = filename.replace('.md', '');
      if (SLUG_FILTER && slug !== SLUG_FILTER) continue;
      files.push({ slug, type, filepath: path.join(dir, filename) });
    }
  }

  return files;
}

// ─── Notion API helpers ───────────────────────────────────────────────────────

async function notionRequest(endpoint, method = 'GET', body = null) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': API_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Notion API error ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

/** Rate-limited pause — Notion allows 3 req/s */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Check for existing page in database ─────────────────────────────────────
// NOTE: Notion renamed databases to "data sources" in the new API.
// Query endpoint is now: POST /v1/data_sources/{data_source_id}/query
// Pass --data-source-id to enable duplicate checking.

const DATA_SOURCE_ID = getArg('--data-source-id');

async function findExistingPage(slug, type) {
  if (!DATA_SOURCE_ID) return null; // skip check if no DS ID provided
  const data = await notionRequest(`data_sources/${DATA_SOURCE_ID}/query`, 'POST', {
    filter: {
      and: [
        { property: 'slug', rich_text: { equals: slug } },
        { property: 'type', select: { equals: type } },
      ]
    },
    page_size: 1,
  });
  return data.results.length > 0 ? data.results[0] : null;
}

// ─── Create Notion page ───────────────────────────────────────────────────────

async function createNotionPage(databaseId, { slug, type, name, blocks }) {
  // Notion API: max 100 blocks per append call
  const CHUNK_SIZE = 100;

  // Create the page first (with properties, no blocks yet)
  const page = await notionRequest('pages', 'POST', {
    parent: { database_id: databaseId },
    properties: {
      title: {
        title: [{ type: 'text', text: { content: name || slug } }]
      },
      slug: {
        rich_text: [{ type: 'text', text: { content: slug } }]
      },
      type: {
        select: { name: type }
      },
      status: {
        select: { name: 'Draft' }
      }
    }
  });

  await sleep(350); // rate limit

  // Append blocks in chunks
  for (let i = 0; i < blocks.length; i += CHUNK_SIZE) {
    const chunk = blocks.slice(i, i + CHUNK_SIZE);
    await notionRequest(`blocks/${page.id}/children`, 'PATCH', { children: chunk });
    await sleep(350);
  }

  return page;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const files = getFilesToMigrate();
  console.log(`Found ${files.length} file(s) to migrate\n`);

  let created = 0;
  let skipped = 0;
  let empty = 0;
  let errors = 0;

  for (const { slug, type, filepath } of files) {
    const content = fs.readFileSync(filepath, 'utf-8');
    const body = extractBody(content);
    const name = extractName(content);

    if (!body) {
      console.log(`  ⊘ ${type}/${slug} — no prose body, skipping`);
      empty++;
      continue;
    }

    const blocks = markdownToNotionBlocks(body);
    if (blocks.length === 0) {
      console.log(`  ⊘ ${type}/${slug} — no parseable blocks, skipping`);
      empty++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  ✓ ${type}/${slug} "${name}" — ${blocks.length} blocks`);
      blocks.slice(0, 3).forEach(b => {
        const text = b[b.type]?.rich_text?.[0]?.text?.content || '';
        console.log(`    [${b.type}] ${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`);
      });
      if (blocks.length > 3) console.log(`    ... ${blocks.length - 3} more blocks`);
      console.log();
      continue;
    }

    try {
      // Check if page already exists
      const existing = await findExistingPage(slug, type);
      if (DATA_SOURCE_ID) await sleep(350);

      if (existing) {
        console.log(`  → ${type}/${slug} — already exists, skipping`);
        skipped++;
        continue;
      }

      const page = await createNotionPage(DATABASE_ID, { slug, type, name, blocks });
      console.log(`  ✓ ${type}/${slug} "${name}" — ${blocks.length} blocks → ${page.id}`);
      created++;
    } catch (err) {
      console.error(`  ✗ ${type}/${slug} — ERROR: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. Created: ${created} | Skipped: ${skipped} | Empty: ${empty} | Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});

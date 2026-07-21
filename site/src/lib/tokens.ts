/**
 * Sackar Atlas — Design Tokens
 *
 * Single source of truth for all colours and design values.
 *
 * - PALETTE         raw hex values; import this in icons.ts and any TS that needs colours
 * - BADGE_TOKENS    background/text pairs for badges (WCAG-checked; keep together)
 * - COLOURS         merged flat view used by icons.ts (Leaflet pins + icon maps)
 * - DESIGN_TOKENS   injected as CSS custom properties (:root) via Base.astro
 *
 * To tweak a colour: change it here. CSS vars, map pins, and badges all update.
 *
 * Note on --open / COLOURS.open:
 *   CSS badges and text use #9090b8 (lightened for WCAG AA on page surfaces).
 *   We unify at this value; Leaflet pin contrast on the dark map is still fine.
 */

// ---------------------------------------------------------------------------
// Core palette
// ---------------------------------------------------------------------------

export const PALETTE = {
  // Backgrounds
  bg:          '#0c0c14',
  surface:     '#13131e',
  surface2:    '#1c1c2a',
  border:      '#2a2a40',

  // Text
  text:        '#dcdcf0',
  muted:       '#8585af',  // lightened from #7878a0 — WCAG AA on all surfaces

  // Brand
  accent:      '#c49a5a',  // warm gold
  link:        '#7eb8f8',
  linkVisited: '#a390e8',

  // Finding / site-status — used for pins, badge borders, and finding boxes
  homicide:    '#c94444',
  probable:    '#c97444',
  possible:    '#c49a5a',
  open:        '#9090b8',  // lightened from #7878a0 — WCAG AA; unified across CSS + pins
  excluded:    '#4a4a60',

  // Location / map types
  beat:        '#2a9d8f',
  venue:       '#9d4edd',
  police:      '#4a7faa',
  institution: '#6b7280',
  memorial:    '#c8a84b',
  locOther:    '#5a5a72',

  // Event types
  activism:       '#e07c24',
  legalMilestone: '#4a9d8f',
  inquiry:        '#7878a0',
  political:      '#6b8fa0',
  community:      '#4a9d6f',

  // Section card specifics
  firstNations: '#4a7a5a',  // muted green — land
} as const;

// ---------------------------------------------------------------------------
// Badge colour pairs  (background + foreground, WCAG-checked — keep together)
// If you change a background, re-verify the text contrast before deploying.
// ---------------------------------------------------------------------------

export const BADGE_TOKENS = {
  // Finding badges
  homicideBg:    '#3a1010',
  homicideText:  '#e06060',  // 4.9:1 on homicideBg ✓
  probableBg:    '#2e1a08',
  possibleBg:    '#2a2008',
  openBg:        '#1a1a28',
  excludedBg:    '#18181e',

  // SCOI category badges
  scoiBg:           '#0e1a28',
  scoiAText:        '#7eb8f8',
  scoiBText:        '#a8c8f8',
  scoiABorder:      '#3060a0',
  scoiBBorder:      '#254870',

  // Location role badges
  beatBg:        '#0a1e1a',
  beatText:      '#5ec4a0',
  beatBorder:    '#2a6050',
  venueBg:       '#1a0e28',
  venueText:     '#c090f0',
  venueBorder:   '#604080',
  stubBg:        '#1e1608',
  stubText:      '#c0901a',
  stubBorder:    '#6a4a08',

  // Content warning block
  warningBg:     '#1e1010',
  warningBorder: '#5a2020',
  warningText:   '#c07878',
  warningStrong: '#d09090',
} as const;

// ---------------------------------------------------------------------------
// COLOURS — merged flat view for icons.ts (Leaflet + icon/section maps)
// Aliases resolve schema values that share a colour with another concept.
// ---------------------------------------------------------------------------

export const COLOURS = {
  ...PALETTE,
  // Schema aliases — same hex as another token, named for their semantic role
  policeAction:  PALETTE.homicide,   // event type: police-action shares homicide red
  cultural:      PALETTE.venue,      // event type: cultural shares venue purple
  media:         PALETTE.inquiry,    // event type: media shares inquiry grey
  neighbourhood: PALETTE.police,     // location type: neighbourhood shares police blue
  deaths:        PALETTE.open,       // section card: deaths section shares open grey
  sources:       PALETTE.locOther,   // section card: sources
  other:         PALETTE.locOther,   // fallback
} as const;

export type ColourKey = keyof typeof COLOURS;

// ---------------------------------------------------------------------------
// DESIGN_TOKENS — CSS custom properties injected as :root vars by Base.astro
// Keys map directly to var names (--key); values are the CSS value strings.
// ---------------------------------------------------------------------------

export const DESIGN_TOKENS: Record<string, string> = {
  // Core palette
  bg:              PALETTE.bg,
  surface:         PALETTE.surface,
  surface2:        PALETTE.surface2,
  border:          PALETTE.border,
  text:            PALETTE.text,
  muted:           PALETTE.muted,
  accent:          PALETTE.accent,
  link:            PALETTE.link,
  'link-visited':  PALETTE.linkVisited,

  // Finding colours
  homicide:        PALETTE.homicide,
  probable:        PALETTE.probable,
  possible:        PALETTE.possible,
  open:            PALETTE.open,
  excluded:        PALETTE.excluded,

  // Typography + layout
  'font-body':     "Georgia, 'Times New Roman', serif",
  'font-ui':       'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  'max-w':         '860px',

  // Badge backgrounds + text (WCAG-checked pairs — change with care)
  'badge-homicide-bg':    BADGE_TOKENS.homicideBg,
  'badge-homicide-text':  BADGE_TOKENS.homicideText,
  'badge-probable-bg':    BADGE_TOKENS.probableBg,
  'badge-possible-bg':    BADGE_TOKENS.possibleBg,
  'badge-open-bg':        BADGE_TOKENS.openBg,
  'badge-excluded-bg':    BADGE_TOKENS.excludedBg,
  'badge-scoi-bg':        BADGE_TOKENS.scoiBg,
  'badge-scoi-a-text':    BADGE_TOKENS.scoiAText,
  'badge-scoi-b-text':    BADGE_TOKENS.scoiBText,
  'badge-scoi-a-border':  BADGE_TOKENS.scoiABorder,
  'badge-scoi-b-border':  BADGE_TOKENS.scoiBBorder,
  'badge-beat-bg':        BADGE_TOKENS.beatBg,
  'badge-beat-text':      BADGE_TOKENS.beatText,
  'badge-beat-border':    BADGE_TOKENS.beatBorder,
  'badge-venue-bg':       BADGE_TOKENS.venueBg,
  'badge-venue-text':     BADGE_TOKENS.venueText,
  'badge-venue-border':   BADGE_TOKENS.venueBorder,
  'badge-stub-bg':        BADGE_TOKENS.stubBg,
  'badge-stub-text':      BADGE_TOKENS.stubText,
  'badge-stub-border':    BADGE_TOKENS.stubBorder,
  'warning-bg':           BADGE_TOKENS.warningBg,
  'warning-border':       BADGE_TOKENS.warningBorder,
  'warning-text':         BADGE_TOKENS.warningText,
  'warning-strong':       BADGE_TOKENS.warningStrong,
};

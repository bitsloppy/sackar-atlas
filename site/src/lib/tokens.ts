/**
 * Sackar Atlas — Design Tokens
 *
 * Single source of truth for all colours and design values.
 *
 * - NSW_PALETTE             NSW Government colour palette (MIT licence)
 * - NSW_ABORIGINAL_PALETTE  NSW Government Aboriginal colour palette (MIT licence)
 * - PALETTE                 Site colours — draws from NSW palettes where aligned
 * - BADGE_TOKENS            Background/text pairs for badges (WCAG-checked)
 * - COLOURS                 Merged flat view for icons.ts (Leaflet pins + icon maps)
 * - DESIGN_TOKENS           Injected as CSS :root custom properties via Base.astro
 *
 * To tweak a colour: change it here. CSS vars, map pins, and badges all update.
 *
 * NSW palette reference: https://designsystem.nsw.gov.au/core/colour/index.html
 * Each hue has a 4-stop ramp: 01 (darkest) → 04 (lightest).
 * On a dark theme, use 01 for bg tints, 02 for borders/icons, 03 for text.
 */

// ---------------------------------------------------------------------------
// NSW Government colour palette  (MIT licence)
// Source: https://designsystem.nsw.gov.au/core/colour/index.html
// ---------------------------------------------------------------------------

export const NSW_PALETTE = {
  // Greys
  grey01: '#22272B',
  grey02: '#495054',
  grey03: '#CDD3D6',
  grey04: '#EBEBEB',
  // Green
  green01: '#004000',
  green02: '#00AA45',
  green03: '#A8EDB3',
  green04: '#DBFADF',
  // Teal
  teal01:  '#0B3F47',
  teal02:  '#2E808E',
  teal03:  '#8CDBE5',
  teal04:  '#D1EEEA',
  // Blue
  blue01:  '#002664',
  blue02:  '#146CFD',
  blue03:  '#8CE0FF',
  blue04:  '#CBEDFD',
  // Purple
  purple01: '#441170',
  purple02: '#8055F1',
  purple03: '#CEBFFF',
  purple04: '#E6E1FD',
  // Fuchsia
  fuchsia01: '#65004D',
  fuchsia02: '#D912AE',
  fuchsia03: '#F4B5E6',
  fuchsia04: '#FDDEF2',
  // Red
  red01: '#630019',
  red02: '#D7153A',
  red03: '#FFB8C1',
  red04: '#FFE6EA',
  // Orange
  orange01: '#941B00',
  orange02: '#F3631B',
  orange03: '#FFCE99',
  orange04: '#FDEDDF',
  // Yellow
  yellow01: '#694800',
  yellow02: '#FAAF05',
  yellow03: '#FDE79A',
  yellow04: '#FFF4CF',
  // Brown
  brown01: '#523719',
  brown02: '#B68D5D',
  brown03: '#E8D0B5',
  brown04: '#EDE3D7',
} as const;

// ---------------------------------------------------------------------------
// NSW Government Aboriginal colour palette  (MIT licence)
// Intended for content relating to Aboriginal audiences or Country.
// Source: https://designsystem.nsw.gov.au/core/colour/index.html#aboriginal-palette
// Brand guidelines: https://branding.nsw.gov.au/guidelines/aboriginal-branding
// ---------------------------------------------------------------------------

export const NSW_ABORIGINAL_PALETTE = {
  // Red family
  earthRed:      '#950906',
  emberRed:      '#E1261C',
  coralPink:     '#FBB4B3',
  galahPink:     '#FDD9D9',
  // Orange family
  deepOrange:    '#882600',
  orangeOchre:   '#EE6314',
  clayOrange:    '#F4AA7D',
  sunsetOrange:  '#F9D4BE',
  // Brown family
  riverbedBrown: '#552105',
  firewoodBrown: '#9E5332',
  claystoneBrown:'#D39165',
  macadamiaBrown:'#E9C8B2',
  // Yellow family
  bushHoneyYellow:    '#895E00',
  sandstoneYellow:    '#FEA927',
  goldenWattleYellow: '#FEE48C',
  sunbeamYellow:      '#FFF1C5',
  // Green family (Country)
  bushlandGreen:  '#215834',
  marshlandLime:  '#78A146',  // 6.25:1 on site surface ✓ — use for First Nations icons
  gumleafGreen:   '#B5CDA4',
  saltbushGreen:  '#DAE6D1',
  // Blue family (Country)
  billabongBlue:  '#00405E',
  saltwaterBlue:  '#0D6791',
  lightWaterBlue: '#84C5D1',
  coastalBlue:    '#C1E2E8',
  // Purple family
  bushPlum:       '#472642',
  spiritLilac:    '#9A5E93',
  lilliPilliPurple: '#C99AC2',
  duskPurple:     '#E4CCE0',
  // Neutral greys
  charcoalGrey:   '#272727',
  emuGrey:        '#555555',
  ashGrey:        '#CCC6C2',
  smokeGrey:      '#E5E3E0',
} as const;

// ---------------------------------------------------------------------------
// Core palette
// Where a current colour aligns with an NSW palette value, we reference it
// directly so the connection is explicit. Custom values are noted as such.
// ---------------------------------------------------------------------------

export const PALETTE = {
  // Backgrounds (custom — dark archival theme)
  bg:          '#0c0c14',
  surface:     '#13131e',
  surface2:    '#1c1c2a',
  border:      '#2a2a40',

  // Text (custom)
  text:        '#dcdcf0',
  muted:       '#8585af',  // lightened from #7878a0 — WCAG AA on all surfaces

  // Brand (custom — warm gold)
  accent:      '#c49a5a',
  link:        '#7eb8f8',
  linkVisited: '#a390e8',

  // Finding / site-status (custom — muted, serious; WCAG-checked badge pairs in BADGE_TOKENS)
  homicide:    '#c94444',
  probable:    '#c97444',
  possible:    '#c49a5a',
  open:        '#9090b8',  // lightened from #7878a0 — WCAG AA; unified across CSS + pins
  excluded:    '#4a4a60',

  // Location / map types — NSW palette aligned
  beat:        NSW_PALETTE.teal02,      // #2E808E  (was #2a9d8f — very close, now aligned)
  venue:       NSW_PALETTE.purple02,    // #8055F1  (was #9d4edd)
  police:      '#4a7faa',              // custom — between NSW blue01/02; neither fits dark theme
  institution: '#6b7280',              // custom
  memorial:    '#c8a84b',              // custom — warm gold, distinct from accent
  locOther:    '#5a5a72',              // custom

  // Event types
  activism:       '#e07c24',           // custom — warm orange
  legalMilestone: NSW_PALETTE.green02, // #00AA45  (was #4a9d8f — green = progress/law reform)
  inquiry:        '#7878a0',           // custom — grey, distinct from venue purple
  political:      '#6b8fa0',           // custom — muted blue
  community:      '#4a9d6f',           // custom — softer green, distinct from legalMilestone

  // First Nations / Country — Aboriginal palette
  // Marshland Lime: contrast 6.25:1 on site surface ✓
  firstNations: NSW_ABORIGINAL_PALETTE.marshlandLime,  // #78A146
} as const;

// ---------------------------------------------------------------------------
// Badge colour pairs  (background + foreground, WCAG-checked — keep together)
// NSW palette ramps used where available: 01 = bg, 02 = border, 03 = text.
// If you change a background, re-verify the text contrast before deploying.
// ---------------------------------------------------------------------------

export const BADGE_TOKENS = {
  // Finding badges (custom — deliberately muted/serious)
  homicideBg:    '#3a1010',
  homicideText:  '#e06060',  // 4.9:1 on homicideBg ✓
  probableBg:    '#2e1a08',
  possibleBg:    '#2a2008',
  openBg:        '#1a1a28',
  excludedBg:    '#18181e',

  // SCOI category badges (custom)
  scoiBg:           '#0e1a28',
  scoiAText:        '#7eb8f8',
  scoiBText:        '#a8c8f8',
  scoiABorder:      '#3060a0',
  scoiBBorder:      '#254870',

  // Beat badge — NSW Teal ramp (01 bg → 02 border → 03 text)
  beatBg:        NSW_PALETTE.teal01,   // #0B3F47  — 4.9:1 text contrast ✓
  beatText:      NSW_PALETTE.teal03,   // #8CDBE5
  beatBorder:    NSW_PALETTE.teal02,   // #2E808E

  // Venue badge — NSW Purple ramp (01 bg → 02 border → 03 text)
  venueBg:       NSW_PALETTE.purple01, // #441170  — 8.9:1 text contrast ✓
  venueText:     NSW_PALETTE.purple03, // #CEBFFF
  venueBorder:   NSW_PALETTE.purple02, // #8055F1

  // Stub records (custom — amber warning)
  stubBg:        '#1e1608',
  stubText:      '#c0901a',
  stubBorder:    '#6a4a08',

  // Content warning block (custom)
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

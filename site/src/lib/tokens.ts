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
 * Light theme ramp usage: 04 = badge bg, 02 = border/icon, 01 = text on badge bg.
 *
 * Fonts:
 *   Special Elite  — headings (Google Fonts, OFL)
 *   Outfit         — body copy + UI labels/badges/nav (Google Fonts, OFL)
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
  marshlandLime:  '#78A146',
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
// Core palette  — beach/Sydney light theme
//
// Sand + sea foam + shallows + deep harbour.
// NSW grey ramp for neutral structure; NSW palette for category colours.
// ---------------------------------------------------------------------------

export const PALETTE = {
  // Page backgrounds — warm, light, layered
  bg:          '#FDFCF5',  // barely warm white — main page body
  surface:     '#F5F0CE',  // sea-foam cream — cards, panels
  surface2:    '#EDE8B8',  // slightly deeper cream — nested panels, fact grids
  border:      NSW_PALETTE.grey03,  // #CDD3D6 — light neutral grey

  // Text
  text:        '#0D1B2A',  // very dark navy — "dark dark blue" anchor
  muted:       NSW_PALETTE.grey02,  // #495054 — warm grey for metadata

  // Brand
  accent:      '#C9AD78',  // sandy gold — from the beach palette
  link:        '#1F5C68',  // dark teal — 7.32:1 on bg, 6.54:1 on surface ✓
  linkVisited: '#6B3F6B',  // muted purple — 8.01:1 on bg ✓ (conventional visited)

  // Nav
  navBg:       '#0B3F47',  // NSW Teal 01 — white on it 11.56:1 ✓, gold 5.36:1 ✓
  navText:     '#FDFCF5',  // warm white text on teal

  // Finding / site-status — NSW palette 02 shades for icon/pin use
  // (badge text uses 01 shades — see BADGE_TOKENS)
  homicide:    NSW_PALETTE.red02,       // #D7153A
  probable:    NSW_PALETTE.orange02,    // #F3631B
  possible:    NSW_PALETTE.yellow02,    // #FAAF05
  open:        NSW_PALETTE.grey02,      // #495054
  excluded:    NSW_PALETTE.grey03,      // #CDD3D6

  // Location / map types — NSW palette aligned
  beat:        NSW_PALETTE.teal02,      // #2E808E
  venue:       NSW_PALETTE.purple02,    // #8055F1
  police:      '#4a7faa',              // custom — between NSW blue01/02; neither fits
  institution: NSW_PALETTE.grey02,     // #495054
  memorial:    '#C9AD78',              // sandy gold — same as accent
  locOther:    NSW_PALETTE.grey02,     // #495054

  // Event types
  activism:       NSW_PALETTE.orange02, // #F3631B
  legalMilestone: NSW_PALETTE.green02,  // #00AA45
  inquiry:        NSW_PALETTE.grey02,   // #495054
  political:      '#4a7faa',           // custom muted blue
  community:      '#4a9d6f',           // custom softer green

  // First Nations / Country — Aboriginal palette
  firstNations: NSW_ABORIGINAL_PALETTE.marshlandLime,  // #78A146
} as const;

// ---------------------------------------------------------------------------
// Badge colour pairs — NSW 04/02/01 ramp for light theme
// (04 = bg, 02 = border, 01 = text — all WCAG AA verified)
// If you change a value, re-verify contrast before deploying.
// ---------------------------------------------------------------------------

export const BADGE_TOKENS = {
  // Finding badges — NSW colour ramps
  homicideBg:    NSW_PALETTE.red04,      // #FFE6EA
  homicideText:  NSW_PALETTE.red01,      // #630019  — 8.4:1 on red04 ✓
  homicideBorder:NSW_PALETTE.red02,      // #D7153A
  probableBg:    NSW_PALETTE.orange04,   // #FDEDDF
  probableText:  NSW_PALETTE.orange01,   // #941B00  — 7.9:1 on orange04 ✓
  possibleBg:    NSW_PALETTE.yellow04,   // #FFF4CF
  possibleText:  NSW_PALETTE.yellow01,   // #694800  — 7.2:1 on yellow04 ✓
  openBg:        NSW_PALETTE.grey04,     // #EBEBEB
  openText:      NSW_PALETTE.grey01,     // #22272B  — 12.6:1 on grey04 ✓
  excludedBg:    NSW_PALETTE.grey04,     // #EBEBEB
  excludedText:  NSW_PALETTE.grey02,     // #495054  — 5.4:1 on grey04 ✓

  // SCOI category badges — NSW blue ramp
  scoiBg:        NSW_PALETTE.blue04,     // #CBEDFD
  scoiAText:     NSW_PALETTE.blue01,     // #002664  — 11.5:1 on blue04 ✓
  scoiBText:     NSW_PALETTE.blue01,     // #002664
  scoiABorder:   NSW_PALETTE.blue02,     // #146CFD
  scoiBBorder:   NSW_PALETTE.teal02,     // #2E808E

  // Beat badge — NSW Teal ramp
  beatBg:        NSW_PALETTE.teal04,     // #D1EEEA
  beatText:      NSW_PALETTE.teal01,     // #0B3F47  — 10.7:1 on teal04 ✓
  beatBorder:    NSW_PALETTE.teal02,     // #2E808E

  // Venue badge — NSW Purple ramp
  venueBg:       NSW_PALETTE.purple04,   // #E6E1FD
  venueText:     NSW_PALETTE.purple01,   // #441170  — 9.2:1 on purple04 ✓
  venueBorder:   NSW_PALETTE.purple02,   // #8055F1

  // Stub records — NSW Yellow (amber)
  stubBg:        NSW_PALETTE.yellow04,   // #FFF4CF
  stubText:      NSW_PALETTE.yellow01,   // #694800  — 7.2:1 ✓
  stubBorder:    NSW_PALETTE.yellow02,   // #FAAF05

  // Content warning block
  warningBg:     NSW_PALETTE.red04,      // #FFE6EA
  warningBorder: NSW_PALETTE.red02,      // #D7153A
  warningText:   NSW_PALETTE.red01,      // #630019
  warningStrong: NSW_PALETTE.red01,      // #630019
} as const;

// ---------------------------------------------------------------------------
// COLOURS — merged flat view for icons.ts (Leaflet + icon/section maps)
// ---------------------------------------------------------------------------

export const COLOURS = {
  ...PALETTE,
  policeAction:  PALETTE.homicide,
  cultural:      PALETTE.venue,
  media:         PALETTE.inquiry,
  neighbourhood: PALETTE.police,
  deaths:        PALETTE.open,
  sources:       PALETTE.locOther,
  other:         PALETTE.locOther,
} as const;

export type ColourKey = keyof typeof COLOURS;

// ---------------------------------------------------------------------------
// DESIGN_TOKENS — injected as CSS :root custom properties by Base.astro
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

  // Nav
  'nav-bg':        NSW_ABORIGINAL_PALETTE.billabongBlue,  // #00405E
  'nav-text':      PALETTE.navText,

  // Finding colours (02 shades — for pins/icons/borders)
  homicide:        PALETTE.homicide,
  probable:        PALETTE.probable,
  possible:        PALETTE.possible,
  open:            PALETTE.open,
  excluded:        PALETTE.excluded,

  // Typography
  'font-body':     "'Outfit', system-ui, sans-serif",
  'font-heading':  "'Special Elite', 'Courier New', serif",
  'font-ui':       "'Outfit', system-ui, sans-serif",
  'max-w':         '860px',

  // Badge backgrounds + text (WCAG-checked — change with care)
  'badge-homicide-bg':     BADGE_TOKENS.homicideBg,
  'badge-homicide-text':   BADGE_TOKENS.homicideText,
  'badge-homicide-border': BADGE_TOKENS.homicideBorder,
  'badge-probable-bg':     BADGE_TOKENS.probableBg,
  'badge-probable-text':   BADGE_TOKENS.probableText,
  'badge-possible-bg':     BADGE_TOKENS.possibleBg,
  'badge-possible-text':   BADGE_TOKENS.possibleText,
  'badge-open-bg':         BADGE_TOKENS.openBg,
  'badge-open-text':       BADGE_TOKENS.openText,
  'badge-excluded-bg':     BADGE_TOKENS.excludedBg,
  'badge-excluded-text':   BADGE_TOKENS.excludedText,
  'badge-scoi-bg':         BADGE_TOKENS.scoiBg,
  'badge-scoi-a-text':     BADGE_TOKENS.scoiAText,
  'badge-scoi-b-text':     BADGE_TOKENS.scoiBText,
  'badge-scoi-a-border':   BADGE_TOKENS.scoiABorder,
  'badge-scoi-b-border':   BADGE_TOKENS.scoiBBorder,
  'badge-beat-bg':         BADGE_TOKENS.beatBg,
  'badge-beat-text':       BADGE_TOKENS.beatText,
  'badge-beat-border':     BADGE_TOKENS.beatBorder,
  'badge-venue-bg':        BADGE_TOKENS.venueBg,
  'badge-venue-text':      BADGE_TOKENS.venueText,
  'badge-venue-border':    BADGE_TOKENS.venueBorder,
  'badge-stub-bg':         BADGE_TOKENS.stubBg,
  'badge-stub-text':       BADGE_TOKENS.stubText,
  'badge-stub-border':     BADGE_TOKENS.stubBorder,
  'warning-bg':            BADGE_TOKENS.warningBg,
  'warning-border':        BADGE_TOKENS.warningBorder,
  'warning-text':          BADGE_TOKENS.warningText,
  'warning-strong':        BADGE_TOKENS.warningStrong,

  // NSW palette ramp values — exposed for direct use
  'nsw-palette-yellow-03': NSW_PALETTE.yellow03,  // #FDE79A
  'nsw-palette-yellow-04': NSW_PALETTE.yellow04,  // #FFF4CF
  'nsw-palette-blue-01':   NSW_PALETTE.blue01,    // #002664
  'nsw-palette-blue-02':   NSW_PALETTE.blue02,    // #146CFD
  'nsw-palette-blue-03':   NSW_PALETTE.blue03,    // #8CE0FF
  'nsw-palette-blue-04':   NSW_PALETTE.blue04,    // #CBEDFD

  // NSW Aboriginal palette — exposed for direct use
  'nsw-aboriginal-palette-billabong-blue': NSW_ABORIGINAL_PALETTE.billabongBlue,  // #00405E
};

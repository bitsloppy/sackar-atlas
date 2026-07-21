/**
 * Sackar Atlas — Central Icon Registry
 *
 * Icon definitions and schema-value → visual mappings.
 * Colours come from tokens.ts — do not define colours here.
 *
 * Usage in Astro pages (server-side):
 *   import { ICONS, COLOURS, SECTION_TYPE } from '../lib/icons';
 *
 * Usage in Leaflet maps (client-side via define:vars):
 *   const faIconsJson = JSON.stringify(ICONS);
 *   // then in the <script>: const FA = JSON.parse(faIconsJson);
 */

import {
  // Location types / roles
  faLocationDot,
  faPeoplePants,
  faMartiniGlass,
  faShieldHalved,
  faBuilding,
  faCity,
  // Event types
  faHandFist,
  faCandleHolder,
  faSirenOn,
  faScaleBalanced,
  faMagnifyingGlass,
  faMasksTheater,
  faLandmark,
  faPeopleGroup,
  faNewspaper,
  faStar,
  // First Nations / geography
  faEarthOceania,
} from '@fortawesome/pro-solid-svg-icons';

// ---------------------------------------------------------------------------
// Icon data extractor
// ---------------------------------------------------------------------------

type FaIconDef = { icon: [number, number, unknown, unknown, string | string[]] };

/** Extract { w, h, path } from a Font Awesome icon definition. */
export function iconData(def: FaIconDef) {
  const [w, h, , , pathRaw] = def.icon;
  const path = Array.isArray(pathRaw) ? pathRaw.join(' ') : (pathRaw as string);
  return { w, h, path };
}

export type IconDatum = ReturnType<typeof iconData>;

// ---------------------------------------------------------------------------
// Icon registry
// All FA icons used anywhere on the site — map pins, section cards, badges.
// ---------------------------------------------------------------------------

export const ICONS = {
  // Location types / roles
  locationDot:     iconData(faLocationDot),
  peoplePants:     iconData(faPeoplePants),
  martiniGlass:    iconData(faMartiniGlass),
  shieldHalved:    iconData(faShieldHalved),
  building:        iconData(faBuilding),
  city:            iconData(faCity),
  // Event types
  handFist:        iconData(faHandFist),
  candleHolder:    iconData(faCandleHolder),
  sirenOn:         iconData(faSirenOn),
  scaleBalanced:   iconData(faScaleBalanced),
  magnifyingGlass: iconData(faMagnifyingGlass),
  masksTheater:    iconData(faMasksTheater),
  landmark:        iconData(faLandmark),
  peopleGroup:     iconData(faPeopleGroup),
  newspaper:       iconData(faNewspaper),
  star:            iconData(faStar),
  // First Nations / geography
  earthOceania:    iconData(faEarthOceania),
} as const;

export type IconKey = keyof typeof ICONS;

// Colours live in tokens.ts — imported here for internal map use and re-exported.
import { COLOURS } from './tokens';
export { COLOURS };

// ---------------------------------------------------------------------------
// Schema-value → visual mappings
// ---------------------------------------------------------------------------

/**
 * Location role → icon key + colour + pin size.
 * Covers location_roles[] enum values and location_type fallbacks.
 */
export const LOCATION_ROLE_MAP: Record<string, { icon: IconKey; colour: string; size?: number }> = {
  beat:                  { icon: 'peoplePants',    colour: COLOURS.beat,         size: 28 },
  'nightlife-venue':     { icon: 'martiniGlass',   colour: COLOURS.venue,        size: 28 },
  'police-jurisdiction': { icon: 'shieldHalved',   colour: COLOURS.police,       size: 26 },
  memorial:              { icon: 'candleHolder',   colour: COLOURS.memorial,     size: 26 },
  neighbourhood:         { icon: 'city',           colour: COLOURS.neighbourhood, size: 26 },
  institution:           { icon: 'building',       colour: COLOURS.institution,  size: 24 },
  other:                 { icon: 'building',       colour: COLOURS.other,        size: 24 },
};

/**
 * Event type → icon key + colour.
 * Covers the event_type enum in the events collection.
 */
export const EVENT_TYPE_MAP: Record<string, { icon: IconKey; colour: string }> = {
  activism:          { icon: 'handFist',        colour: COLOURS.activism },
  'police-action':   { icon: 'sirenOn',         colour: COLOURS.policeAction },
  'legal-milestone': { icon: 'scaleBalanced',   colour: COLOURS.legalMilestone },
  inquiry:           { icon: 'magnifyingGlass', colour: COLOURS.inquiry },
  cultural:          { icon: 'masksTheater',    colour: COLOURS.cultural },
  political:         { icon: 'landmark',        colour: COLOURS.political },
  community:         { icon: 'peopleGroup',     colour: COLOURS.community },
  media:             { icon: 'newspaper',       colour: COLOURS.media },
  memorial:          { icon: 'candleHolder',    colour: COLOURS.memorial },
  other:             { icon: 'star',            colour: COLOURS.other },
};

/**
 * Case site-status → colour.
 * Covers manner_findings.site_status enum values.
 */
export const SITE_STATUS_COLOUR: Record<string, string> = {
  'confirmed-homicide': COLOURS.homicide,
  probable:             COLOURS.probable,
  possible:             COLOURS.possible,
  open:                 COLOURS.open,
  undetermined:         COLOURS.open,
  excluded:             COLOURS.excluded,
  missing:              COLOURS.open,
};

/**
 * Section type → icon key + colour.
 * Used for the accordion section cards on detail pages.
 * 'type' matches the sections[].type enum in the content schema.
 */
export const SECTION_TYPE_MAP: Record<string, { icon: IconKey; colour: string }> = {
  beat:            { icon: 'peoplePants',    colour: COLOURS.beat },
  deaths:          { icon: 'locationDot',    colour: COLOURS.deaths },
  'first-nations': { icon: 'earthOceania',  colour: COLOURS.firstNations },
  memorial:        { icon: 'candleHolder',   colour: COLOURS.memorial },
  investigation:   { icon: 'magnifyingGlass', colour: COLOURS.inquiry },
  legal:           { icon: 'scaleBalanced',  colour: COLOURS.legalMilestone },
  cultural:        { icon: 'masksTheater',   colour: COLOURS.cultural },
  sources:         { icon: 'newspaper',      colour: COLOURS.sources },
  people:          { icon: 'peopleGroup',    colour: COLOURS.community },
  events:          { icon: 'handFist',       colour: COLOURS.activism },
  cases:           { icon: 'locationDot',    colour: COLOURS.deaths },
  locations:       { icon: 'city',           colour: COLOURS.neighbourhood },
  general:         { icon: 'star',           colour: COLOURS.other },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build an inline SVG string for a given icon key and size.
 * aria-hidden="true" — caller must provide accessible text separately.
 */
export function inlineSvg(key: IconKey, sizePx: number, colour = 'currentColor'): string {
  const ic = ICONS[key];
  const h  = sizePx;
  const w  = Math.round(h * (ic.w / ic.h));
  return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" `
       + `viewBox="0 0 ${ic.w} ${ic.h}" width="${w}" height="${h}" fill="${colour}">`
       + `<path d="${ic.path}"/></svg>`;
}

// Deep links to dnd2024.wikidot.com, at the user's request. URL patterns
// below were confirmed against the live site (not guessed): category index
// pages are exact; per-item pages follow "{category}:{slug}" using the same
// lowercase-hyphenated slug our SRD data already uses for srdIndex, verified
// against real examples (species:elf, species:dwarf, spell:reincarnate,
// background:acolyte, background:merchant, cleric:main, wizard:diviner).
//
// This wiki documents the 2024 revised rules, while this app's automated
// data comes from the 2014 SRD - names mostly line up, but an occasional
// item link may 404 if that entry was renamed/reworked in 2024. The category
// "browse all" links are unaffected and always work.

const BASE = 'http://dnd2024.wikidot.com'

export const WIKI_INDEX = {
  species: `${BASE}/species:all`,
  classes: `${BASE}/class:all`,
  backgrounds: `${BASE}/background:all`,
  spells: `${BASE}/spell:all`,
  feats: `${BASE}/feat:all`,
  equipment: `${BASE}/equipment:all`,
}

export function speciesLink(srdIndex: string): string {
  return `${BASE}/species:${srdIndex}`
}

export function classLink(srdIndex: string): string {
  return `${BASE}/${srdIndex}:main`
}

export function backgroundLink(slug: string): string {
  return `${BASE}/background:${slug}`
}

export function spellLink(srdIndex: string): string {
  return `${BASE}/spell:${srdIndex}`
}

/** Best-effort slugify for names we only have as free text (e.g. custom-picked PHB backgrounds). */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

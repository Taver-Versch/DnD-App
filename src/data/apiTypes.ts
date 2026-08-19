// Minimal typed subset of the D&D 5e SRD API (dnd5eapi.co) response shapes -
// only the fields this app actually reads.

export interface ApiRef {
  index: string
  name: string
  url: string
}

export interface ApiListResponse<T = ApiRef> {
  count: number
  results: T[]
}

export interface ApiSpellSummary extends ApiRef {
  level: number
}

export interface ApiClass {
  index: string
  name: string
  hit_die: number
  proficiencies: ApiRef[]
  saving_throws: ApiRef[]
  subclasses: ApiRef[]
  spellcasting?: { spellcasting_ability: ApiRef }
}

export interface ApiClassLevel {
  level: number
  ability_score_bonuses: number
  prof_bonus: number
  features: ApiRef[]
  spellcasting?: Record<string, number>
  class_specific: Record<string, unknown>
}

export interface ApiFeature {
  index: string
  name: string
  level: number
  desc: string[]
}

/**
 * 2024 PHB revision species shape (`/api/2024/species/...`). Notably lacks
 * `ability_bonuses`/`languages` - the 2024 rules moved ability score
 * increases and starting languages to background instead of species - but
 * this app never read those fields from race data anyway (only the name
 * list and `subspecies` for the subrace picker), so the shape change is a
 * pure upgrade: full coverage of the 2024 core species list (including
 * Goliath and Orc, absent from the old 2014 "races" endpoint) with real
 * subspecies/lineage data instead of a manual name list.
 */
export interface ApiSpecies {
  index: string
  name: string
  size: string
  speed: number
  traits: ApiRef[]
  subspecies: ApiRef[]
}

export interface ApiBackground {
  index: string
  name: string
  starting_proficiencies: ApiRef[]
  feature: { name: string; desc: string[] }
}

export interface ApiEquipment {
  index: string
  name: string
  equipment_category: ApiRef
  cost: { quantity: number; unit: string }
  weight?: number
  desc?: string[]
  damage?: { damage_dice: string; damage_type: ApiRef }
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number }
}

export interface ApiSpell {
  index: string
  name: string
  desc: string[]
  higher_level?: string[]
  range: string
  components: string[]
  duration: string
  concentration: boolean
  casting_time: string
  level: number
  school: ApiRef
  classes: ApiRef[]
}

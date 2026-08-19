// Core data model for a 5e character. This is the single source of truth that
// the zod schema (io/schema.ts) validates imports against, so keep it plain
// data (no methods/classes) and prefer optional fields over unions where
// possible to keep forward-compatible JSON imports easy.

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
export type AbilityKey = (typeof ABILITY_KEYS)[number]

export const SKILLS: Record<string, { label: string; ability: AbilityKey }> = {
  acrobatics: { label: 'Acrobatics', ability: 'dex' },
  animalHandling: { label: 'Animal Handling', ability: 'wis' },
  arcana: { label: 'Arcana', ability: 'int' },
  athletics: { label: 'Athletics', ability: 'str' },
  deception: { label: 'Deception', ability: 'cha' },
  history: { label: 'History', ability: 'int' },
  insight: { label: 'Insight', ability: 'wis' },
  intimidation: { label: 'Intimidation', ability: 'cha' },
  investigation: { label: 'Investigation', ability: 'int' },
  medicine: { label: 'Medicine', ability: 'wis' },
  nature: { label: 'Nature', ability: 'int' },
  perception: { label: 'Perception', ability: 'wis' },
  performance: { label: 'Performance', ability: 'cha' },
  persuasion: { label: 'Persuasion', ability: 'cha' },
  religion: { label: 'Religion', ability: 'int' },
  sleightOfHand: { label: 'Sleight of Hand', ability: 'dex' },
  stealth: { label: 'Stealth', ability: 'dex' },
  survival: { label: 'Survival', ability: 'wis' },
}
export type SkillKey = keyof typeof SKILLS

/** Something that can either be picked from the SRD API or hand-authored by the user. */
export interface SourcedRef {
  name: string
  /** SRD API index (e.g. "fireball"), absent for custom/homebrew entries. */
  srdIndex?: string
  source: 'srd' | 'custom'
}

export type HitDie = 6 | 8 | 10 | 12

export interface CharacterClassLevel extends SourcedRef {
  id: string
  level: number
  hitDie: HitDie
  subclass?: SourcedRef
}

export interface SkillState {
  proficient: boolean
  expertise: boolean
}

export interface HitPoints {
  max: number
  current: number
  temp: number
}

export interface HitDicePool {
  total: number
  remaining: number
  die: HitDie
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface Attack {
  id: string
  name: string
  bonus: string
  damage: string
  damageType: string
  notes: string
}

export interface InventoryItem extends SourcedRef {
  id: string
  quantity: number
  weight: number
  description: string
  equipped: boolean
}

export interface Currency {
  cp: number
  sp: number
  ep: number
  gp: number
  pp: number
}

export interface Feature extends SourcedRef {
  id: string
  description: string
  levelGained?: number
  origin: 'race' | 'class' | 'background' | 'feat' | 'other'
}

/** Generalized limited-use resource: Ki, Rage charges, Bardic Inspiration, Second Wind, etc. */
export interface Resource {
  id: string
  name: string
  max: number
  current: number
  resetOn: 'short' | 'long'
}

export interface SpellSlotLevel {
  max: number
  used: number
}

export interface Spell extends SourcedRef {
  id: string
  level: number
  school: string
  prepared: boolean
  description: string
}

export interface Spellcasting {
  ability: AbilityKey | null
  slots: Record<number, SpellSlotLevel>
  /** Pact magic (Warlock) tracked separately since it doesn't share the normal slot pool. */
  pactSlots: SpellSlotLevel | null
  spells: Spell[]
  /** Name of the spell currently being concentrated on, if any. */
  concentratingOn: string | null
}

/** An active condition on the character - standard (from CONDITIONS) or custom/homebrew. */
export interface ActiveCondition {
  id: string
  name: string
  source: 'standard' | 'custom'
  note: string
}

export interface SessionLogEntry {
  id: string
  date: string
  text: string
}

export interface Companion {
  name: string
  race: string
  armorClass: number
  hitPoints: HitPoints
  speed: number
  attacks: Attack[]
}

export const SECTION_KEYS = [
  'attacks',
  'inventory',
  'features',
  'spellcasting',
  'resources',
  'notes',
  'sessionLog',
  'companion',
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export interface UiPrefs {
  visibleSections: Record<SectionKey, boolean>
}

export interface Character {
  id: string
  schemaVersion: 1
  createdAt: string
  updatedAt: string

  name: string
  classes: CharacterClassLevel[]
  race: SourcedRef | null
  subrace: SourcedRef | null
  background: SourcedRef | null
  alignment: string
  xp: number
  playerName: string

  abilityScores: Record<AbilityKey, number>
  skills: Record<SkillKey, SkillState>
  savingThrowProficiencies: AbilityKey[]

  armorClass: number
  initiativeBonus: number
  speed: number
  hitPoints: HitPoints
  hitDice: HitDicePool[]
  deathSaves: DeathSaves

  attacks: Attack[]
  inventory: InventoryItem[]
  currency: Currency
  features: Feature[]
  spellcasting: Spellcasting
  resources: Resource[]
  notes: string
  sessionLog: SessionLogEntry[]
  companion: Companion | null

  conditions: ActiveCondition[]
  exhaustion: number
  inspiration: boolean

  uiPrefs: UiPrefs
}

export function totalLevel(classes: CharacterClassLevel[]): number {
  return classes.reduce((sum, c) => sum + c.level, 0)
}

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

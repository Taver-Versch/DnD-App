import type { CharacterClassLevel, SpellSlotLevel } from '../../store/types'

export type CasterProgression = 'full' | 'half' | 'third' | 'pact' | 'none'

/** Which spell-slot progression each SRD class index uses. */
const CLASS_PROGRESSION: Record<string, CasterProgression> = {
  bard: 'full',
  cleric: 'full',
  druid: 'full',
  sorcerer: 'full',
  wizard: 'full',
  paladin: 'half',
  ranger: 'half',
  warlock: 'pact',
  // Fighter (Eldritch Knight) and Rogue (Arcane Trickster) are 'third' casters,
  // but that only applies once the subclass is chosen - callers can pass 'third'
  // explicitly via progressionOverride for those characters.
}

export function progressionForClass(classSrdIndex: string): CasterProgression {
  return CLASS_PROGRESSION[classSrdIndex] ?? 'none'
}

// Standard full-caster slot table: [level][spellLevel 1-9]
const FULL_CASTER_TABLE: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

// Half-caster table (Paladin/Ranger): no slots at class level 1, starts at level 2.
const HALF_CASTER_TABLE: number[][] = [
  [0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0],
  [3, 0, 0, 0, 0],
  [3, 0, 0, 0, 0],
  [4, 2, 0, 0, 0],
  [4, 2, 0, 0, 0],
  [4, 3, 0, 0, 0],
  [4, 3, 0, 0, 0],
  [4, 3, 2, 0, 0],
  [4, 3, 2, 0, 0],
  [4, 3, 3, 0, 0],
  [4, 3, 3, 0, 0],
  [4, 3, 3, 1, 0],
  [4, 3, 3, 1, 0],
  [4, 3, 3, 2, 0],
  [4, 3, 3, 2, 0],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2],
]

// Third-caster table (Eldritch Knight / Arcane Trickster): starts at class level 3.
const THIRD_CASTER_TABLE: number[][] = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [2, 0, 0, 0],
  [3, 0, 0, 0],
  [3, 0, 0, 0],
  [3, 0, 0, 0],
  [4, 2, 0, 0],
  [4, 2, 0, 0],
  [4, 2, 0, 0],
  [4, 3, 0, 0],
  [4, 3, 0, 0],
  [4, 3, 0, 0],
  [4, 3, 2, 0],
  [4, 3, 2, 0],
  [4, 3, 2, 0],
  [4, 3, 3, 0],
  [4, 3, 3, 0],
  [4, 3, 3, 0],
  [4, 3, 3, 1],
  [4, 3, 3, 1],
]

// Pact Magic (Warlock): [level] -> { slots, slotLevel }
const PACT_MAGIC_TABLE: { slots: number; slotLevel: number }[] = [
  { slots: 1, slotLevel: 1 },
  { slots: 2, slotLevel: 1 },
  { slots: 2, slotLevel: 2 },
  { slots: 2, slotLevel: 2 },
  { slots: 2, slotLevel: 3 },
  { slots: 2, slotLevel: 3 },
  { slots: 2, slotLevel: 4 },
  { slots: 2, slotLevel: 4 },
  { slots: 2, slotLevel: 5 },
  { slots: 2, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 3, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
  { slots: 4, slotLevel: 5 },
]

function tableRowToSlots(row: number[]): Record<number, SpellSlotLevel> {
  const slots: Record<number, SpellSlotLevel> = {}
  row.forEach((max, i) => {
    if (max > 0) slots[i + 1] = { max, used: 0 }
  })
  return slots
}

/** Effective "caster level" contribution of a single class toward the multiclass slot table. */
export function casterLevelContribution(progression: CasterProgression, classLevel: number): number {
  switch (progression) {
    case 'full':
      return classLevel
    case 'half':
      return Math.floor(classLevel / 2)
    case 'third':
      return Math.floor(classLevel / 3)
    default:
      return 0
  }
}

/**
 * Computes normal spell slots for a (possibly multiclass) character using the
 * PHB multiclass spellcaster rules, plus Pact Magic slots for any Warlock levels
 * (tracked separately since they don't share the normal slot pool).
 *
 * `progressionOverrides` lets callers mark subclasses like Eldritch Knight /
 * Arcane Trickster as 'third' casters, since that depends on subclass choice
 * rather than the base class.
 */
export function computeSpellSlots(
  classes: CharacterClassLevel[],
  progressionOverrides: Record<string, CasterProgression> = {}
): { slots: Record<number, SpellSlotLevel>; pactSlots: SpellSlotLevel | null } {
  let casterLevel = 0
  let warlockLevel = 0

  for (const cls of classes) {
    const progression = progressionOverrides[cls.srdIndex ?? cls.name] ?? progressionForClass(cls.srdIndex ?? '')
    if (progression === 'pact') {
      warlockLevel += cls.level
      continue
    }
    casterLevel += casterLevelContribution(progression, cls.level)
  }

  const slots: Record<number, SpellSlotLevel> =
    casterLevel > 0 ? tableRowToSlots(FULL_CASTER_TABLE[Math.min(20, casterLevel) - 1]) : {}

  let pactSlots: SpellSlotLevel | null = null
  if (warlockLevel > 0) {
    const row = PACT_MAGIC_TABLE[Math.min(20, warlockLevel) - 1]
    pactSlots = { max: row.slots, used: 0 }
  }

  return { slots, pactSlots }
}

/** Single-class convenience lookup, useful for previewing a class's own table (e.g. in the level-up wizard). */
export function slotsForSingleClass(
  progression: CasterProgression,
  classLevel: number
): Record<number, SpellSlotLevel> {
  const level = Math.min(20, Math.max(1, classLevel))
  if (progression === 'full') return tableRowToSlots(FULL_CASTER_TABLE[level - 1])
  if (progression === 'half') return tableRowToSlots(HALF_CASTER_TABLE[level - 1])
  if (progression === 'third') return tableRowToSlots(THIRD_CASTER_TABLE[level - 1])
  return {}
}

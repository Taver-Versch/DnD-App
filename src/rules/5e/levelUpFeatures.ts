import type { ApiClassLevel, ApiRef } from '../../data/apiTypes'
import { getClassLevels } from '../../data/dataProvider'

export interface LevelUpChanges {
  classLevel: number
  profBonus: number
  features: ApiRef[]
  grantsAsi: boolean
  classSpecific: Record<string, unknown>
  spellSlotsThisLevel?: Record<string, number>
}

/** Pure aggregation step, kept separate from the fetch so it's unit-testable with fixture data. */
export function aggregateLevelChanges(
  levels: ApiClassLevel[],
  newClassLevel: number
): LevelUpChanges | undefined {
  const found = levels.find((l) => l.level === newClassLevel)
  if (!found) return undefined

  const grantsAsi = found.features.some((f) => f.index.includes('ability-score-improvement'))

  return {
    classLevel: found.level,
    profBonus: found.prof_bonus,
    features: found.features,
    grantsAsi,
    classSpecific: found.class_specific ?? {},
    spellSlotsThisLevel: found.spellcasting,
  }
}

/** Fetches a class's level table (cached after first call) and returns what changes at newClassLevel. */
export async function getLevelUpChanges(
  classSrdIndex: string,
  newClassLevel: number
): Promise<LevelUpChanges | undefined> {
  const levels = await getClassLevels(classSrdIndex)
  return aggregateLevelChanges(levels, newClassLevel)
}

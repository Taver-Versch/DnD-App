import { describe, expect, it } from 'vitest'
import { aggregateLevelChanges } from './levelUpFeatures'
import type { ApiClassLevel } from '../../data/apiTypes'

const FIXTURE_LEVELS: ApiClassLevel[] = [
  { level: 1, ability_score_bonuses: 0, prof_bonus: 2, features: [], class_specific: {} },
  {
    level: 4,
    ability_score_bonuses: 1,
    prof_bonus: 2,
    features: [
      { index: 'fighter-ability-score-improvement', name: 'Ability Score Improvement', url: '' },
    ],
    class_specific: {},
  },
  {
    level: 5,
    ability_score_bonuses: 1,
    prof_bonus: 3,
    features: [{ index: 'extra-attack', name: 'Extra Attack', url: '' }],
    class_specific: { rage_count: 3 },
    spellcasting: { spell_slots_level_1: 4 },
  },
]

describe('aggregateLevelChanges', () => {
  it('returns undefined for a level not in the table', () => {
    expect(aggregateLevelChanges(FIXTURE_LEVELS, 99)).toBeUndefined()
  })

  it('flags ASI-granting levels by feature index', () => {
    const changes = aggregateLevelChanges(FIXTURE_LEVELS, 4)
    expect(changes?.grantsAsi).toBe(true)
  })

  it('does not flag non-ASI levels', () => {
    const changes = aggregateLevelChanges(FIXTURE_LEVELS, 5)
    expect(changes?.grantsAsi).toBe(false)
  })

  it('carries through features, class_specific, and spellcasting for the level', () => {
    const changes = aggregateLevelChanges(FIXTURE_LEVELS, 5)
    expect(changes?.features).toEqual([{ index: 'extra-attack', name: 'Extra Attack', url: '' }])
    expect(changes?.classSpecific).toEqual({ rage_count: 3 })
    expect(changes?.spellSlotsThisLevel).toEqual({ spell_slots_level_1: 4 })
    expect(changes?.profBonus).toBe(3)
  })
})

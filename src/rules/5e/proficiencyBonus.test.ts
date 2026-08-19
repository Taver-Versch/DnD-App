import { describe, expect, it } from 'vitest'
import { proficiencyBonusForLevel } from './proficiencyBonus'

describe('proficiencyBonusForLevel', () => {
  it('returns +2 for levels 1-4', () => {
    expect(proficiencyBonusForLevel(1)).toBe(2)
    expect(proficiencyBonusForLevel(4)).toBe(2)
  })

  it('returns +3 for levels 5-8', () => {
    expect(proficiencyBonusForLevel(5)).toBe(3)
    expect(proficiencyBonusForLevel(8)).toBe(3)
  })

  it('returns +4 for levels 9-12', () => {
    expect(proficiencyBonusForLevel(9)).toBe(4)
    expect(proficiencyBonusForLevel(12)).toBe(4)
  })

  it('returns +5 for levels 13-16', () => {
    expect(proficiencyBonusForLevel(13)).toBe(5)
    expect(proficiencyBonusForLevel(16)).toBe(5)
  })

  it('returns +6 for levels 17-20', () => {
    expect(proficiencyBonusForLevel(17)).toBe(6)
    expect(proficiencyBonusForLevel(20)).toBe(6)
  })

  it('clamps out-of-range levels', () => {
    expect(proficiencyBonusForLevel(0)).toBe(2)
    expect(proficiencyBonusForLevel(25)).toBe(6)
  })
})

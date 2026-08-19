import { describe, expect, it } from 'vitest'
import { averageHpGain, deriveHitDicePools, rollHitDie } from './hitDice'
import type { CharacterClassLevel, HitDicePool } from '../../store/types'

describe('averageHpGain', () => {
  it('rounds up per the PHB rule', () => {
    expect(averageHpGain(6)).toBe(4)
    expect(averageHpGain(8)).toBe(5)
    expect(averageHpGain(10)).toBe(6)
    expect(averageHpGain(12)).toBe(7)
  })
})

describe('rollHitDie', () => {
  it('always rolls within [1, die]', () => {
    for (let i = 0; i < 100; i++) {
      const roll = rollHitDie(8)
      expect(roll).toBeGreaterThanOrEqual(1)
      expect(roll).toBeLessThanOrEqual(8)
    }
  })
})

function makeClass(hitDie: 6 | 8 | 10 | 12, level: number): CharacterClassLevel {
  return { id: `${hitDie}-${level}`, name: 'Test', source: 'custom', hitDie, level }
}

describe('deriveHitDicePools', () => {
  it('groups classes by hit die and sums levels', () => {
    const pools = deriveHitDicePools([makeClass(10, 3), makeClass(6, 2)], [])
    expect(pools).toHaveLength(2)
    expect(pools.find((p) => p.die === 10)).toMatchObject({ die: 10, total: 3, remaining: 3 })
    expect(pools.find((p) => p.die === 6)).toMatchObject({ die: 6, total: 2, remaining: 2 })
  })

  it('merges two classes with the same die into one pool', () => {
    const pools = deriveHitDicePools([makeClass(8, 2), makeClass(8, 1)], [])
    expect(pools).toHaveLength(1)
    expect(pools[0]).toMatchObject({ die: 8, total: 3, remaining: 3 })
  })

  it('preserves already-spent dice when total grows', () => {
    const existing: HitDicePool[] = [{ die: 8, total: 2, remaining: 1 }]
    const pools = deriveHitDicePools([makeClass(8, 3)], existing)
    expect(pools[0]).toMatchObject({ die: 8, total: 3, remaining: 1 })
  })

  it('caps remaining at the new total if it shrinks', () => {
    const existing: HitDicePool[] = [{ die: 8, total: 5, remaining: 5 }]
    const pools = deriveHitDicePools([makeClass(8, 2)], existing)
    expect(pools[0]).toMatchObject({ die: 8, total: 2, remaining: 2 })
  })

  it('drops pools for die sizes no longer present', () => {
    const existing: HitDicePool[] = [{ die: 6, total: 2, remaining: 2 }]
    const pools = deriveHitDicePools([makeClass(10, 1)], existing)
    expect(pools.some((p) => p.die === 6)).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { computeSpellSlots, slotsForSingleClass } from './spellSlots'
import type { CharacterClassLevel } from '../../store/types'

function cls(name: string, hitDie: 6 | 8 | 10 | 12, level: number): CharacterClassLevel {
  return { id: name, name, srdIndex: name.toLowerCase(), source: 'srd', hitDie, level }
}

describe('slotsForSingleClass', () => {
  it('gives a level 1 wizard two 1st-level slots', () => {
    const slots = slotsForSingleClass('full', 1)
    expect(slots[1]).toEqual({ max: 2, used: 0 })
    expect(slots[2]).toBeUndefined()
  })

  it('gives a level 5 wizard the standard 4/3/2 spread', () => {
    const slots = slotsForSingleClass('full', 5)
    expect(slots[1].max).toBe(4)
    expect(slots[2].max).toBe(3)
    expect(slots[3].max).toBe(2)
  })

  it('gives a half-caster no slots at level 1', () => {
    expect(Object.keys(slotsForSingleClass('half', 1))).toHaveLength(0)
  })

  it('gives a level 2 paladin their first slots', () => {
    const slots = slotsForSingleClass('half', 2)
    expect(slots[1]).toEqual({ max: 2, used: 0 })
  })
})

describe('computeSpellSlots', () => {
  it('computes a single full caster directly off the table', () => {
    const { slots, pactSlots } = computeSpellSlots([cls('Wizard', 6, 5)])
    expect(slots[1].max).toBe(4)
    expect(pactSlots).toBeNull()
  })

  it('combines multiclass full + half casters using the multiclass table', () => {
    // Level 6 Wizard (full=6) + level 2 Paladin (half=1) => caster level 7
    const { slots } = computeSpellSlots([cls('Wizard', 6, 6), cls('Paladin', 10, 2)])
    const singleClassLevel7 = slotsForSingleClass('full', 7)
    expect(slots).toEqual(singleClassLevel7)
  })

  it('tracks warlock Pact Magic separately from normal slots', () => {
    const { slots, pactSlots } = computeSpellSlots([cls('Warlock', 8, 3)])
    expect(Object.keys(slots)).toHaveLength(0)
    expect(pactSlots).toEqual({ max: 2, used: 0 })
  })

  it('does not let warlock levels contribute to the multiclass full/half table', () => {
    const { slots } = computeSpellSlots([cls('Wizard', 6, 1), cls('Warlock', 8, 5)])
    // Only the level 1 wizard slots should show up in the shared pool.
    expect(slots).toEqual(slotsForSingleClass('full', 1))
  })

  it('returns no slots for a non-caster class', () => {
    const { slots, pactSlots } = computeSpellSlots([cls('Fighter', 10, 5)])
    expect(Object.keys(slots)).toHaveLength(0)
    expect(pactSlots).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'
import { createBlankCharacter } from '../../store/characterFactory'
import { resolveLongRest, resolveShortRest } from './restResolution'
import type { Character } from '../../store/types'

function withOverrides(overrides: Partial<Character>): Character {
  return { ...createBlankCharacter('Test'), ...overrides }
}

describe('resolveShortRest', () => {
  it('heals HP by roll + CON modifier per die spent, capped at max', () => {
    const character = withOverrides({
      hitPoints: { max: 20, current: 5, temp: 0 },
      hitDice: [{ die: 8, total: 3, remaining: 3 }],
      abilityScores: { str: 10, dex: 10, con: 14, int: 10, wis: 10, cha: 10 }, // +2 CON mod
    })
    const result = resolveShortRest(character, {
      spends: [{ die: 8, roll: 5 }, { die: 8, roll: 3 }],
      conModifier: 2,
    })
    // (5+2) + (3+2) = 12 healed, from 5 -> 17
    expect(result.hitPoints.current).toBe(17)
    expect(result.hitDice[0].remaining).toBe(1)
  })

  it('never heals past max HP', () => {
    const character = withOverrides({
      hitPoints: { max: 10, current: 9, temp: 0 },
      hitDice: [{ die: 6, total: 1, remaining: 1 }],
    })
    const result = resolveShortRest(character, { spends: [{ die: 6, roll: 6 }], conModifier: 3 })
    expect(result.hitPoints.current).toBe(10)
  })

  it('restores only short-rest resources', () => {
    const character = withOverrides({
      resources: [
        { id: '1', name: 'Ki', max: 4, current: 0, resetOn: 'short' },
        { id: '2', name: 'Rage', max: 2, current: 0, resetOn: 'long' },
      ],
    })
    const result = resolveShortRest(character, { spends: [], conModifier: 0 })
    expect(result.resources.find((r) => r.id === '1')?.current).toBe(4)
    expect(result.resources.find((r) => r.id === '2')?.current).toBe(0)
  })
})

describe('resolveLongRest', () => {
  it('restores HP to max and clears temp HP', () => {
    const character = withOverrides({ hitPoints: { max: 30, current: 10, temp: 5 } })
    const result = resolveLongRest(character)
    expect(result.hitPoints).toEqual({ max: 30, current: 30, temp: 0 })
  })

  it('recovers half of total hit dice, minimum 1', () => {
    const character = withOverrides({ hitDice: [{ die: 8, total: 5, remaining: 0 }] })
    const result = resolveLongRest(character)
    expect(result.hitDice[0].remaining).toBe(2) // floor(5/2) = 2

    const single = withOverrides({ hitDice: [{ die: 6, total: 1, remaining: 0 }] })
    const singleResult = resolveLongRest(single)
    expect(singleResult.hitDice[0].remaining).toBe(1) // minimum 1
  })

  it('does not exceed total hit dice when recovering', () => {
    const character = withOverrides({ hitDice: [{ die: 8, total: 4, remaining: 3 }] })
    const result = resolveLongRest(character)
    expect(result.hitDice[0].remaining).toBe(4)
  })

  it('restores all resources regardless of resetOn', () => {
    const character = withOverrides({
      resources: [
        { id: '1', name: 'Ki', max: 4, current: 0, resetOn: 'short' },
        { id: '2', name: 'Rage', max: 2, current: 0, resetOn: 'long' },
      ],
    })
    const result = resolveLongRest(character)
    expect(result.resources.every((r) => r.current === r.max)).toBe(true)
  })

  it('clears death saves', () => {
    const character = withOverrides({ deathSaves: { successes: 2, failures: 1 } })
    const result = resolveLongRest(character)
    expect(result.deathSaves).toEqual({ successes: 0, failures: 0 })
  })
})

import { describe, expect, it } from 'vitest'
import { asiLevelsForClass, grantsAsiAtLevel } from './asiLevels'

describe('asiLevelsForClass', () => {
  it('gives every class the base 4/8/12/16/19 levels', () => {
    expect(asiLevelsForClass('wizard')).toEqual([4, 8, 12, 16, 19])
  })

  it('gives fighter two extra ASI levels', () => {
    expect(asiLevelsForClass('fighter')).toEqual([4, 6, 8, 12, 14, 16, 19])
  })

  it('gives rogue one extra ASI level', () => {
    expect(asiLevelsForClass('rogue')).toEqual([4, 8, 10, 12, 16, 19])
  })
})

describe('grantsAsiAtLevel', () => {
  it('is true at a base ASI level for any class', () => {
    expect(grantsAsiAtLevel('wizard', 8)).toBe(true)
  })

  it('is true at a class-specific bonus level', () => {
    expect(grantsAsiAtLevel('fighter', 6)).toBe(true)
    expect(grantsAsiAtLevel('wizard', 6)).toBe(false)
  })

  it('is false at a non-ASI level', () => {
    expect(grantsAsiAtLevel('wizard', 5)).toBe(false)
  })
})

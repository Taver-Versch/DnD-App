import { describe, expect, it } from 'vitest'
import { levelForXp, XP_THRESHOLDS } from './xpThresholds'

describe('levelForXp', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(levelForXp(0)).toBe(1)
  })

  it('returns the exact level at a threshold', () => {
    expect(levelForXp(XP_THRESHOLDS[5])).toBe(5)
  })

  it('returns the level just below the next threshold', () => {
    expect(levelForXp(XP_THRESHOLDS[5] - 1)).toBe(4)
  })

  it('caps at level 20 for very high XP', () => {
    expect(levelForXp(10_000_000)).toBe(20)
  })
})

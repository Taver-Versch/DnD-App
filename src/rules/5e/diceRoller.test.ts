import { describe, expect, it } from 'vitest'
import { rollAttack, rollD20, rollDieFace, rollExpression } from './diceRoller'

describe('rollDieFace', () => {
  it('always rolls within [1, sides]', () => {
    for (let i = 0; i < 200; i++) {
      const roll = rollDieFace(6)
      expect(roll).toBeGreaterThanOrEqual(1)
      expect(roll).toBeLessThanOrEqual(6)
    }
  })
})

describe('rollExpression', () => {
  it('parses a flat positive modifier', () => {
    const result = rollExpression('+5')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dice).toEqual([])
      expect(result.modifier).toBe(5)
      expect(result.total).toBe(5)
    }
  })

  it('parses a flat modifier with no explicit sign as positive', () => {
    const result = rollExpression('7')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.total).toBe(7)
  })

  it('parses a negative modifier', () => {
    const result = rollExpression('-2')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.total).toBe(-2)
  })

  it('rolls NdM within the correct bounds', () => {
    const result = rollExpression('2d6')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dice).toHaveLength(2)
      for (const d of result.dice) {
        expect(d.die).toBe(6)
        expect(d.value).toBeGreaterThanOrEqual(1)
        expect(d.value).toBeLessThanOrEqual(6)
      }
      expect(result.total).toBe(result.dice.reduce((s, d) => s + d.value, 0))
    }
  })

  it('supports an implicit count of 1 (e.g. "d8")', () => {
    const result = rollExpression('d8')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dice).toHaveLength(1)
      expect(result.dice[0]?.die).toBe(8)
    }
  })

  it('combines dice and a flat modifier', () => {
    const result = rollExpression('1d8+3')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dice).toHaveLength(1)
      expect(result.modifier).toBe(3)
      expect(result.total).toBe(result.dice[0]!.value + 3)
    }
  })

  it('handles multiple terms', () => {
    const result = rollExpression('1d6+1d4+2')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dice).toHaveLength(2)
      expect(result.modifier).toBe(2)
    }
  })

  it('fails gracefully on unparseable input instead of throwing', () => {
    expect(() => rollExpression('banana')).not.toThrow()
    const result = rollExpression('banana')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.raw).toBe('banana')
  })

  it('fails on empty input', () => {
    expect(rollExpression('').ok).toBe(false)
    expect(rollExpression('   ').ok).toBe(false)
  })

  it('fails on a die with zero or absurd sides', () => {
    expect(rollExpression('1d0').ok).toBe(false)
    expect(rollExpression('1d99999').ok).toBe(false)
  })
})

describe('rollD20', () => {
  it('rolls a d20 plus the given modifier', () => {
    const result = rollD20(4)
    expect(result.dice).toHaveLength(1)
    expect(result.dice[0]?.die).toBe(20)
    expect(result.modifier).toBe(4)
    expect(result.total).toBe(result.dice[0]!.value + 4)
  })
})

describe('rollAttack', () => {
  it('rolls a d20 plus a flat bonus', () => {
    const result = rollAttack('+5')
    expect(result.dice.some((d) => d.die === 20)).toBe(true)
    expect(result.total).toBe(result.dice.reduce((s, d) => s + d.value, 0) + result.modifier)
  })

  it('falls back to a bare d20 when the bonus text is unparseable', () => {
    const result = rollAttack('see notes')
    expect(result.ok).toBe(true)
    expect(result.dice).toHaveLength(1)
    expect(result.dice[0]?.die).toBe(20)
    expect(result.modifier).toBe(0)
  })

  it('supports a bonus expression that itself includes a die (e.g. Bardic Inspiration)', () => {
    const result = rollAttack('+3+1d4')
    expect(result.dice.some((d) => d.die === 20)).toBe(true)
    expect(result.dice.some((d) => d.die === 4)).toBe(true)
  })
})

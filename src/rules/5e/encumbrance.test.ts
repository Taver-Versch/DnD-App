import { describe, expect, it } from 'vitest'
import { carryCapacityLb, isOverCarryCapacity, totalCarriedWeightLb } from './encumbrance'
import type { InventoryItem } from '../../store/types'

function makeItem(weight: number, quantity: number): InventoryItem {
  return {
    id: `${weight}-${quantity}`,
    name: 'Test Item',
    source: 'custom',
    quantity,
    weight,
    description: '',
    equipped: false,
  }
}

describe('carryCapacityLb', () => {
  it('is 15 lb per point of Strength', () => {
    expect(carryCapacityLb(10)).toBe(150)
    expect(carryCapacityLb(16)).toBe(240)
    expect(carryCapacityLb(0)).toBe(0)
  })
})

describe('totalCarriedWeightLb', () => {
  it('sums weight times quantity across items', () => {
    const total = totalCarriedWeightLb([makeItem(2, 3), makeItem(10, 1)])
    expect(total).toBe(16)
  })

  it('is 0 for an empty inventory', () => {
    expect(totalCarriedWeightLb([])).toBe(0)
  })
})

describe('isOverCarryCapacity', () => {
  it('is false when at or under capacity', () => {
    expect(isOverCarryCapacity([makeItem(150, 1)], 10)).toBe(false)
  })

  it('is true when over capacity', () => {
    expect(isOverCarryCapacity([makeItem(151, 1)], 10)).toBe(true)
  })
})

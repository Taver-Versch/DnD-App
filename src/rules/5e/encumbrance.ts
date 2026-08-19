import type { InventoryItem } from '../../store/types'

/** PHB carrying capacity rule: 15 lb per point of Strength. */
export function carryCapacityLb(strengthScore: number): number {
  return strengthScore * 15
}

export function totalCarriedWeightLb(inventory: InventoryItem[]): number {
  return inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0)
}

export function isOverCarryCapacity(inventory: InventoryItem[], strengthScore: number): boolean {
  return totalCarriedWeightLb(inventory) > carryCapacityLb(strengthScore)
}

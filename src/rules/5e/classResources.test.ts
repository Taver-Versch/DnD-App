import { describe, expect, it } from 'vitest'
import { extractClassResources, mergeResourceDeltas } from './classResources'
import type { Resource } from '../../store/types'

describe('extractClassResources', () => {
  it('picks up recognized keys with positive values', () => {
    const deltas = extractClassResources({ ki_points: 5, unrelated_field: 'x' })
    expect(deltas).toEqual([{ name: 'Ki Points', max: 5, resetOn: 'short' }])
  })

  it('ignores zero or missing values', () => {
    expect(extractClassResources({ rage_count: 0 })).toEqual([])
    expect(extractClassResources({})).toEqual([])
  })

  it('can extract multiple resources at once', () => {
    const deltas = extractClassResources({ action_surges: 1, indomitable_uses: 1 })
    expect(deltas.map((d) => d.name).sort()).toEqual(['Action Surge', 'Indomitable'])
  })
})

describe('mergeResourceDeltas', () => {
  it('adds a brand new resource fully filled', () => {
    const merged = mergeResourceDeltas([], [{ name: 'Ki Points', max: 2, resetOn: 'short' }])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ name: 'Ki Points', max: 2, current: 2, resetOn: 'short' })
  })

  it('bumps an existing resource max and refills it to full', () => {
    const existing: Resource[] = [{ id: 'x', name: 'Ki Points', max: 2, current: 1, resetOn: 'short' }]
    const merged = mergeResourceDeltas(existing, [{ name: 'Ki Points', max: 5, resetOn: 'short' }])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toMatchObject({ id: 'x', max: 5, current: 5 })
  })

  it('leaves unrelated existing resources untouched', () => {
    const existing: Resource[] = [{ id: 'y', name: 'Bardic Inspiration', max: 3, current: 1, resetOn: 'long' }]
    const merged = mergeResourceDeltas(existing, [{ name: 'Ki Points', max: 2, resetOn: 'short' }])
    expect(merged.find((r) => r.name === 'Bardic Inspiration')).toMatchObject({ current: 1, max: 3 })
  })
})

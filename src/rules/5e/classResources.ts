import type { Resource } from '../../store/types'

interface ResourceMapping {
  key: string
  name: string
  resetOn: 'short' | 'long'
}

/** Class-specific per-level fields from the SRD API that map to a limited-use resource. */
const RESOURCE_KEY_MAP: ResourceMapping[] = [
  { key: 'ki_points', name: 'Ki Points', resetOn: 'short' },
  { key: 'rage_count', name: 'Rage', resetOn: 'long' },
  { key: 'action_surges', name: 'Action Surge', resetOn: 'short' },
  { key: 'indomitable_uses', name: 'Indomitable', resetOn: 'long' },
]

export interface ResourceDelta {
  name: string
  max: number
  resetOn: 'short' | 'long'
}

/** Reads any recognized resource counts out of a class level's `class_specific` block. */
export function extractClassResources(classSpecific: Record<string, unknown>): ResourceDelta[] {
  const out: ResourceDelta[] = []
  for (const mapping of RESOURCE_KEY_MAP) {
    const value = classSpecific[mapping.key]
    if (typeof value === 'number' && value > 0) {
      out.push({ name: mapping.name, max: value, resetOn: mapping.resetOn })
    }
  }
  return out
}

/** Merges newly-derived resource maxes into the character's resource list, refilling to the new max. */
export function mergeResourceDeltas(existing: Resource[], deltas: ResourceDelta[]): Resource[] {
  const byName = new Map(existing.map((r) => [r.name, r]))
  for (const delta of deltas) {
    const prev = byName.get(delta.name)
    if (prev) {
      byName.set(delta.name, { ...prev, max: delta.max, current: delta.max })
    } else {
      byName.set(delta.name, {
        id: crypto.randomUUID(),
        name: delta.name,
        max: delta.max,
        current: delta.max,
        resetOn: delta.resetOn,
      })
    }
  }
  return Array.from(byName.values())
}

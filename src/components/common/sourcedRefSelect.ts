import type { ApiRef } from '../../data/apiTypes'
import type { SourcedRef } from '../../store/types'

// Shared encoding for "pick an SRD option, a known-name-only option, or type
// your own" <select> controls (used by SrdPicker and ChildPicker) so both
// stay in sync on how selections map to a SourcedRef.

export const CUSTOM_VALUE = '__custom__'
export const LOCAL_PREFIX = 'local:'

/** What the <select>'s `value` should be for the current SourcedRef. */
export function selectValueFor(value: SourcedRef | null | undefined, localOptions: string[]): string {
  if (!value) return ''
  if (value.source === 'srd') return value.srdIndex ?? ''
  return localOptions.includes(value.name) ? LOCAL_PREFIX + value.name : CUSTOM_VALUE
}

/** Turns a raw <select> value back into a SourcedRef (or null for "— none —"). */
export function resolveSelection(val: string, options: ApiRef[]): SourcedRef | null {
  if (!val) return null
  if (val === CUSTOM_VALUE) return { name: '', source: 'custom' }
  if (val.startsWith(LOCAL_PREFIX)) return { name: val.slice(LOCAL_PREFIX.length), source: 'custom' }
  const found = options.find((o) => o.index === val)
  return found ? { name: found.name, srdIndex: found.index, source: 'srd' } : null
}

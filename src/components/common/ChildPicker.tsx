import { useEffect, useState } from 'react'
import type { ApiRef } from '../../data/apiTypes'
import type { SourcedRef } from '../../store/types'
import { Field, Select, TextInput } from './Field'
import { SourcedOptionGroups } from './SourcedOptionGroups'
import { resolveSelection, selectValueFor } from './sourcedRefSelect'

/**
 * A "pick a child of this SRD parent" control - e.g. subclass of a class, or
 * subrace of a race. Fetches options via `fetchOptions(parentIndex)` only
 * when the parent itself is SRD-sourced.
 *
 * `localOptions` are extra 5e names we know about but the free SRD API
 * doesn't cover (e.g. most PHB subclasses) - picking one pre-fills the name
 * but stores it as a custom entry, since we have no mechanical data to
 * auto-fill; the text stays editable either way.
 */
export function ChildPicker({
  label,
  parentSource,
  parentIndex,
  fetchOptions,
  localOptions = [],
  value,
  onChange,
}: {
  label: string
  parentSource: 'srd' | 'custom' | undefined
  parentIndex: string | undefined
  fetchOptions: (parentIndex: string) => Promise<ApiRef[]>
  localOptions?: string[]
  value: SourcedRef | null | undefined
  onChange: (next: SourcedRef | null) => void
}) {
  const [options, setOptions] = useState<ApiRef[] | undefined>(undefined)

  useEffect(() => {
    if (parentSource !== 'srd' || !parentIndex) {
      setOptions([])
      return
    }
    let cancelled = false
    fetchOptions(parentIndex).then((opts) => {
      if (!cancelled) setOptions(opts)
    })
    return () => {
      cancelled = true
    }
  }, [parentSource, parentIndex, fetchOptions])

  const isCustom = value?.source === 'custom'

  if (options === undefined) return null
  if (options.length === 0 && localOptions.length === 0 && !isCustom && !value) return null

  return (
    <Field label={label}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        <Select
          style={{ flex: '1 1 9rem', minWidth: 0 }}
          value={selectValueFor(value, localOptions)}
          onChange={(e) => onChange(resolveSelection(e.target.value, options))}
        >
          <option value="">— none —</option>
          <SourcedOptionGroups options={options} localOptions={localOptions} />
        </Select>
        {isCustom && (
          <TextInput
            style={{ flex: '1 1 9rem', minWidth: 0 }}
            placeholder={`${label} name`}
            value={value?.name ?? ''}
            onChange={(e) => onChange({ name: e.target.value, source: 'custom' })}
          />
        )}
      </div>
    </Field>
  )
}

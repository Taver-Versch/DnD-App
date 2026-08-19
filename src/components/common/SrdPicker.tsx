import { useEffect, useState } from 'react'
import type { ApiRef } from '../../data/apiTypes'
import type { SourcedRef } from '../../store/types'
import { Field, Select, TextInput } from './Field'
import { SourcedOptionGroups } from './SourcedOptionGroups'
import { resolveSelection, selectValueFor } from './sourcedRefSelect'
import styles from './Field.module.css'

/**
 * Lets the user pick a value from an SRD API list, or type their own when the
 * list doesn't have what they need (e.g. most PHB backgrounds aren't in the
 * free SRD). Falls back to a plain text field automatically if the list fails
 * to load at all.
 *
 * `localOptions` are extra known 5e names not covered by the free API (e.g.
 * PHB backgrounds beyond Acolyte) - picking one pre-fills the name as a
 * custom entry so there's nothing to type, but no mechanics are auto-filled.
 */
export function SrdPicker({
  label,
  fetchList,
  localOptions = [],
  value,
  onChange,
}: {
  label: string
  fetchList: () => Promise<ApiRef[]>
  localOptions?: string[]
  value: SourcedRef | null
  onChange: (ref: SourcedRef | null) => void
}) {
  const [options, setOptions] = useState<ApiRef[] | undefined>(undefined)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchList()
      .then((list) => {
        if (!cancelled) {
          setOptions(list)
          if (list.length === 0) setLoadFailed(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [fetchList])

  const isCustom = value?.source === 'custom' || loadFailed || (options === undefined && value !== null)

  if (loadFailed || (options !== undefined && options.length === 0 && localOptions.length === 0)) {
    return (
      <Field label={`${label} (enter manually — list unavailable)`}>
        <TextInput
          value={value?.name ?? ''}
          onChange={(e) => onChange(e.target.value ? { name: e.target.value, source: 'custom' } : null)}
        />
      </Field>
    )
  }

  return (
    <Field label={label}>
      <Select
        value={selectValueFor(value, localOptions)}
        disabled={options === undefined}
        onChange={(e) => onChange(resolveSelection(e.target.value, options ?? []))}
      >
        <option value="">{options === undefined ? 'Loading…' : '— none —'}</option>
        <SourcedOptionGroups options={options ?? []} localOptions={localOptions} />
      </Select>
      {isCustom && (
        <TextInput
          className={styles.input}
          placeholder="Enter custom name"
          value={value?.source === 'custom' ? value.name : ''}
          onChange={(e) => onChange({ name: e.target.value, source: 'custom' })}
          style={{ marginTop: '0.3rem' }}
        />
      )}
    </Field>
  )
}

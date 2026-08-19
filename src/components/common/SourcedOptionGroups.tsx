import type { ApiRef } from '../../data/apiTypes'
import { CUSTOM_VALUE, LOCAL_PREFIX } from './sourcedRefSelect'

/** The shared `<option>`/`<optgroup>` body for SrdPicker and ChildPicker. */
export function SourcedOptionGroups({ options, localOptions }: { options: ApiRef[]; localOptions: string[] }) {
  return (
    <>
      {options.length > 0 && (
        <optgroup label="Standard">
          {options.map((o) => (
            <option key={o.index} value={o.index}>
              {o.name}
            </option>
          ))}
        </optgroup>
      )}
      {localOptions.length > 0 && (
        <optgroup label="More (add your own details)">
          {localOptions.map((name) => (
            <option key={name} value={LOCAL_PREFIX + name}>
              {name}
            </option>
          ))}
        </optgroup>
      )}
      <option value={CUSTOM_VALUE}>Custom / homebrew…</option>
    </>
  )
}

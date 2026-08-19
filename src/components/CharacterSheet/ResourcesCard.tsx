import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Select, TextInput } from '../common/Field'
import { NumberStepper } from '../common/NumberStepper'
import type { Resource } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './ListCard.module.css'

function blankResource(): Resource {
  return { id: crypto.randomUUID(), name: '', max: 1, current: 1, resetOn: 'long' }
}

export function ResourcesCard({ character, update }: SectionProps) {
  const setResources = (resources: Resource[]) => update((c) => ({ ...c, resources }))
  const patch = (id: string, patchObj: Partial<Resource>) =>
    setResources(character.resources.map((r) => (r.id === id ? { ...r, ...patchObj } : r)))

  return (
    <Card title="Resources (Ki, Rage, etc.)">
      {character.resources.length === 0 && (
        <p className={styles.empty}>
          No limited-use resources yet — these fill in automatically as you level up, or add your own.
        </p>
      )}
      {character.resources.map((r) => (
        <div key={r.id} className={styles.row}>
          <TextInput className={styles.name} value={r.name} onChange={(e) => patch(r.id, { name: e.target.value })} />
          <NumberStepper
            value={r.current}
            min={0}
            max={r.max}
            onChange={(n) => patch(r.id, { current: n })}
          />
          <span style={{ color: 'var(--color-ink-soft)' }}>/</span>
          <input
            type="number"
            style={{ width: '3rem' }}
            value={r.max}
            onChange={(e) => {
              const max = Math.max(0, Number(e.target.value) || 0)
              patch(r.id, { max, current: Math.min(r.current, max) })
            }}
          />
          <Select value={r.resetOn} onChange={(e) => patch(r.id, { resetOn: e.target.value as Resource['resetOn'] })}>
            <option value="short">reset: short rest</option>
            <option value="long">reset: long rest</option>
          </Select>
          <Button small variant="danger" onClick={() => setResources(character.resources.filter((x) => x.id !== r.id))}>
            ✕
          </Button>
        </div>
      ))}
      <div className={styles.addRow}>
        <Button small onClick={() => setResources([...character.resources, blankResource()])}>
          + Add Resource
        </Button>
      </div>
    </Card>
  )
}

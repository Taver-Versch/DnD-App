import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Select, TextArea, TextInput } from '../common/Field'
import type { Feature } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './ListCard.module.css'

const ORIGINS: Feature['origin'][] = ['race', 'class', 'background', 'feat', 'other']

function blankFeature(): Feature {
  return { id: crypto.randomUUID(), name: '', description: '', origin: 'other', source: 'custom' }
}

export function FeaturesCard({ character, update }: SectionProps) {
  const setFeatures = (features: Feature[]) => update((c) => ({ ...c, features }))
  const patch = (id: string, patchObj: Partial<Feature>) =>
    setFeatures(character.features.map((f) => (f.id === id ? { ...f, ...patchObj } : f)))

  return (
    <Card title="Features & Traits">
      {character.features.length === 0 && <p className={styles.empty}>No features added yet.</p>}
      {character.features.map((f) => (
        <div key={f.id} style={{ marginBottom: '0.6rem', paddingBottom: '0.5rem', borderBottom: '1px dotted var(--color-border-soft)' }}>
          <div className={styles.row} style={{ borderBottom: 'none', padding: 0 }}>
            <TextInput
              className={styles.name}
              placeholder="Feature name"
              value={f.name}
              onChange={(e) => patch(f.id, { name: e.target.value })}
            />
            <Select value={f.origin} onChange={(e) => patch(f.id, { origin: e.target.value as Feature['origin'] })}>
              {ORIGINS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
            <Button small variant="danger" onClick={() => setFeatures(character.features.filter((x) => x.id !== f.id))}>
              ✕
            </Button>
          </div>
          <TextArea
            placeholder="Description"
            value={f.description}
            onChange={(e) => patch(f.id, { description: e.target.value })}
            rows={2}
            style={{ width: '100%', marginTop: '0.3rem' }}
          />
        </div>
      ))}
      <Button small onClick={() => setFeatures([...character.features, blankFeature()])}>
        + Add Feature
      </Button>
    </Card>
  )
}

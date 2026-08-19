import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { SECTION_KEYS, type SectionKey } from '../../store/types'
import type { SectionProps } from '../CharacterSheet/sectionProps'

const SECTION_LABELS: Record<SectionKey, string> = {
  attacks: 'Attacks',
  inventory: 'Inventory & Currency',
  features: 'Features & Traits',
  spellcasting: 'Spellcasting',
  resources: 'Resources (Ki, Rage, etc.)',
  notes: 'Notes & Backstory',
  sessionLog: 'Session Log',
  companion: 'Companion / Familiar',
}

export function SheetCustomizer({ character, update, onClose }: SectionProps & { onClose: () => void }) {
  const toggle = (key: SectionKey, value: boolean) =>
    update((c) => ({
      ...c,
      uiPrefs: { ...c.uiPrefs, visibleSections: { ...c.uiPrefs.visibleSections, [key]: value } },
    }))

  return (
    <Modal
      title="Customize Sheet Sections"
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <p>Hide sections you don't use (e.g. Spellcasting for a non-caster). Nothing is deleted — just hidden.</p>
      {SECTION_KEYS.map((key) => (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0' }}>
          <input
            type="checkbox"
            checked={character.uiPrefs.visibleSections[key]}
            onChange={(e) => toggle(key, e.target.checked)}
          />
          {SECTION_LABELS[key]}
        </label>
      ))}
    </Modal>
  )
}

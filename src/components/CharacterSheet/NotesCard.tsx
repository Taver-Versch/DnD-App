import { Card } from '../common/Card'
import { TextArea } from '../common/Field'
import type { SectionProps } from './sectionProps'

export function NotesCard({ character, update }: SectionProps) {
  return (
    <Card title="Notes & Backstory">
      <TextArea
        value={character.notes}
        onChange={(e) => update((c) => ({ ...c, notes: e.target.value }))}
        rows={8}
        style={{ width: '100%' }}
        placeholder="Personality traits, ideals, bonds, flaws, backstory…"
      />
    </Card>
  )
}

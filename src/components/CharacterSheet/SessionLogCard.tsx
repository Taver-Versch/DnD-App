import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { TextArea } from '../common/Field'
import type { SessionLogEntry } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './SessionLogCard.module.css'
import listStyles from './ListCard.module.css'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function blankEntry(): SessionLogEntry {
  return { id: crypto.randomUUID(), date: todayIso(), text: '' }
}

export function SessionLogCard({ character, update }: SectionProps) {
  const patch = (id: string, patchObj: Partial<SessionLogEntry>) =>
    update((c) => ({ ...c, sessionLog: c.sessionLog.map((e) => (e.id === id ? { ...e, ...patchObj } : e)) }))
  const remove = (id: string) => update((c) => ({ ...c, sessionLog: c.sessionLog.filter((e) => e.id !== id) }))
  const add = () => update((c) => ({ ...c, sessionLog: [blankEntry(), ...c.sessionLog] }))

  const sorted = [...character.sessionLog].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  return (
    <Card title="Session Log">
      {sorted.length === 0 && <p className={listStyles.empty}>No session notes yet.</p>}
      {sorted.map((entry) => (
        <div key={entry.id} className={styles.entry}>
          <div className={styles.entryHeader}>
            <input
              type="date"
              className={styles.dateInput}
              value={entry.date}
              onChange={(e) => patch(entry.id, { date: e.target.value })}
            />
            <Button small variant="danger" onClick={() => remove(entry.id)}>
              ✕
            </Button>
          </div>
          <TextArea
            value={entry.text}
            onChange={(e) => patch(entry.id, { text: e.target.value })}
            rows={3}
            style={{ width: '100%' }}
            placeholder="What happened this session…"
          />
        </div>
      ))}
      <div className={listStyles.addRow}>
        <Button small onClick={add}>
          + Add Session Entry
        </Button>
      </div>
    </Card>
  )
}

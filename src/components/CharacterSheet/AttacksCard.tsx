import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { TextInput } from '../common/Field'
import { RollButton } from '../common/RollButton'
import { rollAttack, rollExpression } from '../../rules/5e/diceRoller'
import { createBlankAttack } from '../../store/characterFactory'
import type { Attack } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './ListCard.module.css'

export function AttacksCard({ character, update }: SectionProps) {
  const patch = (id: string, patchObj: Partial<Attack>) =>
    update((c) => ({ ...c, attacks: c.attacks.map((a) => (a.id === id ? { ...a, ...patchObj } : a)) }))
  const remove = (id: string) => update((c) => ({ ...c, attacks: c.attacks.filter((a) => a.id !== id) }))
  const add = () => update((c) => ({ ...c, attacks: [...c.attacks, createBlankAttack()] }))

  return (
    <Card title="Attacks">
      {character.attacks.length === 0 && <p className={styles.empty}>No attacks added yet.</p>}
      {character.attacks.map((a) => (
        <div key={a.id} className={styles.row}>
          <TextInput
            className={styles.name}
            placeholder="Name"
            value={a.name}
            onChange={(e) => patch(a.id, { name: e.target.value })}
          />
          <TextInput
            placeholder="Bonus"
            value={a.bonus}
            onChange={(e) => patch(a.id, { bonus: e.target.value })}
            style={{ maxWidth: '4.5rem' }}
          />
          <RollButton title={`Roll to hit: ${a.name || 'Attack'}`} onRoll={() => rollAttack(a.bonus, `${a.name || 'Attack'} — To Hit`)} />
          <TextInput
            placeholder="Damage"
            value={a.damage}
            onChange={(e) => patch(a.id, { damage: e.target.value })}
            style={{ maxWidth: '5rem' }}
          />
          <RollButton title={`Roll damage: ${a.name || 'Attack'}`} onRoll={() => rollExpression(a.damage, `${a.name || 'Attack'} — Damage`)} />
          <TextInput
            placeholder="Type"
            value={a.damageType}
            onChange={(e) => patch(a.id, { damageType: e.target.value })}
            style={{ maxWidth: '5.5rem' }}
          />
          <TextInput
            placeholder="Notes (range, properties…)"
            value={a.notes}
            onChange={(e) => patch(a.id, { notes: e.target.value })}
            style={{ flex: '1.5 1 100px' }}
          />
          <Button small variant="danger" onClick={() => remove(a.id)}>
            ✕
          </Button>
        </div>
      ))}
      <div className={styles.addRow}>
        <Button small onClick={add}>
          + Add Attack
        </Button>
      </div>
    </Card>
  )
}

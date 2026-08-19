import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Field, TextInput } from '../common/Field'
import { NumberStepper } from '../common/NumberStepper'
import { RollButton } from '../common/RollButton'
import { rollAttack, rollExpression } from '../../rules/5e/diceRoller'
import { createBlankAttack } from '../../store/characterFactory'
import type { Attack, Companion } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './CompanionCard.module.css'
import listStyles from './ListCard.module.css'

function blankCompanion(): Companion {
  return {
    name: '',
    race: '',
    armorClass: 10,
    hitPoints: { max: 1, current: 1, temp: 0 },
    speed: 30,
    attacks: [],
  }
}

export function CompanionCard({ character, update }: SectionProps) {
  const { companion } = character

  if (!companion) {
    return (
      <Card title="Companion / Familiar">
        <p className={listStyles.empty}>No companion, familiar, or mount yet.</p>
        <Button small onClick={() => update((c) => ({ ...c, companion: blankCompanion() }))}>
          + Add Companion
        </Button>
      </Card>
    )
  }

  const patch = (patchObj: Partial<Companion>) =>
    update((c) => ({ ...c, companion: c.companion ? { ...c.companion, ...patchObj } : c.companion }))

  const patchAttack = (id: string, patchObj: Partial<Attack>) =>
    update((c) => ({
      ...c,
      companion: c.companion
        ? { ...c.companion, attacks: c.companion.attacks.map((a) => (a.id === id ? { ...a, ...patchObj } : a)) }
        : c.companion,
    }))
  const removeAttack = (id: string) =>
    update((c) => ({
      ...c,
      companion: c.companion ? { ...c.companion, attacks: c.companion.attacks.filter((a) => a.id !== id) } : c.companion,
    }))
  const addAttack = () =>
    update((c) => ({
      ...c,
      companion: c.companion ? { ...c.companion, attacks: [...c.companion.attacks, createBlankAttack()] } : c.companion,
    }))

  return (
    <Card
      title="Companion / Familiar"
      actions={
        <Button small variant="danger" onClick={() => update((c) => ({ ...c, companion: null }))}>
          Remove
        </Button>
      }
    >
      <div className={styles.topRow}>
        <Field label="Name">
          <TextInput value={companion.name} onChange={(e) => patch({ name: e.target.value })} />
        </Field>
        <Field label="Race / Type">
          <TextInput value={companion.race} onChange={(e) => patch({ race: e.target.value })} />
        </Field>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Armor Class</span>
          <input
            className={styles.statValue}
            type="number"
            value={companion.armorClass}
            onChange={(e) => patch({ armorClass: Number(e.target.value) || 0 })}
          />
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Speed</span>
          <input
            className={styles.statValue}
            type="number"
            value={companion.speed}
            onChange={(e) => patch({ speed: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className={styles.hpRow}>
        <Field label="HP Current">
          <NumberStepper
            value={companion.hitPoints.current}
            min={0}
            max={companion.hitPoints.max}
            onChange={(n) => patch({ hitPoints: { ...companion.hitPoints, current: n } })}
          />
        </Field>
        <Field label="HP Max">
          <NumberStepper
            value={companion.hitPoints.max}
            min={0}
            onChange={(n) => patch({ hitPoints: { ...companion.hitPoints, max: n } })}
          />
        </Field>
      </div>

      <div className={styles.attacksSection}>
        <span className={styles.attacksLabel}>Attacks</span>
        {companion.attacks.length === 0 && <p className={listStyles.empty}>No attacks added yet.</p>}
        {companion.attacks.map((a) => (
          <div key={a.id} className={listStyles.row}>
            <TextInput
              className={listStyles.name}
              placeholder="Name"
              value={a.name}
              onChange={(e) => patchAttack(a.id, { name: e.target.value })}
            />
            <TextInput
              placeholder="Bonus"
              value={a.bonus}
              onChange={(e) => patchAttack(a.id, { bonus: e.target.value })}
              style={{ maxWidth: '4.5rem' }}
            />
            <RollButton title={`Roll to hit: ${a.name || 'Attack'}`} onRoll={() => rollAttack(a.bonus, `${a.name || 'Attack'} — To Hit`)} />
            <TextInput
              placeholder="Damage"
              value={a.damage}
              onChange={(e) => patchAttack(a.id, { damage: e.target.value })}
              style={{ maxWidth: '5rem' }}
            />
            <RollButton title={`Roll damage: ${a.name || 'Attack'}`} onRoll={() => rollExpression(a.damage, `${a.name || 'Attack'} — Damage`)} />
            <TextInput
              placeholder="Type"
              value={a.damageType}
              onChange={(e) => patchAttack(a.id, { damageType: e.target.value })}
              style={{ maxWidth: '5.5rem' }}
            />
            <Button small variant="danger" onClick={() => removeAttack(a.id)}>
              ✕
            </Button>
          </div>
        ))}
        <div className={listStyles.addRow}>
          <Button small onClick={addAttack}>
            + Add Attack
          </Button>
        </div>
      </div>
    </Card>
  )
}

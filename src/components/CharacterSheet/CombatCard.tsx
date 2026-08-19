import { useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { NumberStepper } from '../common/NumberStepper'
import { Field } from '../common/Field'
import { ShortRestModal } from '../RestControls/ShortRestModal'
import { LongRestModal } from '../RestControls/LongRestModal'
import type { SectionProps } from './sectionProps'
import styles from './CombatCard.module.css'

export function CombatCard({ character, update }: SectionProps) {
  const [restModal, setRestModal] = useState<'short' | 'long' | null>(null)
  const { hitPoints } = character

  return (
    <Card
      title="Combat"
      actions={
        <div className={styles.restRow}>
          <Button small onClick={() => setRestModal('short')}>
            Short Rest
          </Button>
          <Button small variant="gold" onClick={() => setRestModal('long')}>
            Long Rest
          </Button>
        </div>
      }
    >
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Armor Class</span>
          <input
            className={styles.statValue}
            type="number"
            value={character.armorClass}
            onChange={(e) => update((c) => ({ ...c, armorClass: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Initiative</span>
          <input
            className={styles.statValue}
            type="number"
            value={character.initiativeBonus}
            onChange={(e) => update((c) => ({ ...c, initiativeBonus: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Speed</span>
          <input
            className={styles.statValue}
            type="number"
            value={character.speed}
            onChange={(e) => update((c) => ({ ...c, speed: Number(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className={styles.hpSection}>
        <Field label="HP Current">
          <NumberStepper
            value={hitPoints.current}
            min={0}
            max={hitPoints.max + hitPoints.temp}
            onChange={(n) => update((c) => ({ ...c, hitPoints: { ...c.hitPoints, current: n } }))}
          />
        </Field>
        <Field label="HP Max">
          <NumberStepper
            value={hitPoints.max}
            min={0}
            onChange={(n) => update((c) => ({ ...c, hitPoints: { ...c.hitPoints, max: n } }))}
          />
        </Field>
        <Field label="Temp HP">
          <NumberStepper
            value={hitPoints.temp}
            min={0}
            onChange={(n) => update((c) => ({ ...c, hitPoints: { ...c.hitPoints, temp: n } }))}
          />
        </Field>
      </div>

      {character.hitDice.length > 0 && (
        <div className={styles.hitDiceRow}>
          <strong>Hit Dice:</strong>
          {character.hitDice.map((pool) => (
            <span key={pool.die}>
              {pool.remaining}/{pool.total} d{pool.die}
            </span>
          ))}
        </div>
      )}

      <div className={styles.exhaustionRow}>
        <Field label={`Exhaustion${character.exhaustion > 0 ? ` (level ${character.exhaustion})` : ''}`}>
          <NumberStepper
            value={character.exhaustion}
            min={0}
            max={6}
            onChange={(n) => update((c) => ({ ...c, exhaustion: n }))}
          />
        </Field>
        {character.exhaustion > 0 && (
          <p className={styles.exhaustionWarning}>
            {character.exhaustion >= 6
              ? 'Level 6: dead.'
              : 'Escalating penalties apply — check the exhaustion table. Only removed by a long rest (1 level at a time, with food and drink).'}
          </p>
        )}
      </div>

      {hitPoints.current === 0 && (
        <div className={styles.deathSaves}>
          <div className={styles.deathSaveGroup}>
            <span>Successes</span>
            <NumberStepper
              value={character.deathSaves.successes}
              min={0}
              max={3}
              onChange={(n) => update((c) => ({ ...c, deathSaves: { ...c.deathSaves, successes: n } }))}
            />
          </div>
          <div className={styles.deathSaveGroup}>
            <span>Failures</span>
            <NumberStepper
              value={character.deathSaves.failures}
              min={0}
              max={3}
              onChange={(n) => update((c) => ({ ...c, deathSaves: { ...c.deathSaves, failures: n } }))}
            />
          </div>
        </div>
      )}

      {restModal === 'short' && (
        <ShortRestModal character={character} update={update} onClose={() => setRestModal(null)} />
      )}
      {restModal === 'long' && (
        <LongRestModal character={character} update={update} onClose={() => setRestModal(null)} />
      )}
    </Card>
  )
}

import { useState } from 'react'
import { RollButton } from '../common/RollButton'
import { rollD20 } from '../../rules/5e/diceRoller'
import { proficiencyBonusForLevel } from '../../rules/5e/proficiencyBonus'
import { STANDARD_CONDITIONS } from '../../data/conditions'
import { formatModifier, totalLevel, type ActiveCondition } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './VitalsBar.module.css'

const ADD_CUSTOM = '__custom__'

function ConditionsRow({ character, update }: SectionProps) {
  const [adding, setAdding] = useState(false)
  const [customText, setCustomText] = useState('')

  const addCondition = (name: string, source: ActiveCondition['source']) => {
    const trimmed = name.trim()
    if (!trimmed || trimmed.toLowerCase() === 'exhaustion') return
    update((c) => ({
      ...c,
      conditions: [...c.conditions, { id: crypto.randomUUID(), name: trimmed, source, note: '' }],
    }))
    setCustomText('')
    setAdding(false)
  }

  const removeCondition = (id: string) =>
    update((c) => ({ ...c, conditions: c.conditions.filter((cond) => cond.id !== id) }))

  const activeNames = new Set(character.conditions.map((cond) => cond.name))
  const availableStandard = STANDARD_CONDITIONS.filter((sc) => sc.name !== 'Exhaustion' && !activeNames.has(sc.name))

  return (
    <div className={styles.conditionsRow}>
      {character.conditions.map((cond) => (
        <button
          key={cond.id}
          type="button"
          className={styles.conditionChip}
          title={`Remove ${cond.name}`}
          onClick={() => removeCondition(cond.id)}
        >
          {cond.name} ✕
        </button>
      ))}
      {adding ? (
        <span className={styles.addConditionForm}>
          <select
            className={styles.conditionSelect}
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value
              if (!val) return
              if (val === ADD_CUSTOM) return
              addCondition(val, 'standard')
            }}
          >
            <option value="">Pick a condition…</option>
            {availableStandard.map((sc) => (
              <option key={sc.name} value={sc.name}>
                {sc.name}
              </option>
            ))}
            <option value={ADD_CUSTOM}>Custom…</option>
          </select>
          <input
            className={styles.conditionCustomInput}
            placeholder="or type a custom one"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCondition(customText, 'custom')
            }}
          />
          <button type="button" className={styles.conditionAddBtn} onClick={() => addCondition(customText, 'custom')}>
            Add
          </button>
          <button type="button" className={styles.conditionAddBtn} onClick={() => setAdding(false)}>
            Cancel
          </button>
        </span>
      ) : (
        <button type="button" className={styles.addConditionBtn} onClick={() => setAdding(true)}>
          + Condition
        </button>
      )}
    </div>
  )
}

export function VitalsBar({ character, update }: SectionProps) {
  const { hitPoints } = character
  const denom = Math.max(1, hitPoints.max + hitPoints.temp)
  const fillPct = Math.max(0, Math.min(100, (hitPoints.current / denom) * 100))
  const fillColor =
    fillPct > 50 ? 'var(--color-success)' : fillPct > 25 ? 'var(--color-gold)' : 'var(--color-danger)'
  const level = totalLevel(character.classes)
  const profBonus = proficiencyBonusForLevel(Math.max(1, level))

  const adjustHp = (delta: number) =>
    update((c) => ({
      ...c,
      hitPoints: {
        ...c.hitPoints,
        current: Math.max(0, Math.min(c.hitPoints.max + c.hitPoints.temp, c.hitPoints.current + delta)),
      },
    }))

  return (
    <div className={styles.bar}>
      <span className={styles.name}>{character.name || 'Unnamed'}</span>

      <div className={styles.hpGroup}>
        <button type="button" className={styles.hpBtn} onClick={() => adjustHp(-1)} aria-label="Damage 1">
          −
        </button>
        <div className={styles.hpTrack}>
          <div className={styles.hpFill} style={{ width: `${fillPct}%`, backgroundColor: fillColor }} />
        </div>
        <span className={styles.hpText}>
          {hitPoints.current}
          {hitPoints.temp > 0 ? `+${hitPoints.temp}` : ''} / {hitPoints.max} HP
        </span>
        <button type="button" className={styles.hpBtn} onClick={() => adjustHp(1)} aria-label="Heal 1">
          +
        </button>
      </div>

      <label className={styles.inspiration} title="Inspiration">
        <input
          type="checkbox"
          checked={character.inspiration}
          onChange={(e) => update((c) => ({ ...c, inspiration: e.target.checked }))}
        />
        <span>✦ Inspiration</span>
      </label>

      <div className={styles.statGroup}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Level</span>
          <span className={styles.statValue}>{level || '—'}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>AC</span>
          <span className={styles.statValue}>{character.armorClass}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Speed</span>
          <span className={styles.statValue}>{character.speed} ft</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Init</span>
          <span className={styles.statValue}>{formatModifier(character.initiativeBonus)}</span>
          <RollButton title="Roll Initiative" onRoll={() => rollD20(character.initiativeBonus, 'Initiative')} />
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Prof</span>
          <span className={styles.statValue}>+{profBonus}</span>
        </div>
      </div>

      <ConditionsRow character={character} update={update} />
    </div>
  )
}

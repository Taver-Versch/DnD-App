import { Card } from '../common/Card'
import { RollButton } from '../common/RollButton'
import { rollD20 } from '../../rules/5e/diceRoller'
import { ABILITY_KEYS, abilityModifier, formatModifier, totalLevel, type AbilityKey } from '../../store/types'
import { proficiencyBonusForLevel } from '../../rules/5e/proficiencyBonus'
import type { SectionProps } from './sectionProps'
import styles from './AbilityScoresCard.module.css'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
}

export function AbilityScoresCard({ character, update }: SectionProps) {
  const profBonus = proficiencyBonusForLevel(Math.max(1, totalLevel(character.classes)))

  return (
    <Card title="Ability Scores">
      <div className={styles.grid}>
        {ABILITY_KEYS.map((key) => {
          const score = character.abilityScores[key]
          const mod = abilityModifier(score)
          return (
            <div key={key} className={styles.ability}>
              <div className={styles.abilityLabel}>{ABILITY_LABELS[key]}</div>
              <input
                className={styles.abilityScore}
                type="number"
                value={score}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    abilityScores: { ...c.abilityScores, [key]: Number(e.target.value) || 0 },
                  }))
                }
              />
              <div className={styles.abilityMod}>{formatModifier(mod)}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.saves}>
        <span className={styles.savesLabel}>Saving Throws</span>
        {ABILITY_KEYS.map((key) => {
          const proficient = character.savingThrowProficiencies.includes(key)
          const bonus = abilityModifier(character.abilityScores[key]) + (proficient ? profBonus : 0)
          return (
            <label key={key} className={styles.saveRow}>
              <input
                type="checkbox"
                checked={proficient}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    savingThrowProficiencies: e.target.checked
                      ? [...c.savingThrowProficiencies, key]
                      : c.savingThrowProficiencies.filter((k) => k !== key),
                  }))
                }
              />
              <span className={styles.saveLabel}>{ABILITY_LABELS[key]}</span>
              <span className={styles.saveBonus}>{formatModifier(bonus)}</span>
              <RollButton title={`Roll ${ABILITY_LABELS[key]} save`} onRoll={() => rollD20(bonus, `${ABILITY_LABELS[key]} Save`)} />
            </label>
          )
        })}
      </div>
    </Card>
  )
}

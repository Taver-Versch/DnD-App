import { Card } from '../common/Card'
import { RollButton } from '../common/RollButton'
import { rollD20 } from '../../rules/5e/diceRoller'
import { SKILLS, abilityModifier, formatModifier, totalLevel, type SkillKey } from '../../store/types'
import { proficiencyBonusForLevel } from '../../rules/5e/proficiencyBonus'
import type { SectionProps } from './sectionProps'
import styles from './SkillsCard.module.css'

export function SkillsCard({ character, update }: SectionProps) {
  const profBonus = proficiencyBonusForLevel(Math.max(1, totalLevel(character.classes)))

  return (
    <Card title="Skills">
      <div className={styles.list}>
        {(Object.keys(SKILLS) as SkillKey[]).map((key) => {
          const meta = SKILLS[key]
          const state = character.skills[key]
          const mod = abilityModifier(character.abilityScores[meta.ability])
          const bonus = mod + (state.expertise ? profBonus * 2 : state.proficient ? profBonus : 0)
          return (
            <label key={key} className={styles.row}>
              <input
                type="checkbox"
                checked={state.proficient}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    skills: {
                      ...c.skills,
                      [key]: {
                        proficient: e.target.checked,
                        expertise: e.target.checked ? state.expertise : false,
                      },
                    },
                  }))
                }
                title="Proficient"
              />
              <input
                type="checkbox"
                checked={state.expertise}
                disabled={!state.proficient}
                onChange={(e) =>
                  update((c) => ({
                    ...c,
                    skills: { ...c.skills, [key]: { ...state, expertise: e.target.checked } },
                  }))
                }
                title="Expertise"
              />
              <span className={styles.ability}>{meta.ability}</span>
              <span className={styles.name}>{meta.label}</span>
              <span className={styles.bonus}>{formatModifier(bonus)}</span>
              <RollButton title={`Roll ${meta.label}`} onRoll={() => rollD20(bonus, meta.label)} />
            </label>
          )
        })}
      </div>
      <p className={styles.legend}>First box = proficient, second box = expertise.</p>
    </Card>
  )
}

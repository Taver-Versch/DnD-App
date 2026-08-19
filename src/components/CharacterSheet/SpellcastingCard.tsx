import { useEffect, useMemo, useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Field, Select, TextInput } from '../common/Field'
import { RollButton } from '../common/RollButton'
import { WikiLink } from '../common/WikiLink'
import { WIKI_INDEX, spellLink } from '../../data/wikiLinks'
import { getSpell, listSpells } from '../../data/dataProvider'
import type { ApiSpellSummary } from '../../data/apiTypes'
import { rollD20, type RollResult } from '../../rules/5e/diceRoller'
import { proficiencyBonusForLevel } from '../../rules/5e/proficiencyBonus'
import { casterLevelContribution, progressionForClass } from '../../rules/5e/spellSlots'
import { ABILITY_KEYS, abilityModifier, formatModifier, totalLevel, type AbilityKey, type Spell } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './ListCard.module.css'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
}

function SpellSearch({ onPick }: { onPick: (summary: ApiSpellSummary) => void }) {
  const [all, setAll] = useState<ApiSpellSummary[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    listSpells().then(setAll)
  }, [])

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return all.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 8)
  }, [all, query])

  return (
    <div style={{ position: 'relative' }}>
      <TextInput
        placeholder="Search spells to add…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {matches.length > 0 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 5,
            background: 'var(--color-parchment-panel)',
            border: '1px solid var(--color-border)',
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {matches.map((m) => (
            <div
              key={m.index}
              style={{ padding: '0.3rem 0.5rem', cursor: 'pointer' }}
              onClick={() => {
                onPick(m)
                setQuery('')
              }}
            >
              {m.name} <span style={{ color: 'var(--color-ink-soft)' }}>(lvl {m.level})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const PROGRESSION_DIVISOR = { full: 1, half: 2, third: 3 } as const

/** Multiclass caster-level breakdown, e.g. "Wizard 6 + Paladin 2÷2" - the math lives in spellSlots.ts, this just narrates it. */
function casterBreakdownText(character: SectionProps['character']): string | null {
  const parts: string[] = []
  let total = 0
  for (const cls of character.classes) {
    const progression = progressionForClass(cls.srdIndex ?? '')
    if (progression === 'none' || progression === 'pact') continue
    const contribution = casterLevelContribution(progression, cls.level)
    total += contribution
    const divisor = PROGRESSION_DIVISOR[progression]
    parts.push(divisor === 1 ? `${cls.name} ${cls.level}` : `${cls.name} ${cls.level}÷${divisor}`)
  }
  if (parts.length <= 1) return null
  return `Combined caster level: ${total} (${parts.join(' + ')}, rounded down)`
}

function ConcentrationTracker({ character, update, conSaveBonus }: SectionProps & { conSaveBonus: number }) {
  const { spellcasting } = character
  const [damageInput, setDamageInput] = useState('')
  const [saveResult, setSaveResult] = useState<{ roll: RollResult; dc: number } | null>(null)

  const clear = () => update((c) => ({ ...c, spellcasting: { ...c.spellcasting, concentratingOn: null } }))

  const rollSave = () => {
    const damage = Math.max(0, Number(damageInput) || 0)
    const dc = Math.max(10, Math.floor(damage / 2))
    setSaveResult({ roll: rollD20(conSaveBonus, 'Concentration (CON Save)'), dc })
  }

  if (!spellcasting.concentratingOn) return null

  return (
    <div className={styles.row} style={{ background: 'var(--color-parchment)', flexWrap: 'wrap' }}>
      <strong>Concentrating: {spellcasting.concentratingOn}</strong>
      <Button small variant="danger" onClick={clear}>
        Clear
      </Button>
      <span style={{ flexBasis: '100%', display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.3rem' }}>
        <TextInput
          placeholder="Damage taken"
          value={damageInput}
          onChange={(e) => setDamageInput(e.target.value)}
          style={{ maxWidth: '6rem' }}
        />
        <Button small onClick={rollSave}>
          Roll CON Save
        </Button>
        {saveResult && (
          <span>
            Rolled {saveResult.roll.total} vs DC {saveResult.dc} —{' '}
            <strong>{saveResult.roll.total >= saveResult.dc ? 'Kept concentration' : 'Lost concentration'}</strong>
          </span>
        )}
      </span>
    </div>
  )
}

export function SpellcastingCard({ character, update }: SectionProps) {
  const { spellcasting } = character
  const profBonus = proficiencyBonusForLevel(Math.max(1, totalLevel(character.classes)))
  const abilityMod = spellcasting.ability ? abilityModifier(character.abilityScores[spellcasting.ability]) : 0
  const saveDc = 8 + profBonus + abilityMod
  const attackBonus = profBonus + abilityMod
  const conSaveBonus =
    abilityModifier(character.abilityScores.con) + (character.savingThrowProficiencies.includes('con') ? profBonus : 0)
  const breakdown = casterBreakdownText(character)

  const setSpells = (spells: Spell[]) => update((c) => ({ ...c, spellcasting: { ...c.spellcasting, spells } }))

  const handlePickSpell = async (summary: ApiSpellSummary) => {
    const detail = await getSpell(summary.index)
    const spell: Spell = {
      id: crypto.randomUUID(),
      name: summary.name,
      srdIndex: summary.index,
      source: 'srd',
      level: summary.level,
      school: detail?.school.name ?? '',
      prepared: false,
      description: detail?.desc.join('\n\n') ?? '',
    }
    setSpells([...spellcasting.spells, spell])
  }

  const slotLevels = Object.keys(spellcasting.slots)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <Card title="Spellcasting">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        <Field label="Spellcasting Ability">
          <Select
            value={spellcasting.ability ?? ''}
            onChange={(e) =>
              update((c) => ({
                ...c,
                spellcasting: { ...c.spellcasting, ability: (e.target.value || null) as AbilityKey | null },
              }))
            }
          >
            <option value="">—</option>
            {ABILITY_KEYS.map((k) => (
              <option key={k} value={k}>
                {ABILITY_LABELS[k]}
              </option>
            ))}
          </Select>
        </Field>
        <div>
          <strong>Save DC:</strong> {spellcasting.ability ? saveDc : '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <strong>Attack Bonus:</strong> {spellcasting.ability ? formatModifier(attackBonus) : '—'}
          {spellcasting.ability && (
            <RollButton title="Roll spell attack" onRoll={() => rollD20(attackBonus, 'Spell Attack')} />
          )}
        </div>
      </div>

      {breakdown && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '-0.4rem', marginBottom: '0.75rem' }}>
          {breakdown}
        </p>
      )}

      {slotLevels.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {slotLevels.map((lvl) => {
            const slot = spellcasting.slots[lvl]
            return (
              <div key={lvl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-soft)' }}>Level {lvl}</div>
                <input
                  type="number"
                  style={{ width: '2.5rem' }}
                  value={slot.max - slot.used}
                  min={0}
                  max={slot.max}
                  onChange={(e) => {
                    const remaining = Math.min(slot.max, Math.max(0, Number(e.target.value) || 0))
                    update((c) => ({
                      ...c,
                      spellcasting: {
                        ...c.spellcasting,
                        slots: { ...c.spellcasting.slots, [lvl]: { ...slot, used: slot.max - remaining } },
                      },
                    }))
                  }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-soft)' }}>of {slot.max}</div>
              </div>
            )
          })}
        </div>
      )}

      {spellcasting.pactSlots && (
        <div style={{ marginBottom: '0.75rem' }}>
          <strong>Pact Magic:</strong>{' '}
          {spellcasting.pactSlots.max - spellcasting.pactSlots.used} / {spellcasting.pactSlots.max} slots
        </div>
      )}

      <ConcentrationTracker character={character} update={update} conSaveBonus={conSaveBonus} />

      {spellcasting.spells.length === 0 && <p className={styles.empty}>No spells added yet.</p>}
      {spellcasting.spells.map((s) => (
        <div key={s.id} className={styles.row}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <input
              type="checkbox"
              checked={s.prepared}
              title="Prepared"
              onChange={(e) =>
                setSpells(spellcasting.spells.map((x) => (x.id === s.id ? { ...x, prepared: e.target.checked } : x)))
              }
            />
          </label>
          <span className={styles.name}>{s.name}</span>
          <span style={{ color: 'var(--color-ink-soft)', fontSize: '0.85rem' }}>
            {s.level === 0 ? 'cantrip' : `lvl ${s.level}`}
          </span>
          <WikiLink href={s.srdIndex ? spellLink(s.srdIndex) : WIKI_INDEX.spells} title="Look up spell on the wiki" />
          <Button
            small
            variant={spellcasting.concentratingOn === s.name ? 'gold' : 'default'}
            title="Toggle concentrating on this spell"
            onClick={() =>
              update((c) => ({
                ...c,
                spellcasting: {
                  ...c.spellcasting,
                  concentratingOn: c.spellcasting.concentratingOn === s.name ? null : s.name,
                },
              }))
            }
          >
            🎯
          </Button>
          <Button small variant="danger" onClick={() => setSpells(spellcasting.spells.filter((x) => x.id !== s.id))}>
            ✕
          </Button>
        </div>
      ))}

      <div className={styles.addRow}>
        <SpellSearch onPick={handlePickSpell} />
      </div>
    </Card>
  )
}

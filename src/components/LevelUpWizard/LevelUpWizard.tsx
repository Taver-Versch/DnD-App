import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Select } from '../common/Field'
import { getFeature, getSubclassLevels } from '../../data/dataProvider'
import { aggregateLevelChanges, getLevelUpChanges, type LevelUpChanges } from '../../rules/5e/levelUpFeatures'
import { averageHpGain, rollHitDie } from '../../rules/5e/hitDice'
import { syncClassesChange } from '../../rules/5e/classSync'
import { computeSpellSlots } from '../../rules/5e/spellSlots'
import { extractClassResources, mergeResourceDeltas } from '../../rules/5e/classResources'
import { PHB_FEATS } from '../../data/phbSupplement'
import { WikiLink } from '../common/WikiLink'
import { WIKI_INDEX } from '../../data/wikiLinks'
import {
  ABILITY_KEYS,
  abilityModifier,
  formatModifier,
  type AbilityKey,
  type Feature,
} from '../../store/types'
import type { SectionProps } from '../CharacterSheet/sectionProps'

const ABILITY_LABELS: Record<AbilityKey, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
}

export function LevelUpWizard({ character, update, onClose }: SectionProps & { onClose: () => void }) {
  const [classId, setClassId] = useState(character.classes[0]?.id ?? '')
  const [hpMethod, setHpMethod] = useState<'average' | 'roll'>('average')
  const [rolledValue, setRolledValue] = useState<number | null>(null)
  const [changes, setChanges] = useState<LevelUpChanges | undefined>(undefined)
  const [subclassChanges, setSubclassChanges] = useState<LevelUpChanges | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [featureDescriptions, setFeatureDescriptions] = useState<Map<string, string>>(new Map())
  const [asiAllocation, setAsiAllocation] = useState<Record<AbilityKey, number>>({
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  })
  const [featName, setFeatName] = useState('')

  const selectedClass = character.classes.find((c) => c.id === classId)
  const targetLevel = Math.min(20, (selectedClass?.level ?? 0) + 1)
  const conMod = abilityModifier(character.abilityScores.con)

  useEffect(() => {
    setChanges(undefined)
    setSubclassChanges(undefined)
    setRolledValue(null)
    setAsiAllocation({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 })
    setFeatName('')
    if (!selectedClass || selectedClass.source !== 'srd' || !selectedClass.srdIndex) return
    setLoading(true)

    const classPromise = getLevelUpChanges(selectedClass.srdIndex, targetLevel)
    const subclassPromise =
      selectedClass.subclass?.source === 'srd' && selectedClass.subclass.srdIndex
        ? getSubclassLevels(selectedClass.subclass.srdIndex).then((levels) =>
            aggregateLevelChanges(levels, targetLevel)
          )
        : Promise.resolve(undefined)

    Promise.all([classPromise, subclassPromise])
      .then(([classResult, subclassResult]) => {
        setChanges(classResult)
        setSubclassChanges(subclassResult)
      })
      .finally(() => setLoading(false))
  }, [classId, targetLevel, selectedClass])

  const allNewFeatures = [...(changes?.features ?? []), ...(subclassChanges?.features ?? [])]

  useEffect(() => {
    if (allNewFeatures.length === 0) return
    let cancelled = false
    Promise.all(allNewFeatures.map((f) => getFeature(f.index))).then((details) => {
      if (cancelled) return
      const map = new Map<string, string>()
      details.forEach((d, i) => {
        if (d) map.set(allNewFeatures[i].index, d.desc.join('\n\n'))
      })
      setFeatureDescriptions(map)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changes, subclassChanges])

  const hpGain = useMemo(() => {
    if (!selectedClass) return 0
    const base = hpMethod === 'average' ? averageHpGain(selectedClass.hitDie) : rolledValue ?? averageHpGain(selectedClass.hitDie)
    return Math.max(1, base + conMod)
  }, [selectedClass, hpMethod, rolledValue, conMod])

  const asiTotal = ABILITY_KEYS.reduce((sum, k) => sum + asiAllocation[k], 0)

  const spellSlotPreview = useMemo(() => {
    if (!selectedClass) return null
    const nextClasses = character.classes.map((c) => (c.id === classId ? { ...c, level: targetLevel } : c))
    const current = computeSpellSlots(character.classes)
    const next = computeSpellSlots(nextClasses)
    const changed =
      JSON.stringify(Object.entries(current.slots).map(([l, s]) => [l, s.max])) !==
        JSON.stringify(Object.entries(next.slots).map(([l, s]) => [l, s.max])) ||
      current.pactSlots?.max !== next.pactSlots?.max
    return changed ? next : null
  }, [character.classes, classId, selectedClass, targetLevel])

  const resourceDeltas = extractClassResources({
    ...(changes?.classSpecific ?? {}),
    ...(subclassChanges?.classSpecific ?? {}),
  })

  const adjustAsi = (key: AbilityKey, delta: number) => {
    setAsiAllocation((prev) => {
      const nextVal = Math.max(0, Math.min(2, prev[key] + delta))
      const currentTotal = ABILITY_KEYS.reduce((s, k) => s + (k === key ? 0 : prev[k]), 0)
      if (currentTotal + nextVal > 2) return prev
      const score = character.abilityScores[key]
      if (score + nextVal > 20) return prev
      return { ...prev, [key]: nextVal }
    })
  }

  const handleConfirm = () => {
    if (!selectedClass) return
    const nextClasses = character.classes.map((c) => (c.id === classId ? { ...c, level: targetLevel } : c))
    let next = syncClassesChange(character, nextClasses)

    next = {
      ...next,
      hitPoints: {
        ...next.hitPoints,
        max: next.hitPoints.max + hpGain,
        current: next.hitPoints.current + hpGain,
      },
    }

    if (allNewFeatures.length > 0) {
      const newFeatures: Feature[] = allNewFeatures.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        srdIndex: f.index,
        source: 'srd',
        origin: 'class',
        levelGained: targetLevel,
        description: featureDescriptions.get(f.index) ?? '',
      }))
      next = { ...next, features: [...next.features, ...newFeatures] }
    }

    if (resourceDeltas.length > 0) {
      next = {
        ...next,
        resources: mergeResourceDeltas(next.resources, resourceDeltas),
        uiPrefs: { ...next.uiPrefs, visibleSections: { ...next.uiPrefs.visibleSections, resources: true } },
      }
    }

    if (asiTotal > 0) {
      next = {
        ...next,
        abilityScores: Object.fromEntries(
          ABILITY_KEYS.map((k) => [k, Math.min(20, next.abilityScores[k] + asiAllocation[k])])
        ) as typeof next.abilityScores,
      }
    } else if (featName.trim()) {
      const feat: Feature = {
        id: crypto.randomUUID(),
        name: featName.trim(),
        source: 'custom',
        origin: 'feat',
        levelGained: targetLevel,
        description: '',
      }
      next = { ...next, features: [...next.features, feat] }
    }

    // Spell slots are already recomputed by the syncClassesChange call above.

    update(() => next)
    onClose()
  }

  if (character.classes.length === 0) {
    return (
      <Modal title="Level Up" onClose={onClose}>
        <p>Add a class in the Identity section first.</p>
      </Modal>
    )
  }

  return (
    <Modal
      title={`Level Up${selectedClass ? ` — ${selectedClass.name} ${targetLevel}` : ''}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!selectedClass || targetLevel > 20}>
            Confirm Level Up
          </Button>
        </>
      }
    >
      {character.classes.length > 1 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
            {character.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (currently {c.level})
              </option>
            ))}
          </Select>
        </div>
      )}

      <section style={{ marginBottom: '1rem' }}>
        <h4>Hit Points</h4>
        <label style={{ marginRight: '1rem' }}>
          <input
            type="radio"
            checked={hpMethod === 'average'}
            onChange={() => setHpMethod('average')}
          />{' '}
          Take average ({selectedClass ? averageHpGain(selectedClass.hitDie) : 0})
        </label>
        <label>
          <input type="radio" checked={hpMethod === 'roll'} onChange={() => setHpMethod('roll')} />{' '}
          Roll d{selectedClass?.hitDie}
          {hpMethod === 'roll' && (
            <>
              {' '}
              <Button
                small
                onClick={() => selectedClass && setRolledValue(rollHitDie(selectedClass.hitDie))}
              >
                {rolledValue === null ? 'Roll' : `Rolled: ${rolledValue} — Reroll`}
              </Button>
            </>
          )}
        </label>
        <p>
          + CON modifier ({formatModifier(conMod)}) = <strong>+{hpGain} HP</strong> (
          {character.hitPoints.max} → {character.hitPoints.max + hpGain})
        </p>
      </section>

      {loading && <p>Loading class data…</p>}

      {allNewFeatures.length > 0 && (
        <section style={{ marginBottom: '1rem' }}>
          <h4>New Features at Level {targetLevel}</h4>
          <ul>
            {allNewFeatures.map((f) => (
              <li key={f.index}>
                <strong>{f.name}</strong>
                {featureDescriptions.get(f.index) && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', margin: '0.15rem 0 0' }}>
                    {featureDescriptions.get(f.index)!.slice(0, 220)}
                    {featureDescriptions.get(f.index)!.length > 220 ? '…' : ''}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {changes?.grantsAsi && (
        <section style={{ marginBottom: '1rem' }}>
          <h4>Ability Score Improvement — or take a feat instead</h4>
          {ABILITY_KEYS.map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.2rem 0' }}>
              <span style={{ width: '3rem' }}>{ABILITY_LABELS[k]}</span>
              <Button small onClick={() => adjustAsi(k, -1)} disabled={!!featName.trim()}>
                −
              </Button>
              <span>{asiAllocation[k]}</span>
              <Button small onClick={() => adjustAsi(k, 1)} disabled={!!featName.trim()}>
                +
              </Button>
              <span style={{ color: 'var(--color-ink-soft)', fontSize: '0.8rem' }}>
                ({character.abilityScores[k]} → {character.abilityScores[k] + asiAllocation[k]})
              </span>
            </div>
          ))}
          <p style={{ fontSize: '0.8rem', color: asiTotal === 2 ? 'var(--color-success)' : 'var(--color-ink-soft)' }}>
            {asiTotal}/2 points allocated
          </p>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <input
              type="text"
              list="phb-feats"
              placeholder="…or type a feat name instead of allocating points"
              value={featName}
              disabled={asiTotal > 0}
              onChange={(e) => setFeatName(e.target.value)}
              style={{ flex: 1, padding: '0.35em 0.5em' }}
            />
            <WikiLink href={WIKI_INDEX.feats} title="Browse feats on the wiki" />
            <datalist id="phb-feats">
              {PHB_FEATS.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>
        </section>
      )}

      {resourceDeltas.length > 0 && (
        <section style={{ marginBottom: '1rem' }}>
          <h4>Resources</h4>
          <ul>
            {resourceDeltas.map((r) => (
              <li key={r.name}>
                {r.name}: {r.max} (resets on {r.resetOn} rest)
              </li>
            ))}
          </ul>
        </section>
      )}

      {spellSlotPreview && (
        <section>
          <h4>New Spell Slots</h4>
          <p>
            {Object.entries(spellSlotPreview.slots)
              .map(([lvl, s]) => `Lvl ${lvl}: ${s.max}`)
              .join(', ')}
            {spellSlotPreview.pactSlots ? ` · Pact: ${spellSlotPreview.pactSlots.max}` : ''}
          </p>
        </section>
      )}
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { Field, NumberInput, Select, TextInput } from '../common/Field'
import { SrdPicker } from '../common/SrdPicker'
import { ChildPicker } from '../common/ChildPicker'
import { WikiLink } from '../common/WikiLink'
import { getClass, getClassLevels, getRace, listBackgrounds, listClasses, listRaces } from '../../data/dataProvider'
import { PHB_BACKGROUNDS_BEYOND_SRD, PHB_SUBCLASSES_BEYOND_SRD, SPECIES_BEYOND_SRD } from '../../data/phbSupplement'
import { WIKI_INDEX, backgroundLink, classLink, slugify, speciesLink } from '../../data/wikiLinks'
import { proficiencyBonusForLevel } from '../../rules/5e/proficiencyBonus'
import { levelForXp } from '../../rules/5e/xpThresholds'
import { syncClassesChange } from '../../rules/5e/classSync'
import { extractClassResources, mergeResourceDeltas, type ResourceDelta } from '../../rules/5e/classResources'
import { totalLevel, type CharacterClassLevel, type HitDie } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './IdentityCard.module.css'

// Stable module-level references (not recreated per render) so ChildPicker's
// effect - which depends on this function identity - doesn't re-fetch on
// every keystroke elsewhere in the form.
async function fetchSubraces(raceIndex: string) {
  return (await getRace(raceIndex))?.subspecies ?? []
}
async function fetchSubclasses(classIndex: string) {
  return (await getClass(classIndex))?.subclasses ?? []
}

const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
]

const HIT_DIE_OPTIONS: HitDie[] = [6, 8, 10, 12]

function AddClassRow({
  onAdd,
}: {
  onAdd: (cls: CharacterClassLevel, resourceDeltas: ResourceDelta[]) => void
}) {
  const [options, setOptions] = useState<{ index: string; name: string }[]>([])
  const [selected, setSelected] = useState('')
  const [customName, setCustomName] = useState('')
  const [customDie, setCustomDie] = useState<HitDie>(8)
  const [level, setLevel] = useState(1)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    listClasses().then(setOptions)
  }, [])

  const handleAdd = async () => {
    setBusy(true)
    try {
      if (selected === '__custom__') {
        if (!customName.trim()) return
        onAdd(
          {
            id: crypto.randomUUID(),
            name: customName.trim(),
            source: 'custom',
            level,
            hitDie: customDie,
          },
          []
        )
        setCustomName('')
      } else if (selected) {
        const found = options.find((o) => o.index === selected)
        if (!found) return
        const [detail, levels] = await Promise.all([getClass(selected), getClassLevels(selected)])
        const levelData = levels.find((l) => l.level === level)
        const resourceDeltas = levelData ? extractClassResources(levelData.class_specific ?? {}) : []
        onAdd(
          {
            id: crypto.randomUUID(),
            name: found.name,
            srdIndex: found.index,
            source: 'srd',
            level,
            hitDie: (detail?.hit_die ?? 8) as HitDie,
          },
          resourceDeltas
        )
      }
      setSelected('')
      setLevel(1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.addClassRow}>
      <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Add a class…</option>
        {options.map((o) => (
          <option key={o.index} value={o.index}>
            {o.name}
          </option>
        ))}
        <option value="__custom__">Custom / homebrew…</option>
      </Select>
      {selected === '__custom__' && (
        <>
          <TextInput
            placeholder="Class name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <Select value={customDie} onChange={(e) => setCustomDie(Number(e.target.value) as HitDie)}>
            {HIT_DIE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                d{d}
              </option>
            ))}
          </Select>
        </>
      )}
      <NumberInput
        value={level}
        min={1}
        max={20}
        style={{ width: '4rem' }}
        onChange={(e) => setLevel(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
      />
      <Button small variant="gold" disabled={busy || !selected} onClick={handleAdd}>
        Add
      </Button>
    </div>
  )
}

export function IdentityCard({ character, update }: SectionProps) {
  const level = totalLevel(character.classes)
  const profBonus = proficiencyBonusForLevel(Math.max(1, level))
  const suggestedLevel = levelForXp(character.xp)

  return (
    <Card title="Identity">
      <div className={styles.identityGrid}>
        <Field label="Name">
          <TextInput value={character.name} onChange={(e) => update((c) => ({ ...c, name: e.target.value }))} />
        </Field>
        <Field label="Player">
          <TextInput
            value={character.playerName}
            onChange={(e) => update((c) => ({ ...c, playerName: e.target.value }))}
          />
        </Field>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3rem' }}>
          <SrdPicker
            label="Race"
            fetchList={listRaces}
            localOptions={SPECIES_BEYOND_SRD}
            value={character.race}
            onChange={(ref) => update((c) => ({ ...c, race: ref, subrace: null }))}
          />
          <WikiLink
            href={
              character.race?.srdIndex
                ? speciesLink(character.race.srdIndex)
                : character.race?.name && SPECIES_BEYOND_SRD.includes(character.race.name)
                  ? speciesLink(slugify(character.race.name))
                  : WIKI_INDEX.species
            }
            title="Look up species on the wiki"
          />
        </div>
        <ChildPicker
          label="Subrace"
          parentSource={character.race?.source}
          parentIndex={character.race?.srdIndex}
          fetchOptions={fetchSubraces}
          value={character.subrace}
          onChange={(subrace) => update((c) => ({ ...c, subrace }))}
        />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3rem' }}>
          <SrdPicker
            label="Background"
            fetchList={listBackgrounds}
            localOptions={PHB_BACKGROUNDS_BEYOND_SRD}
            value={character.background}
            onChange={(ref) => update((c) => ({ ...c, background: ref }))}
          />
          <WikiLink
            href={
              character.background
                ? backgroundLink(character.background.srdIndex ?? slugify(character.background.name))
                : WIKI_INDEX.backgrounds
            }
            title="Look up background on the wiki"
          />
        </div>
        <Field label="Alignment">
          <Select value={character.alignment} onChange={(e) => update((c) => ({ ...c, alignment: e.target.value }))}>
            <option value="">—</option>
            {ALIGNMENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Experience Points">
          <NumberInput
            value={character.xp}
            min={0}
            onChange={(e) => update((c) => ({ ...c, xp: Math.max(0, Number(e.target.value) || 0) }))}
          />
        </Field>
      </div>
      {suggestedLevel !== level && level > 0 && (
        <p className={styles.hint}>XP suggests level {suggestedLevel} (current class total: {level})</p>
      )}

      <div className={styles.classSection}>
        <div className={styles.classHeader}>
          <span className={styles.classLabel}>Classes</span>
          <span className={styles.badges}>
            <span className={styles.badge}>Total Level {level}</span>
            <span className={styles.badge}>Prof. Bonus +{profBonus}</span>
          </span>
        </div>
        {character.classes.map((cls) => (
          <div key={cls.id} className={styles.classBlock}>
            <div className={styles.classRow}>
              <span className={styles.className}>{cls.name}</span>
              <WikiLink
                href={cls.srdIndex ? classLink(cls.srdIndex) : WIKI_INDEX.classes}
                title="Look up class on the wiki"
              />
              <NumberInput
                value={cls.level}
                min={1}
                max={20}
                style={{ width: '4rem' }}
                onChange={(e) =>
                  update((c) =>
                    syncClassesChange(
                      c,
                      c.classes.map((x) =>
                        x.id === cls.id ? { ...x, level: Math.min(20, Math.max(1, Number(e.target.value) || 1)) } : x
                      )
                    )
                  )
                }
              />
              <span className={styles.hitDie}>d{cls.hitDie}</span>
              <Button
                small
                variant="danger"
                onClick={() =>
                  update((c) => syncClassesChange(c, c.classes.filter((x) => x.id !== cls.id)))
                }
              >
                Remove
              </Button>
            </div>
            <div className={styles.subclassRow}>
              <ChildPicker
                label="Subclass"
                parentSource={cls.source}
                parentIndex={cls.srdIndex}
                fetchOptions={fetchSubclasses}
                localOptions={cls.srdIndex ? (PHB_SUBCLASSES_BEYOND_SRD[cls.srdIndex] ?? []) : []}
                value={cls.subclass}
                onChange={(subclass) =>
                  update((c) => ({
                    ...c,
                    classes: c.classes.map((x) =>
                      x.id === cls.id ? { ...x, subclass: subclass ?? undefined } : x
                    ),
                  }))
                }
              />
            </div>
          </div>
        ))}
        <AddClassRow
          onAdd={(cls, resourceDeltas) =>
            update((c) => {
              const next = syncClassesChange(c, [...c.classes, cls])
              if (resourceDeltas.length === 0) return next
              return {
                ...next,
                resources: mergeResourceDeltas(next.resources, resourceDeltas),
                uiPrefs: { ...next.uiPrefs, visibleSections: { ...next.uiPrefs.visibleSections, resources: true } },
              }
            })
          }
        />
      </div>
    </Card>
  )
}

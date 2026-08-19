import { abilityModifier, type Character, type CharacterClassLevel, type SpellSlotLevel } from '../../store/types'
import { averageHpGain, deriveHitDicePools } from './hitDice'
import { computeSpellSlots } from './spellSlots'

/**
 * Applies a change to `character.classes` (add/remove/level edit), keeping hit
 * dice pools and spell slots in sync, and seeding starting HP the moment the
 * very first class is added (max hit die + CON mod at level 1, plus the
 * average roll per additional level if the character is quick-started above
 * level 1). This is just a sensible default - the Level-Up Wizard is the
 * guided path for every level after this.
 *
 * Spell slots are always fully recomputed from the current class list (the
 * slot tables are static, so this is cheap and needs no network access) -
 * that keeps a level 1 Wizard's slots correct immediately, not just after
 * their first trip through the Level-Up Wizard.
 */
export function syncClassesChange(c: Character, nextClasses: CharacterClassLevel[]): Character {
  const wasEmpty = c.classes.length === 0
  const hitDice = deriveHitDicePools(nextClasses, c.hitDice)
  let hitPoints = c.hitPoints

  if (wasEmpty && nextClasses.length === 1 && c.hitPoints.max === 0) {
    const first = nextClasses[0]
    const conMod = abilityModifier(c.abilityScores.con)
    const startingHp =
      first.hitDie + conMod + Math.max(0, first.level - 1) * (averageHpGain(first.hitDie) + conMod)
    hitPoints = { max: Math.max(1, startingHp), current: Math.max(1, startingHp), temp: 0 }
  }

  const { slots, pactSlots } = computeSpellSlots(nextClasses)
  const mergedSlots: Record<number, SpellSlotLevel> = {}
  for (const [lvlStr, slot] of Object.entries(slots)) {
    const lvl = Number(lvlStr)
    const prevUsed = c.spellcasting.slots[lvl]?.used ?? 0
    mergedSlots[lvl] = { max: slot.max, used: Math.min(prevUsed, slot.max) }
  }
  const mergedPact = pactSlots
    ? { max: pactSlots.max, used: Math.min(c.spellcasting.pactSlots?.used ?? 0, pactSlots.max) }
    : null
  const hasSlots = Object.keys(mergedSlots).length > 0 || mergedPact !== null

  return {
    ...c,
    classes: nextClasses,
    hitDice,
    hitPoints,
    spellcasting: { ...c.spellcasting, slots: mergedSlots, pactSlots: mergedPact },
    uiPrefs: hasSlots
      ? { ...c.uiPrefs, visibleSections: { ...c.uiPrefs.visibleSections, spellcasting: true } }
      : c.uiPrefs,
  }
}

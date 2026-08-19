import type { Character, HitDicePool, Resource } from '../../store/types'
import { abilityModifier } from '../../store/types'

export interface HitDieSpend {
  die: HitDicePool['die']
  roll: number
}

export interface ShortRestPlan {
  spends: HitDieSpend[]
  conModifier: number
}

export interface RestResult {
  hitPoints: Character['hitPoints']
  hitDice: HitDicePool[]
  resources: Resource[]
  deathSaves?: Character['deathSaves']
}

/** Applies a short rest: spends the chosen hit dice for HP and restores short-rest resources. */
export function resolveShortRest(character: Character, plan: ShortRestPlan): RestResult {
  const healed = plan.spends.reduce((sum, s) => sum + Math.max(0, s.roll + plan.conModifier), 0)

  const spendCountByDie = new Map<number, number>()
  for (const s of plan.spends) {
    spendCountByDie.set(s.die, (spendCountByDie.get(s.die) ?? 0) + 1)
  }

  const hitDice = character.hitDice.map((pool) => {
    const spent = spendCountByDie.get(pool.die) ?? 0
    return { ...pool, remaining: Math.max(0, pool.remaining - spent) }
  })

  const hitPoints = {
    ...character.hitPoints,
    current: Math.min(character.hitPoints.max, character.hitPoints.current + healed),
  }

  const resources = character.resources.map((r) =>
    r.resetOn === 'short' ? { ...r, current: r.max } : r
  )

  return { hitPoints, hitDice, resources }
}

/** Applies a long rest: full HP, half (min 1) hit dice recovered, all resources reset, death saves cleared. */
export function resolveLongRest(character: Character): RestResult {
  const hitPoints = { ...character.hitPoints, current: character.hitPoints.max, temp: 0 }

  const hitDice = character.hitDice.map((pool) => {
    const recovered = Math.max(1, Math.floor(pool.total / 2))
    return { ...pool, remaining: Math.min(pool.total, pool.remaining + recovered) }
  })

  const resources = character.resources.map((r) => ({ ...r, current: r.max }))

  return { hitPoints, hitDice, resources, deathSaves: { successes: 0, failures: 0 } }
}

export function conModifierFor(character: Character): number {
  return abilityModifier(character.abilityScores.con)
}

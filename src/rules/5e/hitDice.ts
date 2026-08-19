import type { CharacterClassLevel, HitDie, HitDicePool } from '../../store/types'

/** Average HP gained from a hit die per the "take the average" 5e rule (rounded up). */
export function averageHpGain(die: HitDie): number {
  return Math.floor(die / 2) + 1
}

/** Roll a single hit die (1..die), for players who prefer rolling over the average. */
export function rollHitDie(die: HitDie): number {
  return Math.floor(Math.random() * die) + 1
}

/**
 * Recomputes hit dice pools (grouped by die size) from the character's classes,
 * preserving already-spent dice (`remaining`) for die sizes that still exist.
 */
export function deriveHitDicePools(
  classes: CharacterClassLevel[],
  existing: HitDicePool[]
): HitDicePool[] {
  const totalsByDie = new Map<HitDie, number>()
  for (const cls of classes) {
    totalsByDie.set(cls.hitDie, (totalsByDie.get(cls.hitDie) ?? 0) + cls.level)
  }
  const existingByDie = new Map(existing.map((p) => [p.die, p]))

  const pools: HitDicePool[] = []
  for (const [die, total] of totalsByDie) {
    const prev = existingByDie.get(die)
    const remaining = prev ? Math.min(total, prev.remaining) : total
    pools.push({ die, total, remaining })
  }
  return pools.sort((a, b) => b.die - a.die)
}

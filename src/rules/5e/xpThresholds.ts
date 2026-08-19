/** Cumulative XP required to reach each level, per the 5e PHB advancement table. */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
}

/** Highest level whose XP threshold the given XP total meets or exceeds. */
export function levelForXp(xp: number): number {
  let level = 1
  for (let l = 1; l <= 20; l++) {
    if (xp >= XP_THRESHOLDS[l]) level = l
  }
  return level
}

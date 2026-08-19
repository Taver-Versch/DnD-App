/**
 * Levels (within a single class's own progression) that grant an Ability Score
 * Improvement / feat choice. Base 4/8/12/16/19 for every class, with Fighter and
 * Rogue getting extra ones per the PHB.
 */
const BASE_ASI_LEVELS = [4, 8, 12, 16, 19]

const CLASS_EXTRA_ASI_LEVELS: Record<string, number[]> = {
  fighter: [6, 14],
  rogue: [10],
}

export function asiLevelsForClass(classSrdIndex: string): number[] {
  const extra = CLASS_EXTRA_ASI_LEVELS[classSrdIndex] ?? []
  return [...BASE_ASI_LEVELS, ...extra].sort((a, b) => a - b)
}

export function grantsAsiAtLevel(classSrdIndex: string, classLevel: number): boolean {
  return asiLevelsForClass(classSrdIndex).includes(classLevel)
}

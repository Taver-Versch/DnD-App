/** Standard 5e proficiency bonus by total character level (1-20). */
export function proficiencyBonusForLevel(level: number): number {
  const clamped = Math.min(20, Math.max(1, level))
  return Math.ceil(clamped / 4) + 1
}

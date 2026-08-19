import type { Character } from '../../store/types'

export type UpdateCharacter = (updater: (character: Character) => Character) => void

export interface SectionProps {
  character: Character
  update: UpdateCharacter
}

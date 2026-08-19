import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character } from './types'
import { cloneCharacter, createBlankCharacter } from './characterFactory'

interface CharacterStoreState {
  characters: Record<string, Character>
  order: string[]
  createCharacter: (name?: string) => string
  duplicateCharacter: (id: string) => string | undefined
  deleteCharacter: (id: string) => void
  updateCharacter: (id: string, updater: (character: Character) => Character) => void
  importCharacter: (character: Character) => string
}

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    (set, get) => ({
      characters: {},
      order: [],

      createCharacter: (name) => {
        const character = createBlankCharacter(name)
        set((s) => ({
          characters: { ...s.characters, [character.id]: character },
          order: [...s.order, character.id],
        }))
        return character.id
      },

      duplicateCharacter: (id) => {
        const source = get().characters[id]
        if (!source) return undefined
        const copy = cloneCharacter(source)
        set((s) => ({
          characters: { ...s.characters, [copy.id]: copy },
          order: [...s.order, copy.id],
        }))
        return copy.id
      },

      deleteCharacter: (id) => {
        set((s) => {
          const characters = { ...s.characters }
          delete characters[id]
          return { characters, order: s.order.filter((cid) => cid !== id) }
        })
      },

      updateCharacter: (id, updater) => {
        set((s) => {
          const current = s.characters[id]
          if (!current) return s
          const next = updater(current)
          return {
            characters: { ...s.characters, [id]: { ...next, updatedAt: new Date().toISOString() } },
          }
        })
      },

      importCharacter: (character) => {
        const withNewId = { ...character, id: crypto.randomUUID() }
        set((s) => ({
          characters: { ...s.characters, [withNewId.id]: withNewId },
          order: [...s.order, withNewId.id],
        }))
        return withNewId.id
      },
    }),
    { name: 'dnd-character-store' }
  )
)

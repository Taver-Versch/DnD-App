import { describe, expect, it } from 'vitest'
import { createBlankCharacter } from '../../store/characterFactory'
import { syncClassesChange } from './classSync'
import type { CharacterClassLevel } from '../../store/types'

describe('syncClassesChange', () => {
  it('seeds starting HP for the first class added at level 1', () => {
    const character = createBlankCharacter('Test')
    character.abilityScores.con = 14 // +2 mod
    const cls: CharacterClassLevel = { id: '1', name: 'Fighter', source: 'custom', level: 1, hitDie: 10 }
    const next = syncClassesChange(character, [cls])
    expect(next.hitPoints).toEqual({ max: 12, current: 12, temp: 0 }) // 10 + 2
  })

  it('seeds a sensible starting HP when the first class is quick-started above level 1', () => {
    const character = createBlankCharacter('Test')
    character.abilityScores.con = 14 // +2 mod
    const cls: CharacterClassLevel = { id: '1', name: 'Monk', source: 'srd', srdIndex: 'monk', level: 2, hitDie: 8 }
    const next = syncClassesChange(character, [cls])
    // level 1: 8+2=10, level 2 average: avgHpGain(8)=5, +2 con = 7. Total 17.
    expect(next.hitPoints).toEqual({ max: 17, current: 17, temp: 0 })
  })

  it('does not reseed HP once it has already been set', () => {
    const character = createBlankCharacter('Test')
    character.hitPoints = { max: 30, current: 10, temp: 0 }
    const cls: CharacterClassLevel = { id: '1', name: 'Fighter', source: 'custom', level: 1, hitDie: 10 }
    const next = syncClassesChange(character, [cls])
    expect(next.hitPoints).toEqual({ max: 30, current: 10, temp: 0 })
  })

  it('populates spell slots immediately for a level 1 full caster', () => {
    const character = createBlankCharacter('Test')
    const cls: CharacterClassLevel = { id: '1', name: 'Wizard', source: 'srd', srdIndex: 'wizard', level: 1, hitDie: 6 }
    const next = syncClassesChange(character, [cls])
    expect(next.spellcasting.slots[1]).toEqual({ max: 2, used: 0 })
    expect(next.uiPrefs.visibleSections.spellcasting).toBe(true)
  })

  it('keeps hit dice in sync with class levels', () => {
    const character = createBlankCharacter('Test')
    const cls: CharacterClassLevel = { id: '1', name: 'Fighter', source: 'custom', level: 3, hitDie: 10 }
    const next = syncClassesChange(character, [cls])
    expect(next.hitDice).toEqual([{ die: 10, total: 3, remaining: 3 }])
  })
})

import { SKILLS, type Attack, type Character, type SkillKey, type SkillState } from './types'

export function createBlankAttack(): Attack {
  return { id: crypto.randomUUID(), name: '', bonus: '', damage: '', damageType: '', notes: '' }
}

function blankSkills(): Record<SkillKey, SkillState> {
  const skills = {} as Record<SkillKey, SkillState>
  for (const key of Object.keys(SKILLS) as SkillKey[]) {
    skills[key] = { proficient: false, expertise: false }
  }
  return skills
}

export function createBlankCharacter(name = 'New Adventurer'): Character {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,

    name,
    classes: [],
    race: null,
    subrace: null,
    background: null,
    alignment: '',
    xp: 0,
    playerName: '',

    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    skills: blankSkills(),
    savingThrowProficiencies: [],

    armorClass: 10,
    initiativeBonus: 0,
    speed: 30,
    hitPoints: { max: 0, current: 0, temp: 0 },
    hitDice: [],
    deathSaves: { successes: 0, failures: 0 },

    attacks: [],
    inventory: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    features: [],
    spellcasting: { ability: null, slots: {}, pactSlots: null, spells: [], concentratingOn: null },
    resources: [],
    notes: '',
    sessionLog: [],
    companion: null,

    conditions: [],
    exhaustion: 0,
    inspiration: false,

    uiPrefs: {
      visibleSections: {
        attacks: true,
        inventory: true,
        features: true,
        spellcasting: false,
        resources: false,
        notes: true,
        sessionLog: false,
        companion: false,
      },
    },
  }
}

export function cloneCharacter(character: Character, nameSuffix = ' (copy)'): Character {
  const now = new Date().toISOString()
  return {
    ...structuredClone(character),
    id: crypto.randomUUID(),
    name: character.name + nameSuffix,
    createdAt: now,
    updatedAt: now,
  }
}

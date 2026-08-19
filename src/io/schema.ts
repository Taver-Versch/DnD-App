import { z } from 'zod'
import { ABILITY_KEYS, SECTION_KEYS, SKILLS } from '../store/types'

const skillKeys = Object.keys(SKILLS) as [string, ...string[]]

const abilityKeySchema = z.enum(ABILITY_KEYS)

const sourcedRefSchema = z.object({
  name: z.string(),
  srdIndex: z.string().optional(),
  source: z.enum(['srd', 'custom']),
})

const skillStateSchema = z.object({
  proficient: z.boolean(),
  expertise: z.boolean(),
})

const attackSchema = z.object({
  id: z.string(),
  name: z.string(),
  bonus: z.string(),
  damage: z.string(),
  damageType: z.string(),
  notes: z.string(),
})

const hitPointsSchema = z.object({
  max: z.number().int(),
  current: z.number().int(),
  temp: z.number().int(),
})

export const characterSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal(1),
  createdAt: z.string(),
  updatedAt: z.string(),

  name: z.string(),
  classes: z.array(
    sourcedRefSchema.extend({
      id: z.string(),
      level: z.number().int().min(1).max(20),
      hitDie: z.union([z.literal(6), z.literal(8), z.literal(10), z.literal(12)]),
      subclass: sourcedRefSchema.optional(),
    })
  ),
  race: sourcedRefSchema.nullable(),
  subrace: sourcedRefSchema.nullable(),
  background: sourcedRefSchema.nullable(),
  alignment: z.string(),
  xp: z.number().int().min(0),
  playerName: z.string(),

  abilityScores: z.record(abilityKeySchema, z.number().int()),
  skills: z.record(z.enum(skillKeys), skillStateSchema),
  savingThrowProficiencies: z.array(abilityKeySchema),

  armorClass: z.number().int(),
  initiativeBonus: z.number().int(),
  speed: z.number().int(),
  hitPoints: hitPointsSchema,
  hitDice: z.array(
    z.object({
      total: z.number().int(),
      remaining: z.number().int(),
      die: z.union([z.literal(6), z.literal(8), z.literal(10), z.literal(12)]),
    })
  ),
  deathSaves: z.object({ successes: z.number().int(), failures: z.number().int() }),

  attacks: z.array(attackSchema),
  inventory: z.array(
    sourcedRefSchema.extend({
      id: z.string(),
      quantity: z.number(),
      weight: z.number(),
      description: z.string(),
      equipped: z.boolean(),
    })
  ),
  currency: z.object({
    cp: z.number(),
    sp: z.number(),
    ep: z.number(),
    gp: z.number(),
    pp: z.number(),
  }),
  features: z.array(
    sourcedRefSchema.extend({
      id: z.string(),
      description: z.string(),
      levelGained: z.number().optional(),
      origin: z.enum(['race', 'class', 'background', 'feat', 'other']),
    })
  ),
  spellcasting: z.object({
    ability: abilityKeySchema.nullable(),
    slots: z.record(z.coerce.number(), z.object({ max: z.number(), used: z.number() })),
    pactSlots: z.object({ max: z.number(), used: z.number() }).nullable(),
    spells: z.array(
      sourcedRefSchema.extend({
        id: z.string(),
        level: z.number(),
        school: z.string(),
        prepared: z.boolean(),
        description: z.string(),
      })
    ),
    concentratingOn: z.string().nullable(),
  }),
  resources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      max: z.number(),
      current: z.number(),
      resetOn: z.enum(['short', 'long']),
    })
  ),
  notes: z.string(),
  sessionLog: z.array(
    z.object({
      id: z.string(),
      date: z.string(),
      text: z.string(),
    })
  ),
  companion: z
    .object({
      name: z.string(),
      race: z.string(),
      armorClass: z.number().int(),
      hitPoints: hitPointsSchema,
      speed: z.number().int(),
      attacks: z.array(attackSchema),
    })
    .nullable(),

  conditions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      source: z.enum(['standard', 'custom']),
      note: z.string(),
    })
  ),
  exhaustion: z.number().int().min(0).max(6),
  inspiration: z.boolean(),

  uiPrefs: z.object({
    visibleSections: z.record(z.enum(SECTION_KEYS), z.boolean()),
  }),
})

export type ValidatedCharacter = z.infer<typeof characterSchema>

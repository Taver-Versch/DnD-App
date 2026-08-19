// Names of standard 5e (2014 core Player's Handbook) content that the free
// SRD API doesn't include - just names, no mechanical text, so users have
// the full standard picker options to choose from even though only the SRD
// subset (a handful per category) can be auto-filled with mechanics. Picking
// one of these pre-fills the name as a manual entry; the user fills in the
// details themselves, same as any other homebrew entry.

/**
 * The one species in the 2024 PHB's core list that's missing from the free
 * API entirely (checked both `/api/2014/races` and `/api/2024/species` -
 * absent from both). Everything else in the core list - including Goliath
 * and Orc, which used to live here - now comes straight from
 * `/api/2024/species` via dataProvider's listRaces/getRace.
 */
export const SPECIES_BEYOND_SRD = ['Aasimar']

/** The 12 PHB backgrounds beyond Acolyte (the only one in the free SRD). */
export const PHB_BACKGROUNDS_BEYOND_SRD = [
  'Charlatan',
  'Criminal',
  'Entertainer',
  'Folk Hero',
  'Guild Artisan',
  'Hermit',
  'Noble',
  'Outlander',
  'Sage',
  'Sailor',
  'Soldier',
  'Urchin',
]

/** PHB subclasses beyond the one SRD subclass each class already has. */
export const PHB_SUBCLASSES_BEYOND_SRD: Record<string, string[]> = {
  barbarian: ['Path of the Totem Warrior'],
  bard: ['College of Valor'],
  cleric: ['Knowledge Domain', 'Light Domain', 'Nature Domain', 'Tempest Domain', 'Trickery Domain', 'War Domain'],
  druid: ['Circle of the Moon'],
  fighter: ['Battle Master', 'Eldritch Knight'],
  monk: ['Way of Shadow', 'Way of the Four Elements'],
  paladin: ['Oath of the Ancients', 'Oath of Vengeance'],
  ranger: ['Beast Master'],
  rogue: ['Arcane Trickster', 'Assassin'],
  sorcerer: ['Wild Magic'],
  warlock: ['The Archfey', 'The Great Old One'],
  wizard: ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Illusion', 'Necromancy', 'Transmutation'],
}

/** The standard PHB feats - not in the free SRD API at all, so names only, same manual-entry pattern. */
export const PHB_FEATS = [
  'Actor',
  'Alert',
  'Athlete',
  'Charger',
  'Crossbow Expert',
  'Defensive Duelist',
  'Dual Wielder',
  'Dungeon Delver',
  'Durable',
  'Elemental Adept',
  'Grappler',
  'Great Weapon Master',
  'Healer',
  'Heavily Armored',
  'Heavy Armor Master',
  'Inspiring Leader',
  'Keen Mind',
  'Lightly Armored',
  'Linguist',
  'Lucky',
  'Mage Slayer',
  'Magic Initiate',
  'Martial Adept',
  'Medium Armor Master',
  'Mobile',
  'Moderately Armored',
  'Mounted Combatant',
  'Observant',
  'Polearm Master',
  'Resilient',
  'Ritual Caster',
  'Savage Attacker',
  'Sentinel',
  'Sharpshooter',
  'Shield Master',
  'Skilled',
  'Skulker',
  'Spell Sniper',
  'Tavern Brawler',
  'Tough',
  'War Caster',
  'Weapon Master',
]

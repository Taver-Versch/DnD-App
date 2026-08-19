// Standard 5e conditions, written in our own words (not PHB text) - same
// pattern as HowToPlayModal. Shared between the conditions tracker (chips on
// the character) and the How to Play glossary, so there's one canonical list.

export interface ConditionInfo {
  name: string
  summary: string
}

export const STANDARD_CONDITIONS: ConditionInfo[] = [
  { name: "Blinded", summary: "Can't see; automatically fails sight-based checks, attacks against you have advantage, your attacks have disadvantage." },
  { name: "Charmed", summary: "Can't attack the charmer or target them with harmful abilities; the charmer has advantage on social checks against you." },
  { name: "Deafened", summary: "Can't hear; automatically fails hearing-based checks." },
  { name: "Frightened", summary: "Disadvantage on checks/attacks while the source of fear is in sight; can't willingly move closer to it." },
  { name: "Grappled", summary: "Speed becomes 0; ends if the grappler is incapacitated or the target is moved out of their reach." },
  { name: "Incapacitated", summary: "Can't take actions or reactions." },
  { name: "Invisible", summary: "Impossible to see without special senses; attacks against you have disadvantage, your attacks have advantage." },
  { name: "Paralyzed", summary: "Incapacitated and unable to move or speak; auto-fails STR/DEX saves; attacks against you have advantage and auto-crit within 5 feet." },
  { name: "Petrified", summary: "Turned to stone (with organic material included); incapacitated, unaware of surroundings, resistant to all damage." },
  { name: "Poisoned", summary: "Disadvantage on attack rolls and ability checks." },
  { name: "Prone", summary: "Can only crawl or stand up to move; disadvantage on attacks; melee attacks against you have advantage, ranged attacks have disadvantage." },
  { name: "Restrained", summary: "Speed becomes 0; disadvantage on attacks and DEX saves; attacks against you have advantage." },
  { name: "Stunned", summary: "Incapacitated, can't move, can speak only falteringly; auto-fails STR/DEX saves; attacks against you have advantage." },
  { name: "Unconscious", summary: "Incapacitated, unaware, drops what it's holding, falls prone; auto-fails STR/DEX saves; attacks against you have advantage and auto-crit within 5 feet." },
  { name: "Exhaustion", summary: "Tracked as a level (0-6), not a toggle - each level stacks worse penalties, and level 6 is death. See the Exhaustion counter on the sheet." },
]

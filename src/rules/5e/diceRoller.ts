// Freeform dice roller. `Attack.bonus`/`Attack.damage` (and similar fields
// elsewhere) are loose user-typed strings like "+5", "1d8+3", "2d6" - this
// parses that permissively and never throws; anything it can't make sense of
// comes back as `{ ok: false }` so callers can show "can't auto-roll this"
// instead of crashing.

export interface DieRoll {
  die: number
  /** The rolled face value, signed (negative only for the rare "-1d4" style term). */
  value: number
}

export interface RollResult {
  ok: true
  label: string
  dice: DieRoll[]
  modifier: number
  total: number
}

export interface RollFailure {
  ok: false
  raw: string
}

export type RollOutcome = RollResult | RollFailure

interface ParsedTerm {
  sign: 1 | -1
  count: number
  die: number | null // null = flat number term
}

function parseExpression(input: string): ParsedTerm[] | null {
  const cleaned = input.trim().replace(/\s+/g, '')
  if (!cleaned) return null

  const signed = /^[+-]/.test(cleaned) ? cleaned : `+${cleaned}`
  const parts = signed.match(/[+-][^+-]+/g)
  if (!parts) return null

  const terms: ParsedTerm[] = []
  for (const part of parts) {
    const sign: 1 | -1 = part[0] === '-' ? -1 : 1
    const body = part.slice(1)
    if (!body) return null

    const diceMatch = /^(\d*)d(\d+)$/i.exec(body)
    if (diceMatch) {
      const count = diceMatch[1] ? Number(diceMatch[1]) : 1
      const die = Number(diceMatch[2])
      if (count < 1 || count > 100 || die < 1 || die > 1000) return null
      terms.push({ sign, count, die })
    } else if (/^\d+$/.test(body)) {
      terms.push({ sign, count: Number(body), die: null })
    } else {
      return null
    }
  }
  return terms
}

export function rollDieFace(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

/** Rolls a freeform expression like "1d8+3", "+5", "2d6". `ok: false` if it can't be parsed. */
export function rollExpression(input: string, label = input): RollOutcome {
  const terms = parseExpression(input)
  if (!terms) return { ok: false, raw: input }

  const dice: DieRoll[] = []
  let modifier = 0
  for (const term of terms) {
    if (term.die === null) {
      modifier += term.sign * term.count
      continue
    }
    for (let i = 0; i < term.count; i++) {
      dice.push({ die: term.die, value: term.sign * rollDieFace(term.die) })
    }
  }

  const total = dice.reduce((sum, d) => sum + d.value, 0) + modifier
  return { ok: true, label, dice, modifier, total }
}

/** Rolls a d20 plus a flat/expression modifier - skill checks, saves, initiative. */
export function rollD20(modifier: number, label = 'd20'): RollResult {
  const roll = rollDieFace(20)
  return { ok: true, label, dice: [{ die: 20, value: roll }], modifier, total: roll + modifier }
}

/**
 * Rolls an attack: a d20 plus whatever the freeform bonus expression adds up
 * to (usually just a flat number, but this also supports a bonus die like
 * "+1d4" from e.g. Bardic Inspiration). Falls back to a bare d20 if the bonus
 * text can't be parsed at all, rather than blocking the roll.
 */
export function rollAttack(bonusExpression: string, label = 'Attack'): RollResult {
  const d20 = rollDieFace(20)
  const bonusOutcome = rollExpression(bonusExpression, label)
  if (bonusOutcome.ok) {
    return {
      ok: true,
      label,
      dice: [{ die: 20, value: d20 }, ...bonusOutcome.dice],
      modifier: bonusOutcome.modifier,
      total: d20 + bonusOutcome.total,
    }
  }
  return { ok: true, label, dice: [{ die: 20, value: d20 }], modifier: 0, total: d20 }
}

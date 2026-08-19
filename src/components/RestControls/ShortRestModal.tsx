import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { NumberStepper } from '../common/NumberStepper'
import { formatModifier } from '../../store/types'
import { conModifierFor, resolveShortRest, type HitDieSpend } from '../../rules/5e/restResolution'
import { rollHitDie } from '../../rules/5e/hitDice'
import type { SectionProps } from '../CharacterSheet/sectionProps'

export function ShortRestModal({ character, update, onClose }: SectionProps & { onClose: () => void }) {
  const [spendCounts, setSpendCounts] = useState<Record<number, number>>({})
  const conMod = conModifierFor(character)

  const setCount = (die: number, count: number, max: number) => {
    setSpendCounts((prev) => ({ ...prev, [die]: Math.min(max, Math.max(0, count)) }))
  }

  const totalSpending = Object.values(spendCounts).reduce((a, b) => a + b, 0)
  const estMin = totalSpending * Math.max(0, 1 + conMod)
  const estMax = Object.entries(spendCounts).reduce(
    (sum, [die, n]) => sum + n * Math.max(0, Number(die) + conMod),
    0
  )

  const resourcesToRestore = character.resources.filter((r) => r.resetOn === 'short' && r.current < r.max)

  const handleConfirm = () => {
    const spends: HitDieSpend[] = []
    for (const [die, count] of Object.entries(spendCounts)) {
      for (let i = 0; i < count; i++) {
        spends.push({ die: Number(die) as HitDieSpend['die'], roll: rollHitDie(Number(die) as 6 | 8 | 10 | 12) })
      }
    }
    const result = resolveShortRest(character, { spends, conModifier: conMod })
    update((c) => ({ ...c, hitPoints: result.hitPoints, hitDice: result.hitDice, resources: result.resources }))
    onClose()
  }

  return (
    <Modal
      title="Short Rest"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm}>
            Take Short Rest
          </Button>
        </>
      }
    >
      <p>Spend hit dice to recover HP (roll + CON modifier {formatModifier(conMod)} per die).</p>
      {character.hitDice.length === 0 && <p>No hit dice available.</p>}
      {character.hitDice.map((pool) => (
        <div key={pool.die} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.4rem 0' }}>
          <span style={{ width: '5rem' }}>d{pool.die} dice</span>
          <NumberStepper
            value={spendCounts[pool.die] ?? 0}
            min={0}
            max={pool.remaining}
            onChange={(n) => setCount(pool.die, n, pool.remaining)}
          />
          <span style={{ color: 'var(--color-ink-soft)', fontSize: '0.85rem' }}>
            of {pool.remaining} remaining
          </span>
        </div>
      ))}
      {totalSpending > 0 && (
        <p>
          Estimated healing: {Math.max(0, estMin)}–{Math.max(0, estMax)} HP
        </p>
      )}
      {resourcesToRestore.length > 0 && (
        <p>Also restores: {resourcesToRestore.map((r) => r.name).join(', ')}</p>
      )}
    </Modal>
  )
}

import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { resolveLongRest } from '../../rules/5e/restResolution'
import type { SectionProps } from '../CharacterSheet/sectionProps'

export function LongRestModal({ character, update, onClose }: SectionProps & { onClose: () => void }) {
  const resourcesToRestore = character.resources.filter((r) => r.current < r.max)
  const hitDiceRecovered = character.hitDice.map((pool) => ({
    die: pool.die,
    recovered: Math.min(pool.total - pool.remaining, Math.max(1, Math.floor(pool.total / 2))),
  }))

  const handleConfirm = () => {
    const result = resolveLongRest(character)
    update((c) => ({
      ...c,
      hitPoints: result.hitPoints,
      hitDice: result.hitDice,
      resources: result.resources,
      deathSaves: result.deathSaves ?? c.deathSaves,
    }))
    onClose()
  }

  return (
    <Modal
      title="Long Rest"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm}>
            Take Long Rest
          </Button>
        </>
      }
    >
      <p>A long rest will:</p>
      <ul>
        <li>
          Restore HP to full ({character.hitPoints.current} → {character.hitPoints.max})
        </li>
        {hitDiceRecovered.filter((h) => h.recovered > 0).length > 0 && (
          <li>
            Recover hit dice: {hitDiceRecovered.map((h) => `${h.recovered}×d${h.die}`).join(', ')}
          </li>
        )}
        {resourcesToRestore.length > 0 && (
          <li>Restore: {resourcesToRestore.map((r) => r.name).join(', ')}</li>
        )}
        <li>Clear death save marks</li>
      </ul>
    </Modal>
  )
}

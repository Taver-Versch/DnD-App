import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { rollDieFace } from '../../rules/5e/diceRoller'
import styles from './DiceRollerModal.module.css'

const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100]

interface LoggedRoll {
  id: string
  die: number
  face: number
  modifier: number
  total: number
}

export function DiceRollerModal({ onClose }: { onClose: () => void }) {
  const [modifier, setModifier] = useState(0)
  const [log, setLog] = useState<LoggedRoll[]>([])

  const roll = (die: number) => {
    const face = rollDieFace(die)
    const entry: LoggedRoll = { id: crypto.randomUUID(), die, face, modifier, total: face + modifier }
    setLog((prev) => [entry, ...prev].slice(0, 20))
  }

  const latest = log[0]

  return (
    <Modal
      title="Dice Roller"
      onClose={onClose}
      footer={
        <>
          <Button onClick={() => setLog([])} disabled={log.length === 0}>
            Clear
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className={styles.modifierRow}>
        <label htmlFor="dice-modifier">Modifier</label>
        <input
          id="dice-modifier"
          type="number"
          value={modifier}
          onChange={(e) => setModifier(Number(e.target.value) || 0)}
          className={styles.modifierInput}
        />
      </div>

      <div className={styles.diceGrid}>
        {STANDARD_DICE.map((die) => (
          <button key={die} type="button" className={styles.dieBtn} onClick={() => roll(die)}>
            d{die}
          </button>
        ))}
      </div>

      {latest && (
        <div className={styles.latest}>
          <span className={styles.latestLabel}>d{latest.die}</span>
          <span className={styles.latestTotal}>{latest.total}</span>
          {latest.modifier !== 0 && (
            <span className={styles.latestBreakdown}>
              ({latest.face} {latest.modifier >= 0 ? '+' : ''}
              {latest.modifier})
            </span>
          )}
        </div>
      )}

      {log.length > 1 && (
        <ul className={styles.history}>
          {log.slice(1).map((entry) => (
            <li key={entry.id}>
              d{entry.die}: {entry.face}
              {entry.modifier !== 0 ? ` ${entry.modifier >= 0 ? '+' : ''}${entry.modifier}` : ''} ={' '}
              <strong>{entry.total}</strong>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}

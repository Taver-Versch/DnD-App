import { useEffect, useRef, useState } from 'react'
import type { RollOutcome } from '../../rules/5e/diceRoller'
import styles from './RollButton.module.css'

/**
 * A small "🎲 Roll" control. Click computes the roll (via `onRoll`, called
 * lazily so nothing rolls until tapped) and shows the breakdown in a
 * dismissible popover - tap-friendly, no hover required, for table use.
 */
export function RollButton({ onRoll, title = 'Roll' }: { onRoll: () => RollOutcome; title?: string }) {
  const [result, setResult] = useState<RollOutcome | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!result) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setResult(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [result])

  return (
    <div className={styles.wrap} ref={ref}>
      <button type="button" className={styles.btn} title={title} onClick={() => setResult(onRoll())}>
        🎲
      </button>
      {result && (
        <div className={styles.popover}>
          <div className={styles.popoverLabel}>
            <span>{result.ok ? result.label : 'Roll'}</span>
            <button type="button" className={styles.closeBtn} onClick={() => setResult(null)} aria-label="Dismiss">
              ✕
            </button>
          </div>
          {result.ok ? (
            <>
              <div className={styles.dice}>
                {result.dice.map((d, i) => (i === 0 ? `d${d.die}: ${d.value}` : `, d${d.die}: ${d.value}`))}
                {result.modifier !== 0 ? ` ${result.modifier >= 0 ? '+' : ''}${result.modifier}` : ''}
              </div>
              <div className={styles.total}>{result.total}</div>
            </>
          ) : (
            <div className={styles.failed}>Can't auto-roll "{result.raw}" — do the math yourself.</div>
          )}
        </div>
      )}
    </div>
  )
}

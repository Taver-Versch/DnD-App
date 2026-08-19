import styles from './NumberStepper.module.css'

export function NumberStepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  step?: number
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <input
        className={styles.value}
        type="number"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (!Number.isNaN(n)) onChange(clamp(n))
        }}
      />
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

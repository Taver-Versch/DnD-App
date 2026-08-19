import type { ReactNode } from 'react'
import styles from './Modal.module.css'

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose?: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {onClose && (
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
              ✕
            </button>
          )}
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}

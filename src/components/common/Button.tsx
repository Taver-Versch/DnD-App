import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type Variant = 'default' | 'primary' | 'gold' | 'danger' | 'ghost'

export function Button({
  variant = 'default',
  small = false,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; small?: boolean }) {
  const variantClass = variant === 'default' ? '' : styles[variant]
  return (
    <button
      type="button"
      className={`${styles.btn} ${variantClass} ${small ? styles.small : ''} ${className ?? ''}`}
      {...rest}
    />
  )
}

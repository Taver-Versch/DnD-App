import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSettingsStore } from '../../store/appSettingsStore'
import { THEMES } from '../../theme/themes'
import { HowToPlayModal } from '../HowToPlay/HowToPlayModal'
import { DiceRollerModal } from '../DiceRoller/DiceRollerModal'
import styles from './AppHeader.module.css'

function ThemePicker() {
  const themeId = useAppSettingsStore((s) => s.themeId)
  const setThemeId = useAppSettingsStore((s) => s.setThemeId)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = THEMES.find((t) => t.id === themeId) ?? THEMES[0]

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className={styles.themePicker} ref={ref}>
      <button type="button" className={styles.themeToggle} onClick={() => setOpen((o) => !o)}>
        <span className={styles.swatchDot} style={{ background: active.swatch[1] }} />
        {active.name}
      </button>
      {open && (
        <div className={styles.themeMenu}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.themeOption} ${t.id === themeId ? styles.themeOptionActive : ''}`}
              onClick={() => {
                setThemeId(t.id)
                setOpen(false)
              }}
            >
              <span className={styles.themeSwatchRow}>
                {t.swatch.map((c, i) => (
                  <span key={i} className={styles.themeSwatch} style={{ background: c }} />
                ))}
              </span>
              <span>
                <span className={styles.themeName}>{t.name}</span>
                <span className={styles.themeTagline}>{t.tagline}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EditableTitle() {
  const appName = useAppSettingsStore((s) => s.appName)
  const setAppName = useAppSettingsStore((s) => s.setAppName)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(appName)

  if (editing) {
    return (
      <input
        className={styles.titleInput}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setAppName(draft)
          setEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(appName)
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <>
      <Link to="/" className={styles.titleLink}>
        <h1 className={styles.title}>{appName}</h1>
      </Link>
      <button
        type="button"
        className={styles.editBtn}
        title="Rename app"
        onClick={() => {
          setDraft(appName)
          setEditing(true)
        }}
      >
        ✎
      </button>
    </>
  )
}

export function AppHeader() {
  const [showHowTo, setShowHowTo] = useState(false)
  const [showDice, setShowDice] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <EditableTitle />
        <span className={styles.subtitle}>A D&amp;D 5e Companion</span>
      </div>
      <div className={styles.headerActions}>
        <button type="button" className={styles.howToBtn} onClick={() => setShowDice(true)}>
          🎲 Dice
        </button>
        <button type="button" className={styles.howToBtn} onClick={() => setShowHowTo(true)}>
          📖 How to Play
        </button>
        <ThemePicker />
      </div>
      {showHowTo && <HowToPlayModal onClose={() => setShowHowTo(false)} />}
      {showDice && <DiceRollerModal onClose={() => setShowDice(false)} />}
    </header>
  )
}

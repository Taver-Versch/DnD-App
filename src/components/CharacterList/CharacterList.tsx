import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCharacterStore } from '../../store/characterStore'
import { totalLevel } from '../../store/types'
import { readCharacterFile } from '../../io/importCharacter'
import { Button } from '../common/Button'
import styles from './CharacterList.module.css'

export function CharacterList() {
  const { characters, order, createCharacter, duplicateCharacter, deleteCharacter, importCharacter } =
    useCharacterStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleCreate = () => {
    const id = createCharacter()
    navigate(`/character/${id}`)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const result = await readCharacterFile(file)
    if (!result.ok || !result.character) {
      setImportError(result.error ?? 'Import failed.')
      return
    }
    setImportError(null)
    const id = importCharacter(result.character)
    navigate(`/character/${id}`)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteCharacter(id)
    }
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <Button variant="primary" onClick={handleCreate}>
          + New Character
        </Button>
        <Button onClick={handleImportClick}>Import from File…</Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {importError && <div className={styles.errorBanner}>{importError}</div>}

      {order.length === 0 ? (
        <div className={styles.empty}>
          <p>No characters yet. Create one, or import a saved character file.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {order.map((id) => {
            const c = characters[id]
            if (!c) return null
            const level = totalLevel(c.classes)
            const classSummary = c.classes.map((cl) => `${cl.name} ${cl.level}`).join(' / ')
            return (
              <div key={id} className={styles.card}>
                <Link to={`/character/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 className={styles.cardName}>{c.name}</h3>
                  <p className={styles.cardMeta}>
                    {c.race?.name ?? 'Unknown race'} · Level {level || '—'}
                    {classSummary ? ` · ${classSummary}` : ''}
                  </p>
                </Link>
                <div className={styles.cardActions}>
                  <Button small onClick={() => duplicateCharacter(id)}>
                    Duplicate
                  </Button>
                  <Button small variant="danger" onClick={() => handleDelete(id, c.name)}>
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

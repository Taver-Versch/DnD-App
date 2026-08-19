import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCharacterStore } from '../../store/characterStore'
import { exportCharacter } from '../../io/exportCharacter'
import { Button } from '../common/Button'
import { IdentityCard } from './IdentityCard'
import { AbilityScoresCard } from './AbilityScoresCard'
import { SkillsCard } from './SkillsCard'
import { CombatCard } from './CombatCard'
import { AttacksCard } from './AttacksCard'
import { InventoryCard } from './InventoryCard'
import { FeaturesCard } from './FeaturesCard'
import { SpellcastingCard } from './SpellcastingCard'
import { ResourcesCard } from './ResourcesCard'
import { NotesCard } from './NotesCard'
import { SessionLogCard } from './SessionLogCard'
import { CompanionCard } from './CompanionCard'
import { SheetCustomizer } from '../SheetCustomizer/SheetCustomizer'
import { LevelUpWizard } from '../LevelUpWizard/LevelUpWizard'
import { VitalsBar } from './VitalsBar'
import type { UpdateCharacter } from './sectionProps'
import styles from './CharacterSheet.module.css'

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const character = useCharacterStore((s) => (id ? s.characters[id] : undefined))
  const updateCharacter = useCharacterStore((s) => s.updateCharacter)
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter)

  const [showCustomizer, setShowCustomizer] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)

  if (!character || !id) {
    return (
      <div className={styles.notFound}>
        <p>Character not found.</p>
        <Link to="/">← Back to characters</Link>
      </div>
    )
  }

  const update: UpdateCharacter = (updater) => updateCharacter(id, updater)
  const sections = character.uiPrefs.visibleSections

  const handleDelete = () => {
    if (confirm(`Delete "${character.name}"? This cannot be undone.`)) {
      deleteCharacter(id)
      navigate('/')
    }
  }

  return (
    <div className={styles.page}>
      <VitalsBar character={character} update={update} />

      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← All Characters
        </Link>
        <div className={styles.actions}>
          <Button variant="gold" onClick={() => setShowLevelUp(true)} disabled={character.classes.length === 0}>
            ↑ Level Up
          </Button>
          <Button onClick={() => setShowCustomizer(true)}>Customize Sections</Button>
          <Button onClick={() => exportCharacter(character)}>Export JSON</Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <IdentityCard character={character} update={update} />

      <div className={styles.masonry}>
        <CombatCard character={character} update={update} />
        {sections.resources && <ResourcesCard character={character} update={update} />}
        <AbilityScoresCard character={character} update={update} />
        {sections.attacks && <AttacksCard character={character} update={update} />}
        {sections.inventory && <InventoryCard character={character} update={update} />}
        {sections.features && <FeaturesCard character={character} update={update} />}
        <SkillsCard character={character} update={update} />
        {sections.spellcasting && <SpellcastingCard character={character} update={update} />}
        {sections.notes && <NotesCard character={character} update={update} />}
        {sections.sessionLog && <SessionLogCard character={character} update={update} />}
        {sections.companion && <CompanionCard character={character} update={update} />}
      </div>

      {showCustomizer && (
        <SheetCustomizer character={character} update={update} onClose={() => setShowCustomizer(false)} />
      )}
      {showLevelUp && (
        <LevelUpWizard character={character} update={update} onClose={() => setShowLevelUp(false)} />
      )}
    </div>
  )
}

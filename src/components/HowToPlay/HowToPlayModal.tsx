import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { STANDARD_CONDITIONS } from '../../data/conditions'
import styles from './HowToPlayModal.module.css'

const ACTIONS: { name: string; desc: string }[] = [
  { name: 'Attack', desc: 'Make one melee or ranged attack (some features let you attack more than once).' },
  { name: 'Cast a Spell', desc: 'Cast a spell with a casting time of 1 action.' },
  { name: 'Dash', desc: 'Gain extra movement equal to your speed for the turn.' },
  { name: 'Disengage', desc: "Your movement this turn doesn't provoke opportunity attacks." },
  { name: 'Dodge', desc: 'Until your next turn, attacks against you have disadvantage and you have advantage on DEX saves.' },
  { name: 'Help', desc: 'Give an ally advantage on their next check or attack against a target you help against.' },
  { name: 'Hide', desc: 'Make a Stealth check to try to become unseen.' },
  { name: 'Ready', desc: 'Prepare an action to trigger later, in response to a condition you name.' },
  { name: 'Search', desc: 'Make a Perception or Investigation check to find something.' },
  { name: 'Use an Object', desc: 'Interact with a second object, or use an item that requires your action.' },
]

export function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="How to Play — Quick Reference"
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <section className={styles.section}>
        <h4>Taking Your Turn</h4>
        <ol className={styles.list}>
          <li>
            <strong>Roll Initiative</strong> at the start of combat (d20 + DEX modifier). Turns go from highest to
            lowest.
          </li>
          <li>
            On your turn you get <strong>one Move</strong> (up to your speed) and <strong>one Action</strong>, which
            can happen in any order — you can even split your move before and after your action.
          </li>
          <li>
            You may also get <strong>one Bonus Action</strong>, but only if a spell, feature, or item specifically
            grants one — most turns don't have one available.
          </li>
          <li>
            A <strong>Reaction</strong> can be used once per round, even when it isn't your turn — the most common
            is an opportunity attack when a creature you can see moves out of your reach.
          </li>
        </ol>
      </section>

      <section className={styles.section}>
        <h4>Common Actions</h4>
        <dl className={styles.actionList}>
          {ACTIONS.map((a) => (
            <div key={a.name} className={styles.actionRow}>
              <dt>{a.name}</dt>
              <dd>{a.desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.section}>
        <h4>Checks, Saves &amp; Attacks</h4>
        <p className={styles.p}>
          Almost everything comes down to rolling a d20 and adding a modifier, then comparing it to a target
          number:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Ability Check</strong> — d20 + ability modifier (+ proficiency if you're proficient in the
            skill) vs. a Difficulty Class (DC) the DM sets.
          </li>
          <li>
            <strong>Saving Throw</strong> — d20 + ability modifier (+ proficiency if proficient in that save) vs.
            the DC of whatever is affecting you.
          </li>
          <li>
            <strong>Attack Roll</strong> — d20 + attack bonus vs. the target's Armor Class (AC). Meet or beat it to
            hit, then roll damage.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h4>Cover</h4>
        <ul className={styles.list}>
          <li>
            <strong>Half cover</strong> (a low wall, a creature in the way) — +2 to AC and DEX saves against
            anything on the other side of it.
          </li>
          <li>
            <strong>Three-quarters cover</strong> (an arrow slit, a thick tree) — +5 to AC and DEX saves instead.
          </li>
          <li>
            <strong>Total cover</strong> (fully blocked from view) — can't be targeted directly at all.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h4>Ranged Attacks in Melee</h4>
        <p className={styles.p}>
          If you're within 5 feet of a hostile creature that can see you and isn't incapacitated, making a ranged
          attack (weapon or spell) has disadvantage — the enemy is crowding your aim.
        </p>
      </section>

      <section className={styles.section}>
        <h4>Conditions</h4>
        <p className={styles.p}>
          What each condition actually does to you. The character sheet's Conditions tracker uses this same list.
        </p>
        <dl className={styles.actionList}>
          {STANDARD_CONDITIONS.map((c) => (
            <div key={c.name} className={styles.actionRow}>
              <dt>{c.name}</dt>
              <dd>{c.summary}</dd>
            </div>
          ))}
        </dl>
      </section>
    </Modal>
  )
}

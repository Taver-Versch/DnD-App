import { useEffect, useState } from 'react'
import { Card } from '../common/Card'
import { Button } from '../common/Button'
import { NumberInput, TextInput } from '../common/Field'
import { NumberStepper } from '../common/NumberStepper'
import { listEquipment } from '../../data/dataProvider'
import { carryCapacityLb, isOverCarryCapacity, totalCarriedWeightLb } from '../../rules/5e/encumbrance'
import type { Currency, InventoryItem } from '../../store/types'
import type { SectionProps } from './sectionProps'
import styles from './ListCard.module.css'

const CURRENCY_KEYS: (keyof Currency)[] = ['pp', 'gp', 'ep', 'sp', 'cp']

export function InventoryCard({ character, update }: SectionProps) {
  const [newItemName, setNewItemName] = useState('')
  const carried = totalCarriedWeightLb(character.inventory)
  const capacity = carryCapacityLb(character.abilityScores.str)
  const overCapacity = isOverCarryCapacity(character.inventory, character.abilityScores.str)

  const patch = (id: string, patchObj: Partial<InventoryItem>) =>
    update((c) => ({ ...c, inventory: c.inventory.map((i) => (i.id === id ? { ...i, ...patchObj } : i)) }))
  const remove = (id: string) => update((c) => ({ ...c, inventory: c.inventory.filter((i) => i.id !== id) }))

  const handleAdd = () => {
    if (!newItemName.trim()) return
    const name = newItemName.trim()
    update((c) => ({
      ...c,
      inventory: [
        ...c.inventory,
        {
          id: crypto.randomUUID(),
          name,
          source: 'custom',
          quantity: 1,
          weight: 0,
          description: '',
          equipped: false,
        },
      ],
    }))
    setNewItemName('')
  }

  return (
    <Card title="Inventory & Currency">
      <p
        style={{
          margin: '0 0 0.6rem',
          fontSize: '0.85rem',
          color: overCapacity ? 'var(--color-danger)' : 'var(--color-ink-soft)',
          fontWeight: overCapacity ? 700 : 400,
        }}
      >
        Carrying {carried} / {capacity} lb{overCapacity ? ' — over capacity!' : ''}
      </p>
      <div className={styles.row} style={{ borderBottom: '2px solid var(--color-border-soft)' }}>
        {CURRENCY_KEYS.map((key) => (
          <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-ink-soft)' }}>
              {key}
            </span>
            <NumberInput
              style={{ width: '3.5rem' }}
              value={character.currency[key]}
              onChange={(e) =>
                update((c) => ({ ...c, currency: { ...c.currency, [key]: Number(e.target.value) || 0 } }))
              }
            />
          </label>
        ))}
      </div>

      {character.inventory.length === 0 && <p className={styles.empty}>No items yet.</p>}
      {character.inventory.map((item) => (
        <div key={item.id} className={styles.row}>
          <input
            type="checkbox"
            checked={item.equipped}
            title="Equipped"
            onChange={(e) => patch(item.id, { equipped: e.target.checked })}
          />
          <TextInput
            className={styles.name}
            value={item.name}
            onChange={(e) => patch(item.id, { name: e.target.value })}
          />
          <NumberStepper value={item.quantity} min={0} onChange={(n) => patch(item.id, { quantity: n })} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
            <NumberInput
              style={{ width: '3.5rem' }}
              title="Weight per item (lb)"
              value={item.weight}
              min={0}
              step="0.1"
              onChange={(e) => patch(item.id, { weight: Math.max(0, Number(e.target.value) || 0) })}
            />
            lb
          </label>
          <Button small variant="danger" onClick={() => remove(item.id)}>
            ✕
          </Button>
        </div>
      ))}

      <div className={styles.addRow} style={{ display: 'flex', gap: '0.4rem' }}>
        <ItemNameInput value={newItemName} onChange={setNewItemName} />
        <Button small onClick={handleAdd}>
          + Add Item
        </Button>
      </div>
    </Card>
  )
}

/** Free-text item name with SRD equipment names as datalist suggestions. */
function ItemNameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [options, setOptions] = useState<{ index: string; name: string }[]>([])
  useEffect(() => {
    listEquipment().then(setOptions)
  }, [])
  return (
    <>
      <TextInput
        list="equipment-suggestions"
        placeholder="Item name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1 }}
      />
      <datalist id="equipment-suggestions">
        {options.map((o) => (
          <option key={o.index} value={o.name} />
        ))}
      </datalist>
    </>
  )
}

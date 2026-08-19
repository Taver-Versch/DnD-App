import { characterSchema } from './schema'
import type { Character } from '../store/types'

export interface ImportResult {
  ok: boolean
  character?: Character
  error?: string
}

/** Parses and validates a character JSON file's text content before it ever touches the store. */
export function parseCharacterJson(text: string): ImportResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }

  const result = characterSchema.safeParse(raw)
  if (!result.success) {
    return {
      ok: false,
      error: `That file doesn't look like a character sheet (${result.error.issues[0]?.message ?? 'schema mismatch'}).`,
    }
  }

  return { ok: true, character: result.data as Character }
}

export function readCharacterFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(parseCharacterJson(String(reader.result ?? '')))
    reader.onerror = () => resolve({ ok: false, error: 'Could not read that file.' })
    reader.readAsText(file)
  })
}

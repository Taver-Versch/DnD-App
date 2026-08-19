// The only module UI components should talk to for rules reference data.
// Wraps srdClient with typed, purpose-built lookups. Swapping in a second
// ruleset/edition/source later means adding a sibling provider here, not
// touching component code.

import { fetchSrd, fetchSrd2024 } from './srdClient'
import type {
  ApiBackground,
  ApiClass,
  ApiClassLevel,
  ApiEquipment,
  ApiFeature,
  ApiListResponse,
  ApiRef,
  ApiSpecies,
  ApiSpell,
  ApiSpellSummary,
} from './apiTypes'

export async function listClasses(): Promise<ApiRef[]> {
  const res = await fetchSrd<ApiListResponse>('/classes')
  return res?.results ?? []
}

export async function getClass(index: string): Promise<ApiClass | undefined> {
  return fetchSrd<ApiClass>(`/classes/${index}`)
}

/** All 20 levels of a class in one call (the API returns the whole table at once). */
export async function getClassLevels(index: string): Promise<ApiClassLevel[]> {
  const res = await fetchSrd<ApiClassLevel[]>(`/classes/${index}/levels`)
  return res ?? []
}

export async function getFeature(index: string): Promise<ApiFeature | undefined> {
  return fetchSrd<ApiFeature>(`/features/${index}`)
}

/** All levels of a subclass's own feature table (Way of the Open Hand, Champion, etc.). */
export async function getSubclassLevels(subclassIndex: string): Promise<ApiClassLevel[]> {
  const res = await fetchSrd<ApiClassLevel[]>(`/subclasses/${subclassIndex}/levels`)
  return res ?? []
}

// Species (2024 PHB revision, not the older 2014 "races" endpoint) - see
// ApiSpecies for why. Function names stay list/get-Race since that's the
// vocabulary the rest of the app (and the character sheet's "Race" field)
// still uses.
export async function listRaces(): Promise<ApiRef[]> {
  const res = await fetchSrd2024<ApiListResponse>('/species')
  return res?.results ?? []
}

export async function getRace(index: string): Promise<ApiSpecies | undefined> {
  return fetchSrd2024<ApiSpecies>(`/species/${index}`)
}

export async function listBackgrounds(): Promise<ApiRef[]> {
  const res = await fetchSrd<ApiListResponse>('/backgrounds')
  return res?.results ?? []
}

export async function getBackground(index: string): Promise<ApiBackground | undefined> {
  return fetchSrd<ApiBackground>(`/backgrounds/${index}`)
}

export async function listSkills(): Promise<ApiRef[]> {
  const res = await fetchSrd<ApiListResponse>('/skills')
  return res?.results ?? []
}

export async function listEquipment(): Promise<ApiRef[]> {
  const res = await fetchSrd<ApiListResponse>('/equipment')
  return res?.results ?? []
}

export async function getEquipment(index: string): Promise<ApiEquipment | undefined> {
  return fetchSrd<ApiEquipment>(`/equipment/${index}`)
}

export async function listSpells(): Promise<ApiSpellSummary[]> {
  const res = await fetchSrd<ApiListResponse<ApiSpellSummary>>('/spells')
  return res?.results ?? []
}

/** Spells on a given class's spell list (the API tracks this per-class). */
export async function listClassSpells(classIndex: string): Promise<ApiSpellSummary[]> {
  const res = await fetchSrd<ApiListResponse<ApiSpellSummary>>(`/classes/${classIndex}/spells`)
  return res?.results ?? []
}

export async function getSpell(index: string): Promise<ApiSpell | undefined> {
  return fetchSrd<ApiSpell>(`/spells/${index}`)
}

export async function listAlignments(): Promise<ApiRef[]> {
  const res = await fetchSrd<ApiListResponse>('/alignments')
  return res?.results ?? []
}

export async function listLanguages(): Promise<ApiRef[]> {
  const res = await fetchSrd<ApiListResponse>('/languages')
  return res?.results ?? []
}

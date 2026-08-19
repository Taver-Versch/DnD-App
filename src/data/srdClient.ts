// Thin fetch+cache wrapper around the free D&D 5e SRD API (dnd5eapi.co).
// SRD content is static, so successful responses are cached in localStorage
// indefinitely (bumping CACHE_VERSION invalidates everything at once). If a
// fetch fails and nothing is cached, callers get a null/empty result and the
// UI falls back to manual entry instead of blocking.

const API_BASE_2014 = 'https://www.dnd5eapi.co/api/2014'
// 2024 PHB revision - only used where the app specifically wants the newer
// ruleset shape (currently: species, since it covers Goliath/Orc which the
// 2014 "races" endpoint never had, and matches the 2024 core species list).
const API_BASE_2024 = 'https://www.dnd5eapi.co/api/2024'
const CACHE_VERSION = 'v1'

function cacheKey(base: string, path: string): string {
  return `srd-cache:${CACHE_VERSION}:${base}:${path}`
}

function readCache<T>(base: string, path: string): T | undefined {
  try {
    const raw = localStorage.getItem(cacheKey(base, path))
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function writeCache<T>(base: string, path: string, data: T): void {
  try {
    localStorage.setItem(cacheKey(base, path), JSON.stringify(data))
  } catch {
    // localStorage full or unavailable - degrade to no caching, not an error.
  }
}

export class SrdFetchError extends Error {}

async function fetchFrom<T>(base: string, path: string): Promise<T | undefined> {
  const cached = readCache<T>(base, path)
  if (cached !== undefined) return cached

  try {
    const res = await fetch(`${base}${path}`)
    if (!res.ok) throw new SrdFetchError(`SRD API ${path} returned ${res.status}`)
    const data = (await res.json()) as T
    writeCache(base, path, data)
    return data
  } catch (err) {
    console.warn(`[srdClient] falling back to manual entry, fetch failed for ${path}:`, err)
    return undefined
  }
}

/**
 * Fetches a path from the 2014 SRD API (e.g. "/classes/wizard"), using a
 * cached response when available. Returns undefined (never throws) when both
 * the network call and cache lookup fail, so callers can fall back gracefully.
 */
export async function fetchSrd<T>(path: string): Promise<T | undefined> {
  return fetchFrom<T>(API_BASE_2014, path)
}

/** Same as {@link fetchSrd}, against the 2024 PHB revision endpoints. */
export async function fetchSrd2024<T>(path: string): Promise<T | undefined> {
  return fetchFrom<T>(API_BASE_2024, path)
}

export function clearSrdCache(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(`srd-cache:${CACHE_VERSION}:`)) keys.push(key)
  }
  keys.forEach((k) => localStorage.removeItem(k))
}

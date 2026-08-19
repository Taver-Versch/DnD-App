import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_THEME_ID } from '../theme/themes'

interface AppSettingsState {
  appName: string
  themeId: string
  setAppName: (name: string) => void
  setThemeId: (id: string) => void
}

export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      appName: 'D&D Helper',
      themeId: DEFAULT_THEME_ID,
      setAppName: (name) => set({ appName: name.trim() || 'D&D Helper' }),
      setThemeId: (id) => set({ themeId: id }),
    }),
    { name: 'dnd-app-settings' }
  )
)

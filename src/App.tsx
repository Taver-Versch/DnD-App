import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { CharacterList } from './components/CharacterList/CharacterList'
import { CharacterSheetPage } from './components/CharacterSheet/CharacterSheetPage'
import { AppHeader } from './components/AppHeader/AppHeader'
import { useAppSettingsStore } from './store/appSettingsStore'
import { applyTheme } from './theme/themes'

function App() {
  const themeId = useAppSettingsStore((s) => s.themeId)
  const appName = useAppSettingsStore((s) => s.appName)

  useEffect(() => {
    applyTheme(themeId)
  }, [themeId])

  useEffect(() => {
    document.title = appName
  }, [appName])

  return (
    <>
      <AppHeader />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CharacterList />} />
          <Route path="/character/:id" element={<CharacterSheetPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BaiduAnalytics } from './components/BaiduAnalytics'
import { BottomNav } from './components/BottomNav'
import { LuciusSupport } from './components/LuciusSupport'
import { UpdateBanner } from './components/UpdateBanner'
import { useTimetable } from './hooks/useTimetable'
import { clearTimetable } from './lib/storage'
import { GuidePage } from './pages/GuidePage'
import { HomePage } from './pages/HomePage'
import { ImportPage } from './pages/ImportPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const { data, importData, setData } = useTimetable()

  return (
    <HashRouter>
      <BaiduAnalytics />
      <div className="app-shell">
        <UpdateBanner />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage data={data} onUpdate={setData} />} />
            <Route path="/import" element={<ImportPage onImport={importData} />} />
            <Route path="/guide" element={<GuidePage onImport={importData} />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  data={data}
                  onImport={importData}
                  onClear={() => {
                    clearTimetable()
                    setData(null)
                  }}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
      <LuciusSupport />
    </HashRouter>
  )
}

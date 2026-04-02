import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { JourneyProvider } from './contexts/JourneyContext'
import { LanguageProvider } from './contexts/LanguageContext'
import HelpPage from './pages/HelpPage'
import JourneyPage from './pages/JourneyPage'
import MapHomePage from './pages/MapHomePage'
import RoutesPage from './pages/RoutesPage'

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LanguageProvider>
        <JourneyProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<MapHomePage />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/journey" element={<JourneyPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </JourneyProvider>
      </LanguageProvider>
    </div>
  )
}

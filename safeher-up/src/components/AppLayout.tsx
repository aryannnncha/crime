import { Outlet } from 'react-router-dom'
import { useJourney } from '../contexts/JourneyContext'
import { BottomNav } from './BottomNav'
import { JourneyStatusBar } from './JourneyStatusBar'
import { TopBar } from './TopBar'

export function AppLayout() {
  const { journey } = useJourney()
  const topPad = journey
    ? 'pt-[calc(6.75rem+env(safe-area-inset-top))]'
    : 'pt-[calc(4.25rem+env(safe-area-inset-top))]'

  return (
    <div className="flex min-h-dvh flex-col text-violet-950">
      {journey ? <JourneyStatusBar /> : <TopBar />}
      <main
        className={`flex min-h-0 flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] ${topPad}`}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

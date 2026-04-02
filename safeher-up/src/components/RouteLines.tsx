import { Polyline } from 'react-leaflet'
import type { PlannedRoute } from '../utils/routing'

export function RouteLines({
  routes,
  selectedId,
}: {
  routes: PlannedRoute[]
  selectedId: string | null
}) {
  return (
    <>
      {routes.map((r) => {
        const isSafest = r.kind === 'safest'
        const isFastest = r.kind === 'fastest'
        const active = selectedId ? r.id === selectedId : isSafest
        const color = isSafest
          ? '#22c55e'
          : isFastest
            ? '#94a3b8'
            : '#a78bfa'
        const weight = active ? 6 : 4
        const opacity = selectedId ? (active ? 0.95 : 0.35) : isSafest ? 0.9 : 0.55
        return (
          <Polyline
            key={r.id}
            positions={r.coordinates}
            pathOptions={{
              color,
              weight,
              opacity,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )
      })}
    </>
  )
}

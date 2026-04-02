import { Circle, Popup } from 'react-leaflet'
import { zonesForCity, type CrimeZone } from '../data/crimeZones'
import type { CityId } from '../data/cities'

function zoneStyle(z: CrimeZone): { color: string; fillColor: string; fillOpacity: number } {
  switch (z.level) {
    case 'Critical':
      return { color: '#e11d48', fillColor: '#fb7185', fillOpacity: 0.22 }
    case 'High':
      return { color: '#ea580c', fillColor: '#fb923c', fillOpacity: 0.2 }
    default:
      return { color: '#ca8a04', fillColor: '#facc15', fillOpacity: 0.14 }
  }
}

export function CrimeZoneLayer({ cityId }: { cityId: CityId }) {
  const zones = zonesForCity(cityId)
  return (
    <>
      {zones.map((z) => {
        const s = zoneStyle(z)
        return (
          <Circle
            key={z.id}
            center={z.center}
            radius={z.radiusM}
            pathOptions={{
              color: s.color,
              fillColor: s.fillColor,
              fillOpacity: s.fillOpacity,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-sm font-medium text-violet-950">{z.label}</div>
              <div className="text-xs text-neutral-600">
                {z.level} · awareness zone (illustrative)
              </div>
            </Popup>
          </Circle>
        )
      })}
    </>
  )
}

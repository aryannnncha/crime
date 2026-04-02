import { useMemo } from 'react'
import { CircleMarker, Popup } from 'react-leaflet'
import { useLanguage } from '../contexts/LanguageContext'
import { INCIDENT_LABELS } from '../i18n/strings'
import { opacityForAge, timeAgoShort, type IncidentReport } from '../utils/incidents'

export function IncidentMarkers({ incidents }: { incidents: IncidentReport[] }) {
  const { lang } = useLanguage()

  const items = useMemo(
    () =>
      incidents.map((i) => ({
        i,
        label: INCIDENT_LABELS[i.type]?.[lang] ?? i.type,
        ago: timeAgoShort(i.createdAt, lang),
        op: 0.35 + opacityForAge(i.createdAt) * 0.65,
      })),
    [incidents, lang],
  )

  return (
    <>
      {items.map(({ i, label, ago, op }) => (
        <CircleMarker
          key={i.id}
          center={[i.lat, i.lng]}
          radius={9}
          pathOptions={{
            color: '#fff',
            weight: 2,
            fillColor: '#f97316',
            fillOpacity: op,
            opacity: op,
          }}
        >
          <Popup>
            <div className="text-sm font-semibold text-violet-950">
              {label} · {ago}
            </div>
            {i.description ? (
              <p className="mt-1 text-xs text-neutral-600">{i.description}</p>
            ) : null}
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

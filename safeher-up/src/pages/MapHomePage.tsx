import type { Map as LeafletMap } from 'leaflet'
import { useCallback, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { CrimeZoneLayer } from '../components/CrimeZoneLayer'
import { IncidentMarkers } from '../components/IncidentMarkers'
import { MapBridge } from '../components/MapBridge'
import { MapSync } from '../components/MapSync'
import { ReportIncidentModal } from '../components/ReportIncidentModal'
import { useLanguage } from '../contexts/LanguageContext'
import { CITIES, getCity, type CityId } from '../data/cities'
import { useIncidents } from '../hooks/useIncidents'

export default function MapHomePage() {
  const { t, lang } = useLanguage()
  const [cityId, setCityId] = useState<CityId>('lucknow')
  const city = getCity(cityId)
  const [map, setMap] = useState<LeafletMap | null>(null)
  const onMap = useCallback((m: LeafletMap) => setMap(m), [])
  const { incidents, add } = useIncidents()
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-2 pt-1">
      <div className="flex shrink-0 items-center gap-2">
        <label className="text-xs font-semibold text-violet-800" htmlFor="city">
          {t('city')}
        </label>
        <select
          id="city"
          value={cityId}
          onChange={(e) => setCityId(e.target.value as CityId)}
          className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-violet-950 outline-none focus:ring-2 focus:ring-violet-400"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'hi' ? c.nameHi : c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative min-h-[min(100%,420px)] flex-1 overflow-hidden rounded-2xl border border-violet-100 shadow-inner shadow-violet-100">
        <MapContainer
          center={city.center}
          zoom={city.zoom}
          className="h-full min-h-[320px] w-full"
          scrollWheelZoom
        >
          <MapBridge onReady={onMap} />
          <MapSync city={city} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CrimeZoneLayer cityId={cityId} />
          <IncidentMarkers incidents={incidents} />
        </MapContainer>
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
          <div
            className="-translate-y-3"
            aria-hidden
          >
            <div className="h-5 w-5 rounded-full border-[3px] border-white bg-violet-600 shadow-lg ring-2 ring-violet-300/80" />
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-2 left-1/2 z-[1001] max-w-[92%] -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-center text-[10px] font-medium text-violet-800 shadow-sm">
          {t('pinHint')}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-[4200] flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30"
      >
        <span className="text-lg leading-none">＋</span>
        {t('reportIncident')}
      </button>

      {reportOpen ? (
        <ReportIncidentModal
          lat={map?.getCenter().lat ?? city.center[0]}
          lng={map?.getCenter().lng ?? city.center[1]}
          onClose={() => setReportOpen(false)}
          onSubmit={(payload) => {
            const c = map?.getCenter()
            if (!c) return
            add({
              lat: c.lat,
              lng: c.lng,
              type: payload.type,
              description: payload.description,
              anonymous: payload.anonymous,
              createdAt: payload.createdAt,
            })
          }}
        />
      ) : null}
    </div>
  )
}

import L from 'leaflet'
import type { Map as LeafletMap } from 'leaflet'
import { useCallback, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'
import { CrimeZoneLayer } from '../components/CrimeZoneLayer'
import { IncidentMarkers } from '../components/IncidentMarkers'
import { MapBridge } from '../components/MapBridge'
import { MapSync } from '../components/MapSync'
import { ReportIncidentModal } from '../components/ReportIncidentModal'
import { RouteLines } from '../components/RouteLines'
import { useLanguage } from '../contexts/LanguageContext'
import { CITIES, getCity, type CityId } from '../data/cities'
import { useIncidents } from '../hooks/useIncidents'
import { geocodeQuery } from '../utils/geocode'
import { planRoutes, type LatLng, type PlannedRoute } from '../utils/routing'

function ClickPick({
  mode,
  onPick,
}: {
  mode: 'start' | 'end' | null
  onPick: (kind: 'start' | 'end', p: LatLng) => void
}) {
  useMapEvents({
    click(e) {
      if (!mode) return
      onPick(mode, { lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function fmtDuration(sec: number): string {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${h}h ${mm}m`
}

export default function RoutesPage() {
  const { t, lang } = useLanguage()
  const [cityId, setCityId] = useState<CityId>('lucknow')
  const city = getCity(cityId)
  const [map, setMap] = useState<LeafletMap | null>(null)
  const onMap = useCallback((m: LeafletMap) => setMap(m), [])
  const { incidents, add } = useIncidents()
  const [reportOpen, setReportOpen] = useState(false)

  const [startQ, setStartQ] = useState('')
  const [endQ, setEndQ] = useState('')
  const [start, setStart] = useState<LatLng | null>(null)
  const [end, setEnd] = useState<LatLng | null>(null)
  const [pick, setPick] = useState<'start' | 'end' | null>(null)
  const [routes, setRoutes] = useState<PlannedRoute[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onPick = useCallback(
    (kind: 'start' | 'end', p: LatLng) => {
      if (kind === 'start') {
        setStart(p)
        setStartQ(`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`)
      } else {
        setEnd(p)
        setEndQ(`${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`)
      }
      setPick(null)
    },
    [],
  )

  const handlePlan = async () => {
    setError(null)
    setLoading(true)
    setRoutes([])
    try {
      let s = start
      let e = end
      if (!s) {
        const g = await geocodeQuery(startQ || city.name, cityId)
        if (!g) throw new Error('Could not find start location')
        s = { lat: g.lat, lng: g.lon }
        setStart(s)
      }
      if (!e) {
        const g = await geocodeQuery(endQ || city.name, cityId)
        if (!g) throw new Error('Could not find destination')
        e = { lat: g.lat, lng: g.lon }
        setEnd(e)
      }
      const { routes: rs, error: err } = await planRoutes(s, e, cityId)
      if (err || !rs.length) throw new Error(err ?? 'No routes')
      setRoutes(rs)
      const safest = rs.find((r) => r.kind === 'safest')
      setSelectedId(safest?.id ?? rs[0]?.id ?? null)
      if (map && rs[0]) {
        const coords = rs[0].coordinates
        const b = L.latLngBounds(coords.map((c) => L.latLng(c[0], c[1])))
        map.fitBounds(b, { padding: [40, 40] })
      }
    } catch (er) {
      setError(er instanceof Error ? er.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-2 pt-1">
      <div>
        <h2 className="text-lg font-bold text-violet-950">{t('routesTitle')}</h2>
        <p className="text-xs text-violet-700/85">{t('routesSubtitle')}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label className="text-xs font-semibold text-violet-800" htmlFor="rcity">
          {t('city')}
        </label>
        <select
          id="rcity"
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value as CityId)
            setRoutes([])
            setStart(null)
            setEnd(null)
          }}
          className="flex-1 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-400"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === 'hi' ? c.nameHi : c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 rounded-2xl border border-violet-100 bg-white/80 p-3 shadow-sm">
        <div>
          <label className="text-xs font-medium text-violet-900">{t('start')}</label>
          <input
            value={startQ}
            onChange={(e) => setStartQ(e.target.value)}
            className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
            placeholder={city.name}
          />
          <button
            type="button"
            onClick={() => setPick(pick === 'start' ? null : 'start')}
            className={`mt-1 text-xs font-semibold ${
              pick === 'start' ? 'text-fuchsia-600' : 'text-violet-600'
            }`}
          >
            {pick === 'start' ? '✓ ' : ''}
            {t('tapMapSet')}
          </button>
        </div>
        <div>
          <label className="text-xs font-medium text-violet-900">{t('destination')}</label>
          <input
            value={endQ}
            onChange={(e) => setEndQ(e.target.value)}
            className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
            placeholder={city.name}
          />
          <button
            type="button"
            onClick={() => setPick(pick === 'end' ? null : 'end')}
            className={`mt-1 text-xs font-semibold ${
              pick === 'end' ? 'text-fuchsia-600' : 'text-violet-600'
            }`}
          >
            {pick === 'end' ? '✓ ' : ''}
            {t('tapMapSet')}
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setStart(null)
              setEnd(null)
              setRoutes([])
              setStartQ('')
              setEndQ('')
            }}
            className="flex-1 rounded-xl border border-violet-200 py-2.5 text-sm font-semibold text-violet-800"
          >
            {t('clearPoints')}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handlePlan()}
            className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-60"
          >
            {loading ? t('planning') : t('planRoutes')}
          </button>
        </div>
        {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      </div>

      <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-2xl border border-violet-100 shadow-inner">
        <MapContainer
          center={city.center}
          zoom={city.zoom}
          className="h-full min-h-[280px] w-full"
          scrollWheelZoom
        >
          <MapBridge onReady={onMap} />
          <MapSync city={city} />
          <ClickPick mode={pick} onPick={onPick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CrimeZoneLayer cityId={cityId} />
          <IncidentMarkers incidents={incidents} />
          {start ? (
            <CircleMarker
              center={[start.lat, start.lng]}
              radius={9}
              pathOptions={{ color: '#fff', weight: 2, fillColor: '#22c55e', fillOpacity: 0.95 }}
            />
          ) : null}
          {end ? (
            <CircleMarker
              center={[end.lat, end.lng]}
              radius={9}
              pathOptions={{ color: '#fff', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.95 }}
            />
          ) : null}
          <RouteLines routes={routes} selectedId={selectedId} />
        </MapContainer>
        {pick ? (
          <div className="pointer-events-none absolute left-2 right-2 top-2 z-[2000] rounded-xl bg-fuchsia-600/95 px-3 py-2 text-center text-xs font-bold text-white shadow-lg">
            {pick === 'start' ? t('start') : t('destination')}: {t('tapMapSet')}
          </div>
        ) : null}
      </div>

      {routes.length > 0 ? (
        <div className="space-y-2 pb-2">
          {routes.map((r) => {
            const isSel = selectedId === r.id
            const label =
              r.kind === 'safest'
                ? t('safestRoute')
                : r.kind === 'fastest'
                  ? t('fastestRoute')
                  : t('alternateRoute')
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  isSel
                    ? 'border-violet-400 bg-violet-50 shadow-sm'
                    : 'border-violet-100 bg-white/90'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-bold ${
                      r.kind === 'safest' ? 'text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-xs font-semibold text-violet-800">
                    {t('safetyScore')}: {r.safetyScore}/100
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-600">
                  <span>
                    {t('eta')}: {fmtDuration(r.durationSec)}
                  </span>
                  <span>
                    {t('riskZonesCrossed')}:{' '}
                    {r.riskZonesCrossed.length ? r.riskZonesCrossed.map((z) => z.label).join(', ') : t('none')}
                  </span>
                </div>
                {r.kind === 'fastest' && r.crossesHighOrCritical ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900">
                    {t('crossesDanger')}
                  </p>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-[4200] flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg"
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

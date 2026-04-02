import type { CityId } from '../data/cities'
import { CRIME_ZONES, riskWeight, type CrimeZone } from '../data/crimeZones'
import { bearingDeg, distanceM, midpoint, offsetMeters } from './geo'

export interface LatLng {
  lat: number
  lng: number
}

export interface PlannedRoute {
  id: string
  kind: 'safest' | 'fastest' | 'alternate'
  coordinates: [number, number][]
  durationSec: number
  distanceM: number
  safetyScore: number
  riskZonesCrossed: { label: string; level: string }[]
  crossesHighOrCritical: boolean
}

type OSRMCoord = [number, number]

interface OSRMRoute {
  duration: number
  distance: number
  geometry: { coordinates: OSRMCoord[] }
}

async function fetchOsrm(
  coords: LatLng[],
): Promise<{ route: OSRMRoute | null; error?: string }> {
  if (coords.length < 2) return { route: null, error: 'Need two points' }
  const path = coords.map((c) => `${c.lng},${c.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) return { route: null, error: 'Routing failed' }
  const data = await res.json()
  if (data.code !== 'Ok' || !data.routes?.[0]) {
    return { route: null, error: data.message ?? 'No route' }
  }
  const r = data.routes[0]
  return {
    route: {
      duration: r.duration,
      distance: r.distance,
      geometry: r.geometry,
    },
  }
}

function samplePoints(coords: [number, number][], maxSamples: number): [number, number][] {
  if (coords.length <= maxSamples) return coords
  const step = Math.max(1, Math.floor(coords.length / maxSamples))
  const out: [number, number][] = []
  for (let i = 0; i < coords.length; i += step) out.push(coords[i])
  if (out[out.length - 1] !== coords[coords.length - 1]) {
    out.push(coords[coords.length - 1])
  }
  return out
}

function zonesForCity(cityId: CityId): CrimeZone[] {
  return CRIME_ZONES.filter((z) => z.cityId === cityId)
}

function scorePath(
  latlngPath: [number, number][],
  cityId: CityId,
): {
  safetyScore: number
  riskZonesCrossed: { label: string; level: string }[]
  crossesHighOrCritical: boolean
} {
  const zones = zonesForCity(cityId)
  const samples = samplePoints(latlngPath, 80)
  let penalty = 0
  const seen = new Set<string>()
  const crossed: { label: string; level: string }[] = []
  let crossesHighOrCritical = false

  for (const [lat, lng] of samples) {
    for (const z of zones) {
      const d = distanceM([lat, lng], z.center)
      if (d <= z.radiusM) {
        const w = riskWeight(z.level)
        penalty += w * 0.35
        const key = z.id
        if (!seen.has(key)) {
          seen.add(key)
          crossed.push({ label: z.label, level: z.level })
          if (z.level === 'Critical' || z.level === 'High') crossesHighOrCritical = true
        }
      }
    }
  }

  const safetyScore = Math.max(0, Math.min(100, Math.round(100 - penalty)))
  return { safetyScore, riskZonesCrossed: crossed, crossesHighOrCritical }
}

function toLeafletCoords(osrmCoords: OSRMCoord[]): [number, number][] {
  return osrmCoords.map(([lng, lat]) => [lat, lng])
}

function fingerprint(coords: [number, number][]): string {
  const n = coords.length
  if (n === 0) return ''
  const a = coords[0]
  const b = coords[Math.floor(n / 2)]
  const c = coords[n - 1]
  return [a, b, c].map((p) => p.map((x) => x.toFixed(4)).join(',')).join('|')
}

export async function planRoutes(
  start: LatLng,
  end: LatLng,
  cityId: CityId,
): Promise<{ routes: PlannedRoute[]; error?: string }> {
  const mid = midpoint([start.lat, start.lng], [end.lat, end.lng])
  const br = bearingDeg([start.lat, start.lng], [end.lat, end.lng])
  const [v1lat, v1lng] = offsetMeters(mid[0], mid[1], br + 90, 650)
  const [v2lat, v2lng] = offsetMeters(mid[0], mid[1], br - 90, 650)
  const via1: LatLng = { lat: v1lat, lng: v1lng }
  const via2: LatLng = { lat: v2lat, lng: v2lng }

  const [direct, alt1, alt2] = await Promise.all([
    fetchOsrm([start, end]),
    fetchOsrm([start, via1, end]),
    fetchOsrm([start, via2, end]),
  ])

  const raw: { tag: string; route: OSRMRoute }[] = []
  if (direct.route) raw.push({ tag: 'direct', route: direct.route })
  if (alt1.route) raw.push({ tag: 'alt1', route: alt1.route })
  if (alt2.route) raw.push({ tag: 'alt2', route: alt2.route })

  if (!raw.length) {
    return { routes: [], error: direct.error ?? alt1.error ?? 'No route found' }
  }

  const scored = raw.map((item) => {
    const ll = toLeafletCoords(item.route.geometry.coordinates)
    const sc = scorePath(ll, cityId)
    return {
      tag: item.tag,
      coordinates: ll,
      durationSec: item.route.duration,
      distanceM: item.route.distance,
      fp: fingerprint(ll),
      ...sc,
    }
  })

  const uniqueByFp = new Map<string, (typeof scored)[0]>()
  for (const s of scored) {
    if (!uniqueByFp.has(s.fp)) uniqueByFp.set(s.fp, s)
  }
  const uniq = [...uniqueByFp.values()]

  const bySafety = [...uniq].sort((a, b) => b.safetyScore - a.safetyScore)
  const bySpeed = [...uniq].sort((a, b) => a.durationSec - b.durationSec)
  const safest = bySafety[0]
  const fastest = bySpeed[0]

  const out: PlannedRoute[] = []

  out.push({
    id: 'safest',
    kind: 'safest',
    coordinates: safest.coordinates,
    durationSec: safest.durationSec,
    distanceM: safest.distanceM,
    safetyScore: safest.safetyScore,
    riskZonesCrossed: safest.riskZonesCrossed,
    crossesHighOrCritical: safest.crossesHighOrCritical,
  })

  const fastestFp = fingerprint(fastest.coordinates)
  const safestFp = fingerprint(safest.coordinates)
  if (fastestFp !== safestFp) {
    out.push({
      id: 'fastest',
      kind: 'fastest',
      coordinates: fastest.coordinates,
      durationSec: fastest.durationSec,
      distanceM: fastest.distanceM,
      safetyScore: fastest.safetyScore,
      riskZonesCrossed: fastest.riskZonesCrossed,
      crossesHighOrCritical: fastest.crossesHighOrCritical,
    })
  }

  const third = uniq.find(
    (u) =>
      fingerprint(u.coordinates) !== safestFp &&
      fingerprint(u.coordinates) !== fastestFp,
  )
  if (third && out.length < 3) {
    out.push({
      id: 'alternate',
      kind: 'alternate',
      coordinates: third.coordinates,
      durationSec: third.durationSec,
      distanceM: third.distanceM,
      safetyScore: third.safetyScore,
      riskZonesCrossed: third.riskZonesCrossed,
      crossesHighOrCritical: third.crossesHighOrCritical,
    })
  }

  if (out.length === 1 && uniq.length > 1) {
    const second = uniq.find((u) => fingerprint(u.coordinates) !== safestFp)
    if (second) {
      out.push({
        id: 'alternate',
        kind: 'alternate',
        coordinates: second.coordinates,
        durationSec: second.durationSec,
        distanceM: second.distanceM,
        safetyScore: second.safetyScore,
        riskZonesCrossed: second.riskZonesCrossed,
        crossesHighOrCritical: second.crossesHighOrCritical,
      })
    }
  }

  return { routes: out.slice(0, 3) }
}

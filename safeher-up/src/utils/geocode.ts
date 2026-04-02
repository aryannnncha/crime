import type { CityId } from '../data/cities'
import { getCity } from '../data/cities'

export interface GeocodeHit {
  lat: number
  lon: number
  displayName: string
}

const UA = 'SafeHerUP/1.0 (student safety project; contact via app)'

export async function geocodeQuery(
  query: string,
  cityId: CityId,
): Promise<GeocodeHit | null> {
  const city = getCity(cityId)
  const q = query.trim() || city.nominatimBias
  const params = new URLSearchParams({
    format: 'json',
    q: `${q}, ${city.name}, Uttar Pradesh, India`,
    limit: '1',
    countrycodes: 'in',
    addressdetails: '0',
  })
  const url = `https://nominatim.openstreetmap.org/search?${params}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': UA } })
  if (!res.ok) return null
  const data = (await res.json()) as { lat: string; lon: string; display_name: string }[]
  if (!data?.length) return null
  const hit = data[0]
  return {
    lat: parseFloat(hit.lat),
    lon: parseFloat(hit.lon),
    displayName: hit.display_name,
  }
}

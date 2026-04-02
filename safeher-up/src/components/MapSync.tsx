import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { CityInfo } from '../data/cities'

export function MapSync({ city }: { city: CityInfo }) {
  const map = useMap()
  useEffect(() => {
    map.setView(city.center, city.zoom, { animate: true })
  }, [city, map])
  return null
}

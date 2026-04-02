export type CityId = 'lucknow' | 'kanpur' | 'varanasi' | 'prayagraj'

export interface CityInfo {
  id: CityId
  name: string
  nameHi: string
  center: [number, number]
  zoom: number
  nominatimBias: string
}

export const CITIES: CityInfo[] = [
  {
    id: 'lucknow',
    name: 'Lucknow',
    nameHi: 'लखनऊ',
    center: [26.8467, 80.9462],
    zoom: 12,
    nominatimBias: 'Lucknow Uttar Pradesh India',
  },
  {
    id: 'kanpur',
    name: 'Kanpur',
    nameHi: 'कानपुर',
    center: [26.4499, 80.3319],
    zoom: 12,
    nominatimBias: 'Kanpur Uttar Pradesh India',
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    nameHi: 'वाराणसी',
    center: [25.3176, 82.9739],
    zoom: 12,
    nominatimBias: 'Varanasi Uttar Pradesh India',
  },
  {
    id: 'prayagraj',
    name: 'Prayagraj',
    nameHi: 'प्रयागराज',
    center: [25.4358, 81.8463],
    zoom: 12,
    nominatimBias: 'Prayagraj Uttar Pradesh India',
  },
]

export function getCity(id: CityId): CityInfo {
  return CITIES.find((c) => c.id === id) ?? CITIES[0]
}

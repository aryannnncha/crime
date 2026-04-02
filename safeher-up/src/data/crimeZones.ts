import type { CityId } from './cities'

/** Illustrative zones for routing — replace with API later */
export type RiskLevel = 'Critical' | 'High' | 'Medium'

export interface CrimeZone {
  id: string
  cityId: CityId
  label: string
  center: [number, number]
  /** Radius in metres */
  radiusM: number
  level: RiskLevel
}

export const CRIME_ZONES: CrimeZone[] = [
  // Lucknow
  {
    id: 'lk-1',
    cityId: 'lucknow',
    label: 'Old city market cluster',
    center: [26.8602, 80.9158],
    radiusM: 650,
    level: 'Critical',
  },
  {
    id: 'lk-2',
    cityId: 'lucknow',
    label: 'Transit hub vicinity',
    center: [26.831, 80.924],
    radiusM: 480,
    level: 'High',
  },
  {
    id: 'lk-3',
    cityId: 'lucknow',
    label: 'Industrial belt',
    center: [26.785, 80.98],
    radiusM: 520,
    level: 'High',
  },
  {
    id: 'lk-4',
    cityId: 'lucknow',
    label: 'Outer ring stretch',
    center: [26.9, 81.02],
    radiusM: 400,
    level: 'Medium',
  },
  // Kanpur
  {
    id: 'kn-1',
    cityId: 'kanpur',
    label: 'Dense bazaar',
    center: [26.449, 80.35],
    radiusM: 550,
    level: 'Critical',
  },
  {
    id: 'kn-2',
    cityId: 'kanpur',
    label: 'Canal-side stretch',
    center: [26.47, 80.3],
    radiusM: 450,
    level: 'High',
  },
  {
    id: 'kn-3',
    cityId: 'kanpur',
    label: 'Suburban junction',
    center: [26.42, 80.38],
    radiusM: 380,
    level: 'Medium',
  },
  // Varanasi
  {
    id: 'vr-1',
    cityId: 'varanasi',
    label: 'Ghats crowd zone',
    center: [25.306, 83.01],
    radiusM: 600,
    level: 'Critical',
  },
  {
    id: 'vr-2',
    cityId: 'varanasi',
    label: 'Rail approach',
    center: [25.33, 82.985],
    radiusM: 420,
    level: 'High',
  },
  {
    id: 'vr-3',
    cityId: 'varanasi',
    label: 'Ring road segment',
    center: [25.36, 82.95],
    radiusM: 500,
    level: 'Medium',
  },
  // Prayagraj
  {
    id: 'pr-1',
    cityId: 'prayagraj',
    label: 'Melā / fairground area',
    center: [25.42, 81.88],
    radiusM: 580,
    level: 'Critical',
  },
  {
    id: 'pr-2',
    cityId: 'prayagraj',
    label: 'Riverfront stretch',
    center: [25.45, 81.82],
    radiusM: 440,
    level: 'High',
  },
  {
    id: 'pr-3',
    cityId: 'prayagraj',
    label: 'Eastern bypass',
    center: [25.48, 81.9],
    radiusM: 390,
    level: 'Medium',
  },
]

export function zonesForCity(cityId: CityId): CrimeZone[] {
  return CRIME_ZONES.filter((z) => z.cityId === cityId)
}

export function riskWeight(level: RiskLevel): number {
  switch (level) {
    case 'Critical':
      return 3
    case 'High':
      return 2
    case 'Medium':
      return 1
    default:
      return 0
  }
}

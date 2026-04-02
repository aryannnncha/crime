export type IncidentType =
  | 'harassment'
  | 'unsafe'
  | 'lighting'
  | 'suspicious'
  | 'other'

export interface IncidentReport {
  id: string
  lat: number
  lng: number
  type: IncidentType
  createdAt: number
  description?: string
  anonymous: boolean
}

const STORAGE_KEY = 'safeher_up_incidents_v1'
export const INCIDENT_TTL_MS = 48 * 60 * 60 * 1000

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function loadIncidents(): IncidentReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as IncidentReport[]
    const now = Date.now()
    return parsed.filter((r) => now - r.createdAt < INCIDENT_TTL_MS)
  } catch {
    return []
  }
}

export function saveIncidents(list: IncidentReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function addIncident(report: Omit<IncidentReport, 'id'>): IncidentReport {
  const full: IncidentReport = {
    ...report,
    id: generateId(),
  }
  const list = loadIncidents()
  list.push(full)
  saveIncidents(list)
  return full
}

export function opacityForAge(createdAt: number): number {
  const age = Date.now() - createdAt
  const t = Math.min(1, age / INCIDENT_TTL_MS)
  return 1 - t * 0.75
}

export function timeAgoShort(createdAt: number, lang: 'en' | 'hi'): string {
  const s = Math.floor((Date.now() - createdAt) / 1000)
  if (s < 60) return lang === 'hi' ? 'अभी' : 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return lang === 'hi' ? `${m} मि पहले` : `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 48) return lang === 'hi' ? `${h} घंटे पहले` : `${h} hrs ago`
  const d = Math.floor(h / 24)
  return lang === 'hi' ? `${d} दिन पहले` : `${d} days ago`
}

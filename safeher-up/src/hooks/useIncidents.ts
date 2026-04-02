import { useCallback, useEffect, useState } from 'react'
import {
  addIncident,
  loadIncidents,
  type IncidentReport,
} from '../utils/incidents'

export function useIncidents() {
  const [incidents, setIncidents] = useState<IncidentReport[]>(() =>
    loadIncidents(),
  )

  const refresh = useCallback(() => setIncidents(loadIncidents()), [])

  useEffect(() => {
    const iv = window.setInterval(refresh, 60_000)
    return () => window.clearInterval(iv)
  }, [refresh])

  const add = useCallback(
    (r: Omit<IncidentReport, 'id'>) => {
      addIncident(r)
      refresh()
    },
    [refresh],
  )

  return { incidents, add, refresh }
}

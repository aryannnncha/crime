import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLanguage } from './LanguageContext'
import { buildMissedCheckInMessage, whatsappUrl } from '../utils/whatsapp'

export interface EmergencyContact {
  name: string
  phone: string
}

export interface ActiveJourney {
  destination: string
  expectedArrival: number
  contacts: EmergencyContact[]
  startedAt: number
}

interface JourneyContextValue {
  journey: ActiveJourney | null
  lastLocation: { lat: number; lng: number; at: number } | null
  warningMsRemaining: number | null
  isWarningPhase: boolean
  isBeforeExpectedArrival: boolean
  missedAlertSent: boolean
  startJourney: (j: Omit<ActiveJourney, 'startedAt'>) => void
  endJourney: () => void
  checkInSafe: () => void
  triggerSos: () => void
}

const JourneyContext = createContext<JourneyContextValue | null>(null)

const GRACE_MS = 5 * 60 * 1000
const GPS_MS = 30 * 1000

export function JourneyProvider({ children }: { children: ReactNode }) {
  const { lang } = useLanguage()
  const [journey, setJourney] = useState<ActiveJourney | null>(null)
  const [lastLocation, setLastLocation] = useState<{
    lat: number
    lng: number
    at: number
  } | null>(null)
  const [nowClock, setNowClock] = useState(() => Date.now())
  const [missedAlertSent, setMissedAlertSent] = useState(false)
  const missedFiredRef = useRef(false)

  useEffect(() => {
    if (!journey) return
    const id = window.setInterval(() => setNowClock(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [journey])

  const openMissedAlerts = useCallback(
    (j: ActiveJourney) => {
      if (missedFiredRef.current) return
      missedFiredRef.current = true
      setMissedAlertSent(true)
      const lat = lastLocation?.lat
      const lng = lastLocation?.lng
      for (const c of j.contacts) {
        if (!c.phone.trim()) continue
        const msg = buildMissedCheckInMessage(
          c.name || 'contact',
          j.destination,
          lat,
          lng,
          lang,
        )
        window.open(whatsappUrl(c.phone, msg), '_blank', 'noopener,noreferrer')
      }
    },
    [lang, lastLocation],
  )

  const openSosAlerts = useCallback(
    (j: ActiveJourney) => {
      const lat = lastLocation?.lat
      const lng = lastLocation?.lng
      const hasLoc =
        lat != null && lng != null && !(lat === 0 && lng === 0)
      const locPart = hasLoc
        ? `https://www.google.com/maps?q=${lat},${lng}`
        : lang === 'hi'
          ? 'GPS उपलब्ध नहीं'
          : 'GPS unavailable'
      for (const c of j.contacts) {
        if (!c.phone.trim()) continue
        const msg =
          lang === 'hi'
            ? `एसओएस (सेफ़हर यूपी): मुझे तुरंत मदद चाहिए। गंतव्य: ${j.destination}. स्थान: ${locPart}`
            : `SOS (SafeHer UP): I need help now. Destination: ${j.destination}. Location: ${locPart}`
        window.open(whatsappUrl(c.phone, msg), '_blank', 'noopener,noreferrer')
      }
    },
    [lang, lastLocation],
  )

  useEffect(() => {
    if (!journey) return

    const poll = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLastLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            at: Date.now(),
          })
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
      )
    }
    poll()
    const iv = window.setInterval(poll, GPS_MS)
    return () => window.clearInterval(iv)
  }, [journey])

  useEffect(() => {
    if (!journey || missedFiredRef.current) return
    const alertAt = journey.expectedArrival + GRACE_MS
    if (nowClock >= alertAt) {
      openMissedAlerts(journey)
    }
  }, [journey, nowClock, openMissedAlerts])

  const startJourney = useCallback((j: Omit<ActiveJourney, 'startedAt'>) => {
    missedFiredRef.current = false
    setMissedAlertSent(false)
    setLastLocation(null)
    setNowClock(Date.now())
    setJourney({ ...j, startedAt: Date.now() })
  }, [])

  const endJourney = useCallback(() => {
    setJourney(null)
    missedFiredRef.current = false
    setMissedAlertSent(false)
  }, [])

  const checkInSafe = useCallback(() => {
    setJourney(null)
    missedFiredRef.current = false
    setMissedAlertSent(false)
  }, [])

  const triggerSos = useCallback(() => {
    if (!journey) return
    openSosAlerts(journey)
  }, [journey, openSosAlerts])

  const { warningMsRemaining, isWarningPhase, isBeforeExpectedArrival } = useMemo(() => {
    if (!journey) {
      return {
        warningMsRemaining: null as number | null,
        isWarningPhase: false,
        isBeforeExpectedArrival: false,
      }
    }
    if (nowClock < journey.expectedArrival) {
      return {
        warningMsRemaining: null,
        isWarningPhase: false,
        isBeforeExpectedArrival: true,
      }
    }
    const alertAt = journey.expectedArrival + GRACE_MS
    const rem = Math.max(0, alertAt - nowClock)
    return {
      warningMsRemaining: rem,
      isWarningPhase: true,
      isBeforeExpectedArrival: false,
    }
  }, [journey, nowClock])

  const value = useMemo<JourneyContextValue>(
    () => ({
      journey,
      lastLocation,
      warningMsRemaining,
      isWarningPhase,
      isBeforeExpectedArrival,
      missedAlertSent,
      startJourney,
      endJourney,
      checkInSafe,
      triggerSos,
    }),
    [
      journey,
      lastLocation,
      warningMsRemaining,
      isWarningPhase,
      isBeforeExpectedArrival,
      missedAlertSent,
      startJourney,
      endJourney,
      checkInSafe,
      triggerSos,
    ],
  )

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

/** @throws if used outside JourneyProvider */
export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext)
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider')
  return ctx
}

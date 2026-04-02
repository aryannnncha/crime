import { useLanguage } from '../contexts/LanguageContext'
import { useJourney } from '../contexts/JourneyContext'

function fmt(ms: number): string {
  const s = Math.ceil(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function JourneyStatusBar() {
  const { t } = useLanguage()
  const {
    journey,
    warningMsRemaining,
    isWarningPhase,
    isBeforeExpectedArrival,
    checkInSafe,
    triggerSos,
  } = useJourney()

  if (!journey) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-[4500] border-b border-violet-200/90 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 px-3 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-white shadow-md">
      <div className="mx-auto flex max-w-lg flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/90">
              {t('journeyActive')}
            </p>
            <p className="truncate text-sm font-medium">{journey.destination}</p>
          </div>
          {isBeforeExpectedArrival ? (
            <div className="text-right text-xs font-medium text-white/95">
              <div>{t('expectedArrival')}</div>
              <div className="font-mono text-sm">
                {new Date(journey.expectedArrival).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ) : isWarningPhase && warningMsRemaining != null ? (
            <div className="rounded-lg bg-white/20 px-2 py-1 text-right text-xs font-semibold">
              <div>{t('checkInWarning')}</div>
              <div className="font-mono text-lg">{fmt(warningMsRemaining)}</div>
            </div>
          ) : (
            <span className="text-xs text-white/90">{t('destinationReached')}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={checkInSafe}
            className="flex-1 rounded-xl bg-white py-2.5 text-sm font-bold text-violet-700 shadow-sm"
          >
            {t('imSafe')}
          </button>
          <button
            type="button"
            onClick={triggerSos}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm"
          >
            {t('sos')}
          </button>
        </div>
      </div>
    </div>
  )
}

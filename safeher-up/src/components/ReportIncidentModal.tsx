import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { IncidentType } from '../utils/incidents'

const TYPES: { id: IncidentType; labelKey: 'harassment' | 'unsafeArea' | 'poorLighting' | 'suspicious' | 'other' }[] =
  [
    { id: 'harassment', labelKey: 'harassment' },
    { id: 'unsafe', labelKey: 'unsafeArea' },
    { id: 'lighting', labelKey: 'poorLighting' },
    { id: 'suspicious', labelKey: 'suspicious' },
    { id: 'other', labelKey: 'other' },
  ]

export function ReportIncidentModal({
  lat,
  lng,
  onClose,
  onSubmit,
}: {
  lat: number
  lng: number
  onClose: () => void
  onSubmit: (payload: {
    type: IncidentType
    description?: string
    createdAt: number
    anonymous: boolean
  }) => void
}) {
  const { t } = useLanguage()
  const [type, setType] = useState<IncidentType>('harassment')
  const [useNow, setUseNow] = useState(true)
  const [customTime, setCustomTime] = useState('')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous] = useState(true)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let createdAt = Date.now()
    if (!useNow && customTime) {
      const d = new Date(customTime)
      if (!Number.isNaN(d.getTime())) createdAt = d.getTime()
    }
    onSubmit({
      type,
      description: description.slice(0, 100) || undefined,
      createdAt,
      anonymous,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-end justify-center bg-black/25 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-violet-200/80 bg-white p-4 shadow-xl shadow-violet-500/10">
        <h2 id="report-title" className="text-lg font-semibold text-violet-950">
          {t('reportIncident')}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-violet-900">{t('incidentType')}</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {TYPES.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setType(x.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    type === x.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-violet-50 text-violet-900 hover:bg-violet-100'
                  }`}
                >
                  {t(x.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-violet-900">{t('timeOfIncident')}</span>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setUseNow(true)}
                className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                  useNow ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-900'
                }`}
              >
                {t('now')}
              </button>
              <button
                type="button"
                onClick={() => setUseNow(false)}
                className={`flex-1 rounded-xl py-2 text-sm font-medium ${
                  !useNow ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-900'
                }`}
              >
                {t('customTime')}
              </button>
            </div>
            {!useNow ? (
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="mt-2 w-full rounded-xl border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              />
            ) : null}
          </div>
          <div>
            <label className="text-xs font-medium text-violet-900" htmlFor="desc">
              {t('description')}
            </label>
            <textarea
              id="desc"
              maxLength={100}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 w-full resize-none rounded-xl border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="…"
            />
            <div className="text-right text-[10px] text-neutral-400">{description.length}/100</div>
          </div>
          <label className="flex items-center gap-2 text-sm text-violet-900">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="size-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
            />
            {t('anonymous')}
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-violet-200 py-3 text-sm font-semibold text-violet-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/25"
            >
              {t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

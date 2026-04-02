import { useState } from 'react'
import { useJourney } from '../contexts/JourneyContext'
import { useLanguage } from '../contexts/LanguageContext'

function toLocalInput(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function JourneyPage() {
  const { t } = useLanguage()
  const { journey, startJourney, endJourney, lastLocation } = useJourney()
  const [dest, setDest] = useState('')
  const [arrival, setArrival] = useState(() => toLocalInput(Date.now() + 60 * 60 * 1000))
  const [contacts, setContacts] = useState([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' },
  ])

  const updateContact = (i: number, field: 'name' | 'phone', value: string) => {
    setContacts((prev) =>
      prev.map((c, j) => (j === i ? { ...c, [field]: value } : c)),
    )
  }

  const handleStart = () => {
    const ts = new Date(arrival).getTime()
    if (!dest.trim() || Number.isNaN(ts)) return
    const list = contacts.filter((c) => c.phone.trim())
    if (list.length === 0) return
    startJourney({
      destination: dest.trim(),
      expectedArrival: ts,
      contacts: list,
    })
  }

  if (journey) {
    return (
      <div className="space-y-4 px-3 pb-4 pt-2">
        <div className="rounded-2xl border border-violet-100 bg-white/90 p-4 shadow-sm">
          <h2 className="text-lg font-bold text-violet-950">{t('journeyTitle')}</h2>
          <p className="mt-2 text-sm text-violet-800">
            <span className="font-semibold">{t('destination')}: </span>
            {journey.destination}
          </p>
          <p className="mt-1 text-sm text-violet-800">
            <span className="font-semibold">{t('expectedArrival')}: </span>
            {new Date(journey.expectedArrival).toLocaleString()}
          </p>
          {lastLocation ? (
            <p className="mt-2 text-xs text-neutral-500">
              GPS: {lastLocation.lat.toFixed(4)}, {lastLocation.lng.toFixed(4)}
            </p>
          ) : (
            <p className="mt-2 text-xs text-amber-700">Getting location…</p>
          )}
          <button
            type="button"
            onClick={() => endJourney()}
            className="mt-4 w-full rounded-xl border border-violet-200 py-2.5 text-sm font-semibold text-violet-800"
          >
            {t('cancel')}
          </button>
        </div>
        <p className="text-center text-xs text-violet-700">{t('journeySubtitle')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-3 pb-6 pt-2">
      <div>
        <h2 className="text-lg font-bold text-violet-950">{t('journeyTitle')}</h2>
        <p className="mt-1 text-sm text-violet-800/90">{t('journeySubtitle')}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-violet-100 bg-white/90 p-4 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-violet-900" htmlFor="jd">
            {t('destLabel')}
          </label>
          <input
            id="jd"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="e.g. Gomti Nagar, Lucknow"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-violet-900" htmlFor="jt">
            {t('expectedArrival')}
          </label>
          <input
            id="jt"
            type="datetime-local"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="mt-1 w-full rounded-xl border border-violet-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-violet-900">{t('contacts')}</p>
          <div className="mt-2 space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input
                  aria-label={t('name')}
                  value={c.name}
                  onChange={(e) => updateContact(i, 'name', e.target.value)}
                  className="w-1/3 rounded-xl border border-violet-200 px-2 py-2 text-sm"
                  placeholder={t('name')}
                />
                <input
                  aria-label={t('phone')}
                  value={c.phone}
                  onChange={(e) => updateContact(i, 'phone', e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-violet-200 px-2 py-2 text-sm"
                  placeholder="+91…"
                  inputMode="tel"
                />
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleStart}
          disabled={!dest.trim()}
          className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50"
        >
          {t('startJourney')}
        </button>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-900">
        {t('imSafe')} / {t('sos')} — {t('journeyActive')}
      </div>
    </div>
  )
}

import { useLanguage } from '../contexts/LanguageContext'

const LINES = [
  { num: '1090', label: { en: 'UP Women Helpline', hi: 'यूपी महिला हेल्पलाइन' } },
  { num: '181', label: { en: 'Mahila Helpline (national)', hi: 'महिला हेल्पलाइन (राष्ट्रीय)' } },
  { num: '112', label: { en: 'Emergency', hi: 'आपातकाल' } },
] as const

export default function HelpPage() {
  const { lang, t } = useLanguage()

  return (
    <div className="space-y-4 px-3 pb-8 pt-2">
      <div>
        <h2 className="text-lg font-bold text-violet-950">{t('helpTitle')}</h2>
        <p className="mt-1 text-sm text-violet-800/90">{t('helpIntro')}</p>
      </div>

      <ul className="space-y-3">
        {LINES.map((line) => (
          <li key={line.num}>
            <a
              href={`tel:${line.num}`}
              className="flex items-center justify-between rounded-2xl border border-violet-100 bg-white/95 px-4 py-4 shadow-sm transition active:scale-[0.99]"
            >
              <div>
                <p className="text-2xl font-bold tracking-wide text-violet-900">{line.num}</p>
                <p className="text-sm text-violet-700">
                  {lang === 'hi' ? line.label.hi : line.label.en}
                </p>
              </div>
              <span className="text-violet-400" aria-hidden>
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="text-center text-[11px] leading-relaxed text-neutral-500">
        {lang === 'hi'
          ? 'कॉल करने से पहले सुनिश्चित करें कि आप सुरक्षित स्थान पर हैं।'
          : 'Before calling, make sure you are in a safe place if possible.'}
      </p>
    </div>
  )
}

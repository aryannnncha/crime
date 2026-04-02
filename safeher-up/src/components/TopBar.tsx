import { useLanguage } from '../contexts/LanguageContext'

export function TopBar() {
  const { lang, setLang, t } = useLanguage()

  return (
    <header className="pointer-events-none sticky top-0 z-[4100] flex justify-center px-3 pt-[calc(0.5rem+env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-2 rounded-2xl border border-violet-200/80 bg-white/90 px-3 py-2 shadow-md shadow-violet-500/10 backdrop-blur">
        <div>
          <h1 className="text-base font-bold leading-tight text-violet-950">{t('appTitle')}</h1>
          <p className="text-[11px] text-violet-700/80">{t('tagline')}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-violet-50 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`rounded-full px-2 py-1 ${lang === 'en' ? 'bg-white text-violet-800 shadow-sm' : 'text-violet-600'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`rounded-full px-2 py-1 ${lang === 'hi' ? 'bg-white text-violet-800 shadow-sm' : 'text-violet-600'}`}
          >
            हि
          </button>
        </div>
      </div>
    </header>
  )
}

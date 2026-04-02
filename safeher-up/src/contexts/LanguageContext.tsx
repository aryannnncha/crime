import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Lang, TKey } from '../i18n/strings'
import { t as translate } from '../i18n/strings'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem('safeher_lang')
      return s === 'hi' ? 'hi' : 'en'
    } catch {
      return 'en'
    }
  })

  const setLangPersist = useCallback((l: Lang) => {
    setLang(l)
    try {
      localStorage.setItem('safeher_lang', l)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback(
    (key: Parameters<typeof translate>[0]) => translate(key, lang),
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang: setLangPersist, t }),
    [lang, setLangPersist, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/** @throws if used outside LanguageProvider */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

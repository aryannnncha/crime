import { NavLink } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export function BottomNav() {
  const { t } = useLanguage()
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition ${
      isActive
        ? 'bg-violet-100 text-violet-800'
        : 'text-violet-600/80 hover:bg-violet-50'
    }`

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[4000] border-t border-violet-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] pt-1 shadow-[0_-4px_24px_rgba(91,33,182,0.08)] backdrop-blur"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-stretch gap-1 px-2">
        <NavLink to="/" className={linkClass} end>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3L6 9v6h4v3h4v-3h4V9l-6-6z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          {t('navMap')}
        </NavLink>
        <NavLink to="/routes" className={linkClass}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 3L6 9v6h4v3h4v-3h4V9l-6-6z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              opacity="0.35"
            />
            <path
              d="M4 18h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {t('navRoutes')}
        </NavLink>
        <NavLink to="/journey" className={linkClass}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M12 8v4l4 2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {t('navJourney')}
        </NavLink>
        <NavLink to="/help" className={linkClass}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 17h.01M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {t('navHelp')}
        </NavLink>
      </div>
    </nav>
  )
}

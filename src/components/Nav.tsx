import { useTranslation } from 'react-i18next'
import { LANG_ORDER } from '../i18n'
import Logo from './Logo'
import { useEffect, useRef, useState } from 'react'

const LANG_NAMES: Record<string, string> = {
  'zh-CN': '中文（简体）',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}

export default function Nav() {
  const { t, i18n } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        menuButton.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1280px)')
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      desktop.removeEventListener('change', closeOnDesktop)
    }
  }, [open])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  return (
    <nav className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="content-wrap nav-inner">
        <a href="#main" className="nav-brand !no-underline" onClick={() => setOpen(false)}>
          <Logo />
        </a>
        <button ref={menuButton} type="button" className="nav-menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-navigation" aria-label={t('nav.menu')}>
          <span /> <span />
        </button>
        <div id="site-navigation" className={`nav-links ${open ? 'is-open' : ''}`}>
          <a href="#model" onClick={() => setOpen(false)} className="text-sm hover:text-cryo transition-colors">
            {t('nav.product')}
          </a>
          <a href="#solutions" onClick={() => setOpen(false)} className="text-sm hover:text-cryo transition-colors">
            {t('nav.solutions')}
          </a>
          <a href="#technology" onClick={() => setOpen(false)} className="text-sm hover:text-cryo transition-colors">
            {t('nav.technology')}
          </a>
          <a href="#control" onClick={() => setOpen(false)} className="text-sm hover:text-cryo transition-colors">
            {t('nav.control')}
          </a>
          <a href="#safety" onClick={() => setOpen(false)} className="text-sm hover:text-cryo transition-colors">
            {t('nav.safety')}
          </a>
          <a href="#team" onClick={() => setOpen(false)} className="text-sm hover:text-cryo transition-colors">
            {t('nav.company')}
          </a>
          <a href="#contact" onClick={() => setOpen(false)} className="nav-contact-link text-sm hover:text-cryo transition-colors">
            {t('nav.contact')}
          </a>
          <select
            value={i18n.language}
            onChange={handleLangChange}
            className="text-sm bg-transparent border border-line-2 rounded px-2 py-1 cursor-pointer"
            aria-label={t('nav.language')}
          >
            {LANG_ORDER.map((code) => (
              <option key={code} value={code}>
                {LANG_NAMES[code]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  )
}

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from '../locales/zh-CN/common.json'
import en from '../locales/en/common.json'

const resources = {
  'zh-CN': { common: zhCN },
  en: { common: en },
}

const LANG_ORDER = ['zh-CN', 'en']

function detectLanguage() {
  const params = new URLSearchParams(window.location.search)
  const url = params.get('lang')
  if (url && LANG_ORDER.includes(url)) return url
  const stored = localStorage.getItem('cryodrive-lang')
  if (stored && LANG_ORDER.includes(stored)) return stored
  const nav = navigator.language || navigator.languages?.[0]
  if (nav) {
    if (LANG_ORDER.includes(nav)) return nav
    const prefix = nav.split('-')[0]
    const match = LANG_ORDER.find(l => l.startsWith(prefix))
    if (match) return match
  }
  return 'zh-CN'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  ns: ['common'],
  defaultNS: 'common',
  interpolation: { escapeValue: false },
})

export function getFontStack(lang: string): string {
  if (lang === 'ja') return '"Noto Sans JP Variable", "Noto Sans CJK JP", sans-serif'
  if (lang === 'ko') return '"Noto Sans KR Variable", "Noto Sans CJK KR", sans-serif'
  if (lang.startsWith('zh')) return '"Noto Sans SC Variable", "HarmonyOS Sans SC", "Noto Sans CJK SC", sans-serif'
  return '"Archivo Variable", -apple-system, sans-serif'
}

export function syncLangToDOM(lang: string) {
  document.documentElement.lang = lang
  document.documentElement.style.setProperty('--font-sans', getFontStack(lang))
  const url = new URL(window.location.href)
  url.searchParams.set('lang', lang)
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  localStorage.setItem('cryodrive-lang', lang)
}

i18n.on('languageChanged', syncLangToDOM)
syncLangToDOM(i18n.language)

export { LANG_ORDER }
export default i18n

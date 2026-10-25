import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { useEffect } from 'react'
import ProductViewer from '../components/ProductViewer'

export default function Hero() {
  const { t, i18n } = useTranslation()
  const targetTemp = useAppStore((s) => s.targetTemp)

  useEffect(() => {
    const tempT = (targetTemp + 25) / 35
    document.documentElement.style.setProperty('--temp-t', tempT.toFixed(3))
  }, [targetTemp])

  const isCJK = i18n.language.startsWith('zh') || i18n.language === 'ja' || i18n.language === 'ko'
  const title = t('hero.title')
  const titleLines = i18n.language.startsWith('zh') ? title.split('，') : [title]

  return (
    <section className="hero-section">
      <div className="content-wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{t('hero.eyebrow')}</p>
          <h1 className="display">{titleLines.map((line, index) => <span className="hero-title-line" key={index}>{line}{index < titleLines.length - 1 ? '，' : ''}</span>)}</h1>
          {isCJK && <p className="hero-tagline">Cold, under control.</p>}
          <p className="lede">{t('hero.subtitle')}</p>
          <div className="hero-actions">
            <a href="#model" className="button-primary">
              {t('hero.ctaModel')}
            </a>
            <a href="#contact" className="button-secondary">
              {t('hero.ctaHow')}
            </a>
          </div>
        </div>
        <div className="hero-visual"><ProductViewer /></div>
      </div>
      <div className="scroll-cue text-sm">
        <span>{t('hero.scroll')}</span>
        <div className="scroll-cue-line" />
      </div>
    </section>
  )
}

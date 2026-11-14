import { useTranslation } from 'react-i18next'

type DownloadItem = {
  key: 'manual-zh' | 'manual-en' | 'datasheet-zh' | 'datasheet-en'
  href: string
  kickerKey: 'manualKicker' | 'datasheetKicker'
  titleKey: 'manualTitle' | 'manualTitleEn' | 'datasheetTitle' | 'datasheetTitleEn'
  metaKey: 'metaManual' | 'metaDatasheet'
  langKey: 'langZh' | 'langEn'
}

const ITEMS: DownloadItem[] = [
  {
    key: 'manual-zh',
    href: './downloads/Chill-Crate-X1_Manual_V1.0_zh-CN.pdf',
    kickerKey: 'manualKicker',
    titleKey: 'manualTitle',
    metaKey: 'metaManual',
    langKey: 'langZh',
  },
  {
    key: 'manual-en',
    href: './downloads/Chill-Crate-X1_Manual_V1.0_en.pdf',
    kickerKey: 'manualKicker',
    titleKey: 'manualTitleEn',
    metaKey: 'metaManual',
    langKey: 'langEn',
  },
  {
    key: 'datasheet-zh',
    href: './downloads/Chill-Crate-X1_Datasheet_V1.0_zh-CN.pdf',
    kickerKey: 'datasheetKicker',
    titleKey: 'datasheetTitle',
    metaKey: 'metaDatasheet',
    langKey: 'langZh',
  },
  {
    key: 'datasheet-en',
    href: './downloads/Chill-Crate-X1_Datasheet_V1.0_en.pdf',
    kickerKey: 'datasheetKicker',
    titleKey: 'datasheetTitleEn',
    metaKey: 'metaDatasheet',
    langKey: 'langEn',
  },
]

export default function Downloads() {
  const { t } = useTranslation()

  return (
    <section id="downloads" className="downloads-section">
      <div className="content-wrap">
        <div className="downloads-head">
          <div>
            <p className="eyebrow">{t('downloads.eyebrow')}</p>
            <h2>{t('downloads.title')}</h2>
          </div>
          <p className="lede">{t('downloads.body')}</p>
        </div>

        <div className="downloads-grid">
          {ITEMS.map((item) => (
            <a
              key={item.key}
              className="download-card"
              href={item.href}
              download
              aria-label={`${t(`downloads.${item.titleKey}`)} — ${t('downloads.download')}`}
            >
              <span className="download-type">PDF</span>
              <span className="download-copy">
                <span className="download-kicker">
                  {t(`downloads.${item.kickerKey}`)}
                  <span className="download-lang">{t(`downloads.${item.langKey}`)}</span>
                </span>
                <span className="download-title">{t(`downloads.${item.titleKey}`)}</span>
                <span className="download-desc">{t(`downloads.${item.key}Desc`)}</span>
                <span className="download-meta">{t(`downloads.${item.metaKey}`)}</span>
              </span>
              <span className="download-arrow" aria-hidden="true">↓</span>
            </a>
          ))}
        </div>

        <p className="downloads-note">{t('downloads.note')}</p>
      </div>
    </section>
  )
}

import { useTranslation } from 'react-i18next'

type DownloadItem = {
  key: 'manual' | 'datasheet'
  href: string
  type: string
  meta: string
}

const ITEMS: DownloadItem[] = [
  {
    key: 'manual',
    href: './downloads/Chill-Crate-X1_Manual_V1.0_zh-CN.docx',
    type: 'DOCX',
    meta: 'Word · V1.0 · 2026-11 · 0.6 MB',
  },
  {
    key: 'datasheet',
    href: './downloads/Chill-Crate-X1_Datasheet_V1.0_zh-CN.pdf',
    type: 'PDF',
    meta: 'PDF · V1.0 · 2026-11 · 0.6 MB',
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
              aria-label={`${t(`downloads.${item.key}Title`)} — ${t('downloads.download')}`}
            >
              <span className="download-type">{item.type}</span>
              <span className="download-copy">
                <span className="download-kicker">{t(`downloads.${item.key}Kicker`)}</span>
                <span className="download-title">{t(`downloads.${item.key}Title`)}</span>
                <span className="download-desc">{t(`downloads.${item.key}Desc`)}</span>
                <span className="download-meta">{item.meta}</span>
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

import { useTranslation } from 'react-i18next'

export default function Contact() {
  const { t } = useTranslation()
  const items = t('contact.items', { returnObjects: true }) as string[]

  return (
    <section id="contact" className="contact-section">
      <div className="content-wrap contact-grid">
        <div>
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h2>{t('contact.title')}</h2>
          <p className="lede">{t('contact.body')}</p>
          <div className="contact-actions">
            <a href="mailto:chilllink-cooperate@gmail.com" className="button-primary">{t('contact.primary')}</a>
            <a href="#model" className="button-secondary">{t('contact.secondary')}</a>
          </div>
        </div>
        <div className="contact-panel">
          <span className="contact-panel-label">{t('contact.panelTitle')}</span>
          <ul>
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="caption">{t('contact.note')}</p>
        </div>
      </div>
    </section>
  )
}

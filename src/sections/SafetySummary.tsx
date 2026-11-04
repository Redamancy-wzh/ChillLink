import { useTranslation } from 'react-i18next'

export default function SafetySummary() {
  const { t } = useTranslation()
  const actions = t('safetySummary.actions', { returnObjects: true }) as string[]
  return (
    <section id="safety-summary" className="safety-summary-section">
      <div className="content-wrap safety-summary-grid">
        <div>
          <p className="eyebrow">{t('safetySummary.eyebrow')}</p>
          <h2>{t('safetySummary.title')}</h2>
          <p className="safety-summary-lede">{t('safetySummary.body')}</p>
          <a className="text-link" href="#safety">{t('safetySummary.link')} →</a>
        </div>
        <ol className="safety-summary-actions">{actions.map((action, index) => <li key={action}><span>{String(index + 1).padStart(2, '0')}</span>{action}</li>)}</ol>
      </div>
    </section>
  )
}

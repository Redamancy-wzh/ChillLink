import { useTranslation } from 'react-i18next'

interface ImpactStat {
  value: string
  label: string
}

/** Environmental case that sits between the specification strip and the solutions chapter. */
export default function Impact() {
  const { t } = useTranslation()
  const stats = t('impact.stats', { returnObjects: true }) as ImpactStat[]

  return (
    <section id="impact" className="impact-section">
      <div className="content-wrap impact-grid">
        <div className="impact-copy">
          <p className="eyebrow">{t('impact.eyebrow')}</p>
          <h2>{t('impact.title')}</h2>
          <p className="impact-body">{t('impact.body')}</p>
          <p className="impact-sdg">{t('impact.sdg')}</p>
          <p className="impact-note">{t('impact.note')}</p>
        </div>
        <div className="impact-stats">
          {stats.map((stat, index) => (
            <article className="impact-stat" key={stat.label}>
              <span className="impact-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

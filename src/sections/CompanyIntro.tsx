import { useTranslation } from 'react-i18next'

export default function CompanyIntro() {
  const { t } = useTranslation()
  const facts = t('companyIntro.facts', { returnObjects: true }) as Array<{ label: string; value: string }>

  return (
    <section id="company-intro" className="company-intro">
      <div className="content-wrap company-intro-grid">
        <div className="company-intro-copy">
          <p className="eyebrow">{t('companyIntro.eyebrow')}</p>
          <h2>{t('companyIntro.title')}</h2>
          <p className="lede">{t('companyIntro.body')}</p>
          <a className="text-link" href="#solutions">{t('companyIntro.link')}</a>
        </div>
        <div className="company-facts" aria-label={t('companyIntro.title')}>
          {facts.map((fact) => (
            <div className="company-fact" key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

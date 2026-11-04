import { useTranslation } from 'react-i18next'

type PackagePlan = { name: string; volume: string; fans: string; dryIce: string; price: string }

export default function PackagePlans() {
  const { t } = useTranslation()
  const plans = t('packagePlans.items', { returnObjects: true }) as PackagePlan[]

  return (
    <section id="package-plans" className="package-plans-section">
      <div className="content-wrap">
        <div className="package-plans-heading">
          <div>
            <p className="eyebrow">{t('packagePlans.eyebrow')}</p>
            <h2>{t('packagePlans.title')}</h2>
          </div>
          <p>{t('packagePlans.intro')}</p>
        </div>
        <div className="package-plans-grid">
          {plans.map((plan) => (
            <article className="package-plan-card" key={plan.name}>
              <div className="package-plan-topline">
                <span className="package-plan-name">{t('packagePlans.headers.plan')} {plan.name}</span>
                <span className="package-plan-price">{plan.price}</span>
              </div>
              <p className="package-plan-volume">{plan.volume}<span>{t('packagePlans.headers.volume')}</span></p>
              <dl className="package-plan-details">
                <div><dt>{t('packagePlans.headers.fans')}</dt><dd>{plan.fans}</dd></div>
                <div><dt>{t('packagePlans.headers.dryIce')}</dt><dd>{plan.dryIce}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <p className="package-plans-note">{t('packagePlans.note')}</p>
      </div>
    </section>
  )
}

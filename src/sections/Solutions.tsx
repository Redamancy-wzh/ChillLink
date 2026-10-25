import { useTranslation } from 'react-i18next'
import SceneCarousel from './SceneCarousel'
import Problem from './Problem'

interface SolutionItem {
  title: string
  body: string
  tag: string
}

const icons = [
  <path key="t" d="M12 3v11M9 6h3M9 9h3M12 14a4 4 0 1 0 .01 0" />,
  <path key="b" d="M4 8l8-4 8 4-8 4-8-4Zm0 0v8l8 4 8-4V8M12 12v8" />,
  <path key="s" d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Zm-3 9 2 2 4-4" />,
]

/** Value pillars, application scenes and market context, presented as one chapter. */
export default function Solutions() {
  const { t } = useTranslation()
  const items = t('solutions.items', { returnObjects: true }) as SolutionItem[]

  return (
    <section id="solutions" className="solutions-section">
      <div className="content-wrap">
        <div className="section-heading section-heading-wide">
          <div>
            <p className="eyebrow">{t('solutions.eyebrow')}</p>
            <h2>{t('solutions.title')}</h2>
          </div>
          <p className="section-heading-copy">{t('solutions.body')}</p>
        </div>
        <div className="solution-grid">
          {items.map((item, index) => (
            <article className="solution-card" key={item.title}>
              <div className="solution-card-top">
                <svg className="solution-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[index % icons.length]}</svg>
                <span className="status-pill">{item.tag}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
        <SceneCarousel embedded />
        <Problem embedded />
      </div>
    </section>
  )
}

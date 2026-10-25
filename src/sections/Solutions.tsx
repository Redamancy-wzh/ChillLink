import { useTranslation } from 'react-i18next'

interface SolutionItem {
  title: string
  body: string
  tag: string
}

const solutionImages = [
  './img/showcase/5777.webp',
  './img/showcase/5802.webp',
  './img/showcase/5781.webp',
]

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
                <span className="solution-index">0{index + 1}</span>
                <span className="status-pill">{item.tag}</span>
              </div>
              <img className="solution-card-image" src={solutionImages[index % solutionImages.length]} alt="" loading="lazy" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <span className="solution-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

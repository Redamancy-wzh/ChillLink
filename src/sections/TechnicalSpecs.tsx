import { useTranslation } from 'react-i18next'

interface SpecRow {
  label: string
  value: string
  detail: string
  status: string
}

interface SpecGroup {
  title: string
  code: string
  rows: SpecRow[]
}

export default function TechnicalSpecs() {
  const { t } = useTranslation()
  const groups = t('technicalSpecs.groups', { returnObjects: true }) as SpecGroup[]
  const performance = t('technicalSpecs.performance', { returnObjects: true }) as SpecRow[]

  return (
    <section id="technical-specs" className="technical-specs-section">
      <div className="content-wrap">
        <div className="section-heading section-heading-wide technical-specs-heading">
          <div>
            <p className="eyebrow">{t('technicalSpecs.eyebrow')}</p>
            <h2>{t('technicalSpecs.title')}</h2>
          </div>
          <p className="section-heading-copy">{t('technicalSpecs.intro')}</p>
        </div>

        <div className="performance-panel">
          <h3>{t('technicalSpecs.performanceTitle')}</h3>
          <dl className="performance-grid">{performance.map(row=><div key={row.label}><dt>{row.label}</dt><dd><strong>{row.value}</strong><span>{row.detail}</span></dd></div>)}</dl>
        </div>

        <div className="technical-spec-diagram" aria-label={t('technicalSpecs.diagramTitle')}>
          <div className="technical-spec-gallery-heading"><span className="technical-spec-code">↻</span><h3>{t('technicalSpecs.diagramTitle')}</h3></div>
          <div className="technical-diagram-scroll" tabIndex={0} role="region" aria-label={t('technicalSpecs.diagramTitle')}>
          <svg viewBox="0 0 760 300" role="img" aria-label={t('technicalSpecs.diagramTitle')}>
            <defs>
              <marker id="spec-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1478c8" /></marker>
              <marker id="spec-exhaust" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#d47639" /></marker>
            </defs>
            <rect x="24" y="16" width="712" height="270" rx="18" fill="#eef6f8" stroke="#b9d1da" />
            <rect x="55" y="60" width="170" height="70" rx="12" fill="#dfeef2" stroke="#8fb8c6" />
            <text x="140" y="89" textAnchor="middle">{t('technicalSpecs.diagramLabels.0')}</text><text x="140" y="113" textAnchor="middle" className="diagram-small">1 kg</text>
            <path d="M225 95h126" fill="none" stroke="#778c94" strokeWidth="8" />
            <text x="285" y="77" textAnchor="middle" className="diagram-small">{t('technicalSpecs.diagramLabels.5')}</text>
            <path d="M140 60V35h510" fill="none" stroke="#d47639" strokeWidth="3" strokeDasharray="7 5" markerEnd="url(#spec-exhaust)" />
            <text x="420" y="25" textAnchor="middle" className="diagram-small">{t('technicalSpecs.diagramLabels.6')}</text>
            <rect x="350" y="60" width="145" height="70" rx="12" fill="#d9e0e1" stroke="#778c94" />
            <text x="422" y="100" textAnchor="middle">{t('technicalSpecs.diagramLabels.1')}</text>
            <rect x="550" y="180" width="155" height="66" rx="12" fill="#fff" stroke="#8fb8c6" />
            <text x="627" y="218" textAnchor="middle">{t('technicalSpecs.diagramLabels.3')}</text>
            <rect x="330" y="180" width="185" height="66" rx="12" fill="#fff" stroke="#1478c8" />
            <text x="422" y="207" textAnchor="middle">{t('technicalSpecs.diagramLabels.2')}</text><text x="422" y="231" textAnchor="middle" className="diagram-small">1 × 120 × 120 mm</text>
            <path d="M550 213h-33" fill="none" stroke="#1478c8" strokeWidth="4" markerEnd="url(#spec-arrow)" />
            <path d="M422 180v-48" fill="none" stroke="#1478c8" strokeWidth="4" markerEnd="url(#spec-arrow)" />
            <path d="M495 95h133v83" fill="none" stroke="#1478c8" strokeWidth="4" markerEnd="url(#spec-arrow)" />
            <text x="627" y="151" textAnchor="middle" className="diagram-small">{t('technicalSpecs.diagramLabels.4')}</text>
            <text x="140" y="211" textAnchor="middle" fill="#1478c8">−25 ~ +10 °C</text>
          </svg>
          </div>
        </div>

        <div className="technical-spec-grid">
          {groups.map((group) => (
            <article className="technical-spec-card" key={group.code}>
              <div className="technical-spec-card-head">
                <span className="technical-spec-code">{group.code}</span>
                <h3>{group.title}</h3>
              </div>
              <dl className="technical-spec-list">
                {group.rows.map((row) => (
                  <div className="technical-spec-row" key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>
                      <strong>{row.value}</strong>
                      {row.detail && <span>{row.detail}</span>}
                      {row.status && <em>{row.status}</em>}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="technical-spec-disclosure">
          <span className="technical-spec-disclosure-mark" aria-hidden="true">i</span>
          <p>{t('technicalSpecs.disclosure')}</p>
        </div>



      </div>
    </section>
  )
}

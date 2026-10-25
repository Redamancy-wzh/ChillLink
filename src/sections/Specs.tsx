import { useTranslation } from 'react-i18next'

interface Spec {
  label: string
  value: string
  note: string
  status: string
}

export default function Specs() {
  const { t } = useTranslation()
  const specs = t('specs', { returnObjects: true }) as Spec[]

  return (
    <section className="specs-strip">
      <div className="content-wrap specs-grid">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="spec-item"
          >
            <div className="caption">{spec.label}</div>
            <div className="value">{spec.value}</div>
            <div className="caption">{spec.note}</div>
            {spec.status && <div className="status-pill">
              {spec.status}
            </div>}
          </div>
        ))}
      </div>
    </section>
  )
}

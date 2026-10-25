import { useTranslation } from 'react-i18next'

export default function Compare() {
  const { t } = useTranslation()
  const chartSeries = [
    { name: t('compare.series.0'), color: '#a7b5bd', values: [18, 20, 22, 24, 25, 26, 26, 26, 26] },
    { name: t('compare.series.1'), color: '#b58c80', values: [4, 2, 4, 8, 12, 16, 19, 22, 24] },
    { name: t('compare.series.2'), color: '#9b8fa8', values: [18, 19, 21, 22, 23, 24, 24, 24, 24] },
    { name: t('compare.series.3'), color: '#7f9f82', values: [3, 1, 2, 5, 8, 11, 14, 17, 20] },
    { name: t('compare.series.4'), color: '#0b73d1', values: [18, 7, -4, -10, -12, -11, -10, -9, -8] },
  ]
  const chartTimes = [0, 15, 30, 45, 60, 75, 90, 105, 120]
  const chartX = (time: number) => 56 + (time / 120) * 664
  const chartY = (temp: number) => 26 + ((30 - temp) / 45) * 232
  const targetTemperatureLabel = t('compare.targetTemperature', { defaultValue: 'Target temperature −10 °C' })
  const costRows = t('compare.costRows', { returnObjects: true }) as string[][]

  return (
    <section id="compare" className="max-w-page mx-auto px-6 space-y-6">
      <div className="section-heading section-heading-wide">
        <div><p className="eyebrow">{t('compare.eyebrow')}</p><h2>{t('compare.title')}</h2></div>
        <p className="section-heading-copy">{t('compare.intro')}</p>
      </div>
      <div className="compare-chart-wrap">
        <div className="compare-chart-head"><strong>{t('compare.chartTitle')}</strong><span>{t('compare.chartRange')}</span></div>
        <div className="compare-chart-scroll" tabIndex={0} role="region" aria-label={t('compare.chartLabel')}>
        <svg className="compare-chart" viewBox="0 0 760 300" role="img" aria-label={t('compare.chartLabel')}>
          {[30, 20, 10, 0, -10].map((temp) => <g key={temp}><line x1="56" x2="720" y1={chartY(temp)} y2={chartY(temp)} stroke="currentColor" opacity=".12" /><text x="44" y={chartY(temp) + 4} textAnchor="end">{temp}°</text></g>)}
          {[0, 30, 60, 90, 120].map((time) => <g key={time}><line x1={chartX(time)} x2={chartX(time)} y1="26" y2="258" stroke="currentColor" opacity=".08" /><text x={chartX(time)} y="278" textAnchor="middle">{time}</text></g>)}
          <line className="compare-target-line" x1="56" x2="720" y1={chartY(-10)} y2={chartY(-10)} />
          <text className="compare-target-label" x="712" y={chartY(-10) - 7} textAnchor="end">{targetTemperatureLabel}</text>
          <line x1="56" x2="720" y1="258" y2="258" stroke="currentColor" opacity=".35" />
          {chartSeries.map((series, index) => <polyline key={series.name} fill="none" stroke={series.color} strokeWidth={index === 4 ? 4.8 : 2.2} opacity={index === 4 ? 1 : 0.82} strokeLinecap="round" strokeLinejoin="round" points={series.values.map((temp, index) => `${chartX(chartTimes[index])},${chartY(temp)}`).join(' ')} />)}
          <text x="388" y="296" textAnchor="middle">{t('compare.x')}</text><text x="13" y="145" textAnchor="middle" transform="rotate(-90 13 145)">{t('compare.y')}</text>
        </svg>
        </div>
        <div className="compare-legend">{chartSeries.map((series, index) => <span key={series.name} className={index === 4 ? 'compare-legend-product' : ''}><i style={{ background: series.color }} />{series.name}</span>)}</div>
      </div>
      <div className="compare-cost"><div className="compare-chart-head"><strong>{t('compare.costTitle')}</strong><span>{t('compare.costSub')}</span></div><div className="compare-cost-grid">{costRows.map(([name, cost, note]) => <article key={name}><span>{name}</span><strong>{cost}</strong><p>{note}</p></article>)}</div><p className="compare-cost-note">{t('compare.costNote')}</p><a className="text-link" href="https://s.1688.com/selloffer/offer_search.htm?keywords=%B1%F9%B4%FC" target="_blank" rel="noreferrer">{t('compare.iceLink')}</a></div>
    </section>
  )
}

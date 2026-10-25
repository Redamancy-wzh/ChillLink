import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { COLD_LEFT_2D, COLD_RIGHT_2D, WARM_LEFT_2D, WARM_RIGHT_2D, type AirflowOptions } from '../three/airflowPaths'

export default function AirflowDiagram({ options }: { options: AirflowOptions }) {
  const { t } = useTranslation()
  const id = useId().replace(/:/g, '')
  const svg = useRef<SVGSVGElement>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options
  useEffect(() => {
    const element = svg.current
    if (!element) return
    element.pauseAnimations()
    element.setCurrentTime(2.3)
    let visible = false, frame = 0, previous = 0
    const tick = (now: number) => {
      frame = 0
      const state = optionsRef.current
      if (!visible || document.hidden) return
      if (previous && state.playing && !state.reducedMotion) element.setCurrentTime(element.getCurrentTime() + Math.min((now - previous) / 1000, .05) * state.speed)
      previous = now
      if (state.playing && !state.reducedMotion) frame = requestAnimationFrame(tick)
    }
    const wake = () => { previous = 0; cancelAnimationFrame(frame); frame = 0; if (visible && !document.hidden) frame = requestAnimationFrame(tick) }
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; wake() })
    observer.observe(element)
    document.addEventListener('visibilitychange', wake)
    element.addEventListener('airflow-update', wake)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', wake); element.removeEventListener('airflow-update', wake) }
  }, [])
  useEffect(() => { svg.current?.dispatchEvent(new Event('airflow-update')) }, [options])
  const segments = [
    { key: 'coldL', kind: 'cold', path: COLD_LEFT_2D }, { key: 'coldR', kind: 'cold', path: COLD_RIGHT_2D },
    { key: 'warmL', kind: 'warm', path: options.fanMode === 'single' ? 'M226 362 C258 345 306 311 310 274 L310 234 C310 210 302 193 290 185' : WARM_LEFT_2D }, { key: 'warmR', kind: 'warm', path: options.fanMode === 'single' ? 'M414 362 C382 345 334 311 330 274 L330 234 C330 210 338 193 350 185' : WARM_RIGHT_2D },
  ]
  return <svg ref={svg} className="airflow-diagram" viewBox="0 0 640 455" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>{t('airflow.plane')}</title><desc id={`${id}-desc`}>{t('airflow.body')}</desc>
    <defs>
      {['cold', 'warm'].map(kind => <marker key={kind} id={`${id}-${kind}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 8 5 1 9" fill="none" stroke={kind === 'cold' ? '#168ec2' : '#de7b40'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></marker>)}
      <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#c7dce3" strokeWidth=".6" /></pattern>
    </defs>
    <rect width="640" height="455" fill={`url(#${id}-grid)`} opacity=".32" />
    <path d="M67 105V358Q67 400 106 400H534Q573 400 573 358V105" fill="#f8fcfd" fillOpacity=".72" stroke="#8ba9b7" strokeWidth="2" />
    <path d="M64 90H576V106H64Z" fill="#d6e5eb" stroke="#8ba9b7" strokeWidth="1.5" />
    <path d="M236 107H404L393 145Q390 158 375 158H265Q250 158 247 145Z" fill="#d5edf8" stroke="#6998ab" strokeWidth="1.5" />
    <text x="320" y="137" textAnchor="middle" className="airflow-svg-label">{t('airflow.chamber')}</text>
    <rect x="228" y="163" width="184" height="10" rx="3" fill="#718f9e" />
    {Array.from({ length: 17 }, (_, index) => <rect key={index} x={231 + index * 10.4} y="173" width="4" height="28" rx="1" fill="#9aafb9" />)}
    <path d="M218 160H163V147" className="airflow-leader" />
    <text x="163" y="136" textAnchor="middle" className="airflow-svg-label small">{t('airflow.fins')}</text>
    <path d="M418 225H472V214" className="airflow-leader" />
    <text x="472" y="204" textAnchor="middle" className="airflow-svg-label small">{t('airflow.fans')}</text>
    {(options.fanMode === 'single' ? [320] : [270, 370]).map(x => <g key={x}><rect x={x - 40} y="209" width="80" height="28" rx="4" fill="#294a5e" /><ellipse cx={x} cy="223" rx="28" ry="9" fill="#6592a8" /><ellipse cx={x} cy="223" rx="5" ry="6" fill="#d8eef7" /></g>)}
    {segments.map(({ key, kind, path }) => <g key={key} className={`airflow-svg-stream ${kind}`} opacity={(options.filter !== 'all' && options.filter !== kind) ? .08 : 1}>
      <path d={path} fill="none" stroke={kind === 'cold' ? '#3ba8d7' : '#e08c53'} strokeWidth="18" opacity=".07" />
      <path id={`${id}-${key}`} d={path} fill="none" stroke={kind === 'cold' ? '#3ba8d7' : '#e08c53'} strokeWidth="2.3" strokeDasharray="5 7" />
      {Array.from({ length: 7 }, (_, index) => <circle key={index} r="3.6" fill={kind === 'cold' ? '#158abb' : '#dc8147'}><animateMotion dur={kind === 'cold' ? '4s' : '2.8s'} begin={`${-index * (kind === 'cold' ? 4 : 2.8) / 7}s`} repeatCount="indefinite" path={path} /></circle>)}
    </g>)}
    <g opacity={options.filter === 'warm' ? .1 : 1}>
      {['M177 180H151','M92 268v28','M168 375h26','M463 180h26','M548 268v28','M472 375h-26'].map(path => <path key={path} d={path} fill="none" stroke="#168ec2" strokeWidth="2.2" markerEnd={`url(#${id}-cold)`} />)}
    </g>
    <g opacity={options.filter === 'cold' ? .1 : 1}>
      {(options.fanMode === 'single' ? [310,330] : [270,370]).map(x => <path key={x} d={`M${x} 298v-28`} stroke="#de7b40" strokeWidth="2.4" markerEnd={`url(#${id}-warm)`} />)}
    </g>
    <text x="145" y="294" textAnchor="middle" className="airflow-svg-label cold">{t('airflow.coldShort')}</text>
    <text x="495" y="294" textAnchor="middle" className="airflow-svg-label cold">{t('airflow.coldShort')}</text>
    <text x="320" y="333" textAnchor="middle" className="airflow-svg-label warm">{t('airflow.warmShort')}</text>
    <text x="320" y="427" textAnchor="middle" className="airflow-svg-label small">{t('airflow.storage')}</text>
    <text x="320" y="61" textAnchor="middle" className="airflow-svg-kicker">{t('airflow.sectionView')}</text>
  </svg>
}

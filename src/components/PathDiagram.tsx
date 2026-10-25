import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export interface PathState {
  fans: boolean
  primaryOpen: boolean
}

// Food-air loops: cooled air leaves the fins, sinks along both walls and the floor (cold),
// then rises through the centre back to the fan (warm return).
const COLD_L = 'M300 186 C270 186 236 182 200 182 L138 182 Q118 182 118 202 L118 318 Q118 338 138 338 L282 338'
const COLD_R = 'M340 186 C370 186 404 182 440 182 L502 182 Q522 182 522 202 L522 318 Q522 338 502 338 L358 338'
const WARM_L = 'M282 338 Q304 338 304 316 L304 222 Q304 206 314 196'
const WARM_R = 'M358 338 Q336 338 336 316 L336 222 Q336 206 326 196'
const STREAMS = [
  { path: COLD_L, kind: 'cold', dots: 7, dur: 4.2 }, { path: COLD_R, kind: 'cold', dots: 7, dur: 4.2 },
  { path: WARM_L, kind: 'warm', dots: 3, dur: 1.6 }, { path: WARM_R, kind: 'warm', dots: 3, dur: 1.6 },
] as const
// CO₂ leaves the dry-ice chamber upward through its own sealed duct in the lid.
const CO2_PRIMARY = 'M352 104 L352 56 Q352 46 362 46 L600 46'
const CO2_BACKUP = 'M288 104 L288 56 Q288 46 278 46 L40 46'
const WIRE = 'M496 112 L496 132 Q496 140 504 140 L536 140 L536 300 Q536 306 530 306 L512 306'

/**
 * Cross-section of the box showing the three separated paths.
 * Particles use SMIL animateMotion; the whole SVG pauses when it leaves the viewport.
 */
export default function PathDiagram({ state, filter = 'all', playing = true }: { state: PathState; filter?: 'all' | 'cold' | 'warm'; playing?: boolean }) {
  const { t } = useTranslation()
  const svg = useRef<SVGSVGElement>(null)
  const id = useId().replace(/:/g, '')
  useEffect(() => {
    const element = svg.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && playing) element.unpauseAnimations(); else element.pauseAnimations() })
    observer.observe(element)
    return () => observer.disconnect()
  }, [playing])
  const { fans, primaryOpen } = state
  const co2Live = primaryOpen ? CO2_PRIMARY : CO2_BACKUP
  const puffs = (path: string, count: number, dur: number, strong: boolean) => Array.from({ length: count }, (_, i) => {
    const begin = `${(-i * dur / count).toFixed(2)}s`
    return <circle key={`${path.length}-${i}`} r="4" fill="#ef8a4a" opacity="0">
      <animateMotion dur={`${dur}s`} begin={begin} repeatCount="indefinite" path={path} />
      <animate attributeName="r" values={strong ? '2.5;4;6.5' : '2;3;4.5'} dur={`${dur}s`} begin={begin} repeatCount="indefinite" />
      <animate attributeName="opacity" values={strong ? '0;.95;.8;0' : '0;.55;.4;0'} keyTimes="0;.15;.8;1" dur={`${dur}s`} begin={begin} repeatCount="indefinite" />
    </circle>
  })
  return <svg ref={svg} className="path-diagram" viewBox="0 0 640 386" role="img" aria-labelledby={`${id}-t`}>
    <title id={`${id}-t`}>{t('safety.title')}</title>
    <defs>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f8fa" /><stop offset="1" stopColor="#e3ecf0" /></linearGradient>
      <linearGradient id={`${id}-food`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6f6fc" /><stop offset="1" stopColor="#cfeaf6" /></linearGradient>
      <linearGradient id={`${id}-ice`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#cfe6f0" /></linearGradient>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
      <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6" stroke="#c3d3db" strokeWidth="1.2" /></pattern>
    </defs>

    {/* outside air */}
    <text x="40" y="30" className="pd-label pd-muted">{t('safety.labels.outside')}</text>
    <text x="600" y="30" textAnchor="end" className="pd-label pd-muted">{t('safety.labels.outside')}</text>

    {/* insulated body + lid */}
    <rect x="92" y="112" width="456" height="252" rx="22" fill={`url(#${id}-hatch)`} stroke="#9fb6c2" strokeWidth="1.5" />
    <rect x="108" y="124" width="424" height="226" rx="12" fill={`url(#${id}-food)`} stroke="#a9c6d3" />
    <rect x="80" y="70" width="480" height="44" rx="12" fill={`url(#${id}-wall)`} stroke="#9fb6c2" strokeWidth="1.5" />

    {/* goods */}
    {[150, 214, 400, 462].map((x, i) => <rect key={x} x={x} y={i % 2 ? 300 : 290} width="50" height={i % 2 ? 36 : 46} rx="5" fill="#fff" stroke="#b9d0da" />)}
    <text x="320" y="377" textAnchor="middle" className="pd-label pd-small pd-muted">{t('airflow.storage')}</text>

    {/* dry-ice chamber: sealed off from the food air, vented upward */}
    <rect x="262" y="98" width="116" height="52" rx="8" fill="#123445" />
    {[0, 1, 2, 3].map(i => <rect key={i} x={274 + i * 25} y={112 + (i % 2) * 6} width="18" height="18" rx="3" fill={`url(#${id}-ice)`} opacity=".92" />)}
    <text x="320" y="92" textAnchor="middle" className="pd-label pd-small">{t('safety.labels.chamber')}</text>
    {/* fins + fan */}
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={268 + i * 10.6} y="152" width="4" height="18" rx="1" fill="#8fa6b1" />)}
    <g transform="translate(320 188)">
      <rect x="-34" y="-10" width="68" height="20" rx="5" fill="#244757" />
      <g className={fans ? 'pd-fan is-on' : 'pd-fan'}><ellipse rx="22" ry="5" fill="#6aa6bf" /><rect x="-2" y="-5" width="4" height="10" fill="#d8eef7" /></g>
    </g>

    {/* electronics bay in the warm side of the lid */}
    <rect x="452" y="80" width="88" height="28" rx="6" fill="#fff" stroke="#9fb6c2" />
    <text x="496" y="99" textAnchor="middle" className="pd-label pd-small">{t('safety.labels.bay')}</text>
    <path d={WIRE} className="pd-wire" />
    <circle cx="508" cy="306" r="5" fill="#fff" stroke="#7e95a2" strokeWidth="1.5" />
    {Array.from({ length: 2 }, (_, i) => <circle key={i} r="2.6" fill="#55707e"><animateMotion dur="2.4s" begin={`${-i * 1.2}s`} repeatCount="indefinite" path={WIRE} keyPoints="1;0" keyTimes="0;1" calcMode="linear" /></circle>)}

    {/* food-air loops: cold supply (blue) and warm return (orange) */}
    {STREAMS.map(({ path, kind, dots, dur }) => <g key={path} className={`pd-loop ${kind} ${fans ? '' : 'is-idle'}`} opacity={filter !== 'all' && filter !== kind ? .12 : 1}>
      <path d={path} className="pd-loop-glow" filter={`url(#${id}-glow)`} />
      <path d={path} className="pd-loop-line" />
      {fans && Array.from({ length: dots }, (_, i) => <circle key={i} r="3.4" fill={kind === 'cold' ? '#1d98d0' : '#e2773a'}><animateMotion dur={`${dur}s`} begin={`${-i * dur / dots}s`} repeatCount="indefinite" path={path} /></circle>)}
    </g>)}
    <text x="150" y="262" className="pd-label pd-cold-label">{t('airflow.coldShort')}</text>
    <text x="490" y="262" textAnchor="end" className="pd-label pd-cold-label">{t('airflow.coldShort')}</text>
    <g opacity={filter === 'cold' ? .2 : 1}><rect x="294" y="286" width="52" height="20" rx="10" fill="#fff" stroke="#f1c3a3" /><text x="320" y="300" textAnchor="middle" className="pd-label pd-warm-label">{t('airflow.warmShort')}</text></g>
    <text x="332" y="172" className="pd-label pd-small pd-muted" textAnchor="start" transform="translate(48 0)">{t('airflow.fins')}</text>

    {/* CO₂ ducts: primary (right) + backup (left), both normally open */}
    <path d={CO2_PRIMARY} className={`pd-duct ${primaryOpen ? '' : 'is-blocked'}`} />
    <path d={CO2_BACKUP} className="pd-duct" />
    <path d={CO2_PRIMARY} className={`pd-co2 ${primaryOpen ? 'is-live' : 'is-dead'}`} />
    <path d={CO2_BACKUP} className={`pd-co2 ${primaryOpen ? 'is-soft' : 'is-live'}`} />
    {puffs(co2Live, 7, 3.2, true)}
    {primaryOpen && puffs(CO2_BACKUP, 3, 4.2, false)}
    <text x="470" y="38" textAnchor="middle" className="pd-label pd-co2-label">{t('safety.labels.primary')}</text>
    <text x="170" y="38" textAnchor="middle" className="pd-label pd-co2-label">{t('safety.labels.backup')}</text>
    {!primaryOpen && <g transform="translate(560 46)"><g className="pd-block"><circle r="12" fill="#fff" stroke="#d64f2a" strokeWidth="2" /><path d="M-5 -5 5 5M5 -5-5 5" stroke="#d64f2a" strokeWidth="2.4" strokeLinecap="round" /></g></g>}
    <path d="M598 40 608 46 598 52" fill="none" stroke={primaryOpen ? '#e2773a' : '#c3ccd1'} strokeWidth="2" strokeLinecap="round" />
    <path d="M42 40 32 46 42 52" fill="none" stroke="#e2773a" strokeWidth="2" strokeLinecap="round" opacity={primaryOpen ? .55 : 1} />

    {!fans && <g transform="translate(320 232)"><rect x="-58" y="-13" width="116" height="26" rx="13" fill="#fff" stroke="#c3d3db" /><text textAnchor="middle" y="4" className="pd-label pd-small pd-muted">{t('safety.scenarios.fans')}</text></g>}
  </svg>
}

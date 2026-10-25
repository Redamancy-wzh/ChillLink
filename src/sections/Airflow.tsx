import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '../hooks/useReducedMotion'
import AirflowDiagram from '../components/AirflowDiagram'
import type { AirflowOptions, FanMode, FlowFilter } from '../three/airflowPaths'
import '../styles/airflow.css'

const Airflow3D = lazy(() => import('../components/Airflow3D'))
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}
export default function Airflow() {
  const { t } = useTranslation()
  const reducedMotion = useReducedMotion()
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [filter, setFilter] = useState<FlowFilter>('all')
  const fanMode: FanMode = 'single'
  const [reset, setReset] = useState(0)
  const [loadScene, setLoadScene] = useState(false)
  const [error, setError] = useState(false)
  const section = useRef<HTMLElement>(null)
  const options: AirflowOptions = useMemo(() => ({ playing, speed, filter, reset, reducedMotion, fanMode }), [playing, speed, filter, reset, reducedMotion, fanMode])
  useEffect(() => {
    const anchorFrame = window.location.hash === '#airflow'
      ? requestAnimationFrame(() => section.current?.scrollIntoView({ block: 'start' })) : 0
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { setLoadScene(true); observer.disconnect() } }, { rootMargin: '250px' })
    if (section.current) observer.observe(section.current)
    return () => { observer.disconnect(); cancelAnimationFrame(anchorFrame) }
  }, [])
  const fallback = <div className="airflow-fallback"><AirflowDiagram options={options} /><p role="status">{t('airflow.fallback')}</p></div>
  return <section id="airflow" className="airflow-section" ref={section}>
    <div className="content-wrap">
      <div className="airflow-heading">
        <div><p className="eyebrow">02 / FOLLOW THE AIR</p><h2>{t('airflow.title')}</h2></div>
        <p>{t('airflow.body')}</p>
      </div>
      <div className="airflow-toolbar">
        <div className="airflow-filters" role="group" aria-label={t('airflow.filterLabel')}>
          {(['all', 'cold', 'warm'] as const).map(value => <button type="button" key={value} aria-pressed={value === filter} onClick={() => setFilter(value)}><i className={`airflow-swatch ${value}`} />{t(`airflow.${value}`)}</button>)}
        </div>
        <div className="airflow-playback">
          <label><span>{t('airflow.speed')}</span><input aria-label={t('airflow.speed')} type="range" min=".5" max="2" step=".25" value={speed} disabled={reducedMotion} onChange={e => setSpeed(Number(e.target.value))} /><output>{speed.toFixed(2).replace(/0$/, '')}×</output></label>
          <button type="button" className="airflow-play" disabled={reducedMotion} aria-label={t(playing ? 'airflow.pause' : 'airflow.play')} onClick={() => setPlaying(value => !value)}>
            <svg viewBox="0 0 20 20" aria-hidden="true">{playing && !reducedMotion ? <path d="M7 5v10M13 5v10" fill="none" stroke="currentColor" strokeWidth="2" /> : <path d="m7 4 9 6-9 6z" fill="currentColor" />}</svg>{t(reducedMotion ? 'airflow.static' : playing ? 'airflow.pause' : 'airflow.play')}
          </button>
        </div>
      </div>
      <div className="airflow-panels">
        <div className="airflow-volume-panel">
          <div className="airflow-panel-title"><div><span className="airflow-live-dot" /><span>3D</span><h3>{t('airflow.volume')}</h3></div><button className="airflow-reset" type="button" onClick={() => setReset(value => value + 1)} aria-label={t('airflow.reset')} title={t('airflow.reset')}>↺</button></div>
          <div className="airflow-volume-stage">
            <div className="airflow-stage-glow" />
            {error ? fallback : loadScene ? <SceneBoundary fallback={fallback}><Suspense fallback={<p className="airflow-loading" role="status">{t('airflow.loading')}</p>}><Airflow3D options={options} onError={() => setError(true)} /></Suspense></SceneBoundary> : <p className="airflow-loading">{t('airflow.loading')}</p>}
            {!error && <span className="airflow-cutaway-badge">{t('airflow.cutaway')}</span>}
          </div>
          <p className="airflow-orbit-hint"><span className="viewer-hint-desktop">{t('airflow.orbit')}</span><span className="viewer-hint-touch">{t('airflow.touch')}</span></p>
        </div>
        <div className="airflow-plane-panel">
          <div className="airflow-panel-title"><div><span>2D</span><h3>{t('airflow.plane')}</h3></div><span className="airflow-section-tag">A — A</span></div>
          <AirflowDiagram options={options} />
          <div className="airflow-phase-key"><span><i className="airflow-swatch cold" />{t('airflow.cold')}</span><span><i className="airflow-swatch warm" />{t('airflow.warm')}</span></div>
        </div>
      </div>
      <div className="airflow-sequence">
        {['return', 'exchange', 'supply'].map((key, index) => <article key={key} className={`airflow-step ${key}`}><span className="airflow-step-number">0{index + 1}</span><div><h3>{t(`airflow.${key}Title`)}</h3><p>{t(`airflow.${key}Body`)}</p></div><span className="airflow-step-arrow" aria-hidden="true">{index < 2 ? '↓' : '↻'}</span></article>)}
      </div>
      <div className="airflow-footnote"><p>{t('airflow.note')}</p><a href="#safety">{t('airflow.safetyLink')} <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>
}

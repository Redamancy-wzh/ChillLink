import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { SceneOptions, ViewPreset } from '../three/AssemblyScene'

export default function ProductViewer({ variant = 'hero' }: { variant?: 'hero' | 'studio' }) {
  const { t } = useTranslation()
  const dark = variant === 'studio'
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<ReturnType<typeof import('../three/AssemblyScene').createAssemblyScene>>()
  const reducedMotion = useReducedMotion()
  // The studio stage opens on the lid-up view; the hero keeps the closed product shot.
  const defaultOpening = dark ? 1 : 0
  const [opening, setOpening] = useState(defaultOpening)
  const [rotating, setRotating] = useState(true)
  const [preset, setPreset] = useState<ViewPreset>('perspective')
  const [reset, setReset] = useState(0)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [progress, setProgress] = useState(0)
  const options = useRef<SceneOptions>({ opening, rotating, reducedMotion, preset, reset })
  options.current = { opening, rotating, reducedMotion, preset, reset }

  useEffect(() => {
    const element = host.current
    if (!element) return
    let cancelled = false
    let started = false
    const observer = new IntersectionObserver(async entries => {
      if (!entries[0].isIntersecting || started) return
      started = true
      observer.disconnect()
      try {
        const { createAssemblyScene } = await import('../three/AssemblyScene')
        if (cancelled) return
        scene.current = createAssemblyScene(element, () => options.current, {
          ready: () => { if (!cancelled) setStatus('ready') },
          error: () => { if (!cancelled) setStatus('error') },
          progress: value => { if (!cancelled) setProgress(value) },
          interact: () => {},
        }, dark)
      } catch { if (!cancelled) setStatus('error') }
    }, { rootMargin: '300px' })
    observer.observe(element)
    return () => { cancelled = true; observer.disconnect(); scene.current?.dispose(); scene.current = undefined }
  }, [dark])

  useEffect(() => { scene.current?.update() }, [opening, rotating, reducedMotion, preset, reset])
  const view = (value: ViewPreset) => {
    setPreset(value); setReset(r => r + 1)
    if (value === 'interior') setOpening(1)
    if (value === 'cooling') setOpening(1)
    if (value === 'top') setOpening(0)
    // The OLED panel sits on top of the lid, so it is only readable with the lid shut.
    if (value === 'control') setOpening(0)
  }
  const ready = status === 'ready'
  return (
    <div className={`product-viewer product-viewer--${variant}`}>
      <div className="viewer-topline">
        <span className="viewer-live"><i />{t('viewer.live')}</span>
        <span className="viewer-edition">33 L / CONTROL BOX ASSEMBLY</span>
      </div>
      <div className="viewer-stage" role="img" aria-label={t('viewer.canvas')}>
        <div className="viewer-halo" />
        <div className="viewer-floor" />
        <div ref={host} className={`viewer-canvas ${ready ? 'is-ready' : ''}`} />
        {status === 'loading' && <div className="viewer-loading" role="status"><span className="viewer-loader" /><span>{t('model.loading')}<small>{progress > 0 ? `${progress}%` : 'ChillLink'}</small></span></div>}
        {status === 'error' && <div className="viewer-fallback" role="status"><img src={`${import.meta.env.BASE_URL}img/product/control-box.webp`} alt={t('viewer.fallbackAlt')} /><p>{t('viewer.fallback')}</p></div>}
        <div className="viewer-corner corner-tl" /><div className="viewer-corner corner-br" />
        <div className="viewer-axis" aria-hidden="true"><span>Y</span><i /><b>X</b></div>
        <div className="viewer-instruction"><span className="viewer-hint-desktop">{t('viewer.hint')}</span><span className="viewer-hint-touch">{t('viewer.touchHint')}</span></div>
      </div>
      <div className="viewer-controls">
        {dark && <div className="viewer-presets" aria-label={t('viewer.views')}>
          {(['perspective', 'top', 'interior', 'control', 'cooling'] as ViewPreset[]).map(value => <button disabled={!ready} type="button" key={value} aria-pressed={preset === value} onClick={() => view(value)}>{t(`viewer.${value}`)}</button>)}
        </div>}
        <div className="viewer-primary-controls">
          <button type="button" className="viewer-toggle" disabled={!ready} onClick={() => { setOpening(opening > .5 ? 0 : 1) }} aria-label={t(opening > .5 ? 'viewer.close' : 'viewer.open')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 11 8 4 8-4M4 11v7l8 4 8-4v-7M12 15v7M4 8l8-6 8 6-8 4-8-4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            {t(opening > .5 ? 'viewer.close' : 'viewer.open')}
          </button>
          <label className="viewer-slider"><span>{t('viewer.angle')}<b>{Math.round(opening * 105)}°</b></span><input type="range" min="0" max="105" step="1" value={Math.round(opening * 105)} disabled={!ready} aria-label={t('viewer.angle')} style={{ '--range-progress': `${opening * 100}%` } as CSSProperties} onChange={event => { setOpening(Number(event.target.value) / 105) }} /></label>
          <button type="button" className="viewer-icon-button" disabled={!ready || reducedMotion} aria-pressed={rotating} aria-label={t(rotating ? 'viewer.pause' : 'viewer.rotate')} title={t(rotating ? 'viewer.pause' : 'viewer.rotate')} onClick={() => setRotating(value => !value)}>
            {rotating ? <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2" /></svg> : <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 8a8 8 0 1 0 1 7M19 3v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>
          <button type="button" className="viewer-icon-button" disabled={!ready} aria-label={t('viewer.reset')} title={t('viewer.reset')} onClick={() => { setOpening(defaultOpening); setRotating(true); view('perspective') }}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M9 9h6v6H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg></button>
        </div>
      </div>
    </div>
  )
}

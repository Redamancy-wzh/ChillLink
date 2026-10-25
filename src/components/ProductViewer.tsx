import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '../hooks/useReducedMotion'
import type { SceneOptions, ViewPreset } from '../three/AssemblyScene'
import { CARGO_CATEGORIES, CARGO_ITEMS, CARGO_LAYOUTS, CARGO_SETPOINT, categoryItems, type CargoCategory, type CargoId } from '../three/cargo'
import NeuToggle from './NeuToggle'

const CATEGORY_ICONS: Record<CargoCategory, JSX.Element> = {
  dining: <path d="M4 15h16M5 15c0-4 3-7 7-7s7 3 7 7M12 8V6M3 18h18" />,
  drinks: <path d="M9 3h6M10 3v4l-2 3v10h8V10l-2-3V3M8 13h8" />,
  dessert: <path d="M7 11h10l-2 10H9L7 11ZM6 11a6 6 0 0 1 12 0M12 5V3" />,
  medical: <path d="M8 3h8v4H8zM7 7h10v14H7zM12 11v6M9 14h6" />,
}

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
  const [category, setCategory] = useState<CargoCategory | null>(null)
  const [hidden, setHidden] = useState<CargoId[]>([])
  const [cargoLoading, setCargoLoading] = useState(false)
  // A new object only when the request changes, so the scene can compare by identity.
  const cargo = useMemo(() => dark ? { category, hidden } : undefined, [dark, category, hidden])
  const options = useRef<SceneOptions>({ opening, rotating, reducedMotion, preset, reset, cargo })
  options.current = { opening, rotating, reducedMotion, preset, reset, cargo }

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
          cargoLoading: value => { if (!cancelled) setCargoLoading(value) },
        }, dark)
      } catch { if (!cancelled) setStatus('error') }
    }, { rootMargin: '300px' })
    observer.observe(element)
    return () => { cancelled = true; observer.disconnect(); scene.current?.dispose(); scene.current = undefined }
  }, [dark])

  useEffect(() => { scene.current?.update() }, [opening, rotating, reducedMotion, preset, reset, cargo])
  const view = (value: ViewPreset) => {
    setPreset(value); setReset(r => r + 1)
    if (value === 'interior' || value === 'cooling' || value === 'cargo') setOpening(1)
    if (value === 'top') setOpening(0)
    // The OLED panel sits on top of the lid, so it is only readable with the lid shut.
    if (value === 'control') setOpening(0)
  }
  const chooseCategory = (value: CargoCategory) => {
    if (value === category) { setCategory(null); setHidden([]); view('perspective'); return }
    setCategory(value); setHidden([])
    setRotating(false)
    view('cargo')
  }
  const toggleItem = (id: CargoId) => setHidden(list => list.includes(id) ? list.filter(item => item !== id) : [...list, id])
  const ready = status === 'ready'
  const lidOpen = opening > .5
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
        {dark && category && <div className="cargo-hud" aria-live="polite">
          <span>{t(`cargo.categories.${category}.name`)}</span>
          <strong>{cargoLoading ? t('cargo.loading') : t('cargo.setpoint', { temp: CARGO_SETPOINT[category] > 0 ? `+${CARGO_SETPOINT[category]}` : CARGO_SETPOINT[category] })}</strong>
          <small>{t(`cargo.categories.${category}.note`)}</small>
        </div>}
        <div className="viewer-axis" aria-hidden="true"><span>Y</span><i /><b>X</b></div>
        <div className="viewer-instruction"><span className="viewer-hint-desktop">{t('viewer.hint')}</span><span className="viewer-hint-touch">{t('viewer.touchHint')}</span></div>
      </div>
      <div className="viewer-controls">
        {dark && <div className="cargo-panel">
          <div className="cargo-panel-head"><span className="eyebrow">{t('cargo.eyebrow')}</span><p>{t('cargo.hint')}</p></div>
          <div className="cargo-categories" role="group" aria-label={t('cargo.eyebrow')}>
            {CARGO_CATEGORIES.map(value => <button key={value} type="button" className="neu-chip" disabled={!ready} aria-pressed={category === value} onClick={() => chooseCategory(value)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{CATEGORY_ICONS[value]}</svg>
              <span>{t(`cargo.categories.${value}.name`)}</span>
            </button>)}
          </div>
          {category && <div className="cargo-items" role="group" aria-label={t('cargo.itemsLabel')}>
            {categoryItems(category).map(id => {
              const count = CARGO_LAYOUTS[category][id]?.length ?? 0
              const on = !hidden.includes(id)
              const [w, d, h] = CARGO_ITEMS[id].size
              return <button key={id} type="button" className="cargo-item" aria-pressed={on} onClick={() => toggleItem(id)} title={`${Math.round(w)} × ${Math.round(d)} × ${Math.round(h)} mm`}>
                <i aria-hidden="true" />{t(`cargo.items.${id}`)}<b>× {count}</b>
              </button>
            })}
          </div>}
        </div>}
        {dark && <div className="viewer-presets" aria-label={t('viewer.views')}>
          {(['perspective', 'top', 'interior', 'control', 'cooling'] as ViewPreset[]).map(value => <button disabled={!ready} type="button" key={value} aria-pressed={preset === value} onClick={() => view(value)}>{t(`viewer.${value}`)}</button>)}
        </div>}
        <div className={`viewer-primary-controls ${dark ? 'viewer-primary-controls--neu' : ''}`}>
          {dark
            ? <NeuToggle checked={lidOpen} disabled={!ready} onChange={value => setOpening(value ? 1 : 0)} label={t('viewer.lid')} caption={t(lidOpen ? 'viewer.lidOpen' : 'viewer.lidClosed')} />
            : <button type="button" className="viewer-toggle" disabled={!ready} onClick={() => { setOpening(lidOpen ? 0 : 1) }} aria-label={t(lidOpen ? 'viewer.close' : 'viewer.open')}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m4 11 8 4 8-4M4 11v7l8 4 8-4v-7M12 15v7M4 8l8-6 8 6-8 4-8-4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
              {t(lidOpen ? 'viewer.close' : 'viewer.open')}
            </button>}
          <label className="viewer-slider"><span>{t('viewer.angle')}<b>{Math.round(opening * 105)}°</b></span><input type="range" min="0" max="105" step="1" value={Math.round(opening * 105)} disabled={!ready} aria-label={t('viewer.angle')} style={{ '--range-progress': `${opening * 100}%` } as CSSProperties} onChange={event => { setOpening(Number(event.target.value) / 105) }} /></label>
          {dark
            ? <NeuToggle checked={rotating} disabled={!ready || reducedMotion} onChange={setRotating} label={t('viewer.rotate')} caption={t('viewer.autoRotate')} />
            : <button type="button" className="viewer-icon-button" disabled={!ready || reducedMotion} aria-pressed={rotating} aria-label={t(rotating ? 'viewer.pause' : 'viewer.rotate')} title={t(rotating ? 'viewer.pause' : 'viewer.rotate')} onClick={() => setRotating(value => !value)}>
              {rotating ? <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5v14M15 5v14" stroke="currentColor" strokeWidth="2" /></svg> : <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 8a8 8 0 1 0 1 7M19 3v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>}
          <button type="button" className="viewer-icon-button" disabled={!ready} aria-label={t('viewer.reset')} title={t('viewer.reset')} onClick={() => { setOpening(defaultOpening); setRotating(true); setCategory(null); setHidden([]); view('perspective') }}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M9 9h6v6H9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg></button>
        </div>
      </div>
    </div>
  )
}

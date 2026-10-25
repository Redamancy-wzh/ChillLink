import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { prefersReducedMotion, useReducedMotion } from '../hooks/useReducedMotion'
import NeuToggle from '../components/NeuToggle'
type Scene = { image: string; title: string; text: string; tag: string }
export default function SceneCarousel({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation()
  const scenes = t('sceneCarousel.items', { returnObjects: true }) as Scene[]
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{x:number; left:number} | null>(null)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [interacting, setInteracting] = useState(false)
  const reduced = useReducedMotion()
  const move = (direction: number) => {
    const el = ref.current
    if (!el) return
    const step = (el.querySelector('article')?.getBoundingClientRect().width || 320) + 16
    const max = el.scrollWidth - el.clientWidth
    const next = direction > 0 && el.scrollLeft >= max - 4 ? 0 : direction < 0 && el.scrollLeft <= 4 ? max : el.scrollLeft + direction * step
    el.scrollTo({left: next, behavior: reduced ? 'auto' : 'smooth'})
  }
  useEffect(() => {
    if (!playing || interacting) return
    const timer = window.setInterval(() => { if (!document.hidden) move(1) }, 4200)
    return () => window.clearInterval(timer)
  }, [playing, interacting, reduced])
  const heading = embedded
    ? <div className="scene-subheading"><div><p className="eyebrow">{t('sceneCarousel.eyebrow')}</p><h3>{t('sceneCarousel.title')}</h3></div><p>{t('sceneCarousel.body')}</p></div>
    : <div className="section-heading section-heading-wide"><div><p className="eyebrow">{t('sceneCarousel.eyebrow')}</p><h2>{t('sceneCarousel.title')}</h2></div><p className="section-heading-copy">{t('sceneCarousel.body')}</p></div>
  const body = <>
      {heading}
      <div className="scene-carousel-viewport" ref={ref} tabIndex={0} aria-label={t('sceneCarousel.aria')}
        onMouseEnter={()=>setInteracting(true)} onMouseLeave={()=>setInteracting(false)}
        onFocus={()=>setInteracting(true)} onBlur={()=>setInteracting(false)}
        onKeyDown={e=>{ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)} }}
        onPointerDown={e=>{ if(e.pointerType!=='mouse')return; drag.current={x:e.clientX,left:e.currentTarget.scrollLeft};e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.classList.add('is-dragging') }}
        onPointerMove={e=>{if(drag.current)e.currentTarget.scrollLeft=drag.current.left-(e.clientX-drag.current.x)}}
        onPointerUp={e=>{drag.current=null;e.currentTarget.classList.remove('is-dragging')}}
        onPointerCancel={e=>{drag.current=null;e.currentTarget.classList.remove('is-dragging')}}>
        <div className="scene-carousel-track">{scenes.map(scene => <article className="scene-card" key={scene.title}><img src={scene.image} alt={scene.title} loading="lazy" draggable={false}/><div className="scene-card-content"><span>{scene.tag}</span><h3>{scene.title}</h3><p>{scene.text}</p></div></article>)}</div>
      </div>
      <div className="scene-carousel-hint"><span>{t('sceneCarousel.hint')}</span><button onClick={()=>move(-1)} aria-label={t('sceneCarousel.previous')}>←</button><NeuToggle size="sm" checked={playing} onChange={setPlaying} label={t('sceneCarousel.play')} caption={t('sceneCarousel.play')} /><button onClick={()=>move(1)} aria-label={t('sceneCarousel.next')}>→</button></div>
  </>
  return embedded
    ? <div id="scene-carousel" className="scene-carousel-embedded">{body}</div>
    : <section id="scene-carousel" className="scene-carousel-section"><div className="content-wrap">{body}</div></section>
}

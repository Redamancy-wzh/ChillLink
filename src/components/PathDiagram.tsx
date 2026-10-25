import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

type Scenario = 'normal' | 'fans' | 'blocked'

const SAMPLES = 240
// 原来每帧 +0.0035（按 60 fps 计），改为按时间推进，保持同样速度。
const SPEED_PER_SEC = 0.0035 * 60

/** 把路径预采样成点表，动画时只查表，不再每帧调用 getPointAtLength（会强制 SVG 布局）。 */
function sample(path: SVGPathElement | null) {
  if (!path) return []
  const len = path.getTotalLength()
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i <= SAMPLES; i++) { const p = path.getPointAtLength((i / SAMPLES) * len); pts.push({ x: p.x, y: p.y }) }
  return pts
}

function place(dot: SVGCircleElement | null, pts: { x: number; y: number }[], u: number) {
  if (!dot || pts.length < 2) return
  const f = u * SAMPLES
  const i = Math.floor(f), k = f - i
  const a = pts[i], b = pts[Math.min(i + 1, SAMPLES)]
  dot.setAttribute('cx', (a.x + (b.x - a.x) * k).toFixed(2))
  dot.setAttribute('cy', (a.y + (b.y - a.y) * k).toFixed(2))
}

/**
 * Cross-section diagram redrawn from the V1 airflow concept, not the render.
 * Food-air loop (ice), CO₂ exhaust (abyss), electrical wiring (ink-30).
 */
export default function PathDiagram({ scenario }: { scenario: Scenario }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const foodRef = useRef<SVGPathElement>(null)
  const foodDots = useRef<(SVGCircleElement | null)[]>([])
  const co2Ref = useRef<SVGPathElement>(null)
  const co2Dots = useRef<(SVGCircleElement | null)[]>([])
  const phase = useRef(0)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const foodPts = sample(foodRef.current)
    const co2Pts = sample(co2Ref.current)
    const still = scenario === 'fans' || prefersReducedMotion()
    let frame = 0, last = 0, visible = false

    const draw = () => {
      const t = phase.current
      foodDots.current.forEach((dot, i) => place(dot, foodPts, (t + i / 4) % 1))
      co2Dots.current.forEach((dot, i) => place(dot, co2Pts, (t + i / 3) % 1))
    }
    const loop = (now: number) => {
      if (last) phase.current = (phase.current + Math.min(now - last, 100) / 1000 * SPEED_PER_SEC) % 1
      last = now
      draw()
      frame = requestAnimationFrame(loop)
    }
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0 }
    const start = () => { if (!frame && visible && !still && !document.hidden) frame = requestAnimationFrame(loop) }

    draw()
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else stop() })
    observer.observe(svg)
    const onVisibility = () => { if (document.hidden) stop(); else start() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => { stop(); observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility) }
  }, [scenario])

  return (
    <svg ref={svgRef} viewBox="0 0 360 240" className="w-full h-auto" role="img">
      {/* Box outline */}
      <rect x="20" y="60" width="320" height="160" fill="none" stroke="#0C1E2B" strokeOpacity="0.2" />
      <line x1="20" y1="96" x2="340" y2="96" stroke="#0C1E2B" strokeOpacity="0.2" />

      {/* Food zone */}
      <rect x="30" y="130" width="200" height="80" fill="#6CC9EE" fillOpacity="0.06" />

      {/* Dry-ice chamber */}
      <rect x="120" y="70" width="110" height="40" fill="#6CC9EE" fillOpacity="0.1" stroke="#0C1E2B" strokeOpacity="0.2" />

      {/* Food-air loop */}
      <path
        ref={foodRef}
        d="M 130 150 L 240 150 Q 260 150 260 170 L 260 190 Q 260 205 240 205 L 60 205 Q 40 205 40 185 L 40 150"
        fill="none"
        stroke="#6CC9EE"
        strokeWidth="1.5"
        strokeDasharray="0"
        opacity={scenario === 'fans' ? 0.25 : 1}
      />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} ref={(el) => { foodDots.current[i] = el }} r="3" fill="#6CC9EE" opacity={scenario === 'fans' ? 0.15 : 0.9} />
      ))}

      {/* CO₂ exhaust: primary + backup */}
      <path
        ref={co2Ref}
        d={scenario === 'blocked' ? 'M 175 70 L 175 30 L 250 30' : 'M 175 70 L 175 30 L 120 30'}
        fill="none"
        stroke={scenario === 'blocked' ? '#FF7A2F' : '#0C1E2B'}
        strokeWidth="1.5"
        strokeDasharray={scenario === 'blocked' ? '4 4' : '0'}
        strokeOpacity="0.5"
      />
      {[0, 1, 2].map((i) => (
        <circle key={i} ref={(el) => { co2Dots.current[i] = el }} r="2.5" fill="#0C1E2B" opacity="0.5" />
      ))}
      {scenario === 'blocked' && (
        <path d="M 175 70 L 175 30 L 300 30" fill="none" stroke="#0C1E2B" strokeWidth="1.5" strokeOpacity="0.5" />
      )}

      {/* Electrical */}
      <path d="M 250 90 L 300 90 L 300 130" fill="none" stroke="#8FA3B0" strokeWidth="1.5" />
    </svg>
  )
}

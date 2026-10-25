import { useTranslation } from 'react-i18next'
import { useRef, useState, useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import expData from '../data/experiments.json'

export default function Roadmap() {
  const { t } = useTranslation()
  const steps = t('roadmap.steps', { returnObjects: true }) as Array<{
    title: string
    en: string
    body: string
  }>
  const budget = t('roadmap.budget', { returnObjects: true }) as any
  const chart = t('roadmap.chart', { returnObjects: true }) as any

  return (
    <section id="roadmap" className="max-w-page mx-auto px-6 py-24 space-y-16">
      <div className="space-y-6">
        <h2>{t('roadmap.title')}</h2>
      </div>

      <div className="relative">
        <div className="absolute top-6 left-0 right-0 h-px bg-line-2" />
        <div className="grid md:grid-cols-4 gap-8 relative">
          {steps.map((step, i) => (
            <div key={i} className="space-y-3">
              <div className="relative w-12 h-12 rounded-full bg-cryo text-snow flex items-center justify-center font-semibold text-lg">
                {i + 1}
              </div>
              <div className="font-semibold">{step.title}</div>
              <div className="text-xs text-ink-60 font-mono uppercase tracking-wide">{step.en}</div>
              <p className="text-sm text-ink-60">{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">{chart.title}</h3>
        <ExperimentChart />
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">{budget.title}</h3>
        <BudgetBar />
        <p className="caption">{budget.note}</p>
      </div>
    </section>
  )
}

function ExperimentChart() {
  const { t, i18n } = useTranslation()
  const chart = t('roadmap.chart', { returnObjects: true }) as any
  const isEmpty = expData.groups.every((g) => g.series.length === 0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const pad = 60
    const xMin = 0
    const xMax = 90
    const yMin = -25
    const yMax = 10

    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = '#8FA3B0'
    ctx.lineWidth = 0.5
    for (let t = 0; t <= 90; t += 15) {
      const x = pad + ((t - xMin) / (xMax - xMin)) * (w - 2 * pad)
      ctx.beginPath()
      ctx.moveTo(x, pad)
      ctx.lineTo(x, h - pad)
      ctx.stroke()
    }
    for (let T = -20; T <= 10; T += 5) {
      const y = pad + ((yMax - T) / (yMax - yMin)) * (h - 2 * pad)
      ctx.beginPath()
      ctx.moveTo(pad, y)
      ctx.lineTo(w - pad, y)
      ctx.stroke()
    }

    ctx.strokeStyle = '#0C1E2B'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad, h - pad)
    ctx.lineTo(w - pad, h - pad)
    ctx.lineTo(w - pad, pad)
    ctx.stroke()

    ctx.fillStyle = '#4A5F6E'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    for (let t = 0; t <= 90; t += 15) {
      const x = pad + ((t - xMin) / (xMax - xMin)) * (w - 2 * pad)
      ctx.fillText(String(t), x, h - pad + 20)
    }
    ctx.textAlign = 'right'
    for (let T = -20; T <= 10; T += 5) {
      const y = pad + ((yMax - T) / (yMax - yMin)) * (h - 2 * pad)
      ctx.fillText(String(T), pad - 10, y + 4)
    }

    if (isEmpty) {
      ctx.fillStyle = '#8FA3B0'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(chart.empty, w / 2, h / 2 - 10)
      ctx.fillText(chart.illustrative, w / 2, h / 2 + 10)

      // Illustrative ghost lines
      const colors = ['#6CC9EE', '#FF7A2F', '#1478C8']
      expData.groups.forEach((_, gi) => {
        ctx.strokeStyle = colors[gi]
        ctx.globalAlpha = 0.2
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        for (let t = 0; t <= 90; t += 5) {
          const T = gi === 0 ? 2 - t * 0.02 : gi === 1 ? -10 - t * 0.08 : -8 - t * 0.03
          const x = pad + ((t - xMin) / (xMax - xMin)) * (w - 2 * pad)
          const y = pad + ((yMax - T) / (yMax - yMin)) * (h - 2 * pad)
          if (t === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      })
    } else {
      // Real data (not implemented yet, structure is ready)
    }
  }, [isEmpty, chart, i18n.language])

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} width={720} height={400} className="w-full h-auto border border-line rounded" />
      <div className="flex justify-between caption">
        <span>{chart.x}</span>
        <span>{chart.y}</span>
      </div>
    </div>
  )
}

function BudgetBar() {
  const { t } = useTranslation()
  const budget = t('roadmap.budget', { returnObjects: true }) as any
  const { ref, hasEntered } = useInView(0.3)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!hasEntered) return
    let start = 0
    const duration = 1200
    const step = (ts: number) => {
      if (start === 0) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setProgress(p)
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [hasEntered])

  const colors = ['#6CC9EE', '#1478C8', '#8FA3B0', '#4A5F6E', '#FF7A2F']

  return (
    <div ref={ref} className="space-y-6">
      <div className="relative h-12 bg-line rounded-lg overflow-hidden">
        {budget.categories.map((cat: any, i: number) => {
          const prevSum = budget.categories.slice(0, i).reduce((s: number, c: any) => s + c.amount, 0)
          const widthPct = (cat.amount / 940) * 100
          const leftPct = (prevSum / 940) * 100
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 transition-all duration-1000 ease-out"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct * progress}%`,
                backgroundColor: colors[i],
              }}
            />
          )
        })}
      </div>
      <div className="grid md:grid-cols-5 gap-6">
        {budget.categories.map((cat: any, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colors[i] }} />
              <div className="text-sm font-medium">{cat.name}</div>
            </div>
            <div className="text-xs text-ink-60">{cat.items}</div>
            <div className="font-mono font-semibold">¥{cat.amount}</div>
          </div>
        ))}
      </div>
      <div className="text-right font-mono text-xl font-semibold border-t border-line pt-4">
        {budget.total}: ¥940
      </div>
    </div>
  )
}

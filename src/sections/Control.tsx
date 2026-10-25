import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { useEffect, useRef, useState } from 'react'
import { createPID, resetPID, updatePID } from '../sim/pid'
import { thermalStep } from '../sim/thermal'

export default function Control() {
  const { t } = useTranslation()
  const targetTemp = useAppStore((s) => s.targetTemp)
  const draftTemp = useAppStore((s) => s.draftTemp)
  const setTargetTemp = useAppStore((s) => s.setTargetTemp)
  const setDraftTemp = useAppStore((s) => s.setDraftTemp)
  const pwm = useAppStore((s) => s.pwm)
  const avgTemp = useAppStore((s) => s.avgTemp)

  const [editing, setEditing] = useState(false)
  const [confirmedAt, setConfirmedAt] = useState(0)

  const pidRef = useRef(createPID())
  const timeRef = useRef(0)
  const sectionRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  // 只在本区块（含上方的 Model OLED 屏附近）可见、且标签页在前台时运行模拟，
  // 避免滚动页面其他部分时每 0.5 s 触发一次全站状态更新。
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let inView = false
    const update = () => setActive(inView && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update() }, { rootMargin: '200px 0px' })
    observer.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])

  // 字重/字宽随设定温度变化：只在设定值改变时写一次 CSS 变量，
  // 不再每个模拟周期都写（那会触发整页样式重算）。
  useEffect(() => {
    const tempT = (targetTemp + 25) / 35
    document.documentElement.style.setProperty('--temp-t', tempT.toFixed(3))
  }, [targetTemp])

  useEffect(() => {
    if (!active) return
    // 起点取最新的平均温度；interval 不再依赖 avgTemp，避免每个周期都被拆掉重建。
    let T = useAppStore.getState().avgTemp
    let lastRun = Date.now()
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.min((now - lastRun) / 1000, 2)
      lastRun = now
      let remaining = elapsed * 4
      const step = 2
      let lastPWM = useAppStore.getState().pwm
      while (remaining > 0) {
        const dt = Math.min(step, remaining)
        remaining -= dt
        timeRef.current += dt
        lastPWM = updatePID(pidRef.current, T, targetTemp, dt)
        T = thermalStep(T, lastPWM, dt)
      }
      // 一次性提交，减少订阅组件的重复渲染。
      useAppStore.setState({ pwm: lastPWM, avgTemp: T })
    }, 500)
    return () => clearInterval(interval)
  }, [active, targetTemp])

  const handleDialChange = (v: number) => {
    setDraftTemp(v)
    if (!editing) setEditing(true)
  }

  const handleConfirm = () => {
    setTargetTemp(draftTemp)
    resetPID(pidRef.current)
    setEditing(false)
    setConfirmedAt(Date.now())
  }

  const showConfirmed = Date.now() - confirmedAt < 2000

  return (
    <section id="control" ref={sectionRef} className="max-w-page mx-auto px-6 space-y-8">
      <div className="space-y-6">
        <h2>{t('control.title')}</h2>
        <p className="text-lg leading-relaxed max-w-prose">{t('control.body')}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="control-dial">
            <label className="text-sm text-ink-60">{t('control.dialLabel')}</label>
            <input
              type="range"
              min={-25}
              max={10}
              step={0.5}
              value={draftTemp}
              onChange={(e) => handleDialChange(parseFloat(e.target.value))}
              onMouseUp={handleConfirm}
              onTouchEnd={handleConfirm}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
              }}
              className="flex-1"
              aria-label={t('control.dialLabel')}
            />
            <div className="text-2xl font-mono font-semibold w-20 text-right">
              {draftTemp.toFixed(1)}°C
            </div>
          </div>
          {editing && <p className="text-sm text-ink-60">{t('control.editing')}</p>}
          {showConfirmed && <p className="text-sm text-ice">{t('control.confirmed')}</p>}
          <div className="control-stats grid grid-cols-3 gap-6 pt-6 border-t border-line">
            <div className="space-y-1">
              <div className="text-xs text-ink-60">{t('control.target')}</div>
              <div className="text-xl font-mono">{targetTemp.toFixed(1)}°C</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-ink-60">{t('control.average')}</div>
              <div className="text-xl font-mono">{avgTemp.toFixed(1)}°C</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-ink-60">{t('control.fan')}</div>
              <div className="text-xl font-mono">{pwm}%</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="caption">{t('control.oledTitle')}</div>
          <div className="grid grid-cols-2 gap-4">
            <OLEDScreen type="control" />
            <OLEDScreen type="data" />
          </div>
          <p className="caption">{t('control.oledCaption')}</p>
        </div>
      </div>

      <p className="caption border-l-2 border-ice pl-3">{t('control.simCaption')}</p>
    </section>
  )
}

function OLEDScreen({ type }: { type: 'control' | 'data' }) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetTemp = useAppStore((s) => s.targetTemp)
  const avgTemp = useAppStore((s) => s.avgTemp)
  const pwm = useAppStore((s) => s.pwm)
  const co2 = useAppStore((s) => s.co2)
  const alarm = useAppStore((s) => s.alarm)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 128, 64)
    ctx.fillStyle = '#6CC9EE'
    ctx.font = '8px monospace'

    if (type === 'control') {
      ctx.fillText('ChillLink / CONTROL', 0, 8)
      ctx.fillRect(0, 10, 128, 1)
      ctx.fillText('AVERAGE', 0, 20)
      ctx.font = '16px monospace'
      ctx.fillText(`${avgTemp.toFixed(1)}C`, 0, 38)
      ctx.font = '8px monospace'
      ctx.fillText(`SET ${targetTemp.toFixed(1)}C`, 0, 50)
      ctx.fillText(`FAN ${pwm}%`, 78, 50)
      ctx.fillRect(0, 53, 128, 1)
      ctx.fillText('MID EDIT  L/R SENSOR', 0, 62)
    } else {
      ctx.fillText(alarm ? 'CO2 ALARM / VENT!' : 'Effi-Chillcrate X1', 0, 8)
      ctx.fillRect(0, 10, 128, 1)
      ctx.font = '16px monospace'
      ctx.fillText(`${co2}`, 0, 28)
      ctx.font = '8px monospace'
      ctx.fillText('ppm', 54, 28)
      const s1 = avgTemp + (Math.random() - 0.5) * 0.6
      const s2 = avgTemp + (Math.random() - 0.5) * 0.6
      const s3 = avgTemp + (Math.random() - 0.5) * 0.6
      ctx.fillText(`> S1  ${s1.toFixed(1)} C`, 0, 42)
      ctx.fillText(`  S2  ${s2.toFixed(1)} C`, 0, 51)
      ctx.fillText(`  S3  ${s3.toFixed(1)} C`, 0, 60)
    }
  }, [type, targetTemp, avgTemp, pwm, co2, alarm])

  return (
    <div className="bg-black rounded p-2">
      <canvas ref={canvasRef} width={128} height={64} className="w-full h-auto" />
      <div className="text-xs text-center text-ink-60 mt-1">
        {type === 'control' ? t('control.oledControl') : t('control.oledData')}
      </div>
    </div>
  )
}

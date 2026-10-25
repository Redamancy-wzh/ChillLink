import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { useEffect, useRef, useState } from 'react'
import { createPID, resetPID, updatePID } from '../sim/pid'
import { thermalStep } from '../sim/thermal'
import { Screen } from '../components/OLEDPair'

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
    <section id="control" ref={sectionRef} className="control-section">
      <div className="content-wrap">
        <div className="section-heading section-heading-wide">
          <div><p className="eyebrow">03 / CONTROL</p><h2>{t('control.title')}</h2></div>
          <p className="section-heading-copy">{t('control.body')}</p>
        </div>

        <div className="control-grid">
          <div className="control-panel">
            <div className="control-dial">
              <label htmlFor="target-dial">{t('control.dialLabel')}</label>
              <output>{draftTemp > 0 ? '+' : ''}{draftTemp.toFixed(1)}<small>°C</small></output>
              <input
                id="target-dial"
                type="range"
                min={-25}
                max={10}
                step={0.5}
                value={draftTemp}
                onChange={(e) => handleDialChange(parseFloat(e.target.value))}
                onPointerUp={handleConfirm}
                onKeyUp={(e) => { if (e.key === 'Enter' || e.key.startsWith('Arrow')) handleConfirm() }}
                style={{ '--range-progress': `${((draftTemp + 25) / 35) * 100}%` } as React.CSSProperties}
                aria-describedby="target-dial-hint"
              />
              <div className="control-dial-scale" aria-hidden="true"><span>−25</span><span>−10</span><span>0</span><span>+10 °C</span></div>
            </div>
            <p id="target-dial-hint" className="control-dial-hint">{editing ? t('control.editing') : showConfirmed ? t('control.confirmed') : t('control.keyHint')}</p>
            <dl className="control-stats">
              <div><dt>{t('control.target')}</dt><dd>{targetTemp.toFixed(1)}°C</dd></div>
              <div><dt>{t('control.average')}</dt><dd>{avgTemp.toFixed(1)}°C</dd></div>
              <div><dt>{t('control.fan')}</dt><dd>{pwm}%<i className="control-pwm" style={{ '--pwm': `${pwm}%` } as React.CSSProperties} /></dd></div>
            </dl>
          </div>

          <div className="control-oled">
            <div className="control-oled-head"><span className="eyebrow">ELECTRONICS / OLED</span><h3>{t('control.oledTitle')}</h3></div>
            <div className="model-oled-grid"><Screen type="control" /><Screen type="data" /></div>
            <p className="caption">{t('control.oledCaption')} {t('control.simCaption')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

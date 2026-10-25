import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { prefersReducedMotion } from '../hooks/useReducedMotion'


export default function Safety() {
  const { t } = useTranslation()
  const [co2, setCo2] = useState(400)
  const [alarm, setAlarm] = useState(false)
  const [pending, setPending] = useState(false)
  const [visible, setVisible] = useState(true)
  const setStoreCo2 = useAppStore((s) => s.setCo2)
  const setStoreAlarm = useAppStore((s) => s.setAlarm)
  const highSince = useRef<number | null>(null)

  useEffect(() => {
    setStoreCo2(co2)
  }, [co2, setStoreCo2])

  // Firmware rule: >= 2000 ppm held for about 3 s raises the alarm; a valid reading < 2000 clears it.
  // A timer is used so the alarm still fires while the slider is held still above the threshold.
  useEffect(() => {
    if (co2 < 2000) {
      highSince.current = null
      setPending(false)
      if (alarm) { setAlarm(false); setStoreAlarm(false) }
      return
    }
    if (alarm) return
    if (highSince.current === null) highSince.current = Date.now()
    setPending(true)
    const id = window.setTimeout(() => {
      setAlarm(true)
      setStoreAlarm(true)
      setPending(false)
    }, Math.max(0, 3000 - (Date.now() - highSince.current)))
    return () => window.clearTimeout(id)
  }, [co2, alarm, setStoreAlarm])

  // Blink: 2 Hz, or 4 Hz at >= 5000 ppm. Reduced motion shows steady with text.
  useEffect(() => {
    if (!alarm) return
    const reduced = prefersReducedMotion()
    if (reduced) {
      setVisible(true)
      return
    }
    const interval = co2 >= 5000 ? 125 : 250
    const id = setInterval(() => setVisible((v) => !v), interval)
    return () => {
      clearInterval(id)
      setVisible(true)
    }
  }, [alarm, co2])

  const status =
    alarm && co2 >= 5000
      ? t('safety.co2.critical')
      : alarm
        ? t('safety.co2.alarm')
        : pending
          ? t('safety.co2.pending')
          : t('safety.co2.normal')

  return (
    <section id="safety" className="safety-section">
      <div className="content-wrap">
        <div className="section-heading section-heading-wide">
          <div><p className="eyebrow">04 / SAFE BY DESIGN</p><h2>{t('safety.title')}</h2></div>
          <p className="section-heading-copy">{t('safety.body')}</p>
        </div>

        <div className="safety-grid safety-grid--alarm">
          <div className="safety-console">
            <div className="safety-console-head"><span className="eyebrow">CO₂ / ALARM</span><h3>{t('safety.co2.title')}</h3></div>
            <div className="safety-co2">
              <div className="safety-co2-head">
                <label htmlFor="co2-slider">{t('safety.co2.slider')}</label>
                <output className={alarm ? 'is-alarm' : ''}>{co2}<small> ppm</small></output>
              </div>
              <input id="co2-slider" type="range" min={0} max={5000} step={10} value={co2} onChange={(e) => setCo2(parseInt(e.target.value, 10))} style={{ '--range-progress': `${co2 / 50}%` } as React.CSSProperties} />
              <div className="safety-co2-scale" aria-hidden="true"><span>0</span><span className="mark-2000">2000</span><span className="mark-5000">5000</span></div>
              <div className="alarm-indicators">
                <span className={`alarm-lamp ${alarm && visible ? 'is-on' : ''}`} />
                <span>{t('safety.co2.led')}</span>
                <span className={`alarm-buzzer ${alarm && visible ? 'is-on' : ''}`} aria-hidden="true">◂)))</span>
                <span>{t('safety.co2.buzzer')}</span>
              </div>
              <p className={`safety-status ${alarm ? 'is-alarm' : ''}`} aria-live="polite">
                {status}
                {alarm && prefersReducedMotion() ? ` · ${t('safety.co2.steady')}` : ''}
              </p>
              <p className="caption">{t('safety.co2.rule')}</p>
            </div>
          </div>
          <ul className="safety-facts">
            {(t('safety.facts', { returnObjects: true }) as string[]).map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>

        <p className="safety-warning">
          <strong>{t('safety.warning')}</strong> <span>{t('safety.volume')}</span>
        </p>
      </div>
    </section>
  )
}

import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import PathDiagram from '../components/PathDiagram'
import { useAppStore } from '../store/useAppStore'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

type Scenario = 'normal' | 'fans' | 'blocked'

export default function Safety() {
  const { t } = useTranslation()
  const [scenario, setScenario] = useState<Scenario>('normal')
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

  // Firmware rule: >= 2000 ppm held for about 3 s raises the alarm.
  useEffect(() => {
    if (alarm) {
      if (co2 < 2000) {
        setAlarm(false)
        setStoreAlarm(false)
        setPending(false)
        highSince.current = null
      }
      return
    }
    if (co2 >= 2000) {
      if (highSince.current === null) {
        highSince.current = Date.now()
        setPending(true)
      } else if (Date.now() - highSince.current >= 3000) {
        setAlarm(true)
        setStoreAlarm(true)
        setPending(false)
      }
    } else {
      highSince.current = null
      setPending(false)
    }
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
    <section id="safety" className="max-w-page mx-auto px-6 space-y-8">
      <div className="space-y-4">
        <h2>{t('safety.title')}</h2>
        <p className="leading-relaxed max-w-prose">{t('safety.body')}</p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] gap-10 items-center">
        <div className="space-y-3 max-w-[560px] w-full mx-auto">
          <PathDiagram scenario={scenario} />
          <p className="caption border-l-2 border-ice pl-3">{t(`safety.status.${scenario}`)}</p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {(['normal', 'fans', 'blocked'] as Scenario[]).map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={
                  'px-3 py-1.5 rounded-full text-sm border transition-colors ' +
                  (scenario === s ? 'border-cryo text-cryo bg-cryo/5' : 'border-line-2 text-ink-60')
                }
              >
                {t(`safety.scenarios.${s}`)}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t border-line">
            <div className="flex items-baseline justify-between">
              <label className="text-sm text-ink-60" htmlFor="co2-slider">
                {t('safety.co2.slider')}
              </label>
              <span className="font-mono text-lg">{co2} ppm</span>
            </div>
            <input
              id="co2-slider"
              type="range"
              min={0}
              max={5000}
              step={10}
              value={co2}
              onChange={(e) => setCo2(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="alarm-indicators flex items-center gap-4 pt-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: alarm && visible ? '#FF7A2F' : 'rgba(255,122,47,.25)',
                }}
              />
              <span className="text-sm">{t('safety.co2.led')}</span>
              <div className="ml-6 flex items-center gap-2">
                <span
                  className="text-sm"
                  style={{ opacity: alarm && visible ? 1 : 0.35 }}
                >
                  ◂)))
                </span>
                <span className="text-sm">{t('safety.co2.buzzer')}</span>
              </div>
            </div>
            <p
              className="text-sm"
              style={{ color: alarm ? '#FF7A2F' : undefined }}
              aria-live="polite"
            >
              {status}
              {alarm && prefersReducedMotion()
                ? ` · ${t('safety.co2.steady')}`
                : ''}
            </p>
            <p className="caption">{t('safety.co2.rule')}</p>
          </div>
        </div>
      </div>

      <p className="border-l-[3px] border-signal pl-4 py-1 text-sm text-abyss max-w-prose">
        <strong className="font-semibold">{t('safety.warning')}</strong> <span className="text-ink-60">{t('safety.volume')}</span>
      </p>
    </section>
  )
}

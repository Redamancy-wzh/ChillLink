import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'

export function Screen({ type }: { type: 'control' | 'data' }) {
  const { t } = useTranslation()
  const targetTemp = useAppStore(s => s.targetTemp)
  const avgTemp = useAppStore(s => s.avgTemp)
  const pwm = useAppStore(s => s.pwm)
  const co2 = useAppStore(s => s.co2)
  const alarm = useAppStore(s => s.alarm)
  const label = type === 'control' ? t('control.oledControl') : t('control.oledData')
  const line = (text: string, x: number, y: number, size: number, weight = 500) => (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill="#6cc9ee">{text}</text>
  )
  return <div className="oled-card">
    <svg className="oled-svg" viewBox="0 0 640 320" role="img" aria-label={label}>
      <rect width="640" height="320" rx="8" fill="#020506" />
      {type === 'control' ? <>
        {line('ChillLink / CONTROL', 18, 38, 25, 650)}<rect x="18" y="52" width="604" height="4" fill="#6cc9ee" />
        {line('AVERAGE', 18, 108, 27, 650)}
        {line(avgTemp.toFixed(1) + '°C', 18, 190, 70, 650)}
        {line('SET  ' + targetTemp.toFixed(1) + '°C', 18, 250, 28)}{line('FAN  ' + pwm + '%', 405, 250, 28)}
        <rect x="18" y="266" width="604" height="4" fill="#6cc9ee" />{line('MODE   EDIT    L/R SENSOR', 18, 302, 25, 650)}
      </> : <>
        {line(alarm ? 'CO2 ALARM / VENT!' : 'Effi-Chillcrate X1', 18, 38, 25, 650)}<rect x="18" y="52" width="604" height="4" fill="#6cc9ee" />
        {line(String(co2), 18, 132, 70, 650)}{line('ppm', 270, 132, 30)}
        {line('> S1   ' + (avgTemp - .3).toFixed(1) + ' °C', 18, 210, 31)}
        {line('  S2   ' + (avgTemp - .3).toFixed(1) + ' °C', 18, 250, 31)}
        {line('  S3   ' + (avgTemp + .2).toFixed(1) + ' °C', 18, 290, 31)}
      </>}
    </svg>
    <span>{label}</span>
  </div>
}

export default function OLEDPair() {
  const { t } = useTranslation()
  return <div className="model-oled-preview"><div className="model-oled-heading"><span className="eyebrow">ELECTRONICS / OLED</span><h3>{t('control.oledTitle')}</h3></div><div className="model-oled-grid"><Screen type="control" /><Screen type="data" /></div><p>{t('control.oledCaption')}</p></div>
}

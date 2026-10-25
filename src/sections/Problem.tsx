import { useTranslation } from 'react-i18next'
import { useInView } from '../hooks/useInView'
import { useState, useEffect } from 'react'

function CountUp({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
}: {
  end: number
  decimals?: number
  prefix?: string
  suffix?: string
}) {
  const [value, setValue] = useState(0)
  const { ref, hasEntered } = useInView(0.3)

  useEffect(() => {
    if (!hasEntered) return
    let start = 0
    const duration = 1800
    const step = (timestamp: number) => {
      if (start === 0) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(end * eased)
      if (progress < 1) requestAnimationFrame(step)
      else setValue(end)
    }
    requestAnimationFrame(step)
  }, [hasEntered, end])

  return (
    <div ref={ref} className="text-5xl font-semibold font-mono">
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </div>
  )
}

export default function Problem({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation()
  const stats = t('problem.stats', { returnObjects: true }) as any

  const Tag = embedded ? 'div' : 'section'
  return (
    <Tag id="problem" className={embedded ? 'problem-stats-embedded' : 'max-w-page mx-auto px-6 problem-stats-section'}>
      <div className="problem-stats">
        <div>
          <div className="caption">{stats.coldChain.label}</div>
          <CountUp
            end={stats.coldChain.value}
            decimals={stats.coldChain.decimals}
            prefix={stats.coldChain.prefix}
            suffix={stats.coldChain.suffix}
          />
          <p className="caption">{stats.coldChain.then}</p>
          <p className="caption italic">{stats.coldChain.source}</p>
        </div>
        <div>
          <div className="caption">{stats.retail.label}</div>
          <CountUp
            end={stats.retail.value}
            decimals={stats.retail.decimals}
            prefix={stats.retail.prefix}
            suffix={stats.retail.suffix}
          />
          <p className="caption">{stats.retail.then}</p>
          <p className="caption italic">{stats.retail.source}</p>
        </div>
        <div>
          <div className="caption">{stats.cdc.label}</div>
          <div className="text-4xl font-bold text-signal">{stats.cdc.big}</div>
          <p className="caption">{stats.cdc.then}</p>
          <p className="caption italic">{stats.cdc.source}</p>
        </div>
      </div>
    </Tag>
  )
}

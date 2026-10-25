import { useState, useEffect } from 'react'

export type DeviceTier = 'high' | 'mid' | 'low'

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high')
  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4
    const isMobile = window.innerWidth < 768
    if (!('WebGL2RenderingContext' in window)) setTier('low')
    else if (isMobile && cores <= 4) setTier('low')
    else if (isMobile || cores <= 6) setTier('mid')
    else setTier('high')
  }, [])
  return tier
}

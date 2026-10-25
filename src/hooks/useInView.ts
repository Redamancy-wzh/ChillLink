import { useEffect, useState, useRef } from 'react'

export function useInView(threshold = 0.1) {
  const ref = useRef<any>(null)
  const [inView, setInView] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && !hasEntered) setHasEntered(true)
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, hasEntered])

  return { ref, inView, hasEntered }
}

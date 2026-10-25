import { useEffect, useRef, useState } from 'react'

const base = import.meta.env.BASE_URL

// 团队故事照片：public/img/team-story/team-story-001.webp ~ team-story-063.webp。
// 前 12 张为首屏拼贴的精选图；新增照片按编号顺延，并把下面的 PHOTO_COUNT 改成最新数量即可。
const PHOTO_COUNT = 63
const photos = Array.from({ length: PHOTO_COUNT }, (_, i) => `team-story-${String(i + 1).padStart(3, '0')}.webp`)

// 参考图式“散落拼贴”布局：x/y 为卡片中心在画板中的百分比位置，w 为桌面宽度占比，
// wm 为移动端宽度占比，r 为旋转角度，z 为层级。0 号为居中的主图，其余从后往前散落四周。
const slots = [
  { x: 50, y: 51, w: 50, wm: 74, r: 0, z: 40 },
  { x: 26, y: 30, w: 26, wm: 40, r: -8, z: 22 },
  { x: 76, y: 29, w: 27, wm: 40, r: 7, z: 21 },
  { x: 21, y: 72, w: 24, wm: 38, r: -6, z: 20 },
  { x: 80, y: 69, w: 22, wm: 36, r: 6, z: 19 },
  { x: 53, y: 16, w: 22, wm: 34, r: -3, z: 14 },
  { x: 48, y: 86, w: 30, wm: 40, r: 2, z: 13 },
  { x: 37, y: 15, w: 20, wm: 30, r: 5, z: 12 },
  { x: 13, y: 47, w: 15, wm: 24, r: -5, z: 11 },
  { x: 66, y: 85, w: 17, wm: 26, r: -3, z: 10 },
  { x: 88, y: 47, w: 14, wm: 22, r: 4, z: 9 },
  { x: 31, y: 12, w: 14, wm: 22, r: -6, z: 8 },
]

const photoSrc = (file: string) => `${base}img/team-story/${file}`

/** 提前下载并解码图片，轮换时不会在主线程上同步解码大图。 */
function predecode(file: string) {
  const img = new Image()
  img.src = photoSrc(file)
  img.decode?.().catch(() => {})
}

export default function TeamStory() {
  const [orderedPhotos, setOrderedPhotos] = useState(photos)
  const dragStart = useRef<number | null>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = stackRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '100px 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 下一张即将进场的照片（两个方向各一张）提前解码。
  useEffect(() => {
    if (!inView) return
    predecode(orderedPhotos[slots.length])
    predecode(orderedPhotos[orderedPhotos.length - 1])
  }, [inView, orderedPhotos])

  // 自动更替主图；只在画板可见、未悬停、标签页在前台时运行。
  useEffect(() => {
    if (!inView || paused) return
    const timer = window.setInterval(() => {
      if (document.hidden) return
      setOrderedPhotos(current => [...current.slice(1), current[0]])
    }, 4600)
    return () => window.clearInterval(timer)
  }, [inView, paused])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return
    const distance = event.clientX - dragStart.current
    dragStart.current = null
    // 如果拖动距离小于36px，视为点击而非拖动
    if (Math.abs(distance) < 36) return
    setOrderedPhotos(current => distance < 0 ? [...current.slice(1), current[0]] : [current[current.length - 1], ...current.slice(0, -1)])
  }

  // 点击卡片，将其移动到最前面（中间放大显示）
  const handleCardClick = (event: React.MouseEvent, clickedIndex: number) => {
    // 防止拖动时触发点击
    if (dragStart.current !== null && Math.abs(event.clientX - dragStart.current) >= 36) {
      return
    }
    if (clickedIndex === 0) return // 已经在最前面
    setOrderedPhotos(current => {
      const newOrder = [...current]
      // 将点击的卡片移动到数组开头
      const [clickedPhoto] = newOrder.splice(clickedIndex, 1)
      return [clickedPhoto, ...newOrder]
    })
  }

  return <section id="team-story" className="field-gallery-section">
    <div className="content-wrap">
      <div className="section-heading section-heading-wide field-gallery-heading">
        <div><p className="eyebrow">TEAM STORY</p><h2>团队故事</h2></div>
        <p className="section-heading-copy">从样机装配到现场测试，记录 ChillLink 从想法走向可用原型的每一步。</p>
      </div>
      <div ref={stackRef} className="photo-stack" aria-label="团队故事照片展览，可用鼠标左右划动或点击卡片" onPointerEnter={e => { if (e.pointerType === 'mouse') setPaused(true) }} onPointerLeave={() => setPaused(false)} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { dragStart.current = null }}>
        {orderedPhotos.slice(0, slots.length).map((file, index) => {
          const slot = slots[index]
          return <figure
            className={`photo-stack-card ${index === 0 ? 'is-main' : ''}`}
            data-slot={index}
            key={file}
            style={{ '--x': slot.x, '--y': slot.y, '--w': `${slot.w}%`, '--wm': `${slot.wm}%`, '--r': `${slot.r}deg`, '--z': slot.z, '--stack-index': index } as React.CSSProperties}
            onClick={(e) => handleCardClick(e, index)}
          >
          <img src={photoSrc(file)} alt="ChillLink 团队故事照片" loading={index < 4 ? 'eager' : 'lazy'} decoding="async" draggable={false} />
          </figure>
        })}
      </div>
      <p className="photo-stack-hint">左右拖动浏览 · 照片持续轮换</p>
    </div>
  </section>
}

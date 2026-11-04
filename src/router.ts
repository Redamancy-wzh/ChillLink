import { useEffect, useState } from 'react'

/** 轻量 hash 路由：首页放主要内容，次要内容拆到两个分页。
 *  旧的锚点（#safety、#team …）依然有效——会自动切到对应分页并滚动到位。 */
export type Page = 'home' | 'technology' | 'about'

export const PAGE_HASH: Record<Page, string> = {
  home: '#/',
  technology: '#/technology',
  about: '#/about',
}

const ANCHOR_PAGE: Record<string, Page> = {
  technology: 'technology',
  airflow: 'technology',
  'technical-specs': 'technology',
  control: 'technology',
  safety: 'technology',
  compare: 'technology',
  'package-plans': 'home',
  'safety-summary': 'home',
  'news-info': 'about',
  team: 'about',
  'team-story': 'about',
}

function parse(hash: string, current: Page): { page: Page; anchor: string | null } {
  const h = hash.replace(/^#/, '')
  if (h === '' || h === '/') return { page: 'home', anchor: null }
  if (h.startsWith('/')) {
    const p = h.slice(1) as Page
    return { page: p in PAGE_HASH ? p : 'home', anchor: null }
  }
  // contact / main 在每页都有，保持当前页
  if (h === 'contact' || h === 'main') return { page: current, anchor: h }
  return { page: ANCHOR_PAGE[h] ?? 'home', anchor: h }
}

export function usePage(): Page {
  const [state, setState] = useState(() => parse(window.location.hash, 'home'))

  useEffect(() => {
    const onHash = () => setState(prev => parse(window.location.hash, prev.page))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    // 等新页面渲染后再定位
    const id = requestAnimationFrame(() => {
      const el = state.anchor ? document.getElementById(state.anchor) : null
      if (el) el.scrollIntoView({ block: 'start' })
      else window.scrollTo({ top: 0 })
    })
    return () => cancelAnimationFrame(id)
  }, [state])

  return state.page
}

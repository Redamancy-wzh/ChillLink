// 校验当前支持的语言包键结构与中文完全一致（数组长度也要一致）
import { readFileSync } from 'node:fs'

const LANGS = ['zh-CN', 'en']
const load = (l) => JSON.parse(readFileSync(new URL(`../src/locales/${l}/common.json`, import.meta.url), 'utf8'))

function shape(v, path = '') {
  if (Array.isArray(v)) return [`${path}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${path}[${i}]`))]
  if (v && typeof v === 'object') return Object.keys(v).sort().flatMap((k) => shape(v[k], path ? `${path}.${k}` : k))
  return [path]
}

const base = new Set(shape(load('zh-CN')))
let failed = false
for (const l of LANGS.slice(1)) {
  const s = new Set(shape(load(l)))
  const missing = [...base].filter((k) => !s.has(k))
  const extra = [...s].filter((k) => !base.has(k))
  if (missing.length || extra.length) {
    failed = true
    console.error(`✗ ${l}`)
    missing.forEach((k) => console.error(`   缺少 ${k}`))
    extra.forEach((k) => console.error(`   多出 ${k}`))
  } else console.log(`✓ ${l}`)
}
process.exit(failed ? 1 : 0)

import { create } from 'zustand'

interface AppState {
  lang: string
  setLang: (lang: string) => void
  targetTemp: number
  draftTemp: number
  setTargetTemp: (t: number) => void
  setDraftTemp: (t: number) => void
  pwm: number
  setPwm: (p: number) => void
  avgTemp: number
  setAvgTemp: (t: number) => void
  explodeP: number
  setExplodeP: (p: number) => void
  co2: number
  setCo2: (ppm: number) => void
  alarm: boolean
  setAlarm: (active: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  lang: 'zh-CN',
  setLang: (lang) => set({ lang }),
  targetTemp: -10,
  draftTemp: -10,
  setTargetTemp: (t) => set({ targetTemp: t, draftTemp: t }),
  setDraftTemp: (t) => set({ draftTemp: t }),
  pwm: 50,
  setPwm: (p) => set({ pwm: p }),
  avgTemp: -10,
  setAvgTemp: (t) => set({ avgTemp: t }),
  explodeP: 0,
  setExplodeP: (p) => set({ explodeP: p }),
  co2: 400,
  setCo2: (ppm) => set({ co2: ppm }),
  alarm: false,
  setAlarm: (active) => set({ alarm: active }),
}))

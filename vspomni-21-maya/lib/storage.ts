export function load<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : defaultVal
  } catch {
    return defaultVal
  }
}

export function save(key: string, val: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(val))
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function weekDates(): string[] {
  const now = new Date()
  const m = new Date(now)
  m.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(m)
    d.setDate(m.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function weekTotalFor(entries: Entry[], offset: number): number {
  const now = new Date()
  const m = new Date(now)
  m.setDate(now.getDate() - ((now.getDay() + 6) % 7) - offset * 7)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(m)
    d.setDate(m.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
  return dates.reduce((sum, d) => sum + entries.filter(e => e.date === d).reduce((s, e) => s + e.hrs, 0), 0)
}

// Data types
export interface Config {
  mode: 'kind' | 'strict' | 'savage'
  name: string
  weekGoal: number
  mainGoal: string
  format: string
  theme?: string
  anims?: {
    tilt: boolean
    slide: boolean
    magnetic: boolean
    counter: boolean
    particles: boolean
    sound: boolean
    ripple: boolean
  }
  ui?: {
    hidden: string[]
    navPos: 'top' | 'side'
    scale: number
    bg: string
  }
}

export interface Entry {
  type: string
  hrs: number
  date: string
  hour: number
}

export interface Task {
  txt: string
  done: boolean
  date: string
  big: boolean
}

export interface Goal {
  name: string
  date: string
}

export interface Material {
  name: string
  type: string
  data: string
}

export interface Solve {
  topic: string
  count: number
  mood: 'ok' | 'hint' | 'fail'
  date: string
}

export interface Quest {
  t: string
  done: boolean
}

export interface MoodEntry {
  emoji: string
  time: string
  date: string
}

export interface Habit {
  emoji: string
  name: string
}

export interface ExamConfig {
  name: string
  date: string
}

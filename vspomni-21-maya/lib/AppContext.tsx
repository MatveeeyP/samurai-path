'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { load, save, todayKey, weekDates, weekTotalFor, Config, Entry, Task, Goal, Material, Solve } from './storage'
import { sfx } from './sounds'
import { confetti } from './animations'

export const THEMES: Record<string, string> = {
  blue: '#1b6deb',
  green: '#1faf73',
  purple: '#7c4dff',
  orange: '#ff7a2f',
  pink: '#ec4899',
  teal: '#0ea5a4',
}

export const MODE_NAMES: Record<string, string> = {
  kind: '😊 Добрый',
  strict: '🎯 Строгий',
  savage: '😈 Без церемоний',
}

export const ACH_LIST = [
  { id: 'first', e: '🌱', t: 'Первый шаг', d: 'Записал первый час', chk: (entries: Entry[]) => entries.length > 0 },
  { id: 'hours10', e: '⭐', t: 'Первые 10 часов', d: '10 часов учёбы', chk: (entries: Entry[]) => entries.reduce((s, e) => s + e.hrs, 0) >= 10 },
  { id: 'hours100', e: '💎', t: '100 часов!', d: '100 часов учёбы', chk: (entries: Entry[]) => entries.reduce((s, e) => s + e.hrs, 0) >= 100 },
  { id: 'hours500', e: '🚀', t: 'Полтысячи', d: '500 часов учёбы', chk: (entries: Entry[]) => entries.reduce((s, e) => s + e.hrs, 0) >= 500 },
  { id: 'streak3', e: '🔥', t: 'В деле', d: 'Серия 3 дня', chk: (_: Entry[], streak: number) => streak >= 3 },
  { id: 'streak7', e: '⚡', t: 'Неделя без пропусков', d: 'Серия 7 дней подряд', chk: (_: Entry[], streak: number) => streak >= 7 },
  { id: 'streak30', e: '👑', t: 'Машина', d: 'Серия 30 дней', chk: (_: Entry[], streak: number) => streak >= 30 },
  { id: 'week48', e: '🎯', t: 'Норма взята', d: '48+ ч за неделю', chk: (entries: Entry[], _: number, cfg: Config) => weekDates().reduce((s, d) => s + entries.filter(e => e.date === d).reduce((a, e) => a + e.hrs, 0), 0) >= cfg.weekGoal },
  { id: 'pomo4', e: '🍅', t: 'Помидорный', d: '4 помидора за день', chk: (_e: Entry[], _s: number, _c: Config, pomoToday: number) => pomoToday >= 4 },
  { id: 'solve50', e: '📐', t: 'Решала', d: '50 задач решено', chk: (_e: Entry[], _s: number, _c: Config, _p: number, solves: Solve[]) => solves.reduce((s, x) => s + x.count, 0) >= 50 },
  { id: 'night', e: '🦉', t: 'Сова', d: 'Учёба после 23:00', chk: (entries: Entry[]) => entries.some(e => e.hour >= 23) },
  { id: 'early', e: '🐓', t: 'Жаворонок', d: 'Учёба до 8:00', chk: (entries: Entry[]) => entries.some(e => e.hour < 8 && e.hour >= 5) },
]

export function earnedFreezes(entries: Entry[], cfg: Config): number {
  const days = new Set(entries.map(e => e.date)).size
  let weeksNorm = 0
  for (let i = 0; i < 8; i++) { if (weekTotalFor(entries, i) >= cfg.weekGoal) weeksNorm++ }
  return Math.floor(days / 7) + weeksNorm
}

export function calcStreak(entries: Entry[], cfg: Config): number {
  const days = new Set(entries.map(e => e.date))
  let freezesAvail = Math.min(3, earnedFreezes(entries, cfg))
  let s = 0
  const d = new Date()
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  for (let guard = 0; guard < 400; guard++) {
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) { s++ }
    else { if (freezesAvail > 0) { freezesAvail-- } else { break } }
    d.setDate(d.getDate() - 1)
    if (s > 400) break
  }
  return s
}

export function calcFreeze(entries: Entry[], cfg: Config): number {
  const days = new Set(entries.map(e => e.date))
  let freezesAvail = Math.min(3, earnedFreezes(entries, cfg))
  let used = 0
  const d = new Date()
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1)
  for (let guard = 0; guard < 400; guard++) {
    const key = d.toISOString().slice(0, 10)
    if (!days.has(key)) { if (freezesAvail - used > 0) used++; else break }
    d.setDate(d.getDate() - 1)
  }
  return Math.max(0, Math.min(3, freezesAvail - used))
}

export function totalXP(entries: Entry[], solves: Solve[], achGot: string[], streak: number): number {
  const hours = entries.reduce((s, e) => s + e.hrs, 0)
  const solveOk = solves.filter(s => s.mood === 'ok').reduce((s, x) => s + x.count, 0)
  const solveOther = solves.filter(s => s.mood !== 'ok').reduce((s, x) => s + x.count, 0)
  return Math.round(hours * 10 + solveOk * 5 + solveOther * 2 + achGot.length * 50 + streak * 8)
}

export function levelFor(xp: number): { lvl: number; inLvl: number; need: number } {
  let lvl = 1, need = 100, acc = 0
  while (xp >= acc + need) { acc += need; lvl++; need = Math.round(need * 1.4) }
  return { lvl, inLvl: xp - acc, need }
}

interface AppContextType {
  cfg: Config | null
  setCfg: (c: Config) => void
  entries: Entry[]
  setEntries: (e: Entry[]) => void
  tasks: Task[]
  setTasks: (t: Task[]) => void
  goals: Goal[]
  setGoals: (g: Goal[]) => void
  mats: Material[]
  setMats: (m: Material[]) => void
  solves: Solve[]
  setSolves: (s: Solve[]) => void
  achGot: string[]
  setAchGot: (a: string[]) => void
  pomoToday: number
  setPomoToday: (n: number) => void
  toast: (msg: string) => void
  toastMsg: string
  toastOn: boolean
  streak: number
  freezeCount: number
  xp: number
  level: { lvl: number; inLvl: number; need: number }
  timerOn: boolean
  setTimerOn: (v: boolean) => void
  timerAccum: number
  setTimerAccum: (v: number) => void
  timerStart: number
  setTimerStart: (v: number) => void
  checkAch: () => void
  showLevelUp: (lvl: number) => void
  levelUpMsg: string | null
  setLevelUpMsg: (s: string | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cfg, setCfgState] = useState<Config | null>(null)
  const [entries, setEntriesState] = useState<Entry[]>([])
  const [tasks, setTasksState] = useState<Task[]>([])
  const [goals, setGoalsState] = useState<Goal[]>([])
  const [mats, setMatsState] = useState<Material[]>([])
  const [solves, setSolvesState] = useState<Solve[]>([])
  const [achGot, setAchGotState] = useState<string[]>([])
  const [pomoToday, setPomoTodayState] = useState(0)
  const [toastMsg, setToastMsg] = useState('')
  const [toastOn, setToastOn] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null)

  // Timer state
  const [timerOn, setTimerOn] = useState(false)
  const [timerAccum, setTimerAccum] = useState(0)
  const [timerStart, setTimerStart] = useState(0)

  useEffect(() => {
    const c = load<Config | null>('v21_cfg', null)
    const e = load<Entry[]>('v21_entries', [])
    const t = load<Task[]>('v21_tasks', [])
    const g = load<Goal[]>('v21_goals', [])
    const m = load<Material[]>('v21_mats', [])
    const s = load<Solve[]>('v21_solves', [])
    const a = load<string[]>('v21_ach', [])
    const pt = load<number>('v21_pomo_' + todayKey(), 0)
    setCfgState(c)
    setEntriesState(e)
    setTasksState(t)
    setGoalsState(g)
    setMatsState(m)
    setSolvesState(s)
    setAchGotState(a)
    setPomoTodayState(pt)

    const timer = load<{ on: boolean; start: number; accum: number } | null>('v21_timer', null)
    if (timer) {
      setTimerAccum(timer.accum || 0)
      if (timer.on) {
        setTimerOn(true)
        setTimerStart(timer.start)
      }
    }
  }, [])

  const setCfg = useCallback((c: Config) => {
    setCfgState(c)
    save('v21_cfg', c)
    if (c.theme && THEMES[c.theme]) {
      document.documentElement.style.setProperty('--blue', THEMES[c.theme])
    }
  }, [])

  const setEntries = useCallback((e: Entry[]) => {
    setEntriesState(e)
    save('v21_entries', e)
  }, [])

  const setTasks = useCallback((t: Task[]) => {
    setTasksState(t)
    save('v21_tasks', t)
  }, [])

  const setGoals = useCallback((g: Goal[]) => {
    setGoalsState(g)
    save('v21_goals', g)
  }, [])

  const setMats = useCallback((m: Material[]) => {
    setMatsState(m)
    save('v21_mats', m)
  }, [])

  const setSolves = useCallback((s: Solve[]) => {
    setSolvesState(s)
    save('v21_solves', s)
  }, [])

  const setAchGot = useCallback((a: string[]) => {
    setAchGotState(a)
    save('v21_ach', a)
  }, [])

  const setPomoToday = useCallback((n: number) => {
    setPomoTodayState(n)
    save('v21_pomo_' + todayKey(), n)
  }, [])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastOn(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastOn(false), 2600)
  }, [])

  const streak = cfg ? calcStreak(entries, cfg) : 0
  const freezeCount = cfg ? calcFreeze(entries, cfg) : 0
  const xp = totalXP(entries, solves, achGot, streak)
  const level = levelFor(xp)

  const showLevelUp = useCallback((lvl: number) => {
    setLevelUpMsg(`УРОВЕНЬ ${lvl}!`)
    confetti()
    sfx('levelup')
    setTimeout(() => setLevelUpMsg(null), 3000)
  }, [])

  const prevLevel = useRef(0)
  const checkAch = useCallback(() => {
    if (!cfg) return
    const currentStreak = calcStreak(entries, cfg)
    const currentPomo = load<number>('v21_pomo_' + todayKey(), 0)
    let gotNew = false
    const newAchGot = [...achGot]
    for (const a of ACH_LIST) {
      if (!newAchGot.includes(a.id)) {
        const passed = a.chk(entries, currentStreak, cfg, currentPomo, solves)
        if (passed) {
          newAchGot.push(a.id)
          toast(`${a.e} Достижение: ${a.t}!`)
          gotNew = true
          sfx('ach', cfg.anims?.sound !== false)
        }
      }
    }
    if (gotNew) {
      setAchGot(newAchGot)
      confetti()
    }
    // Check level up
    const newXP = totalXP(entries, solves, newAchGot, currentStreak)
    const newLevel = levelFor(newXP)
    if (prevLevel.current > 0 && newLevel.lvl > prevLevel.current) {
      showLevelUp(newLevel.lvl)
    }
    prevLevel.current = newLevel.lvl
  }, [cfg, entries, solves, achGot, setAchGot, toast, showLevelUp])

  return (
    <AppContext.Provider value={{
      cfg, setCfg,
      entries, setEntries,
      tasks, setTasks,
      goals, setGoals,
      mats, setMats,
      solves, setSolves,
      achGot, setAchGot,
      pomoToday, setPomoToday,
      toast, toastMsg, toastOn,
      streak, freezeCount, xp, level,
      timerOn, setTimerOn,
      timerAccum, setTimerAccum,
      timerStart, setTimerStart,
      checkAch,
      showLevelUp,
      levelUpMsg, setLevelUpMsg,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

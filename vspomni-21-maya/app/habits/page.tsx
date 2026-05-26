'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp, ACH_LIST } from '@/lib/AppContext'
import { load, save, todayKey } from '@/lib/storage'
import type { Habit, MoodEntry } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

const DEFAULT_HABITS: Habit[] = [
  { emoji: '🏃', name: 'Спорт' },
  { emoji: '😴', name: 'Сон 8ч' },
  { emoji: '💧', name: 'Вода 2л' },
  { emoji: '📚', name: 'Чтение' },
]

const MOOD_EMOJIS = ['😊', '😐', '😔', '😤', '🤩', '😴', '💪', '🧠']

export default function HabitsPage() {
  const router = useRouter()
  const { cfg, entries, solves, achGot, toast } = useApp()
  const [showSettings, setShowSettings] = useState(false)

  const today = todayKey()

  // Habits state
  const [habits, setHabitsState] = useState<Habit[]>([])
  const [checked, setCheckedState] = useState<string[]>([])
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitEmoji, setNewHabitEmoji] = useState('⭐')

  // Mood diary state
  const [moodLog, setMoodLogState] = useState<MoodEntry[]>([])

  useEffect(() => {
    const h = load<Habit[]>('v21_habits', DEFAULT_HABITS)
    const c = load<string[]>('v21_habit_check_' + today, [])
    const m = load<MoodEntry[]>('v21_mood', [])
    setHabitsState(h)
    setCheckedState(c)
    setMoodLogState(m)
  }, [today])

  function navTo(page: string) {
    if (page === 'habits') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  function toggleHabit(name: string) {
    let next: string[]
    if (checked.includes(name)) {
      next = checked.filter(n => n !== name)
    } else {
      next = [...checked, name]
      toast(`${name} ✓`)
    }
    setCheckedState(next)
    save('v21_habit_check_' + today, next)
  }

  function addHabit() {
    const name = newHabitName.trim()
    if (!name) return
    const h: Habit = { emoji: newHabitEmoji, name }
    const next = [...habits, h]
    setHabitsState(next)
    save('v21_habits', next)
    setNewHabitName('')
    toast(`Привычка "${name}" добавлена`)
  }

  function deleteHabit(name: string) {
    const next = habits.filter(h => h.name !== name)
    setHabitsState(next)
    save('v21_habits', next)
    const nextChecked = checked.filter(n => n !== name)
    setCheckedState(nextChecked)
    save('v21_habit_check_' + today, nextChecked)
  }

  function logMood(emoji: string) {
    const now = new Date()
    const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
    const entry: MoodEntry = { emoji, time, date: today }
    const next = [entry, ...moodLog].slice(0, 50)
    setMoodLogState(next)
    save('v21_mood', next)
    toast(`Настроение ${emoji} сохранено`)
  }

  // Timeline: chronological milestones from entries, achievements, solves
  type TimelineItem = {
    date: string
    time?: string
    icon: string
    text: string
    type: 'entry' | 'ach' | 'solve' | 'mood'
  }

  const timeline: TimelineItem[] = []

  // From entries (last 10)
  for (const e of entries.slice(0, 10)) {
    timeline.push({
      date: e.date,
      time: e.hour != null ? String(e.hour).padStart(2, '0') + ':00' : undefined,
      icon: '⏱',
      text: `+${e.hrs} ч — ${e.type}`,
      type: 'entry',
    })
  }

  // From achievements
  for (const id of achGot) {
    const a = ACH_LIST.find(x => x.id === id)
    if (a) {
      timeline.push({
        date: today, // we don't store the date of achievement, use today as fallback
        icon: a.e,
        text: `Достижение: ${a.t}`,
        type: 'ach',
      })
    }
  }

  // From solves (last 8)
  for (const s of solves.slice(0, 8)) {
    const moodIcon = s.mood === 'ok' ? '✅' : s.mood === 'hint' ? '💡' : '❌'
    timeline.push({
      date: s.date,
      icon: moodIcon,
      text: `${s.count} задач — ${s.topic}`,
      type: 'solve',
    })
  }

  // From mood log (last 5)
  for (const m of moodLog.slice(0, 5)) {
    timeline.push({
      date: m.date,
      time: m.time,
      icon: m.emoji,
      text: 'Настроение отмечено',
      type: 'mood',
    })
  }

  // Sort by date desc
  timeline.sort((a, b) => b.date.localeCompare(a.date))

  const doneCount = checked.length
  const totalCount = habits.length
  const pct = totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">💪</div>
          <div className="tx">
            <b>Привычки</b>
            <span>Ежедневные ритуалы и трекер настроения</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="habits" onNavigate={navTo} />
          <div className="page-host">

            {/* Daily habits */}
            <div className="card">
              <h2>💪 Привычки сегодня</h2>
              <div className="sub">
                Выполнено {doneCount} из {totalCount} · {pct}%
              </div>
              <div style={{ height: 6, background: 'var(--line)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ width: pct + '%', height: '100%', background: 'var(--green)', borderRadius: 4, transition: 'width .3s' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {habits.map(h => (
                  <div
                    key={h.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: checked.includes(h.name) ? 'rgba(31,175,115,0.1)' : 'var(--bg)',
                      border: '1.5px solid ' + (checked.includes(h.name) ? 'var(--green)' : 'var(--line)'),
                      cursor: 'pointer',
                      transition: 'all .2s',
                    }}
                    onClick={() => toggleHabit(h.name)}
                  >
                    <div style={{ fontSize: 24 }}>{h.emoji}</div>
                    <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                      {h.name}
                    </div>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: '2px solid ' + (checked.includes(h.name) ? 'var(--green)' : 'var(--line)'),
                      background: checked.includes(h.name) ? 'var(--green)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 900, fontSize: 14,
                    }}>
                      {checked.includes(h.name) ? '✓' : ''}
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, cursor: 'pointer', padding: '0 2px' }}
                      onClick={e => { e.stopPropagation(); deleteHabit(h.name) }}
                      title="Удалить"
                    >×</button>
                  </div>
                ))}
              </div>

              {/* Add habit */}
              <div className="logrow" style={{ marginTop: 14, gap: 8, flexWrap: 'wrap' }}>
                <input
                  value={newHabitEmoji}
                  onChange={e => setNewHabitEmoji(e.target.value)}
                  placeholder="😊"
                  style={{ width: 52, textAlign: 'center' }}
                />
                <input
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHabit()}
                  placeholder="Новая привычка"
                  style={{ flex: 1 }}
                />
                <button className="btn" onClick={addHabit}>+</button>
              </div>
            </div>

            {/* Mood diary */}
            <div className="card">
              <h2>😊 Дневник настроения</h2>
              <div className="sub">Отметь своё настроение прямо сейчас</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {MOOD_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => logMood(emoji)}
                    style={{
                      fontSize: 28, background: 'var(--bg)',
                      border: '1.5px solid var(--line)',
                      borderRadius: 12, padding: '8px 12px',
                      cursor: 'pointer', transition: 'transform .1s',
                    }}
                    title="Отметить настроение"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Today's mood log */}
              {moodLog.filter(m => m.date === today).length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 6 }}>Сегодня:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {moodLog.filter(m => m.date === today).map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: 'var(--bg)', border: '1.5px solid var(--line)',
                          borderRadius: 8, padding: '4px 8px', fontSize: 13, fontWeight: 700,
                        }}
                      >
                        <span>{m.emoji}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{m.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="card">
              <h2>📜 Хроника</h2>
              <div className="sub">Последние события: учёба, достижения, задачи</div>
              {timeline.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>
                  Нет событий. Начни учиться!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8 }}>
                  {timeline.slice(0, 20).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 0',
                        borderBottom: idx < timeline.length - 1 ? '1px solid var(--line)' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 18, minWidth: 28, textAlign: 'center' }}>{item.icon}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{item.text}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {item.date.slice(5).replace('-', '/')}
                        {item.time ? ' ' + item.time : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="habits" />
    </>
  )
}

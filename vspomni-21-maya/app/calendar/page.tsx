'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { todayKey, load, save, Entry, Task, Solve } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const WD_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function CalendarPage() {
  const router = useRouter()
  const { cfg, entries, setEntries, tasks, setTasks, solves, toast } = useApp()
  const [curDate, setCurDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Day detail state
  const [ddType, setDdType] = useState('Листочек')
  const [ddHrs, setDdHrs] = useState('')
  const [ddTask, setDdTask] = useState('')
  const [ddNote, setDdNote] = useState('')
  const [, forceUpdate] = useState(0)

  const today = todayKey()

  function dayHours(dk: string): number {
    return entries.filter(e => e.date === dk).reduce((s, e) => s + e.hrs, 0)
  }

  function changeMonth(dir: number) {
    setSlideDir(dir > 0 ? 'left' : 'right')
    const g = gridRef.current
    if (g) {
      g.classList.remove('slide-left', 'slide-right')
      void g.offsetWidth
      g.classList.add(dir > 0 ? 'slide-left' : 'slide-right')
      setTimeout(() => g.classList.remove('slide-left', 'slide-right'), 400)
    }
    const nd = new Date(curDate)
    nd.setMonth(nd.getMonth() + dir)
    setCurDate(nd)
    setSlideDir(null)
  }

  function showDay(dk: string) {
    setSelectedDay(dk === selectedDay ? null : dk)
    if (dk !== selectedDay) {
      const note = load<string>('v21_notes_' + dk, '')
      setDdNote(note)
      setDdHrs(''); setDdTask(''); setDdType('Листочек')
    }
  }

  function addDayEntry(dk: string) {
    const hrs = parseFloat(ddHrs)
    if (!hrs || hrs <= 0) return
    const isPast = dk !== today
    const newE: Entry = { type: ddType, hrs, date: dk, hour: isPast ? 22 : new Date().getHours() }
    setEntries([newE, ...entries])
    setDdHrs('')
    toast(`+${hrs} ч за ${dk.slice(5)} ✓`)
    forceUpdate(v => v + 1)
  }

  function delDayEntry(idx: number) {
    const ne = [...entries]; ne.splice(idx, 1); setEntries(ne)
    forceUpdate(v => v + 1)
  }

  function addDayTask(dk: string) {
    if (!ddTask.trim()) return
    setTasks([...tasks, { txt: ddTask, done: false, date: dk, big: false }])
    setDdTask('')
    forceUpdate(v => v + 1)
  }

  function toggleDayTask(i: number) {
    const nt = [...tasks]; nt[i].done = !nt[i].done; setTasks(nt)
    forceUpdate(v => v + 1)
  }

  function delDayTask(i: number) {
    const nt = [...tasks]; nt.splice(i, 1); setTasks(nt)
    forceUpdate(v => v + 1)
  }

  function saveDayNote(dk: string, val: string) {
    save('v21_notes_' + dk, val)
    forceUpdate(v => v + 1)
  }

  function addDayFile(dk: string, ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = () => {
      const k = 'v21_dayfiles_' + dk
      const arr = load<{ name: string; type: string; data: string }[]>(k, [])
      arr.unshift({ name: f.name, type: f.type, data: r.result as string })
      save(k, arr)
      toast('Файл прикреплён ✓')
      forceUpdate(v => v + 1)
    }
    r.readAsDataURL(f)
    ev.target.value = ''
  }

  function delDayFile(dk: string, i: number) {
    const k = 'v21_dayfiles_' + dk
    const arr = load<{ name: string; type: string; data: string }[]>(k, [])
    arr.splice(i, 1); save(k, arr)
    forceUpdate(v => v + 1)
  }

  function navTo(page: string) {
    if (page === 'calendar') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  if (!cfg) return null

  const y = curDate.getFullYear(), m = curDate.getMonth()
  const first = new Date(y, m, 1)
  const startPad = (first.getDay() + 6) % 7
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  let maxH = 4
  for (let d = 1; d <= daysInMonth; d++) {
    const dk = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    maxH = Math.max(maxH, dayHours(dk))
  }

  const dayDetailCard = selectedDay ? (() => {
    const dk = selectedDay
    const dayE = entries.filter(e => e.date === dk)
    const h = dayE.reduce((s, e) => s + e.hrs, 0)
    const dayTasks = tasks.filter(t => t.date === dk)
    const daySolves = solves.filter(s => s.date === dk)
    const dayFiles = load<{ name: string; type: string; data: string }[]>('v21_dayfiles_' + dk, [])
    const dd = new Date(dk)
    return { dk, dayE, h, dayTasks, daySolves, dayFiles, title: dd.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' }) }
  })() : null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📌</div>
          <div className="tx">
            <b>Зачем ты здесь</b>
            <span>{cfg.mainGoal}</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="calendar" onNavigate={navTo} />
          <div className="page-host">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h2 style={{ margin: 0 }}>📅 Календарь</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="ai-btn" onClick={() => changeMonth(-1)} style={{ padding: '8px 12px' }}>‹</button>
                  <span style={{ fontWeight: 900, fontSize: 15, minWidth: 130, textAlign: 'center' }}>{MONTHS[m]} {y}</span>
                  <button className="ai-btn" onClick={() => changeMonth(1)} style={{ padding: '8px 12px' }}>›</button>
                </div>
              </div>
              <div className="sub">Цвет дня = сколько часов. Тыкни на день — вся история: часы, планы, задачи, заметки.</div>
              <div className="cal-weekdays">
                {WD_NAMES.map(w => <span key={w}>{w}</span>)}
              </div>
              <div className="cal-grid" ref={gridRef}>
                {Array.from({ length: startPad }, (_, i) => <div key={'e' + i} className="cal-day empty" />)}
                {Array.from({ length: daysInMonth }, (_, idx) => {
                  const d = idx + 1
                  const dk = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                  const h = dayHours(dk)
                  const hasData = h > 0
                  const op = hasData ? (0.25 + 0.75 * Math.min(1, h / maxH)) : 0
                  const hasPlan = tasks.some(t => t.date === dk)
                  const hasNote = !!load<string>('v21_notes_' + dk, '')
                  const hasFile = load<unknown[]>('v21_dayfiles_' + dk, []).length > 0
                  return (
                    <div
                      key={dk}
                      className={`cal-day ${hasData ? 'has-data' : ''} ${dk === today ? 'today' : ''} ${selectedDay === dk ? 'today' : ''}`}
                      style={hasData ? { background: `rgba(27,109,235,${op})` } : {}}
                      onClick={() => showDay(dk)}
                    >
                      <div className="cd-num">{d}</div>
                      {hasData && <div className="cd-hrs">{h.toFixed(1).replace('.0', '')}ч</div>}
                      {(hasPlan || hasNote || hasFile) && (
                        <div className="cd-dot">
                          {hasPlan && <i />}
                          {hasNote && <i style={{ background: 'var(--purple)' }} />}
                          {hasFile && <i style={{ background: 'var(--green)' }} />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="cal-legend">
                <span><i style={{ background: 'var(--bg)', border: '1px solid var(--line)' }} /> 0 ч</span>
                <span><i style={{ background: 'rgba(27,109,235,.3)' }} /> мало</span>
                <span><i style={{ background: 'rgba(27,109,235,.6)' }} /> средне</span>
                <span><i style={{ background: 'rgba(27,109,235,1)' }} /> много</span>
              </div>
            </div>

            {dayDetailCard && (
              <div className="card" style={{ marginTop: 18, animation: 'dayExpand .4s cubic-bezier(.22,.9,.36,1)' }}>
                <h2>📌 {dayDetailCard.title}</h2>

                {/* Hours */}
                <div className="dd-section">
                  <h4>⏱ Часы: {dayDetailCard.h.toFixed(1).replace('.0', '')} ч</h4>
                  {dayDetailCard.dayE.length > 0 ? dayDetailCard.dayE.map((e, i) => (
                    <div key={i} className="dd-item">
                      <span><span className="tag">{e.type}</span> {e.hrs} ч</span>
                      <button className="x" onClick={() => delDayEntry(entries.indexOf(e))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 17 }}>×</button>
                    </div>
                  )) : <div className="dd-empty">В этот день не занимался</div>}
                  <div className="logrow" style={{ marginTop: 8 }}>
                    <select value={ddType} onChange={e => setDdType(e.target.value)}>
                      <option>Листочек</option><option>Веб</option><option>ДЗ</option><option>Экзамен</option><option>Другое</option>
                    </select>
                    <input type="number" value={ddHrs} onChange={e => setDdHrs(e.target.value)} placeholder="часы" step={0.5} min={0} style={{ width: 90 }} />
                    <button className="btn" onClick={() => addDayEntry(dayDetailCard.dk)}>+ Часы</button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="dd-section">
                  <h4>🗂 Планы и задачи</h4>
                  {dayDetailCard.dayTasks.length > 0 ? dayDetailCard.dayTasks.map((t, i) => {
                    const taskIdx = tasks.indexOf(t)
                    return (
                      <div key={i} className="dd-item">
                        <span style={{ cursor: 'pointer' }} onClick={() => toggleDayTask(taskIdx)}>{t.done ? '✅' : '⬜'} {t.txt}</span>
                        <button className="x" onClick={() => delDayTask(taskIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 17 }}>×</button>
                      </div>
                    )
                  }) : <div className="dd-empty">Планов на этот день нет</div>}
                  <div className="plan-add" style={{ marginTop: 8, marginBottom: 0 }}>
                    <input value={ddTask} onChange={e => setDdTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDayTask(dayDetailCard.dk)} placeholder="Добавить задачу на этот день" />
                    <button className="btn" onClick={() => addDayTask(dayDetailCard.dk)}>+</button>
                  </div>
                </div>

                {/* Solves */}
                <div className="dd-section">
                  <h4>📐 Решённые задачи</h4>
                  {dayDetailCard.daySolves.length > 0 ? dayDetailCard.daySolves.map((s, i) => (
                    <div key={i} className="dd-item">
                      <span>{s.mood === 'ok' ? '✅' : s.mood === 'hint' ? '💡' : '❌'} {s.topic}</span>
                      <span>{s.count} шт</span>
                    </div>
                  )) : <div className="dd-empty">Задач не отмечено</div>}
                </div>

                {/* Files */}
                <div className="dd-section">
                  <h4>📎 Файлы за день</h4>
                  <div className="mat-grid" style={{ marginTop: 0, marginBottom: 10 }}>
                    {dayDetailCard.dayFiles.map((f, i) => (
                      <div key={i} className="mat">
                        <button className="x" onClick={() => delDayFile(dayDetailCard.dk, i)}>×</button>
                        <div className="mat-open">
                          {f.type.startsWith('image') ? <img src={f.data} alt={f.name} /> : <div className="doc">📄</div>}
                          <div className="fname">{f.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label className="mat-drop" style={{ padding: 16 }}>
                    📎 Прикрепить файл к этому дню
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => addDayFile(dayDetailCard.dk, e)} />
                  </label>
                </div>

                {/* Day note */}
                <div className="dd-section">
                  <h4>📝 Заметка дня</h4>
                  <textarea
                    className="notes-area"
                    style={{ minHeight: 80 }}
                    placeholder="Что было в этот день, какие мысли, ошибки, инсайты..."
                    value={ddNote}
                    onChange={e => { setDdNote(e.target.value); saveDayNote(dayDetailCard.dk, e.target.value) }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="calendar" />
    </>
  )
}

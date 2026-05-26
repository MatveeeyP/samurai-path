'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'
import { load, save, todayKey, Solve } from '@/lib/storage'

interface TopicGroup {
  name: string
  ok: number
  hint: number
  fail: number
  total: number
  lastDate: string
}

export default function TasksPage() {
  const router = useRouter()
  const { cfg, solves, setSolves, toast, checkAch } = useApp()
  const [showSettings, setShowSettings] = useState(false)
  const [topicInput, setTopicInput] = useState('')
  const [countInput, setCountInput] = useState('')
  const [mood, setMood] = useState<'ok' | 'hint' | 'fail'>('ok')

  function navTo(page: string) {
    if (page === 'tasks2') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  function addSolve() {
    const topic = topicInput.trim()
    const count = parseInt(countInput)
    if (!topic || !count || count <= 0) return
    const newSolve: Solve = { topic, count, mood, date: todayKey() }
    const updated = [newSolve, ...solves]
    setSolves(updated)
    setTopicInput('')
    setCountInput('')
    toast(`+${count} задач по "${topic}" (${mood === 'ok' ? '✅' : mood === 'hint' ? '💡' : '❌'})`)
    checkAch()
  }

  const topicGroups = useMemo<TopicGroup[]>(() => {
    const map = new Map<string, TopicGroup>()
    for (const s of solves) {
      const existing = map.get(s.topic)
      if (existing) {
        existing[s.mood] += s.count
        existing.total += s.count
        if (s.date > existing.lastDate) existing.lastDate = s.date
      } else {
        map.set(s.topic, {
          name: s.topic,
          ok: s.mood === 'ok' ? s.count : 0,
          hint: s.mood === 'hint' ? s.count : 0,
          fail: s.mood === 'fail' ? s.count : 0,
          total: s.count,
          lastDate: s.date,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [solves])

  // Spaced repetition: topics with fails not touched in 2+ days
  const today = todayKey()
  const todayDate = new Date(today)
  const repTopics = topicGroups.filter(tg => {
    if (tg.fail === 0) return false
    const last = new Date(tg.lastDate)
    const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / 86400000)
    return diffDays >= 2
  })

  function markReviewed(topicName: string) {
    const newSolve: Solve = { topic: topicName, count: 1, mood: 'ok', date: today }
    const updated = [newSolve, ...solves]
    setSolves(updated)
    toast(`Тема "${topicName}" повторена!`)
    checkAch()
  }

  function deleteTopic(topicName: string) {
    const updated = solves.filter(s => s.topic !== topicName)
    setSolves(updated)
    toast(`Тема "${topicName}" удалена`)
  }

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📐</div>
          <div className="tx">
            <b>Решалка задач</b>
            <span>Отслеживай темы и повторяй ошибки по интервальному методу</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="tasks2" onNavigate={navTo} />
          <div className="page-host">
            <div className="grid">
              {/* Add solve card */}
              <div className="card">
                <h2>➕ Добавить решение</h2>
                <div className="sub">Запиши тему, количество и как пошло</div>

                <div className="field">
                  <label>Тема задачи</label>
                  <input
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSolve()}
                    placeholder="напр.: Тригонометрия, ОГЭ задача 14..."
                    style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--line)', borderRadius: 12, padding: '11px 14px', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}
                  />
                </div>

                <div className="field">
                  <label>Количество задач</label>
                  <input
                    type="number"
                    value={countInput}
                    onChange={e => setCountInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSolve()}
                    placeholder="5"
                    min={1}
                    style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--line)', borderRadius: 12, padding: '11px 14px', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}
                  />
                </div>

                <div className="field">
                  <label>Как пошло?</label>
                  <div className="solve-mood">
                    <button
                      className={`sm-btn ${mood === 'ok' ? 'on' : ''}`}
                      onClick={() => setMood('ok')}
                    >
                      ✅ Сам
                    </button>
                    <button
                      className={`sm-btn ${mood === 'hint' ? 'on' : ''}`}
                      onClick={() => setMood('hint')}
                    >
                      💡 С подсказкой
                    </button>
                    <button
                      className={`sm-btn ${mood === 'fail' ? 'on' : ''}`}
                      onClick={() => setMood('fail')}
                    >
                      ❌ Не смог
                    </button>
                  </div>
                </div>

                <button className="btn" style={{ width: '100%' }} onClick={addSolve}>
                  Записать решение
                </button>

                <div style={{ marginTop: 16, background: 'var(--bg)', borderRadius: 12, padding: '12px 14px', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                  Всего задач решено: <span style={{ color: 'var(--blue)', fontSize: 16, fontWeight: 900 }}>
                    {solves.reduce((s, x) => s + x.count, 0)}
                  </span>
                  {' · '}✅ {solves.filter(s => s.mood === 'ok').reduce((s, x) => s + x.count, 0)}
                  {' · '}💡 {solves.filter(s => s.mood === 'hint').reduce((s, x) => s + x.count, 0)}
                  {' · '}❌ {solves.filter(s => s.mood === 'fail').reduce((s, x) => s + x.count, 0)}
                </div>
              </div>

              {/* Spaced repetition */}
              <div className="card">
                <h2>🔄 Повторить сейчас</h2>
                <div className="sub">Темы с ошибками, которые не трогались 2+ дня</div>
                {repTopics.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: '16px 0' }}>
                    Нет тем для повторения — отлично! 🎉
                  </div>
                ) : (
                  repTopics.map(tg => {
                    const lastDate = new Date(tg.lastDate)
                    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000)
                    return (
                      <div key={tg.name} className="rep-card">
                        <div className="re">🧠</div>
                        <div className="rt">
                          {tg.name}
                          <span>❌ {tg.fail} провалов · не трогал {diffDays} дн.</span>
                        </div>
                        <button onClick={() => markReviewed(tg.name)}>Повторил</button>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Topic stats */}
              <div className="card full">
                <h2>📊 Статистика по темам</h2>
                <div className="sub">Прогресс по каждой теме — зелёный: сам, оранжевый: с подсказкой, красный: провал</div>
                {topicGroups.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>
                    Пока нет решений — добавь первое выше 👆
                  </div>
                ) : (
                  <div className="topic-stats">
                    {topicGroups.map(tg => {
                      const okPct = tg.total > 0 ? Math.round(tg.ok / tg.total * 100) : 0
                      const hintPct = tg.total > 0 ? Math.round(tg.hint / tg.total * 100) : 0
                      const failPct = tg.total > 0 ? 100 - okPct - hintPct : 0
                      return (
                        <div key={tg.name} className="topic">
                          <div className="topic-head">
                            <b>{tg.name}</b>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="cnt">{tg.total} задач</span>
                              <button
                                style={{ background: 'none', color: 'var(--muted)', fontSize: 16, padding: '0 4px' }}
                                onClick={() => deleteTopic(tg.name)}
                                title="Удалить тему"
                              >×</button>
                            </div>
                          </div>
                          <div className="topic-bar">
                            {okPct > 0 && <div className="ok" style={{ width: okPct + '%' }} />}
                            {hintPct > 0 && <div className="hint" style={{ width: hintPct + '%' }} />}
                            {failPct > 0 && <div className="fail" style={{ width: failPct + '%' }} />}
                          </div>
                          <div className="topic-legend">
                            ✅ сам: {tg.ok} · 💡 подсказка: {tg.hint} · ❌ провал: {tg.fail}
                            {' · '}последний раз: {tg.lastDate.slice(5)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="tasks2" />
    </>
  )
}

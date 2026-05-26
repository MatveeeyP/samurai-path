'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { load, save, todayKey } from '@/lib/storage'
import type { Task } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

interface Template {
  name: string
  tasks: { txt: string; big: boolean }[]
  savedAt: string
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { cfg, entries, tasks, setTasks, toast } = useApp()
  const [showSettings, setShowSettings] = useState(false)
  const [tplName, setTplName] = useState('')
  const [hoursNeeded, setHoursNeeded] = useState('')
  const [deadline, setDeadline] = useState('')

  function navTo(page: string) {
    if (page === 'analytics') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  // Type bars: group entries by type
  const typeBars = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of entries) {
      map[e.type] = (map[e.type] || 0) + e.hrs
    }
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([type, hrs]) => ({ type, hrs, pct: Math.round(hrs / total * 100) }))
  }, [entries])

  // Hours calculator
  const calcResult = useMemo(() => {
    const h = parseFloat(hoursNeeded)
    if (!h || !deadline) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const end = new Date(deadline)
    end.setHours(0, 0, 0, 0)
    const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000)
    if (daysLeft <= 0) return null
    const hPerDay = h / daysLeft
    return { hPerDay: Math.round(hPerDay * 10) / 10, daysLeft }
  }, [hoursNeeded, deadline])

  // Templates
  const templates = load<Template[]>('v21_tpls', [])

  function saveTemplate() {
    const name = tplName.trim()
    if (!name) return
    const currentTasks = tasks.filter(t => !t.big && t.date === todayKey())
    if (currentTasks.length === 0) {
      toast('Нет задач на сегодня для сохранения')
      return
    }
    const tpl: Template = {
      name,
      tasks: currentTasks.map(t => ({ txt: t.txt, big: t.big })),
      savedAt: todayKey(),
    }
    const existing = load<Template[]>('v21_tpls', [])
    const updated = [tpl, ...existing.filter(t => t.name !== name)]
    save('v21_tpls', updated)
    setTplName('')
    toast(`Шаблон "${name}" сохранён (${tpl.tasks.length} задач)`)
  }

  function applyTemplate(tpl: Template) {
    const today = todayKey()
    const newTasks: Task[] = tpl.tasks.map(t => ({ txt: t.txt, big: t.big, done: false, date: today }))
    const merged = [...newTasks, ...tasks.filter(t => t.date !== today)]
    setTasks(merged)
    toast(`Шаблон "${tpl.name}" применён — ${tpl.tasks.length} задач добавлено`)
  }

  function deleteTemplate(name: string) {
    const updated = templates.filter(t => t.name !== name)
    save('v21_tpls', updated)
    toast('Шаблон удалён')
    // force re-render
    window.location.reload()
  }

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📊</div>
          <div className="tx">
            <b>Аналитика</b>
            <span>Типы занятий, калькулятор, шаблоны</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="analytics" onNavigate={navTo} />
          <div className="page-host">

            {/* Type bars */}
            <div className="card">
              <h2>📊 По типам занятий</h2>
              <div className="sub">Как распределяются часы по типам</div>
              {typeBars.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: '8px 0' }}>
                  Нет данных — начни записывать часы на главной!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  {typeBars.map(({ type, hrs, pct }) => (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                        <span>{type}</span>
                        <span style={{ color: 'var(--blue)' }}>{hrs.toFixed(1)} ч · {pct}%</span>
                      </div>
                      <div style={{ height: 10, background: 'var(--line)', borderRadius: 6, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: pct + '%',
                            height: '100%',
                            background: 'var(--blue)',
                            borderRadius: 6,
                            transition: 'width .4s',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hours calculator */}
            <div className="card">
              <h2>🧮 Калькулятор часов</h2>
              <div className="sub">Сколько часов в день нужно до дедлайна?</div>
              <div className="logrow" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <input
                  type="number"
                  value={hoursNeeded}
                  onChange={e => setHoursNeeded(e.target.value)}
                  placeholder="Всего часов нужно"
                  min={1}
                  style={{ flex: '1 1 140px' }}
                />
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  style={{ flex: '1 1 140px' }}
                />
              </div>
              {calcResult && (
                <div style={{
                  marginTop: 12, padding: '14px 16px',
                  background: 'var(--blue-soft)',
                  borderRadius: 12, border: '1.5px solid var(--blue)',
                }}>
                  <div style={{ fontWeight: 900, fontSize: 22, color: 'var(--blue)' }}>
                    {calcResult.hPerDay} ч/день
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginTop: 4 }}>
                    {hoursNeeded} ч за {calcResult.daysLeft} дней до {deadline.slice(5).replace('-', '/')}
                  </div>
                </div>
              )}
              {hoursNeeded && deadline && !calcResult && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#e53e3e', fontWeight: 700 }}>
                  Дедлайн уже прошёл или некорректные данные
                </div>
              )}
            </div>

            {/* Day templates */}
            <div className="card">
              <h2>📋 Шаблоны дня</h2>
              <div className="sub">Сохрани задачи сегодняшнего дня как шаблон и применяй в будущем</div>
              <div className="logrow" style={{ marginTop: 8, gap: 8 }}>
                <input
                  value={tplName}
                  onChange={e => setTplName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveTemplate()}
                  placeholder="Название шаблона (напр.: Типичный день)"
                  style={{ flex: 1 }}
                />
                <button className="btn" onClick={saveTemplate}>Сохранить</button>
              </div>

              {templates.length > 0 ? (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {templates.map((tpl, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'var(--bg)', border: '1.5px solid var(--line)',
                        borderRadius: 10, padding: '10px 12px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 13 }}>{tpl.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                          {tpl.tasks.length} задач · сохранён {tpl.savedAt.slice(5).replace('-', '/')}
                        </div>
                      </div>
                      <button
                        className="sm-btn"
                        onClick={() => applyTemplate(tpl)}
                        style={{ fontSize: 11 }}
                      >
                        Применить
                      </button>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, cursor: 'pointer' }}
                        onClick={() => deleteTemplate(tpl.name)}
                      >×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                  Шаблонов нет. Добавь задачи на сегодня в Планах, затем сохрани шаблон.
                </div>
              )}
            </div>

            {/* PDF export */}
            <div className="card">
              <h2>🖨 Экспорт</h2>
              <div className="sub">Распечатать страницу как PDF через браузер</div>
              <button
                className="btn"
                style={{ marginTop: 8 }}
                onClick={() => window.print()}
              >
                📄 Печать / Сохранить как PDF
              </button>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                Браузер откроет диалог печати. Выбери «Сохранить как PDF» для экспорта.
              </div>
            </div>

          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="analytics" />
    </>
  )
}

'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp, ACH_LIST } from '@/lib/AppContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'
import { weekTotalFor, Entry } from '@/lib/storage'

function getWeekHours(entries: Entry[], offset: number): number {
  return weekTotalFor(entries, offset)
}

function getMonthHours(entries: Entry[]): number {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return entries
    .filter(e => {
      const d = new Date(e.date)
      return d.getFullYear() === y && d.getMonth() === m
    })
    .reduce((s, e) => s + e.hrs, 0)
}

export default function ProgressPage() {
  const router = useRouter()
  const { cfg, entries, solves, achGot, streak, xp, level } = useApp()
  const [showSettings, setShowSettings] = useState(false)

  function navTo(page: string) {
    if (page === 'progress') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  const thisWeek = useMemo(() => getWeekHours(entries, 0), [entries])
  const lastWeek = useMemo(() => getWeekHours(entries, 1), [entries])
  const monthHours = useMemo(() => getMonthHours(entries), [entries])
  const allTimeHours = useMemo(() => entries.reduce((s, e) => s + e.hrs, 0), [entries])
  const totalSolves = useMemo(() => solves.reduce((s, x) => s + x.count, 0), [solves])

  // Sparkline: last 8 weeks
  const sparkData = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => getWeekHours(entries, 7 - i))
  }, [entries])
  const sparkMax = Math.max(...sparkData, 1)

  // Retrospective: this week vs last week by day
  const weekDiff = thisWeek - lastWeek
  const weekDiffPct = lastWeek > 0 ? Math.round(weekDiff / lastWeek * 100) : 0

  // Path to goal steps
  const weekGoal = cfg?.weekGoal || 48
  const hasEntries = entries.length > 0
  const hasStreak7 = streak >= 7
  const hasWeekGoal = thisWeek >= weekGoal
  const hasMainGoal = !!(cfg?.mainGoal)

  const pathSteps = [
    { label: 'Первый час', desc: 'Записал первый час учёбы', done: hasEntries, icon: '🌱' },
    { label: '7 дней подряд', desc: `Серия ${streak} из 7 дней`, done: hasStreak7, icon: '🔥' },
    { label: `${weekGoal} ч в неделю`, desc: `Эта неделя: ${thisWeek.toFixed(1)} ч`, done: hasWeekGoal, icon: '🎯' },
    { label: 'Главная цель', desc: cfg?.mainGoal || 'Не задана', done: hasMainGoal, icon: '🏆' },
    { label: 'Олимпиада 21 мая', desc: 'Главный день', done: false, icon: '🎓' },
  ]

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📈</div>
          <div className="tx">
            <b>Прогресс</b>
            <span>Твоя статистика, ретроспектива и путь к цели</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="progress" onNavigate={navTo} />
          <div className="page-host">

            {/* Stats */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h2>📊 Статистика</h2>
              <div className="sub">Часы учёбы за разные периоды</div>
              <div className="stat-big">
                <div className="stat-group">
                  <div className="sg-title">Эта неделя</div>
                  <div className="sg-row">
                    <span className="sg-label">Часов</span>
                    <span className="sg-val">{thisWeek.toFixed(1).replace('.0', '')} <small>ч</small></span>
                  </div>
                  <div className="sg-row">
                    <span className="sg-label">Цель</span>
                    <span className="sg-val">{weekGoal} <small>ч</small></span>
                  </div>
                  <div className="sg-row">
                    <span className="sg-label">Выполнение</span>
                    <span className="sg-val">{Math.min(100, Math.round(thisWeek / weekGoal * 100))} <small>%</small></span>
                  </div>
                </div>
                <div className="stat-group">
                  <div className="sg-title">Этот месяц</div>
                  <div className="sg-row">
                    <span className="sg-label">Часов</span>
                    <span className="sg-val">{monthHours.toFixed(1).replace('.0', '')} <small>ч</small></span>
                  </div>
                  <div className="sg-row">
                    <span className="sg-label">Задач решено</span>
                    <span className="sg-val">{totalSolves}</span>
                  </div>
                  <div className="sg-row">
                    <span className="sg-label">Серия</span>
                    <span className="sg-val" style={{ color: 'var(--fire)' }}>{streak} <small>дн.</small></span>
                  </div>
                </div>
                <div className="stat-group">
                  <div className="sg-title">Всё время</div>
                  <div className="sg-row">
                    <span className="sg-label">Всего часов</span>
                    <span className="sg-val">{allTimeHours.toFixed(1).replace('.0', '')} <small>ч</small></span>
                  </div>
                  <div className="sg-row">
                    <span className="sg-label">Уровень</span>
                    <span className="sg-val" style={{ color: 'var(--orange)' }}>{level.lvl}</span>
                  </div>
                  <div className="sg-row">
                    <span className="sg-label">XP</span>
                    <span className="sg-val">{xp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Retrospective */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h2>🔁 Ретроспектива</h2>
              <div className="sub">Эта неделя vs прошлая</div>
              <div className="retro">
                <div className="rc">
                  <b>{thisWeek.toFixed(1)}</b>
                  <span>эта неделя</span>
                  <div className={`trend ${weekDiff >= 0 ? 'trend-up' : 'trend-down'}`}>
                    {weekDiff >= 0 ? '↑' : '↓'} {Math.abs(weekDiff).toFixed(1)} ч
                  </div>
                </div>
                <div className="rc">
                  <b>{lastWeek.toFixed(1)}</b>
                  <span>прошлая неделя</span>
                  <div className="trend" style={{ color: 'var(--muted)' }}>базовый уровень</div>
                </div>
                <div className="rc">
                  <b>{weekDiff >= 0 ? '+' : ''}{weekDiffPct}%</b>
                  <span>изменение</span>
                  <div className={`trend ${weekDiffPct >= 0 ? 'trend-up' : 'trend-down'}`}>
                    {weekDiffPct >= 0 ? '📈 рост' : '📉 спад'}
                  </div>
                </div>
                <div className="rc">
                  <b>{Math.round(allTimeHours / Math.max(1, new Set(entries.map(e => e.date)).size) * 10) / 10}</b>
                  <span>ч/день среднее</span>
                  <div className="trend" style={{ color: 'var(--blue)' }}>за всё время</div>
                </div>
              </div>

              {/* Sparkline */}
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 4 }}>
                Последние 8 недель (ч)
              </div>
              <div className="spark">
                {sparkData.map((v, i) => (
                  <i
                    key={i}
                    style={{ height: Math.max(3, Math.round(v / sparkMax * 100)) + '%' }}
                    title={`${v.toFixed(1)} ч`}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', fontWeight: 700, marginTop: 4 }}>
                <span>7 нед. назад</span>
                <span>эта неделя</span>
              </div>
            </div>

            {/* Path to goal */}
            <div className="card" style={{ marginBottom: 18 }}>
              <h2>🗺 Путь к цели</h2>
              <div className="sub">Шаги на пути к Олимпиаде 21 мая</div>
              <div className="path">
                {pathSteps.map((step, i) => (
                  <div key={i} className={`pstep ${step.done ? 'done' : ''}`}>
                    <div className="pdot">{step.done ? '✓' : step.icon}</div>
                    <div className="ptxt">
                      <b>{step.label}</b>
                      <span>{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h2>🏅 Достижения</h2>
              <div className="sub">Получено {achGot.length} из {ACH_LIST.length}</div>
              <div className="ach-grid">
                {ACH_LIST.map(a => (
                  <div key={a.id} className={`ach ${achGot.includes(a.id) ? 'got' : ''}`}>
                    <div className="ae">{a.e}</div>
                    <div className="at">{a.t}</div>
                    <div className="ad">{a.d}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="progress" />
    </>
  )
}

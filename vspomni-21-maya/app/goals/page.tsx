'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { Goal } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

export default function GoalsPage() {
  const router = useRouter()
  const { cfg, goals, setGoals } = useApp()
  const [goalName, setGoalName] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  function addGoal() {
    if (!goalName.trim() || !goalDate) return
    const newGoal: Goal = { name: goalName.trim(), date: goalDate }
    const newGoals = [...goals, newGoal].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setGoals(newGoals)
    setGoalName(''); setGoalDate('')
  }

  function delGoal(i: number) {
    const ng = [...goals]; ng.splice(i, 1); setGoals(ng)
  }

  function navTo(page: string) {
    if (page === 'goals') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📌</div>
          <div className="tx"><b>Зачем ты здесь</b><span>{cfg.mainGoal}</span></div>
        </div>
        <div className="app-body">
          <Navigation currentPage="goals" onNavigate={navTo} />
          <div className="page-host">
            <div className="card">
              <h2>🎯 Мои цели</h2>
              <div className="sub">Реальный обратный отсчёт от сегодня. Добавляй и удаляй свои.</div>
              <div className="plan-add">
                <input value={goalName} onChange={e => setGoalName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} placeholder="Напр.: Турнир Городов осенний" />
                <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} className="date" />
                <button className="btn" onClick={addGoal}>+</button>
              </div>
              <div className="deadlines">
                {goals.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>Целей пока нет. Добавь свою первую.</div>}
                {goals.map((g, i) => {
                  const diff = Math.ceil((new Date(g.date).getTime() - Date.now()) / 864e5)
                  return (
                    <div key={i} className="dl">
                      <button className="x" onClick={() => delGoal(i)}>×</button>
                      <div className="dname">{g.name}</div>
                      <div className="ddays">{diff > 0 ? diff : '—'}</div>
                      <div className="dunit">{diff > 0 ? 'дней осталось' : 'прошло'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="goals" />
    </>
  )
}

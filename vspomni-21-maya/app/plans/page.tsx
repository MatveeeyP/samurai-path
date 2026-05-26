'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { Task } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

export default function PlansPage() {
  const router = useRouter()
  const { cfg, tasks, setTasks, toast } = useApp()
  const [planTab, setPlanTab] = useState<'day' | 'big'>('day')
  const [taskInput, setTaskInput] = useState('')
  const [taskDate, setTaskDate] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  if (!cfg) return null

  function addTask() {
    if (!taskInput.trim()) return
    const newTask: Task = { txt: taskInput, done: false, date: taskDate, big: planTab === 'big' }
    setTasks([...tasks, newTask])
    setTaskInput(''); setTaskDate('')
  }

  function toggleTask(i: number) {
    const nt = [...tasks]; nt[i].done = !nt[i].done; setTasks(nt)
  }

  function delTask(i: number) {
    const nt = [...tasks]; nt.splice(i, 1); setTasks(nt)
  }

  function navTo(page: string) {
    if (page === 'plan') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  const list = tasks.map((t, i) => ({ ...t, _i: i })).filter(t => t.big === (planTab === 'big'))

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
          <Navigation currentPage="plan" onNavigate={navTo} />
          <div className="page-host">
            <div className="card">
              <h2>🗂 Мои планы</h2>
              <div className="sub">Задачи на сегодня и грандиозные цели с датами.</div>
              <div className="plan-tabs">
                <button className={planTab === 'day' ? 'on' : ''} onClick={() => setPlanTab('day')}>📅 На сегодня</button>
                <button className={planTab === 'big' ? 'on' : ''} onClick={() => setPlanTab('big')}>🚀 Грандиозные цели</button>
              </div>
              <div className="plan-add">
                <input
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder={planTab === 'day' ? 'Напр.: прорешать листочек по комбинаторике' : 'Напр.: взять олимпиаду осенью'}
                />
                <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} className="date" />
                <button className="btn" onClick={addTask}>+</button>
              </div>
              <div className="tasks">
                {list.length === 0 && (
                  <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>
                    {planTab === 'big' ? 'Грандиозных целей пока нет.' : 'План пуст. Добавь первый шаг.'}
                  </div>
                )}
                {list.map(t => {
                  let meta = ''
                  if (t.date) {
                    const diff = Math.ceil((new Date(t.date).getTime() - Date.now()) / 864e5)
                    meta = diff > 0 ? 'через ' + diff + ' дн' : diff === 0 ? 'сегодня' : 'просрочено'
                  }
                  return (
                    <div key={t._i} className={`task ${t.done ? 'done' : ''} ${t.big ? 'big' : ''}`}
                      draggable
                    >
                      <div className="chk" onClick={() => toggleTask(t._i)}>{t.done ? '✓' : ''}</div>
                      <div className="ttxt">{t.txt}</div>
                      {meta && <span className="meta">{meta}</span>}
                      <button className="x" onClick={() => delTask(t._i)}>×</button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="plan" />
    </>
  )
}

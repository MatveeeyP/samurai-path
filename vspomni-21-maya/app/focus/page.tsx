'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { todayKey, save, Entry } from '@/lib/storage'
import { beep } from '@/lib/sounds'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

function pfmt(s: number): string {
  const m = Math.floor(s / 60), x = Math.floor(s % 60)
  return String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0')
}

export default function FocusPage() {
  const router = useRouter()
  const { cfg, entries, setEntries, pomoToday, setPomoToday, toast, checkAch } = useApp()
  const [pomoOn, setPomoOn] = useState(false)
  const [pomoLeft, setPomoLeft] = useState(25 * 60)
  const [pomoPhase, setPomoPhase] = useState<'work' | 'break'>('work')
  const [pomoWarn, setPomoWarn] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const lastTickRef = useRef(Date.now())
  const pomoIntRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Tab visibility protection
    function onVisibility() {
      if (document.hidden && pomoOn && pomoPhase === 'work') {
        setPomoWarn('⚠️ Ты ушёл со вкладки! Вернись к задаче.')
        document.title = '⚠️ Вернись к фокусу!'
      } else {
        document.title = 'Вспомни 21 мая'
        if (pomoOn) setPomoWarn('')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [pomoOn, pomoPhase])

  useEffect(() => {
    if (pomoOn) {
      lastTickRef.current = Date.now()
      pomoIntRef.current = setInterval(() => {
        const now = Date.now()
        const dt = (now - lastTickRef.current) / 1000
        lastTickRef.current = now
        setPomoLeft(prev => {
          const next = prev - dt
          if (next <= 0) {
            // Phase complete
            if (pomoPhase === 'work') {
              const newCount = pomoToday + 1
              setPomoToday(newCount)
              // Add 0.4h to entries
              const newEntry: Entry = { type: 'Листочек', hrs: 0.4, date: todayKey(), hour: new Date().getHours() }
              setEntries([newEntry, ...entries])
              save('v21_entries', [newEntry, ...entries])
              setPomoPhase('break')
              toast('🍅 Помидор готов! +25 мин засчитано. Отдохни.')
              beep()
              checkAch()
              return 5 * 60
            } else {
              setPomoPhase('work')
              toast('Перерыв окончен. Поехали ещё круг 💪')
              beep()
              return 25 * 60
            }
          }
          // Tick sound every 30s
          if (pomoPhase === 'work' && Math.floor(prev) % 30 === 0 && dt < 2) {
            try {
              const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
              const a = new AudioCtx(); const o = a.createOscillator(); const g = a.createGain(); o.connect(g); g.connect(a.destination)
              o.frequency.value = 1000; o.type = 'square'; g.gain.value = 0.03; o.start(); o.stop(a.currentTime + 0.05)
              setTimeout(() => a.close(), 200)
            } catch { /* ignore */ }
          }
          return next
        })
      }, 250)
      return () => { if (pomoIntRef.current) clearInterval(pomoIntRef.current) }
    }
  }, [pomoOn, pomoPhase, pomoToday, entries])

  function togglePomo() {
    if (!pomoOn) {
      setPomoOn(true)
      lastTickRef.current = Date.now()
    } else {
      setPomoOn(false)
      if (pomoIntRef.current) clearInterval(pomoIntRef.current)
    }
  }

  function resetPomo() {
    setPomoOn(false)
    if (pomoIntRef.current) clearInterval(pomoIntRef.current)
    setPomoPhase('work')
    setPomoLeft(25 * 60)
    setPomoWarn('')
  }

  function navTo(page: string) {
    if (page === 'focus') return
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
          <div className="tx">
            <b>Зачем ты здесь</b>
            <span>{cfg.mainGoal}</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="focus" onNavigate={navTo} />
          <div className="page-host">
            <div className="card">
              <h2>🍅 Фокус-режим</h2>
              <div className="sub">Помодоро: 25 мин работы / 5 отдыха. Поймает, если уйдёшь со вкладки. Каждый помидор = +25 мин в часы.</div>
              <div className="pomo">
                <div className="pomo-ring" style={{ color: pomoPhase === 'break' ? 'var(--green)' : 'var(--blue)' }}>
                  {pfmt(Math.max(0, Math.ceil(pomoLeft)))}
                </div>
                <div className={`pomo-phase ${pomoPhase === 'break' ? 'break' : ''}`}>
                  {!pomoOn && pomoPhase === 'work' ? 'готов к работе' : pomoPhase === 'work' ? 'фокус 25 мин' : 'перерыв 5 мин'}
                </div>
                <div className="pomo-ctrl">
                  <button className={`btn ${!pomoOn ? 'btn-grn' : ''}`} onClick={togglePomo}>
                    {pomoOn ? '⏸ Пауза' : pomoPhase === 'work' ? '▶ Фокус' : '▶ Продолжить'}
                  </button>
                  <button className="ai-btn" onClick={resetPomo}>Сброс</button>
                </div>
                <div className="pomo-warn">{pomoWarn}</div>
                <div className="pomo-count">Помидоров сегодня: {pomoToday}</div>
              </div>

              {/* Progress ring visualization */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                <svg width={200} height={200} viewBox="0 0 200 200">
                  <circle cx={100} cy={100} r={80} fill="none" stroke="var(--line)" strokeWidth={12} />
                  <circle
                    cx={100} cy={100} r={80} fill="none"
                    stroke={pomoPhase === 'break' ? 'var(--green)' : 'var(--blue)'}
                    strokeWidth={12}
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - (pomoPhase === 'work' ? 1 - pomoLeft / (25 * 60) : 1 - pomoLeft / (5 * 60)))}`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dashoffset .25s linear' }}
                  />
                  <text x={100} y={95} textAnchor="middle" style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 32, fill: pomoPhase === 'break' ? 'var(--green)' : 'var(--blue)' }}>
                    {pfmt(Math.max(0, Math.ceil(pomoLeft)))}
                  </text>
                  <text x={100} y={120} textAnchor="middle" style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, fill: 'var(--muted)' }}>
                    {pomoPhase === 'work' ? 'фокус' : 'отдых'}
                  </text>
                </svg>
              </div>

              {/* Sessions today */}
              {pomoToday > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {Array.from({ length: pomoToday }, (_, i) => (
                    <span key={i} style={{ fontSize: 24 }}>🍅</span>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="card" style={{ marginTop: 18 }}>
              <h2>💡 Правила фокуса</h2>
              <div className="sub">Методика Помодоро — максимальная концентрация за счёт ритма работы и отдыха.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                {[
                  ['🎯', 'Перед стартом', 'Выбери ОДНУ задачу. Запиши её на бумаге.'],
                  ['📵', 'Во время работы', 'Телефон отвернуть. Уведомления выключить. Одна вкладка.'],
                  ['☕', 'На перерыве', 'Встань, потянись, выпей воды. Не смотри ленту.'],
                  ['📝', 'После помодора', 'Зачеркни задачу или запиши прогресс. Маленькая победа!'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--bg)', borderRadius: 12, border: '1.5px solid var(--line)' }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="focus" />
    </>
  )
}

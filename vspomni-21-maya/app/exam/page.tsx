'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { load, save } from '@/lib/storage'
import type { ExamConfig } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

export default function ExamPage() {
  const router = useRouter()
  const { cfg, toast } = useApp()
  const [showSettings, setShowSettings] = useState(false)

  const [examName, setExamName] = useState('')
  const [examDate, setExamDate] = useState('')

  // Score calculator
  const [score1, setScore1] = useState('')
  const [score2, setScore2] = useState('')
  const [score3, setScore3] = useState('')

  useEffect(() => {
    const saved = load<ExamConfig | null>('v21_exam', null)
    if (saved) {
      setExamName(saved.name)
      setExamDate(saved.date)
    }
  }, [])

  function navTo(page: string) {
    if (page === 'exam') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  function saveExam() {
    const name = examName.trim()
    if (!name || !examDate) return
    save('v21_exam', { name, date: examDate })
    toast(`Экзамен "${name}" сохранён`)
  }

  function daysLeft(): number | null {
    if (!examDate) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(examDate)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target.getTime() - now.getTime()) / 86400000)
  }

  const days = daysLeft()

  function scoreNum(v: string): number {
    const n = parseInt(v)
    return isNaN(n) ? 0 : Math.max(0, Math.min(100, n))
  }

  const total = scoreNum(score1) + scoreNum(score2) + scoreNum(score3)

  function scoreColor(d: number | null): string {
    if (d === null) return 'var(--blue)'
    if (d < 0) return 'var(--muted)'
    if (d <= 7) return '#e53e3e'
    if (d <= 30) return 'var(--orange)'
    return 'var(--blue)'
  }

  function urgencyMsg(d: number | null): string {
    if (d === null) return ''
    if (d < 0) return 'Экзамен прошёл'
    if (d === 0) return '🔴 Сегодня!'
    if (d === 1) return '🔴 Завтра!'
    if (d <= 7) return `⚠️ Срочно — ${d} дней!`
    if (d <= 30) return `📅 ${d} дней`
    return `${d} дней`
  }

  function gradeLabel(t: number): string {
    if (t >= 270) return '🏆 Отлично! Призёр!'
    if (t >= 240) return '✅ Хороший результат'
    if (t >= 200) return '📘 Норм, но можно лучше'
    return '📉 Нужно заниматься больше'
  }

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">🎓</div>
          <div className="tx">
            <b>Экзамен</b>
            <span>Обратный отсчёт и калькулятор баллов</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="exam" onNavigate={navTo} />
          <div className="page-host">

            {/* Exam setup */}
            <div className="card">
              <h2>🎓 Настройка экзамена</h2>
              <div className="sub">Задай название и дату экзамена</div>
              <div className="logrow" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <input
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  placeholder="Название (напр.: ЕГЭ Профиль)"
                  style={{ flex: '1 1 160px' }}
                />
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  style={{ width: 160 }}
                />
                <button className="btn" onClick={saveExam}>Сохранить</button>
              </div>
            </div>

            {/* Countdown */}
            {examDate && (
              <div className="card" style={{ textAlign: 'center' }}>
                <h2>{examName || 'Экзамен'}</h2>
                <div className="ec-big" style={{ margin: '16px 0' }}>
                  <div style={{
                    fontSize: 72,
                    fontWeight: 900,
                    lineHeight: 1,
                    color: scoreColor(days),
                    letterSpacing: -2,
                  }}>
                    {days !== null && days >= 0 ? days : '—'}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--muted)', marginTop: 4 }}>
                    {days !== null && days >= 0 ? 'дней осталось' : 'дней до экзамена'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginTop: 8, color: scoreColor(days) }}>
                    {urgencyMsg(days)}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                  Дата: {examDate}
                </div>

                {days !== null && days > 0 && (
                  <div style={{
                    marginTop: 16, padding: '12px 16px',
                    background: 'var(--bg)', borderRadius: 12,
                    fontSize: 13, fontWeight: 700, color: 'var(--ink)',
                  }}>
                    {days <= 30
                      ? `💪 ${days} дней — это ${(days * 4).toFixed(0)}+ блоков по 25 минут. Каждый на счету.`
                      : `📅 ${days} дней — ${Math.floor(days / 7)} недель и ${days % 7} дней. Используй каждую неделю по максимуму.`}
                  </div>
                )}
              </div>
            )}

            {/* Score calculator */}
            <div className="card">
              <h2>🧮 Калькулятор баллов ЕГЭ</h2>
              <div className="sub">Введи баллы по трём предметам</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ minWidth: 130, fontSize: 13, fontWeight: 700 }}>Русский язык</label>
                  <input
                    type="number"
                    value={score1}
                    onChange={e => setScore1(e.target.value)}
                    placeholder="0–100"
                    min={0}
                    max={100}
                    style={{ width: 80 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ minWidth: 130, fontSize: 13, fontWeight: 700 }}>Математика</label>
                  <input
                    type="number"
                    value={score2}
                    onChange={e => setScore2(e.target.value)}
                    placeholder="0–100"
                    min={0}
                    max={100}
                    style={{ width: 80 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ minWidth: 130, fontSize: 13, fontWeight: 700 }}>Третий предмет</label>
                  <input
                    type="number"
                    value={score3}
                    onChange={e => setScore3(e.target.value)}
                    placeholder="0–100"
                    min={0}
                    max={100}
                    style={{ width: 80 }}
                  />
                </div>
              </div>

              {(score1 || score2 || score3) && (
                <div style={{
                  marginTop: 16, padding: '16px 18px',
                  background: total >= 240 ? 'rgba(31,175,115,0.1)' : 'var(--blue-soft)',
                  borderRadius: 14,
                  border: '2px solid ' + (total >= 240 ? 'var(--green)' : 'var(--blue)'),
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 42, fontWeight: 900, color: total >= 240 ? 'var(--green)' : 'var(--blue)' }}>
                    {total}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>баллов из 300</div>
                  <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800 }}>{gradeLabel(total)}</div>
                  <div style={{ marginTop: 6, height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: Math.round(total / 300 * 100) + '%',
                      height: '100%',
                      background: total >= 240 ? 'var(--green)' : 'var(--blue)',
                      borderRadius: 4,
                    }} />
                  </div>
                  <div style={{ fontSize: 11, marginTop: 4, color: 'var(--muted)', fontWeight: 700 }}>
                    {Math.round(total / 300 * 100)}% от максимума
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="exam" />
    </>
  )
}

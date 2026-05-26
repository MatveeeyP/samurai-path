'use client'
import { useState } from 'react'
import { useApp } from '@/lib/AppContext'
import { Config, Goal } from '@/lib/storage'

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { setCfg, setGoals } = useApp()
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'kind' | 'strict' | 'savage' | null>(null)
  const [name, setName] = useState('')
  const [weekGoal, setWeekGoal] = useState(48)
  const [obGoals, setObGoals] = useState<Goal[]>([])
  const [goalName, setGoalName] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [mainGoal, setMainGoal] = useState('')
  const [format, setFormat] = useState('')

  function addGoal() {
    if (!goalName || !goalDate) return
    setObGoals(g => [...g, { name: goalName, date: goalDate }])
    setGoalName('')
    setGoalDate('')
  }

  function next() {
    if (step === 1 && !mode) { alert('Выбери наставника'); return }
    if (step === 2 && !name.trim()) { alert('Введи имя'); return }
    if (step === 4) { finish(); return }
    setStep(s => s + 1)
  }

  function back() { setStep(s => Math.max(1, s - 1)) }

  function finish() {
    const cfg: Config = {
      mode: mode!,
      name: name.trim(),
      weekGoal: weekGoal || 48,
      mainGoal: mainGoal.trim() || 'взять олимпиаду',
      format: format.trim(),
    }
    setCfg(cfg)
    setGoals([...obGoals])
    onDone()
  }

  return (
    <div className="onb">
      <div className="onb-card">
        {step === 1 && (
          <div className="onb-step on">
            <h1>Привет 👋 Настроим под тебя</h1>
            <p className="s">Шаг 1 из 4. Выбери, каким будет твой ИИ-наставник.</p>
            <div className="mode-opts">
              {(['kind', 'strict', 'savage'] as const).map(m => (
                <div key={m} className={`mode-opt ${mode === m ? 'sel' : ''}`} onClick={() => setMode(m)}>
                  <b>{m === 'kind' ? '😊 Добрый наставник' : m === 'strict' ? '🎯 Строгий наставник' : '😈 Наставник, которому пофиг'}</b>
                  <span>{m === 'kind' ? 'Поддерживает, мягко мотивирует, не давит.' : m === 'strict' ? 'Требует, подгоняет, без сюсюканья и воды.' : 'Жёсткий, дерзкий, может крепко выразиться. Для тех, кому нужен пинок.'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="onb-step on">
            <h1>Как тебя зовут?</h1>
            <p className="s">Шаг 2 из 4. И сколько часов в неделю ставишь целью.</p>
            <div className="field"><label>Имя</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Твоё имя" /></div>
            <div className="field"><label>Цель часов в неделю</label><input type="number" value={weekGoal} onChange={e => setWeekGoal(+e.target.value)} min={1} /></div>
          </div>
        )}
        {step === 3 && (
          <div className="onb-step on">
            <h1>Твои цели и олимпиады</h1>
            <p className="s">Шаг 3 из 4. Добавь свои олимпиады/экзамены с реальными датами.</p>
            <div className="goal-add">
              <input value={goalName} onChange={e => setGoalName(e.target.value)} placeholder="Напр.: Турнир Городов" />
              <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)} />
            </div>
            <button className="btn" style={{ width: '100%', marginBottom: 12 }} onClick={addGoal}>+ Добавить цель</button>
            <div className="goal-list">
              {obGoals.map((g, i) => (
                <div key={i} className="goal-item">
                  <span>{g.name} — {new Date(g.date).toLocaleDateString('ru')}</span>
                  <button className="x" onClick={() => setObGoals(prev => prev.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="onb-step on">
            <h1>Главная цель сезона</h1>
            <p className="s">Шаг 4 из 4. Ради чего всё это? Напиши свой якорь.</p>
            <div className="field"><label>Главная цель</label><input value={mainGoal} onChange={e => setMainGoal(e.target.value)} placeholder="Напр.: грант 100% / поступить на бюджет" /></div>
            <div className="field"><label>Формат учебного блока (необязательно)</label><input value={format} onChange={e => setFormat(e.target.value)} placeholder="Напр.: листочек 2ч → веб 2ч → ДЗ 4ч" /></div>
          </div>
        )}
        <div className="onb-nav">
          <button className="lnk" style={{ visibility: step > 1 ? 'visible' : 'hidden' }} onClick={back}>← Назад</button>
          <div className="dots">
            {[1, 2, 3, 4].map(i => <div key={i} className={`dot ${i === step ? 'on' : ''}`} />)}
          </div>
          <button className="btn" onClick={next}>{step === 4 ? 'Начать 🚀' : 'Далее →'}</button>
        </div>
      </div>
    </div>
  )
}

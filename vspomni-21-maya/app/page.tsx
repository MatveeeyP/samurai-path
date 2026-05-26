'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp, calcStreak, calcFreeze } from '@/lib/AppContext'
import { todayKey, weekDates, weekTotalFor, load, save, Entry } from '@/lib/storage'
import { sfx } from '@/lib/sounds'
import { miniConfetti } from '@/lib/animations'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Onboarding from '@/components/Onboarding'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import Splash from '@/components/Splash'
import { PAGE_ROUTES } from '@/components/Navigation'

const MODE_NAMES: Record<string, string> = { kind: '😊 Добрый', strict: '🎯 Строгий', savage: '😈 Без церемоний' }

function fmt(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = Math.floor(s % 60)
  return (h > 0 ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0')
}

export default function DashboardPage() {
  const router = useRouter()
  const { cfg, entries, setEntries, tasks, goals, solves, pomoToday, toast, checkAch, streak, freezeCount, timerOn, setTimerOn, timerAccum, setTimerAccum, timerStart, setTimerStart } = useApp()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [appReady, setAppReady] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [logType, setLogType] = useState('Листочек')
  const [logHrs, setLogHrs] = useState('')
  const [logDate, setLogDate] = useState('')
  const [timerDisplay, setTimerDisplay] = useState('00:00')
  const [aiBody, setAiBody] = useState('Нажми кнопку — наставник посмотрит на твою неделю.')
  const [daySum, setDaySum] = useState<{ hrs: number; done: number; peak: string; verdict: string } | null>(null)
  const [questInput, setQuestInput] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (cfg !== undefined) {
      if (cfg === null) setShowOnboarding(true)
    }
  }, [cfg])

  useEffect(() => {
    if (!cfg) return
    if (cfg.theme) {
      import('@/lib/animations').then(({ shade, hexA }) => {
        import('@/lib/AppContext').then(({ THEMES }) => {
          const color = THEMES[cfg.theme!] || '#1b6deb'
          document.documentElement.style.setProperty('--blue', color)
          document.documentElement.style.setProperty('--blue-dk', shade(color, -18))
          document.documentElement.style.setProperty('--blue-soft', hexA(color, 0.12))
        })
      })
    }
    if (cfg.ui) {
      document.body.classList.toggle('side-nav', cfg.ui.navPos === 'side')
      document.documentElement.style.setProperty('--scale', String((cfg.ui.scale || 100) / 100))
    }
  }, [cfg])

  // Timer tick
  useEffect(() => {
    const elapsed = () => timerAccum + (timerOn ? (Date.now() - timerStart) / 1000 : 0)
    const tick = () => setTimerDisplay(fmt(elapsed()))
    tick()
    if (timerOn) {
      timerRef.current = setInterval(tick, 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [timerOn, timerAccum, timerStart])

  function toggleTimer() {
    if (!timerOn) {
      const start = Date.now()
      setTimerOn(true)
      setTimerStart(start)
      save('v21_timer', { on: true, start, accum: timerAccum })
    } else {
      const acc = timerAccum + (Date.now() - timerStart) / 1000
      setTimerOn(false)
      setTimerAccum(acc)
      save('v21_timer', { on: false, start: 0, accum: acc })
      if (acc > 0) setLogHrs((Math.max(0.1, Math.round(acc / 360) / 10)).toString())
    }
  }

  function resetTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerOn(false); setTimerAccum(0); setTimerStart(0)
    setTimerDisplay('00:00')
    localStorage.removeItem('v21_timer')
    save('v21_timer', { on: false, start: 0, accum: 0 })
  }

  function addEntry(e?: React.MouseEvent<HTMLButtonElement>) {
    const hrs = parseFloat(logHrs)
    if (!hrs || hrs <= 0) return
    const d = logDate || todayKey()
    const isPast = d !== todayKey()
    const newEntry: Entry = { type: logType, hrs, date: d, hour: isPast ? 22 : new Date().getHours() }
    const newEntries = [newEntry, ...entries]
    setEntries(newEntries)
    setLogHrs(''); setLogDate('')
    sfx('record', cfg?.anims?.sound !== false)
    toast(isPast ? `+${hrs} ч записано за ${d.slice(5)} 🌙` : `+${hrs} ч записано 🔥`)
    if (e) miniConfetti(e.currentTarget)
    checkAch()
  }

  function quickAdd(h: number) {
    const newEntry: Entry = { type: logType, hrs: h, date: todayKey(), hour: new Date().getHours() }
    setEntries([newEntry, ...entries])
    sfx('record', cfg?.anims?.sound !== false)
    toast(`+${h} ч записано 🔥`)
    checkAch()
  }

  function delEntry(i: number) {
    const ne = [...entries]; ne.splice(i, 1); setEntries(ne)
  }

  // Week stats
  const wd = weekDates()
  const perDay = wd.map(d => entries.filter(e => e.date === d).reduce((s, e) => s + e.hrs, 0))
  const weekTotal = perDay.reduce((a, b) => a + b, 0)
  const weekGoalV = cfg?.weekGoal || 48
  const weekPct = Math.min(100, Math.round(weekTotal / weekGoalV * 100))
  const weekLeft = Math.max(0, weekGoalV - weekTotal)

  // Heatmap
  const buckets = new Array(24).fill(0)
  entries.forEach(e => { const h = e.hour != null && e.hour >= 0 && e.hour < 24 ? e.hour : 12; buckets[h] += e.hrs })
  const maxB = Math.max(...buckets, 0.1)
  const accColor = '#1b6deb'
  const n = parseInt(accColor.replace('#', ''), 16)
  const R = n >> 16, G = (n >> 8) & 255, B = n & 255

  // Quest
  const dailyGoal = weekGoalV / 7
  const todayHours = entries.filter(e => e.date === todayKey()).reduce((s, e) => s + e.hrs, 0)
  const todaySolves = solves.filter(s => s.date === todayKey()).reduce((s, x) => s + x.count, 0)
  const hiddenAuto = load<string[]>('v21_quest_hidden', [])
  const autoQuests = [
    { id: 'hours', t: `Позанимайся ${dailyGoal.toFixed(1)} ч сегодня`, xp: '+50 XP', done: todayHours >= dailyGoal },
    { id: 'solve', t: 'Реши 5 задач', xp: '+30 XP', done: todaySolves >= 5 },
    { id: 'pomo', t: 'Сделай 1 помидор фокуса', xp: '+20 XP', done: pomoToday >= 1 },
  ].filter(q => !hiddenAuto.includes(q.id))
  const myQuests = load<{ t: string; done: boolean }[]>('v21_quests_' + todayKey(), [])

  function hideAutoQuest(id: string) {
    const h = load<string[]>('v21_quest_hidden', [])
    if (!h.includes(id)) h.push(id)
    save('v21_quest_hidden', h)
    toast('Рекомендация убрана')
    window.location.reload()
  }

  function addQuest() {
    if (!questInput.trim()) return
    const k = 'v21_quests_' + todayKey()
    const q = load<{ t: string; done: boolean }[]>(k, [])
    q.push({ t: questInput, done: false })
    save(k, q)
    setQuestInput('')
    toast('Цель добавлена')
    window.location.reload()
  }

  function toggleMyQuest(i: number) {
    const k = 'v21_quests_' + todayKey()
    const q = load<{ t: string; done: boolean }[]>(k, [])
    q[i].done = !q[i].done; save(k, q)
    if (q[i].done) toast('Цель закрыта! 💪')
    window.location.reload()
  }

  function delMyQuest(i: number) {
    const k = 'v21_quests_' + todayKey()
    const q = load<{ t: string; done: boolean }[]>(k, [])
    q.splice(i, 1); save(k, q)
    window.location.reload()
  }

  // Goals for tile
  const sortedGoals = [...goals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const nextGoal = sortedGoals[0]
  const nextGoalDays = nextGoal ? Math.ceil((new Date(nextGoal.date).getTime() - Date.now()) / 864e5) : null

  // Streak tilt msg
  function getTiltMsg(): string {
    const today = entries.some(e => e.date === todayKey())
    if (today && streak >= 3) return `🔥 <b>${streak} дней подряд!</b> Ты в потоке. ${freezeCount > 0 ? `И ${freezeCount} ❄️ в запасе.` : ''}`
    if (today) return `✅ Сегодня отмечено. Завтра не пропусти — два пропуска подряд это и есть тильт.`
    if (streak === 0) return `<b>Правило одного часа:</b> не «сесть на 4 часа», а открыть задачу на 25 минут. Этого хватит, чтобы зажечь огонёк.`
    return `⚠️ Сегодня ещё ноль. Серия ${streak}${freezeCount > 0 ? ` — есть ${freezeCount} ❄️, спасёт цепочку. Но лучше запиши час.` : ', запиши час, чтобы не потерять.'}`
  }

  // AI
  function tone(kind: string, strict: string, savage: string): string {
    return cfg?.mode === 'kind' ? kind : cfg?.mode === 'strict' ? strict : savage
  }

  function aiAdvise(mode: string) {
    setAiBody('Думаю<span class="blink"></span>')
    const per = wd.map(d => entries.filter(e => e.date === d).reduce((s, e) => s + e.hrs, 0))
    const total = per.reduce((a, b) => a + b, 0)
    const open = tasks.filter(t => !t.done && !t.big).length
    const nGoal = nextGoal ? `${nextGoal.name} (${nextGoalDays} дн)` : 'цель не задана'
    setTimeout(() => {
      let txt = ''
      const T = total.toFixed(1).replace('.0', '')
      if (mode === 'analyze') {
        const head = tone(`За неделю — <b>${T} ч</b>. `, `Итог недели: <b>${T} ч</b>. `, `Ну чё, <b>${T} ч</b> за неделю. `)
        const body2 = total >= weekGoalV
          ? tone('Цель взята, ты молодец! 👏 Держи темп.', 'Норма закрыта. Теперь добавь сверх неё.', 'Норму закрыл, окей. Но это минимум.')
          : tone(`До цели не хватает ${(weekGoalV - total).toFixed(1)} ч — ты близко 💪`, `Недобор ${(weekGoalV - total).toFixed(1)} ч. Садись и закрывай.`, `Недокрутил ${(weekGoalV - total).toFixed(1)} ч. Берись.`)
        txt = head + body2 + `<br><br>Ближайшая цель: <b>${nGoal}</b>.`
      }
      if (mode === 'push') {
        txt = tone(`${cfg?.name}, ты можешь больше, я в тебя верю 🙌 Сейчас ${T}/${weekGoalV} ч. Давай ещё один блок.`, `${cfg?.name}. ${T}/${weekGoalV} ч. Хватит думать — открывай задачу и работай.`, `${cfg?.name}, ${T}/${weekGoalV} ч и ты сидишь читаешь это? Закрывай вкладку и иди решай.`)
      }
      if (mode === 'tilt') {
        txt = tone(`Всё окей 💙 Не думай про ${weekGoalV} ч. Открой одну задачу на 25 минут.`, `Тильт — это откат, не приговор. Один листочек, 25 минут, без отговорок.`, `Тильт у него. Забей на ${weekGoalV} ч, открой ОДНУ задачу на 25 минут и не ной.`)
      }
      if (mode === 'math') {
        txt = `📐 Дам <b>намёк</b>, не решение — дойти должен сам, как на олимпиаде.<br><br>Скинь условие и я подскажу тип задачи и первый шаг.`
      }
      if (mode === 'plan') {
        const f = cfg?.format || 'листочек 2ч → веб 2ч → ДЗ 4ч'
        txt = `План на завтра по твоему формату (<b>${f}</b>):<br><br>• Утро: первый блок самостоятельно<br>• День: разбор непонятого<br>• Вечер: добивка${open > 0 ? `<br><br>У тебя ${open} незакрытых задач — перенеси в блоки.` : ''}`
      }
      setAiBody(txt)
    }, 700)
  }

  // Day summary
  function daySummary() {
    const tk = todayKey()
    const todayE = entries.filter(e => e.date === tk)
    const hrs = todayE.reduce((s, e) => s + e.hrs, 0)
    const doneToday = tasks.filter(t => t.done && !t.big).length
    const peak = todayE.length ? todayE.sort((a, b) => b.hrs - a.hrs)[0].hour + ':00' : '—'
    const goal = weekGoalV / 7
    let verdict: string
    if (hrs >= goal * 1.2) verdict = tone('Отличный день! Ты выложился по полной 🌟', 'Сильный день. Так и держи.', 'Жёстко поработал сегодня, красавчик. Завтра не сдуйся.')
    else if (hrs >= goal * 0.6) verdict = tone('Хороший день, ты двигался вперёд 💪', 'Нормально, но можно было плотнее.', 'Средне. Не зашквар, но и не подвиг. Завтра жми сильнее.')
    else if (hrs > 0) verdict = tone('Немного, но ты не слился — это уже победа 💙', 'Маловато. Один блок ≠ день подготовки.', 'Это всё? Ну хоть огонёк не потушил. Завтра берись по-нормальному.')
    else verdict = tone('Сегодня не вышло — и это нормально 💙', 'Ноль часов. Завтра берись.', 'Ноль. Просто ноль. Ладно, проехали — но завтра без этой фигни.')
    setDaySum({ hrs, done: doneToday, peak, verdict })
  }

  // Navigation
  function navTo(page: string) {
    if (page === 'dash') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />
  if (showOnboarding && cfg === null) return <Onboarding onDone={() => { setShowOnboarding(false); setAppReady(true) }} />
  if (!cfg) return null

  const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const todayIdx = (new Date().getDay() + 6) % 7
  const maxH = Math.max(8, ...perDay)

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap" id="app">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📌</div>
          <div className="tx">
            <b>Зачем ты здесь</b>
            <span>{cfg.mainGoal}{sortedGoals.length > 0 ? ` · ближайшее: ${sortedGoals[0].name}` : ''}</span>
          </div>
        </div>
        <div className="app-body" id="appBody">
          <Navigation currentPage="dash" onNavigate={navTo} />
          <div className="page-host">
            {/* QUEST */}
            <div className="quest">
              <h3>⚡ Квест дня <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#9a4a13' }}>свои цели на день</span></h3>
              <div className="quest-list">
                {autoQuests.map(q => (
                  <div key={q.id} className={`qitem ${q.done ? 'done' : ''}`}>
                    <div className="qc">{q.done ? '✓' : ''}</div>
                    <span>{q.t}</span>
                    <span className="qx">{q.xp}</span>
                    <button className="q-hide" onClick={() => hideAutoQuest(q.id)} title="Убрать">×</button>
                  </div>
                ))}
                {myQuests.map((q, i) => (
                  <div key={i} className={`qitem ${q.done ? 'done' : ''}`}>
                    <div className="qc" onClick={() => toggleMyQuest(i)} style={{ cursor: 'pointer' }}>{q.done ? '✓' : ''}</div>
                    <span>{q.t}</span>
                    <button className="q-hide" onClick={() => delMyQuest(i)}>×</button>
                  </div>
                ))}
                {autoQuests.length === 0 && myQuests.length === 0 && (
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#9a4a13', opacity: .7 }}>Добавь свою цель на день ниже 👇</div>
                )}
              </div>
              <div className="plan-add" style={{ marginTop: 10, marginBottom: 0 }}>
                <input value={questInput} onChange={e => setQuestInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addQuest()} placeholder="Своя цель на сегодня, напр.: дорешать листок №5" style={{ background: '#fff' }} />
                <button className="btn" onClick={addQuest} style={{ background: 'var(--orange)' }}>+</button>
              </div>
            </div>

            {/* TILES */}
            <div className="tiles">
              <div className="tile t-blue">
                <div className="ico">⏱</div>
                <div className="tlabel">Часы за неделю</div>
                <div>
                  <div className="tbig">{weekTotal.toFixed(1).replace('.0', '')}</div>
                  <div className="tsub">из {weekGoalV} ч</div>
                </div>
              </div>
              <div className="tile t-orange">
                <div className="ico">🔥</div>
                <div className="tlabel">Серия</div>
                <div>
                  <div className="tbig">{streak}</div>
                  <div className="tsub">дней подряд</div>
                </div>
              </div>
              <div className="tile t-green">
                <div className="ico">📌</div>
                <div className="tlabel">Главная цель</div>
                <div>
                  <div className="tbig" style={{ fontSize: 18 }}>{cfg.mainGoal}</div>
                </div>
              </div>
              <div className="tile t-purple">
                <div className="ico">🏆</div>
                <div className="tlabel">{nextGoal?.name || 'Ближайшая цель'}</div>
                <div>
                  <div className="tbig">{nextGoalDays !== null && nextGoalDays > 0 ? nextGoalDays : '—'}</div>
                  <div className="tsub">дней осталось</div>
                </div>
              </div>
            </div>

            <div className="grid">
              {/* HOURS CARD */}
              <div className="card">
                <h2>⏱ Часы</h2>
                <div className="sub">Засекай таймером или впиши вручную. Фиксируется и время суток.</div>
                <div className="hours-top">
                  <div className="hours-big">{weekTotal.toFixed(1).replace('.0', '')}</div>
                  <div className="hours-goal">/ {weekGoalV} ч за неделю</div>
                </div>
                <div className="bar"><i style={{ width: weekPct + '%' }} /></div>
                <div className="barlabel">
                  <span>{weekPct}% от цели</span>
                  <span>{weekLeft > 0 ? `осталось ${weekLeft.toFixed(1).replace('.0', '')} ч` : 'цель взята! 🎉'}</span>
                </div>
                <div className="week-days">
                  {wd.map((d, i) => (
                    <div key={d} className={`wd ${i === todayIdx ? 'today' : ''}`}>
                      <div className="col"><i style={{ height: maxH > 0 ? Math.round(perDay[i] / maxH * 100) + '%' : '0%' }} /></div>
                      <div className="whrs">{perDay[i] > 0 ? perDay[i].toFixed(1).replace('.0', '') : '·'}</div>
                      <div className="wlabel">{names[i]}</div>
                    </div>
                  ))}
                </div>
                <div className="timer-box">
                  <div className="timer-disp">{timerDisplay}</div>
                  <button className={`btn ${!timerOn ? 'btn-grn' : ''}`} onClick={toggleTimer}>
                    {timerOn ? '⏸ Пауза' : '▶ Старт'}
                  </button>
                  <button className="ai-btn" onClick={resetTimer}>Сброс</button>
                </div>
                <div className="logrow">
                  <select value={logType} onChange={e => setLogType(e.target.value)}>
                    <option>Листочек</option><option>Веб</option><option>ДЗ</option><option>Экзамен</option><option>Другое</option>
                  </select>
                  <input type="number" value={logHrs} onChange={e => setLogHrs(e.target.value)} placeholder="часы" step={0.5} min={0} />
                  <button className="btn btn-confetti" onClick={(e) => addEntry(e)}>Записать</button>
                </div>
                <div className="logrow" style={{ marginTop: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>📅 За какой день:</span>
                  <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} style={{ flex: 1, minWidth: 140 }} />
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>пусто = сегодня</span>
                </div>
                <div className="quick-bar">
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', alignSelf: 'center' }}>Быстро:</span>
                  {[0.5, 1, 2, 4].map(h => (
                    <button key={h} onClick={() => quickAdd(h)}>+{h < 1 ? '30 мин' : `${h} ч`}</button>
                  ))}
                </div>
                <div className="entries">
                  {entries.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: 6 }}>Пока пусто.</div>}
                  {entries.slice(0, 40).map((e, i) => (
                    <div key={i} className="entry">
                      <span><span className="tag">{e.type}</span> {e.hrs} ч</span>
                      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                          {e.date === todayKey() ? 'сегодня' : e.date.slice(5)} {e.hour != null ? e.hour + ':00' : ''}
                        </span>
                        <button className="x" onClick={() => delEntry(i)}>×</button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STREAK CARD */}
              <div className="card">
                <h2>🔥 Серия и заморозки</h2>
                <div className="sub">Огонёк горит, пока учишься. ❄️ спасает при пропуске.</div>
                <div className="fire-display">
                  <div className="fire-emoji">{streak > 0 ? '🔥' : '🧊'}</div>
                  <div className={`fire-num ${streak > 0 ? 'hot' : 'cold'}`}>{streak}</div>
                  <div className="fire-label">дней подряд</div>
                </div>
                <div className="freeze-row">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`freeze ${i < freezeCount ? '' : 'empty'}`} data-tip={i < freezeCount ? 'Заморозка есть' : 'Пусто'}>
                      {i < freezeCount ? '❄️' : '·'}
                      <div className="snowfall">
                        <i /><i style={{ left: '30%', animationDelay: '.3s' }} /><i style={{ left: '60%', animationDelay: '.6s' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="tilt-msg" dangerouslySetInnerHTML={{ __html: getTiltMsg() }} />
              </div>

              {/* HEATMAP */}
              <div className="card full">
                <h2>🌡 Когда ты ботаешь</h2>
                <div className="sub">Тепловая карта по часам суток — видно, в какое время ты реально занимаешься.</div>
                <div className="heat">
                  {buckets.map((v, h) => {
                    const op = v > 0 ? (0.3 + 0.7 * (v / maxB)) : 0.10
                    return <div key={h} className="h" title={`${h}:00 — ${v.toFixed(1)} ч`} style={{ background: `rgba(${R},${G},${B},${op})` }} />
                  })}
                </div>
                <div className="heat-lbl"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div>
                <div className="heat-legend">
                  {entries.length > 0
                    ? (() => { const peak = buckets.indexOf(Math.max(...buckets)); const period = peak < 6 ? 'ночью' : peak < 12 ? 'утром' : peak < 18 ? 'днём' : 'вечером'; return `Чаще всего ты занимаешься ${period}, около ${peak}:00. Чем темнее клетка — тем больше часов.` })()
                    : 'Пока нет данных — позанимайся, и карта заполнится.'
                  }
                </div>
              </div>

              {/* AI CARD */}
              <div className="card full ai-card">
                <div className="ai-head">
                  <div className="ai-dot">🤖</div>
                  <h2 style={{ margin: 0 }}>ИИ-наставник</h2>
                  <span className="mode-badge">{MODE_NAMES[cfg.mode]}</span>
                </div>
                <div className="sub">Видит твои часы, серию, цели, план и время суток.</div>
                <div className="ai-body" dangerouslySetInnerHTML={{ __html: aiBody }} />
                <div className="ai-actions">
                  {[['analyze', '📊 Разбери неделю'], ['push', '💪 Подгони меня'], ['tilt', '🧊 Я в тильте'], ['math', '📐 Подсказка по задаче'], ['plan', '🗂 План на завтра']].map(([mode, label]) => (
                    <button key={mode} className="ai-btn" onClick={() => aiAdvise(mode)}>{label}</button>
                  ))}
                </div>
                <div className="ai-note"><b>Примечание:</b> в полной версии кнопки вызывают GPT-4o с системным промптом под выбранный режим. Здесь — демо на твоих данных.</div>
              </div>

              {/* DAY SUMMARY */}
              <div className="card full">
                <h2>🌙 Итог дня</h2>
                <div className="sub">Вечерний ритуал. Нажми, когда сделал всё, что мог — наставник подведёт итог.</div>
                <button className="summary-btn" onClick={daySummary}>✅ Я сделал всё, что мог — подведи итог дня</button>
                {daySum && (
                  <div className="daysum on">
                    <div className="stats">
                      <div className="st"><b>{daySum.hrs.toFixed(1).replace('.0', '')}</b><span>часов сегодня</span></div>
                      <div className="st"><b>{daySum.done}</b><span>задач закрыто</span></div>
                      <div className="st"><b>{streak}🔥</b><span>серия</span></div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.6 }}>
                      <b>Пик активности:</b> {daySum.peak}<br /><br />
                      <b>Наставник:</b> {daySum.verdict}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="dash" />
      {/* Level up overlay rendered elsewhere via context */}
    </>
  )
}

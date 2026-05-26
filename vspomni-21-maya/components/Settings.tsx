'use client'
import { useState, useEffect } from 'react'
import { useApp, THEMES } from '@/lib/AppContext'
import { shade, hexA } from '@/lib/animations'
import { TAB_NAMES, PAGE_ORDER } from './Navigation'

const BGS: Record<string, string> = { plain: 'обычный', dots: 'точки', grid: 'сетка', gradient: 'градиент', warm: 'тёплый', glass: 'стекло', neumorph: 'нео', animgrad: 'волна', aurora: 'аврора', dark: 'тёмная' }

export default function Settings({ onClose }: { onClose: () => void }) {
  const { cfg, setCfg, entries, setEntries, tasks, setTasks, goals, setGoals, mats, setMats, solves, setSolves, setAchGot, toast } = useApp()

  const [name, setName] = useState(cfg?.name || '')
  const [weekGoal, setWeekGoal] = useState(cfg?.weekGoal || 48)
  const [mainGoal, setMainGoal] = useState(cfg?.mainGoal || '')
  const [format, setFormat] = useState(cfg?.format || '')
  const [aiMode, setAiMode] = useState(cfg?.mode || 'kind')
  const [scale, setScale] = useState(cfg?.ui?.scale || 100)
  const [navPos, setNavPos] = useState<'top' | 'side'>(cfg?.ui?.navPos || 'top')
  const [bg, setBg] = useState(cfg?.ui?.bg || 'plain')
  const [theme, setTheme] = useState(cfg?.theme || 'blue')
  const [anims, setAnims] = useState(cfg?.anims || { tilt: false, slide: true, magnetic: false, counter: true, particles: false, sound: true, ripple: true })
  const [hidden, setHidden] = useState<string[]>(cfg?.ui?.hidden || [])

  useEffect(() => {
    if (cfg) {
      setName(cfg.name)
      setWeekGoal(cfg.weekGoal)
      setMainGoal(cfg.mainGoal)
      setFormat(cfg.format || '')
      setAiMode(cfg.mode)
      setScale(cfg.ui?.scale || 100)
      setNavPos(cfg.ui?.navPos || 'top')
      setBg(cfg.ui?.bg || 'plain')
      setTheme(cfg.theme || 'blue')
      setAnims(cfg.anims || { tilt: false, slide: true, magnetic: false, counter: true, particles: false, sound: true, ripple: true })
      setHidden(cfg.ui?.hidden || [])
    }
  }, [cfg])

  function save() {
    if (!cfg) return
    const newCfg = {
      ...cfg,
      name: name.trim() || cfg.name,
      weekGoal: weekGoal || cfg.weekGoal,
      mainGoal: mainGoal.trim() || cfg.mainGoal,
      format: format.trim(),
      mode: aiMode as 'kind' | 'strict' | 'savage',
      theme,
      anims,
      ui: { hidden, navPos, scale, bg },
    }
    setCfg(newCfg)
    applyTheme(THEMES[theme] || THEMES.blue)
    applyUI(navPos, scale, bg, hidden)
    toast('Настройки сохранены ✓')
    onClose()
  }

  function applyTheme(color: string) {
    document.documentElement.style.setProperty('--blue', color)
    document.documentElement.style.setProperty('--blue-dk', shade(color, -18))
    document.documentElement.style.setProperty('--blue-soft', hexA(color, 0.12))
  }

  function applyUI(pos: string, sc: number, bgKey: string, hiddenTabs: string[]) {
    document.body.classList.toggle('side-nav', pos === 'side')
    document.documentElement.style.setProperty('--scale', String(sc / 100));
    ['bg-dots', 'bg-grid', 'bg-gradient', 'bg-warm', 'glass', 'neumorph', 'bg-animgrad', 'bg-aurora', 'bg-dark'].forEach(c => document.body.classList.remove(c))
    document.querySelectorAll('.aurora-layer,.particles').forEach(e => e.remove())
    if (bgKey && bgKey !== 'plain') {
      if (bgKey === 'glass') document.body.classList.add('glass', 'bg-gradient')
      else if (bgKey === 'neumorph') document.body.classList.add('neumorph')
      else if (bgKey === 'aurora') {
        document.body.classList.add('bg-aurora')
        const a = document.createElement('div'); a.className = 'aurora-layer'; a.innerHTML = '<i></i><i></i><i></i>'; document.body.appendChild(a)
      }
      else if (bgKey === 'dark') document.body.classList.add('bg-dark')
      else if (bgKey === 'animgrad') document.body.classList.add('bg-animgrad')
      else document.body.classList.add('bg-' + bgKey)
    }
    void hiddenTabs
  }

  function exportData() {
    if (typeof window === 'undefined') return
    const data: Record<string, string> = {}
    Object.keys(localStorage).filter(k => k.startsWith('v21_')).forEach(k => { data[k] = localStorage.getItem(k) || '' })
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `vspomni21-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click()
    toast('Данные выгружены 📤')
  }

  function importData(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = () => {
      try {
        const d = JSON.parse(r.result as string)
        Object.keys(d).forEach(k => localStorage.setItem(k, d[k]))
        toast('Данные загружены ✓')
        setTimeout(() => location.reload(), 500)
      } catch { toast('Ошибка файла') }
    }
    r.readAsText(f)
  }

  function resetAll() {
    if (confirm('Сбросить все настройки и данные?')) { localStorage.clear(); location.reload() }
  }

  function toggleTab(k: string) {
    setHidden(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  const ANIM_LABELS: Record<string, string> = {
    tilt: '3D наклон карточек', slide: 'Слайд-переходы страниц', magnetic: 'Магнитные кнопки',
    counter: 'Числа-табло (откручивание)', particles: 'Частицы и фон-эффекты', sound: 'Звуки', ripple: 'Ripple на кнопках',
  }

  return (
    <div className="modal on">
      <div className="modal-card">
        <h2>⚙️ Настройки</h2>
        <div className="field"><label>Имя</label><input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label>Цель часов в неделю</label><input type="number" value={weekGoal} onChange={e => setWeekGoal(+e.target.value)} min={1} /></div>
        <div className="field"><label>Главная цель</label><input value={mainGoal} onChange={e => setMainGoal(e.target.value)} /></div>
        <div className="field"><label>Формат блока</label><input value={format} onChange={e => setFormat(e.target.value)} placeholder="листочек 2ч → веб 2ч → ДЗ 4ч" /></div>
        <div className="field">
          <label>Режим наставника</label>
          <select value={aiMode} onChange={e => setAiMode(e.target.value as 'kind' | 'strict' | 'savage')}>
            <option value="kind">😊 Добрый</option>
            <option value="strict">🎯 Строгий</option>
            <option value="savage">😈 Без церемоний</option>
          </select>
        </div>
        <div className="field">
          <label>Цвет оформления</label>
          <div className="theme-row">
            {Object.entries(THEMES).map(([k, c]) => (
              <div key={k} className={`theme-opt ${theme === k ? 'sel' : ''}`} style={{ background: c }} onClick={() => setTheme(k)} />
            ))}
          </div>
        </div>
        <div className="field">
          <label>Фон</label>
          <div className="bg-options">
            {Object.entries(BGS).map(([k, n]) => (
              <div key={k} className={`bg-opt ${bg === k ? 'sel' : ''}`} onClick={() => setBg(k)}>{n}</div>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Расположение меню</label>
          <div className="seg-control">
            <button className={navPos === 'top' ? 'on' : ''} onClick={() => setNavPos('top')}>⬆ Сверху</button>
            <button className={navPos === 'side' ? 'on' : ''} onClick={() => setNavPos('side')}>⬅ Сбоку</button>
          </div>
        </div>
        <div className="field">
          <label>Размер интерфейса: {scale}%</label>
          <div className="scale-control">
            <span style={{ fontSize: 12 }}>A</span>
            <input type="range" min={80} max={130} value={scale} step={5} onChange={e => setScale(+e.target.value)} />
            <span style={{ fontSize: 20 }}>A</span>
          </div>
        </div>
        <div className="field">
          <label>Анимации и эффекты</label>
          <div className="tab-manage">
            {Object.keys(ANIM_LABELS).map(k => (
              <div key={k} className="tab-row">
                <span className="tn">{ANIM_LABELS[k]}</span>
                <div className={`tab-toggle ${(anims as Record<string, boolean>)[k] ? 'on' : ''}`} onClick={() => setAnims(a => ({ ...a, [k]: !(a as Record<string, boolean>)[k] }))} />
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Вкладки (скрой ненужные)</label>
          <div className="tab-manage">
            {PAGE_ORDER.map(k => (
              <div key={k} className="tab-row">
                <span className="tn">{TAB_NAMES[k]}</span>
                {k === 'dash' ? <span style={{ fontSize: 11, color: 'var(--muted)' }}>всегда</span> : (
                  <div className={`tab-toggle ${!hidden.includes(k) ? 'on' : ''}`} onClick={() => toggleTab(k)} />
                )}
              </div>
            ))}
          </div>
        </div>
        <button className="btn" style={{ width: '100%' }} onClick={save}>Сохранить</button>
        <div className="row-btn">
          <button className="ai-btn" style={{ flex: 1 }} onClick={exportData}>📤 Экспорт данных</button>
          <label className="ai-btn" style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            📥 Импорт
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={importData} />
          </label>
        </div>
        <div className="ai-note">Экспорт/импорт — ручная синхронизация между устройствами.</div>
        <button className="lnk" style={{ width: '100%', marginTop: 10, color: 'var(--red)' }} onClick={resetAll}>Сбросить всё</button>
        <button className="lnk" style={{ width: '100%', marginTop: 6 }} onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}

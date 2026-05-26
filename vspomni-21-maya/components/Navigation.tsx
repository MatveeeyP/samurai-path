'use client'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/AppContext'

export const PAGE_ORDER = ['dash', 'calendar', 'plan', 'tasks2', 'focus', 'progress', 'mat', 'notes', 'goals', 'board', 'analytics', 'exam', 'habits']

export const PAGE_ROUTES: Record<string, string> = {
  dash: '/',
  calendar: '/calendar',
  plan: '/plans',
  tasks2: '/tasks',
  focus: '/focus',
  progress: '/progress',
  mat: '/materials',
  notes: '/notes',
  goals: '/goals',
  board: '/board',
  analytics: '/analytics',
  exam: '/exam',
  habits: '/habits',
}

export const TAB_NAMES: Record<string, string> = {
  dash: '🏠 Главная',
  calendar: '📅 Календарь',
  plan: '🗂 Планы',
  tasks2: '📐 Задачи',
  focus: '🍅 Фокус',
  progress: '📈 Прогресс',
  mat: '📎 Материалы',
  notes: '📝 Заметки',
  goals: '🎯 Цели',
  board: '🏅 Рейтинг',
  analytics: '📊 Аналитика',
  exam: '🎓 Экзамен',
  habits: '💪 Привычки',
}

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { cfg } = useApp()
  const navRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const [hiddenMenuOpen, setHiddenMenuOpen] = useState(false)

  const ui = cfg?.ui || { hidden: [], navPos: 'top', scale: 100, bg: 'plain' }
  const hidden = ui.hidden || []
  const visiblePages = PAGE_ORDER.filter(p => !hidden.includes(p))
  const hiddenPages = hidden.filter(p => p !== 'dash')

  useEffect(() => {
    updateIndicator()
  }, [currentPage, cfg])

  function updateIndicator() {
    const nav = navRef.current
    const ind = indicatorRef.current
    if (!nav || !ind) return
    const active = nav.querySelector(`button[data-page="${currentPage}"]`) as HTMLButtonElement | null
    if (!active) return
    const isSide = document.body.classList.contains('side-nav')
    if (isSide) {
      ind.style.width = '3px'
      ind.style.left = '0'
      ind.style.top = active.offsetTop + 'px'
      ind.style.height = active.offsetHeight + 'px'
    } else {
      ind.style.height = '3px'
      ind.style.left = active.offsetLeft + 'px'
      ind.style.width = active.offsetWidth + 'px'
      ind.style.top = 'auto'
      ind.style.bottom = '0'
    }
  }

  return (
    <div className="nav main-nav" id="mainNav" ref={navRef}>
      <div className="nav-indicator" ref={indicatorRef} />
      {visiblePages.map(p => (
        <button
          key={p}
          data-page={p}
          className={currentPage === p ? 'on' : ''}
          onClick={() => onNavigate(p)}
        >
          {TAB_NAMES[p]}
        </button>
      ))}
      {hiddenPages.length > 0 && (
        <div className="hidden-tabs-wrap">
          <button className="hidden-tabs-btn" onClick={() => setHiddenMenuOpen(v => !v)}>
            ⋯ Скрытые
          </button>
          {hiddenMenuOpen && (
            <div className="hidden-menu on">
              {hiddenPages.map(p => (
                <button key={p} onClick={() => { onNavigate(p); setHiddenMenuOpen(false) }}>
                  {TAB_NAMES[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

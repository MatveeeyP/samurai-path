'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { weekTotalFor } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

const DEMO_PLAYERS = [
  { nm: 'Артём', week: 38, streak: 12 },
  { nm: 'Соня', week: 51, streak: 21 },
  { nm: 'Костя', week: 22, streak: 4 },
  { nm: 'Лиза', week: 44, streak: 9 },
]

type SortMode = 'week' | 'streak'

interface Player {
  nm: string
  week: number
  streak: number
  isMe?: boolean
}

export default function BoardPage() {
  const router = useRouter()
  const { cfg, entries, streak } = useApp()
  const [showSettings, setShowSettings] = useState(false)
  const [mode, setMode] = useState<SortMode>('week')

  function navTo(page: string) {
    if (page === 'board') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  const myWeek = useMemo(() => weekTotalFor(entries, 0), [entries])

  const players: Player[] = useMemo(() => {
    const me: Player = {
      nm: cfg?.name || 'Я',
      week: Math.round(myWeek * 10) / 10,
      streak,
      isMe: true,
    }
    const all = [...DEMO_PLAYERS.map(p => ({ ...p, isMe: false })), me]
    if (mode === 'week') {
      return all.sort((a, b) => b.week - a.week)
    } else {
      return all.sort((a, b) => b.streak - a.streak)
    }
  }, [cfg, myWeek, streak, mode])

  const topVal = mode === 'week'
    ? Math.max(...players.map(p => p.week), 1)
    : Math.max(...players.map(p => p.streak), 1)

  function rankEmoji(i: number) {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `${i + 1}.`
  }

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">🏅</div>
          <div className="tx">
            <b>Рейтинг</b>
            <span>Сравни себя с другими олимпиадниками</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="board" onNavigate={navTo} />
          <div className="page-host">

            {/* Toggle */}
            <div className="board-toggle" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                className={'sm-btn' + (mode === 'week' ? ' on' : '')}
                onClick={() => setMode('week')}
              >
                📅 Часы за неделю
              </button>
              <button
                className={'sm-btn' + (mode === 'streak' ? ' on' : '')}
                onClick={() => setMode('streak')}
              >
                🔥 Серия
              </button>
            </div>

            <div className="card">
              <h2>
                {mode === 'week' ? '📅 Часы за эту неделю' : '🔥 Серия дней'}
              </h2>
              <div className="sub">
                {mode === 'week'
                  ? 'Суммарные часы учёбы за текущую неделю'
                  : 'Количество дней подряд без пропуска'}
              </div>

              <div className="board">
                {players.map((p, i) => {
                  const val = mode === 'week' ? p.week : p.streak
                  const pct = Math.max(4, Math.round(val / topVal * 100))
                  return (
                    <div
                      key={p.nm}
                      className={'brow' + (p.isMe ? ' me' : '')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px',
                        marginBottom: 8,
                        borderRadius: 12,
                        background: p.isMe ? 'var(--blue-soft)' : 'var(--bg)',
                        border: p.isMe ? '1.5px solid var(--blue)' : '1.5px solid var(--line)',
                      }}
                    >
                      <div style={{ fontSize: 18, minWidth: 28, textAlign: 'center', fontWeight: 900 }}>
                        {rankEmoji(i)}
                      </div>
                      <div style={{ minWidth: 70, fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>
                        {p.nm}
                        {p.isMe && (
                          <span
                            className="me-tag"
                            style={{
                              marginLeft: 6, fontSize: 10, fontWeight: 900,
                              color: 'var(--blue)', background: 'var(--blue-soft)',
                              borderRadius: 6, padding: '1px 5px',
                            }}
                          >
                            ты
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, height: 16, background: 'var(--line)', borderRadius: 8, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: pct + '%',
                            height: '100%',
                            background: p.isMe ? 'var(--blue)' : '#b0b8c8',
                            borderRadius: 8,
                            transition: 'width .4s',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          minWidth: 52, textAlign: 'right',
                          fontWeight: 900, fontSize: 15,
                          color: p.isMe ? 'var(--blue)' : 'var(--ink)',
                        }}
                      >
                        {mode === 'week' ? p.week + ' ч' : p.streak + ' дн'}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                * Остальные участники — демо-данные. В полной версии — синхронизация через Firebase.
              </div>
            </div>

            {/* Motivation */}
            <div className="card">
              <h2>💡 Совет</h2>
              {(() => {
                const myRank = players.findIndex(p => p.isMe)
                const myVal = mode === 'week' ? myWeek : streak
                const leader = players[0]
                if (myRank === 0) {
                  return (
                    <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6 }}>
                      🏆 Ты лидер! Удержи позицию — {mode === 'week'
                        ? leader.week.toFixed(1) + ' ч'
                        : leader.streak + ' дней'} впереди всех.
                    </p>
                  )
                }
                const ahead = mode === 'week'
                  ? leader.week - myVal
                  : leader.streak - myVal
                return (
                  <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.6 }}>
                    До первого места — {mode === 'week'
                      ? Math.abs(ahead).toFixed(1) + ' ч'
                      : Math.round(Math.abs(ahead)) + ' дней серии'}.
                    {mode === 'week'
                      ? ' Добавь ещё один блок учёбы сегодня!'
                      : ' Не пропускай ни дня!'}
                  </p>
                )
              })()}
            </div>

          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="board" />
    </>
  )
}

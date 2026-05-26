'use client'
import { useApp } from '@/lib/AppContext'

export default function LevelUpOverlay() {
  const { levelUpMsg, setLevelUpMsg } = useApp()

  if (!levelUpMsg) return null

  return (
    <div
      className="levelup-overlay"
      onClick={() => setLevelUpMsg(null)}
      style={{ cursor: 'pointer' }}
    >
      <div className="levelup-box">
        <div className="lv-emoji">🏆</div>
        <div className="lv-text">{levelUpMsg}</div>
        <div className="lv-sub">Продолжай в том же духе!</div>
      </div>
    </div>
  )
}

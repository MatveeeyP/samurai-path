'use client'
import { useApp, levelFor, totalXP } from '@/lib/AppContext'

interface HeaderProps {
  onSettingsClick: () => void
}

export default function Header({ onSettingsClick }: HeaderProps) {
  const { cfg, streak, freezeCount, entries, solves, achGot } = useApp()
  const xp = totalXP(entries, solves, achGot, streak)
  const L = levelFor(xp)

  if (!cfg) return null

  return (
    <header>
      <div className="brand">
        <div className="mark">21</div>
        <div className="nm">
          Вспомни 21 мая
          <small>{cfg.name ? `вперёд, ${cfg.name}` : 'день, когда ты взялся за себя'}</small>
        </div>
      </div>
      <div className="hdr-right">
        <div className="xp-wrap">
          <div className="xp-lvl">{L.lvl}</div>
          <div className="xp-info">
            <div className="xt">{xp} XP · ур. {L.lvl}</div>
            <div className="xp-bar">
              <i style={{ width: Math.round(L.inLvl / L.need * 100) + '%' }} />
            </div>
          </div>
        </div>
        <div className="streak-pill">
          <div className="item fire-item">
            <span className="fire-emoji">🔥</span>
            <span>{streak}</span>
          </div>
          <div className="divr" />
          <div className="item ice-item">
            <span>❄️</span>
            <span>{freezeCount}</span>
          </div>
        </div>
        <button className="gear" onClick={onSettingsClick} title="Настройки">⚙️</button>
      </div>
    </header>
  )
}

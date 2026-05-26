'use client'
import { useEffect, useState } from 'react'
import { useApp } from '@/lib/AppContext'
import { save } from '@/lib/storage'

function fmt(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = Math.floor(s % 60)
  return (h > 0 ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0')
}

interface FloatingTimerProps {
  currentPage: string
}

export default function FloatingTimer({ currentPage }: FloatingTimerProps) {
  const { timerOn, setTimerOn, timerAccum, setTimerAccum, timerStart, setTimerStart } = useApp()
  const [display, setDisplay] = useState('00:00')

  useEffect(() => {
    const elapsed = () => timerAccum + (timerOn ? (Date.now() - timerStart) / 1000 : 0)
    const tick = () => setDisplay(fmt(elapsed()))
    tick()
    if (timerOn) {
      const id = setInterval(tick, 1000)
      return () => clearInterval(id)
    }
  }, [timerOn, timerAccum, timerStart])

  function toggle() {
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
    }
  }

  const visible = (timerOn || timerAccum > 0) && currentPage !== 'dash'

  return (
    <div className={`float-timer ${visible ? 'on' : ''}`}>
      <div>
        <div className="ft-lbl">таймер</div>
        <div className="ft-disp">{display}</div>
      </div>
      <button className={timerOn ? 'pause' : ''} onClick={toggle}>{timerOn ? '⏸' : '▶'}</button>
    </div>
  )
}

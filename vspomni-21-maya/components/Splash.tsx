'use client'
import { useState, useEffect } from 'react'

export default function Splash({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('')
  const [out, setOut] = useState(false)
  const text = 'Вспомни 21 мая'

  useEffect(() => {
    let i = 0
    function type() {
      if (i <= text.length) {
        setTitle(text.slice(0, i))
        i++
        setTimeout(type, 60)
      } else {
        setTimeout(() => {
          setOut(true)
          setTimeout(onDone, 600)
        }, 600)
      }
    }
    type()
  }, [onDone])

  return (
    <div className={`splash ${out ? 'out' : ''}`}>
      <div className="sp-logo">21</div>
      <div className={`sp-title typewriter`}>{title}</div>
    </div>
  )
}

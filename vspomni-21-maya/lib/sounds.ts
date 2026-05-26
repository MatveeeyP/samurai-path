export function sfx(type: string, enabled = true): void {
  if (!enabled) return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const a = new AudioCtx()
    const o = a.createOscillator()
    const g = a.createGain()
    o.connect(g)
    g.connect(a.destination)
    g.gain.value = 0.08

    if (type === 'record') {
      o.frequency.value = 880
      o.type = 'sine'
      o.start()
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.15)
      o.stop(a.currentTime + 0.15)
    } else if (type === 'ach') {
      o.frequency.value = 523
      o.type = 'triangle'
      o.start()
      setTimeout(() => { o.frequency.value = 659 }, 100)
      setTimeout(() => { o.frequency.value = 784 }, 200)
      o.stop(a.currentTime + 0.4)
    } else if (type === 'tick') {
      o.frequency.value = 1000
      o.type = 'square'
      g.gain.value = 0.03
      o.start()
      o.stop(a.currentTime + 0.05)
    } else if (type === 'levelup') {
      o.frequency.value = 440
      o.type = 'sawtooth'
      g.gain.value = 0.06
      o.start()
      setTimeout(() => { o.frequency.value = 554 }, 120)
      setTimeout(() => { o.frequency.value = 659 }, 240)
      setTimeout(() => { o.frequency.value = 880 }, 360)
      o.stop(a.currentTime + 0.5)
    }
    setTimeout(() => a.close(), 1000)
  } catch { /* ignore */ }
}

export function beep(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const a = new AudioCtx()
    const o = a.createOscillator()
    const g = a.createGain()
    o.connect(g)
    g.connect(a.destination)
    o.frequency.value = 660
    g.gain.value = 0.1
    o.start()
    setTimeout(() => { o.stop(); a.close() }, 250)
  } catch { /* ignore */ }
}

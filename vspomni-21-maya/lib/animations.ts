export function miniConfetti(btnEl: HTMLElement): void {
  const colors = ['#1b6deb', '#27c281', '#ff7a2f', '#8b5cf6', '#ffb347', '#ec4899']
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('span')
    c.className = 'mini-conf'
    c.style.background = colors[i % colors.length]
    const angle = Math.random() * Math.PI * 2
    const dist = 30 + Math.random() * 40
    c.style.setProperty('--dx', Math.cos(angle) * dist + 'px')
    c.style.setProperty('--dy', (Math.sin(angle) * dist - 30) + 'px')
    c.style.left = '50%'
    c.style.top = '0'
    btnEl.appendChild(c)
    setTimeout(() => c.remove(), 800)
  }
}

export function confetti(): void {
  const wrap = document.createElement('div')
  wrap.className = 'confetti'
  const colors = ['#1b6deb', '#27c281', '#ff7a2f', '#8b5cf6', '#ffb347', '#ec4899']
  for (let i = 0; i < 70; i++) {
    const c = document.createElement('i')
    c.style.left = Math.random() * 100 + '%'
    c.style.background = colors[i % colors.length]
    c.style.animationDuration = (1.5 + Math.random() * 1.5) + 's'
    c.style.animationDelay = (Math.random() * 0.4) + 's'
    if (Math.random() > 0.5) c.style.borderRadius = '50%'
    wrap.appendChild(c)
  }
  document.body.appendChild(wrap)
  setTimeout(() => wrap.remove(), 3500)
}

export function addRipple(e: MouseEvent, btn: HTMLElement): void {
  const r = btn.getBoundingClientRect()
  const rip = document.createElement('span')
  rip.className = 'ripple'
  const size = Math.max(r.width, r.height) * 2
  rip.style.width = rip.style.height = size + 'px'
  rip.style.left = (e.clientX - r.left - size / 2) + 'px'
  rip.style.top = (e.clientY - r.top - size / 2) + 'px'
  btn.appendChild(rip)
  setTimeout(() => rip.remove(), 600)
}

export function shade(hex: string, p: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + p * 2.55))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + p * 2.55))
  const b = Math.max(0, Math.min(255, (n & 255) + p * 2.55))
  return '#' + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1).replace(/(..)(..)(..).*/, '$1$2$3')
}

export function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

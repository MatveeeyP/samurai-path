'use client'
import { useApp } from '@/lib/AppContext'

export default function Toast() {
  const { toastMsg, toastOn } = useApp()
  return (
    <div className={`toast ${toastOn ? 'on' : ''}`}>{toastMsg}</div>
  )
}

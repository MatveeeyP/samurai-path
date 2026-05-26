'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import { load, save } from '@/lib/storage'
import type { Material } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

export default function NotesPage() {
  const router = useRouter()
  const { cfg, mats, setMats, toast } = useApp()
  const [showSettings, setShowSettings] = useState(false)
  const [notes, setNotesState] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [dragging, setDragging] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load notes on mount
  useEffect(() => {
    const saved = load<string>('v21_notes', '')
    setNotesState(saved)
  }, [])

  function navTo(page: string) {
    if (page === 'notes') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  function handleNotesChange(val: string) {
    setNotesState(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      save('v21_notes', val)
      const now = new Date()
      setSavedAt(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
    }, 500)
  }

  function processFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const data = ev.target?.result as string
        const mat: Material = { name: file.name, type: file.type, data }
        setMats([mat, ...mats])
        toast(`Вложен: ${file.name}`)
      }
      reader.readAsDataURL(file)
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [mats]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!cfg) return null

  // Note attachments: show mats that are not in notes folder - for simplicity show all mats here as well
  const noteMats = mats.slice(0, 10)

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📝</div>
          <div className="tx">
            <b>Заметки</b>
            <span>Свободные записи — автосохранение</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="notes" onNavigate={navTo} />
          <div className="page-host">

            {/* Notes editor */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 style={{ margin: 0 }}>📝 Заметки</h2>
                {savedAt && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>
                    Сохранено ✓ {savedAt}
                  </span>
                )}
              </div>
              <div className="sub">Пиши что угодно — конспекты, идеи, вопросы. Автосохранение через 500мс.</div>
              <textarea
                className="notes-area"
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                placeholder="Напиши заметку, конспект, вопрос или идею..."
                style={{
                  width: '100%',
                  minHeight: 320,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1.5px solid var(--line)',
                  background: 'var(--bg)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  resize: 'vertical',
                  lineHeight: 1.7,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
                <span>{notes.length} символов · {notes.split('\n').filter(l => l.trim()).length} строк</span>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => {
                    if (confirm('Очистить заметки?')) {
                      handleNotesChange('')
                    }
                  }}
                >
                  Очистить
                </button>
              </div>
            </div>

            {/* File attachments */}
            <div className="card">
              <h2>📎 Вложения</h2>
              <div className="sub">Прикрепи файлы к заметкам (хранятся в Материалах)</div>
              <div
                style={{
                  border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--line)'}`,
                  borderRadius: 12,
                  padding: '20px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'var(--blue-soft)' : 'var(--bg)',
                  transition: 'all .2s',
                  marginBottom: 12,
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
              >
                <span style={{ fontSize: 22 }}>📂</span>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
                  {dragging ? 'Отпусти файл' : 'Прикрепить файл'}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={e => processFiles(e.target.files)}
              />

              {noteMats.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {noteMats.map((mat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'var(--bg)', border: '1.5px solid var(--line)',
                        borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700,
                      }}
                    >
                      <span>{mat.type.startsWith('image/') ? '🖼' : mat.type === 'application/pdf' ? '📄' : '📝'}</span>
                      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mat.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="notes" />
    </>
  )
}

'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/lib/AppContext'
import type { Material } from '@/lib/storage'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Settings from '@/components/Settings'
import Toast from '@/components/Toast'
import FloatingTimer from '@/components/FloatingTimer'
import { PAGE_ROUTES } from '@/components/Navigation'

export default function MaterialsPage() {
  const router = useRouter()
  const { cfg, mats, setMats, toast } = useApp()
  const [showSettings, setShowSettings] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<Material | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function navTo(page: string) {
    if (page === 'mat') return
    const route = PAGE_ROUTES[page]
    if (route) router.push(route)
  }

  function processFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const data = ev.target?.result as string
        const mat: Material = {
          name: file.name,
          type: file.type,
          data,
        }
        setMats([mat, ...mats])
        toast(`Добавлено: ${file.name}`)
      }
      reader.readAsDataURL(file)
    })
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [mats]) // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  function deleteMat(idx: number) {
    const next = [...mats]
    next.splice(idx, 1)
    setMats(next)
    toast('Файл удалён')
  }

  function isImage(type: string) {
    return type.startsWith('image/')
  }

  function isPDF(type: string) {
    return type === 'application/pdf'
  }

  if (!cfg) return null

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* Image preview overlay */}
      {preview && (
        <div
          className={`mat-overlay on`}
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          {isImage(preview.type) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.data}
              alt={preview.name}
              style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div
              style={{ background: '#fff', borderRadius: 12, padding: '32px 40px', textAlign: 'center' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontSize: 48 }}>📄</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>{preview.name}</div>
              <a
                href={preview.data}
                download={preview.name}
                style={{ display: 'inline-block', marginTop: 12, padding: '8px 20px', background: 'var(--blue)', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none' }}
              >
                Скачать
              </a>
            </div>
          )}
        </div>
      )}

      <div className="wrap">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <div className="anchor">
          <div className="ic">📎</div>
          <div className="tx">
            <b>Материалы</b>
            <span>Загружай файлы и изображения для учёбы</span>
          </div>
        </div>
        <div className="app-body">
          <Navigation currentPage="mat" onNavigate={navTo} />
          <div className="page-host">

            {/* Drop zone */}
            <div className="card">
              <h2>📁 Загрузить файлы</h2>
              <div
                className={`mat-drop${dragging ? ' drag-over' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--line)'}`,
                  borderRadius: 16,
                  padding: '32px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'var(--blue-soft)' : 'var(--bg)',
                  transition: 'all .2s',
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {dragging ? 'Отпусти для загрузки' : 'Перетащи файл или нажми для выбора'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  Поддерживаются: изображения, PDF, документы
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
                onChange={e => processFiles(e.target.files)}
              />
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
                Файлы хранятся в браузере (base64). Всего файлов: {mats.length}
              </div>
            </div>

            {/* Files grid */}
            {mats.length > 0 && (
              <div className="card">
                <h2>📋 Мои материалы</h2>
                <div
                  className="mat-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  {mats.map((mat, idx) => (
                    <div
                      key={idx}
                      className="mat"
                      style={{
                        border: '1.5px solid var(--line)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        background: 'var(--bg)',
                        transition: 'box-shadow .15s',
                      }}
                      onClick={() => setPreview(mat)}
                    >
                      {/* Thumbnail */}
                      <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f3f8' }}>
                        {isImage(mat.type) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mat.data}
                            alt={mat.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : isPDF(mat.type) ? (
                          <span style={{ fontSize: 36 }}>📄</span>
                        ) : (
                          <span style={{ fontSize: 36 }}>📝</span>
                        )}
                      </div>

                      {/* Name */}
                      <div style={{ padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--ink)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                        {mat.name}
                      </div>

                      {/* Delete button */}
                      <button
                        style={{
                          position: 'absolute', top: 4, right: 4,
                          background: 'rgba(0,0,0,0.5)', color: '#fff',
                          border: 'none', borderRadius: '50%',
                          width: 20, height: 20, fontSize: 12,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1,
                        }}
                        onClick={e => { e.stopPropagation(); deleteMat(idx) }}
                        title="Удалить"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mats.length === 0 && (
              <div className="card">
                <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 600, padding: 8 }}>
                  Нет материалов. Загрузи первый файл выше! 📎
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast />
      <FloatingTimer currentPage="mat" />
    </>
  )
}

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '@/lib/AppContext'

export const metadata: Metadata = {
  title: 'Вспомни 21 мая',
  description: 'Учебный трекер для олимпиадников',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Вспомни 21 мая',
  },
}

export const viewport: Viewport = {
  themeColor: '#1b6deb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}

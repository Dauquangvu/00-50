import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'ColorPred v4', description: 'Color prediction tool' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
      </head>
      <body style={{fontFamily:"'Space Mono',monospace"}}>{children}</body>
    </html>
  )
}

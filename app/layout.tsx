import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../index.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orta Doğu Güç Dinamikleri - İran-İsrail Savaşı Sonrası',
  description: 'Orta Doğu\'da İran-İsrail savaşı sonrası güç dinamiklerini analiz eden interaktif web uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}


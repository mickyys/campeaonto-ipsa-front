import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Campeonato de Apoderados IPSA San Antonio 2026',
  description:
    'Campeonato de Apoderados IPSA San Antonio 2026 · Instituto del Puerto. Fixture, tablas de posiciones, goleadores y eliminatorias.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

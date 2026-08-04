import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Providers from '@/components/Providers'

const SITE_URL = 'https://campeonatoipsa.cl'
const SITE_NAME = 'Campeonato de Apoderados IPSA San Antonio 2026'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s · Campeonato Apoderados IPSA San Antonio 2026',
  },
  description:
    'Campeonato de Apoderados IPSA San Antonio 2026 · Instituto del Puerto. Fixture, tablas de posiciones, goleadores y eliminatorias.',
  applicationName: 'Campeonato Apoderados IPSA',
  keywords: [
    'campeonato',
    'apoderados',
    'IPSA',
    'San Antonio',
    'Instituto del Puerto',
    'fútbol',
    'fixture',
    'goleadores',
    '2026',
  ],
  creator: 'Centro de Padres IPSA San Antonio',
  publisher: 'Centro de Padres IPSA San Antonio',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_NAME,
    description:
      'Resultados, posiciones, fixture y goleadores del Campeonato de Apoderados del Instituto del Puerto San Antonio.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'es_CL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description:
      'Resultados, posiciones, fixture y goleadores del Campeonato de Apoderados del Instituto del Puerto San Antonio.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Analytics />
      </body>
    </html>
  )
}

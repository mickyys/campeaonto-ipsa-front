import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Campeonato de Apoderados IPSA San Antonio 2026',
    short_name: 'Campeonato IPSA',
    description:
      'Campeonato de Apoderados IPSA San Antonio 2026 · Instituto del Puerto. Fixture, tablas de posiciones, goleadores y eliminatorias.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e3a8a',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      { src: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
  }
}

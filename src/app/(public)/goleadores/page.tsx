import ScorersView from '@/views/ScorersView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Tabla de Goleadores',
  description:
    'Tabla de goleadores del Campeonato de Apoderados IPSA San Antonio 2026.',
  openGraph: {
    title: 'Tabla de Goleadores · Campeonato de Apoderados IPSA San Antonio 2026',
    description:
      'Todos los goleadores del Campeonato de Apoderados IPSA San Antonio 2026.',
    url: 'https://campeonatoipsa.cl/goleadores',
    images: ['/opengraph-image'],
  },
}

export default function GoleadoresPage() {
  return (
    <>
      <PageHeader title="Tabla de Goleadores" />
      <ScorersView />
    </>
  )
}

import BracketView from '@/views/BracketView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Eliminatorias',
  description:
    'Cuadro de eliminatorias (Copa de Oro, Plata y Bronce) del Campeonato de Apoderados IPSA San Antonio 2026.',
  openGraph: {
    title: 'Eliminatorias · Campeonato de Apoderados IPSA San Antonio 2026',
    description:
      'Cuadro de eliminatorias (Copa de Oro, Plata y Bronce) del Campeonato de Apoderados IPSA San Antonio 2026.',
    url: 'https://campeonatoipsa.cl/bracket',
    images: ['/opengraph-image'],
  },
}

export default function BracketPage() {
  return (
    <>
      <PageHeader title="Eliminatorias" />
      <BracketView />
    </>
  )
}

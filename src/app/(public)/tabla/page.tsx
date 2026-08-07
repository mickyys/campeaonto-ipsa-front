import StandingsView from '@/views/StandingsView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Tabla General',
  description:
    'Tabla general y clasificación a las Copas de Oro, Plata y Bronce del Campeonato de Apoderados IPSA San Antonio 2026.',
  openGraph: {
    title: 'Tabla General · Campeonato de Apoderados IPSA San Antonio 2026',
    description:
      'Ranking global de la fase de grupos y clasificación a la Copa de Oro, Plata y Bronce.',
    url: 'https://campeonatoipsa.cl/tabla',
    images: ['/opengraph-image'],
  },
}

export default function TablaPage() {
  return (
    <>
      <PageHeader title="Tabla General" />
      <StandingsView />
    </>
  )
}

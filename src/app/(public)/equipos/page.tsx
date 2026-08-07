import TeamMatchesView from '@/views/TeamMatchesView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Partidos por Equipo',
  description:
    'Selecciona un equipo y revisa todos sus partidos jugados y pendientes del Campeonato de Apoderados IPSA San Antonio 2026.',
  openGraph: {
    title: 'Partidos por Equipo · Campeonato de Apoderados IPSA San Antonio 2026',
    description:
      'Selecciona un equipo y revisa sus partidos jugados y pendientes del campeonato.',
    url: 'https://campeonatoipsa.cl/equipos',
    images: ['/opengraph-image'],
  },
}

export default function EquiposPage() {
  return (
    <>
      <PageHeader title="Partidos por Equipo" />
      <TeamMatchesView />
    </>
  )
}
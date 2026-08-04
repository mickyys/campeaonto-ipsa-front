import FixtureView from '@/views/FixtureView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Fixture',
  description:
    'Fixture, programación de partidos y resultados del Campeonato de Apoderados IPSA San Antonio 2026.',
  openGraph: {
    title: 'Fixture · Campeonato de Apoderados IPSA San Antonio 2026',
    description:
      'Fixture, programación de partidos y resultados del Campeonato de Apoderados IPSA San Antonio 2026.',
    url: 'https://campeonatoipsa.cl/fixture',
    images: ['/opengraph-image'],
  },
}

export default function FixturePage() {
  return (
    <>
      <PageHeader title="Fixture" />
      <FixtureView />
    </>
  )
}

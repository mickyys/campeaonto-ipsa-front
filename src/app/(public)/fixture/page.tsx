import FixtureView from '@/views/FixtureView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Fixture · Campeonato de Apoderados IPSA San Antonio 2026',
}

export default function FixturePage() {
  return (
    <>
      <PageHeader title="Fixture" />
      <FixtureView />
    </>
  )
}

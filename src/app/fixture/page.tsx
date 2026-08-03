import FixtureView from '@/views/FixtureView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Fixture · Campeonato de Apoderados IPSA SAI 2025',
}

export default function FixturePage() {
  return (
    <>
      <PageHeader title="Fixture" />
      <FixtureView />
    </>
  )
}

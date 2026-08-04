import BracketView from '@/views/BracketView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Eliminatorias · Campeonato de Apoderados IPSA San Antonio 2026',
}

export default function BracketPage() {
  return (
    <>
      <PageHeader title="Eliminatorias" />
      <BracketView />
    </>
  )
}

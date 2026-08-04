import GroupsView from '@/views/GroupsView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Grupos y Posiciones',
  description:
    'Grupos, tablas de posiciones y clasificaciones del Campeonato de Apoderados IPSA San Antonio 2026.',
  openGraph: {
    title: 'Grupos y Posiciones · Campeonato de Apoderados IPSA San Antonio 2026',
    description:
      'Grupos, tablas de posiciones y clasificaciones del Campeonato de Apoderados IPSA San Antonio 2026.',
    url: 'https://campeonatoipsa.cl/grupos',
    images: ['/opengraph-image'],
  },
}

export default function GruposPage() {
  return (
    <>
      <PageHeader title="Grupos y Posiciones" />
      <GroupsView />
    </>
  )
}

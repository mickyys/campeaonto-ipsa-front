import GroupsView from '@/views/GroupsView'
import { PageHeader } from '@/components/PageHeader'

export const metadata = {
  title: 'Grupos y Posiciones · Campeonato de Apoderados IPSA San Antonio 2026',
}

export default function GruposPage() {
  return (
    <>
      <PageHeader title="Grupos y Posiciones" />
      <GroupsView />
    </>
  )
}
